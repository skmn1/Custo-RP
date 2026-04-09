package com.staffscheduler.api.repository;

import com.staffscheduler.api.model.AuditLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.*;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

    List<AuditLog> findByActorIdOrderByTimestampDesc(UUID actorId, Pageable pageable);

    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:app IS NULL OR a.app = :app) AND " +
           "(:action IS NULL OR a.action = :action) AND " +
           "(:actorName IS NULL OR LOWER(a.actorName) LIKE LOWER(CONCAT('%', :actorName, '%'))) AND " +
           "(:resourceType IS NULL OR a.resourceType = :resourceType) AND " +
           "(:from IS NULL OR a.timestamp >= :from) AND " +
           "(:to IS NULL OR a.timestamp <= :to) " +
           "ORDER BY a.timestamp DESC")
    List<AuditLog> findFiltered(
            @Param("app") String app,
            @Param("action") String action,
            @Param("actorName") String actorName,
            @Param("resourceType") String resourceType,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            Pageable pageable);

    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:app IS NULL OR a.app = :app) " +
           "ORDER BY a.timestamp DESC")
    List<AuditLog> findRecentByApp(@Param("app") String app, Pageable pageable);

    default List<Map<String, Object>> findRecentActivity(int limit, String app) {
        List<AuditLog> logs = findRecentByApp(app, Pageable.ofSize(limit));
        List<Map<String, Object>> result = new ArrayList<>();
        for (AuditLog log : logs) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("id", log.getId());
            entry.put("timestamp", log.getTimestamp());
            entry.put("user", log.getActorName());
            entry.put("action", log.getAction());
            entry.put("description", log.getDescription());
            entry.put("app", log.getApp());
            entry.put("resourceType", log.getResourceType());
            entry.put("resourceId", log.getResourceId());
            result.add(entry);
        }
        return result;
    }
}
