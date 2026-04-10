package com.staffscheduler.api.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Per-user in-memory rate limiter for sensitive ESS endpoints.
 *
 * Uses a sliding window counter keyed by (userId + endpoint pattern).
 * Returns HTTP 429 Too Many Requests with a Retry-After header when exceeded.
 *
 * Rate limits:
 *   POST /api/ess/profile/photo             → 5 / hour
 *   POST /api/ess/profile/qualifications/*/document → 10 / hour
 *   POST /api/ess/profile/change-request     → 20 / hour
 *   GET  /api/ess/payslips/*/download        → 30 / hour
 *   PUT  /api/ess/notifications/read-all     → 10 / minute
 */
@Component
public class EssRateLimitFilter implements Filter {

    /** Rate limit definitions: pathPattern → { maxRequests, windowMs } */
    private static final Map<String, int[]> RATE_LIMITS = Map.of(
        "POST:/api/ess/profile/photo",               new int[]{5,   3600_000},  // 5 / hour
        "POST:/api/ess/profile/qualifications/document", new int[]{10, 3600_000},  // 10 / hour
        "POST:/api/ess/profile/change-request",       new int[]{20,  3600_000},  // 20 / hour
        "GET:/api/ess/payslips/download",             new int[]{30,  3600_000},  // 30 / hour
        "PUT:/api/ess/notifications/read-all",        new int[]{10,  60_000}     // 10 / minute
    );

    /** Sliding window buckets: key → { count, windowStart } */
    private final ConcurrentHashMap<String, long[]> buckets = new ConcurrentHashMap<>();

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        String matchedKey = matchRateLimit(req);
        if (matchedKey != null) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userId = auth != null && auth.getName() != null ? auth.getName() : req.getRemoteAddr();
            String bucketKey = userId + ":" + matchedKey;

            int[] limits = RATE_LIMITS.get(matchedKey);
            int maxRequests = limits[0];
            long windowMs = limits[1];

            if (isRateLimited(bucketKey, maxRequests, windowMs)) {
                long retryAfterSec = windowMs / 1000;
                res.setStatus(429);
                res.setHeader("Retry-After", String.valueOf(retryAfterSec));
                res.setContentType("application/json");
                res.getWriter().write("{\"error\":{\"code\":\"RATE_LIMITED\",\"message\":\"Too many requests. Please try again later.\"}}");
                return;
            }
        }

        chain.doFilter(request, response);
    }

    /**
     * Matches a request to a rate limit key, normalising parameterised path segments.
     */
    private String matchRateLimit(HttpServletRequest req) {
        String method = req.getMethod();
        String path = req.getRequestURI();

        // Exact matches
        String exact = method + ":" + path;
        if (RATE_LIMITS.containsKey(exact)) return exact;

        // Parameterised patterns
        if ("POST".equals(method) && path.matches("/api/ess/profile/qualifications/[^/]+/document")) {
            return "POST:/api/ess/profile/qualifications/document";
        }
        if ("GET".equals(method) && path.matches("/api/ess/payslips/[^/]+/download")) {
            return "GET:/api/ess/payslips/download";
        }

        return null;
    }

    /**
     * Sliding window rate limiter. Returns true if the limit is exceeded.
     */
    private boolean isRateLimited(String bucketKey, int maxRequests, long windowMs) {
        long now = System.currentTimeMillis();

        long[] bucket = buckets.compute(bucketKey, (key, existing) -> {
            if (existing == null || now - existing[1] > windowMs) {
                // New window
                return new long[]{1, now};
            }
            // Same window — increment counter
            existing[0]++;
            return existing;
        });

        return bucket[0] > maxRequests;
    }

    /** Periodic cleanup of expired buckets (called externally or via scheduled task). */
    public void cleanupExpiredBuckets() {
        long now = System.currentTimeMillis();
        buckets.entrySet().removeIf(e -> now - e.getValue()[1] > 7_200_000); // 2 hours
    }
}
