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
-- Employees (from src/data/employees.js)
-- ══════════════════════════════════════════════════════
INSERT INTO employees (id, name, role, avatar, color, email, max_hours, department, pos_id, is_manager) VALUES
('emp1',  'Sarah Johnson',   'Senior Nurse',      'SJ', 'bg-blue-500',   'sarah.johnson@hospital.com',   40, 'ICU',            1, false),
('emp2',  'Michael Chen',    'Doctor',             'MC', 'bg-green-500',  'michael.chen@hospital.com',    50, 'Emergency',      1, false),
('emp3',  'Emily Rodriguez', 'Nurse',              'ER', 'bg-purple-500', 'emily.rodriguez@hospital.com', 36, 'General',        2, false),
('emp4',  'David Wilson',    'Technician',         'DW', 'bg-orange-500', 'david.wilson@hospital.com',    40, 'Lab',            2, false),
('emp5',  'Lisa Thompson',   'Administrator',      'LT', 'bg-pink-500',  'lisa.thompson@hospital.com',   40, 'Administration', 3, false),
('emp6',  'James Park',      'Radiologist',        'JP', 'bg-indigo-500','james.park@hospital.com',      45, 'Radiology',      3, false),
('emp7',  'Jane Smith',      'Store Manager',      'JS', 'bg-rose-500',  'jane.smith@company.com',       45, 'Management',     1, true),
('emp8',  'John Doe',        'Store Manager',      'JD', 'bg-teal-500',  'john.doe@company.com',         45, 'Management',     2, true),
('emp9',  'Alice Brown',     'Store Manager',      'AB', 'bg-amber-500', 'alice.brown@company.com',      45, 'Management',     3, true),
('emp10', 'Robert Taylor',   'Cashier',            'RT', 'bg-cyan-500',  'robert.taylor@company.com',    35, 'Sales',          4, false),
('emp11', 'Maria Garcia',    'Assistant Manager',  'MG', 'bg-violet-500','maria.garcia@company.com',     40, 'Management',     4, true),
('emp12', 'Thomas Wright',   'Butcher',            'TW', 'bg-red-500',   'thomas.wright@company.com',    40, 'Production',     1, false);

-- ══════════════════════════════════════════════════════
-- Shifts (from src/data/shifts.js — week of 2026-03-02, Monday)
-- Day mapping: 0=Monday 2026-03-02 .. 6=Sunday 2026-03-08
-- ══════════════════════════════════════════════════════
INSERT INTO shifts (id, employee_id, date, day_index, start_time, end_time, duration, type, color, department) VALUES
('shift1',  'emp1', '2026-03-02', 0, '06:00', '14:00', 8,  'Morning',  'bg-blue-100 border-blue-300 text-blue-800',     'ICU'),
('shift2',  'emp1', '2026-03-04', 2, '06:00', '14:00', 8,  'Morning',  'bg-blue-100 border-blue-300 text-blue-800',     'ICU'),
('shift3',  'emp1', '2026-03-06', 4, '14:00', '22:00', 8,  'Evening',  'bg-blue-200 border-blue-400 text-blue-900',     'ICU'),
('shift4',  'emp2', '2026-03-03', 1, '08:00', '18:00', 10, 'Day',      'bg-green-100 border-green-300 text-green-800',   'Emergency'),
('shift5',  'emp2', '2026-03-05', 3, '08:00', '18:00', 10, 'Day',      'bg-green-100 border-green-300 text-green-800',   'Emergency'),
('shift6',  'emp3', '2026-03-02', 0, '22:00', '06:00', 8,  'Night',    'bg-purple-100 border-purple-300 text-purple-800','General'),
('shift7',  'emp3', '2026-03-04', 2, '14:00', '22:00', 8,  'Evening',  'bg-purple-200 border-purple-400 text-purple-900','General'),
('shift8',  'emp4', '2026-03-03', 1, '07:00', '15:00', 8,  'Day',      'bg-orange-100 border-orange-300 text-orange-800','Lab'),
('shift9',  'emp4', '2026-03-05', 3, '07:00', '15:00', 8,  'Day',      'bg-orange-100 border-orange-300 text-orange-800','Lab'),
('shift10', 'emp5', '2026-03-02', 0, '09:00', '17:00', 8,  'Admin',    'bg-pink-100 border-pink-300 text-pink-800',     'Administration'),
('shift11', 'emp5', '2026-03-04', 2, '09:00', '17:00', 8,  'Admin',    'bg-pink-100 border-pink-300 text-pink-800',     'Administration'),
('shift12', 'emp6', '2026-03-03', 1, '10:00', '18:00', 8,  'Day',      'bg-indigo-100 border-indigo-300 text-indigo-800','Radiology');

-- Reset the auto-increment for POS after explicit ID inserts
ALTER TABLE point_of_sale ALTER COLUMN id RESTART WITH 6;
