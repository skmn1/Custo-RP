package com.staffscheduler.api.controller;

import com.staffscheduler.api.dto.AppSettingDto;
import com.staffscheduler.api.dto.UserPreferenceDto;
import com.staffscheduler.api.service.SettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Settings", description = "Application settings and user preferences")
public class SettingsController {

    private final SettingsService settingsService;

    // ── App Settings (Admin) ────────────────────────────────────────────

    @GetMapping("/settings")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all application settings", description = "Returns all settings grouped by category (Admin only)")
    public ResponseEntity<Map<String, List<AppSettingDto>>> getAllSettings() {
        return ResponseEntity.ok(settingsService.getAllSettings());
    }

    @GetMapping("/settings/{category}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get settings by category", description = "Returns settings for a specific category")
    public ResponseEntity<List<AppSettingDto>> getSettingsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(settingsService.getSettingsByCategory(category));
    }

    @PutMapping("/settings/{category}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update settings for a category", description = "Updates one or more settings in a category (Admin only)")
    public ResponseEntity<List<AppSettingDto>> updateCategory(
            @PathVariable String category,
            @RequestBody List<AppSettingDto> settings,
            Authentication authentication) {
        UUID userId = getUserId(authentication);
        return ResponseEntity.ok(settingsService.updateCategory(category, settings, userId));
    }

    @PostMapping("/settings/{category}/reset")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reset category to defaults", description = "Resets all settings in a category to their default values (Admin only)")
    public ResponseEntity<List<AppSettingDto>> resetCategory(@PathVariable String category) {
        return ResponseEntity.ok(settingsService.resetCategory(category));
    }

    @GetMapping("/settings/public")
    @Operation(summary = "Get public settings", description = "Returns non-sensitive settings visible to all authenticated users")
    public ResponseEntity<List<AppSettingDto>> getPublicSettings() {
        return ResponseEntity.ok(settingsService.getPublicSettings());
    }

    // ── User Preferences ────────────────────────────────────────────────

    @GetMapping("/user/preferences")
    @Operation(summary = "Get current user's preferences", description = "Returns all preferences for the authenticated user")
    public ResponseEntity<List<UserPreferenceDto>> getUserPreferences(Authentication authentication) {
        UUID userId = getUserId(authentication);
        return ResponseEntity.ok(settingsService.getUserPreferences(userId));
    }

    @PutMapping("/user/preferences")
    @Operation(summary = "Update current user's preferences", description = "Updates one or more preferences for the authenticated user")
    public ResponseEntity<List<UserPreferenceDto>> updateUserPreferences(
            @RequestBody List<UserPreferenceDto> preferences,
            Authentication authentication) {
        UUID userId = getUserId(authentication);
        return ResponseEntity.ok(settingsService.updateUserPreferences(userId, preferences));
    }

    @PostMapping("/user/preferences/reset")
    @Operation(summary = "Reset user preferences to defaults", description = "Resets all preferences to their default values")
    public ResponseEntity<List<UserPreferenceDto>> resetUserPreferences(Authentication authentication) {
        UUID userId = getUserId(authentication);
        return ResponseEntity.ok(settingsService.resetUserPreferences(userId));
    }

    // ── Helper ──────────────────────────────────────────────────────────

    private UUID getUserId(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return null;
        }
        try {
            return UUID.fromString(authentication.getName());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
