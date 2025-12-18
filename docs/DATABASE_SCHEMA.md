# Database Schema - Staff Scheduler Pro

**Document Version:** 1.0  
**Last Updated:** December 18, 2024  
**Database:** PostgreSQL 15+  
**ORM:** Prisma

---

## Table of Contents

1. [Overview](#overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Core Tables](#core-tables)
4. [Indexes](#indexes)
5. [Constraints](#constraints)
6. [Prisma Schema](#prisma-schema)
7. [Migration Strategy](#migration-strategy)

---

## Overview

The database schema is designed for a **multi-tenant SaaS application** with:
- Organization-level data isolation
- ACID-compliant transactions
- Optimized indexes for performance
- Audit trail support
- Scalability considerations

### Design Principles

✅ **Multi-Tenancy:** All data tables include `organization_id` for tenant isolation  
✅ **Soft Deletes:** Use `is_active` or `deleted_at` instead of hard deletes  
✅ **Timestamps:** All tables have `created_at` and `updated_at`  
✅ **UUIDs:** Use UUID for primary keys for distributed systems  
✅ **Foreign Keys:** Enforce referential integrity with cascading rules  
✅ **Indexes:** Strategic indexing on foreign keys and frequently queried columns

---

## Entity Relationship Diagram

```
┌─────────────────┐
│  Organizations  │
└────────┬────────┘
         │
         │ 1:N
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐  ┌──────────┐
│ Users │  │Employees │
└───┬───┘  └────┬─────┘
    │           │
    │ 1:N       │ 1:N
    │           │
    ▼           ▼
┌──────────┐  ┌────────────────┐
│ Sessions │  │     Shifts     │
└──────────┘  └────────┬───────┘
                       │
                       │ N:1
                       │
                       ▼
                  ┌───────────┐
                  │ Schedules │
                  └───────────┘

┌──────────────────────┐       ┌─────────────────────┐
│  Time-Off Requests   │       │    Shift Swaps      │
└──────────┬───────────┘       └─────────┬───────────┘
           │                             │
           │ N:1                         │ N:1
           │                             │
           ▼                             ▼
      ┌─────────┐                  ┌─────────┐
      │Employee │                  │  Shift  │
      └─────────┘                  └─────────┘

┌──────────────────────┐       ┌─────────────────────┐
│Employee Availability │       │   Notifications     │
└──────────┬───────────┘       └─────────┬───────────┘
           │                             │
           │ N:1                         │ N:1
           │                             │
           ▼                             ▼
      ┌─────────┐                  ┌─────────┐
      │Employee │                  │  User   │
      └─────────┘                  └─────────┘

┌──────────────────────┐
│    Audit Logs        │
└──────────┬───────────┘
           │
           │ N:1
           │
           ▼
      ┌──────────────┐
      │Organization  │
      └──────────────┘
```

---

## Core Tables

### 1. Organizations

Multi-tenant organization/company table.

```sql
CREATE TABLE organizations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              VARCHAR(255) NOT NULL,
  slug              VARCHAR(100) UNIQUE NOT NULL,
  subdomain         VARCHAR(100) UNIQUE,
  email             VARCHAR(255) NOT NULL,
  phone             VARCHAR(50),
  address           TEXT,
  settings          JSONB DEFAULT '{}',
  subscription_tier VARCHAR(50) DEFAULT 'free',
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_is_active ON organizations(is_active);

-- Comments
COMMENT ON TABLE organizations IS 'Multi-tenant organization accounts';
COMMENT ON COLUMN organizations.settings IS 'JSON configuration: timezone, overtimeThreshold, etc.';
COMMENT ON COLUMN organizations.subscription_tier IS 'Subscription level: free, basic, premium, enterprise';
```

**Fields:**
- `id` - Unique organization identifier
- `name` - Organization display name
- `slug` - URL-friendly identifier
- `subdomain` - Optional subdomain (e.g., acme.schedulerpro.com)
- `email` - Primary contact email
- `settings` - JSON configuration (timezone, business rules, etc.)
- `subscription_tier` - Billing tier (free, basic, premium, enterprise)

---

### 2. Users

Application users with authentication credentials.

```sql
CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email             VARCHAR(255) NOT NULL,
  password_hash     VARCHAR(255) NOT NULL,
  first_name        VARCHAR(100) NOT NULL,
  last_name         VARCHAR(100) NOT NULL,
  role              VARCHAR(50) NOT NULL DEFAULT 'employee',
  phone             VARCHAR(50),
  avatar_url        TEXT,
  is_active         BOOLEAN DEFAULT true,
  email_verified    BOOLEAN DEFAULT false,
  email_verification_token VARCHAR(255),
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP,
  last_login_at     TIMESTAMP,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT uk_user_org_email UNIQUE (organization_id, email),
  CONSTRAINT chk_role CHECK (role IN ('super_admin', 'admin', 'manager', 'employee', 'viewer'))
);

-- Indexes
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(organization_id, role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Comments
COMMENT ON TABLE users IS 'Application users with authentication';
COMMENT ON COLUMN users.role IS 'User role: super_admin, admin, manager, employee, viewer';
COMMENT ON COLUMN users.password_hash IS 'bcrypt hashed password (never store plain text)';
```

**Roles:**
- `super_admin` - System administrator (cross-org)
- `admin` - Organization administrator
- `manager` - Can manage schedules and approve requests
- `employee` - Can view schedules and submit requests
- `viewer` - Read-only access

---

### 3. Employees

Employee profiles with employment details.

```sql
CREATE TABLE employees (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id           UUID REFERENCES users(id) ON DELETE SET NULL,
  employee_code     VARCHAR(50),
  first_name        VARCHAR(100) NOT NULL,
  last_name         VARCHAR(100) NOT NULL,
  email             VARCHAR(255),
  phone             VARCHAR(50),
  department        VARCHAR(100),
  job_title         VARCHAR(100),
  hourly_rate       DECIMAL(10, 2),
  max_hours_per_week INT DEFAULT 40,
  color             VARCHAR(50),
  avatar_url        TEXT,
  hire_date         DATE,
  termination_date  DATE,
  is_active         BOOLEAN DEFAULT true,
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT uk_employee_org_code UNIQUE (organization_id, employee_code),
  CONSTRAINT chk_hourly_rate CHECK (hourly_rate >= 0),
  CONSTRAINT chk_max_hours CHECK (max_hours_per_week > 0 AND max_hours_per_week <= 168)
);

-- Indexes
CREATE INDEX idx_employees_organization ON employees(organization_id);
CREATE INDEX idx_employees_user ON employees(user_id);
CREATE INDEX idx_employees_department ON employees(organization_id, department);
CREATE INDEX idx_employees_is_active ON employees(organization_id, is_active);
CREATE INDEX idx_employees_name ON employees(organization_id, last_name, first_name);

-- Comments
COMMENT ON TABLE employees IS 'Employee records with employment details';
COMMENT ON COLUMN employees.user_id IS 'Optional link to user account if employee has login access';
COMMENT ON COLUMN employees.metadata IS 'Flexible JSON for custom fields';
```

**Key Fields:**
- `user_id` - Optional link to user account (if employee can log in)
- `employee_code` - Unique employee identifier within organization
- `hourly_rate` - Base hourly wage
- `max_hours_per_week` - Maximum weekly hours (compliance)
- `metadata` - Flexible JSON for custom fields

---

### 4. Shifts

Individual shift assignments.

```sql
CREATE TABLE shifts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id       UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  schedule_id       UUID REFERENCES schedules(id) ON DELETE SET NULL,
  shift_date        DATE NOT NULL,
  start_time        TIME NOT NULL,
  end_time          TIME NOT NULL,
  break_duration    INT DEFAULT 0,
  shift_type        VARCHAR(50),
  department        VARCHAR(100),
  location          VARCHAR(255),
  notes             TEXT,
  status            VARCHAR(50) DEFAULT 'scheduled',
  created_by        UUID REFERENCES users(id),
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT chk_break_duration CHECK (break_duration >= 0),
  CONSTRAINT chk_status CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  CONSTRAINT chk_shift_type CHECK (shift_type IN ('morning', 'day', 'evening', 'night', 'custom'))
);

-- Indexes
CREATE INDEX idx_shifts_organization ON shifts(organization_id);
CREATE INDEX idx_shifts_employee ON shifts(employee_id);
CREATE INDEX idx_shifts_date ON shifts(organization_id, shift_date);
CREATE INDEX idx_shifts_schedule ON shifts(schedule_id);
CREATE INDEX idx_shifts_department ON shifts(organization_id, department);
CREATE INDEX idx_shifts_employee_date ON shifts(employee_id, shift_date);
CREATE INDEX idx_shifts_status ON shifts(organization_id, status);

-- Comments
COMMENT ON TABLE shifts IS 'Individual shift assignments';
COMMENT ON COLUMN shifts.break_duration IS 'Unpaid break time in minutes';
COMMENT ON COLUMN shifts.status IS 'Shift status: scheduled, completed, cancelled, no_show';
```

**Key Fields:**
- `shift_date` - Date of the shift
- `start_time` / `end_time` - Shift hours
- `break_duration` - Unpaid break time (minutes)
- `shift_type` - Shift category (morning, day, evening, night)
- `status` - Lifecycle status

---

### 5. Schedules

Schedule groupings for publishing.

```sql
CREATE TABLE schedules (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name              VARCHAR(255) NOT NULL,
  start_date        DATE NOT NULL,
  end_date          DATE NOT NULL,
  status            VARCHAR(50) DEFAULT 'draft',
  published_at      TIMESTAMP,
  published_by      UUID REFERENCES users(id),
  notes             TEXT,
  created_by        UUID REFERENCES users(id),
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT chk_date_range CHECK (end_date >= start_date),
  CONSTRAINT chk_schedule_status CHECK (status IN ('draft', 'published', 'archived'))
);

-- Indexes
CREATE INDEX idx_schedules_organization ON schedules(organization_id);
CREATE INDEX idx_schedules_dates ON schedules(organization_id, start_date, end_date);
CREATE INDEX idx_schedules_status ON schedules(organization_id, status);

-- Comments
COMMENT ON TABLE schedules IS 'Schedule periods for grouping shifts';
COMMENT ON COLUMN schedules.status IS 'Schedule status: draft, published, archived';
```

---

### 6. Time-Off Requests

Employee time-off request management.

```sql
CREATE TABLE time_off_requests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id       UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  request_type      VARCHAR(50) NOT NULL,
  start_date        DATE NOT NULL,
  end_date          DATE NOT NULL,
  reason            TEXT,
  status            VARCHAR(50) DEFAULT 'pending',
  reviewed_by       UUID REFERENCES users(id),
  reviewed_at       TIMESTAMP,
  review_notes      TEXT,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT chk_date_range CHECK (end_date >= start_date),
  CONSTRAINT chk_request_type CHECK (request_type IN ('vacation', 'sick', 'personal', 'unpaid', 'other')),
  CONSTRAINT chk_timeoff_status CHECK (status IN ('pending', 'approved', 'denied', 'cancelled'))
);

-- Indexes
CREATE INDEX idx_time_off_organization ON time_off_requests(organization_id);
CREATE INDEX idx_time_off_employee ON time_off_requests(employee_id);
CREATE INDEX idx_time_off_dates ON time_off_requests(organization_id, start_date, end_date);
CREATE INDEX idx_time_off_status ON time_off_requests(organization_id, status);

-- Comments
COMMENT ON TABLE time_off_requests IS 'Employee time-off requests with approval workflow';
COMMENT ON COLUMN time_off_requests.request_type IS 'Type: vacation, sick, personal, unpaid, other';
```

---

### 7. Shift Swaps

Shift swap request management.

```sql
CREATE TABLE shift_swaps (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  shift_id          UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  from_employee_id  UUID NOT NULL REFERENCES employees(id),
  to_employee_id    UUID NOT NULL REFERENCES employees(id),
  reason            TEXT,
  status            VARCHAR(50) DEFAULT 'pending',
  reviewed_by       UUID REFERENCES users(id),
  reviewed_at       TIMESTAMP,
  review_notes      TEXT,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT chk_different_employees CHECK (from_employee_id != to_employee_id),
  CONSTRAINT chk_swap_status CHECK (status IN ('pending', 'approved', 'denied', 'cancelled'))
);

-- Indexes
CREATE INDEX idx_shift_swaps_organization ON shift_swaps(organization_id);
CREATE INDEX idx_shift_swaps_shift ON shift_swaps(shift_id);
CREATE INDEX idx_shift_swaps_from_employee ON shift_swaps(from_employee_id);
CREATE INDEX idx_shift_swaps_to_employee ON shift_swaps(to_employee_id);
CREATE INDEX idx_shift_swaps_status ON shift_swaps(organization_id, status);

-- Comments
COMMENT ON TABLE shift_swaps IS 'Shift swap requests between employees';
```

---

### 8. Employee Availability

Weekly recurring availability patterns.

```sql
CREATE TABLE employee_availability (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id       UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  day_of_week       INT NOT NULL,
  start_time        TIME,
  end_time          TIME,
  is_available      BOOLEAN DEFAULT true,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT uk_employee_availability UNIQUE (employee_id, day_of_week),
  CONSTRAINT chk_day_of_week CHECK (day_of_week >= 0 AND day_of_week <= 6)
);

-- Indexes
CREATE INDEX idx_availability_employee ON employee_availability(employee_id);
CREATE INDEX idx_availability_day ON employee_availability(employee_id, day_of_week);

-- Comments
COMMENT ON TABLE employee_availability IS 'Weekly recurring availability for employees';
COMMENT ON COLUMN employee_availability.day_of_week IS '0=Sunday, 1=Monday, ..., 6=Saturday';
```

---

### 9. Notifications

In-app notification management.

```sql
CREATE TABLE notifications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type              VARCHAR(50) NOT NULL,
  title             VARCHAR(255) NOT NULL,
  message           TEXT NOT NULL,
  data              JSONB,
  is_read           BOOLEAN DEFAULT false,
  sent_at           TIMESTAMP DEFAULT NOW(),
  read_at           TIMESTAMP,
  created_at        TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT chk_notification_type CHECK (type IN (
    'shift_assigned', 'shift_changed', 'shift_cancelled',
    'schedule_published', 'time_off_approved', 'time_off_denied',
    'swap_requested', 'swap_approved', 'swap_denied', 'general'
  ))
);

-- Indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(organization_id, type);

-- Comments
COMMENT ON TABLE notifications IS 'In-app notifications for users';
COMMENT ON COLUMN notifications.data IS 'JSON payload with related entity IDs';
```

---

### 10. Audit Logs

Comprehensive audit trail.

```sql
CREATE TABLE audit_logs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id           UUID REFERENCES users(id),
  action            VARCHAR(100) NOT NULL,
  entity_type       VARCHAR(100) NOT NULL,
  entity_id         UUID,
  old_values        JSONB,
  new_values        JSONB,
  ip_address        VARCHAR(45),
  user_agent        TEXT,
  created_at        TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT chk_action CHECK (action IN (
    'create', 'update', 'delete', 'login', 'logout',
    'approve', 'deny', 'publish', 'export'
  ))
);

-- Indexes
CREATE INDEX idx_audit_logs_organization ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(organization_id, action);

-- Partitioning (for large datasets)
-- CREATE TABLE audit_logs_y2024m12 PARTITION OF audit_logs
--   FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');

-- Comments
COMMENT ON TABLE audit_logs IS 'Audit trail for all system actions';
COMMENT ON COLUMN audit_logs.old_values IS 'JSON snapshot before change';
COMMENT ON COLUMN audit_logs.new_values IS 'JSON snapshot after change';
```

---

### 11. Sessions (Optional - if not using Redis)

User session management.

```sql
CREATE TABLE sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token     VARCHAR(500) NOT NULL UNIQUE,
  ip_address        VARCHAR(45),
  user_agent        TEXT,
  expires_at        TIMESTAMP NOT NULL,
  created_at        TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT chk_expires_future CHECK (expires_at > created_at)
);

-- Indexes
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_refresh_token ON sessions(refresh_token);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- Automatic cleanup of expired sessions
CREATE INDEX idx_sessions_expired ON sessions(expires_at) WHERE expires_at < NOW();

-- Comments
COMMENT ON TABLE sessions IS 'User session tokens for authentication';
```

---

## Indexes

### Primary Indexes

All tables have primary key indexes on `id` (UUID).

### Foreign Key Indexes

All foreign key columns have indexes for join performance:
- `organization_id` in all multi-tenant tables
- `employee_id` in shifts, availability, time-off
- `user_id` in sessions, notifications, audit logs

### Composite Indexes

Performance-critical queries use composite indexes:

```sql
-- Shift queries by employee and date
CREATE INDEX idx_shifts_employee_date ON shifts(employee_id, shift_date);

-- User lookups within organization
CREATE INDEX idx_users_org_email ON users(organization_id, email);

-- Schedule date range queries
CREATE INDEX idx_schedules_dates ON schedules(organization_id, start_date, end_date);
```

### Partial Indexes

Optimize specific query patterns:

```sql
-- Active employees only
CREATE INDEX idx_employees_active ON employees(organization_id) WHERE is_active = true;

-- Pending time-off requests
CREATE INDEX idx_time_off_pending ON time_off_requests(employee_id) WHERE status = 'pending';

-- Unread notifications
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE is_read = false;
```

---

## Constraints

### Check Constraints

Data validation at database level:

```sql
-- Date ranges must be valid
CONSTRAINT chk_date_range CHECK (end_date >= start_date)

-- Hourly rates must be positive
CONSTRAINT chk_hourly_rate CHECK (hourly_rate >= 0)

-- Roles must be from allowed list
CONSTRAINT chk_role CHECK (role IN ('super_admin', 'admin', 'manager', 'employee', 'viewer'))

-- Break duration must be non-negative
CONSTRAINT chk_break_duration CHECK (break_duration >= 0)
```

### Unique Constraints

Prevent duplicates:

```sql
-- Email unique within organization
CONSTRAINT uk_user_org_email UNIQUE (organization_id, email)

-- Employee code unique within organization
CONSTRAINT uk_employee_org_code UNIQUE (organization_id, employee_code)

-- One availability record per employee per day
CONSTRAINT uk_employee_availability UNIQUE (employee_id, day_of_week)
```

### Foreign Key Constraints

Enforce referential integrity:

```sql
-- Cascade delete when organization deleted
REFERENCES organizations(id) ON DELETE CASCADE

-- Set NULL when user deleted (preserve records)
REFERENCES users(id) ON DELETE SET NULL

-- Restrict delete if referenced (prevent orphans)
REFERENCES employees(id) ON DELETE RESTRICT
```

---

## Prisma Schema

Complete Prisma schema definition:

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Organization {
  id                String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name              String    @db.VarChar(255)
  slug              String    @unique @db.VarChar(100)
  subdomain         String?   @unique @db.VarChar(100)
  email             String    @db.VarChar(255)
  phone             String?   @db.VarChar(50)
  address           String?   @db.Text
  settings          Json      @default("{}")
  subscriptionTier  String    @default("free") @map("subscription_tier") @db.VarChar(50)
  isActive          Boolean   @default(true) @map("is_active")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")
  
  users             User[]
  employees         Employee[]
  shifts            Shift[]
  schedules         Schedule[]
  timeOffRequests   TimeOffRequest[]
  shiftSwaps        ShiftSwap[]
  notifications     Notification[]
  auditLogs         AuditLog[]
  
  @@index([slug])
  @@index([isActive])
  @@map("organizations")
}

model User {
  id                        String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  organizationId            String    @map("organization_id") @db.Uuid
  email                     String    @db.VarChar(255)
  passwordHash              String    @map("password_hash") @db.VarChar(255)
  firstName                 String    @map("first_name") @db.VarChar(100)
  lastName                  String    @map("last_name") @db.VarChar(100)
  role                      String    @default("employee") @db.VarChar(50)
  phone                     String?   @db.VarChar(50)
  avatarUrl                 String?   @map("avatar_url") @db.Text
  isActive                  Boolean   @default(true) @map("is_active")
  emailVerified             Boolean   @default(false) @map("email_verified")
  emailVerificationToken    String?   @map("email_verification_token") @db.VarChar(255)
  passwordResetToken        String?   @map("password_reset_token") @db.VarChar(255)
  passwordResetExpires      DateTime? @map("password_reset_expires")
  lastLoginAt               DateTime? @map("last_login_at")
  createdAt                 DateTime  @default(now()) @map("created_at")
  updatedAt                 DateTime  @updatedAt @map("updated_at")
  
  organization              Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  notifications             Notification[]
  sessions                  Session[]
  
  @@unique([organizationId, email])
  @@index([organizationId])
  @@index([email])
  @@index([organizationId, role])
  @@map("users")
}

model Employee {
  id                String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  organizationId    String    @map("organization_id") @db.Uuid
  userId            String?   @map("user_id") @db.Uuid
  employeeCode      String?   @map("employee_code") @db.VarChar(50)
  firstName         String    @map("first_name") @db.VarChar(100)
  lastName          String    @map("last_name") @db.VarChar(100)
  email             String?   @db.VarChar(255)
  phone             String?   @db.VarChar(50)
  department        String?   @db.VarChar(100)
  jobTitle          String?   @map("job_title") @db.VarChar(100)
  hourlyRate        Decimal?  @map("hourly_rate") @db.Decimal(10, 2)
  maxHoursPerWeek   Int       @default(40) @map("max_hours_per_week")
  color             String?   @db.VarChar(50)
  avatarUrl         String?   @map("avatar_url") @db.Text
  hireDate          DateTime? @map("hire_date") @db.Date
  terminationDate   DateTime? @map("termination_date") @db.Date
  isActive          Boolean   @default(true) @map("is_active")
  metadata          Json      @default("{}")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")
  
  organization      Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  shifts            Shift[]
  timeOffRequests   TimeOffRequest[]
  availability      EmployeeAvailability[]
  swapsFrom         ShiftSwap[] @relation("SwapsFrom")
  swapsTo           ShiftSwap[] @relation("SwapsTo")
  
  @@unique([organizationId, employeeCode])
  @@index([organizationId])
  @@index([organizationId, department])
  @@index([organizationId, isActive])
  @@map("employees")
}

model Shift {
  id                String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  organizationId    String    @map("organization_id") @db.Uuid
  employeeId        String    @map("employee_id") @db.Uuid
  scheduleId        String?   @map("schedule_id") @db.Uuid
  shiftDate         DateTime  @map("shift_date") @db.Date
  startTime         DateTime  @map("start_time") @db.Time
  endTime           DateTime  @map("end_time") @db.Time
  breakDuration     Int       @default(0) @map("break_duration")
  shiftType         String?   @map("shift_type") @db.VarChar(50)
  department        String?   @db.VarChar(100)
  location          String?   @db.VarChar(255)
  notes             String?   @db.Text
  status            String    @default("scheduled") @db.VarChar(50)
  createdBy         String?   @map("created_by") @db.Uuid
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")
  
  organization      Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  employee          Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  schedule          Schedule? @relation(fields: [scheduleId], references: [id], onDelete: SetNull)
  shiftSwaps        ShiftSwap[]
  
  @@index([organizationId])
  @@index([employeeId])
  @@index([organizationId, shiftDate])
  @@index([scheduleId])
  @@index([employeeId, shiftDate])
  @@map("shifts")
}

model Schedule {
  id                String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  organizationId    String    @map("organization_id") @db.Uuid
  name              String    @db.VarChar(255)
  startDate         DateTime  @map("start_date") @db.Date
  endDate           DateTime  @map("end_date") @db.Date
  status            String    @default("draft") @db.VarChar(50)
  publishedAt       DateTime? @map("published_at")
  publishedBy       String?   @map("published_by") @db.Uuid
  notes             String?   @db.Text
  createdBy         String?   @map("created_by") @db.Uuid
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")
  
  organization      Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  shifts            Shift[]
  
  @@index([organizationId])
  @@index([organizationId, startDate, endDate])
  @@index([organizationId, status])
  @@map("schedules")
}

model TimeOffRequest {
  id                String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  organizationId    String    @map("organization_id") @db.Uuid
  employeeId        String    @map("employee_id") @db.Uuid
  requestType       String    @map("request_type") @db.VarChar(50)
  startDate         DateTime  @map("start_date") @db.Date
  endDate           DateTime  @map("end_date") @db.Date
  reason            String?   @db.Text
  status            String    @default("pending") @db.VarChar(50)
  reviewedBy        String?   @map("reviewed_by") @db.Uuid
  reviewedAt        DateTime? @map("reviewed_at")
  reviewNotes       String?   @map("review_notes") @db.Text
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")
  
  organization      Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  employee          Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  
  @@index([organizationId])
  @@index([employeeId])
  @@index([organizationId, startDate, endDate])
  @@map("time_off_requests")
}

model ShiftSwap {
  id                String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  organizationId    String    @map("organization_id") @db.Uuid
  shiftId           String    @map("shift_id") @db.Uuid
  fromEmployeeId    String    @map("from_employee_id") @db.Uuid
  toEmployeeId      String    @map("to_employee_id") @db.Uuid
  reason            String?   @db.Text
  status            String    @default("pending") @db.VarChar(50)
  reviewedBy        String?   @map("reviewed_by") @db.Uuid
  reviewedAt        DateTime? @map("reviewed_at")
  reviewNotes       String?   @map("review_notes") @db.Text
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")
  
  organization      Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  shift             Shift @relation(fields: [shiftId], references: [id], onDelete: Cascade)
  fromEmployee      Employee @relation("SwapsFrom", fields: [fromEmployeeId], references: [id])
  toEmployee        Employee @relation("SwapsTo", fields: [toEmployeeId], references: [id])
  
  @@index([organizationId])
  @@index([shiftId])
  @@index([fromEmployeeId])
  @@index([toEmployeeId])
  @@map("shift_swaps")
}

model EmployeeAvailability {
  id                String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  organizationId    String    @map("organization_id") @db.Uuid
  employeeId        String    @map("employee_id") @db.Uuid
  dayOfWeek         Int       @map("day_of_week")
  startTime         DateTime? @map("start_time") @db.Time
  endTime           DateTime? @map("end_time") @db.Time
  isAvailable       Boolean   @default(true) @map("is_available")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")
  
  organization      Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  employee          Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  
  @@unique([employeeId, dayOfWeek])
  @@index([employeeId])
  @@map("employee_availability")
}

model Notification {
  id                String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  organizationId    String    @map("organization_id") @db.Uuid
  userId            String    @map("user_id") @db.Uuid
  type              String    @db.VarChar(50)
  title             String    @db.VarChar(255)
  message           String    @db.Text
  data              Json?
  isRead            Boolean   @default(false) @map("is_read")
  sentAt            DateTime  @default(now()) @map("sent_at")
  readAt            DateTime? @map("read_at")
  createdAt         DateTime  @default(now()) @map("created_at")
  
  organization      Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user              User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([userId, isRead])
  @@index([createdAt])
  @@map("notifications")
}

model AuditLog {
  id                String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  organizationId    String    @map("organization_id") @db.Uuid
  userId            String?   @map("user_id") @db.Uuid
  action            String    @db.VarChar(100)
  entityType        String    @map("entity_type") @db.VarChar(100)
  entityId          String?   @map("entity_id") @db.Uuid
  oldValues         Json?     @map("old_values")
  newValues         Json?     @map("new_values")
  ipAddress         String?   @map("ip_address") @db.VarChar(45)
  userAgent         String?   @map("user_agent") @db.Text
  createdAt         DateTime  @default(now()) @map("created_at")
  
  organization      Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  @@index([organizationId])
  @@index([userId])
  @@index([entityType, entityId])
  @@index([createdAt])
  @@map("audit_logs")
}

model Session {
  id                String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId            String    @map("user_id") @db.Uuid
  refreshToken      String    @unique @map("refresh_token") @db.VarChar(500)
  ipAddress         String?   @map("ip_address") @db.VarChar(45)
  userAgent         String?   @map("user_agent") @db.Text
  expiresAt         DateTime  @map("expires_at")
  createdAt         DateTime  @default(now()) @map("created_at")
  
  user              User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([refreshToken])
  @@index([expiresAt])
  @@map("sessions")
}
```

---

## Migration Strategy

### Initial Migration

```bash
# Create initial schema
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

### Subsequent Migrations

```bash
# Create a new migration
npx prisma migrate dev --name add_employee_metadata

# Apply migrations in production
npx prisma migrate deploy
```

### Seeding Data

```typescript
// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Create default organization
  const org = await prisma.organization.create({
    data: {
      name: 'Acme Hospital',
      slug: 'acme-hospital',
      email: 'admin@acme.com',
      subscriptionTier: 'premium',
    },
  });

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: 'admin@acme.com',
      passwordHash: '$2b$10$...',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      emailVerified: true,
    },
  });

  console.log({ org, admin });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
```

Run seed:
```bash
npx prisma db seed
```

---

## Conclusion

This database schema provides a robust foundation for Staff Scheduler Pro with:

✅ **Multi-tenant architecture** - Organization-level isolation  
✅ **Referential integrity** - Foreign key constraints  
✅ **Performance optimization** - Strategic indexing  
✅ **Audit trail** - Comprehensive logging  
✅ **Scalability** - UUID primary keys, partitioning support  
✅ **Type safety** - Prisma ORM with TypeScript  

**Next Steps:**
1. Review and approve schema
2. Set up PostgreSQL database
3. Initialize Prisma
4. Run initial migration
5. Seed development data

---

**Document Owner:** Database Team  
**Version:** 1.0  
**Last Updated:** December 18, 2024
