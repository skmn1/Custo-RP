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
-- Application Settings (comprehensive defaults)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO app_settings (id, category, setting_key, setting_value, value_type, updated_at) VALUES
-- General settings
(gen_random_uuid(), 'general', 'companyName',       'Staff Scheduler Pro', 'string',  NOW()),
(gen_random_uuid(), 'general', 'timezone',          'America/New_York',    'string',  NOW()),
(gen_random_uuid(), 'general', 'workWeekStart',     'monday',             'string',  NOW()),
(gen_random_uuid(), 'general', 'dateFormat',        'MM/dd/yyyy',         'string',  NOW()),
(gen_random_uuid(), 'general', 'timeFormat',        '12h',                'string',  NOW()),
(gen_random_uuid(), 'general', 'currency',          'USD',                'string',  NOW()),
(gen_random_uuid(), 'general', 'fiscalYearStart',   'January',            'string',  NOW()),
-- Scheduling settings
(gen_random_uuid(), 'scheduling', 'defaultShiftDuration',  '8',     'number',  NOW()),
(gen_random_uuid(), 'scheduling', 'maxShiftDuration',      '12',    'number',  NOW()),
(gen_random_uuid(), 'scheduling', 'minHoursBetweenShifts', '8',     'number',  NOW()),
(gen_random_uuid(), 'scheduling', 'allowOverlap',          'false', 'boolean', NOW()),
(gen_random_uuid(), 'scheduling', 'autoAssignColors',      'true',  'boolean', NOW()),
(gen_random_uuid(), 'scheduling', 'showCostOnCards',       'true',  'boolean', NOW()),
(gen_random_uuid(), 'scheduling', 'defaultView',           'week',  'string',  NOW()),
(gen_random_uuid(), 'scheduling', 'enableDragDrop',        'true',  'boolean', NOW()),
(gen_random_uuid(), 'scheduling', 'requireConfirmation',   'false', 'boolean', NOW()),
(gen_random_uuid(), 'scheduling', 'maxShiftsPerWeek',      '0',     'number',  NOW()),
-- Payroll settings
(gen_random_uuid(), 'payroll', 'payPeriodType',          'biweekly', 'string',  NOW()),
(gen_random_uuid(), 'payroll', 'payPeriodRefDate',       '',          'string',  NOW()),
(gen_random_uuid(), 'payroll', 'overtimeThreshold',      '40',        'number',  NOW()),
(gen_random_uuid(), 'payroll', 'overtimeMultiplier',     '1.5',       'number',  NOW()),
(gen_random_uuid(), 'payroll', 'dailyOvertimeThreshold', '0',         'number',  NOW()),
(gen_random_uuid(), 'payroll', 'doubleTimeThreshold',    '0',         'number',  NOW()),
(gen_random_uuid(), 'payroll', 'doubleTimeMultiplier',   '2.0',       'number',  NOW()),
(gen_random_uuid(), 'payroll', 'holidayMultiplier',      '1.5',       'number',  NOW()),
(gen_random_uuid(), 'payroll', 'defaultHourlyRate',      '15.00',     'number',  NOW()),
(gen_random_uuid(), 'payroll', 'minWageEnforcement',     'true',      'boolean', NOW()),
-- Time Off settings
(gen_random_uuid(), 'timeOff', 'accrualRate',        '1.25', 'number',  NOW()),
(gen_random_uuid(), 'timeOff', 'annualCap',          '20',   'number',  NOW()),
(gen_random_uuid(), 'timeOff', 'carryoverLimit',     '5',    'number',  NOW()),
(gen_random_uuid(), 'timeOff', 'minAdvanceNotice',   '7',    'number',  NOW()),
(gen_random_uuid(), 'timeOff', 'maxConsecutiveDays', '0',    'number',  NOW()),
(gen_random_uuid(), 'timeOff', 'autoApprove',        'false','boolean', NOW()),
(gen_random_uuid(), 'timeOff', 'blackoutDates',      '[]',   'json',    NOW()),
-- Swap settings
(gen_random_uuid(), 'swaps', 'allowEmployeeInitiated', 'true',  'boolean', NOW()),
(gen_random_uuid(), 'swaps', 'requireManagerApproval', 'true',  'boolean', NOW()),
(gen_random_uuid(), 'swaps', 'requestWindowHours',     '48',    'number',  NOW()),
(gen_random_uuid(), 'swaps', 'allowCrossDepartment',   'false', 'boolean', NOW()),
(gen_random_uuid(), 'swaps', 'autoApproveEligible',    'false', 'boolean', NOW()),
-- Notification settings
(gen_random_uuid(), 'notifications', 'emailEnabled',         'true',    'boolean', NOW()),
(gen_random_uuid(), 'notifications', 'pushEnabled',          'true',    'boolean', NOW()),
(gen_random_uuid(), 'notifications', 'shiftAssignment',      'true',    'boolean', NOW()),
(gen_random_uuid(), 'notifications', 'schedulePublished',    'true',    'boolean', NOW()),
(gen_random_uuid(), 'notifications', 'swapRequests',         'true',    'boolean', NOW()),
(gen_random_uuid(), 'notifications', 'timeOffDecision',      'true',    'boolean', NOW()),
(gen_random_uuid(), 'notifications', 'performanceReviews',   'true',    'boolean', NOW()),
(gen_random_uuid(), 'notifications', 'reminderLeadTime',     '24h',     'string',  NOW()),
(gen_random_uuid(), 'notifications', 'digestFrequency',      'instant', 'string',  NOW()),
-- Feature Flags
(gen_random_uuid(), 'featureFlags', 'feature.shifts',              'true',  'boolean', NOW()),
(gen_random_uuid(), 'featureFlags', 'feature.payroll',             'true',  'boolean', NOW()),
(gen_random_uuid(), 'featureFlags', 'feature.timeOff',             'true',  'boolean', NOW()),
(gen_random_uuid(), 'featureFlags', 'feature.shiftSwaps',          'true',  'boolean', NOW()),
(gen_random_uuid(), 'featureFlags', 'feature.recurringTemplates',  'true',  'boolean', NOW()),
(gen_random_uuid(), 'featureFlags', 'feature.reports',             'true',  'boolean', NOW()),
(gen_random_uuid(), 'featureFlags', 'feature.performanceReviews',  'true',  'boolean', NOW()),
(gen_random_uuid(), 'featureFlags', 'feature.stock',               'true',  'boolean', NOW()),
(gen_random_uuid(), 'featureFlags', 'feature.invoices',            'false', 'boolean', NOW()),
(gen_random_uuid(), 'featureFlags', 'feature.employeeMobileApp',   'true',  'boolean', NOW()),
-- Security settings
(gen_random_uuid(), 'security', 'passwordMinLength',  '8',     'number',  NOW()),
(gen_random_uuid(), 'security', 'requireUppercase',   'true',  'boolean', NOW()),
(gen_random_uuid(), 'security', 'requireNumber',      'true',  'boolean', NOW()),
(gen_random_uuid(), 'security', 'requireSpecialChar', 'false', 'boolean', NOW()),
(gen_random_uuid(), 'security', 'passwordExpiry',     '0',     'number',  NOW()),
(gen_random_uuid(), 'security', 'maxFailedAttempts',  '5',     'number',  NOW()),
(gen_random_uuid(), 'security', 'lockoutDuration',    '15',    'number',  NOW()),
(gen_random_uuid(), 'security', 'sessionTimeout',     '60',    'number',  NOW()),
(gen_random_uuid(), 'security', 'jwtAccessTtl',       '15',    'number',  NOW()),
(gen_random_uuid(), 'security', 'jwtRefreshTtl',      '7',     'number',  NOW()),
(gen_random_uuid(), 'security', 'require2faAdmins',   'false', 'boolean', NOW()),
(gen_random_uuid(), 'security', 'allowedIpRanges',    '',      'string',  NOW()),
-- Data Privacy settings
(gen_random_uuid(), 'dataPrivacy', 'auditLogRetention',          '365',   'number',  NOW()),
(gen_random_uuid(), 'dataPrivacy', 'scheduleHistoryRetention',   '730',   'number',  NOW()),
(gen_random_uuid(), 'dataPrivacy', 'gdprErasure',                'true',  'boolean', NOW()),
(gen_random_uuid(), 'dataPrivacy', 'exportFormat',               'CSV',   'string',  NOW()),
(gen_random_uuid(), 'dataPrivacy', 'anonymousAnalytics',         'false', 'boolean', NOW()),
(gen_random_uuid(), 'dataPrivacy', 'cookieConsentBanner',        'true',  'boolean', NOW())
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- Navigation Items (default ordering)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO nav_items (id, route_key, display_order, visible_admin, visible_manager, visible_employee, system_locked, updated_at) VALUES
(gen_random_uuid(), 'dashboard',  0, true, true,  true,  false, NOW()),
(gen_random_uuid(), 'scheduler',  1, true, true,  true,  false, NOW()),
(gen_random_uuid(), 'employees',  2, true, true,  true,  false, NOW()),
(gen_random_uuid(), 'payroll',    3, true, true,  true,  false, NOW()),
(gen_random_uuid(), 'pos',        4, true, true,  false, false, NOW()),
(gen_random_uuid(), 'stock',      5, true, true,  false, false, NOW()),
(gen_random_uuid(), 'shifts',     6, true, true,  false, false, NOW()),
(gen_random_uuid(), 'reports',    7, true, true,  false, false, NOW()),
(gen_random_uuid(), 'settings',   8, true, true,  false, true,  NOW()),
(gen_random_uuid(), 'users',      9, true, false, false, false, NOW())
ON CONFLICT DO NOTHING;

-- ── Fix existing installations (ON CONFLICT DO NOTHING skips updates) ──
UPDATE app_settings SET setting_value = 'true' WHERE category = 'featureFlags' AND setting_key = 'feature.stock';
INSERT INTO nav_items (id, route_key, display_order, visible_admin, visible_manager, visible_employee, system_locked, updated_at)
VALUES (gen_random_uuid(), 'stock', 5, true, true, false, false, NOW())
ON CONFLICT (route_key) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- Departments
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO departments (id, name_en, name_fr, color, active, created_at, updated_at) VALUES
(gen_random_uuid(), 'Sales',          'Ventes',         '#3B82F6', true, NOW(), NOW()),
(gen_random_uuid(), 'Warehouse',      'Entrepôt',       '#22C55E', true, NOW(), NOW()),
(gen_random_uuid(), 'Production',     'Production',     '#F97316', true, NOW(), NOW()),
(gen_random_uuid(), 'Administration', 'Administration', '#EC4899', true, NOW(), NOW()),
(gen_random_uuid(), 'Kitchen',        'Cuisine',        '#6366F1', true, NOW(), NOW()),
(gen_random_uuid(), 'Management',     'Gestion',        '#F43F5E', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- Shift Types
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO shift_types (id, name_en, name_fr, default_start, duration_hours, color, active, created_at, updated_at) VALUES
(gen_random_uuid(), 'Morning Shift', 'Quart du matin',  '06:00', 8.00, '#3B82F6', true, NOW(), NOW()),
(gen_random_uuid(), 'Day Shift',     'Quart de jour',   '08:00', 9.00, '#22C55E', true, NOW(), NOW()),
(gen_random_uuid(), 'Evening Shift', 'Quart du soir',   '14:00', 8.00, '#F97316', true, NOW(), NOW()),
(gen_random_uuid(), 'Night Shift',   'Quart de nuit',   '22:00', 8.00, '#6366F1', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- Stock Locations
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO stock_locations (id, name, description, is_active, sort_order) VALUES
(gen_random_uuid(), 'Main warehouse',     'Central storage facility',           true, 1),
(gen_random_uuid(), 'Walk-in cooler',     'Refrigerated storage',              true, 2),
(gen_random_uuid(), 'Dry store',          'Ambient temperature storage',       true, 3),
(gen_random_uuid(), 'Front-of-house bar', 'Bar area stock',                    true, 4)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- Stock Categories (3-level hierarchy)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO stock_categories (id, name_en, name_fr, parent_id, sort_order, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), 'Food',        'Nourriture',     NULL, 1, true, NOW(), NOW()),
(gen_random_uuid(), 'Beverages',   'Boissons',       NULL, 2, true, NOW(), NOW()),
(gen_random_uuid(), 'Supplies',    'Fournitures',    NULL, 3, true, NOW(), NOW()),
(gen_random_uuid(), 'Packaging',   'Emballage',      NULL, 4, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- Suppliers
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO suppliers (id, name, contact_person, email, phone, address, currency, payment_terms, lead_time_days, is_active, notes, created_at) VALUES
(gen_random_uuid(), 'Sysco Canada',       'Marc Dupont',  'marc@sysco.ca',      '514-555-0101', '1000 Rue Industrielle, Montréal', 'CAD', 'Net 30', 3,  true, 'Primary food distributor',        NOW()),
(gen_random_uuid(), 'Gordon Food Service', 'Sarah Lee',    'sarah@gfs.ca',       '416-555-0202', '200 Commerce Dr, Toronto',        'CAD', 'Net 30', 5,  true, 'Secondary food supplier',         NOW()),
(gen_random_uuid(), 'Metro Supply Co',     'Pierre Tremblay', 'pierre@metro.ca', '450-555-0303', '500 Boul. Laurier, Québec',       'CAD', 'Net 15', 2,  true, 'Local produce and dairy',         NOW()),
(gen_random_uuid(), 'CleanPro Supplies',   'Julie Martin', 'julie@cleanpro.ca',  '613-555-0404', '75 Industrial Pkwy, Ottawa',      'CAD', 'Net 45', 7,  true, 'Cleaning and packaging supplies', NOW())
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- Stock Items (20 items across all categories)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO stock_items (id, sku, name_en, name_fr, category_id, uom, barcode, reorder_point, min_level, avg_cost, sale_price, preferred_supplier_id, location_id, image_url, is_batch_tracked, is_active, created_at, updated_at) VALUES
-- Food items
(gen_random_uuid(), 'FOOD-001', 'Ground Beef 80/20',          'Boeuf haché 80/20',         (SELECT id FROM stock_categories WHERE name_en='Food' LIMIT 1),       'kg',    '0012345000011', 25, 10, 8.50,   12.99, (SELECT id FROM suppliers WHERE name='Sysco Canada' LIMIT 1),        (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),  NULL, true,  true, NOW(), NOW()),
(gen_random_uuid(), 'FOOD-002', 'Chicken Breast Boneless',    'Poitrine de poulet désossée',(SELECT id FROM stock_categories WHERE name_en='Food' LIMIT 1),       'kg',    '0012345000028', 20, 8,  7.25,   11.49, (SELECT id FROM suppliers WHERE name='Sysco Canada' LIMIT 1),        (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),  NULL, true,  true, NOW(), NOW()),
(gen_random_uuid(), 'FOOD-003', 'Atlantic Salmon Fillet',     'Filet de saumon atlantique', (SELECT id FROM stock_categories WHERE name_en='Food' LIMIT 1),       'kg',    '0012345000035', 15, 5,  16.00,  24.99, (SELECT id FROM suppliers WHERE name='Sysco Canada' LIMIT 1),        (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),  NULL, true,  true, NOW(), NOW()),
(gen_random_uuid(), 'FOOD-004', 'Russet Potatoes',            'Pommes de terre Russet',     (SELECT id FROM stock_categories WHERE name_en='Food' LIMIT 1),       'kg',    '0012345000042', 50, 20, 1.20,   2.49,  (SELECT id FROM suppliers WHERE name='Metro Supply Co' LIMIT 1),     (SELECT id FROM stock_locations WHERE name='Dry store' LIMIT 1),       NULL, false, true, NOW(), NOW()),
(gen_random_uuid(), 'FOOD-005', 'Yellow Onions',              'Oignons jaunes',             (SELECT id FROM stock_categories WHERE name_en='Food' LIMIT 1),       'kg',    '0012345000059', 30, 10, 0.90,   1.99,  (SELECT id FROM suppliers WHERE name='Metro Supply Co' LIMIT 1),     (SELECT id FROM stock_locations WHERE name='Dry store' LIMIT 1),       NULL, false, true, NOW(), NOW()),
(gen_random_uuid(), 'FOOD-006', 'Heavy Cream 35%',            'Crème épaisse 35%',          (SELECT id FROM stock_categories WHERE name_en='Food' LIMIT 1),       'litre', '0012345000066', 20, 8,  3.50,   5.99,  (SELECT id FROM suppliers WHERE name='Metro Supply Co' LIMIT 1),     (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),  NULL, true,  true, NOW(), NOW()),
-- Beverage items
(gen_random_uuid(), 'BEV-001',  'Coca-Cola Classic 355ml',    'Coca-Cola Classique 355ml',  (SELECT id FROM stock_categories WHERE name_en='Beverages' LIMIT 1),  'case',  '0012345000073', 15, 5,  18.00,  28.99, (SELECT id FROM suppliers WHERE name='Gordon Food Service' LIMIT 1), (SELECT id FROM stock_locations WHERE name='Dry store' LIMIT 1),       NULL, false, true, NOW(), NOW()),
(gen_random_uuid(), 'BEV-002',  'Orange Juice 1L',            'Jus d''orange 1L',           (SELECT id FROM stock_categories WHERE name_en='Beverages' LIMIT 1),  'case',  '0012345000080', 10, 4,  24.00,  36.99, (SELECT id FROM suppliers WHERE name='Gordon Food Service' LIMIT 1), (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),  NULL, true,  true, NOW(), NOW()),
(gen_random_uuid(), 'BEV-003',  'House Red Wine 750ml',       'Vin rouge maison 750ml',     (SELECT id FROM stock_categories WHERE name_en='Beverages' LIMIT 1),  'bottle','0012345000097', 24, 12, 9.50,   32.00, (SELECT id FROM suppliers WHERE name='Gordon Food Service' LIMIT 1), (SELECT id FROM stock_locations WHERE name='Front-of-house bar' LIMIT 1), NULL, true, true, NOW(), NOW()),
(gen_random_uuid(), 'BEV-004',  'Craft IPA 473ml',            'IPA artisanale 473ml',       (SELECT id FROM stock_categories WHERE name_en='Beverages' LIMIT 1),  'case',  '0012345000103', 10, 4,  36.00,  54.99, (SELECT id FROM suppliers WHERE name='Gordon Food Service' LIMIT 1), (SELECT id FROM stock_locations WHERE name='Front-of-house bar' LIMIT 1), NULL, false, true, NOW(), NOW()),
(gen_random_uuid(), 'BEV-005',  'Espresso Coffee Beans 1kg',  'Grains espresso 1kg',        (SELECT id FROM stock_categories WHERE name_en='Beverages' LIMIT 1),  'bag',   '0012345000110', 8,  3,  22.00,  34.99, (SELECT id FROM suppliers WHERE name='Sysco Canada' LIMIT 1),        (SELECT id FROM stock_locations WHERE name='Dry store' LIMIT 1),       NULL, false, true, NOW(), NOW()),
-- Supply items
(gen_random_uuid(), 'SUP-001',  'Latex Gloves (M)',           'Gants en latex (M)',         (SELECT id FROM stock_categories WHERE name_en='Supplies' LIMIT 1),   'box',   '0012345000127', 10, 4,  12.00,  NULL,  (SELECT id FROM suppliers WHERE name='CleanPro Supplies' LIMIT 1),   (SELECT id FROM stock_locations WHERE name='Main warehouse' LIMIT 1),  NULL, false, true, NOW(), NOW()),
(gen_random_uuid(), 'SUP-002',  'All-Purpose Cleaner 4L',     'Nettoyant tout usage 4L',    (SELECT id FROM stock_categories WHERE name_en='Supplies' LIMIT 1),   'jug',   '0012345000134', 6,  2,  8.50,   NULL,  (SELECT id FROM suppliers WHERE name='CleanPro Supplies' LIMIT 1),   (SELECT id FROM stock_locations WHERE name='Main warehouse' LIMIT 1),  NULL, false, true, NOW(), NOW()),
(gen_random_uuid(), 'SUP-003',  'Paper Towels',               'Essuie-tout',                (SELECT id FROM stock_categories WHERE name_en='Supplies' LIMIT 1),   'case',  '0012345000141', 8,  3,  15.00,  NULL,  (SELECT id FROM suppliers WHERE name='CleanPro Supplies' LIMIT 1),   (SELECT id FROM stock_locations WHERE name='Main warehouse' LIMIT 1),  NULL, false, true, NOW(), NOW()),
(gen_random_uuid(), 'SUP-004',  'Dish Soap 5L',               'Savon à vaisselle 5L',       (SELECT id FROM stock_categories WHERE name_en='Supplies' LIMIT 1),   'jug',   '0012345000158', 5,  2,  10.00,  NULL,  (SELECT id FROM suppliers WHERE name='CleanPro Supplies' LIMIT 1),   (SELECT id FROM stock_locations WHERE name='Main warehouse' LIMIT 1),  NULL, false, true, NOW(), NOW()),
-- Packaging items
(gen_random_uuid(), 'PKG-001',  'Takeout Container 9x6',     'Contenant pour emporter 9x6',(SELECT id FROM stock_categories WHERE name_en='Packaging' LIMIT 1),  'case',  '0012345000165', 12, 5,  25.00,  NULL,  (SELECT id FROM suppliers WHERE name='CleanPro Supplies' LIMIT 1),   (SELECT id FROM stock_locations WHERE name='Main warehouse' LIMIT 1),  NULL, false, true, NOW(), NOW()),
(gen_random_uuid(), 'PKG-002',  'Paper Bags Large',           'Sacs en papier grands',      (SELECT id FROM stock_categories WHERE name_en='Packaging' LIMIT 1),  'case',  '0012345000172', 10, 4,  18.00,  NULL,  (SELECT id FROM suppliers WHERE name='CleanPro Supplies' LIMIT 1),   (SELECT id FROM stock_locations WHERE name='Main warehouse' LIMIT 1),  NULL, false, true, NOW(), NOW()),
(gen_random_uuid(), 'PKG-003',  'Plastic Wrap 300m',          'Pellicule plastique 300m',   (SELECT id FROM stock_categories WHERE name_en='Packaging' LIMIT 1),  'roll',  '0012345000189', 6,  2,  14.00,  NULL,  (SELECT id FROM suppliers WHERE name='CleanPro Supplies' LIMIT 1),   (SELECT id FROM stock_locations WHERE name='Main warehouse' LIMIT 1),  NULL, false, true, NOW(), NOW()),
(gen_random_uuid(), 'PKG-004',  'Aluminum Foil Heavy Duty',   'Papier d''aluminium robuste',(SELECT id FROM stock_categories WHERE name_en='Packaging' LIMIT 1),  'roll',  '0012345000196', 5,  2,  11.00,  NULL,  (SELECT id FROM suppliers WHERE name='CleanPro Supplies' LIMIT 1),   (SELECT id FROM stock_locations WHERE name='Main warehouse' LIMIT 1),  NULL, false, true, NOW(), NOW()),
(gen_random_uuid(), 'PKG-005',  'Compostable Cutlery Set',    'Ensemble ustensiles compost.',(SELECT id FROM stock_categories WHERE name_en='Packaging' LIMIT 1), 'case',  '0012345000202', 8,  3,  22.00,  NULL,  (SELECT id FROM suppliers WHERE name='CleanPro Supplies' LIMIT 1),   (SELECT id FROM stock_locations WHERE name='Main warehouse' LIMIT 1),  NULL, false, true, NOW(), NOW())
ON CONFLICT (sku) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- Stock Movements (initial received + ongoing consumption over 12 weeks)
-- ═══════════════════════════════════════════════════════════════════

-- Large initial receiving for all items (12 weeks ago)
INSERT INTO stock_movements (id, item_id, location_id, movement_type, qty_change, unit_cost, note, performed_at, performed_by) VALUES
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-001'), (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),    'received', 80,  8.50,  'Initial stock', NOW() - INTERVAL '84 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-002'), (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),    'received', 60,  7.25,  'Initial stock', NOW() - INTERVAL '84 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-003'), (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),    'received', 40,  16.00, 'Initial stock', NOW() - INTERVAL '84 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-004'), (SELECT id FROM stock_locations WHERE name='Dry store' LIMIT 1),         'received', 120, 1.20,  'Initial stock', NOW() - INTERVAL '84 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-005'), (SELECT id FROM stock_locations WHERE name='Dry store' LIMIT 1),         'received', 80,  0.90,  'Initial stock', NOW() - INTERVAL '84 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-006'), (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),    'received', 50,  3.50,  'Initial stock', NOW() - INTERVAL '84 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='BEV-001'),  (SELECT id FROM stock_locations WHERE name='Dry store' LIMIT 1),         'received', 40,  18.00, 'Initial stock', NOW() - INTERVAL '84 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='BEV-002'),  (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),    'received', 25,  24.00, 'Initial stock', NOW() - INTERVAL '84 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='BEV-003'),  (SELECT id FROM stock_locations WHERE name='Front-of-house bar' LIMIT 1),'received', 48,  9.50,  'Initial stock', NOW() - INTERVAL '84 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='BEV-004'),  (SELECT id FROM stock_locations WHERE name='Front-of-house bar' LIMIT 1),'received', 20,  36.00, 'Initial stock', NOW() - INTERVAL '84 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='BEV-005'),  (SELECT id FROM stock_locations WHERE name='Dry store' LIMIT 1),         'received', 15,  22.00, 'Initial stock', NOW() - INTERVAL '84 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='SUP-001'),  (SELECT id FROM stock_locations WHERE name='Main warehouse' LIMIT 1),    'received', 25,  12.00, 'Initial stock', NOW() - INTERVAL '84 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='SUP-002'),  (SELECT id FROM stock_locations WHERE name='Main warehouse' LIMIT 1),    'received', 15,  8.50,  'Initial stock', NOW() - INTERVAL '84 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='SUP-003'),  (SELECT id FROM stock_locations WHERE name='Main warehouse' LIMIT 1),    'received', 20,  15.00, 'Initial stock', NOW() - INTERVAL '84 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='SUP-004'),  (SELECT id FROM stock_locations WHERE name='Main warehouse' LIMIT 1),    'received', 12,  10.00, 'Initial stock', NOW() - INTERVAL '84 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='PKG-001'),  (SELECT id FROM stock_locations WHERE name='Main warehouse' LIMIT 1),    'received', 30,  25.00, 'Initial stock', NOW() - INTERVAL '84 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='PKG-002'),  (SELECT id FROM stock_locations WHERE name='Main warehouse' LIMIT 1),    'received', 20,  18.00, 'Initial stock', NOW() - INTERVAL '84 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='PKG-003'),  (SELECT id FROM stock_locations WHERE name='Main warehouse' LIMIT 1),    'received', 12,  14.00, 'Initial stock', NOW() - INTERVAL '84 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='PKG-004'),  (SELECT id FROM stock_locations WHERE name='Main warehouse' LIMIT 1),    'received', 10,  11.00, 'Initial stock', NOW() - INTERVAL '84 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='PKG-005'),  (SELECT id FROM stock_locations WHERE name='Main warehouse' LIMIT 1),    'received', 16,  22.00, 'Initial stock', NOW() - INTERVAL '84 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT DO NOTHING;

-- Weekly consumption over the past 10 weeks (consumed = negative qty_change)
INSERT INTO stock_movements (id, item_id, location_id, movement_type, qty_change, unit_cost, note, performed_at, performed_by) VALUES
-- Week 10 (70 days ago)
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-001'), (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),    'consumed', -8,  8.50,  'Weekly use', NOW() - INTERVAL '70 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-002'), (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),    'consumed', -6,  7.25,  'Weekly use', NOW() - INTERVAL '70 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-004'), (SELECT id FROM stock_locations WHERE name='Dry store' LIMIT 1),         'consumed', -12, 1.20,  'Weekly use', NOW() - INTERVAL '70 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='BEV-001'),  (SELECT id FROM stock_locations WHERE name='Dry store' LIMIT 1),         'consumed', -4,  18.00, 'Weekly use', NOW() - INTERVAL '70 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='BEV-003'),  (SELECT id FROM stock_locations WHERE name='Front-of-house bar' LIMIT 1),'consumed', -5,  9.50,  'Weekly use', NOW() - INTERVAL '70 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
-- Week 9 (63 days ago)
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-001'), (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),    'consumed', -7,  8.50,  'Weekly use', NOW() - INTERVAL '63 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-003'), (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),    'consumed', -4,  16.00, 'Weekly use', NOW() - INTERVAL '63 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-005'), (SELECT id FROM stock_locations WHERE name='Dry store' LIMIT 1),         'consumed', -8,  0.90,  'Weekly use', NOW() - INTERVAL '63 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='BEV-002'),  (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),    'consumed', -3,  24.00, 'Weekly use', NOW() - INTERVAL '63 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='BEV-005'),  (SELECT id FROM stock_locations WHERE name='Dry store' LIMIT 1),         'consumed', -2,  22.00, 'Weekly use', NOW() - INTERVAL '63 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
-- Week 8 (56 days ago) - restock + consumption
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-001'), (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),    'received', 30,  8.50,  'Restock',    NOW() - INTERVAL '56 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-001'), (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),    'consumed', -9,  8.50,  'Weekly use', NOW() - INTERVAL '55 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-002'), (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),    'consumed', -7,  7.25,  'Weekly use', NOW() - INTERVAL '56 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-006'), (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),    'consumed', -6,  3.50,  'Weekly use', NOW() - INTERVAL '56 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='BEV-004'),  (SELECT id FROM stock_locations WHERE name='Front-of-house bar' LIMIT 1),'consumed', -3,  36.00, 'Weekly use', NOW() - INTERVAL '56 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='SUP-001'),  (SELECT id FROM stock_locations WHERE name='Main warehouse' LIMIT 1),    'consumed', -3,  12.00, 'Weekly use', NOW() - INTERVAL '56 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
-- Week 7 (49 days ago)
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-001'), (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),    'consumed', -8,  8.50,  'Weekly use', NOW() - INTERVAL '49 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-003'), (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),    'consumed', -5,  16.00, 'Weekly use', NOW() - INTERVAL '49 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-004'), (SELECT id FROM stock_locations WHERE name='Dry store' LIMIT 1),         'consumed', -10, 1.20,  'Weekly use', NOW() - INTERVAL '49 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='BEV-001'),  (SELECT id FROM stock_locations WHERE name='Dry store' LIMIT 1),         'consumed', -5,  18.00, 'Weekly use', NOW() - INTERVAL '49 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='BEV-003'),  (SELECT id FROM stock_locations WHERE name='Front-of-house bar' LIMIT 1),'consumed', -6,  9.50,  'Weekly use', NOW() - INTERVAL '49 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='PKG-001'),  (SELECT id FROM stock_locations WHERE name='Main warehouse' LIMIT 1),    'consumed', -4,  25.00, 'Weekly use', NOW() - INTERVAL '49 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
-- Week 6 (42 days ago)
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-001'), (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),    'consumed', -10, 8.50,  'Weekly use', NOW() - INTERVAL '42 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-002'), (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),    'consumed', -8,  7.25,  'Weekly use', NOW() - INTERVAL '42 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-005'), (SELECT id FROM stock_locations WHERE name='Dry store' LIMIT 1),         'consumed', -10, 0.90,  'Weekly use', NOW() - INTERVAL '42 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='BEV-002'),  (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),    'consumed', -4,  24.00, 'Weekly use', NOW() - INTERVAL '42 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='BEV-005'),  (SELECT id FROM stock_locations WHERE name='Dry store' LIMIT 1),         'consumed', -2,  22.00, 'Weekly use', NOW() - INTERVAL '42 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='SUP-003'),  (SELECT id FROM stock_locations WHERE name='Main warehouse' LIMIT 1),    'consumed', -3,  15.00, 'Weekly use', NOW() - INTERVAL '42 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
-- Week 5 (35 days ago) - restock + consumption
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-002'), (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),    'received', 25,  7.25,  'Restock',    NOW() - INTERVAL '35 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-003'), (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),    'received', 20,  16.00, 'Restock',    NOW() - INTERVAL '35 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='BEV-003'),  (SELECT id FROM stock_locations WHERE name='Front-of-house bar' LIMIT 1),'received', 24,  9.50,  'Restock',    NOW() - INTERVAL '35 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-001'), (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),    'consumed', -7,  8.50,  'Weekly use', NOW() - INTERVAL '34 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-004'), (SELECT id FROM stock_locations WHERE name='Dry store' LIMIT 1),         'consumed', -15, 1.20,  'Weekly use', NOW() - INTERVAL '35 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='BEV-001'),  (SELECT id FROM stock_locations WHERE name='Dry store' LIMIT 1),         'consumed', -4,  18.00, 'Weekly use', NOW() - INTERVAL '35 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='PKG-002'),  (SELECT id FROM stock_locations WHERE name='Main warehouse' LIMIT 1),    'consumed', -3,  18.00, 'Weekly use', NOW() - INTERVAL '35 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
-- Week 4 (28 days ago)
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-001'), (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),    'consumed', -9,  8.50,  'Weekly use', NOW() - INTERVAL '28 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-002'), (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),    'consumed', -6,  7.25,  'Weekly use', NOW() - INTERVAL '28 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-003'), (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),    'consumed', -5,  16.00, 'Weekly use', NOW() - INTERVAL '28 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-006'), (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),    'consumed', -7,  3.50,  'Weekly use', NOW() - INTERVAL '28 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='BEV-003'),  (SELECT id FROM stock_locations WHERE name='Front-of-house bar' LIMIT 1),'consumed', -5,  9.50,  'Weekly use', NOW() - INTERVAL '28 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='BEV-004'),  (SELECT id FROM stock_locations WHERE name='Front-of-house bar' LIMIT 1),'consumed', -3,  36.00, 'Weekly use', NOW() - INTERVAL '28 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='SUP-001'),  (SELECT id FROM stock_locations WHERE name='Main warehouse' LIMIT 1),    'consumed', -4,  12.00, 'Weekly use', NOW() - INTERVAL '28 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='SUP-002'),  (SELECT id FROM stock_locations WHERE name='Main warehouse' LIMIT 1),    'consumed', -2,  8.50,  'Weekly use', NOW() - INTERVAL '28 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
-- Week 3 (21 days ago)
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-001'), (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),    'consumed', -8,  8.50,  'Weekly use', NOW() - INTERVAL '21 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-002'), (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),    'consumed', -5,  7.25,  'Weekly use', NOW() - INTERVAL '21 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-004'), (SELECT id FROM stock_locations WHERE name='Dry store' LIMIT 1),         'consumed', -11, 1.20,  'Weekly use', NOW() - INTERVAL '21 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-005'), (SELECT id FROM stock_locations WHERE name='Dry store' LIMIT 1),         'consumed', -9,  0.90,  'Weekly use', NOW() - INTERVAL '21 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='BEV-001'),  (SELECT id FROM stock_locations WHERE name='Dry store' LIMIT 1),         'consumed', -5,  18.00, 'Weekly use', NOW() - INTERVAL '21 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='BEV-003'),  (SELECT id FROM stock_locations WHERE name='Front-of-house bar' LIMIT 1),'consumed', -6,  9.50,  'Weekly use', NOW() - INTERVAL '21 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='PKG-001'),  (SELECT id FROM stock_locations WHERE name='Main warehouse' LIMIT 1),    'consumed', -5,  25.00, 'Weekly use', NOW() - INTERVAL '21 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
-- Week 2 (14 days ago) - restock + consumption
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-001'), (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),    'received', 35,  8.50,  'Restock',    NOW() - INTERVAL '14 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='BEV-001'),  (SELECT id FROM stock_locations WHERE name='Dry store' LIMIT 1),         'received', 20,  18.00, 'Restock',    NOW() - INTERVAL '14 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='SUP-001'),  (SELECT id FROM stock_locations WHERE name='Main warehouse' LIMIT 1),    'received', 15,  12.00, 'Restock',    NOW() - INTERVAL '14 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-001'), (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),    'consumed', -10, 8.50,  'Weekly use', NOW() - INTERVAL '13 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-002'), (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),    'consumed', -7,  7.25,  'Weekly use', NOW() - INTERVAL '14 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-003'), (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),    'consumed', -4,  16.00, 'Weekly use', NOW() - INTERVAL '14 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-006'), (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),    'consumed', -8,  3.50,  'Weekly use', NOW() - INTERVAL '14 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='BEV-004'),  (SELECT id FROM stock_locations WHERE name='Front-of-house bar' LIMIT 1),'consumed', -4,  36.00, 'Weekly use', NOW() - INTERVAL '14 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='SUP-004'),  (SELECT id FROM stock_locations WHERE name='Main warehouse' LIMIT 1),    'consumed', -2,  10.00, 'Weekly use', NOW() - INTERVAL '14 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
-- Week 1 (7 days ago)
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-001'), (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),    'consumed', -9,  8.50,  'Weekly use', NOW() - INTERVAL '7 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-002'), (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),    'consumed', -6,  7.25,  'Weekly use', NOW() - INTERVAL '7 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-003'), (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),    'consumed', -3,  16.00, 'Weekly use', NOW() - INTERVAL '7 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-004'), (SELECT id FROM stock_locations WHERE name='Dry store' LIMIT 1),         'consumed', -13, 1.20,  'Weekly use', NOW() - INTERVAL '7 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-005'), (SELECT id FROM stock_locations WHERE name='Dry store' LIMIT 1),         'consumed', -7,  0.90,  'Weekly use', NOW() - INTERVAL '7 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='BEV-001'),  (SELECT id FROM stock_locations WHERE name='Dry store' LIMIT 1),         'consumed', -4,  18.00, 'Weekly use', NOW() - INTERVAL '7 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='BEV-002'),  (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),    'consumed', -3,  24.00, 'Weekly use', NOW() - INTERVAL '7 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='BEV-003'),  (SELECT id FROM stock_locations WHERE name='Front-of-house bar' LIMIT 1),'consumed', -4,  9.50,  'Weekly use', NOW() - INTERVAL '7 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='BEV-005'),  (SELECT id FROM stock_locations WHERE name='Dry store' LIMIT 1),         'consumed', -2,  22.00, 'Weekly use', NOW() - INTERVAL '7 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='SUP-003'),  (SELECT id FROM stock_locations WHERE name='Main warehouse' LIMIT 1),    'consumed', -2,  15.00, 'Weekly use', NOW() - INTERVAL '7 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='PKG-003'),  (SELECT id FROM stock_locations WHERE name='Main warehouse' LIMIT 1),    'consumed', -2,  14.00, 'Weekly use', NOW() - INTERVAL '7 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
-- Waste/adjustment entries
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-003'), (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),    'wasted',   -2,  16.00, 'Expired salmon', NOW() - INTERVAL '30 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='FOOD-006'), (SELECT id FROM stock_locations WHERE name='Walk-in cooler' LIMIT 1),    'wasted',   -3,  3.50,  'Spoiled cream', NOW() - INTERVAL '45 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), (SELECT id FROM stock_items WHERE sku='BEV-003'), (SELECT id FROM stock_locations WHERE name='Front-of-house bar' LIMIT 1), 'adjustment', 2, 9.50,  'Inventory count correction', NOW() - INTERVAL '20 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT DO NOTHING;
