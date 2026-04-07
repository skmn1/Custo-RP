package com.staffscheduler.api.repository;

import com.staffscheduler.api.model.StocktakeSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StocktakeSessionRepository extends JpaRepository<StocktakeSession, UUID> {
    List<StocktakeSession> findAllByOrderByCreatedAtDesc();
    List<StocktakeSession> findByStatus(String status);
}
