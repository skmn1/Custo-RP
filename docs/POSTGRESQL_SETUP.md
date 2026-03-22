# PostgreSQL Database Implementation Guide

**Staff Scheduler Pro - Database Persistence Layer**  
**Version:** 2.0  
**Date:** March 22, 2026  
**Feature Task:** 02-database-persistence-postgresql  

---

## Table of Contents

1. [Database Setup](#database-setup)
2. [Connection Configuration](#connection-configuration)
3. [Table Specifications](#table-specifications)
4. [Migrations & Seeds](#migrations--seeds)
5. [Query Optimization](#query-optimization)
6. [Troubleshooting](#troubleshooting)

---

## Database Setup

### Prerequisites

- PostgreSQL 15+ installed  
- `psql` CLI tool available  
- Database user with createdb permissions  

### Create Database User and Database

```bash
# Connect to PostgreSQL as superuser
sudo -u postgres psql

# Create user
CREATE USER scheduler_admin WITH PASSWORD 'scheduler_password';

# Grant privileges
ALTER ROLE scheduler_admin CREATEDB;

# Create database
CREATE DATABASE staff_scheduler OWNER scheduler_admin;

# Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE staff_scheduler TO scheduler_admin;

# Exit psql
\q
```

### Verify Setup

```bash
psql -h localhost -U scheduler_admin -d staff_scheduler
```

---

## Connection Configuration

### Development Environment (application-dev.yml)

```yaml
spring:
  profiles:
    active: dev
  datasource:
    url: jdbc:postgresql://localhost:5432/staff_scheduler
    username: scheduler_admin
    password: scheduler_password
    hikari:
      maximum-pool-size: 10
      minimum-idle: 2
      connection-timeout: 30000
      auto-commit: true
  jpa:
    hibernate:
      ddl-auto: update
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
```

### Production Environment

```yaml
spring:
  profiles:
    active: prod
  datasource:
    url: ${DATABASE_URL}  # Set via environment variable
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
  jpa:
    hibernate:
      ddl-auto: validate  # IMPORTANT: Prevent accidental schema changes
```

---

## Table Specifications

### Employees Table

```sql
CREATE TABLE employees (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  role VARCHAR(50) NOT NULL,
  department VARCHAR(100),
  hourly_rate DECIMAL(6,2) DEFAULT 0.00,
  max_hours INTEGER NOT NULL DEFAULT 40,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  avatar VARCHAR(5),
  color VARCHAR(50),
  hire_date DATE,
  pos_id BIGINT,
  is_manager BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pos_id FOREIGN KEY (pos_id) 
    REFERENCES point_of_sale(id) ON DELETE SET NULL
);

-- Indexes for common queries
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_role ON employees(role);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_name ON employees(name);
CREATE INDEX idx_employees_pos_id ON employees(pos_id);
```

#### Field Reference

| Column | Type | Notes |
|--------|------|-------|
| `id` | VARCHAR(50) | Format: `emp_1234567890_abc123` |
| `name` | VARCHAR(100) | Full name (required, 2-100 chars) |
| `email` | VARCHAR(255) | Unique, required, valid email format |
| `phone` | VARCHAR(20) | Optional contact number |
| `role` | VARCHAR(50) | Job title (required) |
| `department` | VARCHAR(100) | Department name |
| `hourly_rate` | DECIMAL(6,2) | Compensation rate (0.00-999.99) |
| `max_hours` | INTEGER | Max weekly hours (1-168) |
| `status` | VARCHAR(20) | `active` or `inactive` |
| `avatar` | VARCHAR(5) | Initials (e.g., "SJ") |
| `color` | VARCHAR(50) | Tailwind color class |
| `hire_date` | DATE | Employment start date |
| `pos_id` | BIGINT | Foreign key to point_of_sale |
| `is_manager` | BOOLEAN | Manager flag |
| `created_at` | TIMESTAMP | Auto-set on insert |
| `updated_at` | TIMESTAMP | Auto-updated on any change |

---

### Shifts Table

```sql
CREATE TABLE shifts (
  id VARCHAR(80) PRIMARY KEY,
  employee_id VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  day_index INTEGER NOT NULL,
  start_time VARCHAR(5) NOT NULL,
  end_time VARCHAR(5) NOT NULL,
  duration DECIMAL(4,1) NOT NULL,
  type VARCHAR(50) DEFAULT 'Regular',
  department VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_employee_id FOREIGN KEY (employee_id) 
    REFERENCES employees(id) ON DELETE CASCADE
);

-- CRITICAL: Index on date for weekly/monthly queries
CREATE INDEX idx_shifts_date ON shifts(date);
CREATE INDEX idx_shifts_employee_id ON shifts(employee_id);
CREATE INDEX idx_shifts_type ON shifts(type);

-- Composite index for duplicate detection and range queries
CREATE INDEX idx_shifts_employee_date ON shifts(employee_id, date);
```

#### Field Reference

| Column | Type | Notes |
|--------|------|-------|
| `id` | VARCHAR(80) | Format: `shift_1234567890_abc123` |
| `employee_id` | VARCHAR(50) | References employees.id (CASCADE DELETE) |
| `date` | DATE | Shift date (YYYY-MM-DD) |
| `day_index` | INTEGER | 0=Mon, 1=Tue, ..., 6=Sun |
| `start_time` | VARCHAR(5) | 24-hour format (HH:MM) |
| `end_time` | VARCHAR(5) | 24-hour format (HH:MM) |
| `duration` | DECIMAL(4,1) | Calculated hours (8.0, 8.5, etc.) |
| `type` | VARCHAR(50) | Regular, Morning, Afternoon, Night, Overtime |
| `department` | VARCHAR(100) | Department override |
| `notes` | TEXT | Free-form notes |
| `created_at` | TIMESTAMP | Auto-set on insert |
| `updated_at` | TIMESTAMP | Auto-updated on any change |

---

### Point of Sale Table

```sql
CREATE TABLE point_of_sale (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(500),
  type VARCHAR(50),
  phone VARCHAR(20),
  manager_id VARCHAR(50),
  manager_name VARCHAR(100),
  opening_hours JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_manager_id FOREIGN KEY (manager_id) 
    REFERENCES employees(id) ON DELETE SET NULL
);

CREATE INDEX idx_pos_name ON point_of_sale(name);
CREATE INDEX idx_pos_active ON point_of_sale(is_active);
```

---

## Migrations & Seeds

### Running Migrations

Migrations run automatically on application startup (configured via `ddl-auto: update`).

```bash
# In development, start the backend
cd staff-scheduler-api
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"

# Tables will be created automatically
```

### Seed Data

Seed data is loaded from `src/main/resources/data.sql` automatically:

```bash
# Data loads automatically on startup
# To manually verify:
psql -h localhost -U scheduler_admin -d staff_scheduler

# Check data
SELECT COUNT(*) FROM employees;    -- Should show 12
SELECT COUNT(*) FROM shifts;       -- Should show 12
```

### Reset Database (Development Only)

```bash
# Connect to PostgreSQL
psql -h localhost -U scheduler_admin -d staff_scheduler

# Drop all tables
DROP TABLE IF EXISTS shifts CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS point_of_sale CASCADE;

# Exit
\q

# Restart backend to recreate tables and seed
```

---

## Query Optimization

### Most Common Queries

#### 1. Get Weekly Schedule

```sql
SELECT s.*, e.name, e.hourly_rate
FROM shifts s
JOIN employees e ON s.employee_id = e.id
WHERE s.date BETWEEN $1 AND $2
ORDER BY s.date, e.name;
```

**Execution Plan:** Uses `idx_shifts_date` index  
**Expected Time:** < 50ms for 1000 shifts  

#### 2. Get Employee Schedule

```sql
SELECT * FROM shifts
WHERE employee_id = $1
  AND date BETWEEN $2 AND $3
ORDER BY date;
```

**Execution Plan:** Uses `idx_shifts_employee_date` composite index  
**Expected Time:** < 20ms  

#### 3. Calculate Payroll

```sql
SELECT e.id, e.name, e.hourly_rate,
       SUM(s.duration) as total_hours,
       LEAST(SUM(s.duration), 40) as regular_hours,
       GREATEST(SUM(s.duration) - 40, 0) as overtime_hours
FROM employees e
LEFT JOIN shifts s ON e.id = s.employee_id
WHERE s.date BETWEEN $1 AND $2
GROUP BY e.id, e.name, e.hourly_rate
ORDER BY e.name;
```

**Execution Plan:** Uses `idx_shifts_employee_date` or `idx_shifts_date`  
**Expected Time:** < 100ms for 100 employees  

#### 4. Search Employees

```sql
SELECT * FROM employees
WHERE (LOWER(name) LIKE LOWER($1)
   OR LOWER(role) LIKE LOWER($1))
  AND status = 'active'
ORDER BY name;
```

**Execution Plan:** Uses `idx_employees_name`, `idx_employees_role`, `idx_employees_status`  
**Expected Time:** < 30ms  

### EXPLAIN ANALYZE Examples

```sql
-- Analyze query performance
EXPLAIN ANALYZE
SELECT * FROM shifts
WHERE date BETWEEN '2026-03-02' AND '2026-03-08'
ORDER BY date;

-- Output shows:
-- - Seq Scan or Index Scan (should be Index Scan)
-- - Execution time
-- - Number of rows
```

---

## Connection Pool Details

### HikariCP Configuration

```yaml
hikari:
  maximum-pool-size: 10     # Dev: 10, Prod: 20
  minimum-idle: 2           # Keep 2 idle connections
  connection-timeout: 30000 # Wait 30s for connection
  idle-timeout: 600000      # Close idle after 10 min
  max-lifetime: 1800000     # Max 30 min connection lifetime
```

### Monitoring Connection Pool

```java
// In Spring Boot, check via actuator
GET http://localhost:8080/actuator/metrics/hikaricp.connections

// Output shows:
// hikaricp.connections{pool="HikariPool-1",state="idle"}
// hikaricp.connections{pool="HikariPool-1",state="active"}
```

---

## Troubleshooting

### Connection Issues

**Problem:** `Connection refused`

```
solution:
1. Check PostgreSQL is running: sudo systemctl status postgresql
2. Verify credentials in application.yml
3. Test connection: psql -h localhost -U scheduler_admin -d staff_scheduler
```

**Problem:** `Authentication failed`

```
Solution:
1. Verify password is correct
2. Check pg_hba.conf for authentication method
3. Reset password: ALTER USER scheduler_admin WITH PASSWORD 'new_password';
```

### Data Issues

**Problem:** Duplicate email validation fails

```sql
-- Check for duplicates
SELECT email, COUNT(*) as count
FROM employees
GROUP BY email
HAVING COUNT(*) > 1;

-- Remove duplicates (after review)
DELETE FROM employees
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) as rn
    FROM employees
  ) t WHERE rn > 1
);
```

**Problem:** Orphaned shifts after employee delete

```
Solution: This is prevented by CASCADE DELETE on the foreign key.
When you delete an employee, all their shifts are automatically deleted.

-- Verify:
SELECT * FROM shifts WHERE employee_id = 'emp1';
-- After employee 'emp1' is deleted, this returns 0 rows
```

### Performance Issues

**Problem:** Slow weekly schedule query

```sql
-- Check if index exists
SELECT * FROM pg_stat_user_indexes WHERE relname = 'shifts';

-- If missing, create index
CREATE INDEX idx_shifts_date ON shifts(date);

-- Analyze query
EXPLAIN ANALYZE
SELECT * FROM shifts WHERE date BETWEEN '2026-03-02' AND '2026-03-08';
```

---

## Spring Boot @Entity Annotations

### Employee Entity

```java
@Entity
@Table(name = "employees", indexes = {
    @Index(name = "idx_email", columnList = "email"),
    @Index(name = "idx_department", columnList = "department"),
    @Index(name = "idx_status", columnList = "status")
})
public class Employee {
    @Id
    private String id;
    
    @NotBlank
    @Column(nullable = false, length = 100)
    private String name;
    
    @NotBlank
    @Email
    @Column(nullable = false, unique = true, length = 255)
    private String email;
    
    @Column(name = "hourly_rate", precision = 6, scale = 2)
    private BigDecimal hourlyRate;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

### Shift Entity

```java
@Entity
@Table(name = "shifts", indexes = {
    @Index(name = "idx_shift_date", columnList = "date"),
    @Index(name = "idx_shift_employee_id", columnList = "employee_id")
})
public class Shift {
    @Id
    private String id;
    
    @NotBlank
    @Column(name = "employee_id", nullable = false)
    private String employeeId;
    
    @NotNull
    @Column(nullable = false)
    private LocalDate date;
    
    @Temporal(TemporalType.DATE)
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
```

---

## Acceptance Criteria Checklist

- [x] PostgreSQL 15+ database created
- [x] All required tables with constraints and indexes
- [x] Connection pooling configured (HikariCP)
- [x] Seed data populates from existing mock data
- [x] Employee CRUD operations persist
- [x] Shift operations persist correctly
- [x] Foreign key constraints enforce data integrity
- [x] Email uniqueness enforced
- [x] Timestamps track created/updated times
- [x] Data survives page refresh
- [x] Application configuration for dev/test/prod

---

**For detailed schema diagrams and more information, see [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)**
