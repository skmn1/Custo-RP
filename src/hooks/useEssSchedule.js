import { useState, useCallback, useEffect } from 'react';
import { apiFetch } from '../api/config';

// ─── Date helpers ────────────────────────────────────────────────────────────

/** Returns a UTC-safe ISO date string "YYYY-MM-DD" from a Date object. */
function fmt(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Returns the Monday of the ISO week containing `date`. */
export function getWeekStart(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dow = d.getDay(); // 0=Sun
  const diff = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + diff);
  return d;
}

/** Returns the Sunday following the given Monday. */
export function getWeekEnd(weekStart) {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + 6);
  return d;
}

/** Returns the first day of the month containing `date`. */
export function getMonthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/** Returns the last day of the month containing `date`. */
export function getMonthEnd(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * Parses an ISO "YYYY-MM-DD" string into a local Date at midnight.
 * Avoids timezone offset surprises that come with `new Date("YYYY-MM-DD")`.
 */
export function parseDate(str) {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * useEssSchedule — state & data fetching for the ESS read-only schedule page.
 *
 * - Fetches /api/ess/schedule and /api/ess/schedule/leave in parallel.
 * - Fetches /api/ess/schedule/upcoming once on mount.
 * - Handles week / month view modes with separate anchor tracking.
 * - Never passes an employeeId parameter — ownership is enforced server-side.
 */
export function useEssSchedule() {
  const today = new Date();

  // 'week' shows a 7-column grid; 'month' shows a compact month calendar
  const [viewMode, setViewMode] = useState('week');

  // `anchor` is the Monday of the visible week (week mode)
  // or the 1st of the visible month (month mode)
  const [anchor, setAnchor] = useState(() => getWeekStart(today));

  const [shifts, setShifts]   = useState([]);
  const [leave, setLeave]     = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [isCached, setCached] = useState(false);
  const [fetchedAt, setFetchedAt] = useState(null);

  // Compute the date range to fetch based on current view + anchor
  const dateRange = (() => {
    if (viewMode === 'week') {
      return { from: fmt(anchor), to: fmt(getWeekEnd(anchor)) };
    }
    // month view: fetch the full calendar month
    const ms = getMonthStart(anchor);
    const me = getMonthEnd(anchor);
    return { from: fmt(ms), to: fmt(me) };
  })();

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [schedRes, leaveRes] = await Promise.all([
        apiFetch(`/ess/schedule?from=${dateRange.from}&to=${dateRange.to}`),
        apiFetch(`/ess/schedule/leave?from=${dateRange.from}&to=${dateRange.to}`),
      ]);
      setShifts(schedRes?.data?.shifts ?? []);
      setLeave(leaveRes?.data ?? []);
      setCached(schedRes?.__swCacheHit === true || leaveRes?.__swCacheHit === true);
      setFetchedAt((schedRes?.__swCacheHit || leaveRes?.__swCacheHit) ? new Date() : null);
    } catch (e) {
      setError(e);
      setShifts([]);
      setLeave([]);
    } finally {
      setLoading(false);
    }
  }, [dateRange.from, dateRange.to]);

  const fetchUpcoming = useCallback(async () => {
    try {
      const res = await apiFetch('/ess/schedule/upcoming');
      setUpcoming(res?.data ?? []);
    } catch {
      setUpcoming([]);
    }
  }, []);

  // Fetch schedule whenever the visible range changes
  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  // Fetch upcoming shifts once on mount
  useEffect(() => {
    fetchUpcoming();
  }, [fetchUpcoming]);

  // ─── Navigation ───────────────────────────────────────────────

  const navigatePrev = () => {
    setAnchor(prev => {
      const d = new Date(prev);
      if (viewMode === 'week') {
        d.setDate(d.getDate() - 7);
      } else {
        d.setMonth(d.getMonth() - 1);
      }
      return d;
    });
  };

  const navigateNext = () => {
    setAnchor(prev => {
      const d = new Date(prev);
      if (viewMode === 'week') {
        d.setDate(d.getDate() + 7);
      } else {
        d.setMonth(d.getMonth() + 1);
      }
      return d;
    });
  };

  const goToday = () => {
    setAnchor(viewMode === 'week' ? getWeekStart(today) : getMonthStart(today));
  };

  // When switching view modes, re-anchor to the current period
  const handleSetViewMode = (mode) => {
    setViewMode(mode);
    setAnchor(mode === 'week' ? getWeekStart(today) : getMonthStart(today));
  };

  return {
    shifts,
    leave,
    upcoming,
    isLoading,
    error,
    isCached,
    fetchedAt,
    viewMode,
    setViewMode: handleSetViewMode,
    dateRange,
    anchor,
    navigatePrev,
    navigateNext,
    goToday,
  };
}
