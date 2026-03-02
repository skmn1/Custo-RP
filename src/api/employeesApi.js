import { api } from './config';

/**
 * Employee API client — mirrors the REST controller at /api/employees.
 */
export const employeesApi = {
  /** List employees with optional filters. */
  list: ({ search, department, role, sort, order } = {}) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (department) params.set('department', department);
    if (role) params.set('role', role);
    if (sort) params.set('sort', sort);
    if (order) params.set('order', order);
    const qs = params.toString();
    return api.get(`/employees${qs ? `?${qs}` : ''}`);
  },

  /** Get a single employee by ID. */
  getById: (id) => api.get(`/employees/${id}`),

  /** Create a new employee. */
  create: (data) => api.post('/employees', data),

  /** Update an employee. */
  update: (id, data) => api.put(`/employees/${id}`, data),

  /** Delete an employee. */
  delete: (id) => api.delete(`/employees/${id}`),

  /** Get all unique departments. */
  departments: () => api.get('/employees/departments'),

  /** Get all unique roles. */
  roles: () => api.get('/employees/roles'),
};
