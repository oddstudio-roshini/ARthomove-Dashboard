package com.arthomove.repository;

import com.arthomove.entity.DoctorLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DoctorLogRepository extends JpaRepository<DoctorLog, Long> {
    List<DoctorLog> findByDoctorIdOrderByTimestampDesc(Long doctorId);
}
