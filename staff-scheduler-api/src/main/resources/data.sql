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
 false, '2026-01-10T10:00:00Z', '2026-02-15T09:00:00Z')
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════════════
-- Employees (from src/data/employees.js with new fields)
-- ══════════════════════════════════════════════════════
INSERT INTO employees (id, name, role, avatar, color, email, phone, max_hours, department, hourly_rate, status, hire_date, pos_id, is_manager, created_at, updated_at) VALUES
('emp1',  'Sarah Johnson',   'Sales Associate',  'SJ', 'bg-blue-500',   'sarah.johnson@company.com',    '(555) 111-0001', 40, 'Sales',          15.50, 'active', '2025-06-01', 1, false, '2026-01-15T10:00:00', '2026-02-20T14:30:00'),
('emp2',  'Michael Chen',    'Stock Clerk',       'MC', 'bg-green-500',  'michael.chen@company.com',     '(555) 111-0002', 50, 'Warehouse',      16.00, 'active', '2025-05-15', 1, false, '2026-01-15T10:00:00', '2026-02-20T14:30:00'),
('emp3',  'Emily Rodriguez', 'Cashier',           'ER', 'bg-purple-500', 'emily.rodriguez@company.com',  '(555) 111-0003', 36, 'Sales',          14.50, 'active', '2025-07-20', 2, false, '2026-01-15T10:00:00', '2026-02-20T14:30:00'),
('emp4',  'David Wilson',    'Deli Clerk',        'DW', 'bg-orange-500', 'david.wilson@company.com',     '(555) 111-0004', 40, 'Production',     17.00, 'active', '2025-04-10', 2, false, '2026-01-15T10:00:00', '2026-02-20T14:30:00'),
('emp5',  'Lisa Thompson',   'Administrator',     'LT', 'bg-pink-500',   'lisa.thompson@company.com',    '(555) 111-0005', 40, 'Administration', 18.00, 'active', '2025-03-01', 3, false, '2026-01-15T10:00:00', '2026-02-20T14:30:00'),
('emp6',  'James Park',      'Cook',              'JP', 'bg-indigo-500', 'james.park@company.com',       '(555) 111-0006', 45, 'Kitchen',        19.50, 'active', '2025-02-15', 3, false, '2026-01-15T10:00:00', '2026-02-20T14:30:00'),
('emp7',  'Jane Smith',      'Store Manager',     'JS', 'bg-rose-500',   'jane.smith@company.com',       '(555) 111-0007', 45, 'Management',     24.00, 'active', '2024-01-10', 1, true,  '2026-01-15T10:00:00', '2026-02-20T14:30:00'),
('emp8',  'John Doe',        'Store Manager',     'JD', 'bg-teal-500',   'john.doe@company.com',         '(555) 111-0008', 45, 'Management',     24.00, 'active', '2024-03-15', 2, true,  '2026-01-15T10:00:00', '2026-02-20T14:30:00'),
('emp9',  'Alice Brown',     'Store Manager',     'AB', 'bg-amber-500',  'alice.brown@company.com',      '(555) 111-0009', 45, 'Management',     24.00, 'active', '2024-02-01', 3, true,  '2026-01-15T10:00:00', '2026-02-20T14:30:00'),
('emp10', 'Robert Taylor',   'Cashier',           'RT', 'bg-cyan-500',   'robert.taylor@company.com',    '(555) 111-0010', 35, 'Sales',          14.50, 'active', '2025-09-01', 4, false, '2026-01-15T10:00:00', '2026-02-20T14:30:00'),
('emp11', 'Maria Garcia',    'Assistant Manager', 'MG', 'bg-violet-500', 'maria.garcia@company.com',     '(555) 111-0011', 40, 'Management',     21.00, 'active', '2024-11-15', 4, true,  '2026-01-15T10:00:00', '2026-02-20T14:30:00'),
('emp12', 'Thomas Wright',   'Butcher',           'TW', 'bg-red-500',    'thomas.wright@company.com',    '(555) 111-0012', 40, 'Production',     18.50, 'active', '2025-08-20', 1, false, '2026-01-15T10:00:00', '2026-02-20T14:30:00')
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════════════
-- Shifts (from src/data/shifts.js — week of 2026-03-02, Monday)
-- Day mapping: 0=Monday 2026-03-02 .. 6=Sunday 2026-03-08
-- ══════════════════════════════════════════════════════
INSERT INTO shifts (id, employee_id, date, day_index, start_time, end_time, duration, type, color, department, notes, created_at, updated_at) VALUES
('shift1',  'emp1', '2026-03-02', 0, '06:00', '14:00', 8,  'Morning', 'bg-blue-100 border-blue-300 text-blue-800',      'Sales',          'Regular shift',  '2026-02-28T09:00:00', '2026-02-28T09:00:00'),
('shift2',  'emp1', '2026-03-04', 2, '06:00', '14:00', 8,  'Morning', 'bg-blue-100 border-blue-300 text-blue-800',      'Sales',          'Regular shift',  '2026-02-28T09:00:00', '2026-02-28T09:00:00'),
('shift3',  'emp1', '2026-03-06', 4, '14:00', '22:00', 8,  'Evening', 'bg-blue-200 border-blue-400 text-blue-900',      'Sales',          'Regular shift',  '2026-02-28T09:00:00', '2026-02-28T09:00:00'),
('shift4',  'emp2', '2026-03-03', 1, '08:00', '18:00', 10, 'Day',     'bg-green-100 border-green-300 text-green-800',   'Warehouse',      'Stock inventory','2026-02-28T09:00:00', '2026-02-28T09:00:00'),
('shift5',  'emp2', '2026-03-05', 3, '08:00', '18:00', 10, 'Day',     'bg-green-100 border-green-300 text-green-800',   'Warehouse',      'Stock inventory','2026-02-28T09:00:00', '2026-02-28T09:00:00'),
('shift6',  'emp3', '2026-03-02', 0, '22:00', '06:00', 8,  'Night',   'bg-purple-100 border-purple-300 text-purple-800','Sales',          'Night audit',    '2026-02-28T09:00:00', '2026-02-28T09:00:00'),
('shift7',  'emp3', '2026-03-04', 2, '14:00', '22:00', 8,  'Evening', 'bg-purple-200 border-purple-400 text-purple-900','Sales',          'Regular shift',  '2026-02-28T09:00:00', '2026-02-28T09:00:00'),
('shift8',  'emp4', '2026-03-03', 1, '07:00', '15:00', 8,  'Day',     'bg-orange-100 border-orange-300 text-orange-800','Production',     'Deli prep',      '2026-02-28T09:00:00', '2026-02-28T09:00:00'),
('shift9',  'emp4', '2026-03-05', 3, '07:00', '15:00', 8,  'Day',     'bg-orange-100 border-orange-300 text-orange-800','Production',     'Deli prep',      '2026-02-28T09:00:00', '2026-02-28T09:00:00'),
('shift10', 'emp5', '2026-03-02', 0, '09:00', '17:00', 8,  'Admin',   'bg-pink-100 border-pink-300 text-pink-800',      'Administration', 'Regular shift',  '2026-02-28T09:00:00', '2026-02-28T09:00:00'),
('shift11', 'emp5', '2026-03-04', 2, '09:00', '17:00', 8,  'Admin',   'bg-pink-100 border-pink-300 text-pink-800',      'Administration', 'Regular shift',  '2026-02-28T09:00:00', '2026-02-28T09:00:00'),
('shift12', 'emp6', '2026-03-03', 1, '10:00', '18:00', 8,  'Day',     'bg-indigo-100 border-indigo-300 text-indigo-800','Kitchen',        'Prep cooking',   '2026-02-28T09:00:00', '2026-02-28T09:00:00')
ON CONFLICT DO NOTHING;

-- Reset the auto-increment for POS after explicit ID inserts
SELECT setval(pg_get_serial_sequence('point_of_sale', 'id'), 5);

-- ══════════════════════════════════════════════════════
-- Users (authentication seed data)
-- Passwords: Admin@123, Manager@123, Employee@123, Viewer@123
-- ══════════════════════════════════════════════════════
INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, employee_id, created_at, updated_at) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@staffscheduler.com',    '$2b$12$cy3eWzkf/hLfSt3mV1zwKOaPs9YPGrpWf/Wd1y5JVEhG87N0qn5LG', 'System',  'Admin',   'admin',    true, NULL,   NOW(), NOW()),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'manager@staffscheduler.com',  '$2b$12$HpgVI3BNYxGjXbxXEP71N.vo/htl13rBqPRff5M8pXTFPpDoSN9Py', 'Jane',    'Smith',   'manager',  true, 'emp7', NOW(), NOW()),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'employee@staffscheduler.com', '$2b$12$6pb0EUl.JzsyeIMJtxnjNeBiR74daytthc31gH3zqVYbk8jAroHKq', 'Sarah',   'Johnson', 'employee', true, 'emp1', NOW(), NOW()),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'viewer@staffscheduler.com',   '$2b$12$aC4oZhRL3o18HJkorip6QOuvRlMx2MvG8jX9oWSl1KQwlxVWlyGbO', 'Robert',  'Taylor',  'viewer',   true, 'emp10', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- Application Settings (global defaults)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO app_settings (id, category, setting_key, setting_value, value_type, updated_at) VALUES
-- Business settings
(gen_random_uuid(), 'business', 'companyName',           'Staff Scheduler Pro', 'string',  NOW()),
(gen_random_uuid(), 'business', 'timezone',              'America/New_York',    'string',  NOW()),
(gen_random_uuid(), 'business', 'workWeekStart',         'monday',             'string',  NOW()),
(gen_random_uuid(), 'business', 'overtimeThreshold',     '40',                 'number',  NOW()),
(gen_random_uuid(), 'business', 'overtimeMultiplier',    '1.5',                'number',  NOW()),
(gen_random_uuid(), 'business', 'doubleTimeThreshold',   '60',                 'number',  NOW()),
(gen_random_uuid(), 'business', 'doubleTimeMultiplier',  '2.0',                'number',  NOW()),
(gen_random_uuid(), 'business', 'payPeriodType',         'biweekly',           'string',  NOW()),
(gen_random_uuid(), 'business', 'defaultShiftDuration',  '8',                  'number',  NOW()),
(gen_random_uuid(), 'business', 'maxShiftDuration',      '12',                 'number',  NOW()),
(gen_random_uuid(), 'business', 'minHoursBetweenShifts', '8',                  'number',  NOW()),
(gen_random_uuid(), 'business', 'ptoAccrualRate',        '1.25',               'number',  NOW()),
(gen_random_uuid(), 'business', 'annualPtoCap',          '20',                 'number',  NOW()),
-- Scheduling settings
(gen_random_uuid(), 'scheduling', 'allowShiftOverlap',          'false', 'boolean', NOW()),
(gen_random_uuid(), 'scheduling', 'autoAssignColors',           'true',  'boolean', NOW()),
(gen_random_uuid(), 'scheduling', 'showShiftCosts',             'true',  'boolean', NOW()),
(gen_random_uuid(), 'scheduling', 'defaultView',                'week',  'string',  NOW()),
(gen_random_uuid(), 'scheduling', 'enableDragAndDrop',          'true',  'boolean', NOW()),
(gen_random_uuid(), 'scheduling', 'requireShiftConfirmation',   'false', 'boolean', NOW()),
-- Notification settings
(gen_random_uuid(), 'notifications', 'emailEnabled',             'true',  'boolean', NOW()),
(gen_random_uuid(), 'notifications', 'shiftReminders',           'true',  'boolean', NOW()),
(gen_random_uuid(), 'notifications', 'schedulePublishedAlerts',  'true',  'boolean', NOW()),
(gen_random_uuid(), 'notifications', 'swapRequests',             'true',  'boolean', NOW()),
(gen_random_uuid(), 'notifications', 'timeOffApprovals',         'true',  'boolean', NOW()),
(gen_random_uuid(), 'notifications', 'reviewAlerts',             'true',  'boolean', NOW()),
(gen_random_uuid(), 'notifications', 'reminderHours',            '24',    'number',  NOW())
ON CONFLICT DO NOTHING;
