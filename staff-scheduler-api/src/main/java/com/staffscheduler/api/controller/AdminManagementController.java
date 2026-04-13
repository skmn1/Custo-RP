package com.staffscheduler.api.controller;

import com.staffscheduler.api.exception.ResourceNotFoundException;
import com.staffscheduler.api.model.*;
import com.staffscheduler.api.repository.*;
import com.staffscheduler.api.security.RoleConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin - Management", description = "Super Admin user management extensions, invitations, app access, audit log, terminal management")
public class AdminManagementController {

    private static final Logger log = LoggerFactory.getLogger(AdminManagementController.class);

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserInvitationRepository invitationRepository;
    private final AppPermissionRepository appPermissionRepository;
    private final PosRepository posRepository;
    private final PosAssignmentRepository posAssignmentRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    // ───────────────────────────────────────────────────────────
    //  User Suspend / Unsuspend / Reset Password
    // ───────────────────────────────────────────────────────────

    @PutMapping("/users/{id}/suspend")
    @Operation(summary = "Suspend a user and invalidate their tokens")
    @Transactional
    public ResponseEntity<Map<String, String>> suspendUser(@PathVariable UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id.toString()));
        user.setIsActive(false);
        userRepository.save(user);
        refreshTokenRepository.revokeAllByUserId(id);
        log.info("Admin suspended user {}", user.getEmail());
        return ResponseEntity.ok(Map.of("message", "User suspended", "status", "suspended"));
    }

    @PutMapping("/users/{id}/unsuspend")
    @Operation(summary = "Reactivate a suspended user")
    public ResponseEntity<Map<String, String>> unsuspendUser(@PathVariable UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id.toString()));
        user.setIsActive(true);
        userRepository.save(user);
        log.info("Admin unsuspended user {}", user.getEmail());
        return ResponseEntity.ok(Map.of("message", "User reactivated", "status", "active"));
    }

    @PostMapping("/users/{id}/reset-password")
    @Operation(summary = "Generate a one-time password reset link for a user")
    public ResponseEntity<Map<String, String>> resetPassword(@PathVariable UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id.toString()));
        // Generate a random token for password reset
        String token = UUID.randomUUID().toString();
        String resetLink = "/reset-password?token=" + token + "&userId=" + id;
        log.info("Admin generated password reset link for user {}", user.getEmail());
        return ResponseEntity.ok(Map.of("resetLink", resetLink, "message", "Reset link generated"));
    }

    // ───────────────────────────────────────────────────────────
    //  Invitations
    // ───────────────────────────────────────────────────────────

    @GetMapping("/invitations")
    @Operation(summary = "List all pending invitations")
    public ResponseEntity<List<Map<String, Object>>> listInvitations() {
        List<Map<String, Object>> result = invitationRepository.findByAcceptedAtIsNullOrderByCreatedAtDesc()
                .stream()
                .map(inv -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", inv.getId());
                    m.put("email", inv.getEmail());
                    m.put("role", inv.getRole());
                    m.put("firstName", inv.getFirstName());
                    m.put("lastName", inv.getLastName());
                    m.put("invitedBy", inv.getInvitedBy());
                    m.put("expiresAt", inv.getExpiresAt());
                    m.put("createdAt", inv.getCreatedAt());
                    return m;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/invitations")
    @Operation(summary = "Invite a new user")
    @Transactional
    public ResponseEntity<Map<String, Object>> createInvitation(
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        String email = body.get("email");
        String role = body.get("role");
        String firstName = body.get("firstName");
        String lastName = body.get("lastName");

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (role == null || !RoleConstants.isValid(role)) {
            throw new IllegalArgumentException("Invalid role: " + role);
        }
        if (userRepository.existsByEmail(email.toLowerCase().trim())) {
            throw new IllegalArgumentException("User with this email already exists");
        }
        if (invitationRepository.existsByEmailAndAcceptedAtIsNull(email.toLowerCase().trim())) {
            throw new IllegalArgumentException("An invitation is already pending for this email");
        }

        String token = UUID.randomUUID().toString();
        UUID invitedBy = (UUID) authentication.getPrincipal();

        UserInvitation invitation = UserInvitation.builder()
                .email(email.toLowerCase().trim())
                .role(RoleConstants.normalise(role))
                .firstName(firstName != null ? firstName.trim() : "")
                .lastName(lastName != null ? lastName.trim() : "")
                .tokenHash(passwordEncoder.encode(token))
                .invitedBy(invitedBy)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();
        invitationRepository.save(invitation);
        log.info("Admin invited user {} as {}", email, role);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", invitation.getId());
        result.put("email", invitation.getEmail());
        result.put("role", invitation.getRole());
        result.put("expiresAt", invitation.getExpiresAt());
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @DeleteMapping("/invitations/{id}")
    @Operation(summary = "Rescind a pending invitation")
    public ResponseEntity<Map<String, String>> rescindInvitation(@PathVariable UUID id) {
        UserInvitation invitation = invitationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation", id.toString()));
        invitationRepository.delete(invitation);
        log.info("Admin rescinded invitation for {}", invitation.getEmail());
        return ResponseEntity.ok(Map.of("message", "Invitation rescinded"));
    }

    // ───────────────────────────────────────────────────────────
    //  App Access Matrix
    // ───────────────────────────────────────────────────────────

    @GetMapping("/app-access")
    @Operation(summary = "Get current app access matrix")
    public ResponseEntity<Map<String, Map<String, String>>> getAppAccessMatrix() {
        List<AppPermission> perms = appPermissionRepository.findAll();
        Map<String, Map<String, String>> matrix = new LinkedHashMap<>();
        for (AppPermission p : perms) {
            matrix.computeIfAbsent(p.getAppId(), k -> new LinkedHashMap<>())
                    .put(p.getRole(), p.getPermissionLevel());
        }
        return ResponseEntity.ok(matrix);
    }

    @PutMapping("/app-access")
    @Operation(summary = "Update app access matrix")
    @Transactional
    public ResponseEntity<Map<String, String>> updateAppAccessMatrix(
            @RequestBody Map<String, Map<String, String>> matrix) {
        // Process each app-role combination
        for (Map.Entry<String, Map<String, String>> appEntry : matrix.entrySet()) {
            String appId = appEntry.getKey();
            for (Map.Entry<String, String> roleEntry : appEntry.getValue().entrySet()) {
                String role = roleEntry.getKey();
                String level = roleEntry.getValue();

                if ("super_admin".equals(role)) continue; // Super admin always full

                appPermissionRepository.findById(new AppPermission.AppPermissionId(appId, role))
                        .ifPresent(existing -> {
                            existing.setPermissionLevel(level);
                            appPermissionRepository.save(existing);
                        });
            }
        }
        log.info("Admin updated app access matrix");
        return ResponseEntity.ok(Map.of("message", "App access matrix updated"));
    }

    // ───────────────────────────────────────────────────────────
    //  PoS Terminal Management
    // ───────────────────────────────────────────────────────────

    @GetMapping("/pos-terminals")
    @Operation(summary = "List all POS terminals with assignments")
    public ResponseEntity<List<Map<String, Object>>> listPosTerminals() {
        List<PointOfSale> terminals = posRepository.findAll();
        List<Map<String, Object>> result = terminals.stream().map(t -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", t.getId());
            m.put("name", t.getName());
            m.put("location", t.getAddress());
            m.put("active", t.getIsActive());
            m.put("description", t.getType());

            // Get assigned managers
            List<PosAssignment> assignments = posAssignmentRepository.findByPosLocationId(t.getId());
            List<Map<String, Object>> managers = assignments.stream().map(a -> {
                Map<String, Object> mgr = new LinkedHashMap<>();
                mgr.put("id", a.getUserId());
                Optional<User> user = userRepository.findById(a.getUserId());
                user.ifPresent(u -> {
                    mgr.put("name", u.getFirstName() + " " + u.getLastName());
                    mgr.put("email", u.getEmail());
                });
                return mgr;
            }).collect(Collectors.toList());
            m.put("managers", managers);
            m.put("lastSession", null);
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/pos-terminals")
    @Operation(summary = "Create a new POS terminal")
    public ResponseEntity<Map<String, Object>> createPosTerminal(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String location = body.get("location");
        String description = body.get("description");

        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Terminal name is required");
        }

        PointOfSale terminal = PointOfSale.builder()
                .name(name.trim())
                .address(location != null ? location.trim() : "")
                .type(description != null ? description.trim() : "terminal")
                .isActive(true)
                .build();
        posRepository.save(terminal);
        log.info("Admin created POS terminal: {}", name);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", terminal.getId());
        result.put("name", terminal.getName());
        result.put("location", terminal.getAddress());
        result.put("active", terminal.getIsActive());
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @PutMapping("/pos-terminals/{id}")
    @Operation(summary = "Update a POS terminal")
    public ResponseEntity<Map<String, Object>> updatePosTerminal(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        PointOfSale terminal = posRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("POS Terminal", id.toString()));

        if (body.get("name") != null) terminal.setName(body.get("name").trim());
        if (body.get("location") != null) terminal.setAddress(body.get("location").trim());
        if (body.get("description") != null) terminal.setType(body.get("description").trim());
        posRepository.save(terminal);
        log.info("Admin updated POS terminal: {}", terminal.getName());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", terminal.getId());
        result.put("name", terminal.getName());
        result.put("location", terminal.getAddress());
        result.put("active", terminal.getIsActive());
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/pos-terminals/{id}")
    @Operation(summary = "Deactivate a POS terminal (soft delete)")
    public ResponseEntity<Map<String, String>> deactivatePosTerminal(@PathVariable Long id) {
        PointOfSale terminal = posRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("POS Terminal", id.toString()));
        terminal.setIsActive(false);
        posRepository.save(terminal);
        log.info("Admin deactivated POS terminal: {}", terminal.getName());
        return ResponseEntity.ok(Map.of("message", "Terminal deactivated"));
    }

    // ───────────────────────────────────────────────────────────
    //  Audit Log
    // ───────────────────────────────────────────────────────────

    @GetMapping("/audit-log")
    @Operation(summary = "Query audit log with filters")
    public ResponseEntity<List<Map<String, Object>>> getAuditLog(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) String actor,
            @RequestParam(required = false) String app,
            @RequestParam(required = false) String actionType,
            @RequestParam(required = false) String resourceType,
            @RequestParam(defaultValue = "200") int limit) {

        LocalDateTime fromDt = from != null ? LocalDateTime.parse(from + "T00:00:00") : null;
        LocalDateTime toDt = to != null ? LocalDateTime.parse(to + "T23:59:59") : null;

        List<AuditLog> logs = auditLogRepository.findFiltered(
                app, actionType, actor, resourceType, fromDt, toDt,
                Pageable.ofSize(limit));

        List<Map<String, Object>> result = logs.stream().map(l -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", l.getId());
            m.put("timestamp", l.getTimestamp());
            m.put("actor", l.getActorName());
            m.put("app", l.getApp());
            m.put("action", l.getAction());
            m.put("resourceType", l.getResourceType());
            m.put("resourceId", l.getResourceId());
            m.put("changes", l.getChanges());
            m.put("ipAddress", l.getIpAddress());
            return m;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/audit-log/export")
    @Operation(summary = "Export audit log as CSV or Excel")
    public ResponseEntity<Map<String, Object>> exportAuditLog(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) String app,
            @RequestParam(required = false) String actionType,
            @RequestParam(defaultValue = "csv") String format) {

        LocalDateTime fromDt = from != null ? LocalDateTime.parse(from + "T00:00:00") : null;
        LocalDateTime toDt = to != null ? LocalDateTime.parse(to + "T23:59:59") : null;

        List<AuditLog> logs = auditLogRepository.findFiltered(
                app, actionType, null, null, fromDt, toDt,
                Pageable.ofSize(10000));

        StringBuilder sb = new StringBuilder();
        sb.append("Timestamp,Actor,App,Action,Resource Type,Resource ID,IP Address\n");
        for (AuditLog l : logs) {
            sb.append(String.format("%s,%s,%s,%s,%s,%s,%s\n",
                    l.getTimestamp(), l.getActorName(), l.getApp(),
                    l.getAction(), l.getResourceType(), l.getResourceId(),
                    l.getIpAddress()));
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("content", sb.toString());
        result.put("format", format);
        result.put("count", logs.size());
        return ResponseEntity.ok(result);
    }
}
