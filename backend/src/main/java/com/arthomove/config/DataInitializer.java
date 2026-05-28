package com.arthomove.config;

import com.arthomove.entity.Admin;
import com.arthomove.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!adminRepository.existsByEmail("admin@arthomove.com")) {
            Admin admin = Admin.builder()
                    .email("admin@arthomove.com")
                    .password(passwordEncoder.encode("Admin@123"))
                    .name("Admin User")
                    .role("ADMIN")
                    .build();
            adminRepository.save(admin);
            log.info("Default admin created: admin@arthomove.com / Admin@123");
        }
    }
}
