package com.staffscheduler.api.repository;

import com.staffscheduler.api.model.OfflineSyncLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OfflineSyncLogRepository extends JpaRepository<OfflineSyncLog, String> {

    List<OfflineSyncLog> findByEmployeeIdOrderBySyncedAtDesc(String employeeId, Pageable pageable);
}
