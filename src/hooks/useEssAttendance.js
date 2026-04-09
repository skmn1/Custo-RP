import { useState, useCallback, useEffect } from 'react';
import { apiFetch, API_BASE_URL } from '../api/config';

/**
 * useEssAttendance — data fetching for the ESS attendance page.
 *
 * Fetches /api/ess/attendance (date-range, status-filterable)
 * and /api/ess/attendance/summary (aggregate stats).
 * Also exposes a CSV export helper.
 */
export function useEssAttendance() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [period, setPeriod] = useState({ from: null, to: null });
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Fetch attendance records ─────────────────────────────

  const fetchRecords = useCallback(async (from, to, status) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      if (status) params.set('status', status);

      const res = await apiFetch(`/ess/attendance?${params}`);
      setRecords(res.data || []);
      if (res.period) setPeriod(res.period);
    } catch (err) {
      setError(err.message || 'Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch summary ────────────────────────────────────────

  const fetchSummary = useCallback(async (from, to) => {
    try {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);

      const res = await apiFetch(`/ess/attendance/summary?${params}`);
      setSummary(res.data || null);
    } catch (err) {
      // Summary errors are non-blocking
      console.error('Failed to load attendance summary:', err);
    }
  }, []);

  // ── Combined fetch ───────────────────────────────────────

  const fetchAll = useCallback(async (from, to, status) => {
    await Promise.all([
      fetchRecords(from, to, status),
      fetchSummary(from, to),
    ]);
  }, [fetchRecords, fetchSummary]);

  // ── CSV export ───────────────────────────────────────────

  const exportCsv = useCallback(async (from, to) => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);

    const token = localStorage.getItem('token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/ess/attendance/export?${params}`, { headers });
    if (!res.ok) throw new Error('Export failed');

    const blob = await res.blob();
    const disposition = res.headers.get('Content-Disposition') || '';
    const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
    const filename = filenameMatch ? filenameMatch[1] : 'attendance-export.csv';

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  // ── Initial load (current month) ────────────────────────

  useEffect(() => {
    fetchAll(null, null, '');
  }, [fetchAll]);

  return {
    records,
    summary,
    period,
    statusFilter,
    setStatusFilter,
    isLoading,
    error,
    fetchAll,
    exportCsv,
  };
}
