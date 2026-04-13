package com.staffscheduler.api.controller;

import com.staffscheduler.api.dto.AdminUserDto;
import com.staffscheduler.api.exception.DuplicateResourceException;
import com.staffscheduler.api.exception.ResourceNotFoundException;
import com.staffscheduler.api.model.PosAssignment;
import com.staffscheduler.api.model.User;
import com.staffscheduler.api.repository.PosAssignmentRepository;
import com.staffscheduler.api.repository.RefreshTokenRepository;
import com.staffscheduler.api.repository.UserRepository;
import com.staffscheduler.api.security.RoleConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@Tag(name = "Admin - User Management", description = "Admin-only user management operations")
public class AdminUserController {

    private static final Logger log = LoggerFactory.getLogger(AdminUserController.class);

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PosAssignmentRepository posAssignmentRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    @Operation(summary = "List all users")
    public ResponseEntity<List<AdminUserDto>> listUsers() {
        List<AdminUserDto> users = userRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<AdminUserDto> getUser(@PathVariable UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id.toString()));
        return ResponseEntity.ok(toDto(user));
    }

    @PostMapping
    @Operation(summary = "Create a new user")
    public ResponseEntity<AdminUserDto> createUser(@Valid @RequestBody AdminUserDto dto) {
        if (userRepository.existsByEmail(dto.getEmail().toLowerCase().trim())) {
            throw new DuplicateResourceException("Email already registered: " + dto.getEmail());
        }
        validateRole(dto.getRole());

        if (dto.getPassword() == null || dto.getPassword().length() < 8) {
            throw new IllegalArgumentException("Password is required and must be at least 8 characters");
        }

        User user = User.builder()
                .email(dto.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(dto.getPassword()))
                .firstName(dto.getFirstName().trim())
                .lastName(dto.getLastName().trim())
                .role(RoleConstants.normalise(dto.getRole()))
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .employeeId(dto.getEmployeeId())
                .build();
        userRepository.save(user);

        log.info("Admin created user {} with role {}", user.getEmail(), user.getRole());
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(user));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update user details and/or role")
    public ResponseEntity<AdminUserDto> updateUser(@PathVariable UUID id, @RequestBody AdminUserDto dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id.toString()));

        if (dto.getEmail() != null && !dto.getEmail().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmail(dto.getEmail().toLowerCase().trim())) {
                throw new DuplicateResourceException("Email already registered: " + dto.getEmail());
            }
            user.setEmail(dto.getEmail().toLowerCase().trim());
        }
        if (dto.getFirstName() != null) user.setFirstName(dto.getFirstName().trim());
        if (dto.getLastName() != null) user.setLastName(dto.getLastName().trim());
        if (dto.getRole() != null) {
            validateRole(dto.getRole());
            user.setRole(RoleConstants.normalise(dto.getRole()));
        }
        if (dto.getIsActive() != null) user.setIsActive(dto.getIsActive());
        if (dto.getEmployeeId() != null) user.setEmployeeId(dto.getEmployeeId());
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
            refreshTokenRepository.revokeAllByUserId(id);
        }

        userRepository.save(user);
        log.info("Admin updated user {}", user.getEmail());
        return ResponseEntity.ok(toDto(user));
    }

    @PutMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate a user")
    public ResponseEntity<AdminUserDto> deactivateUser(@PathVariable UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id.toString()));
        user.setIsActive(false);
        userRepository.save(user);
        refreshTokenRepository.revokeAllByUserId(id);
        log.info("Admin deactivated user {}", user.getEmail());
        return ResponseEntity.ok(toDto(user));
    }

    @PutMapping("/{id}/activate")
    @Operation(summary = "Activate a user")
    public ResponseEntity<AdminUserDto> activateUser(@PathVariable UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id.toString()));
        user.setIsActive(true);
        userRepository.save(user);
        log.info("Admin activated user {}", user.getEmail());
        return ResponseEntity.ok(toDto(user));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a user permanently")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id.toString()));
        refreshTokenRepository.revokeAllByUserId(id);
        userRepository.delete(user);
        log.info("Admin deleted user {}", user.getEmail());
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    // ── Role change ──

    @PutMapping("/{id}/role")
    @Operation(summary = "Change a user's role")
    public ResponseEntity<AdminUserDto> changeRole(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        String newRole = body.get("role");
        validateRole(newRole);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id.toString()));
        user.setRole(RoleConstants.normalise(newRole));
        userRepository.save(user);
        log.info("Admin changed role of user {} to {}", user.getEmail(), user.getRole());
        return ResponseEntity.ok(toDto(user));
    }

    // ── Roles list ──

    @GetMapping("/roles")
    @Operation(summary = "List all valid canonical roles")
    public ResponseEntity<Set<String>> listRoles() {
        return ResponseEntity.ok(RoleConstants.VALID_ROLES);
    }

    // ── PoS Assignments ──

    @GetMapping("/{id}/pos-assignments")
    @Operation(summary = "List PoS terminal assignments for a user")
    public ResponseEntity<List<Map<String, Object>>> getPosAssignments(@PathVariable UUID id) {
        userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id.toString()));
        List<Map<String, Object>> assignments = posAssignmentRepository.findByUserId(id).stream()
                .map(a -> Map.<String, Object>of(
                        "id", a.getId(),
                        "posLocationId", a.getPosLocationId(),
                        "assignedBy", a.getAssignedBy() != null ? a.getAssignedBy().toString() : "",
                        "assignedAt", a.getAssignedAt().toString()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(assignments);
    }

    @PostMapping("/{id}/pos-assignments")
    @Operation(summary = "Assign a PoS location to a user")
    @Transactional
    public ResponseEntity<Map<String, Object>> assignTerminal(
            @PathVariable UUID id,
            @RequestBody Map<String, Long> body,
            Authentication authentication) {
        userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id.toString()));
        Long posLocationId = body.get("posLocationId") != null ? body.get("posLocationId") : body.get("posTerminalId");
        if (posLocationId == null) {
            throw new IllegalArgumentException("posLocationId is required");
        }
        if (posAssignmentRepository.existsByUserIdAndPosLocationId(id, posLocationId)) {
            throw new DuplicateResourceException("User already assigned to this location");
        }

        UUID assignedBy = (UUID) authentication.getPrincipal();
        PosAssignment assignment = PosAssignment.builder()
                .userId(id)
                .posTerminalId(posLocationId)
                .assignedBy(assignedBy)
                .build();
        posAssignmentRepository.save(assignment);
        log.info("Admin assigned PoS location {} to user {}", posLocationId, id);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id", assignment.getId(),
                "posLocationId", assignment.getPosLocationId(),
                "assignedAt", assignment.getAssignedAt().toString()
        ));
    }

    @DeleteMapping("/{userId}/pos-assignments/{posLocationId}")
    @Operation(summary = "Remove a PoS location assignment from a user")
    @Transactional
    public ResponseEntity<Map<String, String>> removeTerminalAssignment(
            @PathVariable UUID userId,
            @PathVariable Long posLocationId) {
        posAssignmentRepository.deleteByUserIdAndPosLocationId(userId, posLocationId);
        log.info("Admin removed PoS location {} assignment from user {}", posLocationId, userId);
        return ResponseEntity.ok(Map.of("message", "PoS location assignment removed"));
    }

    // ── Helpers ──

    private void validateRole(String role) {
        if (role == null || !RoleConstants.isValid(role)) {
            throw new IllegalArgumentException(
                    "Invalid role: " + role + ". Must be one of: " + RoleConstants.VALID_ROLES);
        }
    }

    private AdminUserDto toDto(User user) {
        return AdminUserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .employeeId(user.getEmployeeId())
                .lastLogin(user.getLastLogin())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
