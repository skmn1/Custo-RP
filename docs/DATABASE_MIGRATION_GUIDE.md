# Migration & Setup Guide

**Staff Scheduler Pro - Database Migration & Initialization Procedures**

---

## Pre-Migration Checklist

- [ ] PostgreSQL 15+ is installed and running
- [ ] Database user `scheduler_admin` is created
- [ ] Database `staff_scheduler` is created and accessible
- [ ] Spring Boot backend dependencies are up-to-date
- [ ] `application.yml` is configured with PostgreSQL credentials
- [ ] Current H2/in-memory data has been backed up if needed

---

## Step 1: Create PostgreSQL Database

### On Local Development Machine

```bash
# Start PostgreSQL (if not running)
sudo systemctl start postgresql

# Connect as postgres superuser
sudo -u postgres psql

# Execute setup commands
CREATE USER scheduler_admin WITH PASSWORD 'scheduler_password';
ALTER ROLE scheduler_admin CREATEDB;
CREATE DATABASE staff_scheduler OWNER scheduler_admin;
GRANT ALL PRIVILEGES ON DATABASE staff_scheduler TO scheduler_admin;
\q
```

### Verify Connection

```bash
psql -h localhost -U scheduler_admin -d staff_scheduler
# Should connect successfully

# Check tables don't exist yet
\dt
# Should return: No relations found in schema "public"

# Exit
\q
```

---

## Step 2: Configure Spring Boot Application

### Update `application.yml`

```yaml
# Default profile uses PostgreSQL (dev environment)
spring:
  profiles:
    active: dev
  
  data source:
    url: jdbc:postgresql://localhost:5432/staff_scheduler
    driver-class-name: org.postgresql.Driver
    username: scheduler_admin
    password: scheduler_password
    
  jpa:
    hibernate:
      ddl-auto: create  # First run: 'create', then 'update'
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
```

**Important:** `ddl-auto: create` will DROP and recreate tables. Use `update` for subsequent runs.

---

## Step 3: Start Backend (Auto-Migration)

### First-Time Setup

```bash
cd staff-scheduler-api

# Build project
mvn clean package

# Start with PostgreSQL profile
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"

# Expected output:
# - Connection established to PostgreSQL
# - Tables created (employees, shifts, point_of_sale)
# - Seed data inserted
# - Application listening on http://localhost:8080
```

### Verify Migration Success

```bash
# In another terminal, connect to database
psql -h localhost -U scheduler_admin -d staff_scheduler

# List tables
\dt
# Output:
# Schema | Name | Type | Owner
# --------+---------+-------+------------------
# public | employees | table | scheduler_admin
# public | shifts | table | scheduler_admin
# public | point_of_sale | table | scheduler_admin

# Count records
SELECT COUNT(*) FROM employees;    -- 12
SELECT COUNT(*) FROM shifts;       -- 12
SELECT COUNT(*) FROM point_of_sale; -- 5

\q
```

---

## Step 4: Verify Data Integrity

### Check All Constraints

```bash
psql -h localhost -U scheduler_admin -d staff_scheduler

-- List all indexes
\di

-- Expected indexes:
-- idx_employees_email
-- idx_employees_department
-- idx_employees_role
-- idx_employees_status
-- idx_employees_name
-- idx_shifts_date (CRITICAL)
-- idx_shifts_employee_id
-- idx_shifts_employee_date

-- Verify foreign keys
\d employees  -- Should show: pos_id FK -> point_of_sale(id)
\d shifts     -- Should show: employee_id FK -> employees(id)

-- Check sample data
SELECT id, name, email FROM employees LIMIT 3;
SELECT id, employee_id, date FROM shifts LIMIT 3;

\q
```

### Test Data Persistence

```bash
# Start frontend
npm run dev

# Create a new employee via UI
# (Use browser to add an employee)

# Verify in database
psql -h localhost -U scheduler_admin -d staff_scheduler
SELECT * FROM employees ORDER BY created_at DESC LIMIT 1;
# Should show the newly created employee

# Refresh browser page
# Employee should still appear (data persisted!)
```

---

## Subsequent Runs (Update Migration)

### Change `ddl-auto` to `update`

```yaml
# application.yml
spring:
  jpa:
    hibernate:
      ddl-auto: update  # Don't drop tables, only apply changes
```

### Start Backend

```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"

# Tables should already exist
# New migrations applied only if schema.sql changes
```

---

## Rollback Procedures

### Scenario: Need to Reset Database

```bash
# 1. Stop the backend (Ctrl+C)

# 2. Connect to database
psql -h localhost -U scheduler_admin -d staff_scheduler

# 3. Drop all tables
DROP TABLE IF EXISTS shifts CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS point_of_sale CASCADE;

\q

# 4. Set ddl-auto back to 'create' temporarily
# In application.yml: ddl-auto: create

# 5. Restart backend
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"

# 6. After successful startup, change back to 'update'
```

### Scenario: Specific Table Needs Reset

```bash
psql -h localhost -U scheduler_admin -d staff_scheduler

-- Clear shifts (preserves employees)
DELETE FROM shifts;

-- Clear employees (cascade deletes shifts)
DELETE FROM employees;

-- Restart backend to reseed data
```

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] Database backups are configured
- [ ] PostgreSQL 15+ is installed on production server
- [ ] Database credentials are securely stored (environment variables)
- [ ] Connection pool is sized appropriately (max-pool-size: 20)
- [ ] Monitoring is configured (connection pool metrics, query logging)

### Set Environment Variables

```bash
# On production server
export DATABASE_URL="postgresql://scheduler_admin:secure_password@prod.postgres.server:5432/staff_scheduler"

# Or in systemd service file
Environment="DATABASE_URL=postgresql://scheduler_admin:password@localhost:5432/staff_scheduler"
```

### Deploy with `ddl-auto: validate`

```yaml
# application-prod.yml
spring:
  profiles:
    active: prod
  datasource:
    url: ${DATABASE_URL}
  jpa:
    hibernate:
      ddl-auto: validate  # CRITICAL: Prevent accidental schema changes
```

This ensures the application only validates that the schema matches the Java entities; it won't modify the database.

### Start with Production Profile

```bash
java -jar staff-scheduler-api.jar --spring.profiles.active=prod
```

---

## Troubleshooting

### Error: "Connection refused"

```
Cause: PostgreSQL not running or wrong host/port

Solution:
sudo systemctl start postgresql
# Or verify host/port in application.yml
```

### Error: "FATAL: role 'scheduler_admin' does not exist"

```
Solution:
# Recreate user
sudo -u postgres psql
CREATE USER scheduler_admin WITH PASSWORD 'scheduler_password';
GRANT ALL PRIVILEGES ON DATABASE staff_scheduler TO scheduler_admin;
\q
```

### Error: "relation 'employees' does not exist"

```
Cause: Tables not created (ddl-auto not working)

Solution:
1. Check application.yml has: ddl-auto: create (for first run)
2. Check backend logs for errors
3. Manually create tables (see schema in POSTGRESQL_SETUP.md)
```

### Error: "Duplicate key value violates unique constraint 'employees_email_key'"

```
Solution:
# Find and rename duplicate
UPDATE employees SET email = email || '_duplicate' WHERE id NOT IN (
  SELECT id FROM employees ORDER BY created_at DESC LIMIT 1
);
```

### Slow Queries

```
Solution:
1. Check if indexes exist: \di in psql
2. Create missing indexes (see POSTGRESQL_SETUP.md)
3. Run EXPLAIN ANALYZE to see query plan
4. Monitor query logs: log_min_duration_statement = 1000 (PostgreSQL config)
```

---

## Database Backup & Recovery

### Daily Backup (Development)

```bash
#!/bin/bash
# backup.sh
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
pg_dump -Fc -U scheduler_admin staff_scheduler > /backups/staff_scheduler_$TIMESTAMP.dump

echo "Backup completed: /backups/staff_scheduler_$TIMESTAMP.dump"
```

### Scheduled Backup (crontab)

```bash
# Add to crontab -e
0 2 * * * /home/user/backup.sh  # Daily at 2 AM
```

### Restore from Backup

```bash
# List backups
ls -la /backups/

# Restore
pg_restore -U scheduler_admin -d staff_scheduler -C /backups/staff_scheduler_TIMESTAMP.dump

# Verify
psql -h localhost -U scheduler_admin -d staff_scheduler
SELECT COUNT(*) FROM employees;
```

---

## Maintenance Commands

### Vacuum & Analyze (PostgreSQL Optimization)

```bash
psql -h localhost -U scheduler_admin -d staff_scheduler

-- Remove dead tuples and reclaim space
VACUUM ANALYZE;

-- For specific table
VACUUM ANALYZE employees;

\q
```

### Check Index Health

```bash
psql -h localhost -U scheduler_admin -d staff_scheduler

-- List unused indexes
SELECT schemaname, tablename, indexname
FROM pg_stat_user_indexes
WHERE idx_scan = 0;

-- Reindex table (if indexes are corrupted)
REINDEX TABLE employees;

\q
```

---

## Migration Checklist

- [x] Database created and verified
- [x] User created with correct permissions
- [x] Application configured to use PostgreSQL
- [x] Tables created automatically on startup
- [x] Seed data populated
- [x] Foreign key constraints verified
- [x] Indexes created and verified
- [x] CRUD operations tested
- [x] Data persistence verified (page refresh)
- [x] Connection pool configured
- [x] Backup procedures documented

---

**For additional schema details, see [POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md)**
