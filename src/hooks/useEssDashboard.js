import { useState, useCallback, useEffect } from 'react';
import { apiFetch } from '../api/config';

/**
 * useEssDashboard — aggregated data-fetching for the ESS dashboard page.
 *
 * Calls individual ESS sub-endpoints in parallel and combines results.
 * Individual sub-query failures degrade gracefully — the failed section
 * returns null while other sections render normally.
 */
export function useEssDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        meResult,
        upcomingResult,
        latestPayslipResult,
        attendanceResult,
        profileResult,
        unreadCountResult,
        notificationsResult,
      ] = await Promise.all([
        apiFetch('/ess/me').catch(() => null),
        apiFetch('/ess/schedule/upcoming').catch(() => null),
        apiFetch('/ess/payslips/latest').catch(() => null),
        apiFetch('/ess/attendance/summary').catch(() => null),
        apiFetch('/ess/profile').catch(() => null),
        apiFetch('/ess/notifications/unread-count').catch(() => null),
        apiFetch('/ess/notifications?pageSize=5').catch(() => null),
      ]);

      const me = meResult?.data ?? meResult ?? null;
      const upcomingShifts = upcomingResult?.data ?? [];
      const latestPayslip = latestPayslipResult?.data ?? null;
      const payslipRestricted = latestPayslipResult?.restricted === true;
      const attendance = attendanceResult?.data ?? null;
      const profile = profileResult ?? null;
      const unreadNotifications = unreadCountResult?.data?.count ?? 0;
      const notifList = notificationsResult?.data ?? [];

      setNotifications(notifList);
      setDashboard({
        greeting: {
          firstName: me?.firstName ?? '',
          photoUrl: me?.photoUrl ?? me?.avatarUrl ?? null,
          currentDate: new Date().toISOString().split('T')[0],
        },
        upcomingShifts,
        latestPayslip,
        attendance,
        pendingProfileRequests: profile?.pendingRequests ?? 0,
        unreadNotifications,
        profileCompletenessPct: profile?.completeness ?? 0,
        payslipRestricted,
      });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { dashboard, notifications, isLoading, error, refetch: fetchDashboard };
}
