package com.staffscheduler.api.repository;

import com.staffscheduler.api.model.PosAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PosAssignmentRepository extends JpaRepository<PosAssignment, UUID> {

    List<PosAssignment> findByUserId(UUID userId);

    List<PosAssignment> findByPosTerminalId(Long posTerminalId);

    boolean existsByUserIdAndPosTerminalId(UUID userId, Long posTerminalId);

    void deleteByUserIdAndPosTerminalId(UUID userId, Long posTerminalId);
}
