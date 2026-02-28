/**
 * Mock PoS data for development.
 * In production, this data comes from the Spring Boot backend API.
 */

import { initialEmployees } from './employees';

let nextId = 6;
let nextEmpId = 13;

export const initialPosData = [
  {
    id: 1,
    name: 'Downtown Butcher Shop',
    address: '123 Main St, Downtown',
    type: 'BUTCHER',
    phone: '(555) 123-4567',
    managerId: 'emp7',
    managerName: 'Jane Smith',
    openingHours: {
      monday: { open: '08:00', close: '20:00', closed: false },
      tuesday: { open: '08:00', close: '20:00', closed: false },
      wednesday: { open: '08:00', close: '20:00', closed: false },
      thursday: { open: '08:00', close: '20:00', closed: false },
      friday: { open: '08:00', close: '22:00', closed: false },
      saturday: { open: '09:00', close: '18:00', closed: false },
      sunday: { open: null, close: null, closed: true },
    },
    isActive: true,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-02-20T14:30:00Z',
  },
  {
    id: 2,
    name: 'Westside Grocery',
    address: '456 Oak Ave, Westside District',
    type: 'GROCERY',
    phone: '(555) 234-5678',
    managerId: 'emp8',
    managerName: 'John Doe',
    openingHours: {
      monday: { open: '07:00', close: '21:00', closed: false },
      tuesday: { open: '07:00', close: '21:00', closed: false },
      wednesday: { open: '07:00', close: '21:00', closed: false },
      thursday: { open: '07:00', close: '21:00', closed: false },
      friday: { open: '07:00', close: '22:00', closed: false },
      saturday: { open: '08:00', close: '20:00', closed: false },
      sunday: { open: '10:00', close: '18:00', closed: false },
    },
    isActive: true,
    createdAt: '2026-01-20T09:00:00Z',
    updatedAt: '2026-02-18T11:00:00Z',
  },
  {
    id: 3,
    name: 'Central Fast Food Outlet',
    address: '789 Elm Blvd, City Center',
    type: 'FAST_FOOD',
    phone: '(555) 345-6789',
    managerId: 'emp9',
    managerName: 'Alice Brown',
    openingHours: {
      monday: { open: '10:00', close: '23:00', closed: false },
      tuesday: { open: '10:00', close: '23:00', closed: false },
      wednesday: { open: '10:00', close: '23:00', closed: false },
      thursday: { open: '10:00', close: '23:00', closed: false },
      friday: { open: '10:00', close: '00:00', closed: false },
      saturday: { open: '10:00', close: '00:00', closed: false },
      sunday: { open: '11:00', close: '22:00', closed: false },
    },
    isActive: true,
    createdAt: '2026-02-01T08:00:00Z',
    updatedAt: '2026-02-25T16:45:00Z',
  },
  {
    id: 4,
    name: 'Northgate Mixed Store',
    address: '321 Pine Rd, Northgate',
    type: 'MIXED',
    phone: '(555) 456-7890',
    managerId: null,
    managerName: null,
    openingHours: {
      monday: { open: '08:00', close: '19:00', closed: false },
      tuesday: { open: '08:00', close: '19:00', closed: false },
      wednesday: { open: '08:00', close: '19:00', closed: false },
      thursday: { open: '08:00', close: '19:00', closed: false },
      friday: { open: '08:00', close: '20:00', closed: false },
      saturday: { open: '09:00', close: '17:00', closed: false },
      sunday: { open: null, close: null, closed: true },
    },
    isActive: true,
    createdAt: '2026-02-05T12:00:00Z',
    updatedAt: null,
  },
  {
    id: 5,
    name: 'Riverside Butcher',
    address: '654 River Ln, Riverside',
    type: 'BUTCHER',
    phone: '(555) 567-8901',
    managerId: 'emp7',
    managerName: 'Jane Smith',
    openingHours: {
      monday: { open: '07:00', close: '18:00', closed: false },
      tuesday: { open: '07:00', close: '18:00', closed: false },
      wednesday: { open: '07:00', close: '18:00', closed: false },
      thursday: { open: '07:00', close: '18:00', closed: false },
      friday: { open: '07:00', close: '18:00', closed: false },
      saturday: { open: '08:00', close: '14:00', closed: false },
      sunday: { open: null, close: null, closed: true },
    },
    isActive: false,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-02-15T09:00:00Z',
  },
];

/**
 * Mock dashboard extra data for PoS detail views (non-employee fields).
 */
const dashboardExtra = {
  1: { shiftsToday: 5, lastInventoryDate: '2026-02-25', lowStockAlerts: 3 },
  2: { shiftsToday: 3, lastInventoryDate: '2026-02-27', lowStockAlerts: 0 },
  3: { shiftsToday: 7, lastInventoryDate: '2026-02-20', lowStockAlerts: 5 },
  4: { shiftsToday: 2, lastInventoryDate: null, lowStockAlerts: 0 },
  5: { shiftsToday: 0, lastInventoryDate: '2026-01-30', lowStockAlerts: 1 },
};

/**
 * Simulated API service for PoS CRUD operations.
 * Mirrors the Spring Boot REST API contract.
 * Will be replaced by actual fetch() calls when the backend is available.
 */

let posStore = [...initialPosData];
let employeeStore = [...initialEmployees];

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const posApi = {
  /**
   * GET /api/v1/pos
   */
  async list(includeInactive = false) {
    await delay();
    if (includeInactive) {
      return [...posStore];
    }
    return posStore.filter((p) => p.isActive);
  },

  /**
   * GET /api/v1/pos/:id
   */
  async getById(id) {
    await delay();
    const pos = posStore.find((p) => p.id === Number(id));
    if (!pos || !pos.isActive) {
      const err = new Error('PoS not found');
      err.status = 404;
      throw err;
    }
    const posEmployees = employeeStore.filter((e) => e.posId === pos.id);
    const extra = dashboardExtra[pos.id] || { shiftsToday: 0, lastInventoryDate: null, lowStockAlerts: 0 };
    return {
      ...pos,
      employees: posEmployees,
      dashboard: {
        employeeCount: posEmployees.length,
        ...extra,
      },
    };
  },

  /**
   * POST /api/v1/pos
   */
  async create(data) {
    await delay();
    // Validate required fields
    if (!data.name || !data.address || !data.type) {
      const err = new Error('Missing required fields: name, address, and type are required');
      err.status = 400;
      throw err;
    }
    if (!['BUTCHER', 'GROCERY', 'FAST_FOOD', 'MIXED'].includes(data.type)) {
      const err = new Error('Invalid type. Must be one of: BUTCHER, GROCERY, FAST_FOOD, MIXED');
      err.status = 400;
      throw err;
    }
    // Check duplicate name
    const duplicate = posStore.find(
      (p) => p.name.toLowerCase() === data.name.toLowerCase() && p.isActive
    );
    if (duplicate) {
      const err = new Error(`A PoS with the name "${data.name}" already exists`);
      err.status = 409;
      throw err;
    }

    const newPos = {
      id: nextId++,
      name: data.name,
      address: data.address,
      type: data.type,
      phone: data.phone || null,
      managerId: data.managerId || null,
      managerName: data.managerName || null,
      openingHours: data.openingHours,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: null,
    };
    posStore.push(newPos);
    return newPos;
  },

  /**
   * PUT /api/v1/pos/:id
   */
  async update(id, data) {
    await delay();
    const index = posStore.findIndex((p) => p.id === Number(id));
    if (index === -1 || !posStore[index].isActive) {
      const err = new Error('PoS not found');
      err.status = 404;
      throw err;
    }
    // Check duplicate name (excluding self)
    if (data.name) {
      const duplicate = posStore.find(
        (p) =>
          p.id !== Number(id) &&
          p.name.toLowerCase() === data.name.toLowerCase() &&
          p.isActive
      );
      if (duplicate) {
        const err = new Error(`A PoS with the name "${data.name}" already exists`);
        err.status = 409;
        throw err;
      }
    }

    posStore[index] = {
      ...posStore[index],
      ...data,
      id: posStore[index].id,
      isActive: posStore[index].isActive,
      createdAt: posStore[index].createdAt,
      updatedAt: new Date().toISOString(),
    };
    return { ...posStore[index] };
  },

  /**
   * DELETE /api/v1/pos/:id (soft-delete)
   */
  async delete(id) {
    await delay();
    const index = posStore.findIndex((p) => p.id === Number(id));
    if (index === -1 || !posStore[index].isActive) {
      const err = new Error('PoS not found or already inactive');
      err.status = 404;
      throw err;
    }
    posStore[index].isActive = false;
    posStore[index].updatedAt = new Date().toISOString();
  },

  // ── Employee operations scoped to a PoS ──

  /**
   * GET /api/v1/pos/:posId/employees
   */
  async listEmployees(posId) {
    await delay();
    return employeeStore.filter((e) => e.posId === Number(posId));
  },

  /**
   * Get all employees flagged as managers (for manager dropdown)
   */
  async listManagers() {
    await delay();
    return employeeStore.filter((e) => e.isManager);
  },

  /**
   * POST /api/v1/pos/:posId/employees
   */
  async addEmployee(posId, data) {
    await delay();
    const avatar = data.name
      ? data.name.split(' ').map((n) => n.charAt(0)).join('').toUpperCase()
      : '??';
    const colors = [
      'bg-blue-500','bg-green-500','bg-purple-500','bg-orange-500',
      'bg-pink-500','bg-indigo-500','bg-red-500','bg-yellow-500',
      'bg-teal-500','bg-cyan-500','bg-rose-500','bg-amber-500','bg-violet-500',
    ];
    const newEmp = {
      id: `emp${nextEmpId++}`,
      name: data.name,
      role: data.role || '',
      avatar,
      color: colors[Math.floor(Math.random() * colors.length)],
      email: data.email || '',
      maxHours: data.maxHours || 40,
      department: data.department || '',
      posId: Number(posId),
      isManager: data.isManager || false,
    };
    employeeStore.push(newEmp);
    return newEmp;
  },

  /**
   * PUT /api/v1/pos/:posId/employees/:empId
   */
  async updateEmployee(posId, empId, data) {
    await delay();
    const idx = employeeStore.findIndex((e) => e.id === empId && e.posId === Number(posId));
    if (idx === -1) {
      const err = new Error('Employee not found in this PoS');
      err.status = 404;
      throw err;
    }
    employeeStore[idx] = {
      ...employeeStore[idx],
      ...data,
      id: employeeStore[idx].id,
      posId: employeeStore[idx].posId,
      avatar: data.name
        ? data.name.split(' ').map((n) => n.charAt(0)).join('').toUpperCase()
        : employeeStore[idx].avatar,
    };
    return { ...employeeStore[idx] };
  },

  /**
   * DELETE /api/v1/pos/:posId/employees/:empId
   */
  async removeEmployee(posId, empId) {
    await delay();
    const idx = employeeStore.findIndex((e) => e.id === empId && e.posId === Number(posId));
    if (idx === -1) {
      const err = new Error('Employee not found in this PoS');
      err.status = 404;
      throw err;
    }
    employeeStore.splice(idx, 1);
  },

  /**
   * Reset store (for testing)
   */
  _reset() {
    posStore = [...initialPosData];
    employeeStore = [...initialEmployees];
    nextId = 6;
    nextEmpId = 13;
  },
};
