package com.staffscheduler.api.repository;

import com.staffscheduler.api.model.StocktakeCount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StocktakeCountRepository extends JpaRepository<StocktakeCount, UUID> {
    List<StocktakeCount> findBySessionId(UUID sessionId);
    Optional<StocktakeCount> findBySessionIdAndItemId(UUID sessionId, UUID itemId);
}
