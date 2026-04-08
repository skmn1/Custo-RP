package com.staffscheduler.api.repository;

import com.staffscheduler.api.model.EmployeeDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EmployeeDocumentRepository extends JpaRepository<EmployeeDocument, UUID> {
    List<EmployeeDocument> findByEmployeeIdOrderByUploadedAtDesc(String employeeId);
    void deleteByEmployeeId(String employeeId);
}
