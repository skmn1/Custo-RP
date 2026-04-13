package com.staffscheduler.api.repository;

import com.staffscheduler.api.model.PosAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface PosAssignmentRepository extends JpaRepository<PosAssignment, UUID> {

    List<PosAssignment> findByUserId(UUID userId);

    // Compatibility: these map to pos_terminal_id in the database until migration completes
    @Query("SELECT p FROM PosAssignment p WHERE p.posTerminalId = :posLocationId")
    List<PosAssignment> findByPosLocationId(@Param("posLocationId") Long posLocationId);

    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM PosAssignment p WHERE p.userId = :userId AND p.posTerminalId = :posLocationId")
    boolean existsByUserIdAndPosLocationId(@Param("userId") UUID userId, @Param("posLocationId") Long posLocationId);

    // Deprecated names (for backwards compatibility during migration)
    @Query("SELECT p FROM PosAssignment p WHERE p.posTerminalId = :terminalId")
    List<PosAssignment> findByPosTerminalId(@Param("terminalId") Long terminalId);

    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM PosAssignment p WHERE p.userId = :userId AND p.posTerminalId = :terminalId")
    boolean existsByUserIdAndPosTerminalId(@Param("userId") UUID userId, @Param("terminalId") Long terminalId);

    @Modifying
    @Transactional
    @Query("DELETE FROM PosAssignment p WHERE p.userId = :userId AND p.posTerminalId = :posLocationId")
    void deleteByUserIdAndPosLocationId(@Param("userId") UUID userId, @Param("posLocationId") Long posLocationId);

    @Modifying
    @Transactional
    @Query("DELETE FROM PosAssignment p WHERE p.userId = :userId AND p.posTerminalId = :terminalId")
    void deleteByUserIdAndPosTerminalId(@Param("userId") UUID userId, @Param("terminalId") Long terminalId);
}
