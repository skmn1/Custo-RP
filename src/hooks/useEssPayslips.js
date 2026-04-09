import { useState, useCallback, useEffect } from 'react';
import { apiFetch } from '../api/config';

/**
 * useEssPayslips — data fetching for the ESS payslip viewing pages.
 *
 * Fetches /api/ess/payslips (paginated, year-filterable).
 * Handles the `restricted` flag when the org disables salary visibility.
 * Also exposes helpers for fetching a single payslip detail and the latest summary.
 */
export function useEssPayslips() {
  const [payslips, setPayslips] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 12, total: 0, hasNextPage: false });
  const [year, setYear] = useState(null); // null = all years
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [restricted, setRestricted] = useState(false);

  // Detail state (for individual payslip page)
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  // Latest payslip summary (for dashboard widget)
  const [latest, setLatest] = useState(null);

  // ── List payslips ─────────────────────────────────────────

  const fetchPayslips = useCallback(async (page = 1, pageSize = 12, yearFilter = year) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (yearFilter) params.set('year', String(yearFilter));
      const res = await apiFetch(`/ess/payslips?${params}`);

      if (res.restricted) {
        setRestricted(true);
        setPayslips([]);
        setPagination({ page: 1, pageSize, total: 0, hasNextPage: false });
        return;
      }

      setRestricted(false);
      setPayslips(res.data || []);
      setPagination(res.pagination || { page, pageSize, total: 0, hasNextPage: false });
    } catch (err) {
      setError(err.message || 'Failed to load payslips');
    } finally {
      setLoading(false);
    }
  }, [year]);

  // ── Fetch single detail ────────────────────────────────────

  const fetchDetail = useCallback(async (id) => {
    setDetailLoading(true);
    setDetailError(null);
    setDetail(null);
    try {
      const res = await apiFetch(`/ess/payslips/${encodeURIComponent(id)}`);

      if (res.restricted) {
        setRestricted(true);
        return;
      }

      setDetail(res.data || null);
    } catch (err) {
      setDetailError(err.message || 'Failed to load payslip detail');
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // ── Latest payslip (dashboard widget) ──────────────────────

  const fetchLatest = useCallback(async () => {
    try {
      const res = await apiFetch('/ess/payslips/latest');
      setLatest(res.data || null);
    } catch {
      // non-critical — silently ignore
    }
  }, []);

  // ── Year change handler ────────────────────────────────────

  const handleYearChange = useCallback((newYear) => {
    setYear(newYear);
  }, []);

  // Auto-fetch on mount and when year changes
  useEffect(() => {
    fetchPayslips(1, pagination.pageSize, year);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  return {
    // List
    payslips,
    pagination,
    isLoading,
    error,
    restricted,
    year,
    setYear: handleYearChange,
    fetchPayslips,

    // Detail
    detail,
    detailLoading,
    detailError,
    fetchDetail,

    // Latest
    latest,
    fetchLatest,
  };
}
