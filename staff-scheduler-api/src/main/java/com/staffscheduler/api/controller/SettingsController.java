package com.staffscheduler.api.controller;

import com.staffscheduler.api.dto.AppSettingDto;
import com.staffscheduler.api.dto.NavItemDto;
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
@Tag(name = "Settings", description = "Application settings, navigation, feature flags, and user preferences")
public class SettingsController {

    private final SettingsService settingsService;

    // ── App Settings (Admin) ────────────────────────────────────────────

    @GetMapping("/settings")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all application settings grouped by category")
    public ResponseEntity<Map<String, List<AppSettingDto>>> getAllSettings() {
        return ResponseEntity.ok(settingsService.getAllSettings());
    }

    @GetMapping("/settings/public")
    @Operation(summary = "Get public settings (no auth required for timezone, dateFormat, currency)")
    public ResponseEntity<List<AppSettingDto>> getPublicSettings() {
        return ResponseEntity.ok(settingsService.getPublicSettings());
    }

    @GetMapping("/settings/feature-flags")
    @Operation(summary = "Get active feature flag map")
    public ResponseEntity<Map<String, Boolean>> getFeatureFlags() {
        return ResponseEntity.ok(settingsService.getFeatureFlags());
    }

    @GetMapping("/settings/{category}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get settings by category")
    public ResponseEntity<List<AppSettingDto>> getSettingsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(settingsService.getSettingsByCategory(category));
    }

    @PutMapping("/settings/{category}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update settings for a category (Admin only)")
    public ResponseEntity<List<AppSettingDto>> updateCategory(
            @PathVariable String category,
            @RequestBody List<AppSettingDto> settings,
            Authentication authentication) {
        UUID userId = getUserId(authentication);
        return ResponseEntity.ok(settingsService.updateCategory(category, settings, userId));
    }

    @PostMapping("/settings/{category}/reset")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reset category to defaults (Admin only)")
    public ResponseEntity<List<AppSettingDto>> resetCategory(@PathVariable String category) {
        return ResponseEntity.ok(settingsService.resetCategory(category));
    }

    // ── Navigation ──────────────────────────────────────────────────────

    @GetMapping("/settings/navigation")
    @Operation(summary = "Get current nav item configuration")
    public ResponseEntity<List<NavItemDto>> getNavItems() {
        return ResponseEntity.ok(settingsService.getNavItems());
    }

    @PostMapping("/settings/navigation")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Save nav item order and visibility (Admin only)")
    public ResponseEntity<List<NavItemDto>> saveNavItems(@RequestBody List<NavItemDto> items) {
        return ResponseEntity.ok(settingsService.saveNavItems(items));
    }

    // ── User Preferences ────────────────────────────────────────────────

    @GetMapping("/user/preferences")
    @Operation(summary = "Get current user's preferences")
    public ResponseEntity<List<UserPreferenceDto>> getUserPreferences(Authentication authentication) {
        UUID userId = getUserId(authentication);
        return ResponseEntity.ok(settingsService.getUserPreferences(userId));
    }

    @PutMapping("/user/preferences")
    @Operation(summary = "Update current user's preferences")
    public ResponseEntity<List<UserPreferenceDto>> updateUserPreferences(
            @RequestBody List<UserPreferenceDto> preferences,
            Authentication authentication) {
        UUID userId = getUserId(authentication);
        return ResponseEntity.ok(settingsService.updateUserPreferences(userId, preferences));
    }

    @PostMapping("/user/preferences/reset")
    @Operation(summary = "Reset user preferences to defaults")
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
