package com.arthomove.service;

import com.arthomove.dto.LoginResponse;
import com.arthomove.entity.Admin;
import com.arthomove.entity.PasskeyCredential;
import com.arthomove.repository.AdminRepository;
import com.arthomove.repository.DoctorRepository;
import com.arthomove.repository.PasskeyCredentialRepository;
import com.arthomove.security.JwtService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.yubico.webauthn.*;
import com.yubico.webauthn.data.*;
import com.yubico.webauthn.exception.AssertionFailedException;
import com.yubico.webauthn.exception.RegistrationFailedException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.SecureRandom;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasskeyService {

    private final PasskeyCredentialRepository credentialRepository;
    private final AdminRepository adminRepository;
    private final DoctorRepository doctorRepository;
    private final JwtService jwtService;
    private final ObjectMapper objectMapper;

    @Value("${app.webauthn.rp-name}")
    private String rpName;
    @Value("${app.webauthn.rp-id}")
    private String rpId;
    @Value("${app.webauthn.origin}")
    private String origin;

    private final Map<String, PublicKeyCredentialCreationOptions> pendingRegistrations = new ConcurrentHashMap<>();
    private final Map<String, AssertionRequest> pendingAssertions = new ConcurrentHashMap<>();

    private RelyingParty buildRp() {
        RelyingPartyIdentity rpIdentity = RelyingPartyIdentity.builder()
                .id(rpId)
                .name(rpName)
                .build();

        return RelyingParty.builder()
                .identity(rpIdentity)
                .credentialRepository(new CredentialRepositoryImpl(credentialRepository))
                .origins(Set.of(origin))
                .build();
    }

    public JsonNode startRegistration(String email, String userType) throws Exception {
        if (!userExists(email, userType)) {
            throw new RuntimeException("User not found");
        }

        byte[] userHandle = new byte[32];
        new SecureRandom().nextBytes(userHandle);

        UserIdentity userIdentity = UserIdentity.builder()
                .name(email)
                .displayName(email)
                .id(new ByteArray(userHandle))
                .build();

        StartRegistrationOptions options = StartRegistrationOptions.builder()
                .user(userIdentity)
                .authenticatorSelection(AuthenticatorSelectionCriteria.builder()
                        .residentKey(ResidentKeyRequirement.PREFERRED)
                        .userVerification(UserVerificationRequirement.PREFERRED)
                        .build())
                .build();

        PublicKeyCredentialCreationOptions creationOptions = buildRp().startRegistration(options);
        pendingRegistrations.put(email, creationOptions);

        return objectMapper.readTree(creationOptions.toCredentialsCreateJson());
    }

    public void finishRegistration(String email, String userType, String credentialJson) throws Exception {
        PublicKeyCredentialCreationOptions options = pendingRegistrations.remove(email);
        if (options == null) throw new RuntimeException("No pending registration for " + email);

        PublicKeyCredential<AuthenticatorAttestationResponse, ClientRegistrationExtensionOutputs> pkc =
                PublicKeyCredential.parseRegistrationResponseJson(credentialJson);

        RegistrationResult result = buildRp().finishRegistration(
                FinishRegistrationOptions.builder()
                        .request(options)
                        .response(pkc)
                        .build()
        );

        PasskeyCredential credential = PasskeyCredential.builder()
                .userEmail(email)
                .userType(userType)
                .credentialId(result.getKeyId().getId().getBase64Url())
                .publicKeyCose(result.getPublicKeyCose().getBase64())
                .signCount(result.getSignatureCount())
                .userHandle(options.getUser().getId().getBase64Url())
                .build();

        credentialRepository.save(credential);
    }

    public JsonNode startAssertion(String email) throws Exception {
        StartAssertionOptions opts = StartAssertionOptions.builder()
                .username(Optional.ofNullable(email))
                .userVerification(UserVerificationRequirement.PREFERRED)
                .build();

        AssertionRequest assertionRequest = buildRp().startAssertion(opts);
        String key = email != null ? email : "anonymous";
        pendingAssertions.put(key, assertionRequest);

        return objectMapper.readTree(assertionRequest.toCredentialsGetJson());
    }

    public LoginResponse finishAssertion(String email, String credentialJson) throws Exception {
        String key = email != null ? email : "anonymous";
        AssertionRequest assertionRequest = pendingAssertions.remove(key);
        if (assertionRequest == null) throw new RuntimeException("No pending assertion");

        PublicKeyCredential<AuthenticatorAssertionResponse, ClientAssertionExtensionOutputs> pkc =
                PublicKeyCredential.parseAssertionResponseJson(credentialJson);

        AssertionResult result = buildRp().finishAssertion(
                FinishAssertionOptions.builder()
                        .request(assertionRequest)
                        .response(pkc)
                        .build()
        );

        if (!result.isSuccess()) throw new RuntimeException("Passkey authentication failed");

        PasskeyCredential cred = credentialRepository
                .findByCredentialId(result.getCredentialId().getBase64Url())
                .orElseThrow(() -> new RuntimeException("Credential not found"));

        cred.setSignCount(result.getSignatureCount());
        credentialRepository.save(cred);

        String resolvedEmail = cred.getUserEmail();
        String userType = cred.getUserType();

        String token = jwtService.generateToken(resolvedEmail, userType);
        String name = resolveUserName(resolvedEmail, userType);

        return LoginResponse.builder()
                .token(token)
                .userType(userType)
                .email(resolvedEmail)
                .name(name)
                .mustChangePassword(false)
                .build();
    }

    public boolean hasPasskey(String email) {
        return credentialRepository.existsByUserEmail(email);
    }

    private boolean userExists(String email, String userType) {
        if ("ADMIN".equalsIgnoreCase(userType)) return adminRepository.existsByEmail(email);
        return doctorRepository.existsByEmail(email);
    }

    private String resolveUserName(String email, String userType) {
        if ("ADMIN".equalsIgnoreCase(userType)) {
            return adminRepository.findByEmail(email).map(Admin::getName).orElse(email);
        }
        return doctorRepository.findByEmail(email)
                .map(d -> d.getFirstName() + " " + d.getLastName())
                .orElse(email);
    }

    private static class CredentialRepositoryImpl implements CredentialRepository {
        private final PasskeyCredentialRepository repo;

        CredentialRepositoryImpl(PasskeyCredentialRepository repo) {
            this.repo = repo;
        }

        @Override
        public Set<PublicKeyCredentialDescriptor> getCredentialIdsForUsername(String username) {
            Set<PublicKeyCredentialDescriptor> result = new HashSet<>();
            repo.findByUserEmail(username).forEach(c -> {
                try {
                    result.add(PublicKeyCredentialDescriptor.builder()
                            .id(ByteArray.fromBase64Url(c.getCredentialId()))
                            .build());
                } catch (Exception ignored) {}
            });
            return result;
        }

        @Override
        public Optional<ByteArray> getUserHandleForUsername(String username) {
            return repo.findByUserEmail(username).stream()
                    .findFirst()
                    .map(c -> {
                        try {
                            return ByteArray.fromBase64Url(c.getUserHandle());
                        } catch (Exception e) {
                            return null;
                        }
                    });
        }

        @Override
        public Optional<String> getUsernameForUserHandle(ByteArray userHandle) {
            String handle = userHandle.getBase64Url();
            return repo.findAll().stream()
                    .filter(c -> handle.equals(c.getUserHandle()))
                    .map(PasskeyCredential::getUserEmail)
                    .findFirst();
        }

        @Override
        public Optional<RegisteredCredential> lookup(ByteArray credentialId, ByteArray userHandle) {
            return repo.findByCredentialId(credentialId.getBase64Url())
                    .map(c -> {
                        try {
                            return RegisteredCredential.builder()
                                    .credentialId(ByteArray.fromBase64Url(c.getCredentialId()))
                                    .userHandle(ByteArray.fromBase64Url(c.getUserHandle()))
                                    .publicKeyCose(ByteArray.fromBase64(c.getPublicKeyCose()))
                                    .signatureCount(c.getSignCount())
                                    .build();
                        } catch (Exception e) {
                            return null;
                        }
                    });
        }

        @Override
        public Set<RegisteredCredential> lookupAll(ByteArray credentialId) {
            Set<RegisteredCredential> result = new HashSet<>();
            repo.findByCredentialId(credentialId.getBase64Url()).ifPresent(c -> {
                try {
                    result.add(RegisteredCredential.builder()
                            .credentialId(ByteArray.fromBase64Url(c.getCredentialId()))
                            .userHandle(ByteArray.fromBase64Url(c.getUserHandle()))
                            .publicKeyCose(ByteArray.fromBase64(c.getPublicKeyCose()))
                            .signatureCount(c.getSignCount())
                            .build());
                } catch (Exception ignored) {}
            });
            return result;
        }
    }
}
