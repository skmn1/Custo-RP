package com.staffscheduler.api.controller;

import com.staffscheduler.api.service.AppBadgeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/apps")
@RequiredArgsConstructor
@Tag(name = "Apps", description = "App launcher endpoints")
public class AppBadgeController {

    private final AppBadgeService appBadgeService;

    @GetMapping("/badges")
    @Operation(summary = "Get per-app badge counts for the launcher")
    public ResponseEntity<Map<String, Map<String, Object>>> getBadges() {
        return ResponseEntity.ok(appBadgeService.getBadgeCounts());
    }
}
