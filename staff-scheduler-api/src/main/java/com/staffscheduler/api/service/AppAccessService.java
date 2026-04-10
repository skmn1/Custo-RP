package com.staffscheduler.api.service;

import com.staffscheduler.api.model.AppPermission;
import com.staffscheduler.api.repository.AppPermissionRepository;
import com.staffscheduler.api.repository.PosAssignmentRepository;
import com.staffscheduler.api.security.RoleConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service("appSecurity")
@RequiredArgsConstructor
public class AppAccessService {

    private final AppPermissionRepository appPermissionRepository;
    private final PosAssignmentRepository posAssignmentRepository;

    /**
     * Check if a role has at least the given permission level on an app.
     */
    public boolean hasAppAccess(String role, String appId, String requiredLevel) {
        String normalised = RoleConstants.normalise(role);
        AppPermission perm = appPermissionRepository
                .findById(new AppPermission.AppPermissionId(appId, normalised))
                .orElse(null);
        if (perm == null) return false;
        return meetsLevel(perm.getPermissionLevel(), requiredLevel);
    }

    /**
     * Get all apps accessible by a role (permission_level != 'none').
     */
    public List<Map<String, String>> getAccessibleApps(String role) {
        String normalised = RoleConstants.normalise(role);
        return appPermissionRepository.findByRoleAndPermissionLevelNot(normalised, "none")
                .stream()
                .map(p -> Map.of(
                        "appId", p.getAppId(),
                        "permissionLevel", p.getPermissionLevel()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Check if a user is assigned to a specific PoS terminal.
     */
    public boolean hasTerminalAccess(UUID userId, Long terminalId) {
        return posAssignmentRepository.existsByUserIdAndPosTerminalId(userId, terminalId);
    }

    private boolean meetsLevel(String actual, String required) {
        if ("none".equals(actual)) return false;
        if ("read".equals(required)) return true; // full or read both satisfy read
        return "full".equals(actual); // full required -> only full satisfies
    }
}
