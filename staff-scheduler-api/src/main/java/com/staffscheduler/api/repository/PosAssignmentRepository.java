package com.staffscheduler.api.repository;

import com.staffscheduler.api.model.PosAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PosAssignmentRepository extends JpaRepository<PosAssignment, UUID> {

    List<PosAssignment> findByUserId(UUID userId);

    List<PosAssignment> findByPosLocationId(Long posLocationId);

    boolean existsByUserIdAndPosLocationId(UUID userId, Long posLocationId);

    void deleteByUserIdAndPosLocationId(UUID userId, Long posLocationId);
}
