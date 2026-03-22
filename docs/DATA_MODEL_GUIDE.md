# Data Model & API Integration Guide

**Staff Scheduler Pro - Frontend ↔ Backend Data Mapping**

---

## Overview

This guide documents how frontend data structures map to database entities and REST API contracts. It ensures consistency across the entire stack.

---

## Data Model Mapping

### Employee Data Flow

#### Frontend (JavaScript)

```javascript
// src/data/employees.js (legacy mock data - no longer used)
{
  id: 'emp1',
  name: 'Sarah Johnson',
  role: 'Sales Associate',
  avatar: 'SJ',
  color: 'bg-blue-500',
  email: 'sarah.johnson@company.com',
  maxHours: 40,
  department: 'Sales',
  posId: 1,
  isManager: false
}
```

#### Database (PostgreSQL)

```sql
-- employees table
id: 'emp1'
name: 'Sarah Johnson'
role: 'Sales Associate'
avatar: 'SJ'
color: 'bg-blue-500'
email: 'sarah.johnson@company.com'
max_hours: 40
department: 'Sales'
pos_id: 1
is_manager: false
hourly_rate: 15.50  -- NEW
status: 'active'     -- NEW
hire_date: '2025-06-01'  -- NEW
phone: '(555) 111-0001'  -- NEW
created_at: '2026-01-15T10:00:00'  -- NEW
updated_at: '2026-02-20T14:30:00'  -- NEW
```

#### REST API (EmployeeDto)

```json
{
  "id": "emp1",
  "name": "Sarah Johnson",
  "email": "sarah.johnson@company.com",
  "phone": "(555) 111-0001",
  "role": "Sales Associate",
  "department": "Sales",
  "hourlyRate": 15.50,
  "maxHours": 40,
  "status": "active",
  "avatar": "SJ",
  "color": "bg-blue-500",
  "hireDate": "2025-06-01",
  "posId": 1,
  "isManager": false,
  "createdAt": "2026-01-15T10:00:00Z",
  "updatedAt": "2026-02-20T14:30:00Z"
}
```

#### Naming Conventions

- **Database:** snake_case (`employee_id`, `hire_date`, `created_at`)
- **Java/API:** camelCase (`employeeId`, `hireDate`, `createdAt`)
- **Frontend:** camelCase (`employeeId`, `hireDate`, `createdAt`)

---

### Shift Data Flow

#### Frontend (JavaScript)

```javascript
// Current (legacy)
{
  id: 'shift1',
  employeeId: 'emp1',
  day: 0,  // 0=Monday, 1=Tuesday, ...
  startTime: '06:00',
  endTime: '14:00',
  duration: 8,
  type: 'Morning',
  color: 'bg-blue-100 border-blue-300 text-blue-800',
  department: 'Sales'
}

// After database migration (improved)
{
  id: 'shift1',
  employeeId: 'emp1',
  date: '2026-03-02',  // Actual date instead of day index
  startTime: '06:00',
  endTime: '14:00',
  duration: 8.0,
  type: 'Morning',
  department: 'Sales',
  notes: 'Regular shift',  // NEW
  createdAt: '2026-02-28T09:00:00Z',  // NEW
  updatedAt: '2026-02-28T09:00:00Z'   // NEW
}
```

#### Database (PostgreSQL)

```sql
-- shifts table
id: 'shift1'
employee_id: 'emp1'
date: '2026-03-02'           -- YYYY-MM-DD format
day_index: 0                 -- Computed: 0=Monday
start_time: '06:00'          -- HH:MM format
end_time: '14:00'            -- HH:MM format
duration: 8.0                -- DECIMAL(4,1)
type: 'Morning'              -- VARCHAR
department: 'Sales'          -- VARCHAR
notes: 'Regular shift'       -- TEXT
created_at: '2026-02-28T09:00:00'
updated_at: '2026-02-28T09:00:00'
```

#### REST API (ShiftDto - Recommended)

```json
{
  "id": "shift1",
  "employeeId": "emp1",
  "date": "2026-03-02",
  "startTime": "06:00",
  "endTime": "14:00",
  "duration": 8.0,
  "type": "Morning",
  "department": "Sales",
  "notes": "Regular shift",
  "createdAt": "2026-02-28T09:00:00Z",
  "updatedAt": "2026-02-28T09:00:00Z"
}
```

---

## Frontend Component Updates

### EmployeeGrid Component

Before:
```javascript
// Uses mock data directly
import { initialEmployees } from '@/data/employees';

const [employees, setEmployees] = useState(initialEmployees);
```

After:
```javascript
// Fetches from API
import { employeesApi } from '@/api/employeesApi';

const [employees, setEmployees] = useState([]);

useEffect(() => {
  employeesApi.getAll().then(setEmployees);
}, []);
```

### StaffScheduler Component

Before:
```javascript
// Uses mock data directly
import { initialShifts } from '@/data/shifts';

const weekStart = new Date(2026, 2, 2); // Fixed week
const shiftsForWeek = initialShifts.filter(s => s.day >= 0 && s.day <= 4);
```

After:
```javascript
// Fetches from API based on date range
import { shiftsApi } from '@/api/shiftsApi';

const [shifts, setShifts] = useState([]);
const weekStart = new Date();
const weekEnd = addDays(weekStart, 7);

useEffect(() => {
  shiftsApi.getByDateRange(weekStart, weekEnd)
    .then(setShifts);
}, [weekStart]);
```

---

## API Endpoints Contract

### Employee Endpoints

#### GET /api/employees

Get all employees with optional filters.

**Request:**
```
GET /api/employees?search=john&role=Manager&sort=name&order=asc
```

**Response:**
```json
[
  {
    "id": "emp1",
    "name": "Sarah Johnson",
    "email": "sarah.johnson@company.com",
    "hourlyRate": 15.50,
    "maxHours": 40,
    "status": "active"
    ...
  }
]
```

#### POST /api/employees

Create new employee.

**Request:**
```json
{
  "name": "New Employee",
  "email": "new@company.com",
  "role": "Cashier",
  "department": "Sales",
  "maxHours": 36,
  "hourlyRate": 14.50
}
```

**Response:** 201 Created
```json
{
  "id": "emp123",
  "name": "New Employee",
  ...
  "createdAt": "2026-03-22T10:00:00Z"
}
```

#### PUT /api/employees/{id}

Update employee.

**Request:**
```json
{
  "hourlyRate": 16.00,
  "status": "inactive"
}
```

**Response:** 200 OK
```json
{
  "id": "emp1",
  "hourlyRate": 16.00,
  "status": "inactive",
  "updatedAt": "2026-03-22T11:00:00Z"
}
```

#### DELETE /api/employees/{id}

Delete employee (cascades to shifts).

**Response:** 204 No Content

### Shift Endpoints

#### GET /api/shifts

Get shifts with optional filters.

**Request:**
```
GET /api/shifts?startDate=2026-03-02&endDate=2026-03-08&employeeId=emp1
```

**Response:**
```json
[
  {
    "id": "shift1",
    "employeeId": "emp1",
    "date": "2026-03-02",
    "startTime": "06:00",
    "endTime": "14:00",
    "duration": 8.0,
    "type": "Morning"
  }
]
```

#### POST /api/shifts

Create new shift.

**Request:**
```json
{
  "employeeId": "emp1",
  "date": "2026-03-23",
  "startTime": "09:00",
  "endTime": "17:00",
  "type": "Regular",
  "department": "Sales"
}
```

**Response:** 201 Created
```json
{
  "id": "shift_new_abc123",
  "employeeId": "emp1",
  "date": "2026-03-23",
  "startTime": "09:00",
  "endTime": "17:00",
  "duration": 8.0,
  "type": "Regular",
  "createdAt": "2026-03-22T10:00:00Z"
}
```

#### PUT /api/shifts/{id}

Update shift.

**Request:**
```json
{
  "startTime": "10:00",
  "endTime": "18:00",
  "notes": "Updated schedule"
}
```

**Response:** 200 OK

#### DELETE /api/shifts/{id}

Delete shift.

**Response:** 204 No Content

### Payroll Endpoints

#### GET /api/payroll/summary

Get payroll summary for date range.

**Request:**
```
GET /api/payroll/summary?startDate=2026-03-02&endDate=2026-03-08
```

**Response:**
```json
{
  "periodStart": "2026-03-02",
  "periodEnd": "2026-03-08",
  "totalEmployees": 12,
  "totalHours": 356.5,
  "totalOvertimeHours": 36.5,
  "totalGrossPay": 5234.50,
  "totalNetPay": 4180.00
}
```

#### GET /api/payroll/employees

Get per-employee payroll breakdown.

**Request:**
```
GET /api/payroll/employees?startDate=2026-03-02&endDate=2026-03-08
```

**Response:**
```json
[
  {
    "employeeId": "emp1",
    "name": "Sarah Johnson",
    "role": "Sales Associate",
    "hourlyRate": 15.50,
    "totalHours": 40.0,
    "regularHours": 40.0,
    "overtimeHours": 0.0,
    "grossPay": 620.00,
    "netPay": 496.00,
    "shifts": [
      {
        "date": "2026-03-02",
        "startTime": "06:00",
        "endTime": "14:00",
        "duration": 8.0
      }
    ]
  }
]
```

---

## Error Handling

### Standard Error Response

```json
{
  "timestamp": "2026-03-22T10:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Email already exists: john@company.com",
  "path": "/api/employees"
}
```

### Common Error Codes

| Status | Error | Cause |
|--------|-------|-------|
| 400 | Bad Request | Invalid input (negative hours, invalid email) |
| 404 | Not Found | Employee/shift doesn't exist |
| 409 | Conflict | Duplicate email or employee already scheduled on date |
| 500 | Internal Server Error | Database connection issues |

---

## Migration from Mock Data to API

### Before (Frontend Mock)

```javascript
// pages/EmployeesPage.jsx
import { initialEmployees } from '@/data/employees';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState(initialEmployees);
  
  // Data persists only in React state, lost on refresh
}
```

### After (API Backend)

```javascript
// pages/EmployeesPage.jsx
import { useEmployees } from '@/hooks/useEmployees';

export default function EmployeesPage() {
  const { employees, loading, error } = useEmployees();
  
  // Data fetched from API, persists in database
  // Survives page refreshes
}
```

### Hook Implementation

```javascript
// hooks/useEmployees.js
import { useState, useEffect } from 'react';
import { employeesApi } from '@/api/employeesApi';

export function useEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    employeesApi.getAll()
      .then(data => {
        setEmployees(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { employees, loading, error };
}
```

---

## Testing Data Models

### Example: Create and Verify Employee

```javascript
// Test: Employee creation persists to database
test('Should create employee and persist to database', async () => {
  const newEmployee = {
    name: 'Test Employee',
    email: 'test@company.com',
    role: 'Tester',
    department: 'QA',
    maxHours: 40,
    hourlyRate: 18.00
  };

  // Create via API
  const created = await employeesApi.create(newEmployee);
  expect(created.id).toBeDefined();
  expect(created.createdAt).toBeDefined();

  // Verify persists (refresh and fetch again)
  const fetched = await employeesApi.getById(created.id);
  expect(fetched).toEqual(created);

  // Verify in database directly
  const dbRecord = await db.queryAsync(
    'SELECT * FROM employees WHERE id = $1',
    [created.id]
  );
  expect(dbRecord.length).toBe(1);
});
```

---

## Summary

**Key Points:**
- ✅ Database uses snake_case naming
- ✅ Java/API uses camelCase naming
- ✅ Frontend uses camelCase naming
- ✅ All timestamps are UTC DateTime
- ✅ All dates are YYYY-MM-DD format
- ✅ All times are HH:MM 24-hour format
- ✅ Foreign keys enforce referential integrity
- ✅ Cascade deletes clean up orphaned records

---

**For database schema details, see [POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md)**
