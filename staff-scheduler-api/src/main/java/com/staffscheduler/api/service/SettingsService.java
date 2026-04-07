package com.staffscheduler.api.service;

import com.staffscheduler.api.dto.AppSettingDto;
import com.staffscheduler.api.dto.UserPreferenceDto;
import com.staffscheduler.api.model.AppSetting;
import com.staffscheduler.api.model.UserPreference;
import com.staffscheduler.api.repository.AppSettingRepository;
import com.staffscheduler.api.repository.UserPreferenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SettingsService {

    private final AppSettingRepository appSettingRepository;
    private final UserPreferenceRepository userPreferenceRepository;

    // ── Default settings that seed on first access ──────────────────────

    private static final Map<String, List<AppSettingDto>> DEFAULTS = Map.of(
        "business", List.of(
            dto("companyName", "Staff Scheduler Pro", "string"),
            dto("timezone", "America/New_York", "string"),
            dto("workWeekStart", "monday", "string"),
            dto("overtimeThreshold", "40", "number"),
            dto("overtimeMultiplier", "1.5", "number"),
            dto("doubleTimeThreshold", "60", "number"),
            dto("doubleTimeMultiplier", "2.0", "number"),
            dto("payPeriodType", "biweekly", "string"),
            dto("defaultShiftDuration", "8", "number"),
            dto("maxShiftDuration", "12", "number"),
            dto("minHoursBetweenShifts", "8", "number"),
            dto("ptoAccrualRate", "1.25", "number"),
            dto("annualPtoCap", "20", "number")
        ),
        "scheduling", List.of(
            dto("allowShiftOverlap", "false", "boolean"),
            dto("autoAssignColors", "true", "boolean"),
            dto("showShiftCosts", "true", "boolean"),
            dto("defaultView", "week", "string"),
            dto("enableDragAndDrop", "true", "boolean"),
            dto("requireShiftConfirmation", "false", "boolean")
        ),
        "notifications", List.of(
            dto("emailEnabled", "true", "boolean"),
            dto("shiftReminders", "true", "boolean"),
            dto("schedulePublishedAlerts", "true", "boolean"),
            dto("swapRequests", "true", "boolean"),
            dto("timeOffApprovals", "true", "boolean"),
            dto("reviewAlerts", "true", "boolean"),
            dto("reminderHours", "24", "number")
        )
    );

    private static final Map<String, String> DEFAULT_USER_PREFS = Map.of(
        "theme", "light",
        "dateFormat", "MM/dd/yyyy",
        "timeFormat", "12h",
        "rowsPerPage", "10",
        "compactMode", "false",
        "sidebarCollapsed", "false"
    );

    // Public settings keys that are visible to all authenticated users
    private static final Set<String> PUBLIC_SETTING_KEYS = Set.of(
        "companyName", "timezone", "workWeekStart", "defaultShiftDuration",
        "maxShiftDuration", "payPeriodType", "defaultView"
    );

    // ── App Settings ────────────────────────────────────────────────────

    public Map<String, List<AppSettingDto>> getAllSettings() {
        List<AppSetting> all = appSettingRepository.findAll();
        if (all.isEmpty()) {
            seedDefaults();
            all = appSettingRepository.findAll();
        }
        return all.stream()
            .map(this::toDto)
            .collect(Collectors.groupingBy(AppSettingDto::getCategory));
    }

    public List<AppSettingDto> getSettingsByCategory(String category) {
        List<AppSetting> settings = appSettingRepository.findByCategory(category);
        if (settings.isEmpty() && DEFAULTS.containsKey(category)) {
            seedCategory(category);
            settings = appSettingRepository.findByCategory(category);
        }
        return settings.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public List<AppSettingDto> updateCategory(String category, List<AppSettingDto> updates, UUID userId) {
        for (AppSettingDto update : updates) {
            AppSetting setting = appSettingRepository
                .findByCategoryAndSettingKey(category, update.getKey())
                .orElseGet(() -> {
                    AppSetting newSetting = new AppSetting();
                    newSetting.setCategory(category);
                    newSetting.setSettingKey(update.getKey());
                    newSetting.setValueType(update.getValueType() != null ? update.getValueType() : "string");
                    return newSetting;
                });
            setting.setSettingValue(update.getValue());
            setting.setUpdatedBy(userId);
            if (update.getValueType() != null) {
                setting.setValueType(update.getValueType());
            }
            appSettingRepository.save(setting);
        }
        return getSettingsByCategory(category);
    }

    @Transactional
    public List<AppSettingDto> resetCategory(String category) {
        List<AppSettingDto> defaults = DEFAULTS.get(category);
        if (defaults == null) return List.of();

        // Delete existing then re-seed
        List<AppSetting> existing = appSettingRepository.findByCategory(category);
        appSettingRepository.deleteAll(existing);
        appSettingRepository.flush();
        seedCategory(category);
        return appSettingRepository.findByCategory(category).stream()
            .map(this::toDto).collect(Collectors.toList());
    }

    public List<AppSettingDto> getPublicSettings() {
        List<AppSetting> all = appSettingRepository.findAll();
        if (all.isEmpty()) {
            seedDefaults();
            all = appSettingRepository.findAll();
        }
        return all.stream()
            .filter(s -> PUBLIC_SETTING_KEYS.contains(s.getSettingKey()))
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    // ── User Preferences ────────────────────────────────────────────────

    public List<UserPreferenceDto> getUserPreferences(UUID userId) {
        List<UserPreference> prefs = userPreferenceRepository.findByUserId(userId);
        if (prefs.isEmpty()) {
            seedUserDefaults(userId);
            prefs = userPreferenceRepository.findByUserId(userId);
        }
        return prefs.stream().map(this::toPrefDto).collect(Collectors.toList());
    }

    @Transactional
    public List<UserPreferenceDto> updateUserPreferences(UUID userId, List<UserPreferenceDto> updates) {
        for (UserPreferenceDto update : updates) {
            UserPreference pref = userPreferenceRepository
                .findByUserIdAndPreferenceKey(userId, update.getKey())
                .orElseGet(() -> {
                    UserPreference newPref = new UserPreference();
                    newPref.setUserId(userId);
                    newPref.setPreferenceKey(update.getKey());
                    return newPref;
                });
            pref.setPreferenceValue(update.getValue());
            userPreferenceRepository.save(pref);
        }
        return getUserPreferences(userId);
    }

    @Transactional
    public List<UserPreferenceDto> resetUserPreferences(UUID userId) {
        List<UserPreference> existing = userPreferenceRepository.findByUserId(userId);
        userPreferenceRepository.deleteAll(existing);
        userPreferenceRepository.flush();
        seedUserDefaults(userId);
        return userPreferenceRepository.findByUserId(userId).stream()
            .map(this::toPrefDto).collect(Collectors.toList());
    }

    // ── Helpers ─────────────────────────────────────────────────────────

    private void seedDefaults() {
        DEFAULTS.keySet().forEach(this::seedCategory);
    }

    private void seedCategory(String category) {
        List<AppSettingDto> defaults = DEFAULTS.get(category);
        if (defaults == null) return;
        for (AppSettingDto d : defaults) {
            if (appSettingRepository.findByCategoryAndSettingKey(category, d.getKey()).isEmpty()) {
                AppSetting entity = AppSetting.builder()
                    .category(category)
                    .settingKey(d.getKey())
                    .settingValue(d.getValue())
                    .valueType(d.getValueType())
                    .build();
                appSettingRepository.save(entity);
            }
        }
    }

    private void seedUserDefaults(UUID userId) {
        DEFAULT_USER_PREFS.forEach((key, value) -> {
            if (userPreferenceRepository.findByUserIdAndPreferenceKey(userId, key).isEmpty()) {
                UserPreference pref = UserPreference.builder()
                    .userId(userId)
                    .preferenceKey(key)
                    .preferenceValue(value)
                    .build();
                userPreferenceRepository.save(pref);
            }
        });
    }

    private AppSettingDto toDto(AppSetting entity) {
        return AppSettingDto.builder()
            .category(entity.getCategory())
            .key(entity.getSettingKey())
            .value(entity.getSettingValue())
            .valueType(entity.getValueType())
            .build();
    }

    private UserPreferenceDto toPrefDto(UserPreference entity) {
        return UserPreferenceDto.builder()
            .key(entity.getPreferenceKey())
            .value(entity.getPreferenceValue())
            .build();
    }

    private static AppSettingDto dto(String key, String value, String type) {
        return AppSettingDto.builder().key(key).value(value).valueType(type).build();
    }
}
