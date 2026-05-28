package com.arthomove.repository;

import com.arthomove.entity.PasskeyCredential;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PasskeyCredentialRepository extends JpaRepository<PasskeyCredential, Long> {
    List<PasskeyCredential> findByUserEmail(String userEmail);
    Optional<PasskeyCredential> findByCredentialId(String credentialId);
    boolean existsByUserEmail(String userEmail);
    void deleteByUserEmail(String userEmail);
}
