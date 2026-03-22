import { api, API_BASE_URL } from './config';

/**
 * Payroll API client — mirrors the REST controller at /api/payroll.
 */
export const payrollApi = {
  /** Get payroll summary for a date range. */
  summary: (startDate, endDate) =>
    api.get(`/payroll/summary?startDate=${startDate}&endDate=${endDate}`),

  /** Get per-employee payroll breakdown. */
  employees: (startDate, endDate) =>
    api.get(`/payroll/employees?startDate=${startDate}&endDate=${endDate}`),

  /** Get department-level payroll breakdown. */
  departments: (startDate, endDate) =>
    api.get(`/payroll/departments?startDate=${startDate}&endDate=${endDate}`),

  /** Get payroll statistics. */
  statistics: (startDate, endDate) =>
    api.get(`/payroll/statistics?startDate=${startDate}&endDate=${endDate}`),

  /** Download CSV export (returns a Blob). */
  exportCsv: async (startDate, endDate) => {
    const url = `${API_BASE_URL}/payroll/export-csv?startDate=${startDate}&endDate=${endDate}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('CSV export failed');
    return res.blob();
  },
};
