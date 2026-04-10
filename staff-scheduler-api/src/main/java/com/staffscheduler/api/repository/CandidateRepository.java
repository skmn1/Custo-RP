package com.staffscheduler.api.repository;

import com.staffscheduler.api.model.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, UUID> {

    List<Candidate> findByStatusOrderByUpdatedAtDesc(String status);

    List<Candidate> findAllByOrderByUpdatedAtDesc();

    boolean existsByEmail(String email);

    long countByStatus(String status);
}
