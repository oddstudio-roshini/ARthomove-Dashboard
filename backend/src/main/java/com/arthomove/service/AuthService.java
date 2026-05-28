package com.arthomove.service;

import com.arthomove.dto.*;
import com.arthomove.entity.Admin;
import com.arthomove.entity.Doctor;
import com.arthomove.entity.DoctorLog;
import com.arthomove.repository.AdminRepository;
import com.arthomove.repository.DoctorRepository;
import com.arthomove.repository.DoctorLogRepository;
import com.arthomove.security.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AdminRepository adminRepository;
    private final DoctorRepository doctorRepository;
    private final DoctorLogRepository doctorLogRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public LoginResponse adminLogin(LoginRequest request) {
        Admin admin = adminRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtService.generateToken(admin.getEmail(), "ADMIN");
        return LoginResponse.builder()
                .token(token)
                .userType("ADMIN")
                .email(admin.getEmail())
                .name(admin.getName())
                .mustChangePassword(false)
                .build();
    }

    public LoginResponse doctorLogin(LoginRequest request, HttpServletRequest httpRequest) {
        Doctor doctor = doctorRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (doctor.getStatus() == Doctor.DoctorStatus.INACTIVE) {
            throw new RuntimeException("Your account is inactive. Contact admin.");
        }

        if (!passwordEncoder.matches(request.getPassword(), doctor.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String device = detectDevice(httpRequest);
        DoctorLog log = DoctorLog.builder()
                .doctorId(doctor.getId())
                .action("LOGIN")
                .device(device)
                .ipAddress(getClientIp(httpRequest))
                .build();
        doctorLogRepository.save(log);

        String token = jwtService.generateToken(doctor.getEmail(), "DOCTOR");
        return LoginResponse.builder()
                .token(token)
                .userType("DOCTOR")
                .email(doctor.getEmail())
                .name(doctor.getFirstName() + " " + doctor.getLastName())
                .mustChangePassword(doctor.getMustChangePassword())
                .build();
    }

    public void doctorLogout(String email, HttpServletRequest httpRequest) {
        Doctor doctor = doctorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        String device = detectDevice(httpRequest);
        DoctorLog log = DoctorLog.builder()
                .doctorId(doctor.getId())
                .action("LOGOUT")
                .device(device)
                .ipAddress(getClientIp(httpRequest))
                .build();
        doctorLogRepository.save(log);
    }

    public void changePassword(String email, ChangePasswordRequest request) {
        Doctor doctor = doctorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), doctor.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        doctor.setPassword(passwordEncoder.encode(request.getNewPassword()));
        doctor.setMustChangePassword(false);
        doctorRepository.save(doctor);
    }

    private String detectDevice(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        if (userAgent == null) return "UNKNOWN";
        userAgent = userAgent.toLowerCase();
        if (userAgent.contains("mobile") || userAgent.contains("android") || userAgent.contains("iphone")) {
            return "MOBILE";
        }
        return "WEB";
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isEmpty()) return xff.split(",")[0].trim();
        return request.getRemoteAddr();
    }
}
