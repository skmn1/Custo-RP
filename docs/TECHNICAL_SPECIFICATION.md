# Technical Specification - Staff Scheduler Pro

**Document Version:** 1.0  
**Last Updated:** December 18, 2024  
**Status:** Draft

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [API Design](#api-design)
4. [Database Schema](#database-schema)
5. [Security Requirements](#security-requirements)
6. [Performance Requirements](#performance-requirements)
7. [Integration Points](#integration-points)
8. [Development Standards](#development-standards)

---

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  Web Browser (React 19 + Vite)                                  │
│  Mobile Browser (PWA)                                            │
│  [Future] Native Mobile App (React Native)                      │
└────────────────┬────────────────────────────────────────────────┘
                 │ HTTPS/WSS
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  Load Balancer (Nginx/AWS ALB)                                  │
│  Rate Limiting & Throttling                                      │
│  SSL/TLS Termination                                             │
│  CORS Management                                                 │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  Backend API Server (Node.js + Express + TypeScript)            │
│  ├── Authentication Middleware                                  │
│  ├── Authorization Middleware (RBAC)                            │
│  ├── Validation Middleware (Zod)                                │
│  ├── Error Handling Middleware                                  │
│  └── Logging Middleware (Winston)                               │
│                                                                  │
│  Service Layer:                                                  │
│  ├── Auth Service (JWT, bcrypt)                                 │
│  ├── Employee Service                                            │
│  ├── Shift Service                                               │
│  ├── Schedule Service                                            │
│  ├── Notification Service                                        │
│  ├── Payroll Service                                             │
│  └── Report Service                                              │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL Database (Primary)                                   │
│  ├── Users, Employees, Shifts, Schedules                        │
│  ├── Organizations (Multi-tenant)                               │
│  └── Audit Logs                                                  │
│                                                                  │
│  Redis Cache (Session, frequently accessed data)                │
│                                                                  │
│  S3/Object Storage (File uploads, exports)                      │
└─────────────────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
├─────────────────────────────────────────────────────────────────┤
│  SendGrid/SES (Email notifications)                             │
│  Twilio (SMS notifications)                                      │
│  Firebase (Push notifications)                                   │
│  Sentry (Error tracking)                                         │
│  Datadog/CloudWatch (Monitoring)                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Architectural Patterns

1. **RESTful API Architecture**
   - Resource-based URL structure
   - HTTP verbs for actions (GET, POST, PUT, DELETE)
   - Stateless communication
   - JSON data format

2. **Layered Architecture**
   - **Presentation Layer:** React components
   - **API Layer:** Express routes and controllers
   - **Service Layer:** Business logic
   - **Data Access Layer:** Prisma ORM
   - **Database Layer:** PostgreSQL

3. **Multi-Tenant Architecture**
   - Tenant isolation by organization_id
   - Shared database with row-level security
   - Tenant-specific configurations

4. **Event-Driven Architecture** (Future)
   - Message queue (RabbitMQ/SQS) for async operations
   - Event sourcing for audit trails
   - WebSocket for real-time updates

### Design Principles

- ✅ **Separation of Concerns:** Clear boundaries between layers
- ✅ **Single Responsibility:** Each module has one purpose
- ✅ **DRY (Don't Repeat Yourself):** Reusable components and utilities
- ✅ **SOLID Principles:** Object-oriented design best practices
- ✅ **API-First Design:** API spec before implementation
- ✅ **Security by Default:** Authentication required on all endpoints
- ✅ **Fail Fast:** Early validation and error detection

---

## Technology Stack

### Frontend Stack

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| **React** | 19.1.0 | UI framework | Modern, component-based, large ecosystem |
| **TypeScript** | 5.6+ | Type safety | Catch errors at compile time, better IDE support |
| **Vite** | 7.0+ | Build tool | Fast HMR, optimized production builds |
| **TailwindCSS** | 4.1+ | Styling | Utility-first, consistent design system |
| **React Query** | 5.0+ | Server state | Caching, synchronization, optimistic updates |
| **Zustand** | 4.5+ | Client state | Lightweight, simple API |
| **React Hook Form** | 7.0+ | Form management | Performance, validation integration |
| **Zod** | 3.22+ | Schema validation | Type-safe validation, TypeScript integration |
| **date-fns** | 4.1+ | Date utilities | Lightweight, tree-shakeable |
| **@dnd-kit** | 6.3+ | Drag & drop | Accessible, performant |
| **Recharts** | 2.10+ | Charts/graphs | React-native, responsive charts |

### Backend Stack

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| **Node.js** | 20 LTS | Runtime | JavaScript ecosystem, async I/O |
| **Express** | 4.18+ | Web framework | Mature, flexible, large middleware ecosystem |
| **TypeScript** | 5.6+ | Type safety | Type safety on backend |
| **Prisma** | 5.0+ | ORM | Type-safe queries, migrations, introspection |
| **PostgreSQL** | 15+ | Database | ACID, JSON support, full-text search |
| **Redis** | 7.2+ | Cache/Sessions | Fast in-memory storage |
| **Zod** | 3.22+ | Validation | Runtime type checking |
| **bcrypt** | 5.1+ | Password hashing | Industry standard |
| **jsonwebtoken** | 9.0+ | JWT tokens | Stateless auth |
| **Winston** | 3.11+ | Logging | Flexible logging library |
| **Joi** | 17.11+ | Validation | Schema validation (alternative to Zod) |

### DevOps & Infrastructure

| Technology | Purpose | Priority |
|------------|---------|----------|
| **Docker** | Containerization | P1 |
| **Docker Compose** | Local development | P1 |
| **GitHub Actions** | CI/CD | P1 |
| **Nginx** | Reverse proxy, load balancer | P1 |
| **AWS EC2** | Application hosting | P1 |
| **AWS RDS** | Managed PostgreSQL | P1 |
| **AWS S3** | File storage | P1 |
| **AWS CloudFront** | CDN | P2 |
| **Terraform** | Infrastructure as Code | P2 |
| **Kubernetes** | Container orchestration | P3 |

### Testing Stack

| Technology | Purpose | Priority |
|------------|---------|----------|
| **Vitest** | Unit testing | P1 |
| **React Testing Library** | Component testing | P1 |
| **Cypress** | E2E testing | P1 |
| **Supertest** | API testing | P1 |
| **Jest** | Backend unit testing | P1 |
| **Playwright** | Cross-browser E2E | P2 |
| **k6** | Load testing | P2 |

### Monitoring & Observability

| Technology | Purpose | Priority |
|------------|---------|----------|
| **Sentry** | Error tracking | P1 |
| **Datadog** | APM, metrics | P1 |
| **CloudWatch** | AWS monitoring | P1 |
| **Winston** | Application logging | P1 |
| **Grafana** | Dashboards | P2 |
| **Prometheus** | Metrics collection | P2 |

---

## API Design

### REST API Principles

1. **RESTful Resource Naming**
   - Use nouns, not verbs: `/api/employees` not `/api/getEmployees`
   - Use plural for collections: `/api/shifts` not `/api/shift`
   - Use sub-resources for relationships: `/api/employees/:id/shifts`

2. **HTTP Methods**
   - `GET` - Retrieve resource(s)
   - `POST` - Create new resource
   - `PUT` - Update entire resource
   - `PATCH` - Partial update
   - `DELETE` - Remove resource

3. **Status Codes**
   - `200 OK` - Successful GET, PUT, PATCH, DELETE
   - `201 Created` - Successful POST
   - `204 No Content` - Successful DELETE with no body
   - `400 Bad Request` - Invalid input
   - `401 Unauthorized` - Missing/invalid authentication
   - `403 Forbidden` - Insufficient permissions
   - `404 Not Found` - Resource doesn't exist
   - `409 Conflict` - Resource conflict (e.g., duplicate)
   - `422 Unprocessable Entity` - Validation errors
   - `500 Internal Server Error` - Server error

### API Endpoint Structure

**Base URL:** `https://api.schedulerpro.com/v1`

#### Authentication Endpoints

```
POST   /auth/register          # Register new user
POST   /auth/login             # Login user
POST   /auth/logout            # Logout user
POST   /auth/refresh           # Refresh JWT token
POST   /auth/forgot-password   # Request password reset
POST   /auth/reset-password    # Reset password with token
GET    /auth/me                # Get current user profile
PUT    /auth/me                # Update current user profile
```

#### User Management Endpoints

```
GET    /users                  # List all users (admin only)
GET    /users/:id              # Get user by ID
POST   /users                  # Create new user (admin only)
PUT    /users/:id              # Update user
DELETE /users/:id              # Delete user (admin only)
PATCH  /users/:id/role         # Update user role (admin only)
```

#### Organization/Tenant Endpoints

```
GET    /organizations          # List organizations (super admin)
GET    /organizations/:id      # Get organization details
POST   /organizations          # Create new organization
PUT    /organizations/:id      # Update organization
DELETE /organizations/:id      # Delete organization
GET    /organizations/:id/settings  # Get org settings
PUT    /organizations/:id/settings  # Update org settings
```

#### Employee Endpoints

```
GET    /employees              # List all employees (with filters)
GET    /employees/:id          # Get employee by ID
POST   /employees              # Create new employee
PUT    /employees/:id          # Update employee
DELETE /employees/:id          # Delete employee
GET    /employees/:id/shifts   # Get employee shifts
GET    /employees/:id/availability  # Get availability
PUT    /employees/:id/availability  # Update availability
GET    /employees/:id/time-off      # Get time-off requests
POST   /employees/:id/time-off      # Request time off
```

#### Shift Endpoints

```
GET    /shifts                 # List shifts (with date range filter)
GET    /shifts/:id             # Get shift by ID
POST   /shifts                 # Create new shift
PUT    /shifts/:id             # Update shift
DELETE /shifts/:id             # Delete shift
POST   /shifts/bulk            # Create multiple shifts
PUT    /shifts/:id/swap        # Request shift swap
PUT    /shifts/:id/approve-swap  # Approve shift swap
GET    /shifts/conflicts       # Check for scheduling conflicts
```

#### Schedule Endpoints

```
GET    /schedules              # List schedules
GET    /schedules/:id          # Get schedule by ID
POST   /schedules              # Create new schedule
PUT    /schedules/:id          # Update schedule
DELETE /schedules/:id          # Delete schedule
POST   /schedules/:id/publish  # Publish schedule
GET    /schedules/:id/conflicts  # Get conflicts
POST   /schedules/auto-generate  # AI auto-schedule (future)
GET    /schedules/:id/export   # Export schedule (PDF/CSV)
```

#### Payroll Endpoints

```
GET    /payroll/periods        # List payroll periods
GET    /payroll/periods/:id    # Get payroll period details
POST   /payroll/calculate      # Calculate payroll
GET    /payroll/reports        # Generate payroll reports
POST   /payroll/export         # Export payroll data
```

#### Notification Endpoints

```
GET    /notifications          # Get user notifications
GET    /notifications/:id      # Get notification by ID
PUT    /notifications/:id/read  # Mark as read
DELETE /notifications/:id      # Delete notification
PUT    /notifications/read-all # Mark all as read
GET    /notifications/preferences  # Get notification settings
PUT    /notifications/preferences  # Update notification settings
```

#### Reports & Analytics Endpoints

```
GET    /reports/labor-costs    # Labor cost reports
GET    /reports/overtime       # Overtime reports
GET    /reports/attendance     # Attendance reports
GET    /reports/custom         # Custom report generation
POST   /reports/export         # Export report
GET    /analytics/dashboard    # Dashboard statistics
GET    /analytics/trends       # Historical trends
```

### Request/Response Format

#### Standard Request Format

```json
{
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "role": "manager"
  }
}
```

#### Standard Success Response

```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "manager",
    "createdAt": "2024-12-18T10:00:00Z",
    "updatedAt": "2024-12-18T10:00:00Z"
  },
  "message": "User created successfully"
}
```

#### Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "timestamp": "2024-12-18T10:00:00Z"
}
```

#### Pagination Response

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

### Authentication Flow

1. **Login:**
   ```
   POST /auth/login
   Body: { "email": "user@example.com", "password": "password123" }
   
   Response:
   {
     "success": true,
     "data": {
       "accessToken": "eyJhbGc...",
       "refreshToken": "eyJhbGc...",
       "user": { "id": "user_123", "name": "John", ... }
     }
   }
   ```

2. **Authenticated Request:**
   ```
   GET /employees
   Headers: { "Authorization": "Bearer eyJhbGc..." }
   ```

3. **Token Refresh:**
   ```
   POST /auth/refresh
   Body: { "refreshToken": "eyJhbGc..." }
   
   Response: { "accessToken": "newToken..." }
   ```

### Rate Limiting

- **Anonymous:** 100 requests/hour
- **Authenticated:** 1000 requests/hour
- **Premium:** 5000 requests/hour

Headers returned:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1703000000
```

---

## Database Schema

### Schema Overview

**Database:** PostgreSQL 15+  
**ORM:** Prisma  
**Migration Strategy:** Prisma Migrate

### Core Tables

#### 1. Organizations (Multi-tenant)

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
```

#### 2. Users

```sql
CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email             VARCHAR(255) NOT NULL UNIQUE,
  password_hash     VARCHAR(255) NOT NULL,
  first_name        VARCHAR(100) NOT NULL,
  last_name         VARCHAR(100) NOT NULL,
  role              VARCHAR(50) NOT NULL, -- admin, manager, employee, viewer
  phone             VARCHAR(50),
  avatar_url        TEXT,
  is_active         BOOLEAN DEFAULT true,
  email_verified    BOOLEAN DEFAULT false,
  last_login_at     TIMESTAMP,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT uk_user_org_email UNIQUE (organization_id, email)
);

CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
```

#### 3. Employees

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
  is_active         BOOLEAN DEFAULT true,
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT uk_employee_org_code UNIQUE (organization_id, employee_code)
);

CREATE INDEX idx_employees_organization ON employees(organization_id);
CREATE INDEX idx_employees_user ON employees(user_id);
CREATE INDEX idx_employees_department ON employees(organization_id, department);
```

#### 4. Shifts

```sql
CREATE TABLE shifts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id       UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  schedule_id       UUID REFERENCES schedules(id) ON DELETE SET NULL,
  shift_date        DATE NOT NULL,
  start_time        TIME NOT NULL,
  end_time          TIME NOT NULL,
  break_duration    INT DEFAULT 0, -- in minutes
  shift_type        VARCHAR(50), -- morning, day, evening, night
  department        VARCHAR(100),
  location          VARCHAR(255),
  notes             TEXT,
  status            VARCHAR(50) DEFAULT 'scheduled', -- scheduled, completed, cancelled
  created_by        UUID REFERENCES users(id),
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_shifts_organization ON shifts(organization_id);
CREATE INDEX idx_shifts_employee ON shifts(employee_id);
CREATE INDEX idx_shifts_date ON shifts(organization_id, shift_date);
CREATE INDEX idx_shifts_schedule ON shifts(schedule_id);
```

#### 5. Schedules

```sql
CREATE TABLE schedules (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name              VARCHAR(255) NOT NULL,
  start_date        DATE NOT NULL,
  end_date          DATE NOT NULL,
  status            VARCHAR(50) DEFAULT 'draft', -- draft, published, archived
  published_at      TIMESTAMP,
  published_by      UUID REFERENCES users(id),
  notes             TEXT,
  created_by        UUID REFERENCES users(id),
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_schedules_organization ON schedules(organization_id);
CREATE INDEX idx_schedules_dates ON schedules(organization_id, start_date, end_date);
```

#### 6. Time-Off Requests

```sql
CREATE TABLE time_off_requests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id       UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  request_type      VARCHAR(50) NOT NULL, -- vacation, sick, personal
  start_date        DATE NOT NULL,
  end_date          DATE NOT NULL,
  reason            TEXT,
  status            VARCHAR(50) DEFAULT 'pending', -- pending, approved, denied
  reviewed_by       UUID REFERENCES users(id),
  reviewed_at       TIMESTAMP,
  review_notes      TEXT,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_time_off_organization ON time_off_requests(organization_id);
CREATE INDEX idx_time_off_employee ON time_off_requests(employee_id);
CREATE INDEX idx_time_off_dates ON time_off_requests(organization_id, start_date, end_date);
```

#### 7. Shift Swaps

```sql
CREATE TABLE shift_swaps (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  shift_id          UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  from_employee_id  UUID NOT NULL REFERENCES employees(id),
  to_employee_id    UUID NOT NULL REFERENCES employees(id),
  reason            TEXT,
  status            VARCHAR(50) DEFAULT 'pending', -- pending, approved, denied
  reviewed_by       UUID REFERENCES users(id),
  reviewed_at       TIMESTAMP,
  review_notes      TEXT,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_shift_swaps_organization ON shift_swaps(organization_id);
CREATE INDEX idx_shift_swaps_shift ON shift_swaps(shift_id);
```

#### 8. Availability

```sql
CREATE TABLE employee_availability (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id       UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  day_of_week       INT NOT NULL, -- 0=Sunday, 6=Saturday
  start_time        TIME,
  end_time          TIME,
  is_available      BOOLEAN DEFAULT true,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT uk_employee_availability UNIQUE (employee_id, day_of_week)
);

CREATE INDEX idx_availability_employee ON employee_availability(employee_id);
```

#### 9. Notifications

```sql
CREATE TABLE notifications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type              VARCHAR(50) NOT NULL, -- shift_assigned, shift_changed, etc.
  title             VARCHAR(255) NOT NULL,
  message           TEXT NOT NULL,
  data              JSONB,
  is_read           BOOLEAN DEFAULT false,
  sent_at           TIMESTAMP DEFAULT NOW(),
  read_at           TIMESTAMP,
  created_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);
```

#### 10. Audit Logs

```sql
CREATE TABLE audit_logs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id           UUID REFERENCES users(id),
  action            VARCHAR(100) NOT NULL, -- create, update, delete, login
  entity_type       VARCHAR(100) NOT NULL, -- user, employee, shift, etc.
  entity_id         UUID,
  old_values        JSONB,
  new_values        JSONB,
  ip_address        VARCHAR(45),
  user_agent        TEXT,
  created_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_organization ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
```

### Prisma Schema Example

```prisma
model Organization {
  id                String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name              String    @db.VarChar(255)
  slug              String    @unique @db.VarChar(100)
  email             String    @db.VarChar(255)
  subscriptionTier  String    @default("free") @map("subscription_tier") @db.VarChar(50)
  isActive          Boolean   @default(true) @map("is_active")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")
  
  users             User[]
  employees         Employee[]
  shifts            Shift[]
  schedules         Schedule[]
  
  @@map("organizations")
}

model User {
  id              String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  organizationId  String    @map("organization_id") @db.Uuid
  email           String    @unique @db.VarChar(255)
  passwordHash    String    @map("password_hash") @db.VarChar(255)
  firstName       String    @map("first_name") @db.VarChar(100)
  lastName        String    @map("last_name") @db.VarChar(100)
  role            String    @db.VarChar(50)
  isActive        Boolean   @default(true) @map("is_active")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  
  organization    Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  @@unique([organizationId, email])
  @@index([organizationId])
  @@map("users")
}

// ... more models
```

---

## Security Requirements

### 1. Authentication

**Strategy:** JWT (JSON Web Tokens) with refresh tokens

**Implementation:**
- Access token expiry: 15 minutes
- Refresh token expiry: 7 days
- Refresh token rotation on use
- Secure HTTP-only cookies for web
- Token blacklisting for logout

**Password Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character
- Password strength meter on frontend

**Password Hashing:**
- Algorithm: bcrypt
- Salt rounds: 10
- No plain-text password storage

### 2. Authorization (RBAC)

**Roles:**

| Role | Permissions |
|------|-------------|
| **Super Admin** | Manage organizations, all system access |
| **Admin** | Full access within organization |
| **Manager** | Manage employees, schedules, approve requests |
| **Employee** | View own schedule, request time off, swap shifts |
| **Viewer** | Read-only access to schedules |

**Permission Matrix:**

| Resource | Super Admin | Admin | Manager | Employee | Viewer |
|----------|-------------|-------|---------|----------|--------|
| Organizations | CRUD | R | - | - | - |
| Users | CRUD | CRUD | R | R | R |
| Employees | CRUD | CRUD | CRUD | R | R |
| Shifts | CRUD | CRUD | CRUD | R (own) | R |
| Schedules | CRUD | CRUD | CRUD | R | R |
| Time-off | Approve | Approve | Approve | Create (own) | R |
| Reports | All | All | All | R (own) | R |

### 3. Data Security

**Encryption:**
- TLS 1.3 for data in transit
- AES-256 for data at rest (database encryption)
- Field-level encryption for sensitive data (SSN, payment info)

**Data Sanitization:**
- Input validation on all endpoints (Zod)
- SQL injection prevention (parameterized queries via Prisma)
- XSS prevention (escaping user input)
- CSRF protection (tokens for state-changing operations)

**API Security:**
- Rate limiting (prevent DDoS)
- Request size limits (10MB max)
- CORS configuration (whitelist domains)
- Security headers (Helmet.js)
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - X-XSS-Protection: 1; mode=block
  - Strict-Transport-Security: max-age=31536000

### 4. Compliance

**GDPR (EU):**
- ✅ Right to access (data export)
- ✅ Right to deletion (account deletion)
- ✅ Right to rectification (data updates)
- ✅ Consent management
- ✅ Data portability (export formats)
- ✅ Privacy policy and terms of service

**HIPAA (Healthcare - if applicable):**
- ✅ PHI encryption
- ✅ Access controls
- ✅ Audit logs
- ✅ Business Associate Agreements (BAA)
- ✅ Data backup and disaster recovery

**CCPA (California):**
- ✅ Right to know what data is collected
- ✅ Right to delete data
- ✅ Opt-out of data sale

### 5. Security Best Practices

- ✅ Principle of least privilege
- ✅ Regular security audits
- ✅ Dependency scanning (Snyk, Dependabot)
- ✅ Secrets management (environment variables, AWS Secrets Manager)
- ✅ No hardcoded credentials
- ✅ Regular penetration testing
- ✅ Security training for developers
- ✅ Incident response plan

---

## Performance Requirements

### 1. Response Time Targets

| Operation | Target | Maximum |
|-----------|--------|---------|
| API response (simple GET) | < 100ms | < 200ms |
| API response (complex query) | < 500ms | < 1000ms |
| Page load (initial) | < 2s | < 3s |
| Page load (subsequent) | < 500ms | < 1s |
| Database query | < 50ms | < 100ms |

### 2. Scalability Targets

- **Concurrent users:** Support 1,000+ concurrent users
- **Organizations:** Support 10,000+ organizations (multi-tenant)
- **Employees per org:** Support 10,000+ employees
- **Shifts per month:** Support 100,000+ shifts
- **API throughput:** 1,000+ requests per second

### 3. Availability & Reliability

- **Uptime SLA:** 99.9% (< 43 minutes downtime/month)
- **Recovery Time Objective (RTO):** < 1 hour
- **Recovery Point Objective (RPO):** < 15 minutes
- **Automated failover:** Database replication

### 4. Optimization Strategies

**Frontend:**
- Code splitting and lazy loading
- Image optimization (WebP, lazy loading)
- CDN for static assets
- Service worker for caching (PWA)
- Virtual scrolling for large lists
- Debouncing and throttling
- Memoization (useMemo, React.memo)

**Backend:**
- Database query optimization
- Proper indexing
- Redis caching for frequently accessed data
- Connection pooling
- Pagination for large datasets
- Background job processing (Bull queue)
- Horizontal scaling with load balancer

**Database:**
- Query optimization (EXPLAIN ANALYZE)
- Proper indexes on foreign keys and frequently queried columns
- Partitioning for large tables
- Read replicas for analytics
- Connection pooling
- Query result caching

---

## Integration Points

### 1. Email Service (SendGrid/AWS SES)

**Use Cases:**
- Welcome emails
- Password reset emails
- Shift assignment notifications
- Schedule change notifications
- Weekly schedule digest

**API:**
```javascript
await emailService.send({
  to: 'employee@example.com',
  template: 'shift-assignment',
  data: {
    employeeName: 'John Doe',
    shiftDate: '2024-12-20',
    startTime: '08:00',
    endTime: '17:00'
  }
});
```

### 2. SMS Service (Twilio)

**Use Cases:**
- Critical shift changes
- Emergency notifications
- Shift reminders (1 hour before)

**API:**
```javascript
await smsService.send({
  to: '+1234567890',
  message: 'Reminder: Your shift starts in 1 hour at 08:00 AM'
});
```

### 3. Push Notifications (Firebase Cloud Messaging)

**Use Cases:**
- Real-time shift updates
- In-app notifications
- Mobile app alerts

**API:**
```javascript
await pushService.send({
  userId: 'user_123',
  title: 'New Shift Assigned',
  body: 'You have been assigned a shift on Dec 20, 8:00 AM',
  data: { shiftId: 'shift_456' }
});
```

### 4. Calendar Integration (Future)

**Providers:**
- Google Calendar
- Microsoft Outlook
- Apple Calendar (iCal)

**Format:** iCalendar (ICS) export

### 5. Payroll Integration (Future)

**Providers:**
- QuickBooks
- ADP
- Gusto

**Data Export:** CSV, API webhooks

### 6. Error Tracking (Sentry)

**Monitoring:**
- Frontend errors
- Backend exceptions
- Performance issues
- User feedback

### 7. Analytics (Future)

**Providers:**
- Google Analytics
- Mixpanel
- Amplitude

**Events:**
- User actions
- Feature usage
- Conversion tracking

---

## Development Standards

### 1. Code Style

**TypeScript:**
- Use ESLint with Airbnb config
- Prettier for formatting
- Strict mode enabled
- No `any` types

**React:**
- Functional components only
- Custom hooks for reusable logic
- PropTypes or TypeScript interfaces
- Component file structure:
  ```tsx
  // Imports
  // Types/Interfaces
  // Component
  // Exports
  ```

### 2. Git Workflow

**Branch Strategy:** GitFlow

- `main` - Production code
- `develop` - Development integration
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Production hotfixes

**Commit Messages:** Conventional Commits

```
feat: Add employee availability feature
fix: Resolve shift overlap validation bug
docs: Update API documentation
test: Add unit tests for shift service
chore: Update dependencies
```

### 3. Code Review Process

- All code requires 1+ approval
- Automated checks must pass (linting, tests)
- PR template with description, testing notes
- No direct commits to `main` or `develop`

### 4. Testing Standards

**Coverage Goals:**
- Unit tests: 80%+
- Integration tests: 70%+
- E2E tests: Critical user flows

**Testing Pyramid:**
- 70% Unit tests
- 20% Integration tests
- 10% E2E tests

### 5. Documentation

**Required:**
- API documentation (OpenAPI/Swagger)
- README for each major module
- Inline comments for complex logic
- Architecture decision records (ADRs)

---

## Deployment Strategy

### Environments

1. **Development** - Local development
2. **Staging** - Pre-production testing
3. **Production** - Live application

### CI/CD Pipeline

```
┌─────────────┐
│   Git Push  │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  GitHub Actions     │
│  - Linting          │
│  - Type checking    │
│  - Unit tests       │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Build & Package    │
│  - Frontend (Vite)  │
│  - Backend (tsc)    │
│  - Docker images    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Deploy to Staging  │
│  - Run E2E tests    │
│  - Smoke tests      │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Manual Approval    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Deploy to Prod     │
│  - Blue-green       │
│  - Health checks    │
└─────────────────────┘
```

---

## Conclusion

This technical specification provides a comprehensive blueprint for transforming Staff Scheduler Pro into a production-ready, enterprise-grade application. The proposed architecture is scalable, secure, and maintainable, following industry best practices.

**Key Technical Decisions:**
- ✅ Node.js + Express + TypeScript for backend
- ✅ PostgreSQL with Prisma ORM
- ✅ JWT-based authentication with RBAC
- ✅ RESTful API design
- ✅ Multi-tenant architecture
- ✅ Comprehensive security measures
- ✅ Modern DevOps practices

**Next Steps:**
1. Review and approve technical specifications
2. Set up development infrastructure
3. Create detailed sprint tasks
4. Begin Sprint 1 implementation

---

**Document Owner:** Technical Lead  
**Reviewers:** Engineering Team, Product Owner  
**Approval Required:** CTO, Product Owner  
**Version History:**
- v1.0 - Initial draft (2024-12-18)
