# System Architecture - Staff Scheduler Pro

**Document Version:** 1.0  
**Last Updated:** December 18, 2024  
**Status:** Draft

---

## Table of Contents

1. [Overview](#overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Component Architecture](#component-architecture)
4. [Data Flow](#data-flow)
5. [Deployment Architecture](#deployment-architecture)
6. [Security Architecture](#security-architecture)
7. [Scalability Strategy](#scalability-strategy)

---

## Overview

Staff Scheduler Pro follows a modern **three-tier architecture** pattern with clear separation between presentation, business logic, and data layers. The system is designed to be:

- **Scalable:** Horizontal scaling with load balancers
- **Maintainable:** Modular design with clear boundaries
- **Secure:** Multi-layered security approach
- **Performant:** Caching and optimization at every layer
- **Resilient:** Fault tolerance and graceful degradation

### Key Architectural Principles

1. **Separation of Concerns:** Each layer has distinct responsibilities
2. **Stateless API:** Backend API is stateless for horizontal scaling
3. **API-First Design:** API contracts defined before implementation
4. **Multi-Tenant:** Tenant isolation at database level
5. **Microservices-Ready:** Modular services can be extracted later
6. **Event-Driven:** Async operations via message queues (future)

---

## High-Level Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                             CLIENT LAYER                               │
│                                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │   Desktop    │  │   Tablet     │  │    Mobile    │               │
│  │   Browser    │  │   Browser    │  │   Browser    │               │
│  │  (React 19)  │  │  (React 19)  │  │  (React 19)  │               │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘               │
│         │                  │                  │                        │
│         └──────────────────┴──────────────────┘                        │
│                            │                                           │
│                    HTTPS/WebSocket                                     │
└────────────────────────────┼──────────────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         EDGE LAYER (CDN)                               │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │   CloudFront / Cloudflare CDN                                │    │
│  │   - Static Asset Caching                                     │    │
│  │   - DDoS Protection                                          │    │
│  │   - SSL/TLS Termination                                      │    │
│  │   - Geographic Distribution                                  │    │
│  └────────────────────────┬─────────────────────────────────────┘    │
└────────────────────────────┼──────────────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      LOAD BALANCER LAYER                               │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │   Nginx / AWS ALB / Google Load Balancer                     │    │
│  │   - Request Distribution (Round Robin / Least Connections)   │    │
│  │   - Health Checks                                            │    │
│  │   - SSL/TLS Termination                                      │    │
│  │   - Rate Limiting                                            │    │
│  └────────────────────────┬─────────────────────────────────────┘    │
└────────────────────────────┼──────────────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                                 │
│                                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │   Backend    │  │   Backend    │  │   Backend    │               │
│  │   Server 1   │  │   Server 2   │  │   Server N   │               │
│  │ (Node.js +   │  │ (Node.js +   │  │ (Node.js +   │               │
│  │  Express)    │  │  Express)    │  │  Express)    │               │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘               │
│         │                  │                  │                        │
│         └──────────────────┴──────────────────┘                        │
│                            │                                           │
└────────────────────────────┼──────────────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         CACHING LAYER                                  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │   Redis Cluster                                              │    │
│  │   - Session Storage                                          │    │
│  │   - API Response Caching                                     │    │
│  │   - Rate Limiting Counters                                   │    │
│  │   - Real-time Data (Socket.io)                               │    │
│  └──────────────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         DATABASE LAYER                                 │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────┐          │
│  │   PostgreSQL Primary (Master)                           │          │
│  │   - Read/Write Operations                               │          │
│  │   - ACID Transactions                                   │          │
│  │   - Row-Level Security (Multi-tenant)                   │          │
│  └────────────────────┬────────────────────────────────────┘          │
│                       │                                                │
│                       ▼                                                │
│  ┌─────────────────────────────────────────────────────────┐          │
│  │   PostgreSQL Read Replicas (Slaves)                     │          │
│  │   - Read-Only Queries                                   │          │
│  │   - Reporting & Analytics                               │          │
│  │   - Automatic Failover                                  │          │
│  └─────────────────────────────────────────────────────────┘          │
└────────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      STORAGE LAYER                                     │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │   AWS S3 / Google Cloud Storage / Azure Blob                 │    │
│  │   - File Uploads                                             │    │
│  │   - Export Files (CSV, PDF)                                  │    │
│  │   - Avatar Images                                            │    │
│  │   - Static Assets                                            │    │
│  └──────────────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES LAYER                             │
│                                                                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐     │
│  │  SendGrid  │  │   Twilio   │  │  Firebase  │  │   Sentry   │     │
│  │   (Email)  │  │   (SMS)    │  │   (Push)   │  │  (Errors)  │     │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘     │
│                                                                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐     │
│  │  Datadog   │  │   Stripe   │  │   Auth0    │  │  Cloudflare│     │
│  │ (Monitor)  │  │ (Payment)  │  │  (Auth)    │  │   (CDN)    │     │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Frontend Architecture (React)

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Pages (Route Components)                              │     │
│  │  - Dashboard                                           │     │
│  │  - SchedulerPage                                       │     │
│  │  - EmployeesPage                                       │     │
│  │  - PayrollPage                                         │     │
│  └────────────────────┬───────────────────────────────────┘     │
│                       │                                          │
│                       ▼                                          │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Feature Components                                    │     │
│  │  - StaffScheduler                                      │     │
│  │  - EmployeeList                                        │     │
│  │  - PayrollDashboard                                    │     │
│  │  - AddShiftModal                                       │     │
│  └────────────────────┬───────────────────────────────────┘     │
│                       │                                          │
│                       ▼                                          │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  UI Components (Reusable)                              │     │
│  │  - Button, Modal, Card                                 │     │
│  │  - Form, Input, Select                                 │     │
│  │  - Table, DataGrid                                     │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                        STATE MANAGEMENT LAYER                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Server State (React Query)                            │     │
│  │  - API data fetching                                   │     │
│  │  - Caching & synchronization                           │     │
│  │  - Optimistic updates                                  │     │
│  │  - Background refetch                                  │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Client State (Zustand)                                │     │
│  │  - Authentication state                                │     │
│  │  - UI state (modals, filters)                          │     │
│  │  - User preferences                                    │     │
│  │  - Theme settings                                      │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SERVICE LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  API Services                                          │     │
│  │  - authService.ts                                      │     │
│  │  - employeeService.ts                                  │     │
│  │  - shiftService.ts                                     │     │
│  │  - scheduleService.ts                                  │     │
│  │  - payrollService.ts                                   │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  HTTP Client (Axios/Fetch)                             │     │
│  │  - Request interceptors (add auth tokens)              │     │
│  │  - Response interceptors (handle errors)               │     │
│  │  - Retry logic                                         │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Backend Architecture (Node.js + Express)

```
┌─────────────────────────────────────────────────────────────────┐
│                          ROUTING LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Express Routes                                        │     │
│  │  - /auth/* (authRoutes.ts)                             │     │
│  │  - /users/* (userRoutes.ts)                            │     │
│  │  - /employees/* (employeeRoutes.ts)                    │     │
│  │  - /shifts/* (shiftRoutes.ts)                          │     │
│  │  - /schedules/* (scheduleRoutes.ts)                    │     │
│  │  - /payroll/* (payrollRoutes.ts)                       │     │
│  │  - /reports/* (reportRoutes.ts)                        │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                       MIDDLEWARE LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐                     │
│  │  Authentication  │  │  Authorization   │                     │
│  │  - JWT verify    │  │  - RBAC check    │                     │
│  └──────────────────┘  └──────────────────┘                     │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐                     │
│  │  Validation      │  │  Rate Limiting   │                     │
│  │  - Zod schemas   │  │  - Redis counter │                     │
│  └──────────────────┘  └──────────────────┘                     │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐                     │
│  │  Error Handler   │  │  Logger          │                     │
│  │  - Centralized   │  │  - Winston       │                     │
│  └──────────────────┘  └──────────────────┘                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                       CONTROLLER LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Controllers (Request Handlers)                        │     │
│  │  - authController.ts                                   │     │
│  │  - userController.ts                                   │     │
│  │  - employeeController.ts                               │     │
│  │  - shiftController.ts                                  │     │
│  │  - scheduleController.ts                               │     │
│  │  - payrollController.ts                                │     │
│  │                                                         │     │
│  │  Responsibilities:                                     │     │
│  │  - Parse request                                       │     │
│  │  - Call service layer                                  │     │
│  │  - Format response                                     │     │
│  │  - HTTP status codes                                   │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SERVICE LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Business Logic Services                               │     │
│  │  - authService.ts                                      │     │
│  │    • Registration, login, token refresh                │     │
│  │    • Password hashing, JWT generation                  │     │
│  │                                                         │     │
│  │  - employeeService.ts                                  │     │
│  │    • CRUD operations                                   │     │
│  │    • Availability management                           │     │
│  │                                                         │     │
│  │  - shiftService.ts                                     │     │
│  │    • Shift creation, update, delete                    │     │
│  │    • Conflict detection                                │     │
│  │    • Shift swapping logic                              │     │
│  │                                                         │     │
│  │  - scheduleService.ts                                  │     │
│  │    • Schedule generation                               │     │
│  │    • Publishing logic                                  │     │
│  │    • Optimization algorithms                           │     │
│  │                                                         │     │
│  │  - notificationService.ts                              │     │
│  │    • Email, SMS, push notifications                    │     │
│  │    • Notification queuing                              │     │
│  │                                                         │     │
│  │  - payrollService.ts                                   │     │
│  │    • Payroll calculations                              │     │
│  │    • Overtime computation                              │     │
│  │    • Report generation                                 │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATA ACCESS LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Prisma Client (ORM)                                   │     │
│  │  - Type-safe database queries                          │     │
│  │  - Automatic migrations                                │     │
│  │  - Connection pooling                                  │     │
│  │  - Query optimization                                  │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Repository Pattern (Optional)                         │     │
│  │  - organizationRepository.ts                           │     │
│  │  - userRepository.ts                                   │     │
│  │  - employeeRepository.ts                               │     │
│  │  - shiftRepository.ts                                  │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DATABASE                                 │
├─────────────────────────────────────────────────────────────────┤
│                      PostgreSQL                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. User Authentication Flow

```
┌──────────┐     1. Login Request        ┌──────────┐
│          │ ────────────────────────────>│          │
│  Client  │   POST /auth/login           │ Backend  │
│          │   { email, password }        │  Server  │
│          │                              │          │
│          │     2. Validate Credentials  │          │
│          │<───────────────────────────┐ │          │
│          │                            │ │          │
│          │                            ▼ │          │
│          │                      ┌────────────────┐ │
│          │                      │ Auth Service   │ │
│          │                      │ - Check user   │ │
│          │                      │ - Verify pass  │ │
│          │                      │ - Gen JWT      │ │
│          │                      └────────┬───────┘ │
│          │                               │         │
│          │                               ▼         │
│          │                      ┌────────────────┐ │
│          │                      │ PostgreSQL     │ │
│          │                      │ - Query user   │ │
│          │                      └────────┬───────┘ │
│          │                               │         │
│          │     3. Return Tokens          │         │
│          │<──────────────────────────────┘         │
│          │   { accessToken, refreshToken, user }   │
│          │                                         │
│          │     4. Store in Memory/Cookie           │
│          │   ┌────────────────────┐                │
│          │   │ Zustand Store      │                │
│          │   │ + HTTP-only Cookie │                │
│          │   └────────────────────┘                │
│          │                                         │
│          │     5. Authenticated Request            │
│          │ ────────────────────────────>           │
│          │   GET /employees                        │
│          │   Header: Authorization: Bearer <token> │
│          │                                         │
│          │     6. Verify Token                     │
│          │                     ┌──────────────┐    │
│          │                     │ Auth         │    │
│          │                     │ Middleware   │    │
│          │                     │ - Verify JWT │    │
│          │                     │ - Check exp  │    │
│          │                     └──────┬───────┘    │
│          │                            │            │
│          │     7. Return Data         │            │
│          │<───────────────────────────┘            │
│          │   { data: [...] }                       │
└──────────┘                                         └──────────┘
```

### 2. Shift Creation Flow

```
┌──────────┐     1. Create Shift          ┌──────────┐
│          │ ────────────────────────────>│          │
│  Client  │   POST /shifts               │ Backend  │
│          │   {                          │  Server  │
│          │     employeeId,              │          │
│          │     shiftDate,               │          │
│          │     startTime,               │          │
│          │     endTime                  │          │
│          │   }                          │          │
│          │                              │          │
│          │     2. Validate Input        │          │
│          │                         ┌────┴────┐     │
│          │                         │ Zod     │     │
│          │                         │ Schema  │     │
│          │                         └────┬────┘     │
│          │                              │          │
│          │     3. Check Conflicts       ▼          │
│          │                    ┌────────────────┐   │
│          │                    │ Shift Service  │   │
│          │                    │ - Check exist  │   │
│          │                    │ - Check time   │   │
│          │                    │ - Check avail  │   │
│          │                    └────────┬───────┘   │
│          │                             │           │
│          │                             ▼           │
│          │                    ┌────────────────┐   │
│          │                    │ PostgreSQL     │   │
│          │                    │ - Query shifts │   │
│          │                    │ - Query avail  │   │
│          │                    └────────┬───────┘   │
│          │                             │           │
│          │     4. Create Shift         │           │
│          │                             ▼           │
│          │                    ┌────────────────┐   │
│          │                    │ INSERT INTO    │   │
│          │                    │ shifts         │   │
│          │                    └────────┬───────┘   │
│          │                             │           │
│          │     5. Send Notification    │           │
│          │                             ▼           │
│          │                  ┌──────────────────┐   │
│          │                  │ Notification     │   │
│          │                  │ Service          │   │
│          │                  │ - Queue email    │   │
│          │                  │ - Queue push     │   │
│          │                  └──────────────────┘   │
│          │                                         │
│          │     6. Return Created Shift             │
│          │<────────────────────────────────        │
│          │   { id, employeeId, ... }               │
│          │                                         │
│          │     7. Update UI Optimistically         │
│          │   ┌────────────────────┐                │
│          │   │ React Query        │                │
│          │   │ - Invalidate cache │                │
│          │   │ - Refetch data     │                │
│          │   └────────────────────┘                │
└──────────┘                                         └──────────┘
```

### 3. Real-time Notification Flow

```
┌──────────┐                              ┌──────────┐
│ Employee │                              │ Manager  │
│  Client  │                              │  Client  │
└────┬─────┘                              └────┬─────┘
     │                                         │
     │  1. WebSocket Connection                │
     │ ────────────────────────────────────────┼────>
     │                                         │  ┌────────────┐
     │                                         │  │ Socket.io  │
     │                                         │  │ Server     │
     │                                         │  └──────┬─────┘
     │                                         │         │
     │  2. Manager Creates Shift               │         │
     │<────────────────────────────────────────┼─────────┤
     │                                         │         │
     │                                         ▼         │
     │                                  ┌──────────────┐ │
     │                                  │ Shift        │ │
     │                                  │ Created      │ │
     │                                  └──────┬───────┘ │
     │                                         │         │
     │  3. Emit Event to Connected Clients     │         │
     │<────────────────────────────────────────┴─────────┤
     │   event: 'shift:created'                          │
     │   data: { shiftId, employeeId, ... }              │
     │                                                   │
     │  4. Update UI Immediately                         │
     │   ┌────────────────────┐                          │
     │   │ React Component    │                          │
     │   │ - Show toast       │                          │
     │   │ - Update calendar  │                          │
     │   └────────────────────┘                          │
     │                                                   │
     │  5. Background: Send Email/Push                   │
     │                 ┌──────────────────┐              │
     │                 │ Notification     │              │
     │                 │ Service          │              │
     │                 │ - SendGrid       │              │
     │                 │ - Firebase FCM   │              │
     │                 └──────────────────┘              │
     │                                                   │
```

---

## Deployment Architecture

### Development Environment

```
┌─────────────────────────────────────────────────┐
│              Developer Laptop                    │
│                                                  │
│  ┌────────────────────────────────────────┐     │
│  │  Docker Compose                        │     │
│  │                                         │     │
│  │  ┌──────────────┐  ┌──────────────┐   │     │
│  │  │  Frontend    │  │  Backend     │   │     │
│  │  │  (Vite HMR)  │  │  (nodemon)   │   │     │
│  │  │  :5173       │  │  :3000       │   │     │
│  │  └──────────────┘  └──────────────┘   │     │
│  │                                         │     │
│  │  ┌──────────────┐  ┌──────────────┐   │     │
│  │  │ PostgreSQL   │  │    Redis     │   │     │
│  │  │  :5432       │  │    :6379     │   │     │
│  │  └──────────────┘  └──────────────┘   │     │
│  │                                         │     │
│  └────────────────────────────────────────┘     │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Production Environment (AWS)

```
┌──────────────────────────────────────────────────────────────────┐
│                           USERS                                   │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                     Route 53 (DNS)                                │
│                   schedulerpro.com                                │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                     CloudFront (CDN)                              │
│                 - Global edge locations                           │
│                 - SSL certificate                                 │
│                 - Static asset caching                            │
└────────┬───────────────────────────────────┬─────────────────────┘
         │                                   │
         ▼                                   ▼
┌──────────────────────┐          ┌────────────────────────────────┐
│    S3 Bucket         │          │  Application Load Balancer     │
│  (Frontend Assets)   │          │          (ALB)                 │
│  - HTML, CSS, JS     │          │  - Health checks               │
│  - Images, fonts     │          │  - SSL termination             │
└──────────────────────┘          └───────────┬────────────────────┘
                                              │
                         ┌────────────────────┴────────────────────┐
                         │                                         │
                         ▼                                         ▼
              ┌─────────────────────┐                  ┌─────────────────────┐
              │   EC2 Instance 1    │                  │   EC2 Instance 2    │
              │  (Backend Server)   │                  │  (Backend Server)   │
              │  - Node.js + Express│                  │  - Node.js + Express│
              │  - Docker container │                  │  - Docker container │
              │  - Auto-scaling     │                  │  - Auto-scaling     │
              └──────────┬──────────┘                  └──────────┬──────────┘
                         │                                        │
                         └────────────────┬───────────────────────┘
                                          │
                         ┌────────────────┴────────────────┐
                         │                                 │
                         ▼                                 ▼
              ┌─────────────────────┐          ┌─────────────────────┐
              │  RDS PostgreSQL     │          │  ElastiCache Redis  │
              │  - Primary (Master) │          │  - Cluster mode     │
              │  - Read Replicas    │          │  - Session storage  │
              │  - Automated backup │          │  - API cache        │
              └─────────────────────┘          └─────────────────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │   S3 Bucket         │
              │  (File Storage)     │
              │  - Uploads          │
              │  - Exports          │
              │  - Backups          │
              └─────────────────────┘
```

### CI/CD Pipeline

```
┌──────────────┐
│  Developer   │
│  Git Push    │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│                 GitHub Repository                         │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│               GitHub Actions (CI/CD)                      │
│                                                           │
│  Stage 1: Lint & Type Check                              │
│  ├── ESLint                                               │
│  ├── TypeScript type check                               │
│  └── Prettier format check                               │
│                                                           │
│  Stage 2: Test                                            │
│  ├── Unit tests (Vitest/Jest)                            │
│  ├── Integration tests (Supertest)                       │
│  └── E2E tests (Cypress)                                 │
│                                                           │
│  Stage 3: Build                                           │
│  ├── Build frontend (Vite)                               │
│  ├── Build backend (TypeScript)                          │
│  └── Build Docker images                                 │
│                                                           │
│  Stage 4: Security Scan                                   │
│  ├── Dependency scan (Snyk)                              │
│  └── Container scan                                      │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│             Deploy to Staging                             │
│  ├── Deploy frontend to S3                               │
│  ├── Deploy backend to staging EC2                       │
│  ├── Run smoke tests                                     │
│  └── Run E2E tests                                        │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│            Manual Approval                                │
│          (Product Owner / Tech Lead)                      │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│           Deploy to Production                            │
│  ├── Blue-Green Deployment                               │
│  ├── Deploy new version (Green)                          │
│  ├── Health checks pass                                  │
│  ├── Switch traffic to Green                             │
│  └── Keep Blue for rollback                              │
└──────────────────────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│              Post-Deployment                              │
│  ├── Smoke tests                                         │
│  ├── Monitor logs (Datadog)                              │
│  ├── Monitor errors (Sentry)                             │
│  └── Send Slack notification                             │
└──────────────────────────────────────────────────────────┘
```

---

## Security Architecture

### Multi-Layer Security Model

```
┌─────────────────────────────────────────────────────────┐
│                    Layer 1: Network                      │
│  ├── WAF (Web Application Firewall)                     │
│  ├── DDoS Protection (CloudFlare)                       │
│  ├── VPC (Virtual Private Cloud)                        │
│  └── Security Groups (Firewall rules)                   │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  Layer 2: Application                    │
│  ├── Rate Limiting (Redis)                              │
│  ├── CORS Configuration                                 │
│  ├── Security Headers (Helmet.js)                       │
│  ├── Input Validation (Zod)                             │
│  └── XSS & CSRF Protection                              │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Layer 3: Authentication                     │
│  ├── JWT (Access + Refresh Tokens)                      │
│  ├── Password Hashing (bcrypt)                          │
│  ├── Session Management                                 │
│  └── MFA (Optional)                                     │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Layer 4: Authorization                      │
│  ├── RBAC (Role-Based Access Control)                   │
│  ├── Permission Middleware                              │
│  ├── Resource Ownership Checks                          │
│  └── Organization Isolation                             │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   Layer 5: Data                          │
│  ├── Encryption at Rest (AES-256)                       │
│  ├── Encryption in Transit (TLS 1.3)                    │
│  ├── Field-Level Encryption (PII)                       │
│  ├── SQL Injection Prevention (Prisma)                  │
│  └── Audit Logging                                      │
└─────────────────────────────────────────────────────────┘
```

### Authentication & Authorization Flow

```
┌──────────┐                                    ┌──────────┐
│  Client  │                                    │ Backend  │
└────┬─────┘                                    └────┬─────┘
     │                                                │
     │  1. Login (email + password)                  │
     │ ──────────────────────────────────────────────>
     │                                                │
     │                                          ┌─────▼─────┐
     │                                          │  Verify   │
     │                                          │ Password  │
     │                                          └─────┬─────┘
     │                                                │
     │  2. Generate JWT (access + refresh)           │
     │<──────────────────────────────────────────────│
     │   accessToken (15min expiry)                  │
     │   refreshToken (7 days expiry)                │
     │                                                │
     │  3. Store tokens                              │
     │ ┌────────────────┐                            │
     │ │ localStorage   │                            │
     │ │ or HTTP-only   │                            │
     │ │ Cookie         │                            │
     │ └────────────────┘                            │
     │                                                │
     │  4. Authenticated Request                     │
     │ ──────────────────────────────────────────────>
     │   Authorization: Bearer <accessToken>         │
     │                                                │
     │                                          ┌─────▼─────┐
     │                                          │  Verify   │
     │                                          │  JWT      │
     │                                          └─────┬─────┘
     │                                                │
     │                                          ┌─────▼─────┐
     │                                          │  Check    │
     │                                          │  Perms    │
     │                                          └─────┬─────┘
     │                                                │
     │  5. Return Data                               │
     │<──────────────────────────────────────────────│
     │                                                │
```

---

## Scalability Strategy

### Horizontal Scaling

**Frontend:**
- Static assets on CDN (CloudFront)
- Multiple edge locations worldwide
- Client-side rendering with React
- Service worker for offline caching

**Backend:**
- Stateless API servers
- Load balancer distributes requests
- Auto-scaling based on CPU/memory
- Health checks for automatic recovery

**Database:**
- Read replicas for read-heavy operations
- Connection pooling (PgBouncer)
- Query caching with Redis
- Database partitioning (if needed)

### Performance Optimization

```
┌─────────────────────────────────────────────────────────┐
│                   Performance Layers                     │
│                                                          │
│  Layer 1: CDN Caching (CloudFront)                      │
│  ├── TTL: 1 day for static assets                       │
│  └── TTL: 1 hour for API responses (GET)                │
│                                                          │
│  Layer 2: Redis Caching                                 │
│  ├── Sessions: 7 days                                   │
│  ├── Employee data: 5 minutes                           │
│  ├── Schedule data: 1 minute                            │
│  └── API responses: 30 seconds                          │
│                                                          │
│  Layer 3: Database Query Optimization                   │
│  ├── Proper indexes on foreign keys                     │
│  ├── Composite indexes for common queries               │
│  ├── Query result caching                               │
│  └── Read replicas for analytics                        │
│                                                          │
│  Layer 4: Application Optimization                      │
│  ├── Code splitting (React.lazy)                        │
│  ├── Virtual scrolling (react-window)                   │
│  ├── Memoization (useMemo, React.memo)                  │
│  └── Debouncing & throttling                            │
└─────────────────────────────────────────────────────────┘
```

### Monitoring & Observability

```
┌──────────────────────────────────────────────────────────┐
│                    Monitoring Stack                       │
│                                                           │
│  ┌────────────────┐  ┌────────────────┐                 │
│  │  Sentry        │  │  Datadog       │                 │
│  │  - Frontend    │  │  - APM         │                 │
│  │  - Backend     │  │  - Metrics     │                 │
│  │  - Errors      │  │  - Traces      │                 │
│  └────────────────┘  └────────────────┘                 │
│                                                           │
│  ┌────────────────┐  ┌────────────────┐                 │
│  │  CloudWatch    │  │  Logs (ELK)    │                 │
│  │  - AWS metrics │  │  - Application │                 │
│  │  - Alarms      │  │  - Access logs │                 │
│  │  - Dashboards  │  │  - Audit logs  │                 │
│  └────────────────┘  └────────────────┘                 │
│                                                           │
│  Alerts sent to:                                         │
│  ├── Slack (#alerts channel)                             │
│  ├── PagerDuty (for critical issues)                    │
│  └── Email (for daily reports)                           │
└──────────────────────────────────────────────────────────┘
```

---

## Conclusion

This architecture provides a solid foundation for building a scalable, secure, and maintainable scheduling application. Key strengths:

✅ **Scalable:** Horizontal scaling at every layer
✅ **Secure:** Multi-layer security model
✅ **Resilient:** Automated failover and recovery
✅ **Observable:** Comprehensive monitoring and logging
✅ **Maintainable:** Clear separation of concerns
✅ **Performant:** Multi-layer caching strategy

**Next Steps:**
1. Review and approve architecture
2. Set up development infrastructure
3. Begin Sprint 1 implementation
4. Establish monitoring and alerting

---

**Document Owner:** Solutions Architect  
**Reviewers:** Engineering Team, DevOps, Security  
**Approval Required:** CTO, Tech Lead  
**Version History:**
- v1.0 - Initial draft (2024-12-18)
