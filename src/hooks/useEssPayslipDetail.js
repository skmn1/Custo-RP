import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../api/config';

/**
 * useEssPayslipDetail — fetches a single payslip by ID.
 *
 * Calls GET /api/ess/payslips/:id
 * Returns the full payslip detail object: grossPay, netPay, baseSalary,
 * overtime, bonuses, deductions[], employerContributions[], payPeriod,
 * payDate, status, period, totalDeductions, overtimeHours.
 */
export function useEssPayslipDetail(id) {
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDetail = useCallback(async (payslipId) => {
    if (!payslipId) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await apiFetch(`/ess/payslips/${encodeURIComponent(payslipId)}`);
      if (res.restricted) {
        setError('restricted');
        return;
      }
      setData(res.data ?? null);
    } catch (err) {
      setError(err.message || 'Failed to load payslip');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDetail(id);
  }, [id, fetchDetail]);

  return { data, isLoading, error, refetch: () => fetchDetail(id) };
}
