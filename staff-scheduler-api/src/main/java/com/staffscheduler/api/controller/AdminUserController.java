package com.staffscheduler.api.controller;

import com.staffscheduler.api.dto.AdminUserDto;
import com.staffscheduler.api.exception.DuplicateResourceException;
import com.staffscheduler.api.exception.ResourceNotFoundException;
import com.staffscheduler.api.model.User;
import com.staffscheduler.api.repository.RefreshTokenRepository;
import com.staffscheduler.api.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private static final Set<String> VALID_ROLES = Set.of("admin", "manager", "employee", "viewer");

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
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
                .role(dto.getRole().toLowerCase().trim())
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
            user.setRole(dto.getRole().toLowerCase().trim());
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

    // ── Helpers ──

    private void validateRole(String role) {
        if (role == null || !VALID_ROLES.contains(role.toLowerCase().trim())) {
            throw new IllegalArgumentException("Invalid role: " + role + ". Must be one of: " + VALID_ROLES);
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
