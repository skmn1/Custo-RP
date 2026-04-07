package com.staffscheduler.api.repository;

import com.staffscheduler.api.model.StockLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StockLocationRepository extends JpaRepository<StockLocation, UUID> {
    List<StockLocation> findByIsActiveTrueOrderBySortOrderAsc();
}
