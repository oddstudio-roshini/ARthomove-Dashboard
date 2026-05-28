package com.arthomove.service;

import com.arthomove.dto.*;
import com.arthomove.entity.Doctor;
import com.arthomove.entity.Doctor.DoctorStatus;
import com.arthomove.entity.DoctorLog;
import com.arthomove.repository.DoctorLogRepository;
import com.arthomove.repository.DoctorRepository;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final DoctorLogRepository doctorLogRepository;
    private final PasswordEncoder passwordEncoder;

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String ALPHANUM = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    public DoctorStatsResponse getStats() {
        long total = doctorRepository.count();
        long active = doctorRepository.countByStatus(DoctorStatus.ACTIVE);
        long inactive = doctorRepository.countByStatus(DoctorStatus.INACTIVE);
        return DoctorStatsResponse.builder()
                .totalDoctors(total)
                .activeDoctors(active)
                .inactiveDoctors(inactive)
                .build();
    }

    public List<DoctorResponse> getAllDoctors(String search, String status) {
        DoctorStatus statusEnum = null;
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            try { statusEnum = DoctorStatus.valueOf(status.toUpperCase()); } catch (Exception ignored) {}
        }
        String kw = (search == null || search.isBlank()) ? null : search.trim();

        List<Doctor> result;
        if (kw == null && statusEnum == null) {
            // No filters — use plain findAll to avoid Hibernate 6 IS NULL param binding bug
            result = doctorRepository.findAll();
        } else if (kw == null) {
            result = doctorRepository.findByStatusOrderByIdDesc(statusEnum);
        } else if (statusEnum == null) {
            result = doctorRepository.searchByKeyword(kw);
        } else {
            result = doctorRepository.searchByKeywordAndStatus(kw, statusEnum);
        }

        return result.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public DoctorResponse createDoctor(DoctorCreateRequest req) {
        if (doctorRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        String tempPassword = generateTempPassword(req.getFirstName());
        DoctorStatus status = DoctorStatus.ACTIVE;
        if (req.getStatus() != null && !req.getStatus().isBlank()) {
            try { status = DoctorStatus.valueOf(req.getStatus().toUpperCase()); } catch (Exception ignored) {}
        }

        String doctorId = "DR" + String.format("%08d", RANDOM.nextInt(100000000));

        Doctor doctor = Doctor.builder()
                .doctorId(doctorId)
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(tempPassword))
                .mobile(req.getMobile())
                .birthYear(req.getBirthYear())
                .specialization(req.getSpecialization())
                .clinic(req.getClinic())
                .status(status)
                .notes(req.getNotes())
                .mustChangePassword(true)
                .build();

        // First save to get the DB-assigned id, then stamp the derived IDs
        Doctor saved = doctorRepository.save(doctor);
        saved.setArthomoveId(String.format("ARTH-%03d", saved.getId()));
        saved.setClinicalId(String.format("CLN-%03d", saved.getId()));
        saved = doctorRepository.save(saved);

        DoctorResponse resp = toResponse(saved);
        resp.setTemporaryPassword(tempPassword);
        return resp;
    }

    public DoctorResponse updateDoctor(Long id, DoctorUpdateRequest req) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        if (req.getFirstName() != null) doctor.setFirstName(req.getFirstName());
        if (req.getLastName() != null) doctor.setLastName(req.getLastName());
        if (req.getEmail() != null && !req.getEmail().equals(doctor.getEmail())) {
            if (doctorRepository.existsByEmail(req.getEmail())) {
                throw new RuntimeException("Email already in use");
            }
            doctor.setEmail(req.getEmail());
        }
        if (req.getMobile() != null) doctor.setMobile(req.getMobile());
        if (req.getBirthYear() != null) doctor.setBirthYear(req.getBirthYear());
        if (req.getSpecialization() != null) doctor.setSpecialization(req.getSpecialization());
        if (req.getClinic() != null) doctor.setClinic(req.getClinic());
        if (req.getStatus() != null && !req.getStatus().isBlank()) {
            try { doctor.setStatus(DoctorStatus.valueOf(req.getStatus().toUpperCase())); } catch (Exception ignored) {}
        }
        if (req.getNotes() != null) doctor.setNotes(req.getNotes());

        return toResponse(doctorRepository.save(doctor));
    }

    public void deleteDoctor(Long id) {
        if (!doctorRepository.existsById(id)) {
            throw new RuntimeException("Doctor not found");
        }
        doctorRepository.deleteById(id);
    }

    public List<DoctorLogResponse> getDoctorLogs(Long doctorId) {
        return doctorLogRepository.findByDoctorIdOrderByTimestampDesc(doctorId)
                .stream()
                .map(log -> DoctorLogResponse.builder()
                        .id(log.getId())
                        .doctorId(log.getDoctorId())
                        .action(log.getAction())
                        .timestamp(log.getTimestamp())
                        .device(log.getDevice())
                        .ipAddress(log.getIpAddress())
                        .build())
                .collect(Collectors.toList());
    }

    public List<DoctorResponse> uploadCsv(MultipartFile file) {
        List<DoctorResponse> created = new ArrayList<>();
        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            List<String[]> rows = reader.readAll();
            if (rows.isEmpty()) return created;

            // skip header row
            String[] header = rows.get(0);
            for (int i = 1; i < rows.size(); i++) {
                String[] row = rows.get(i);
                if (row.length < 3) continue;
                try {
                    DoctorCreateRequest req = new DoctorCreateRequest();
                    req.setFirstName(getCol(row, 0));
                    req.setLastName(getCol(row, 1));
                    req.setEmail(getCol(row, 2));
                    req.setMobile(getCol(row, 3));
                    String byStr = getCol(row, 4);
                    if (byStr != null && !byStr.isBlank()) {
                        try { req.setBirthYear(Integer.parseInt(byStr.trim())); } catch (Exception ignored) {}
                    }
                    req.setSpecialization(getCol(row, 5));
                    req.setClinic(getCol(row, 6));
                    req.setStatus(getCol(row, 7));
                    req.setNotes(getCol(row, 8));

                    if (req.getEmail() == null || req.getEmail().isBlank()) continue;
                    if (doctorRepository.existsByEmail(req.getEmail())) continue;

                    created.add(createDoctor(req));
                } catch (Exception e) {
                    // skip invalid rows
                }
            }
        } catch (IOException | CsvException e) {
            throw new RuntimeException("Failed to parse CSV: " + e.getMessage());
        }
        return created;
    }

    private String getCol(String[] row, int idx) {
        if (idx >= row.length) return null;
        String val = row[idx].trim();
        return val.isEmpty() ? null : val;
    }

    private DoctorResponse toResponse(Doctor doctor) {
        List<DoctorLog> logs = doctorLogRepository.findByDoctorIdOrderByTimestampDesc(doctor.getId());
        DoctorLog lastLoginLog = logs.stream()
                .filter(l -> "LOGIN".equals(l.getAction()))
                .findFirst()
                .orElse(null);

        return DoctorResponse.builder()
                .id(doctor.getId())
                .arthomoveId(doctor.getArthomoveId())
                .firstName(doctor.getFirstName())
                .lastName(doctor.getLastName())
                .fullName(doctor.getFirstName() + " " + doctor.getLastName())
                .email(doctor.getEmail())
                .mobile(doctor.getMobile())
                .birthYear(doctor.getBirthYear())
                .clinicalId(doctor.getClinicalId())
                .doctorId(doctor.getDoctorId())
                .specialization(doctor.getSpecialization())
                .clinic(doctor.getClinic())
                .status(doctor.getStatus().name())
                .mustChangePassword(doctor.getMustChangePassword())
                .notes(doctor.getNotes())
                .createdAt(doctor.getCreatedAt())
                .updatedAt(doctor.getUpdatedAt())
                .lastLogin(lastLoginLog != null ? lastLoginLog.getTimestamp() : null)
                .lastDevice(lastLoginLog != null ? lastLoginLog.getDevice() : null)
                .build();
    }

    private String generateTempPassword(String firstName) {
        // Format: Dr.<Name>@<4-digit>  e.g. Dr.Martin@4829
        String name = (firstName != null && !firstName.isBlank())
                ? Character.toUpperCase(firstName.charAt(0)) + firstName.substring(1).toLowerCase()
                : "Doctor";
        int digits = 1000 + RANDOM.nextInt(9000);
        return "Dr." + name + "@" + digits;
    }

}
