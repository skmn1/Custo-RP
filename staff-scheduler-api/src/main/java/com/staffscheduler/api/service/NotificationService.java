package com.staffscheduler.api.service;

import com.staffscheduler.api.model.Notification;
import com.staffscheduler.api.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Reusable notification service.
 * Other controllers/services call {@link #createNotification} to emit
 * user-facing persistent notifications.
 *
 * <p>Allowed types:</p>
 * <ul>
 *   <li>{@code payslip_available} — payslip generated for employee</li>
 *   <li>{@code schedule_published} — schedule published for date range</li>
 *   <li>{@code profile_change_approved} — profile change request approved</li>
 *   <li>{@code profile_change_rejected} — profile change request rejected</li>
 *   <li>{@code leave_approved} — leave request approved</li>
 *   <li>{@code leave_rejected} — leave request rejected</li>
 *   <li>{@code leave_balance_adjusted} — leave balance adjusted</li>
 *   <li>{@code leave_starting} — reminder: leave starts tomorrow</li>
 *   <li>{@code shift_updated} — shift schedule changed</li>
 *   <li>{@code system_announcement} — system-wide announcement</li>
 *   <li>{@code general} — generic notification</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;

    private static final java.util.Set<String> ALLOWED_TYPES = java.util.Set.of(
            "payslip_available",
            "schedule_published",
            "profile_change_approved",
            "profile_change_rejected",
            "leave_approved",
            "leave_rejected",
            "leave_balance_adjusted",
            "leave_starting",
            "shift_updated",
            "system_announcement",
            "general"
    );

    /**
     * Creates a persistent in-app notification for a user.
     *
     * @param userId   target user UUID
     * @param type     notification type (must be one of ALLOWED_TYPES)
     * @param title    pre-translated short title
     * @param body     optional body text
     * @param link     optional deep-link URL (e.g. /app/ess/payslips/uuid)
     * @param metadata optional JSON string with type-specific data
     * @return the created Notification entity
     * @throws IllegalArgumentException if type is not in the allowed set
     */
    public Notification createNotification(UUID userId, String type, String title,
                                           String body, String link, String metadata) {
        if (!ALLOWED_TYPES.contains(type)) {
            throw new IllegalArgumentException("Invalid notification type: " + type);
        }

        Notification n = Notification.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .body(body)
                .link(link)
                .metadata(metadata)
                .build();
        notificationRepository.save(n);
        log.debug("Notification created: type={}, userId={}, id={}", type, userId, n.getId());
        return n;
    }

    /**
     * Convenience overload without body, link, or metadata.
     */
    public Notification createNotification(UUID userId, String type, String title) {
        return createNotification(userId, type, title, null, null, null);
    }

    /**
     * Convenience overload with link but no body or metadata.
     */
    public Notification createNotification(UUID userId, String type, String title, String link) {
        return createNotification(userId, type, title, null, link, null);
    }
}
