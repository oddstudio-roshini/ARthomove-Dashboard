package com.arthomove.controller;

import com.arthomove.dto.*;
import com.arthomove.service.AuthService;
import com.arthomove.service.PasskeyService;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final PasskeyService passkeyService;

    @PostMapping("/admin/login")
    public ResponseEntity<ApiResponse<LoginResponse>> adminLogin(
            @Valid @RequestBody LoginRequest request) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Login successful", authService.adminLogin(request)));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/doctor/login")
    public ResponseEntity<ApiResponse<LoginResponse>> doctorLogin(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Login successful",
                    authService.doctorLogin(request, httpRequest)));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/doctor/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication auth) {
        try {
            authService.changePassword(auth.getName(), request);
            return ResponseEntity.ok(ApiResponse.ok("Password changed successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(Authentication auth, HttpServletRequest request) {
        try {
            String userType = auth.getAuthorities().stream()
                    .findFirst().map(a -> a.getAuthority()).orElse("");
            if (userType.contains("DOCTOR")) {
                authService.doctorLogout(auth.getName(), request);
            }
            return ResponseEntity.ok(ApiResponse.ok("Logged out", null));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.ok("Logged out", null));
        }
    }

    // ---- Passkey endpoints ----

    @PostMapping("/passkey/register/options")
    public ResponseEntity<ApiResponse<JsonNode>> passkeyRegisterOptions(
            @RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            String userType = body.getOrDefault("userType", "ADMIN");
            JsonNode options = passkeyService.startRegistration(email, userType);
            return ResponseEntity.ok(ApiResponse.ok(options));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/passkey/register/verify")
    public ResponseEntity<ApiResponse<Void>> passkeyRegisterVerify(
            @RequestBody Map<String, String> body) {
        try {
            passkeyService.finishRegistration(
                    body.get("email"),
                    body.getOrDefault("userType", "ADMIN"),
                    body.get("credential")
            );
            return ResponseEntity.ok(ApiResponse.ok("Passkey registered", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/passkey/authenticate/options")
    public ResponseEntity<ApiResponse<JsonNode>> passkeyAuthOptions(
            @RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            JsonNode options = passkeyService.startAssertion(email);
            return ResponseEntity.ok(ApiResponse.ok(options));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/passkey/authenticate/verify")
    public ResponseEntity<ApiResponse<LoginResponse>> passkeyAuthVerify(
            @RequestBody Map<String, String> body) {
        try {
            LoginResponse resp = passkeyService.finishAssertion(
                    body.get("email"),
                    body.get("credential")
            );
            return ResponseEntity.ok(ApiResponse.ok("Login successful", resp));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/passkey/check")
    public ResponseEntity<ApiResponse<Boolean>> passkeyCheck(@RequestParam String email) {
        return ResponseEntity.ok(ApiResponse.ok(passkeyService.hasPasskey(email)));
    }
}
