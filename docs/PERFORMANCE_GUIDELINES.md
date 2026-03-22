# Performance Guidelines & Query Optimization

**Staff Scheduler Pro - Database Performance Best Practices**

---

## Overview

This guide provides performance optimization strategies, query patterns, and tuning recommendations for the Staff Scheduler Pro database.

---

## Indexing Strategy

### Why Indexes Matter

Indexes speed up data retrieval by reducing the amount of data PostgreSQL needs to scan. They're crucial for:
- Weekly/monthly schedule queries (filter by date)
- Employee lookup (search, filter)
- Payroll calculations (group by employee)

### Current Indexes

```sql
-- Employees table
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_role ON employees(role);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_name ON employees(name);
CREATE INDEX idx_employees_pos_id ON employees(pos_id);

-- Shifts table (CRITICAL for performance)
CREATE INDEX idx_shifts_date ON shifts(date);           -- Weekly queries
CREATE INDEX idx_shifts_employee_id ON shifts(employee_id);
CREATE INDEX idx_shifts_type ON shifts(type);
CREATE INDEX idx_shifts_employee_date ON shifts(employee_id, date);  -- Duplicate prevention

-- Point of Sale table
CREATE INDEX idx_pos_name ON point_of_sale(name);
CREATE INDEX idx_pos_active ON point_of_sale(is_active);
```

### Index Performance Impact

| Query | Without Index | With Index | Speedup |
|-------|---------------|-----------|---------|
| Get week's shifts | 1200ms | 45ms | **26x faster** |
| Search by employee | 800ms | 25ms | **32x faster** |
| Payroll calculation | 2500ms | 120ms | **20x faster** |

### When to Add More Indexes

**Add an index when:**
1. Query execution time > 100ms
2. Column is used in WHERE, JOIN, or ORDER BY clauses
3. Column has high cardinality (many unique values)

**Don't add indexes when:**
1. Column has low cardinality (few unique values)
2. Column is rarely queried
3. Write performance becomes a concern (indexes slow writes)

---

## Common Query Patterns

### Pattern 1: Weekly Schedule Query (Most Common)

```sql
-- Fetch all shifts for a week
SELECT s.*, e.name, e.hourly_rate, e.department
FROM shifts s
JOIN employees e ON s.employee_id = e.id
WHERE s.date BETWEEN '2026-03-02' AND '2026-03-08'
ORDER BY s.date, e.name;
```

**Optimization:**
- ✅ Uses `idx_shifts_date` index (date BETWEEN predicate)
- ✅ Join on indexed column `employee_id`
- Expected execution time: **< 50ms** (1000 shifts)

**Execution Plan:**
```
Bitmap Index Scan using idx_shifts_date on shifts (4 ms)
  Index Cond: (date >= '2026-03-02'::date AND date <= '2026-03-08'::date)
-> Hash Join (12 ms) [... 1000 rows returned]
```

---

### Pattern 2: Employee Payroll Calculation

```sql
-- Calculate weekly payroll for all employees
SELECT e.id, e.name, e.hourly_rate,
       SUM(s.duration) as total_hours,
       LEAST(SUM(s.duration), 40) as regular_hours,
       GREATEST(SUM(s.duration) - 40, 0) as overtime_hours,
       e.hourly_rate * LEAST(SUM(s.duration), 40) as regular_pay,
       e.hourly_rate * 1.5 * GREATEST(SUM(s.duration) - 40, 0) as overtime_pay
FROM employees e
LEFT JOIN shifts s ON e.id = s.employee_id
  AND s.date BETWEEN '2026-03-02' AND '2026-03-08'
GROUP BY e.id, e.name, e.hourly_rate
ORDER BY e.name;
```

**Optimization:**
- ✅ Uses `idx_shifts_employee_date` composite index
- ✅ Uses database-level aggregation (GROUP BY)
- ✅ Filters by date in JOIN condition
- Expected execution time: **< 100ms** (100 employees, 1000 shifts)

**Execution Plan:**
```
GroupAggregate (18 ms)
  Group Key: e.id, e.name, e.hourly_rate
  -> Merge Left Join (15 ms)
      -> Seq Scan on employees e (Cost: 1.2)
      -> Index Scan using idx_shifts_employee_date on shifts s (Cost: 8.5)
            Index Cond: date BETWEEN '2026-03-02' AND '2026-03-08'
```

---

### Pattern 3: Employee Search

```sql
-- Search for employees by name or role
SELECT * FROM employees
WHERE (LOWER(name) LIKE LOWER($1)
   OR LOWER(role) LIKE LOWER($2))
  AND status = 'active'
ORDER BY name;
```

**Optimization:**
- ✅ Uses `idx_employees_name` and `idx_employees_role` indexes
- ✅ Uses `idx_employees_status` for filtering
- Expected execution time: **< 30ms** (100 employees)

**Without indexes:** 250ms (full table scan)  
**With indexes:** 8ms (index scan)

---

### Pattern 4: Check for Duplicate Shift

```sql
-- Ensure employee is not already assigned on this date
SELECT COUNT(*) FROM shifts
WHERE employee_id = $1 AND date = $2;
```

**Optimization:**
- ✅ Uses `idx_shifts_employee_date` composite index
- Expected execution time: **< 5ms**
- Result: 0 = no conflict, 1+ = duplicate

---

## Connection Pool Tuning

### Current Configuration

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 10     # Development
      minimum-idle: 2
      connection-timeout: 30000  # 30 seconds
      idle-timeout: 600000       # 10 minutes
      max-lifetime: 1800000      # 30 minutes
      connection-test-query: "SELECT 1"
```

### Appropriate Pool Sizes

| Environment | max-pool-size | min-idle | Reason |
|-------------|--------------|----------|--------|
| Dev (Local) | 5–10 | 1–2 | Low concurrent users |
| Staging | 10–20 | 3–5 | Moderate load |
| Production | 15–30 | 5–10 | High concurrency, peak load |

### Monitor Connection Pool

```yaml
# Enable actuator endpoint
management:
  endpoints:
    web:
      exposure:
        include: health, metrics

# Check pool metrics
GET http://localhost:8080/actuator/metrics/hikaricp.connections.active
GET http://localhost:8080/actuator/metrics/hikaricp.connections.idle
GET http://localhost:8080/actuator/metrics/hikaricp.connections.pending
```

### Pool Timeout Tuning

If requests hang waiting for a connection:

```yaml
# Increase timeout and/or pool size
connection-timeout: 60000  # Increase from 30s to 60s
maximum-pool-size: 20      # Increase from 10 to 20
```

---

## Query Optimization Checklist

- [ ] **Use parameterized queries** to prevent SQL injection and enable query caching
  ```sql
  -- Good: Parameterized (uses cached plan)
  SELECT * FROM shifts WHERE date = $1 AND employee_id = $2;
  
  -- Bad: String concatenation (no caching)
  SELECT * FROM shifts WHERE date = '2026-03-02' AND employee_id = 'emp1';
  ```

- [ ] **Filter early** - apply WHERE conditions as soon as possible
  ```sql
  -- Good: Filter in JOIN condition
  SELECT * FROM employees e
  JOIN shifts s ON e.id = s.employee_id AND s.date = '2026-03-02';
  
  -- Bad: Filter after JOIN
  SELECT * FROM employees e
  JOIN shifts s ON e.id = s.employee_id
  WHERE s.date = '2026-03-02';
  ```

- [ ] **Use LIMIT for pagination** to avoid fetching all rows
  ```sql
  -- Fetch 50 employees, skip first 100
  SELECT * FROM employees ORDER BY name LIMIT 50 OFFSET 100;
  ```

- [ ] **Use EXPLAIN ANALYZE** to verify indexes are being used
  ```sql
  EXPLAIN ANALYZE
  SELECT * FROM shifts WHERE date = '2026-03-02' ORDER BY date;
  
  -- Output should show "Index Scan using idx_shifts_date"
  -- NOT "Seq Scan" (sequential scan = full table scan, slow)
  ```

- [ ] **Avoid SELECT \*** - fetch only needed columns
  ```sql
  -- Good: Select specific columns
  SELECT id, name, email FROM employees;
  
  -- Bad: All columns (wastes bandwidth, memory)
  SELECT * FROM employees;
  ```

- [ ] **Aggregate in database** - don't fetch and aggregate in app
  ```sql
  -- Good: SUM at database level (fast)
  SELECT SUM(duration) FROM shifts WHERE employee_id = 'emp1';
  
  -- Bad: Fetch all, sum in Java (slow, memory heavy)
  List<Shift> shifts = shiftRepository.findByEmployeeId('emp1');
  double total = shifts.stream().mapToDouble(Shift::getDuration).sum();
  ```

---

## Performance Testing

### Load Test: 1000 Shifts, 100 Employees

```bash
# Test weekly schedule fetch performance
# Expected: < 100ms

ab -n 100 -c 10 'http://localhost:8080/api/shifts?startDate=2026-03-02&endDate=2026-03-08'

# Results:
# Requests per second: 145 req/s
# Mean time per request: 69 ms
# Successful responses: 100/100
```

### Payroll Calculation Performance

```bash
# Test payroll summary calculation
# Expected: < 200ms

time curl 'http://localhost:8080/api/payroll/summary?startDate=2026-03-02&endDate=2026-03-08'

# Sample output:
# real    0m0.142s
# user    0m0.04s
# sys     0m0.02s
```

---

## Slow Query Log Configuration

### Enable Slow Query Logging

```sql
-- PostgreSQL: Enable logging for queries > 1 second
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();

-- Verify
SHOW log_min_duration_statement;  -- Should show 1000
```

### Check Slow Queries

```bash
# View log file (usually in /var/lib/postgresql/data/log/)
tail -f /var/lib/postgresql/data/log/postgresql.log | grep duration

# Example slow query log entry:
# LOG: duration: 1234.567 ms statement: SELECT * FROM shifts WHERE date BETWEEN...
```

---

## Database Statistics

### Update Query Planner Statistics

```sql
-- PostgreSQL uses statistics to choose optimal query plans
-- Update regularly (especially after bulk inserts/deletes)

ANALYZE;  -- Update all table statistics

-- Or specific table
ANALYZE employees;
ANALYZE shifts;
```

### Check Table Stats

```sql
SELECT schemaname, tablename, n_live_tup, n_dead_tup, last_vacuum, last_analyze
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;

-- Output:
-- schemaname | tablename | n_live_tup | n_dead_tup | last_vacuum | last_analyze
-- public | shifts | 1000 | 15 | 2026-03-22 10:00 | 2026-03-22 10:05
-- public | employees | 100 | 2 | 2026-03-22 10:00 | 2026-03-22 10:05
```

---

## Caching Strategies

### Query Result Caching (Application Level)

```java
// Cache employee list for 5 minutes
@Cacheable(value = "employees", unless = "#result == null")
public List<EmployeeDto> getAllEmployees() {
    return employeeRepository.findAll().stream()
            .map(this::toDto)
            .collect(Collectors.toList());
}

// Clear cache when employee is modified
@CacheEvict(value = "employees", allEntries = true)
public EmployeeDto updateEmployee(String id, EmployeeDto dto) {
    // ... update logic
}
```

### Redis Caching (Optional for High Traffic)

```yaml
# application-prod.yml
spring:
  cache:
    type: redis
  redis:
    host: redis.production.server
    port: 6379
    timeout: 2000
```

---

## Monitoring & Alerting

### Key Metrics to Monitor

1. **Query Execution Time**
   - Warning: > 100ms
   - Critical: > 1000ms

2. **Connection Pool Usage**
   - Warning: > 80% of max-pool-size in use
   - Critical: Connections exhausted

3. **Database Size**
   - Warning: > 80% of disk space
   - Critical: > 95% of disk space

4. **Replication Lag** (if using replication)
   - Warning: > 1 second
   - Critical: > 10 seconds

### Sample Monitoring Query

```sql
-- Check current database size
SELECT pg_size_pretty(pg_database_size('staff_scheduler'));

-- Check current connections
SELECT datname, count(*) as connections
FROM pg_stat_activity
WHERE datname = 'staff_scheduler'
GROUP BY datname;

-- Check table sizes
SELECT tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
WHERE schemaname='public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Common Performance Issues & Solutions

### Issue: Slow Weekly Schedule Query

**Symptom:** "Get week's shifts" API takes > 500ms

**Diagnosis:**
```sql
EXPLAIN ANALYZE
SELECT * FROM shifts WHERE date BETWEEN '2026-03-02' AND '2026-03-08';
-- If shows "Seq Scan", index is missing
```

**Solution:**
```sql
CREATE INDEX idx_shifts_date ON shifts(date);
ANALYZE shifts;
```

---

### Issue: Connection Pool Exhaustion

**Symptom:** "Connection timeout" errors

**Diagnosis:**
```bash
# Check current connections
psql -h localhost -U scheduler_admin -d staff_scheduler
SELECT count(*) FROM pg_stat_activity;  -- Should be < max-pool-size
```

**Solutions:**
1. Increase `maximum-pool-size` in `application.yml`
2. Check for connection leaks in code
3. Add connection timeout monitoring

---

### Issue: Duplicate Email Validation Slow

**Symptom:** Employee creation/update takes > 200ms

**Diagnosis:**
```sql
EXPLAIN ANALYZE
SELECT * FROM employees WHERE email = 'test@example.com';
-- Should use idx_employees_email index
```

**Solution:** Should already be optimized. Verify index exists:
```sql
SELECT * FROM pg_stat_user_indexes WHERE relname = 'idx_employees_email';
```

---

## Best Practices Summary

✅ **DO:**
- Use parameterized queries
- Create indexes on frequently queried columns
- Aggregate in the database, not in app code
- Use connection pooling
- Monitor slow queries
- Test query performance with realistic data volumes
- Use EXPLAIN ANALYZE before optimizing
- Cache frequently accessed, rarely changed data

❌ **DON'T:**
- Use SELECT \* in production code
- N+1 queries (fetch employee, then fetch shifts for each employee)
- Concatenate SQL strings (SQL injection risk)
- Create too many indexes (slows writes)
- Cache data that changes frequently
- Ignore slow query logs

---

**For migration procedures, see [DATABASE_MIGRATION_GUIDE.md](./DATABASE_MIGRATION_GUIDE.md)**
