package com.staffscheduler.api.repository;

import com.staffscheduler.api.model.PointOfSale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PosRepository extends JpaRepository<PointOfSale, Long> {

    List<PointOfSale> findByIsActiveTrue();

    Optional<PointOfSale> findByIdAndIsActiveTrue(Long id);

    boolean existsByNameIgnoreCaseAndIsActiveTrue(String name);

    boolean existsByNameIgnoreCaseAndIsActiveTrueAndIdNot(String name, Long id);
}
