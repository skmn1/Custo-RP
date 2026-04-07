package com.staffscheduler.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.staffscheduler.api.dto.ShiftDto;
import com.staffscheduler.api.dto.ShiftMoveDto;
import com.staffscheduler.api.exception.ResourceNotFoundException;
import com.staffscheduler.api.security.JwtService;
import com.staffscheduler.api.service.ShiftService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ShiftController.class)
@AutoConfigureMockMvc(addFilters = false)
class ShiftControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ShiftService service;

    @MockBean
    private JwtService jwtService;

    @Test
    void listShifts_shouldReturnOk() throws Exception {
        ShiftDto shift = ShiftDto.builder()
                .id("shift1").employeeId("emp1").date("2026-03-02").day(0)
                .startTime("07:00").endTime("15:00").duration(8.0)
                .type("Morning").department("Sales").build();

        when(service.findAll(any(), any(), any(), any(), any())).thenReturn(List.of(shift));

        mockMvc.perform(get("/api/shifts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value("shift1"))
                .andExpect(jsonPath("$[0].day").value(0));
    }

    @Test
    void listShifts_withDateFilter_shouldReturnFiltered() throws Exception {
        when(service.findAll(eq("2026-03-02"), eq("2026-03-08"), isNull(), isNull(), isNull()))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/shifts")
                        .param("startDate", "2026-03-02")
                        .param("endDate", "2026-03-08"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void createShift_shouldReturn201() throws Exception {
        ShiftDto input = ShiftDto.builder()
                .employeeId("emp1").date("2026-03-04")
                .startTime("09:00").endTime("17:00")
                .type("Day").department("Sales").build();

        ShiftDto created = ShiftDto.builder()
                .id("shift_new").employeeId("emp1").date("2026-03-04").day(2)
                .startTime("09:00").endTime("17:00").duration(8.0)
                .type("Day").department("Sales")
                .color("bg-green-100 border-green-300 text-green-800").build();

        when(service.create(any(ShiftDto.class))).thenReturn(created);

        mockMvc.perform(post("/api/shifts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("shift_new"))
                .andExpect(jsonPath("$.duration").value(8.0));
    }

    @Test
    void moveShift_shouldReturn200() throws Exception {
        ShiftMoveDto moveDto = ShiftMoveDto.builder()
                .employeeId("emp2").date("2026-03-05").build();

        ShiftDto moved = ShiftDto.builder()
                .id("shift1").employeeId("emp2").date("2026-03-05").day(3)
                .startTime("07:00").endTime("15:00").duration(8.0)
                .type("Morning").department("Sales").build();

        when(service.moveShift(eq("shift1"), any(ShiftMoveDto.class))).thenReturn(moved);

        mockMvc.perform(patch("/api/shifts/shift1/move")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(moveDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.employeeId").value("emp2"))
                .andExpect(jsonPath("$.date").value("2026-03-05"));
    }

    @Test
    void deleteShift_shouldReturn200() throws Exception {
        doNothing().when(service).delete("shift1");

        mockMvc.perform(delete("/api/shifts/shift1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Shift deleted successfully"));
    }

    @Test
    void getShift_shouldReturn404_whenNotFound() throws Exception {
        when(service.findById("missing"))
                .thenThrow(new ResourceNotFoundException("Shift", "missing"));

        mockMvc.perform(get("/api/shifts/missing"))
                .andExpect(status().isNotFound());
    }
}
