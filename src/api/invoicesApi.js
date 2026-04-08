import { api, apiFetch, API_BASE_URL } from './config';

export const invoicesApi = {
  list: (params = {}) => {
    const q = new URLSearchParams();
    if (params.status) q.set('status', params.status);
    if (params.supplier) q.set('supplier', params.supplier);
    if (params.dateFrom) q.set('dateFrom', params.dateFrom);
    if (params.dateTo) q.set('dateTo', params.dateTo);
    const qs = q.toString();
    return api.get(`/invoices${qs ? `?${qs}` : ''}`);
  },

  getById: (id) => api.get(`/invoices/${id}`),

  create: (data) => api.post('/invoices', data),

  update: (id, data) => api.put(`/invoices/${id}`, data),

  approve: (id) => api.post(`/invoices/${id}/approve`),

  recordPayment: (id, data) => api.post(`/invoices/${id}/payments`, data),

  duplicate: (id) => api.post(`/invoices/${id}/duplicate`),

  exportCsv: async (params = {}) => {
    const q = new URLSearchParams();
    if (params.status) q.set('status', params.status);
    if (params.supplier) q.set('supplier', params.supplier);
    if (params.dateFrom) q.set('dateFrom', params.dateFrom);
    if (params.dateTo) q.set('dateTo', params.dateTo);
    const qs = q.toString();
    const url = `${API_BASE_URL}/invoices/export${qs ? `?${qs}` : ''}`;
    const accessToken = localStorage.getItem('accessToken');
    const res = await fetch(url, {
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });
    if (!res.ok) throw new Error('Export failed');
    const blob = await res.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'invoices-export.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  },

  getApKpis: () => api.get('/dashboard/ap-kpis'),
};
