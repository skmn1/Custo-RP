package com.staffscheduler.api.repository;

import com.staffscheduler.api.model.PushSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, UUID> {

    List<PushSubscription> findByEmployeeIdAndIsActiveTrue(String employeeId);

    Optional<PushSubscription> findByEndpoint(String endpoint);

    Optional<PushSubscription> findByEndpointAndEmployeeId(String endpoint, String employeeId);

    @Modifying
    @Query("UPDATE PushSubscription p SET p.isActive = false WHERE p.endpoint = :endpoint")
    void deactivateByEndpoint(String endpoint);

    @Modifying
    @Query("UPDATE PushSubscription p SET p.isActive = false " +
           "WHERE p.lastUsedAt < :cutoff AND p.isActive = true")
    int deactivateStale(OffsetDateTime cutoff);
}
