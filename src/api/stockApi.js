import { api } from './config';

/**
 * Stock API client — mirrors the REST controllers at /api/stock/*.
 */
export const stockApi = {
  // ── Items ──
  items: {
    list: (params = {}) => {
      const q = new URLSearchParams();
      if (params.search) q.set('search', params.search);
      if (params.categoryId) q.set('categoryId', params.categoryId);
      if (params.locationId) q.set('locationId', params.locationId);
      const qs = q.toString();
      return api.get(`/stock/items${qs ? `?${qs}` : ''}`);
    },
    getById: (id) => api.get(`/stock/items/${id}`),
    getBySku: (sku) => api.get(`/stock/items/sku/${sku}`),
    getByBarcode: (barcode) => api.get(`/stock/items/barcode/${barcode}`),
    lowStock: () => api.get('/stock/items/low-stock'),
    reorderQueue: () => api.get('/stock/items/reorder-queue'),
    create: (data) => api.post('/stock/items', data),
    update: (id, data) => api.put(`/stock/items/${id}`, data),
    delete: (id) => api.delete(`/stock/items/${id}`),
    reactivate: (id) => api.patch(`/stock/items/${id}/reactivate`),
    movements: (id) => api.get(`/stock/items/${id}/movements`),
    createMovement: (id, data) => api.post(`/stock/items/${id}/movements`, data),
  },

  // ── Movements ──
  movements: {
    list: (params = {}) => {
      const q = new URLSearchParams();
      if (params.itemId) q.set('itemId', params.itemId);
      if (params.movementType) q.set('movementType', params.movementType);
      if (params.startDate) q.set('startDate', params.startDate);
      if (params.endDate) q.set('endDate', params.endDate);
      const qs = q.toString();
      return api.get(`/stock/movements${qs ? `?${qs}` : ''}`);
    },
    create: (data) => api.post('/stock/movements', data),
    transfer: (params) => {
      const q = new URLSearchParams();
      q.set('itemId', params.itemId);
      q.set('fromLocationId', params.fromLocationId);
      q.set('toLocationId', params.toLocationId);
      q.set('qty', params.qty);
      if (params.note) q.set('note', params.note);
      return api.post(`/stock/movements/transfer?${q.toString()}`);
    },
  },

  // ── Categories ──
  categories: {
    listTree: () => api.get('/stock/categories'),
    listFlat: () => api.get('/stock/categories/flat'),
    getById: (id) => api.get(`/stock/categories/${id}`),
    create: (data) => api.post('/stock/categories', data),
    update: (id, data) => api.put(`/stock/categories/${id}`, data),
    delete: (id) => api.delete(`/stock/categories/${id}`),
  },

  // ── Locations ──
  locations: {
    list: () => api.get('/stock/locations'),
    getById: (id) => api.get(`/stock/locations/${id}`),
    create: (data) => api.post('/stock/locations', data),
    update: (id, data) => api.put(`/stock/locations/${id}`, data),
    delete: (id) => api.delete(`/stock/locations/${id}`),
  },

  // ── Suppliers ──
  suppliers: {
    list: () => api.get('/suppliers'),
    getById: (id) => api.get(`/suppliers/${id}`),
    create: (data) => api.post('/suppliers', data),
    update: (id, data) => api.put(`/suppliers/${id}`, data),
    delete: (id) => api.delete(`/suppliers/${id}`),
  },

  // ── Purchase Orders ──
  purchaseOrders: {
    list: () => api.get('/purchase-orders'),
    listByStatus: (status) => api.get(`/purchase-orders?status=${status}`),
    getById: (id) => api.get(`/purchase-orders/${id}`),
    create: (data) => api.post('/purchase-orders', data),
    update: (id, data) => api.put(`/purchase-orders/${id}`, data),
    submit: (id) => api.patch(`/purchase-orders/${id}/submit`),
    receiveLine: (poId, lineId, params) => {
      const q = new URLSearchParams();
      q.set('qtyReceived', params.qtyReceived);
      if (params.batchNumber) q.set('batchNumber', params.batchNumber);
      if (params.lotNumber) q.set('lotNumber', params.lotNumber);
      return api.patch(`/purchase-orders/${poId}/lines/${lineId}/receive?${q.toString()}`);
    },
    cancel: (id) => api.patch(`/purchase-orders/${id}/cancel`),
  },

  // ── Stocktakes ──
  stocktakes: {
    list: () => api.get('/stock/stocktakes'),
    getById: (id) => api.get(`/stock/stocktakes/${id}`),
    start: (data) => api.post('/stock/stocktakes', data),
    submitCount: (sessionId, itemId, countedQty) =>
      api.patch(`/stock/stocktakes/${sessionId}/count?itemId=${itemId}&countedQty=${countedQty}`),
    finalise: (id) => api.patch(`/stock/stocktakes/${id}/finalise`),
  },

  // ── KPI ──
  kpi: () => api.get('/stock/kpi'),
};
