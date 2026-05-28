package com.arthomove.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DoctorCreateRequest {
    @NotBlank
    private String firstName;
    @NotBlank
    private String lastName;
    @Email @NotBlank
    private String email;
    private String mobile;
    private Integer birthYear;
    private String specialization;
    private String clinic;
    private String status;
    private String notes;
}
