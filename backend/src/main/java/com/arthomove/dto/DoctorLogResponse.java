package com.arthomove.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class DoctorLogResponse {
    private Long id;
    private Long doctorId;
    private String action;
    private LocalDateTime timestamp;
    private String device;
    private String ipAddress;
}
