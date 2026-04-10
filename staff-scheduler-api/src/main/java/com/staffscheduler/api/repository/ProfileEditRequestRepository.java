package com.staffscheduler.api.repository;

import com.staffscheduler.api.model.ProfileEditRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProfileEditRequestRepository extends JpaRepository<ProfileEditRequest, String> {

    List<ProfileEditRequest> findByEmployeeIdOrderByCreatedAtDesc(String employeeId);

    List<ProfileEditRequest> findByEmployeeIdAndStatusOrderByCreatedAtDesc(String employeeId, String status);

    List<ProfileEditRequest> findByStatusOrderByCreatedAtDesc(String status);

    long countByEmployeeIdAndStatus(String employeeId, String status);

    /** Cancel pending bank requests when employee submits new ones */
    List<ProfileEditRequest> findByEmployeeIdAndFieldNameStartingWithAndStatus(
            String employeeId, String fieldPrefix, String status);

    /** Duplicate-pending check for non-bank fields (used for 409 conflict detection) */
    List<ProfileEditRequest> findByEmployeeIdAndFieldNameAndStatus(
            String employeeId, String fieldName, String status);
}
