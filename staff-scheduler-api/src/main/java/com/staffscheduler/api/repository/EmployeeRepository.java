package com.staffscheduler.api.repository;

import com.staffscheduler.api.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, String> {

    Optional<Employee> findByEmail(String email);

    List<Employee> findByRole(String role);

    List<Employee> findByPosId(Long posId);

    List<Employee> findByIsManagerTrue();

    List<Employee> findByPosIdNot(Long posId);

    List<Employee> findByPosIdIsNullOrPosIdNot(Long posId);

    @Query("SELECT e FROM Employee e WHERE " +
           "(:search IS NULL OR LOWER(e.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           "   OR LOWER(e.email) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           "   OR LOWER(e.role) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) " +
           "AND (:role IS NULL OR e.role = :role)")
    List<Employee> findFiltered(
            @Param("search") String search,
            @Param("role") String role);

    boolean existsByEmailAndIdNot(String email, String id);

    boolean existsByEmail(String email);
}
