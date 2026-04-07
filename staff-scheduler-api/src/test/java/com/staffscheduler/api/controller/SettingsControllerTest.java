package com.staffscheduler.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.staffscheduler.api.dto.AppSettingDto;
import com.staffscheduler.api.dto.NavItemDto;
import com.staffscheduler.api.dto.UserPreferenceDto;
import com.staffscheduler.api.security.JwtService;
import com.staffscheduler.api.service.SettingsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SettingsController.class)
@AutoConfigureMockMvc(addFilters = false)
class SettingsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SettingsService settingsService;

    @MockBean
    private JwtService jwtService;

    // ── App Settings ────────────────────────────────────────────────────

    @Test
    void getAllSettings_shouldReturnGroupedSettings() throws Exception {
        AppSettingDto setting = AppSettingDto.builder()
                .category("business").key("overtimeThreshold").value("40").valueType("number").build();

        when(settingsService.getAllSettings()).thenReturn(Map.of("business", List.of(setting)));

        mockMvc.perform(get("/api/settings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.business", hasSize(1)))
                .andExpect(jsonPath("$.business[0].key").value("overtimeThreshold"))
                .andExpect(jsonPath("$.business[0].value").value("40"));
    }

    @Test
    void getSettingsByCategory_shouldReturnCategorySettings() throws Exception {
        AppSettingDto setting = AppSettingDto.builder()
                .category("business").key("companyName").value("Staff Scheduler Pro").valueType("string").build();

        when(settingsService.getSettingsByCategory("business")).thenReturn(List.of(setting));

        mockMvc.perform(get("/api/settings/business"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].key").value("companyName"));
    }

    @Test
    void updateCategory_shouldReturnUpdatedSettings() throws Exception {
        AppSettingDto update = AppSettingDto.builder()
                .key("overtimeThreshold").value("45").valueType("number").build();
        AppSettingDto result = AppSettingDto.builder()
                .category("business").key("overtimeThreshold").value("45").valueType("number").build();

        when(settingsService.updateCategory(eq("business"), any(), any())).thenReturn(List.of(result));

        mockMvc.perform(put("/api/settings/business")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(List.of(update))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].value").value("45"));
    }

    @Test
    void resetCategory_shouldReturnDefaults() throws Exception {
        AppSettingDto defaultSetting = AppSettingDto.builder()
                .category("business").key("overtimeThreshold").value("40").valueType("number").build();

        when(settingsService.resetCategory("business")).thenReturn(List.of(defaultSetting));

        mockMvc.perform(post("/api/settings/business/reset"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].value").value("40"));
    }

    @Test
    void getPublicSettings_shouldReturnNonSensitiveSettings() throws Exception {
        AppSettingDto setting = AppSettingDto.builder()
                .category("business").key("companyName").value("Staff Scheduler Pro").valueType("string").build();

        when(settingsService.getPublicSettings()).thenReturn(List.of(setting));

        mockMvc.perform(get("/api/settings/public"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].key").value("companyName"));
    }

    // ── User Preferences ────────────────────────────────────────────────

    @Test
    void getUserPreferences_shouldReturnPreferences() throws Exception {
        UserPreferenceDto pref = UserPreferenceDto.builder()
                .key("theme").value("dark").build();

        when(settingsService.getUserPreferences(any())).thenReturn(List.of(pref));

        mockMvc.perform(get("/api/user/preferences"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].key").value("theme"))
                .andExpect(jsonPath("$[0].value").value("dark"));
    }

    @Test
    void updateUserPreferences_shouldReturnUpdated() throws Exception {
        UserPreferenceDto update = UserPreferenceDto.builder()
                .key("theme").value("dark").build();
        UserPreferenceDto result = UserPreferenceDto.builder()
                .key("theme").value("dark").build();

        when(settingsService.updateUserPreferences(any(), any())).thenReturn(List.of(result));

        mockMvc.perform(put("/api/user/preferences")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(List.of(update))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].key").value("theme"))
                .andExpect(jsonPath("$[0].value").value("dark"));
    }

    @Test
    void resetUserPreferences_shouldReturnDefaults() throws Exception {
        UserPreferenceDto pref = UserPreferenceDto.builder()
                .key("theme").value("light").build();

        when(settingsService.resetUserPreferences(any())).thenReturn(List.of(pref));

        mockMvc.perform(post("/api/user/preferences/reset"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].value").value("light"));
    }

    // ── Feature Flags ───────────────────────────────────────────────────

    @Test
    void getFeatureFlags_shouldReturnBooleanMap() throws Exception {
        when(settingsService.getFeatureFlags()).thenReturn(Map.of(
                "feature.shifts", true,
                "feature.stock", false));

        mockMvc.perform(get("/api/settings/feature-flags"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.['feature.shifts']").value(true))
                .andExpect(jsonPath("$.['feature.stock']").value(false));
    }

    // ── Navigation ──────────────────────────────────────────────────────

    @Test
    void getNavItems_shouldReturnOrderedList() throws Exception {
        NavItemDto nav = NavItemDto.builder()
                .routeKey("dashboard").displayOrder(0)
                .visibleAdmin(true).visibleManager(true).visibleEmployee(true).systemLocked(false)
                .build();

        when(settingsService.getNavItems()).thenReturn(List.of(nav));

        mockMvc.perform(get("/api/settings/navigation"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].routeKey").value("dashboard"));
    }

    @Test
    void saveNavItems_shouldReturnUpdatedList() throws Exception {
        NavItemDto input = NavItemDto.builder()
                .routeKey("dashboard").displayOrder(1)
                .visibleAdmin(true).visibleManager(true).visibleEmployee(false).systemLocked(false)
                .build();
        NavItemDto result = NavItemDto.builder()
                .routeKey("dashboard").displayOrder(1)
                .visibleAdmin(true).visibleManager(true).visibleEmployee(false).systemLocked(false)
                .build();

        when(settingsService.saveNavItems(any())).thenReturn(List.of(result));

        mockMvc.perform(post("/api/settings/navigation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(List.of(input))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].displayOrder").value(1))
                .andExpect(jsonPath("$[0].visibleEmployee").value(false));
    }
}
