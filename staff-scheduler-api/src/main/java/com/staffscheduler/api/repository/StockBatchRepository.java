package com.staffscheduler.api.repository;

import com.staffscheduler.api.model.StockBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface StockBatchRepository extends JpaRepository<StockBatch, UUID> {
    List<StockBatch> findByItemIdOrderByExpiryDateAsc(UUID itemId);

    List<StockBatch> findByItemIdAndQtyRemainingGreaterThanOrderByExpiryDateAsc(UUID itemId, java.math.BigDecimal minQty);

    List<StockBatch> findByExpiryDateBetweenAndQtyRemainingGreaterThan(LocalDate start, LocalDate end, java.math.BigDecimal minQty);

    List<StockBatch> findByExpiryDateBeforeAndQtyRemainingGreaterThan(LocalDate date, java.math.BigDecimal minQty);
}
