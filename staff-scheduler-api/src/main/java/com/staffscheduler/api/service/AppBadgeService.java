package com.staffscheduler.api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * Aggregates per-app badge counts displayed on the App Launcher tiles.
 * Each entry is keyed by app id and contains { count, label }.
 */
@Service
@RequiredArgsConstructor
public class AppBadgeService {

    /**
     * Returns badge data for each app.
     * Keys match client-side app registry ids.
     */
    public Map<String, Map<String, Object>> getBadgeCounts() {
        Map<String, Map<String, Object>> badges = new HashMap<>();

        // Placeholder — real implementations will query repositories
        // Example: badges.put("planning", Map.of("count", 3, "label", "pending"));

        return badges;
    }
}
