import { api } from './config';

export const accountingApi = {
  getCashFlowProjection: (days = 60) => api.get(`/accounting/cash-flow-projection?days=${days}`),

  getPayments: (params = {}) => {
    const q = new URLSearchParams();
    if (params.dateFrom) q.set('dateFrom', params.dateFrom);
    if (params.dateTo) q.set('dateTo', params.dateTo);
    if (params.type) q.set('type', params.type);
    if (params.method) q.set('method', params.method);
    const qs = q.toString();
    return api.get(`/accounting/payments${qs ? `?${qs}` : ''}`);
  },

  getRevenueReport: () => api.get('/accounting/reports/revenue'),
  getExpenseReport: () => api.get('/accounting/reports/expenses'),
  getTaxSummary: () => api.get('/accounting/reports/tax-summary'),

  getSettings: () => api.get('/accounting/settings'),
  updateSettings: (settings) => api.put('/accounting/settings', settings),
};
