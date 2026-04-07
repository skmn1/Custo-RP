package com.staffscheduler.api.repository;

import com.staffscheduler.api.model.StockMovement;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, UUID> {

    List<StockMovement> findByItemIdOrderByPerformedAtDesc(UUID itemId);

    List<StockMovement> findByItemIdOrderByPerformedAtDesc(UUID itemId, Pageable pageable);

    @Query("SELECT COALESCE(SUM(m.qtyChange), 0) FROM StockMovement m WHERE m.itemId = :itemId")
    BigDecimal sumQtyByItemId(@Param("itemId") UUID itemId);

    @Query("SELECT COALESCE(SUM(m.qtyChange), 0) FROM StockMovement m WHERE m.itemId = :itemId AND m.locationId = :locationId")
    BigDecimal sumQtyByItemIdAndLocationId(@Param("itemId") UUID itemId, @Param("locationId") UUID locationId);

    @Query("SELECT m FROM StockMovement m WHERE " +
           "(:itemId IS NULL OR m.itemId = :itemId) " +
           "AND (:movementType IS NULL OR m.movementType = :movementType) " +
           "AND (:startDate IS NULL OR m.performedAt >= :startDate) " +
           "AND (:endDate IS NULL OR m.performedAt <= :endDate) " +
           "ORDER BY m.performedAt DESC")
    List<StockMovement> findFiltered(
            @Param("itemId") UUID itemId,
            @Param("movementType") String movementType,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COALESCE(SUM(CASE WHEN m.qtyChange < 0 THEN ABS(m.qtyChange) ELSE 0 END), 0) " +
           "FROM StockMovement m WHERE m.itemId = :itemId AND m.performedAt >= :since")
    BigDecimal sumConsumptionSince(@Param("itemId") UUID itemId, @Param("since") LocalDateTime since);

    @Query(value = "SELECT m.item_id, SUM(ABS(m.qty_change)) as total_consumed " +
           "FROM stock_movements m " +
           "WHERE m.movement_type = 'consumed' AND m.performed_at >= :since " +
           "GROUP BY m.item_id ORDER BY total_consumed DESC LIMIT 10", nativeQuery = true)
    List<Object[]> findTopConsumedSince(@Param("since") LocalDateTime since);

    @Query(value = "SELECT DATE_TRUNC('week', m.performed_at) as week, " +
           "SUM(CASE WHEN m.qty_change > 0 THEN m.qty_change ELSE 0 END) as qty_in, " +
           "SUM(CASE WHEN m.qty_change < 0 THEN ABS(m.qty_change) ELSE 0 END) as qty_out " +
           "FROM stock_movements m WHERE m.performed_at >= :since " +
           "GROUP BY DATE_TRUNC('week', m.performed_at) ORDER BY week ASC", nativeQuery = true)
    List<Object[]> findWeeklyTrend(@Param("since") LocalDateTime since);
}
