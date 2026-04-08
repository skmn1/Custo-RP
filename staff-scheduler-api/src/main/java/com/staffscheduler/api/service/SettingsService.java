package com.staffscheduler.api.service;

import com.staffscheduler.api.dto.AppSettingDto;
import com.staffscheduler.api.dto.NavItemDto;
import com.staffscheduler.api.dto.UserPreferenceDto;
import com.staffscheduler.api.model.AppSetting;
import com.staffscheduler.api.model.NavItem;
import com.staffscheduler.api.model.UserPreference;
import com.staffscheduler.api.repository.AppSettingRepository;
import com.staffscheduler.api.repository.NavItemRepository;
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
    private final NavItemRepository navItemRepository;

    // ── Default settings that seed on first access ──────────────────────

    private static final Map<String, List<AppSettingDto>> DEFAULTS;

    static {
        Map<String, List<AppSettingDto>> map = new LinkedHashMap<>();
        map.put("general", List.of(
            dto("companyName", "Staff Scheduler Pro", "string"),
            dto("timezone", "America/New_York", "string"),
            dto("workWeekStart", "monday", "string"),
            dto("dateFormat", "MM/dd/yyyy", "string"),
            dto("timeFormat", "12h", "string"),
            dto("currency", "USD", "string"),
            dto("fiscalYearStart", "January", "string")
        ));
        map.put("scheduling", List.of(
            dto("defaultShiftDuration", "8", "number"),
            dto("maxShiftDuration", "12", "number"),
            dto("minHoursBetweenShifts", "8", "number"),
            dto("allowOverlap", "false", "boolean"),
            dto("autoAssignColors", "true", "boolean"),
            dto("showCostOnCards", "true", "boolean"),
            dto("defaultView", "week", "string"),
            dto("enableDragDrop", "true", "boolean"),
            dto("requireConfirmation", "false", "boolean"),
            dto("maxShiftsPerWeek", "0", "number")
        ));
        map.put("payroll", List.of(
            dto("payPeriodType", "biweekly", "string"),
            dto("payPeriodRefDate", "", "string"),
            dto("overtimeThreshold", "40", "number"),
            dto("overtimeMultiplier", "1.5", "number"),
            dto("dailyOvertimeThreshold", "0", "number"),
            dto("doubleTimeThreshold", "0", "number"),
            dto("doubleTimeMultiplier", "2.0", "number"),
            dto("holidayMultiplier", "1.5", "number"),
            dto("defaultHourlyRate", "15.00", "number"),
            dto("minWageEnforcement", "true", "boolean")
        ));
        map.put("timeOff", List.of(
            dto("accrualRate", "1.25", "number"),
            dto("annualCap", "20", "number"),
            dto("carryoverLimit", "5", "number"),
            dto("minAdvanceNotice", "7", "number"),
            dto("maxConsecutiveDays", "0", "number"),
            dto("autoApprove", "false", "boolean"),
            dto("blackoutDates", "[]", "json")
        ));
        map.put("swaps", List.of(
            dto("allowEmployeeInitiated", "true", "boolean"),
            dto("requireManagerApproval", "true", "boolean"),
            dto("requestWindowHours", "48", "number"),
            dto("allowCrossDepartment", "false", "boolean"),
            dto("autoApproveEligible", "false", "boolean")
        ));
        map.put("notifications", List.of(
            dto("emailEnabled", "true", "boolean"),
            dto("pushEnabled", "true", "boolean"),
            dto("shiftAssignment", "true", "boolean"),
            dto("schedulePublished", "true", "boolean"),
            dto("swapRequests", "true", "boolean"),
            dto("timeOffDecision", "true", "boolean"),
            dto("performanceReviews", "true", "boolean"),
            dto("reminderLeadTime", "24h", "string"),
            dto("digestFrequency", "instant", "string")
        ));
        map.put("featureFlags", List.of(
            dto("feature.shifts", "true", "boolean"),
            dto("feature.payroll", "true", "boolean"),
            dto("feature.timeOff", "true", "boolean"),
            dto("feature.shiftSwaps", "true", "boolean"),
            dto("feature.recurringTemplates", "true", "boolean"),
            dto("feature.reports", "true", "boolean"),
            dto("feature.performanceReviews", "true", "boolean"),
            dto("feature.stock", "true", "boolean"),
            dto("feature.invoices", "false", "boolean"),
            dto("feature.employeeMobileApp", "true", "boolean")
        ));
        map.put("security", List.of(
            dto("passwordMinLength", "8", "number"),
            dto("requireUppercase", "true", "boolean"),
            dto("requireNumber", "true", "boolean"),
            dto("requireSpecialChar", "false", "boolean"),
            dto("passwordExpiry", "0", "number"),
            dto("maxFailedAttempts", "5", "number"),
            dto("lockoutDuration", "15", "number"),
            dto("sessionTimeout", "60", "number"),
            dto("jwtAccessTtl", "15", "number"),
            dto("jwtRefreshTtl", "7", "number"),
            dto("require2faAdmins", "false", "boolean"),
            dto("allowedIpRanges", "", "string")
        ));
        map.put("dataPrivacy", List.of(
            dto("auditLogRetention", "365", "number"),
            dto("scheduleHistoryRetention", "730", "number"),
            dto("gdprErasure", "true", "boolean"),
            dto("exportFormat", "CSV", "string"),
            dto("anonymousAnalytics", "false", "boolean"),
            dto("cookieConsentBanner", "true", "boolean")
        ));
        map.put("invoices", List.of(
            dto("defaultCurrency", "EUR", "string"),
            dto("defaultTaxRate", "20.00", "number"),
            dto("defaultPaymentTerms", "30 jours net", "string"),
            dto("defaultEarlyPaymentDiscount", "0", "number"),
            dto("defaultLatePaymentRate", "12.37", "number"),
            dto("autoNumbering", "true", "boolean"),
            dto("numberPrefix", "FAC-", "string"),
            dto("requireSiret", "true", "boolean"),
            dto("requireVatNumber", "false", "boolean"),
            dto("ocrProvider", "mistral", "string"),
            dto("ocrConfidenceThreshold", "0.7", "number"),
            dto("ocrAutoImport", "false", "boolean")
        ));
        DEFAULTS = Collections.unmodifiableMap(map);
    }

    private static final Map<String, String> DEFAULT_USER_PREFS = Map.ofEntries(
        Map.entry("theme", "system"),
        Map.entry("rowsPerPage", "10"),
        Map.entry("compactMode", "false"),
        Map.entry("sidebarCollapsed", "false"),
        Map.entry("animateTransitions", "true"),
        Map.entry("reducedMotion", "false"),
        Map.entry("fontSize", "medium"),
        Map.entry("highContrast", "false"),
        Map.entry("focusRingAlwaysVisible", "false"),
        Map.entry("notifications.shiftAssignment", "true"),
        Map.entry("notifications.schedulePublished", "true"),
        Map.entry("notifications.swapRequests", "true"),
        Map.entry("notifications.timeOffDecision", "true"),
        Map.entry("notifications.performanceReviews", "true")
    );

    // Public settings keys visible without full admin access
    private static final Set<String> PUBLIC_SETTING_KEYS = Set.of(
        "companyName", "timezone", "workWeekStart", "dateFormat", "timeFormat", "currency",
        "defaultShiftDuration", "maxShiftDuration", "defaultView", "payPeriodType",
        "enableDragDrop"
    );

    // Default nav items ordering
    private static final List<NavItemDto> DEFAULT_NAV_ITEMS = List.of(
        NavItemDto.builder().routeKey("dashboard").displayOrder(0).visibleAdmin(true).visibleManager(true).visibleEmployee(true).systemLocked(false).build(),
        NavItemDto.builder().routeKey("scheduler").displayOrder(1).visibleAdmin(true).visibleManager(true).visibleEmployee(true).systemLocked(false).build(),
        NavItemDto.builder().routeKey("employees").displayOrder(2).visibleAdmin(true).visibleManager(true).visibleEmployee(true).systemLocked(false).build(),
        NavItemDto.builder().routeKey("payroll").displayOrder(3).visibleAdmin(true).visibleManager(true).visibleEmployee(true).systemLocked(false).build(),
        NavItemDto.builder().routeKey("pos").displayOrder(4).visibleAdmin(true).visibleManager(true).visibleEmployee(false).systemLocked(false).build(),
        NavItemDto.builder().routeKey("stock").displayOrder(5).visibleAdmin(true).visibleManager(true).visibleEmployee(false).systemLocked(false).build(),
        NavItemDto.builder().routeKey("shifts").displayOrder(6).visibleAdmin(true).visibleManager(true).visibleEmployee(false).systemLocked(false).build(),
        NavItemDto.builder().routeKey("reports").displayOrder(7).visibleAdmin(true).visibleManager(true).visibleEmployee(false).systemLocked(false).build(),
        NavItemDto.builder().routeKey("settings").displayOrder(8).visibleAdmin(true).visibleManager(true).visibleEmployee(false).systemLocked(true).build(),
        NavItemDto.builder().routeKey("users").displayOrder(9).visibleAdmin(true).visibleManager(false).visibleEmployee(false).systemLocked(false).build()
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

    // ── Feature Flags ───────────────────────────────────────────────────

    public Map<String, Boolean> getFeatureFlags() {
        List<AppSetting> flags = appSettingRepository.findByCategory("featureFlags");
        if (flags.isEmpty()) {
            seedCategory("featureFlags");
            flags = appSettingRepository.findByCategory("featureFlags");
        }
        Map<String, Boolean> result = new LinkedHashMap<>();
        for (AppSetting s : flags) {
            result.put(s.getSettingKey(), "true".equalsIgnoreCase(s.getSettingValue()));
        }
        return result;
    }

    // ── Navigation Items ────────────────────────────────────────────────

    public List<NavItemDto> getNavItems() {
        List<NavItem> items = navItemRepository.findAllByOrderByDisplayOrderAsc();
        if (items.isEmpty()) {
            seedNavItems();
            items = navItemRepository.findAllByOrderByDisplayOrderAsc();
        }
        return items.stream().map(this::toNavDto).collect(Collectors.toList());
    }

    @Transactional
    public List<NavItemDto> saveNavItems(List<NavItemDto> updates) {
        for (NavItemDto update : updates) {
            NavItem item = navItemRepository.findByRouteKey(update.getRouteKey())
                .orElseGet(() -> {
                    NavItem newItem = new NavItem();
                    newItem.setRouteKey(update.getRouteKey());
                    return newItem;
                });

            // Don't allow modifying visibility of system-locked items
            if (Boolean.TRUE.equals(item.getSystemLocked())) {
                item.setDisplayOrder(update.getDisplayOrder());
                navItemRepository.save(item);
                continue;
            }

            item.setDisplayOrder(update.getDisplayOrder());
            if (update.getVisibleAdmin() != null) item.setVisibleAdmin(update.getVisibleAdmin());
            if (update.getVisibleManager() != null) item.setVisibleManager(update.getVisibleManager());
            if (update.getVisibleEmployee() != null) item.setVisibleEmployee(update.getVisibleEmployee());
            navItemRepository.save(item);
        }
        return getNavItems();
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

    private void seedNavItems() {
        for (NavItemDto d : DEFAULT_NAV_ITEMS) {
            if (navItemRepository.findByRouteKey(d.getRouteKey()).isEmpty()) {
                NavItem entity = NavItem.builder()
                    .routeKey(d.getRouteKey())
                    .displayOrder(d.getDisplayOrder())
                    .visibleAdmin(d.getVisibleAdmin())
                    .visibleManager(d.getVisibleManager())
                    .visibleEmployee(d.getVisibleEmployee())
                    .systemLocked(d.getSystemLocked())
                    .build();
                navItemRepository.save(entity);
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

    private NavItemDto toNavDto(NavItem entity) {
        return NavItemDto.builder()
            .id(entity.getId())
            .routeKey(entity.getRouteKey())
            .displayOrder(entity.getDisplayOrder())
            .visibleAdmin(entity.getVisibleAdmin())
            .visibleManager(entity.getVisibleManager())
            .visibleEmployee(entity.getVisibleEmployee())
            .systemLocked(entity.getSystemLocked())
            .build();
    }

    private static AppSettingDto dto(String key, String value, String type) {
        return AppSettingDto.builder().key(key).value(value).valueType(type).build();
    }
}
