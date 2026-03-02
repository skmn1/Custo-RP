package com.staffscheduler.api.repository;

import com.staffscheduler.api.model.Employee;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class EmployeeRepositoryTest {

    @Autowired
    private EmployeeRepository repository;

    @BeforeEach
    void setUp() {
        repository.deleteAll();

        repository.save(Employee.builder()
                .id("emp1").name("Sarah Johnson").role("Senior Nurse")
                .avatar("SJ").color("bg-blue-500").email("sarah@hospital.com")
                .maxHours(40).department("ICU").posId(1L).isManager(false)
                .build());

        repository.save(Employee.builder()
                .id("emp2").name("Michael Chen").role("Doctor")
                .avatar("MC").color("bg-green-500").email("michael@hospital.com")
                .maxHours(50).department("Emergency").posId(1L).isManager(true)
                .build());

        repository.save(Employee.builder()
                .id("emp3").name("Emily Davis").role("Nurse")
                .avatar("ED").color("bg-purple-500").email("emily@hospital.com")
                .maxHours(40).department("ICU").posId(2L).isManager(false)
                .build());
    }

    @Test
    void findByEmail_shouldReturnEmployee() {
        assertThat(repository.findByEmail("sarah@hospital.com")).isPresent();
        assertThat(repository.findByEmail("nonexistent@hospital.com")).isEmpty();
    }

    @Test
    void findByDepartment_shouldReturnFiltered() {
        List<Employee> icuEmployees = repository.findByDepartment("ICU");
        assertThat(icuEmployees).hasSize(2);
        assertThat(icuEmployees).allMatch(e -> e.getDepartment().equals("ICU"));
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
        List<Employee> result = repository.findFiltered("sarah", null, null);
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Sarah Johnson");
    }

    @Test
    void findFiltered_shouldFilterByDepartmentAndRole() {
        List<Employee> result = repository.findFiltered(null, "ICU", "Nurse");
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Emily Davis");
    }

    @Test
    void findFiltered_shouldReturnAll_whenNoFilters() {
        List<Employee> result = repository.findFiltered(null, null, null);
        assertThat(result).hasSize(3);
    }

    @Test
    void existsByEmailAndIdNot_shouldDetectDuplicate() {
        assertThat(repository.existsByEmailAndIdNot("sarah@hospital.com", "emp2")).isTrue();
        assertThat(repository.existsByEmailAndIdNot("sarah@hospital.com", "emp1")).isFalse();
    }
}
