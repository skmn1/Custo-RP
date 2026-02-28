/**
 * Mock PoS data for development.
 * In production, this data comes from the Spring Boot backend API.
 */

let nextId = 6;

export const initialPosData = [
  {
    id: 1,
    name: 'Downtown Butcher Shop',
    address: '123 Main St, Downtown',
    type: 'BUTCHER',
    phone: '(555) 123-4567',
    managerId: 1,
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
    managerId: 2,
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
    managerId: 3,
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
    managerId: 1,
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
 * Mock dashboard data for PoS detail views.
 */
const dashboardData = {
  1: { employeeCount: 12, shiftsToday: 5, lastInventoryDate: '2026-02-25', lowStockAlerts: 3 },
  2: { employeeCount: 8, shiftsToday: 3, lastInventoryDate: '2026-02-27', lowStockAlerts: 0 },
  3: { employeeCount: 15, shiftsToday: 7, lastInventoryDate: '2026-02-20', lowStockAlerts: 5 },
  4: { employeeCount: 6, shiftsToday: 2, lastInventoryDate: null, lowStockAlerts: 0 },
  5: { employeeCount: 4, shiftsToday: 0, lastInventoryDate: '2026-01-30', lowStockAlerts: 1 },
};

/**
 * Simulated API service for PoS CRUD operations.
 * Mirrors the Spring Boot REST API contract.
 * Will be replaced by actual fetch() calls when the backend is available.
 */

let posStore = [...initialPosData];

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
    return {
      ...pos,
      dashboard: dashboardData[pos.id] || {
        employeeCount: 0,
        shiftsToday: 0,
        lastInventoryDate: null,
        lowStockAlerts: 0,
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

  /**
   * Reset store (for testing)
   */
  _reset() {
    posStore = [...initialPosData];
    nextId = 6;
  },
};
