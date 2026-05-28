package com.arthomove.repository;

import com.arthomove.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    Optional<Doctor> findByEmail(String email);
    boolean existsByEmail(String email);

    // status filter only
    List<Doctor> findByStatusOrderByIdDesc(Doctor.DoctorStatus status);

    // keyword search only (no null param — avoids Hibernate 6 IS NULL bug)
    @Query("SELECT d FROM Doctor d WHERE " +
           "LOWER(d.firstName)  LIKE LOWER(CONCAT('%', :kw, '%')) OR " +
           "LOWER(d.lastName)   LIKE LOWER(CONCAT('%', :kw, '%')) OR " +
           "LOWER(d.email)      LIKE LOWER(CONCAT('%', :kw, '%')) OR " +
           "LOWER(d.arthomoveId) LIKE LOWER(CONCAT('%', :kw, '%')) OR " +
           "LOWER(d.clinicalId) LIKE LOWER(CONCAT('%', :kw, '%')) OR " +
           "LOWER(d.doctorId)   LIKE LOWER(CONCAT('%', :kw, '%'))")
    List<Doctor> searchByKeyword(@Param("kw") String keyword);

    // keyword + status (both guaranteed non-null when this is called)
    @Query("SELECT d FROM Doctor d WHERE " +
           "d.status = :status AND (" +
           "LOWER(d.firstName)  LIKE LOWER(CONCAT('%', :kw, '%')) OR " +
           "LOWER(d.lastName)   LIKE LOWER(CONCAT('%', :kw, '%')) OR " +
           "LOWER(d.email)      LIKE LOWER(CONCAT('%', :kw, '%')) OR " +
           "LOWER(d.arthomoveId) LIKE LOWER(CONCAT('%', :kw, '%')) OR " +
           "LOWER(d.clinicalId) LIKE LOWER(CONCAT('%', :kw, '%')) OR " +
           "LOWER(d.doctorId)   LIKE LOWER(CONCAT('%', :kw, '%')))")
    List<Doctor> searchByKeywordAndStatus(@Param("kw") String keyword,
                                          @Param("status") Doctor.DoctorStatus status);

    long countByStatus(Doctor.DoctorStatus status);
}
