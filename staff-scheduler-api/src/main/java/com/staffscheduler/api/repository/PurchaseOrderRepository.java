package com.staffscheduler.api.repository;

import com.staffscheduler.api.model.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, UUID> {

    @Query("SELECT po FROM PurchaseOrder po LEFT JOIN FETCH po.lines WHERE po.id = :id")
    Optional<PurchaseOrder> findByIdWithLines(UUID id);

    List<PurchaseOrder> findByStatusOrderByCreatedAtDesc(String status);

    List<PurchaseOrder> findBySupplierIdOrderByCreatedAtDesc(UUID supplierId);

    List<PurchaseOrder> findAllByOrderByCreatedAtDesc();

    @Query(value = "SELECT COALESCE(MAX(CAST(SUBSTRING(po_number FROM '[0-9]+$') AS INTEGER)), 0) FROM purchase_orders", nativeQuery = true)
    int findMaxPoSequence();
}
