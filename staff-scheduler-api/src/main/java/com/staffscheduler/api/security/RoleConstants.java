package com.staffscheduler.api.security;

import java.util.Map;
import java.util.Set;

/**
 * Canonical role definitions for the 7-role RBAC model.
 * Provides aliases for backward compatibility during migration.
 */
public final class RoleConstants {

    private RoleConstants() {}

    // ── Canonical role names (stored in DB lowercase) ──
    public static final String SUPER_ADMIN      = "super_admin";
    public static final String HR_MANAGER       = "hr_manager";
    public static final String PLANNER          = "planner";
    public static final String ACCOUNTING_AGENT = "accounting_agent";
    public static final String STOCK_MANAGER    = "stock_manager";
    public static final String POS_MANAGER      = "pos_manager";
    public static final String EMPLOYEE         = "employee";

    /** All valid canonical roles. */
    public static final Set<String> VALID_ROLES = Set.of(
            SUPER_ADMIN, HR_MANAGER, PLANNER, ACCOUNTING_AGENT,
            STOCK_MANAGER, POS_MANAGER, EMPLOYEE
    );

    /**
     * Alias map for backward-compatible migration.
     * Old role names map to their canonical equivalents.
     */
    private static final Map<String, String> ROLE_ALIASES = Map.of(
            "admin",   SUPER_ADMIN,
            "manager", HR_MANAGER,
            "viewer",  EMPLOYEE
    );

    /**
     * Normalise any role string to its canonical form.
     * Recognises both canonical names and legacy aliases.
     *
     * @param role raw role string (may be null)
     * @return canonical role, or the input trimmed/lowered if unrecognised
     */
    public static String normalise(String role) {
        if (role == null || role.isBlank()) return EMPLOYEE;
        String key = role.trim().toLowerCase();
        if (VALID_ROLES.contains(key)) return key;
        return ROLE_ALIASES.getOrDefault(key, key);
    }

    /**
     * Check if a role string (or alias) resolves to a valid canonical role.
     */
    public static boolean isValid(String role) {
        return VALID_ROLES.contains(normalise(role));
    }
}
