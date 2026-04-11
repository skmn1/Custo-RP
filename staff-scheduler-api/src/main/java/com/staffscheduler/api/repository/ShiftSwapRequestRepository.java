package com.staffscheduler.api.repository;

import com.staffscheduler.api.model.ShiftSwapRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ShiftSwapRequestRepository extends JpaRepository<ShiftSwapRequest, UUID> {

    /** All swaps where the employee is either the requester or the recipient */
    @Query("SELECT s FROM ShiftSwapRequest s "
         + "WHERE s.requesterId = :empId OR s.recipientId = :empId "
         + "ORDER BY s.createdAt DESC")
    List<ShiftSwapRequest> findByRequesterOrRecipient(String empId);

    /** Check for active swap on a given shift */
    @Query("SELECT COUNT(s) > 0 FROM ShiftSwapRequest s "
         + "WHERE (s.requesterShiftId = :shiftId OR s.recipientShiftId = :shiftId) "
         + "AND s.status IN ('pending_peer', 'pending_manager')")
    boolean existsActiveSwapForShift(String shiftId);

    /** Swap by ID and recipient_id (for peer accept/decline auth) */
    Optional<ShiftSwapRequest> findByIdAndRecipientId(UUID id, String recipientId);

    /** Swap by ID and requester_id (for cancel auth) */
    Optional<ShiftSwapRequest> findByIdAndRequesterId(UUID id, String requesterId);

    /** All pending-manager / pending-peer — for HR inbox */
    @Query("SELECT s FROM ShiftSwapRequest s "
         + "WHERE s.status IN ('pending_peer', 'pending_manager') "
         + "ORDER BY s.createdAt DESC")
    List<ShiftSwapRequest> findOpenSwaps();

    List<ShiftSwapRequest> findByStatusInOrderByCreatedAtDesc(List<String> statuses);

    List<ShiftSwapRequest> findAllByOrderByCreatedAtDesc();
}
