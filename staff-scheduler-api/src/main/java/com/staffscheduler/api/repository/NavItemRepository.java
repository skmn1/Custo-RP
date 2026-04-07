package com.staffscheduler.api.repository;

import com.staffscheduler.api.model.NavItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NavItemRepository extends JpaRepository<NavItem, UUID> {
    List<NavItem> findAllByOrderByDisplayOrderAsc();
    Optional<NavItem> findByRouteKey(String routeKey);
}
