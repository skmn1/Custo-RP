package com.staffscheduler.api.repository;

import com.staffscheduler.api.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    @Query(value = "SELECT * FROM invoices WHERE " +
           "(CAST(:status AS text) IS NULL OR status = :status) " +
           "AND (CAST(:supplier AS text) IS NULL OR LOWER(counterparty_name) LIKE LOWER(CONCAT('%', :supplier, '%'))) " +
           "AND (CAST(:dateFrom AS date) IS NULL OR issue_date >= :dateFrom) " +
           "AND (CAST(:dateTo AS date) IS NULL OR issue_date <= :dateTo) " +
           "ORDER BY created_at DESC",
           nativeQuery = true)
    List<Invoice> findFiltered(
            @Param("status") String status,
            @Param("supplier") String supplier,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo);

    @Query("SELECT COALESCE(SUM(i.amountOutstanding), 0) FROM Invoice i WHERE i.status IN ('received', 'approved')")
    BigDecimal sumUnpaidTotal();

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM InvoicePayment p WHERE p.paymentDate >= :startOfMonth AND p.paymentDate <= :endOfMonth")
    BigDecimal sumPaidMtd(@Param("startOfMonth") LocalDate startOfMonth, @Param("endOfMonth") LocalDate endOfMonth);

    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.status = 'received'")
    long countPendingApproval();

    @Query("SELECT i.status, COUNT(i) FROM Invoice i GROUP BY i.status")
    List<Object[]> countByStatus();

    @Query(value = "SELECT TO_CHAR(issue_date, 'YYYY-MM') AS month, COALESCE(SUM(total_amount), 0) AS amount " +
           "FROM invoices WHERE issue_date >= :startDate GROUP BY TO_CHAR(issue_date, 'YYYY-MM') " +
           "ORDER BY month", nativeQuery = true)
    List<Object[]> monthlySpend(@Param("startDate") LocalDate startDate);

    @Query(value = "SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM '[0-9]+$') AS INTEGER)), 0) FROM invoices", nativeQuery = true)
    int findMaxInvoiceSequence();
}
