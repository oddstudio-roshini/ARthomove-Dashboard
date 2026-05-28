package com.arthomove.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class DoctorResponse {
    private Long id;
    private String arthomoveId;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String mobile;
    private Integer birthYear;
    private String clinicalId;
    private String doctorId;
    private String specialization;
    private String clinic;
    private String status;
    private Boolean mustChangePassword;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastLogin;
    private String lastDevice;
    private String temporaryPassword;
}
