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
| **Stock Management** | Items, categories, movements, stocktakes, purchase orders, supplier catalogue |
| **Supplier Invoices (AP)** | French-law compliant AP module — SIRET/TVA validation, PDF archival, payment tracking, KPI dashboard |

## Tech Stack

### Frontend
- **React 19** with hooks and functional components
- **Vite 7** — fast HMR and build tooling
- **TailwindCSS 4** — utility-first styling
- **@dnd-kit** — accessible drag-and-drop
- **date-fns** — date utilities
- **React Router 7** — client-side routing
- **recharts 3** — KPI charts and dashboards
- **@react-pdf/renderer** — in-browser PDF generation (supplier invoice archival)

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
│   │   ├── posApi.js          # PoS API calls
│   │   ├── stockApi.js        # Stock API calls
│   │   └── invoicesApi.js     # Supplier Invoice API calls
│   ├── components/
│   │   ├── ui/                # Reusable: Button, Modal, StatCard
│   │   ├── scheduler/         # StaffScheduler, DraggableShift, etc.
│   │   ├── employees/         # EmployeeGrid, EmployeeModal, etc.
│   │   ├── payroll/           # PayrollDashboard, PayrollExport, etc.
│   │   ├── pos/               # PosDashboard, PosModal, etc.
│   │   ├── stock/             # Stock items, movements, purchase orders
│   │   └── invoices/          # InvoiceList, InvoiceForm, InvoiceDetail, InvoicePDF
│   ├── hooks/                 # Custom hooks (useShifts, useEmployees, useInvoices ...)
│   ├── pages/                 # Route pages
│   ├── utils/                 # dateUtils, shiftUtils
│   ├── data/                  # Fallback mock data
│   └── constants/             # App-wide constants
├── staff-scheduler-api/       # Spring Boot backend
│   └── src/main/java/com/staffscheduler/api/
│       ├── controller/        # REST controllers
│       ├── service/           # Business logic
│       ├── repository/        # Spring Data JPA repos
│       ├── model/             # JPA entities
│       ├── dto/               # Data Transfer Objects
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

> **Port conflicts**: The startup scripts automatically detect and terminate any existing process on ports 8080 and 5173 before starting. If a previous run crashed without cleanup, the scripts will gracefully free the ports.

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

### Supplier Invoices (AP) — `/api/invoices`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/invoices` | List with filters (status, supplier, date range, page) |
| `POST` | `/api/invoices` | Create invoice (auto-numbers as FAC-XXXXXX) |
| `GET` | `/api/invoices/{id}` | Get full detail (lines, payments) |
| `PUT` | `/api/invoices/{id}` | Update (received status only) |
| `POST` | `/api/invoices/{id}/approve` | Approve → posts stock movements |
| `POST` | `/api/invoices/{id}/payments` | Record partial or full payment |
| `POST` | `/api/invoices/{id}/duplicate` | Duplicate to new draft |
| `GET` | `/api/invoices/export` | Export filtered list as CSV |
| `GET` | `/api/dashboard/ap-kpis` | AP KPI dashboard (unpaid, paid MTD, pending, charts) |

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

Staff Scheduler Pro uses PostgreSQL for persistent data storage via Spring Data JPA.

### Architecture

```
React Frontend (Port 5173)
        ↓ REST API
Spring Boot Backend (Port 8080)
        ↓ JPA/Hibernate
PostgreSQL Database (Port 5432)
```

### Setup (First Time)

```bash
# Run the automated setup script to create DB user and database
chmod +x setup-postgresql.sh
./setup-postgresql.sh
```

### Profiles

| Profile | Database | `ddl-auto` | Use For |
|---------|----------|------------|---------|
| `dev` (default) | PostgreSQL `staff_scheduler` | `update` | Development |
| `test` | H2 in-memory | `create-drop` | Unit/integration tests |
| `prod` | PostgreSQL via `$DATABASE_URL` | `validate` | Production |

```bash
# Start backend with dev profile (PostgreSQL, default)
./scripts/start-backend.sh
# — or —
cd staff-scheduler-api && mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Run tests (H2 in-memory)
cd staff-scheduler-api && mvn test
```

### Seed Data

On first start the backend auto-creates all tables and seeds:
- 12 employees with roles, hourly rates, contact info
- 12 shifts for the week of 2026-03-02
- 5 Point of Sale locations

### Documentation

| Document | Purpose |
|----------|---------|
| [DATABASE_PERSISTENCE_README.md](./DATABASE_PERSISTENCE_README.md) | Overview & quick-start |
| [docs/POSTGRESQL_SETUP.md](./docs/POSTGRESQL_SETUP.md) | Installation & configuration |
| [docs/DATABASE_MIGRATION_GUIDE.md](./docs/DATABASE_MIGRATION_GUIDE.md) | Migration & rollback procedures |
| [docs/DATA_MODEL_GUIDE.md](./docs/DATA_MODEL_GUIDE.md) | API ↔ database field mapping |
| [docs/PERFORMANCE_GUIDELINES.md](./docs/PERFORMANCE_GUIDELINES.md) | Query optimization & indexing |

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

### French Legal Compliance (Supplier Invoices)

The Supplier Invoice module (AP) is compliant with **Article L441-9 du Code de commerce**. Each invoice PDF includes:
- Supplier SIRET number (validated as 14 digits)
- French VAT number (validated as `FR` + 2 digits + 9-digit SIREN)
- Invoice number with sequential autonumber (format: `FAC-XXXXXX`)
- Issue date, delivery date, and due date (JJ/MM/AAAA)
- TVA rates restricted to French statutory rates: 20%, 10%, 5.5%, 2.1%
- Early payment discount (escompte) and late payment interest rate
- Fixed indemnity for recovery costs (40 € — Articles L441-10 et D441-5)
- Amounts in HT / TVA / TTC breakdown per rate

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
