package com.arthomove.dto;

import lombok.Data;

@Data
public class DoctorUpdateRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String mobile;
    private Integer birthYear;
    private String specialization;
    private String clinic;
    private String status;
    private String notes;
}
