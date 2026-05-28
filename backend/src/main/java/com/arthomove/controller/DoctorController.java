package com.arthomove.controller;

import com.arthomove.dto.*;
import com.arthomove.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DoctorStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.getStats()));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DoctorResponse>>> getDoctors(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.getAllDoctors(search, status)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DoctorResponse>> createDoctor(
            @Valid @RequestBody DoctorCreateRequest request) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Doctor created", doctorService.createDoctor(request)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DoctorResponse>> updateDoctor(
            @PathVariable Long id,
            @RequestBody DoctorUpdateRequest request) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Doctor updated", doctorService.updateDoctor(id, request)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDoctor(@PathVariable Long id) {
        try {
            doctorService.deleteDoctor(id);
            return ResponseEntity.ok(ApiResponse.ok("Doctor deleted", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{id}/logs")
    public ResponseEntity<ApiResponse<List<DoctorLogResponse>>> getDoctorLogs(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.getDoctorLogs(id)));
    }

    @PostMapping("/upload-csv")
    public ResponseEntity<ApiResponse<List<DoctorResponse>>> uploadCsv(
            @RequestParam("file") MultipartFile file) {
        try {
            List<DoctorResponse> created = doctorService.uploadCsv(file);
            return ResponseEntity.ok(ApiResponse.ok(
                    created.size() + " doctors imported", created));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
