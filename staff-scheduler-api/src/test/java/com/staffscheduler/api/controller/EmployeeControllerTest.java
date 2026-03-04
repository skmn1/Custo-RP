package com.staffscheduler.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.staffscheduler.api.dto.EmployeeDto;
import com.staffscheduler.api.exception.ResourceNotFoundException;
import com.staffscheduler.api.service.EmployeeService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EmployeeController.class)
class EmployeeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private EmployeeService service;

    @Test
    void listEmployees_shouldReturnOk() throws Exception {
        EmployeeDto emp = EmployeeDto.builder()
                .id("emp1").name("Sarah Johnson").role("Sales Associate")
                .avatar("SJ").color("bg-blue-500").email("sarah@company.com")
                .maxHours(40).department("Sales").build();

        when(service.findAll(any(), any(), any(), any(), any())).thenReturn(List.of(emp));

        mockMvc.perform(get("/api/employees"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value("emp1"))
                .andExpect(jsonPath("$[0].name").value("Sarah Johnson"));
    }

    @Test
    void getById_shouldReturnEmployee() throws Exception {
        EmployeeDto emp = EmployeeDto.builder()
                .id("emp1").name("Sarah Johnson").role("Sales Associate").build();

        when(service.findById("emp1")).thenReturn(emp);

        mockMvc.perform(get("/api/employees/emp1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("emp1"))
                .andExpect(jsonPath("$.name").value("Sarah Johnson"));
    }

    @Test
    void getById_shouldReturn404_whenNotFound() throws Exception {
        when(service.findById("missing")).thenThrow(new ResourceNotFoundException("Employee", "missing"));

        mockMvc.perform(get("/api/employees/missing"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("NOT_FOUND"));
    }

    @Test
    void createEmployee_shouldReturn201() throws Exception {
        EmployeeDto input = EmployeeDto.builder()
                .name("Test User").role("Cashier").email("test@company.com")
                .maxHours(40).department("Sales").build();

        EmployeeDto created = EmployeeDto.builder()
                .id("emp123").name("Test User").role("Cashier").avatar("TU")
                .color("bg-blue-500").email("test@company.com")
                .maxHours(40).department("Sales").build();

        when(service.create(any(EmployeeDto.class))).thenReturn(created);

        mockMvc.perform(post("/api/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("emp123"))
                .andExpect(jsonPath("$.avatar").value("TU"));
    }

    @Test
    void createEmployee_shouldReturn400_forInvalidInput() throws Exception {
        // Missing required fields
        EmployeeDto input = EmployeeDto.builder().build();

        mockMvc.perform(post("/api/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deleteEmployee_shouldReturn200() throws Exception {
        doNothing().when(service).delete("emp1");

        mockMvc.perform(delete("/api/employees/emp1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Employee deleted successfully"));
    }

    @Test
    void getDepartments_shouldReturnList() throws Exception {
        when(service.getDepartments()).thenReturn(List.of("Sales", "Warehouse", "Production"));

        mockMvc.perform(get("/api/employees/departments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)));
    }
}
