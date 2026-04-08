package com.staffscheduler.api.repository;

import com.staffscheduler.api.model.PosTerminalIncident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PosTerminalIncidentRepository extends JpaRepository<PosTerminalIncident, UUID> {

    List<PosTerminalIncident> findByTerminalIdOrderByDeclaredAtDesc(Long terminalId);

    List<PosTerminalIncident> findByTerminalIdAndStatusOrderByDeclaredAtDesc(Long terminalId, String status);

    @Query("SELECT i FROM PosTerminalIncident i WHERE i.terminalId = :terminalId " +
           "AND (:status IS NULL OR i.status = :status) " +
           "AND (:category IS NULL OR i.category = :category) " +
           "AND (:severity IS NULL OR i.severity = :severity) " +
           "ORDER BY i.declaredAt DESC")
    List<PosTerminalIncident> findFiltered(Long terminalId, String status, String category, String severity);

    long countByTerminalIdAndStatus(Long terminalId, String status);

    long countByTerminalIdAndStatusAndSeverity(Long terminalId, String status, String severity);

    @Query("SELECT i FROM PosTerminalIncident i ORDER BY i.declaredAt DESC")
    List<PosTerminalIncident> findAllOrderByDeclaredAtDesc();

    @Query("SELECT i FROM PosTerminalIncident i WHERE i.status = :status ORDER BY i.declaredAt DESC")
    List<PosTerminalIncident> findByStatusOrderByDeclaredAtDesc(String status);
}
