package com.arthomove.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "doctors")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "arthomove_id", unique = true)
    private String arthomoveId;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private String mobile;

    @Column(name = "birth_year")
    private Integer birthYear;

    @Column(name = "clinical_id", unique = true)
    private String clinicalId;

    @Column(name = "doctor_id", unique = true)
    private String doctorId;

    private String specialization;

    private String clinic;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DoctorStatus status;

    @Column(name = "must_change_password")
    private Boolean mustChangePassword;

    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = DoctorStatus.ACTIVE;
        if (mustChangePassword == null) mustChangePassword = true;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum DoctorStatus {
        ACTIVE, INACTIVE
    }
}
