package com.staffscheduler.api.repository;

import com.staffscheduler.api.model.StockCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StockCategoryRepository extends JpaRepository<StockCategory, UUID> {
    List<StockCategory> findByIsActiveTrueOrderBySortOrderAsc();
    List<StockCategory> findByParentIdAndIsActiveTrueOrderBySortOrderAsc(UUID parentId);
    List<StockCategory> findByParentIdIsNullAndIsActiveTrueOrderBySortOrderAsc();
}
