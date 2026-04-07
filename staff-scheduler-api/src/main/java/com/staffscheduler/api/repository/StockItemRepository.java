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

    @Query(value = "SELECT * FROM stock_items WHERE is_active = true " +
           "AND (CAST(:categoryId AS uuid) IS NULL OR category_id = CAST(:categoryId AS uuid)) " +
           "AND (CAST(:locationId AS uuid) IS NULL OR location_id = CAST(:locationId AS uuid)) " +
           "AND (CAST(:search AS text) IS NULL " +
           "     OR LOWER(name_en) LIKE LOWER('%' || CAST(:search AS text) || '%') " +
           "     OR LOWER(name_fr) LIKE LOWER('%' || CAST(:search AS text) || '%') " +
           "     OR LOWER(sku)     LIKE LOWER('%' || CAST(:search AS text) || '%')) " +
           "ORDER BY name_en ASC", nativeQuery = true)
    List<StockItem> findFiltered(
            @Param("search") String search,
            @Param("categoryId") UUID categoryId,
            @Param("locationId") UUID locationId);

    @Query("SELECT i FROM StockItem i WHERE i.isActive = false ORDER BY i.nameEn ASC")
    List<StockItem> findInactive();

    @Query(value = "SELECT COUNT(*) FROM stock_items WHERE is_active = true", nativeQuery = true)
    long countActive();
}
