# Staff Scheduler API — Spring Boot Backend

REST API backend for Staff Scheduler Pro. Provides employee management, shift scheduling, payroll calculations, and Point of Sale management.

## Quick Start

```bash
# From project root
./scripts/start-backend.sh

# Or directly
cd staff-scheduler-api
mvn spring-boot:run
```

The server starts on **http://localhost:8080**.

## API Documentation

Interactive Swagger UI is available at:

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/api-docs

## Modules

### Employees (`/api/employees`)
Full CRUD for employee profiles with search, filtering by department/role, and sorting. Avatar initials and display colors are auto-generated.

### Shifts (`/api/shifts`)
Weekly shift scheduling with date-range queries, employee/department/type filtering, and a `PATCH /move` endpoint for drag-and-drop support. Duration is auto-calculated from start/end times.

### Payroll (`/api/payroll`)
Automated payroll calculation engine:
- **Overtime**: 1.5× rate after 40 hours/week
- **Double-time**: 2× rate after 60 hours/week
- **Shift differentials**: Evening (+10%), night (+15%)
- **Taxes**: Federal (22%), State (5%), Social Security (6.2%), Medicare (1.45%)
- **Benefits**: Health insurance, 401(k) deductions
- **CSV Export**: Download payroll data as a CSV file

### Point of Sale (`/api/pos`)
PoS location management with employee assignment, removal, and cross-location swap. Supports opening hours, manager assignment, and soft-delete.

## Project Structure

```
src/main/java/com/staffscheduler/api/
├── controller/          # REST endpoints
│   ├── EmployeeController.java
│   ├── ShiftController.java
│   ├── PayrollController.java
│   └── PosController.java
├── service/             # Business logic
│   ├── EmployeeService.java
│   ├── ShiftService.java
│   ├── PayrollService.java
│   └── PosService.java
├── repository/          # Spring Data JPA
│   ├── EmployeeRepository.java
│   ├── ShiftRepository.java
│   └── PosRepository.java
├── model/               # JPA entities
│   ├── Employee.java
│   ├── Shift.java
│   └── PointOfSale.java
├── dto/                 # Data Transfer Objects
│   ├── EmployeeDto.java
│   ├── ShiftDto.java
│   ├── ShiftMoveDto.java
│   ├── PayrollDto.java
│   ├── PosDto.java
│   ├── PosDetailDto.java
│   └── ErrorResponse.java
├── config/              # Configuration
│   ├── CorsConfig.java
│   └── OpenApiConfig.java
├── exception/           # Error handling
│   ├── GlobalExceptionHandler.java
│   ├── ResourceNotFoundException.java
│   └── DuplicateResourceException.java
└── util/
    └── PayrollCalculator.java
```

## Database

### H2 (Development — default)
In-memory database, auto-seeded with sample data on each restart.

| Setting | Value |
|---------|-------|
| Console | http://localhost:8080/h2-console |
| JDBC URL | `jdbc:h2:mem:staffscheduler` |
| Username | `sa` |
| Password | _(empty)_ |

### PostgreSQL (Production)

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=postgres
```

Default connection (configurable in `application.yml`):
- Host: `localhost:5432`
- Database: `staff_scheduler`
- User: `staff_scheduler_user`

## Testing

```bash
mvn test          # Run all 60 tests
mvn test -q       # Quiet output
```

Test breakdown:
- **EmployeeControllerTest** — 7 MockMvc tests
- **ShiftControllerTest** — 6 MockMvc tests
- **EmployeeServiceTest** — 8 unit tests
- **ShiftServiceTest** — 9 unit tests
- **EmployeeRepositoryTest** — 8 DataJpa tests
- **PayrollCalculatorTest** — 21 unit tests
- **ApplicationContextTest** — 1 integration test

## Technology

| Library | Version | Purpose |
|---------|---------|---------|
| Spring Boot | 3.2.0 | Application framework |
| Spring Data JPA | 3.2.0 | ORM & repository layer |
| Spring Validation | 3.2.0 | Request validation |
| SpringDoc OpenAPI | 2.3.0 | API documentation |
| H2 Database | - | Dev database |
| PostgreSQL Driver | - | Production database |
| Lombok | - | Boilerplate reduction |
| Commons CSV | 1.10.0 | CSV export |
