package com.staffscheduler.api.service;

import com.staffscheduler.api.model.NotificationPreference;
import com.staffscheduler.api.model.PushSubscription;
import com.staffscheduler.api.repository.NotificationPreferenceRepository;
import com.staffscheduler.api.repository.PushSubscriptionRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Subscription;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * WebPushService — Task 60
 *
 * Sends VAPID-signed web push notifications to all active subscriptions
 * for an employee. Integrates with NotificationPreference to respect
 * per-category push opt-out.
 *
 * Push is dispatched asynchronously so it never blocks the main HTTP request.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WebPushService {

    private final PushSubscriptionRepository pushSubscriptionRepository;
    private final NotificationPreferenceRepository preferenceRepository;

    @Value("${VAPID_PUBLIC_KEY:}")
    private String vapidPublicKey;

    @Value("${VAPID_PRIVATE_KEY:}")
    private String vapidPrivateKey;

    @Value("${VAPID_SUBJECT:mailto:admin@staffschedulerpro.com}")
    private String vapidSubject;

    private PushService pushService;

    // Map from notification type → category used in preference lookup
    private static final java.util.Map<String, String> TYPE_TO_CATEGORY = java.util.Map.ofEntries(
        java.util.Map.entry("payslip_available",         "payslip"),
        java.util.Map.entry("schedule_published",        "schedule"),
        java.util.Map.entry("shift_updated",             "schedule"),
        java.util.Map.entry("profile_change_approved",   "profile"),
        java.util.Map.entry("profile_change_rejected",   "profile"),
        java.util.Map.entry("leave_approved",            "leave"),
        java.util.Map.entry("leave_rejected",            "leave"),
        java.util.Map.entry("leave_balance_adjusted",    "leave"),
        java.util.Map.entry("leave_starting",            "leave"),
        java.util.Map.entry("system_announcement",       "general"),
        java.util.Map.entry("general",                   "general")
    );

    // Default push-enabled per category (when no preference row exists)
    private static final java.util.Set<String> DEFAULT_PUSH_ENABLED_CATEGORIES =
        java.util.Set.of("payslip", "schedule", "leave", "profile", "general");

    @PostConstruct
    public void init() {
        if (vapidPublicKey.isBlank() || vapidPrivateKey.isBlank()) {
            log.warn("VAPID keys not configured — web push notifications are DISABLED. " +
                     "Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY environment variables.");
            return;
        }
        try {
            pushService = new PushService(vapidPublicKey, vapidPrivateKey, vapidSubject);
            log.info("WebPushService initialised — VAPID subject: {}", vapidSubject);
        } catch (Exception e) {
            log.error("Failed to initialise WebPushService: {}", e.getMessage(), e);
        }
    }

    /** Returns the configured VAPID public key (safe to expose to frontend). */
    public String getVapidPublicKey() {
        return vapidPublicKey;
    }

    public boolean isConfigured() {
        return pushService != null;
    }

    /**
     * Dispatch a push notification to all active subscriptions of an employee.
     * Checks the per-category preference before sending.
     * Runs asynchronously — never blocks the caller.
     *
     * @param employeeId  Target employee
     * @param type        Notification type (e.g. "payslip_available")
     * @param title       Push title
     * @param body        Push body text
     * @param url         Deep-link URL (e.g. "/app/ess/payslips/uuid")
     * @param tag         Notification tag for collapsing
     */
    @Async
    @Transactional(readOnly = true)
    public void sendPushToEmployee(String employeeId, String type, String title,
                                   String body, String url, String tag) {
        if (!isConfigured()) return;

        // Check preference for this category
        String category = TYPE_TO_CATEGORY.getOrDefault(type, "general");
        boolean pushEnabled = isPushEnabledForCategory(employeeId, category);
        if (!pushEnabled) {
            log.debug("Push suppressed for employee {} category {}: preference disabled", employeeId, category);
            return;
        }

        List<PushSubscription> subscriptions =
            pushSubscriptionRepository.findByEmployeeIdAndIsActiveTrue(employeeId);

        if (subscriptions.isEmpty()) {
            log.debug("No active push subscriptions for employee {}", employeeId);
            return;
        }

        // Build JSON payload
        String payload = buildPayload(title, body, category, url, tag);

        for (PushSubscription sub : subscriptions) {
            try {
                Subscription webpushSub = new Subscription(
                    sub.getEndpoint(),
                    new Subscription.Keys(sub.getP256dhKey(), sub.getAuthKey())
                );
                Notification notification = new Notification(webpushSub, payload);
                pushService.send(notification);
                log.debug("Push sent to employee {} subscription {}", employeeId, sub.getId());
            } catch (Exception e) {
                int statusCode = extractStatusCode(e);
                if (statusCode == 404 || statusCode == 410) {
                    // Subscription expired or unregistered — deactivate
                    log.info("Deactivating expired push subscription {} (HTTP {})",
                             sub.getId(), statusCode);
                    pushSubscriptionRepository.deactivateByEndpoint(sub.getEndpoint());
                } else {
                    log.warn("Failed to send push to subscription {}: {}", sub.getId(), e.getMessage());
                }
            }
        }
    }

    private boolean isPushEnabledForCategory(String employeeId, String category) {
        return preferenceRepository
            .findByEmployeeIdAndCategory(employeeId, category)
            .map(NotificationPreference::isPushEnabled)
            .orElse(DEFAULT_PUSH_ENABLED_CATEGORIES.contains(category));
    }

    private String buildPayload(String title, String body, String category, String url, String tag) {
        // Manual JSON construction — avoids a Jackson dependency injection for a simple payload
        return String.format(
            "{\"title\":\"%s\",\"body\":\"%s\",\"category\":\"%s\",\"url\":\"%s\"," +
            "\"tag\":\"%s\",\"icon\":\"/icons/ess/icon-192.png\",\"badge\":\"/icons/ess/badge-72.png\"}",
            escape(title),
            escape(body != null ? body : ""),
            escape(category),
            escape(url != null ? url : "/app/ess/notifications"),
            escape(tag != null ? tag : category)
        );
    }

    private static String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    private static int extractStatusCode(Exception e) {
        // nl.martijndwars.webpush.PushService throws org.apache.http.HttpException
        // with a message like "Server error: 410 Gone"
        String msg = e.getMessage();
        if (msg == null) return 0;
        try {
            for (String part : msg.split(" ")) {
                int code = Integer.parseInt(part);
                if (code >= 400) return code;
            }
        } catch (NumberFormatException ignored) { /* no numeric code */ }
        return 0;
    }
}
