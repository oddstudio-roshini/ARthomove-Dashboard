package com.arthomove.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DoctorStatsResponse {
    private long totalDoctors;
    private long activeDoctors;
    private long inactiveDoctors;
}
