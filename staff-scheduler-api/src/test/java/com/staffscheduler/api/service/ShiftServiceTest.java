package com.staffscheduler.api.service;

import com.staffscheduler.api.dto.ShiftDto;
import com.staffscheduler.api.dto.ShiftMoveDto;
import com.staffscheduler.api.exception.ResourceNotFoundException;
import com.staffscheduler.api.model.Shift;
import com.staffscheduler.api.repository.EmployeeRepository;
import com.staffscheduler.api.repository.ShiftRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ShiftServiceTest {

    @Mock
    private ShiftRepository shiftRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private ShiftService service;

    private Shift sampleShift;

    @BeforeEach
    void setUp() {
        sampleShift = Shift.builder()
                .id("shift1")
                .employeeId("emp1")
                .date(LocalDate.of(2026, 3, 2)) // Monday
                .dayIndex(0)
                .startTime("07:00")
                .endTime("15:00")
                .duration(8.0)
                .type("Morning")
                .color("bg-blue-100 border-blue-300 text-blue-800")
                .department("ICU")
                .build();
    }

    @Test
    void findById_shouldReturnShift() {
        when(shiftRepository.findById("shift1")).thenReturn(Optional.of(sampleShift));

        ShiftDto result = service.findById("shift1");

        assertThat(result.getId()).isEqualTo("shift1");
        assertThat(result.getEmployeeId()).isEqualTo("emp1");
        assertThat(result.getDay()).isEqualTo(0); // Monday
        assertThat(result.getDate()).isEqualTo("2026-03-02");
        assertThat(result.getDuration()).isEqualTo(8.0);
    }

    @Test
    void findById_shouldThrow_whenNotFound() {
        when(shiftRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findById("missing"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void create_shouldCreateShift_withAutoComputedFields() {
        when(employeeRepository.existsById("emp1")).thenReturn(true);
        when(shiftRepository.save(any(Shift.class))).thenAnswer(inv -> {
            Shift s = inv.getArgument(0);
            // Simulate @PrePersist
            if (s.getDayIndex() == null && s.getDate() != null) {
                s.setDayIndex(s.getDate().getDayOfWeek().getValue() - 1);
            }
            return s;
        });

        ShiftDto dto = ShiftDto.builder()
                .employeeId("emp1")
                .date("2026-03-04") // Wednesday
                .startTime("09:00")
                .endTime("17:00")
                .type("Day")
                .department("ICU")
                .build();

        ShiftDto result = service.create(dto);

        assertThat(result.getId()).isNotNull();
        assertThat(result.getEmployeeId()).isEqualTo("emp1");
        assertThat(result.getDuration()).isEqualTo(8.0);
    }

    @Test
    void create_shouldThrow_whenEmployeeNotFound() {
        when(employeeRepository.existsById("missing")).thenReturn(false);

        ShiftDto dto = ShiftDto.builder()
                .employeeId("missing")
                .date("2026-03-04")
                .startTime("09:00")
                .endTime("17:00")
                .build();

        assertThatThrownBy(() -> service.create(dto))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void moveShift_shouldUpdateEmployeeAndDate() {
        when(shiftRepository.findById("shift1")).thenReturn(Optional.of(sampleShift));
        when(employeeRepository.existsById("emp2")).thenReturn(true);
        when(shiftRepository.save(any(Shift.class))).thenAnswer(inv -> inv.getArgument(0));

        ShiftMoveDto moveDto = ShiftMoveDto.builder()
                .employeeId("emp2")
                .date("2026-03-05") // Thursday
                .build();

        ShiftDto result = service.moveShift("shift1", moveDto);

        assertThat(result.getEmployeeId()).isEqualTo("emp2");
        assertThat(result.getDate()).isEqualTo("2026-03-05");
    }

    @Test
    void moveShift_shouldConvertDayIndexToDate() {
        when(shiftRepository.findById("shift1")).thenReturn(Optional.of(sampleShift));
        when(shiftRepository.save(any(Shift.class))).thenAnswer(inv -> inv.getArgument(0));

        // Move to Friday (day index 4) in the same week
        ShiftMoveDto moveDto = ShiftMoveDto.builder()
                .day(4)
                .build();

        ShiftDto result = service.moveShift("shift1", moveDto);

        assertThat(result.getDate()).isEqualTo("2026-03-06"); // Friday
    }

    @Test
    void delete_shouldDelete_whenExists() {
        when(shiftRepository.existsById("shift1")).thenReturn(true);

        service.delete("shift1");

        verify(shiftRepository).deleteById("shift1");
    }

    @Test
    void delete_shouldThrow_whenNotFound() {
        when(shiftRepository.existsById("missing")).thenReturn(false);

        assertThatThrownBy(() -> service.delete("missing"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void findByWeek_shouldReturnShiftsInRange() {
        LocalDate weekStart = LocalDate.of(2026, 3, 2);
        when(shiftRepository.findByDateBetween(weekStart, weekStart.plusDays(6)))
                .thenReturn(List.of(sampleShift));

        List<ShiftDto> result = service.findByWeek(weekStart);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo("shift1");
    }
}
