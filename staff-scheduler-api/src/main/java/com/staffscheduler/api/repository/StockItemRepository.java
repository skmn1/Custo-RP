package com.staffscheduler.api.repository;

import com.staffscheduler.api.model.StockItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StockItemRepository extends JpaRepository<StockItem, UUID> {

    Optional<StockItem> findBySku(String sku);

    Optional<StockItem> findByBarcode(String barcode);

    boolean existsBySku(String sku);

    boolean existsBySkuAndIdNot(String sku, UUID id);

    List<StockItem> findByIsActiveTrueOrderByNameEnAsc();

    @Query("SELECT i FROM StockItem i WHERE i.isActive = true " +
           "AND (:categoryId IS NULL OR i.categoryId = :categoryId) " +
           "AND (:locationId IS NULL OR i.locationId = :locationId) " +
           "AND (:search IS NULL OR LOWER(i.nameEn) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           "   OR LOWER(i.nameFr) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           "   OR LOWER(i.sku) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) " +
           "ORDER BY i.nameEn ASC")
    List<StockItem> findFiltered(
            @Param("search") String search,
            @Param("categoryId") UUID categoryId,
            @Param("locationId") UUID locationId);

    @Query("SELECT i FROM StockItem i WHERE i.isActive = false ORDER BY i.nameEn ASC")
    List<StockItem> findInactive();

    @Query(value = "SELECT COUNT(*) FROM stock_items WHERE is_active = true", nativeQuery = true)
    long countActive();
}
