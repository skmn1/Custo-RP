-- Seed data for Staff Scheduler Pro (from existing frontend mock data)

-- ══════════════════════════════════════════════════════
-- Point of Sale locations
-- ══════════════════════════════════════════════════════
INSERT INTO point_of_sale (id, name, address, type, phone, manager_id, manager_name, opening_hours, is_active, created_at, updated_at) VALUES
(1, 'Downtown Butcher Shop', '123 Main St, Downtown', 'BUTCHER', '(555) 123-4567', 'emp7', 'Jane Smith',
 '{"monday":{"open":"08:00","close":"20:00","closed":false},"tuesday":{"open":"08:00","close":"20:00","closed":false},"wednesday":{"open":"08:00","close":"20:00","closed":false},"thursday":{"open":"08:00","close":"20:00","closed":false},"friday":{"open":"08:00","close":"22:00","closed":false},"saturday":{"open":"09:00","close":"18:00","closed":false},"sunday":{"open":null,"close":null,"closed":true}}',
 true, '2026-01-15T10:00:00Z', '2026-02-20T14:30:00Z'),
(2, 'Westside Grocery', '456 Oak Ave, Westside District', 'GROCERY', '(555) 234-5678', 'emp8', 'John Doe',
 '{"monday":{"open":"07:00","close":"21:00","closed":false},"tuesday":{"open":"07:00","close":"21:00","closed":false},"wednesday":{"open":"07:00","close":"21:00","closed":false},"thursday":{"open":"07:00","close":"21:00","closed":false},"friday":{"open":"07:00","close":"22:00","closed":false},"saturday":{"open":"08:00","close":"20:00","closed":false},"sunday":{"open":"10:00","close":"18:00","closed":false}}',
 true, '2026-01-20T09:00:00Z', '2026-02-18T11:00:00Z'),
(3, 'Central Fast Food Outlet', '789 Elm Blvd, City Center', 'FAST_FOOD', '(555) 345-6789', 'emp9', 'Alice Brown',
 '{"monday":{"open":"10:00","close":"23:00","closed":false},"tuesday":{"open":"10:00","close":"23:00","closed":false},"wednesday":{"open":"10:00","close":"23:00","closed":false},"thursday":{"open":"10:00","close":"23:00","closed":false},"friday":{"open":"10:00","close":"00:00","closed":false},"saturday":{"open":"10:00","close":"00:00","closed":false},"sunday":{"open":"11:00","close":"22:00","closed":false}}',
 true, '2026-02-01T08:00:00Z', '2026-02-25T16:45:00Z'),
(4, 'Northgate Mixed Store', '321 Pine Rd, Northgate', 'MIXED', '(555) 456-7890', NULL, NULL,
 '{"monday":{"open":"08:00","close":"19:00","closed":false},"tuesday":{"open":"08:00","close":"19:00","closed":false},"wednesday":{"open":"08:00","close":"19:00","closed":false},"thursday":{"open":"08:00","close":"19:00","closed":false},"friday":{"open":"08:00","close":"20:00","closed":false},"saturday":{"open":"09:00","close":"17:00","closed":false},"sunday":{"open":null,"close":null,"closed":true}}',
 true, '2026-02-05T12:00:00Z', NULL),
(5, 'Riverside Butcher', '654 River Ln, Riverside', 'BUTCHER', '(555) 567-8901', 'emp7', 'Jane Smith',
 '{"monday":{"open":"07:00","close":"18:00","closed":false},"tuesday":{"open":"07:00","close":"18:00","closed":false},"wednesday":{"open":"07:00","close":"18:00","closed":false},"thursday":{"open":"07:00","close":"18:00","closed":false},"friday":{"open":"07:00","close":"18:00","closed":false},"saturday":{"open":"08:00","close":"14:00","closed":false},"sunday":{"open":null,"close":null,"closed":true}}',
 false, '2026-01-10T10:00:00Z', '2026-02-15T09:00:00Z');

-- ══════════════════════════════════════════════════════
-- Employees (from src/data/employees.js with new fields)
-- ══════════════════════════════════════════════════════
INSERT INTO employees (id, name, email, phone, role, department, hourly_rate, max_hours, status, avatar, color, hire_date, pos_id, is_manager, created_at, updated_at) VALUES
('emp1',  'Sarah Johnson',   'sarah.johnson@company.com',    '(555) 111-0001', 'Sales Associate',   'Sales',          15.50, 40, 'active', 'SJ', 'bg-blue-500',   '2025-06-01', 1, false, '2026-01-15T10:00:00', '2026-02-20T14:30:00'),
('emp2',  'Michael Chen',    'michael.chen@company.com',     '(555) 111-0002', 'Stock Clerk',        'Warehouse',      16.00, 50, 'active', 'MC', 'bg-green-500',  '2025-05-15', 1, false, '2026-01-15T10:00:00', '2026-02-20T14:30:00'),
('emp3',  'Emily Rodriguez', 'emily.rodriguez@company.com',  '(555) 111-0003', 'Cashier',            'Sales',          14.50, 36, 'active', 'ER', 'bg-purple-500', '2025-07-20', 2, false, '2026-01-15T10:00:00', '2026-02-20T14:30:00'),
('emp4',  'David Wilson',    'david.wilson@company.com',     '(555) 111-0004', 'Deli Clerk',         'Production',     17.00, 40, 'active', 'DW', 'bg-orange-500', '2025-04-10', 2, false, '2026-01-15T10:00:00', '2026-02-20T14:30:00'),
('emp5',  'Lisa Thompson',   'lisa.thompson@company.com',    '(555) 111-0005', 'Administrator',      'Administration', 18.00, 40, 'active', 'LT', 'bg-pink-500',   '2025-03-01', 3, false, '2026-01-15T10:00:00', '2026-02-20T14:30:00'),
('emp6',  'James Park',      'james.park@company.com',       '(555) 111-0006', 'Cook',               'Kitchen',        19.50, 45, 'active', 'JP', 'bg-indigo-500', '2025-02-15', 3, false, '2026-01-15T10:00:00', '2026-02-20T14:30:00'),
('emp7',  'Jane Smith',      'jane.smith@company.com',       '(555) 111-0007', 'Store Manager',      'Management',     24.00, 45, 'active', 'JS', 'bg-rose-500',   '2024-01-10', 1, true,  '2026-01-15T10:00:00', '2026-02-20T14:30:00'),
('emp8',  'John Doe',        'john.doe@company.com',         '(555) 111-0008', 'Store Manager',      'Management',     24.00, 45, 'active', 'JD', 'bg-teal-500',   '2024-03-15', 2, true,  '2026-01-15T10:00:00', '2026-02-20T14:30:00'),
('emp9',  'Alice Brown',     'alice.brown@company.com',      '(555) 111-0009', 'Store Manager',      'Management',     24.00, 45, 'active', 'AB', 'bg-amber-500',  '2024-02-01', 3, true,  '2026-01-15T10:00:00', '2026-02-20T14:30:00'),
('emp10', 'Robert Taylor',   'robert.taylor@company.com',    '(555) 111-0010', 'Cashier',            'Sales',          14.50, 35, 'active', 'RT', 'bg-cyan-500',   '2025-09-01', 4, false, '2026-01-15T10:00:00', '2026-02-20T14:30:00'),
('emp11', 'Maria Garcia',    'maria.garcia@company.com',     '(555) 111-0011', 'Assistant Manager',  'Management',     21.00, 40, 'active', 'MG', 'bg-violet-500', '2024-11-15', 4, true,  '2026-01-15T10:00:00', '2026-02-20T14:30:00'),
('emp12', 'Thomas Wright',   'thomas.wright@company.com',    '(555) 111-0012', 'Butcher',            'Production',     18.50, 40, 'active', 'TW', 'bg-red-500',    '2025-08-20', 1, false, '2026-01-15T10:00:00', '2026-02-20T14:30:00');

-- ══════════════════════════════════════════════════════
-- Shifts (from src/data/shifts.js — week of 2026-03-02, Monday)
-- Day mapping: 0=Monday 2026-03-02 .. 6=Sunday 2026-03-08
-- ══════════════════════════════════════════════════════
INSERT INTO shifts (id, employee_id, date, day_index, start_time, end_time, duration, type, department, notes, created_at, updated_at) VALUES
('shift1',  'emp1', '2026-03-02', 0, '06:00', '14:00', 8,  'Morning',  'Sales',          'Regular shift',  '2026-02-28T09:00:00', '2026-02-28T09:00:00'),
('shift2',  'emp1', '2026-03-04', 2, '06:00', '14:00', 8,  'Morning',  'Sales',          'Regular shift',  '2026-02-28T09:00:00', '2026-02-28T09:00:00'),
('shift3',  'emp1', '2026-03-06', 4, '14:00', '22:00', 8,  'Evening',  'Sales',          'Regular shift',  '2026-02-28T09:00:00', '2026-02-28T09:00:00'),
('shift4',  'emp2', '2026-03-03', 1, '08:00', '18:00', 10, 'Day',      'Warehouse',      'Stock inventory', '2026-02-28T09:00:00', '2026-02-28T09:00:00'),
('shift5',  'emp2', '2026-03-05', 3, '08:00', '18:00', 10, 'Day',      'Warehouse',      'Stock inventory', '2026-02-28T09:00:00', '2026-02-28T09:00:00'),
('shift6',  'emp3', '2026-03-02', 0, '22:00', '06:00', 8,  'Night',    'Sales',          'Night audit',    '2026-02-28T09:00:00', '2026-02-28T09:00:00'),
('shift7',  'emp3', '2026-03-04', 2, '14:00', '22:00', 8,  'Evening',  'Sales',          'Regular shift',  '2026-02-28T09:00:00', '2026-02-28T09:00:00'),
('shift8',  'emp4', '2026-03-03', 1, '07:00', '15:00', 8,  'Day',      'Production',     'Deli prep',      '2026-02-28T09:00:00', '2026-02-28T09:00:00'),
('shift9',  'emp4', '2026-03-05', 3, '07:00', '15:00', 8,  'Day',      'Production',     'Deli prep',      '2026-02-28T09:00:00', '2026-02-28T09:00:00'),
('shift10', 'emp5', '2026-03-02', 0, '09:00', '17:00', 8,  'Admin',    'Administration', 'Regular shift',  '2026-02-28T09:00:00', '2026-02-28T09:00:00'),
('shift11', 'emp5', '2026-03-04', 2, '09:00', '17:00', 8,  'Admin',    'Administration', 'Regular shift',  '2026-02-28T09:00:00', '2026-02-28T09:00:00'),
('shift12', 'emp6', '2026-03-03', 1, '10:00', '18:00', 8,  'Day',      'Kitchen',        'Prep cooking',   '2026-02-28T09:00:00', '2026-02-28T09:00:00');

-- Reset the auto-increment for POS after explicit ID inserts
ALTER TABLE point_of_sale ALTER COLUMN id RESTART WITH 6;