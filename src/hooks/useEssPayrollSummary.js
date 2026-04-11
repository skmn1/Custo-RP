import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../api/config';

/**
 * useEssPayrollSummary — fetches the employee payroll summary dashboard data.
 *
 * Calls GET /api/ess/payslips/summary
 * Expected response shape:
 *   {
 *     ytdGross: number,          // Year-to-date gross earnings
 *     ytdPeriod: string,         // e.g. "Jan – Apr 2026"
 *     ytdPaidMonths: number,     // How many payslips processed this year
 *     currentPayslip: {
 *       id: string,
 *       period: string,          // e.g. "March 2026"
 *       netPay: number,
 *       grossPay: number,
 *       status: string,          // e.g. "Processed"
 *     },
 *     recentActivity: Array<{
 *       icon: string,
 *       label: string,
 *       date: string,
 *       amount: number,
 *     }>,
 *   }
 */
export function useEssPayrollSummary() {
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/ess/payslips/summary');
      setData(res.data ?? res ?? null);
    } catch (err) {
      setError(err.message || 'Failed to load payroll summary');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { data, isLoading, error, refetch: fetchSummary };
}
