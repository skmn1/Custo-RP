package com.staffscheduler.api.service;

import com.staffscheduler.api.dto.EmployeeDto;
import com.staffscheduler.api.exception.DuplicateResourceException;
import com.staffscheduler.api.exception.ResourceNotFoundException;
import com.staffscheduler.api.model.Employee;
import com.staffscheduler.api.repository.EmployeeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock
    private EmployeeRepository repository;

    @InjectMocks
    private EmployeeService service;

    private Employee sampleEmployee;

    @BeforeEach
    void setUp() {
        sampleEmployee = Employee.builder()
                .id("emp1")
                .name("Sarah Johnson")
                .role("Senior Nurse")
                .avatar("SJ")
                .color("bg-blue-500")
                .email("sarah.johnson@hospital.com")
                .maxHours(40)
                .department("ICU")
                .posId(1L)
                .isManager(false)
                .build();
    }

    @Test
    void findById_shouldReturnEmployee_whenExists() {
        when(repository.findById("emp1")).thenReturn(Optional.of(sampleEmployee));

        EmployeeDto result = service.findById("emp1");

        assertThat(result.getId()).isEqualTo("emp1");
        assertThat(result.getName()).isEqualTo("Sarah Johnson");
        assertThat(result.getEmail()).isEqualTo("sarah.johnson@hospital.com");
    }

    @Test
    void findById_shouldThrow_whenNotFound() {
        when(repository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findById("missing"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void findAll_shouldReturnFilteredSortedEmployees() {
        Employee emp2 = Employee.builder()
                .id("emp2").name("Michael Chen").role("Doctor")
                .avatar("MC").color("bg-green-500")
                .email("michael.chen@hospital.com").maxHours(50)
                .department("Emergency").posId(1L).isManager(false)
                .build();

        when(repository.findFiltered(null, null, null)).thenReturn(List.of(sampleEmployee, emp2));

        List<EmployeeDto> result = service.findAll(null, null, null, "name", "asc");

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getName()).isEqualTo("Michael Chen");
        assertThat(result.get(1).getName()).isEqualTo("Sarah Johnson");
    }

    @Test
    void create_shouldCreateEmployee_withGeneratedFields() {
        when(repository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(repository.save(any(Employee.class))).thenAnswer(inv -> inv.getArgument(0));

        EmployeeDto dto = EmployeeDto.builder()
                .name("Test User")
                .role("Nurse")
                .email("test@hospital.com")
                .maxHours(40)
                .department("ICU")
                .build();

        EmployeeDto result = service.create(dto);

        assertThat(result.getId()).startsWith("emp");
        assertThat(result.getAvatar()).isEqualTo("TU");
        assertThat(result.getColor()).isNotNull();
        assertThat(result.getName()).isEqualTo("Test User");
    }

    @Test
    void create_shouldThrow_whenEmailDuplicate() {
        when(repository.findByEmail("sarah.johnson@hospital.com"))
                .thenReturn(Optional.of(sampleEmployee));

        EmployeeDto dto = EmployeeDto.builder()
                .name("Another User")
                .role("Nurse")
                .email("sarah.johnson@hospital.com")
                .maxHours(40)
                .department("ICU")
                .build();

        assertThatThrownBy(() -> service.create(dto))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Email already exists");
    }

    @Test
    void update_shouldUpdateFieldsSelectively() {
        when(repository.findById("emp1")).thenReturn(Optional.of(sampleEmployee));
        when(repository.save(any(Employee.class))).thenAnswer(inv -> inv.getArgument(0));

        EmployeeDto dto = EmployeeDto.builder()
                .name("Sarah J. Updated")
                .maxHours(45)
                .build();

        EmployeeDto result = service.update("emp1", dto);

        assertThat(result.getName()).isEqualTo("Sarah J. Updated");
        assertThat(result.getMaxHours()).isEqualTo(45);
        assertThat(result.getEmail()).isEqualTo("sarah.johnson@hospital.com"); // unchanged
    }

    @Test
    void delete_shouldDeleteEmployee_whenExists() {
        when(repository.existsById("emp1")).thenReturn(true);

        service.delete("emp1");

        verify(repository).deleteById("emp1");
    }

    @Test
    void delete_shouldThrow_whenNotFound() {
        when(repository.existsById("missing")).thenReturn(false);

        assertThatThrownBy(() -> service.delete("missing"))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
