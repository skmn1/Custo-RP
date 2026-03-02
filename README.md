# Staff Scheduler Pro

A full-stack workforce management platform with a React frontend, Spring Boot REST API, and built-in payroll engine.

---

## Features

| Module | Highlights |
|--------|------------|
| **Scheduler** | Weekly calendar with drag-and-drop shift management, real-time statistics |
| **Employees** | Full CRUD, search/filter/sort, department & role management |
| **Payroll** | Automated calculations (overtime, double-time, taxes, benefits), CSV export |
| **Point of Sale** | PoS location CRUD, employee assignment, cross-location swap |

## Tech Stack

### Frontend
- **React 19** with hooks and functional components
- **Vite 7** — fast HMR and build tooling
- **TailwindCSS 4** — utility-first styling
- **@dnd-kit** — accessible drag-and-drop
- **date-fns** — date utilities
- **React Router 7** — client-side routing

### Backend
- **Spring Boot 3.2** — REST API
- **Spring Data JPA** — persistence layer
- **H2** — in-memory database (dev), **PostgreSQL** (production profile)
- **SpringDoc OpenAPI 2.3** — auto-generated Swagger UI
- **Lombok** — boilerplate reduction
- **Commons CSV** — payroll CSV export

### Testing
- **JUnit 5 + Mockito** — 60 backend unit/integration tests
- **Cypress 14** — end-to-end frontend tests
- **ESLint** — frontend code quality

---

## Project Structure

```
scheduler/
├── scripts/                   # Run scripts
│   ├── start-all.sh           # Start backend + frontend
│   ├── start-backend.sh       # Start Spring Boot API only
│   ├── start-frontend.sh      # Start Vite dev server only
│   └── run-tests.sh           # Run all test suites
├── src/                       # React frontend
│   ├── api/                   # API client layer
│   │   ├── config.js          # Base URL, fetch wrapper
│   │   ├── employeesApi.js    # Employee API calls
│   │   ├── shiftsApi.js       # Shift API calls
│   │   ├── payrollApi.js      # Payroll API calls
│   │   └── posApi.js          # PoS API calls
│   ├── components/
│   │   ├── ui/                # Reusable: Button, Modal, StatCard
│   │   ├── scheduler/         # StaffScheduler, DraggableShift, etc.
│   │   ├── employees/         # EmployeeGrid, EmployeeModal, etc.
│   │   ├── payroll/           # PayrollDashboard, PayrollExport, etc.
│   │   └── pos/               # PosDashboard, PosModal, etc.
│   ├── hooks/                 # Custom hooks (useShifts, useEmployees, ...)
│   ├── pages/                 # Route pages
│   ├── utils/                 # dateUtils, shiftUtils
│   ├── data/                  # Fallback mock data
│   └── constants/             # App-wide constants
├── staff-scheduler-api/       # Spring Boot backend
│   └── src/main/java/com/staffscheduler/api/
│       ├── controller/        # REST controllers (4)
│       ├── service/           # Business logic (4)
│       ├── repository/        # Spring Data JPA repos (3)
│       ├── model/             # JPA entities (3)
│       ├── dto/               # Data Transfer Objects (7)
│       ├── config/            # CORS, OpenAPI config
│       ├── exception/         # Global error handling
│       └── util/              # PayrollCalculator
├── cypress/                   # E2E test specs
├── docs/                      # Architecture & design docs
└── package.json
```

---

## Quick Start

### Prerequisites

| Tool | Version | Installation |
|------|---------|-------------|
| **Node.js** | 16+ | [nodejs.org](https://nodejs.org) |
| **Java** | 17+ | [SDKMAN](https://sdkman.io): `sdk install java 17.0.13-tem` |
| **Maven** | 3.8+ | Included in the project via `mvnw`, or install via SDKMAN |

### One-Command Start

```bash
# Start both backend (port 8080) and frontend (port 5173)
npm start
# — or —
./scripts/start-all.sh
```

### Start Individually

```bash
# Terminal 1 — Backend API
npm run start:backend
# — or —
./scripts/start-backend.sh

# Terminal 2 — Frontend
npm run start:frontend
# — or —
./scripts/start-frontend.sh
```

### URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080/api |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| OpenAPI JSON | http://localhost:8080/api-docs |
| H2 Console | http://localhost:8080/h2-console |

> **Vite Proxy**: The frontend proxies `/api/*` requests to `localhost:8080`, so the app works seamlessly in development.

---

## API Overview

All endpoints are under `/api`. Full interactive documentation is available at the Swagger UI link above.

### Employees — `/api/employees`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/employees` | List all (search, filter, sort) |
| `GET` | `/api/employees/{id}` | Get by ID |
| `POST` | `/api/employees` | Create |
| `PUT` | `/api/employees/{id}` | Update |
| `DELETE` | `/api/employees/{id}` | Delete |
| `GET` | `/api/employees/departments` | List distinct departments |
| `GET` | `/api/employees/roles` | List distinct roles |

### Shifts — `/api/shifts`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/shifts` | List (date range, employee, dept, type) |
| `GET` | `/api/shifts/{id}` | Get by ID |
| `POST` | `/api/shifts` | Create |
| `PUT` | `/api/shifts/{id}` | Update |
| `PATCH` | `/api/shifts/{id}/move` | Move (drag-and-drop) |
| `DELETE` | `/api/shifts/{id}` | Delete |

### Payroll — `/api/payroll`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/payroll?startDate=&endDate=` | Summary |
| `GET` | `/api/payroll/employees?startDate=&endDate=` | Per-employee detail |
| `GET` | `/api/payroll/departments?startDate=&endDate=` | Department breakdown |
| `GET` | `/api/payroll/statistics?startDate=&endDate=` | Statistics |
| `GET` | `/api/payroll/export/csv?startDate=&endDate=` | CSV download |

### Point of Sale — `/api/pos`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/pos` | List locations |
| `GET` | `/api/pos/{id}` | Detail with employees & dashboard |
| `POST` | `/api/pos` | Create location |
| `PUT` | `/api/pos/{id}` | Update location |
| `DELETE` | `/api/pos/{id}` | Soft-delete (deactivate) |
| `GET` | `/api/pos/managers` | List managers |
| `GET` | `/api/pos/{posId}/employees` | Employees in PoS |
| `GET` | `/api/pos/{posId}/available-employees` | Available for swap |
| `POST` | `/api/pos/{posId}/employees` | Add employee to PoS |
| `PUT` | `/api/pos/{posId}/employees/{empId}` | Update employee in PoS |
| `DELETE` | `/api/pos/{posId}/employees/{empId}` | Remove from PoS |
| `PUT` | `/api/pos/{posId}/employees/{empId}/swap` | Swap employees |

### Error Format

All errors return a standard envelope:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Employee not found with id: emp-999",
    "details": []
  }
}
```

| Code | HTTP Status | Meaning |
|------|-------------|---------|
| `NOT_FOUND` | 404 | Resource does not exist |
| `DUPLICATE_RESOURCE` | 409 | Unique constraint violation (e.g. email) |
| `VALIDATION_ERROR` | 400 | Request body validation failed |
| `BAD_REQUEST` | 400 | Invalid argument |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Testing

```bash
# Run all tests (backend + frontend lint)
npm run test:all

# Backend only (60 JUnit tests)
cd staff-scheduler-api && mvn test

# Frontend lint
npm run lint

# Cypress E2E (requires frontend running)
npm run cy:open    # Interactive
npm run cy:run     # Headless
npm run cy:dev     # Start frontend + open Cypress
```

---

## Database

### Development (default)
H2 in-memory database, auto-seeded with 12 employees, 12 shifts, and 5 PoS locations via `data.sql`.

- **H2 Console**: http://localhost:8080/h2-console
- **JDBC URL**: `jdbc:h2:mem:staffscheduler`
- **User**: `sa` (no password)

### Production
Activate the PostgreSQL profile:

```bash
./scripts/start-backend.sh postgres
# — or —
cd staff-scheduler-api && mvn spring-boot:run -Dspring-boot.run.profiles=postgres
```

Configure connection in `application.yml` or via environment variables:

```yaml
spring.datasource.url: jdbc:postgresql://localhost:5432/staff_scheduler
spring.datasource.username: staff_scheduler_user
spring.datasource.password: staff_scheduler_password
```

---

## Development

### Available npm Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start backend + frontend together |
| `npm run start:backend` | Start Spring Boot API only |
| `npm run start:frontend` | Start Vite dev server only |
| `npm run dev` | Start Vite only (alias for `start:frontend`) |
| `npm run build` | Production build (frontend) |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test:all` | Run backend tests + frontend lint |
| `npm run cy:open` | Open Cypress Test Runner |
| `npm run cy:run` | Run Cypress headless |

### Architecture

- **Frontend hooks** (`useEmployees`, `useShifts`, etc.) call the API layer (`src/api/`) with automatic fallback to mock data when the backend is offline
- **Vite proxy** forwards `/api/*` to the backend at port 8080
- **Backend** follows standard Spring Boot layering: Controller → Service → Repository → JPA Entity

### Adding Features

1. **New API endpoint**: Add controller method → service method → repository query
2. **New frontend page**: Create page in `src/pages/`, add route in `App.jsx`
3. **New hook**: Add to `src/hooks/` following the `use[Feature]` convention
4. **New component**: Add to appropriate `src/components/` subfolder

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'feat: add my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## License

MIT License — see [LICENSE](LICENSE) for details.
