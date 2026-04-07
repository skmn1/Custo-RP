package com.staffscheduler.api.repository;

import com.staffscheduler.api.model.Employee;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;

import static org.assertj.core.api.Assertions.*;

@DataJpaTest
@Testcontainers
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class EmployeeRepositoryTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16");

    @Autowired
    private EmployeeRepository repository;

    @BeforeEach
    void setUp() {
        repository.deleteAll();

        repository.save(Employee.builder()
                .id("emp1").name("Sarah Johnson").role("Sales Associate")
                .avatar("SJ").color("bg-blue-500").email("sarah@company.com")
                .maxHours(40).posId(1L).isManager(false)
                .build());

        repository.save(Employee.builder()
                .id("emp2").name("Michael Chen").role("Store Manager")
                .avatar("MC").color("bg-green-500").email("michael@company.com")
                .maxHours(50).posId(1L).isManager(true)
                .build());

        repository.save(Employee.builder()
                .id("emp3").name("Emily Davis").role("Cashier")
                .avatar("ED").color("bg-purple-500").email("emily@company.com")
                .maxHours(40).posId(2L).isManager(false)
                .build());
    }

    @Test
    void findByEmail_shouldReturnEmployee() {
        assertThat(repository.findByEmail("sarah@company.com")).isPresent();
        assertThat(repository.findByEmail("nonexistent@company.com")).isEmpty();
    }

    @Test
    void findByPosId_shouldReturnOnlyThatLocation() {
        List<Employee> atPos2 = repository.findByPosId(2L);
        assertThat(atPos2).hasSize(1);
        assertThat(atPos2.get(0).getName()).isEqualTo("Emily Davis");
    }

    @Test
    void findByIsManagerTrue_shouldReturnOnlyManagers() {
        List<Employee> managers = repository.findByIsManagerTrue();
        assertThat(managers).hasSize(1);
        assertThat(managers.get(0).getName()).isEqualTo("Michael Chen");
    }

    @Test
    void findByPosId_shouldReturnEmployeesAtPos() {
        List<Employee> atPos1 = repository.findByPosId(1L);
        assertThat(atPos1).hasSize(2);
    }

    @Test
    void findFiltered_shouldSearchByName() {
        List<Employee> result = repository.findFiltered("sarah", null);
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Sarah Johnson");
    }

    @Test
    void findFiltered_shouldFilterByRole() {
        List<Employee> result = repository.findFiltered(null, "Cashier");
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Emily Davis");
    }

    @Test
    void findFiltered_shouldReturnAll_whenNoFilters() {
        List<Employee> result = repository.findFiltered(null, null);
        assertThat(result).hasSize(3);
    }

    @Test
    void existsByEmailAndIdNot_shouldDetectDuplicate() {
        assertThat(repository.existsByEmailAndIdNot("sarah@company.com", "emp2")).isTrue();
        assertThat(repository.existsByEmailAndIdNot("sarah@company.com", "emp1")).isFalse();
    }
}
