package com.staffscheduler.api.controller;

import com.staffscheduler.api.model.User;
import com.staffscheduler.api.repository.UserRepository;
import com.staffscheduler.api.service.AppAccessService;
import com.staffscheduler.api.service.AppBadgeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/apps")
@RequiredArgsConstructor
@Tag(name = "Apps", description = "App launcher endpoints")
public class AppBadgeController {

    private final AppBadgeService appBadgeService;
    private final AppAccessService appAccessService;
    private final UserRepository userRepository;

    @GetMapping("/badges")
    @Operation(summary = "Get per-app badge counts for the launcher")
    public ResponseEntity<Map<String, Map<String, Object>>> getBadges() {
        return ResponseEntity.ok(appBadgeService.getBadgeCounts());
    }

    @GetMapping("/my-access")
    @Operation(summary = "Get apps accessible by the current user with permission levels")
    public ResponseEntity<List<Map<String, String>>> getMyAccess(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(appAccessService.getAccessibleApps(user.getRole()));
    }
}
