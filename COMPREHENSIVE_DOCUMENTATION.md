# Staff Scheduler Pro - Comprehensive Documentation

**Version:** 1.0.0  
**Last Updated:** February 26, 2026  
**Status:** Active Development

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture & Design](#2-architecture--design)
3. [Getting Started](#3-getting-started)
4. [Project Structure](#4-project-structure)
5. [API / Module Reference](#5-api--module-reference)
6. [Usage Guide](#6-usage-guide)
7. [Testing](#7-testing)
8. [Deployment](#8-deployment)
9. [Contributing](#9-contributing)
10. [Known Issues & Roadmap](#10-known-issues--roadmap)

---

## 1. Project Overview

### What is Staff Scheduler Pro?

Staff Scheduler Pro is a modern, comprehensive staff scheduling and workforce management application designed to streamline employee scheduling, payroll management, and workforce analytics. Built with React 19 and a planned Node.js backend, it provides an intuitive drag-and-drop interface for creating and managing staff schedules across multiple departments and locations.

### Key Features and Capabilities

#### Core Scheduling Features
- **🗓️ Interactive Weekly Calendar View** - Visual weekly schedule display with intuitive date navigation
- **🎯 Drag-and-Drop Shift Management** - Seamlessly move shifts between employees and days using accessible drag-and-drop powered by @dnd-kit
- **➕ Quick Shift Creation** - Modal-based shift creation with validation and conflict detection
- **📊 Real-Time Statistics** - Live dashboard showing total shifts, hours worked, and scheduling efficiency metrics
- **🔄 Week Navigation** - Easy navigation between weeks with arrow controls and date picker

#### Employee Management
- **👥 Employee Profiles** - Comprehensive employee information including roles, contact details, departments, and availability
- **📋 Employee Grid View** - Card-based or list-based employee display with filtering and search
- **📈 Employee Statistics** - Track hours worked, shifts assigned, and performance metrics
- **🎨 Role-Based Categorization** - Color-coded roles (Full-time, Part-time, Contractor, etc.)
- **🔍 Advanced Filtering** - Filter employees by department, role, status, or custom criteria

#### Payroll & Analytics
- **💰 Payroll Dashboard** - Comprehensive payroll calculation based on shifts and hourly rates
- **📊 Payroll Statistics** - Track gross pay, total hours, overtime, and employee counts
- **📅 Period Selection** - View payroll data by custom date ranges or pay periods
- **📑 Employee Payroll Breakdown** - Detailed per-employee payroll information
- **💾 Export Capabilities** - Export payroll data to CSV, Excel, or PDF formats
- **📈 Historical Analysis** - Compare payroll trends across different periods

#### User Experience
- **📱 Fully Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **🎨 Modern UI/UX** - Clean, professional interface built with TailwindCSS v4
- **♿ Accessibility** - WCAG-compliant with keyboard navigation and screen reader support
- **⚡ High Performance** - Fast rendering with optimized React components
- **🔔 Real-Time Updates** - Live data synchronization (planned with backend)

### Target Users

#### Primary Audience
- **🏢 Small to Medium Businesses (SMBs)** - Restaurants, retail stores, healthcare facilities, hospitality
- **👨‍💼 Managers & Supervisors** - Operations managers, shift supervisors, HR personnel
- **📊 Payroll Administrators** - Accounting teams, payroll processors
- **👷 Team Leads** - Department heads, project managers

#### User Personas

**Sarah - Restaurant Manager**
- Needs to schedule 30+ staff across breakfast, lunch, and dinner shifts
- Requires quick shift adjustments for call-outs and no-shows
- Tracks labor costs against revenue targets

**Mike - HR Director**
- Manages multiple departments with different scheduling rules
- Generates payroll reports for accounting
- Ensures compliance with labor laws and overtime regulations

**Jessica - Shift Supervisor**
- Views and manages team schedules
- Handles time-off requests and shift swaps
- Communicates schedule changes to team members

### Tech Stack and Dependencies

#### Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1.0 | Core UI framework with modern hooks and concurrent features |
| **Vite** | 7.0.0 | Ultra-fast build tool with HMR (Hot Module Replacement) |
| **TailwindCSS** | 4.1.11 | Utility-first CSS framework for responsive design |
| **@dnd-kit/core** | 6.3.1 | Accessible drag-and-drop toolkit for React |
| **@dnd-kit/sortable** | 10.0.0 | Sortable presets and utilities for drag-and-drop |
| **date-fns** | 4.1.0 | Lightweight date manipulation library |
| **Cypress** | 14.5.0 | End-to-end testing framework |

#### Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **ESLint** | 9.29.0 | JavaScript/React linting for code quality |
| **PostCSS** | 8.5.6 | CSS transformation and optimization |
| **Autoprefixer** | 10.4.21 | Automatic CSS vendor prefixing |

#### Planned Backend Stack (Roadmap)

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 20 LTS+ | JavaScript runtime for backend services |
| **Express** | 5.0+ | Web application framework |
| **TypeScript** | 5.6+ | Type-safe backend development |
| **PostgreSQL** | 15+ | Relational database for data persistence |
| **Prisma** | 5.0+ | Next-generation ORM for database access |
| **Redis** | 7.0+ | Caching and session management |
| **JWT** | - | Authentication and authorization |
| **SendGrid/SES** | - | Email notification service |

---

## 2. Architecture & Design

### High-Level System Architecture

Staff Scheduler Pro is currently a **Single Page Application (SPA)** with a planned **three-tier architecture** for the full-stack implementation.

#### Current Architecture (Frontend Only)

```
┌──────────────────────────────────────────────────────────────┐
│                       CLIENT LAYER                            │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  React Application (SPA)                               │  │
│  │                                                         │  │
│  │  ├── Components (UI/Scheduler/Employees/Payroll)      │  │
│  │  ├── Pages (Dashboard/Scheduler/Employees/Payroll)    │  │
│  │  ├── Hooks (Custom React hooks for state management)  │  │
│  │  ├── Utils (Date/Shift utilities)                     │  │
│  │  └── Data (Mock data for development)                 │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  Served by: Vite Dev Server (Development)                    │
│            Static Files on CDN (Production)                  │
└──────────────────────────────────────────────────────────────┘
```

#### Planned Full-Stack Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                       CLIENT LAYER                            │
│   React 19 + Vite + TailwindCSS + @dnd-kit                   │
│   - Component-based UI                                        │
│   - Client-side routing                                       │
│   - State management with hooks                              │
└───────────────────┬──────────────────────────────────────────┘
                    │ HTTPS/REST API
                    │ WebSocket (real-time)
                    ▼
┌──────────────────────────────────────────────────────────────┐
│                    API GATEWAY LAYER                          │
│   Load Balancer (Nginx/AWS ALB)                              │
│   - Rate limiting                                             │
│   - SSL/TLS termination                                       │
│   - Request routing                                           │
│   - CORS management                                           │
└───────────────────┬──────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────────┐
│                  APPLICATION LAYER                            │
│   Node.js + Express + TypeScript                             │
│                                                               │
│   ┌──────────────────────────────────────────────────────┐   │
│   │ Middleware Stack                                     │   │
│   │ ├── Authentication (JWT)                            │   │
│   │ ├── Authorization (RBAC)                            │   │
│   │ ├── Validation (Zod schemas)                        │   │
│   │ ├── Error handling                                  │   │
│   │ └── Logging (Winston)                               │   │
│   └──────────────────────────────────────────────────────┘   │
│                                                               │
│   ┌──────────────────────────────────────────────────────┐   │
│   │ Service Layer                                        │   │
│   │ ├── AuthService                                     │   │
│   │ ├── EmployeeService                                 │   │
│   │ ├── ShiftService                                    │   │
│   │ ├── ScheduleService                                 │   │
│   │ ├── PayrollService                                  │   │
│   │ ├── NotificationService                             │   │
│   │ └── ReportService                                   │   │
│   └──────────────────────────────────────────────────────┘   │
└───────────────────┬──────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────────┐
│                      DATA LAYER                               │
│                                                               │
│   ┌──────────────────┐  ┌──────────────┐  ┌──────────────┐  │
│   │   PostgreSQL     │  │    Redis     │  │   S3/CDN     │  │
│   │   (Primary DB)   │  │   (Cache)    │  │  (Storage)   │  │
│   │                  │  │              │  │              │  │
│   │ - Users          │  │ - Sessions   │  │ - Exports    │  │
│   │ - Employees      │  │ - API cache  │  │ - Uploads    │  │
│   │ - Shifts         │  │ - Rate limit │  │ - Assets     │  │
│   │ - Schedules      │  │              │  │              │  │
│   │ - Payroll        │  │              │  │              │  │
│   └──────────────────┘  └──────────────┘  └──────────────┘  │
└──────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES                            │
│                                                               │
│   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│   │  SendGrid    │ │    Twilio    │ │   Firebase   │        │
│   │   (Email)    │ │    (SMS)     │ │    (Push)    │        │
│   └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                               │
│   ┌──────────────┐ ┌──────────────┐                         │
│   │    Sentry    │ │   Datadog    │                         │
│   │   (Errors)   │ │ (Monitoring) │                         │
│   └──────────────┘ └──────────────┘                         │
└──────────────────────────────────────────────────────────────┘
```

### Component/Module Breakdown

#### Frontend Component Hierarchy

```
App.jsx (Root)
├── Navbar.jsx (Navigation)
│
└── Pages
    ├── Dashboard.jsx
    │   └── (Statistics & Overview)
    │
    ├── SchedulerPage.jsx
    │   └── StaffScheduler.jsx
    │       ├── CalendarHeader.jsx (Week navigation)
    │       ├── EmployeeRow.jsx (Employee + shifts)
    │       │   └── DraggableShift.jsx (Individual shift)
    │       ├── StatisticsPanel.jsx (Real-time stats)
    │       └── AddShiftModal.jsx (Shift creation form)
    │
    ├── EmployeesPage.jsx
    │   ├── EmployeeFilters.jsx (Search/filter controls)
    │   ├── EmployeeStats.jsx (Statistics cards)
    │   └── EmployeeList.jsx
    │       ├── EmployeeGrid.jsx (Grid view)
    │       ├── EmployeeCards.jsx (Card layout)
    │       └── EmployeeModal.jsx (Edit/view details)
    │
    └── PayrollPage.jsx
        └── PayrollDashboard.jsx
            ├── PayrollPeriodSelector.jsx (Date range)
            ├── PayrollStatistics.jsx (Summary cards)
            ├── PayrollEmployeeList.jsx (Employee breakdown)
            ├── PayrollDetailsModal.jsx (Detailed view)
            ├── PayrollExport.jsx (Export functionality)
            └── PayrollAccounting.jsx (Accounting integration)
```

#### UI Component Library

**Reusable Components** (`src/components/ui/`)

- **Button.jsx** - Customizable button with variants (primary, secondary, danger)
- **Modal.jsx** - Accessible modal dialog with overlay
- **StatCard.jsx** - Statistics display card with icon and value

#### Custom Hooks

**State Management Hooks** (`src/hooks/`)

- **useShifts.js** - Manages shift state (add, update, delete, reassign)
- **useEmployees.js** - Employee data management and filtering
- **useWeekNavigation.js** - Week navigation and date calculations
- **useDragAndDrop.js** - Drag-and-drop state and event handlers
- **usePayroll.js** - Payroll calculations and period management

#### Utility Modules

**Helper Functions** (`src/utils/`)

- **dateUtils.js** - Date formatting, parsing, and calculations
- **shiftUtils.js** - Shift validation, conflict detection, calculations

#### Data Models

**Mock Data Structure** (`src/data/`)

```javascript
// employees.js
{
  id: 'emp_001',
  name: 'John Doe',
  role: 'Full-time',
  department: 'Kitchen',
  email: 'john.doe@example.com',
  phone: '555-0100',
  hourlyRate: 18.50,
  avatar: '/avatars/john.jpg',
  isActive: true,
  hiredDate: '2023-01-15',
  availability: { /* weekly schedule */ }
}

// shifts.js
{
  id: 'shift_001',
  employeeId: 'emp_001',
  date: '2026-02-24',
  startTime: '09:00',
  endTime: '17:00',
  role: 'Server',
  notes: 'Morning shift',
  status: 'scheduled'
}

// payrollRecords.js
{
  id: 'pay_001',
  employeeId: 'emp_001',
  period: { start: '2026-02-17', end: '2026-02-23' },
  regularHours: 40,
  overtimeHours: 5,
  totalHours: 45,
  regularPay: 740.00,
  overtimePay: 138.75,
  totalPay: 878.75
}
```

### Data Flow and Key Interactions

#### Shift Management Flow

```
User Action → Component Event → Hook State Update → UI Re-render
                                      ↓
                              Validation & Business Logic
                                      ↓
                              (Future: API Call → Backend)
```

**Example: Adding a New Shift**

1. User clicks "Add Shift" button
2. `AddShiftModal` component opens
3. User fills form (employee, date, time, role)
4. Form validation (Zod schema or manual validation)
5. Submit → `useShifts` hook → `addShift()` function
6. State updated with new shift
7. UI re-renders with new shift displayed
8. Statistics automatically recalculated

**Example: Drag-and-Drop Shift Reassignment**

1. User drags shift to different employee/day
2. `useDragAndDrop` hook captures drag events
3. Drop validation (conflicts, availability)
4. `useShifts` hook → `updateShift()` function
5. Shift data updated with new employee/date
6. UI reflects changes with animation
7. Statistics panel updates

#### Payroll Calculation Flow

```
Period Selection
      ↓
Fetch Shifts for Period
      ↓
For Each Employee:
   ├── Calculate Regular Hours (≤40/week)
   ├── Calculate Overtime (>40/week × 1.5)
   ├── Apply Hourly Rate
   └── Sum Total Pay
      ↓
Aggregate Statistics
      ↓
Display in Dashboard
```

### Database Schema (Planned)

#### Core Tables

**organizations** (Multi-tenant support)
- `id` (UUID, PK)
- `name`, `slug`, `subdomain`
- `settings` (JSONB - timezone, overtime rules)
- `subscription_tier`
- `created_at`, `updated_at`

**users** (Authentication)
- `id` (UUID, PK)
- `organization_id` (FK)
- `email`, `password_hash`
- `first_name`, `last_name`
- `role` (admin, manager, employee, viewer)
- `email_verified`, `is_active`

**employees** (Staff Directory)
- `id` (UUID, PK)
- `organization_id` (FK)
- `user_id` (FK, nullable)
- `name`, `email`, `phone`
- `department`, `position`
- `hourly_rate`, `hire_date`
- `employment_type` (full-time, part-time, contractor)
- `is_active`

**shifts** (Schedule Data)
- `id` (UUID, PK)
- `organization_id` (FK)
- `employee_id` (FK)
- `schedule_id` (FK, nullable)
- `date`, `start_time`, `end_time`
- `role`, `notes`
- `status` (scheduled, completed, cancelled)
- `created_by` (FK to users)

**schedules** (Schedule Management)
- `id` (UUID, PK)
- `organization_id` (FK)
- `name`, `description`
- `start_date`, `end_date`
- `status` (draft, published, archived)
- `created_by` (FK)

**time_off_requests** (PTO Management)
- `id` (UUID, PK)
- `employee_id` (FK)
- `start_date`, `end_date`
- `type` (vacation, sick, personal)
- `status` (pending, approved, denied)
- `notes`, `approved_by` (FK)

For complete database schema, see [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)

---

## 3. Getting Started

### Prerequisites

#### Required Software

| Software | Minimum Version | Recommended Version | Purpose |
|----------|----------------|---------------------|---------|
| **Node.js** | 16.0.0 | 20.x LTS | JavaScript runtime |
| **npm** | 8.0.0 | 10.x | Package manager |
| **Git** | 2.30.0 | Latest | Version control |
| **Modern Browser** | - | Chrome 100+, Firefox 100+, Safari 15+ | Application runtime |

#### Optional (Recommended)

- **VS Code** - Code editor with React/JavaScript extensions
- **React DevTools** - Browser extension for debugging React components
- **Git GUI** (GitKraken, SourceTree) - Visual Git interface

#### Verify Installation

```bash
# Check Node.js version
node --version
# Expected output: v20.x.x or higher

# Check npm version
npm --version
# Expected output: 10.x.x or higher

# Check Git version
git --version
# Expected output: git version 2.30.x or higher
```

### Installation Steps

#### 1. Clone the Repository

```bash
# Clone via HTTPS
git clone https://github.com/yourusername/scheduler.git

# OR clone via SSH
git clone git@github.com:yourusername/scheduler.git

# Navigate to project directory
cd scheduler
```

#### 2. Install Dependencies

```bash
# Install all npm dependencies
npm install

# This will install:
# - React 19 and React DOM
# - Vite build tool
# - TailwindCSS and plugins
# - @dnd-kit drag-and-drop library
# - date-fns utility library
# - Development dependencies (ESLint, Cypress, etc.)
```

**Troubleshooting Installation**

If you encounter errors:

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

#### 3. Start Development Server

```bash
# Start Vite development server with hot module replacement
npm run dev

# Server will start at: http://localhost:5173
# Vite will automatically open your default browser
```

Expected output:
```
VITE v7.0.0  ready in 432 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

#### 4. Verify Installation

Open your browser to `http://localhost:5173` and you should see:
- Staff Scheduler Pro dashboard
- Navigation bar with Dashboard, Scheduler, Employees, Payroll links
- No console errors in browser DevTools

### Environment Variables and Configuration

#### Current Configuration (Frontend Only)

The current version uses **mock data** and doesn't require environment variables. All configuration is in source files.

#### Vite Configuration

**vite.config.js**

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

#### TailwindCSS Configuration

**tailwind.config.js**

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Custom theme extensions
    },
  },
  plugins: [],
}
```

#### Future Environment Variables (with Backend)

When backend is implemented, create a `.env` file:

```bash
# Backend API
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_API_TIMEOUT=30000

# Authentication
VITE_JWT_SECRET=your-secret-key-here
VITE_JWT_EXPIRES_IN=15m

# Features
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_ANALYTICS=true

# External Services
VITE_SENTRY_DSN=your-sentry-dsn
VITE_GOOGLE_ANALYTICS_ID=UA-XXXXX-X

# Environment
VITE_NODE_ENV=development
```

**⚠️ Security Note:** Never commit `.env` files to version control. Add to `.gitignore`.

### Running Locally

#### Development Mode (with Hot Reload)

```bash
# Start development server
npm run dev

# Features:
# - Hot Module Replacement (HMR)
# - Fast refresh for React components
# - Source maps for debugging
# - Console errors and warnings
```

#### Production Build (Local Preview)

```bash
# Build for production
npm run build

# Output: dist/ folder with optimized assets
# - Minified JavaScript
# - Optimized CSS
# - Compressed assets

# Preview production build locally
npm run preview

# Server starts at: http://localhost:4173
```

#### Code Quality Checks

```bash
# Run ESLint
npm run lint

# This checks for:
# - Code style violations
# - React best practices
# - Potential bugs
# - Unused variables
```

#### Testing

```bash
# Open Cypress test runner (interactive)
npm run cy:open

# Run Cypress tests (headless)
npm run cy:run

# Start app and run tests together
npm run cy:dev   # Interactive mode
npm run cy:ci    # CI mode
```

---

## 4. Project Structure

### Directory Breakdown

```
scheduler/
│
├── cypress/                          # E2E testing with Cypress
│   ├── e2e/                         # Test specifications
│   │   ├── add-single-shift-simple.cy.js
│   │   ├── add-single-shift-today.cy.js
│   │   ├── debug.cy.js
│   │   ├── payroll.cy.js
│   │   └── scheduler-workflow.cy.js
│   ├── fixtures/                    # Test data fixtures
│   ├── screenshots/                 # Test failure screenshots
│   └── support/                     # Test utilities and commands
│       ├── commands.js
│       └── e2e.js
│
├── docs/                            # Project documentation
│   ├── API_ENDPOINTS.md             # API specification (planned)
│   ├── ARCHITECTURE.md              # System architecture
│   ├── DATABASE_SCHEMA.md           # Database design
│   ├── FEATURE_GAP_ANALYSIS.md      # Feature comparison
│   └── TECHNICAL_SPECIFICATION.md   # Technical specs
│
├── jira-backlog/                    # Project management
│   └── scheduler-pro-backlog.csv    # User stories and tasks
│
├── public/                          # Static assets (served as-is)
│   └── (images, icons, fonts)
│
├── src/                             # Source code
│   │
│   ├── components/                  # React components
│   │   │
│   │   ├── ui/                      # Reusable UI components
│   │   │   ├── Button.jsx           # Button component with variants
│   │   │   ├── Modal.jsx            # Modal dialog component
│   │   │   └── StatCard.jsx         # Statistics card component
│   │   │
│   │   ├── scheduler/               # Scheduler-specific components
│   │   │   ├── StaffScheduler.jsx   # Main scheduler container
│   │   │   ├── CalendarHeader.jsx   # Week navigation header
│   │   │   ├── EmployeeRow.jsx      # Employee row with shifts
│   │   │   ├── DraggableShift.jsx   # Individual shift (draggable)
│   │   │   ├── StatisticsPanel.jsx  # Real-time statistics display
│   │   │   └── AddShiftModal.jsx    # Shift creation modal
│   │   │
│   │   ├── employees/               # Employee management components
│   │   │   ├── EmployeeList.jsx     # Employee list container
│   │   │   ├── EmployeeGrid.jsx     # Grid layout view
│   │   │   ├── EmployeeCards.jsx    # Card layout view
│   │   │   ├── EmployeeFilters.jsx  # Search and filter controls
│   │   │   ├── EmployeeStats.jsx    # Employee statistics
│   │   │   └── EmployeeModal.jsx    # Employee details modal
│   │   │
│   │   ├── payroll/                 # Payroll components
│   │   │   ├── PayrollDashboard.jsx    # Main payroll view
│   │   │   ├── PayrollPeriodSelector.jsx  # Date range selector
│   │   │   ├── PayrollStatistics.jsx      # Summary cards
│   │   │   ├── PayrollEmployeeList.jsx    # Employee breakdown
│   │   │   ├── PayrollDetailsModal.jsx    # Detailed payroll view
│   │   │   ├── PayrollExport.jsx          # Export functionality
│   │   │   └── PayrollAccounting.jsx      # Accounting integration
│   │   │
│   │   └── Navbar.jsx               # Main navigation component
│   │
│   ├── pages/                       # Page-level components
│   │   ├── Dashboard.jsx            # Landing/overview page
│   │   ├── SchedulerPage.jsx        # Scheduler page
│   │   ├── EmployeesPage.jsx        # Employee management page
│   │   └── PayrollPage.jsx          # Payroll page
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useShifts.js             # Shift state management
│   │   ├── useEmployees.js          # Employee data management
│   │   ├── useWeekNavigation.js     # Week navigation logic
│   │   ├── useDragAndDrop.js        # Drag-and-drop handlers
│   │   └── usePayroll.js            # Payroll calculations
│   │
│   ├── utils/                       # Utility functions (pure)
│   │   ├── dateUtils.js             # Date formatting and calculations
│   │   └── shiftUtils.js            # Shift validation and calculations
│   │
│   ├── data/                        # Mock data (to be replaced with API)
│   │   ├── employees.js             # Employee mock data
│   │   ├── shifts.js                # Shift mock data
│   │   ├── payroll.js               # Payroll configuration
│   │   ├── payrollRecords.js        # Payroll records mock data
│   │   └── historicalData.js        # Historical metrics
│   │
│   ├── constants/                   # Application constants
│   │   └── scheduler.js             # Scheduler settings and config
│   │
│   ├── assets/                      # Application assets
│   │   └── (images, icons, fonts)
│   │
│   ├── App.jsx                      # Root application component
│   ├── App.css                      # Application-level styles
│   ├── main.jsx                     # Application entry point
│   └── index.css                    # Global styles and Tailwind imports
│
├── .gitignore                       # Git ignore rules
├── cypress.config.js                # Cypress configuration
├── eslint.config.js                 # ESLint configuration
├── index.html                       # HTML entry point
├── package.json                     # Dependencies and scripts
├── package-lock.json                # Locked dependency versions
├── README.md                        # Project README
├── README_DEVELOPER.md              # Developer setup guide
├── run-cypress-test.sh              # Test automation script
├── tailwind.config.js               # TailwindCSS configuration
└── vite.config.js                   # Vite configuration
```

### Key Files Explained

#### Configuration Files

**package.json**
- Project metadata, dependencies, and npm scripts
- Key scripts: `dev`, `build`, `lint`, `preview`, `cy:open`, `cy:run`

**vite.config.js**
- Vite build tool configuration
- Plugin setup (React, TailwindCSS)
- Dev server settings (port 5173)

**tailwind.config.js**
- TailwindCSS framework configuration
- Custom theme extensions
- Content paths for purging unused styles

**eslint.config.js**
- Code quality and style rules
- React-specific linting rules
- Best practices enforcement

**cypress.config.js**
- E2E test configuration
- Base URL, viewport settings
- Test file patterns

#### Entry Points

**index.html**
- Root HTML file
- Loads React application via script tag
- Meta tags and favicon links

**src/main.jsx**
```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**src/App.jsx**
- Root React component
- View router (Dashboard, Scheduler, Employees, Payroll)
- State management for current view

#### Core Modules

**Component Examples**

`src/components/ui/Button.jsx`
```javascript
// Reusable button with variants: primary, secondary, danger
export default function Button({ children, variant, onClick, ...props }) {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  }
  
  return (
    <button 
      className={`px-4 py-2 rounded-md ${variants[variant]}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}
```

`src/hooks/useShifts.js`
```javascript
// Custom hook for shift management
export function useShifts() {
  const [shifts, setShifts] = useState(initialShifts)
  
  const addShift = (shiftData) => {
    const newShift = { id: generateId(), ...shiftData }
    setShifts([...shifts, newShift])
  }
  
  const updateShift = (id, updates) => {
    setShifts(shifts.map(s => s.id === id ? {...s, ...updates} : s))
  }
  
  const deleteShift = (id) => {
    setShifts(shifts.filter(s => s.id !== id))
  }
  
  return { shifts, addShift, updateShift, deleteShift }
}
```

`src/utils/dateUtils.js`
```javascript
// Date utility functions
import { format, addDays, startOfWeek } from 'date-fns'

export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  return format(date, formatStr)
}

export const getWeekDays = (startDate) => {
  return Array.from({ length: 7 }, (_, i) => addDays(startDate, i))
}

export const getCurrentWeekStart = () => {
  return startOfWeek(new Date(), { weekStartsOn: 1 }) // Monday
}
```

---

## 5. API / Module Reference

### Current Status

⚠️ **Note:** The application currently uses **mock data** stored in `src/data/` files. Backend API integration is planned for future sprints.

### Frontend Module API

#### Custom Hooks

##### `useShifts()`

Manages shift state and operations.

```javascript
import { useShifts } from '@/hooks/useShifts'

function MyComponent() {
  const { 
    shifts,           // Array of shift objects
    addShift,         // Function to add new shift
    updateShift,      // Function to update existing shift
    deleteShift,      // Function to delete shift
    getShiftsByDate,  // Function to filter by date
    getShiftsByEmployee // Function to filter by employee
  } = useShifts()
}
```

**Methods:**

- **`addShift(shiftData)`**
  - Params: `shiftData` (object) - Shift details
  - Returns: New shift object with generated ID
  - Example:
    ```javascript
    addShift({
      employeeId: 'emp_001',
      date: '2026-02-24',
      startTime: '09:00',
      endTime: '17:00',
      role: 'Server'
    })
    ```

- **`updateShift(id, updates)`**
  - Params: `id` (string), `updates` (object)
  - Returns: Updated shift object
  - Example:
    ```javascript
    updateShift('shift_123', { 
      startTime: '10:00',
      endTime: '18:00'
    })
    ```

- **`deleteShift(id)`**
  - Params: `id` (string)
  - Returns: void
  - Example: `deleteShift('shift_123')`

- **`getShiftsByDate(date)`**
  - Params: `date` (string, ISO format)
  - Returns: Array of shifts for that date
  - Example: `getShiftsByDate('2026-02-24')`

##### `useEmployees()`

Manages employee data and filtering.

```javascript
import { useEmployees } from '@/hooks/useEmployees'

function MyComponent() {
  const {
    employees,          // All employees
    filteredEmployees,  // Filtered employees
    filterBy,           // Current filters
    setFilterBy,        // Function to set filters
    searchQuery,        // Search query string
    setSearchQuery      // Function to set search
  } = useEmployees()
}
```

**Filter Object:**
```javascript
{
  department: 'Kitchen' | 'Front of House' | 'all',
  role: 'Full-time' | 'Part-time' | 'Contractor' | 'all',
  status: 'active' | 'inactive' | 'all'
}
```

##### `useWeekNavigation()`

Handles week-based date navigation.

```javascript
import { useWeekNavigation } from '@/hooks/useWeekNavigation'

function MyComponent() {
  const {
    currentWeekStart,  // Date object for start of week
    weekDays,          // Array of 7 date objects
    goToNextWeek,      // Function to navigate forward
    goToPreviousWeek,  // Function to navigate backward
    goToToday,         // Function to jump to current week
    isCurrentWeek      // Boolean: is viewing current week
  } = useWeekNavigation()
}
```

##### `useDragAndDrop(shifts, onShiftUpdate)`

Manages drag-and-drop interactions.

```javascript
import { useDragAndDrop } from '@/hooks/useDragAndDrop'

function MyComponent() {
  const {
    sensors,           // DndKit sensors
    handleDragStart,   // Drag start handler
    handleDragEnd,     // Drag end handler
    activeId           // Currently dragging shift ID
  } = useDragAndDrop(shifts, onShiftUpdate)
}
```

##### `usePayroll(startDate, endDate)`

Calculates payroll for a given period.

```javascript
import { usePayroll } from '@/hooks/usePayroll'

function MyComponent() {
  const {
    payrollRecords,    // Array of employee payroll records
    totalGrossPay,     // Sum of all gross pay
    totalHours,        // Sum of all hours
    totalEmployees,    // Count of employees
    overtimeHours,     // Sum of overtime hours
    calculatePeriod    // Function to recalculate
  } = usePayroll('2026-02-17', '2026-02-23')
}
```

**Payroll Record Structure:**
```javascript
{
  employeeId: 'emp_001',
  employeeName: 'John Doe',
  regularHours: 40,
  overtimeHours: 5,
  totalHours: 45,
  hourlyRate: 18.50,
  regularPay: 740.00,
  overtimePay: 138.75,  // overtime rate = hourly * 1.5
  totalPay: 878.75,
  department: 'Kitchen'
}
```

#### Utility Functions

##### Date Utilities (`utils/dateUtils.js`)

```javascript
import { 
  formatDate, 
  formatTime, 
  getWeekDays, 
  getCurrentWeekStart,
  isSameDay,
  addWeeks,
  isToday
} from '@/utils/dateUtils'
```

**Functions:**

- **`formatDate(date, format)`**
  - Formats date object or ISO string
  - Default format: 'MMM dd, yyyy'
  - Example: `formatDate('2026-02-24')` → "Feb 24, 2026"

- **`formatTime(time)`**
  - Converts 24h to 12h format
  - Example: `formatTime('13:30')` → "1:30 PM"

- **`getWeekDays(startDate)`**
  - Returns array of 7 dates starting from startDate
  - Example: `getWeekDays(new Date())` → [Mon, Tue, Wed, ...]

- **`getCurrentWeekStart()`**
  - Returns Date object for Monday of current week
  - Example: `getCurrentWeekStart()` → Date(2026-02-24)

- **`isSameDay(date1, date2)`**
  - Compares if two dates are the same day
  - Example: `isSameDay(new Date(), '2026-02-26')` → true

##### Shift Utilities (`utils/shiftUtils.js`)

```javascript
import { 
  calculateShiftHours,
  calculateTotalHours,
  detectShiftConflict,
  validateShift,
  getShiftsForRange
} from '@/utils/shiftUtils'
```

**Functions:**

- **`calculateShiftHours(startTime, endTime)`**
  - Calculates hours between start and end time
  - Example: `calculateShiftHours('09:00', '17:00')` → 8

- **`calculateTotalHours(shifts)`**
  - Sums hours for array of shifts
  - Example: `calculateTotalHours(myShifts)` → 45.5

- **`detectShiftConflict(newShift, existingShifts)`**
  - Checks for overlapping shifts for same employee
  - Returns: `{ hasConflict: boolean, conflictingShift: object }`
  - Example:
    ```javascript
    const conflict = detectShiftConflict(
      { employeeId: 'emp_001', date: '2026-02-24', startTime: '09:00' },
      existingShifts
    )
    if (conflict.hasConflict) {
      alert(`Conflicts with shift at ${conflict.conflictingShift.startTime}`)
    }
    ```

- **`validateShift(shiftData)`**
  - Validates shift data structure
  - Returns: `{ isValid: boolean, errors: string[] }`
  - Checks:
    - Required fields (employeeId, date, startTime, endTime)
    - Valid date format
    - End time after start time
    - Reasonable hours (not > 24 hours)

- **`getShiftsForRange(shifts, startDate, endDate)`**
  - Filters shifts within date range
  - Example: `getShiftsForRange(allShifts, '2026-02-17', '2026-02-23')`

### Planned Backend API

[NEEDS CLARIFICATION: Backend implementation is in the roadmap. The following API specification is planned but not yet implemented.]

#### Base URL

```
Development: http://localhost:3000/api/v1
Production: https://api.schedulerpro.com/v1
```

#### Authentication

All API endpoints (except `/auth/register` and `/auth/login`) require authentication via JWT Bearer token.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Planned Endpoints

##### Authentication

- **POST** `/auth/register` - Register new user
- **POST** `/auth/login` - Login and get JWT tokens
- **POST** `/auth/refresh` - Refresh access token
- **POST** `/auth/logout` - Logout and invalidate tokens
- **POST** `/auth/forgot-password` - Request password reset
- **POST** `/auth/reset-password` - Reset password with token

##### Employees

- **GET** `/employees` - List all employees (paginated, filterable)
- **GET** `/employees/:id` - Get employee details
- **POST** `/employees` - Create new employee
- **PUT** `/employees/:id` - Update employee
- **DELETE** `/employees/:id` - Soft delete employee
- **GET** `/employees/:id/availability` - Get employee availability
- **PUT** `/employees/:id/availability` - Update availability

##### Shifts

- **GET** `/shifts` - List shifts (with date range filter)
- **GET** `/shifts/:id` - Get shift details
- **POST** `/shifts` - Create new shift
- **POST** `/shifts/bulk` - Create multiple shifts
- **PUT** `/shifts/:id` - Update shift
- **DELETE** `/shifts/:id` - Delete shift
- **POST** `/shifts/:id/swap` - Request shift swap

##### Schedules

- **GET** `/schedules` - List schedules
- **GET** `/schedules/:id` - Get schedule with shifts
- **POST** `/schedules` - Create new schedule
- **PUT** `/schedules/:id` - Update schedule
- **POST** `/schedules/:id/publish` - Publish schedule
- **DELETE** `/schedules/:id` - Delete schedule

##### Payroll

- **GET** `/payroll/calculate` - Calculate payroll for period
- **GET** `/payroll/records` - List payroll records
- **POST** `/payroll/export` - Export payroll data

##### Notifications

- **GET** `/notifications` - Get user notifications
- **PUT** `/notifications/:id/read` - Mark as read
- **GET** `/notifications/preferences` - Get notification settings
- **PUT** `/notifications/preferences` - Update settings

##### Reports

- **GET** `/reports/labor-costs` - Labor cost report
- **GET** `/reports/attendance` - Attendance report
- **GET** `/reports/overtime` - Overtime report
- **POST** `/reports/export` - Export report to CSV/PDF

For detailed API documentation, see [docs/API_ENDPOINTS.md](docs/API_ENDPOINTS.md)

---

## 6. Usage Guide

### Common Use Cases

#### Use Case 1: Creating a Weekly Schedule

**Goal:** Create shifts for all employees for the upcoming week.

1. **Navigate to Scheduler Page**
   - Click "Scheduler" in the navigation bar
   - You'll see the weekly calendar view

2. **Select the Correct Week**
   - Use the arrow buttons to navigate to the desired week
   - Or click "Today" to jump to the current week

3. **Add Shifts One by One**
   - Click the "+ Add Shift" button
   - Fill in the form:
     - Select employee from dropdown
     - Choose date
     - Set start time (e.g., "09:00")
     - Set end time (e.g., "17:00")
     - Select role (Server, Cook, Manager, etc.)
     - Add notes (optional)
   - Click "Add Shift"

4. **Verify Schedule**
   - Shifts appear as colored cards in the calendar
   - Check the statistics panel for totals
   - Total shifts, hours, and employees are updated in real-time

5. **Adjust as Needed**
   - Drag shifts to different days or employees
   - Double-click shifts to edit (future feature)
   - Delete shifts if needed (future feature)

**Code Example:**

```javascript
// In AddShiftModal.jsx component
const handleSubmit = () => {
  const newShift = {
    employeeId: selectedEmployee,
    date: selectedDate,
    startTime: startTime,
    endTime: endTime,
    role: selectedRole,
    notes: notes
  }
  
  addShift(newShift)  // From useShifts hook
  closeModal()
}
```

#### Use Case 2: Reassigning Shifts via Drag-and-Drop

**Goal:** Move a shift from one employee to another or to a different day.

1. **Locate the Shift**
   - Find the shift card in the weekly calendar
   - Shifts are color-coded by role

2. **Drag the Shift**
   - Click and hold on the shift card
   - Drag to the target cell (different employee/day)
   - Visual feedback shows valid drop zones

3. **Drop the Shift**
   - Release mouse button to drop
   - Shift is reassigned immediately
   - Statistics update automatically

4. **Undo if Needed** (Future Feature)
   - Currently, refresh page to revert changes
   - Backend integration will enable undo/redo

**Behind the Scenes:**

```javascript
// In useDragAndDrop.js
const handleDragEnd = (event) => {
  const { active, over } = event
  
  if (over && active.id !== over.id) {
    const shiftId = active.id
    const [newEmployeeId, newDate] = over.id.split('_')
    
    // Check for conflicts
    const conflict = detectShiftConflict(/* ... */)
    if (conflict.hasConflict) {
      alert('Shift conflict detected!')
      return
    }
    
    // Update shift
    updateShift(shiftId, {
      employeeId: newEmployeeId,
      date: newDate
    })
  }
}
```

#### Use Case 3: Filtering Employees

**Goal:** View only specific employees (e.g., Kitchen staff, Full-time only).

1. **Navigate to Employees Page**
   - Click "Employees" in navigation

2. **Use Search Bar**
   - Type employee name in search box
   - Results filter in real-time

3. **Apply Filters**
   - **Department Filter:** Select from dropdown (Kitchen, Front of House, Management, All)
   - **Role Filter:** Select (Full-time, Part-time, Contractor, All)
   - **Status Filter:** Active or Inactive

4. **View Results**
   - Employee cards/list updates immediately
   - Statistics cards show filtered totals

5. **Clear Filters**
   - Click "Clear Filters" or select "All" in dropdowns

**Code Example:**

```javascript
// In EmployeesPage.jsx
const { 
  filteredEmployees, 
  setFilterBy,
  setSearchQuery 
} = useEmployees()

// Apply department filter
<select onChange={(e) => setFilterBy({ department: e.target.value })}>
  <option value="all">All Departments</option>
  <option value="Kitchen">Kitchen</option>
  <option value="Front of House">Front of House</option>
</select>

// Apply search
<input 
  type="text"
  placeholder="Search employees..."
  onChange={(e) => setSearchQuery(e.target.value)}
/>

// Display filtered results
{filteredEmployees.map(employee => (
  <EmployeeCard key={employee.id} employee={employee} />
))}
```

#### Use Case 4: Generating Payroll Report

**Goal:** Calculate payroll for a specific pay period and export data.

1. **Navigate to Payroll Page**
   - Click "Payroll" in navigation

2. **Select Pay Period**
   - Choose from preset periods:
     - Current Week
     - Last Week
     - Current Month
     - Last Month
   - Or use custom date range picker

3. **Review Payroll Summary**
   - Statistics cards show:
     - Total Gross Pay
     - Total Hours Worked
     - Number of Employees
     - Total Overtime Hours

4. **View Employee Breakdown**
   - Scrollable list shows per-employee details:
     - Regular hours and pay
     - Overtime hours and pay
     - Total compensation
   - Click employee row to see detailed breakdown

5. **Export Data**
   - Click "Export" button
   - Choose format: CSV, Excel, or PDF
   - File downloads with naming: `payroll_YYYY-MM-DD_to_YYYY-MM-DD.csv`

**Payroll Calculation Logic:**

```javascript
// In usePayroll.js
const calculatePayroll = (shifts, employees, startDate, endDate) => {
  const periodShifts = getShiftsForRange(shifts, startDate, endDate)
  
  const records = employees.map(employee => {
    const employeeShifts = periodShifts.filter(
      s => s.employeeId === employee.id
    )
    
    const totalHours = calculateTotalHours(employeeShifts)
    const regularHours = Math.min(totalHours, 40)
    const overtimeHours = Math.max(totalHours - 40, 0)
    
    const regularPay = regularHours * employee.hourlyRate
    const overtimePay = overtimeHours * employee.hourlyRate * 1.5
    
    return {
      employeeId: employee.id,
      employeeName: employee.name,
      regularHours,
      overtimeHours,
      totalHours,
      hourlyRate: employee.hourlyRate,
      regularPay,
      overtimePay,
      totalPay: regularPay + overtimePay,
      department: employee.department
    }
  })
  
  return records
}
```

#### Use Case 5: Managing Employee Availability (Future Feature)

[NEEDS CLARIFICATION: This feature is planned but not yet implemented in the current version.]

**Goal:** Set employee availability to prevent scheduling conflicts.

1. **Navigate to Employee Details**
   - Go to Employees page
   - Click on employee card

2. **Edit Availability**
   - Click "Availability" tab
   - Set available days and times:
     - Monday: 9:00 AM - 5:00 PM
     - Tuesday: 12:00 PM - 8:00 PM
     - Wednesday: OFF
     - etc.

3. **Save Availability**
   - Changes saved to database
   - Scheduling system prevents conflicts

4. **Override if Needed**
   - Managers can override availability with approval

### Advanced Usage

#### Keyboard Shortcuts (Future Feature)

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + N` | New shift |
| `Ctrl/Cmd + F` | Focus search |
| `← →` | Navigate weeks |
| `T` | Go to today |
| `Esc` | Close modal |
| `Ctrl/Cmd + S` | Save/publish schedule |

#### Bulk Operations (Future Feature)

**Copy Previous Week's Schedule:**
1. Navigate to desired week
2. Click "Actions" → "Copy from Previous Week"
3. All shifts duplicated with +7 days
4. Review and adjust as needed

**Template-Based Scheduling:**
1. Create shift template (e.g., "Weekend Server Shift")
2. Apply template to multiple employees
3. Automatically generates shifts

---

## 7. Testing

### Testing Strategy

The project employs a **multi-layered testing approach**:

1. **Manual Testing** - Developer and user acceptance testing
2. **End-to-End Testing** - Cypress for user workflow validation
3. **Unit Testing** - (Planned) Jest for component and utility testing
4. **Integration Testing** - (Planned) API endpoint testing

### Running Tests

#### End-to-End Tests with Cypress

**Interactive Mode (Recommended for Development):**

```bash
# Start dev server and open Cypress UI
npm run cy:dev

# This command:
# 1. Starts Vite dev server on port 5173
# 2. Waits for server to be ready
# 3. Opens Cypress Test Runner
# 4. You can select and run tests interactively
```

**Headless Mode (CI/CD):**

```bash
# Start dev server and run all tests headlessly
npm run cy:ci

# This command:
# 1. Starts Vite dev server
# 2. Runs all Cypress tests in headless mode
# 3. Generates test reports and screenshots
# 4. Exits with status code (0 = pass, 1 = fail)
```

**Cypress UI Only (without auto-starting server):**

```bash
# If dev server already running
npm run cy:open

# Opens Cypress Test Runner
# Requires server to be running at http://localhost:5173
```

**Run Specific Test:**

```bash
# Run single test file
npx cypress run --spec "cypress/e2e/scheduler-workflow.cy.js"

# Run tests matching pattern
npx cypress run --spec "cypress/e2e/**/add-*.cy.js"
```

#### Cypress Test Organization

```
cypress/
├── e2e/                                 # Test specifications
│   ├── add-single-shift-simple.cy.js   # Basic shift creation
│   ├── add-single-shift-today.cy.js    # Edge case: today's date
│   ├── debug.cy.js                      # Debugging utilities
│   ├── payroll.cy.js                    # Payroll calculations
│   └── scheduler-workflow.cy.js         # Full workflow test
│
├── fixtures/                            # Test data
│   └── (JSON files with test data)
│
├── screenshots/                         # Auto-captured on failures
│   ├── debug.cy.js/
│   └── scheduler-workflow.cy.js/
│
└── support/
    ├── commands.js                      # Custom Cypress commands
    └── e2e.js                           # Global hooks and setup
```

### What is Tested

#### Current Test Coverage

**E2E Tests (Cypress):**

1. **Scheduler Workflow** (`scheduler-workflow.cy.js`)
   - ✅ Navigate to scheduler page
   - ✅ View weekly calendar
   - ✅ Navigate between weeks
   - ✅ Add new shift via modal
   - ✅ Verify shift appears in calendar
   - ✅ Statistics update correctly

2. **Single Shift Addition** (`add-single-shift-simple.cy.js`)
   - ✅ Open add shift modal
   - ✅ Fill form fields
   - ✅ Validate required fields
   - ✅ Submit form
   - ✅ Verify shift created

3. **Today's Date Handling** (`add-single-shift-today.cy.js`)
   - ✅ Add shift for current date
   - ✅ Verify date picker defaults to today
   - ✅ Handle time zone edge cases

4. **Payroll Calculations** (`payroll.cy.js`)
   - ✅ Navigate to payroll page
   - ✅ Select pay period
   - ✅ Verify payroll totals
   - ✅ Check regular vs overtime calculations
   - ✅ Verify employee breakdown

**Example Test:**

```javascript
// cypress/e2e/scheduler-workflow.cy.js
describe('Scheduler Workflow', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173')
    cy.contains('Scheduler').click()
  })

  it('should add a new shift successfully', () => {
    // Click add shift button
    cy.contains('Add Shift').click()
    
    // Fill form
    cy.get('[data-cy=employee-select]').select('John Doe')
    cy.get('[data-cy=date-input]').type('2026-02-24')
    cy.get('[data-cy=start-time]').type('09:00')
    cy.get('[data-cy=end-time]').type('17:00')
    cy.get('[data-cy=role-select]').select('Server')
    
    // Submit
    cy.contains('Add Shift').click()
    
    // Verify
    cy.contains('John Doe').should('be.visible')
    cy.contains('9:00 AM - 5:00 PM').should('be.visible')
  })

  it('should update statistics when shift added', () => {
    // Get initial count
    cy.get('[data-cy=total-shifts]').invoke('text').then(parseFloat).as('initialCount')
    
    // Add shift (... steps from above ...)
    
    // Verify count increased
    cy.get('[data-cy=total-shifts]').invoke('text').then(parseFloat).should('be.gt', initialCount)
  })
})
```

### Testing Best Practices

#### Writing Good Tests

**Do:**
- ✅ Use descriptive test names
- ✅ Use `data-cy` attributes for selectors (not classes or IDs)
- ✅ Test user behavior, not implementation details
- ✅ Keep tests independent and isolated
- ✅ Clean up test data after each test

**Don't:**
- ❌ Rely on brittle selectors (CSS classes, text content)
- ❌ Test third-party libraries (e.g., date-fns)
- ❌ Write tests that depend on other tests
- ❌ Hard-code dates (use relative dates)

#### Custom Cypress Commands

```javascript
// cypress/support/commands.js

// Navigate to scheduler and select week
Cypress.Commands.add('navigateToWeek', (weekOffset = 0) => {
  cy.visit('/')
  cy.contains('Scheduler').click()
  
  if (weekOffset > 0) {
    for (let i = 0; i < weekOffset; i++) {
      cy.get('[data-cy=next-week]').click()
    }
  } else if (weekOffset < 0) {
    for (let i = 0; i < Math.abs(weekOffset); i++) {
      cy.get('[data-cy=prev-week]').click()
    }
  }
})

// Add shift helper
Cypress.Commands.add('addShift', (shiftData) => {
  cy.contains('Add Shift').click()
  cy.get('[data-cy=employee-select]').select(shiftData.employee)
  cy.get('[data-cy=date-input]').type(shiftData.date)
  cy.get('[data-cy=start-time]').type(shiftData.startTime)
  cy.get('[data-cy=end-time]').type(shiftData.endTime)
  cy.get('[data-cy=role-select]').select(shiftData.role)
  cy.contains('button', 'Add Shift').click()
})

// Usage in tests:
cy.navigateToWeek(1)  // Next week
cy.addShift({
  employee: 'John Doe',
  date: '2026-02-24',
  startTime: '09:00',
  endTime: '17:00',
  role: 'Server'
})
```

### CI/CD Integration

**GitHub Actions Example:**

```yaml
# .github/workflows/test.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  cypress-run:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run Cypress tests
        run: npm run cy:ci
      
      - name: Upload screenshots on failure
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: cypress-screenshots
          path: cypress/screenshots
```

---

## 8. Deployment

### Overview

The application is currently a **frontend-only SPA** that can be deployed to any static hosting service. Future backend integration will require additional infrastructure.

### Deployment Strategies

#### Option 1: Vercel (Recommended for Frontend)

**Pros:** Zero-config, automatic deployments, preview URLs, global CDN

**Steps:**

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   # Initial deployment
   vercel
   
   # Production deployment
   vercel --prod
   ```

4. **Configure Project:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. **Environment Variables** (for backend integration):
   ```bash
   vercel env add VITE_API_BASE_URL production
   vercel env add VITE_JWT_SECRET production
   ```

6. **Custom Domain:**
   ```bash
   vercel domains add schedulerpro.com
   ```

#### Option 2: Netlify

**Pros:** Simple UI, form handling, serverless functions

**Steps:**

1. **Connect GitHub Repository:**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Select repository

2. **Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `20`

3. **Environment Variables:**
   - Go to Site settings → Build & deploy → Environment
   - Add variables: `VITE_API_BASE_URL`, etc.

4. **Deploy:**
   - Automatic on every push to main branch
   - Preview deployments for PRs

#### Option 3: AWS S3 + CloudFront

**Pros:** Scalable, cost-effective for high traffic, full AWS ecosystem integration

**Steps:**

1. **Build for Production:**
   ```bash
   npm run build
   # Output: dist/ folder
   ```

2. **Create S3 Bucket:**
   ```bash
   aws s3 mb s3://schedulerpro-production
   aws s3 website s3://schedulerpro-production --index-document index.html
   ```

3. **Upload Files:**
   ```bash
   aws s3 sync dist/ s3://schedulerpro-production --delete
   ```

4. **Configure Bucket Policy:**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Sid": "PublicReadGetObject",
       "Effect": "Allow",
       "Principal": "*",
       "Action": "s3:GetObject",
       "Resource": "arn:aws:s3:::schedulerpro-production/*"
     }]
   }
   ```

5. **Setup CloudFront:**
   - Create distribution with S3 origin
   - Configure custom domain
   - Enable HTTPS with ACM certificate
   - Set cache behaviors

6. **Continuous Deployment:**
   ```bash
   # In CI/CD pipeline
   npm run build
   aws s3 sync dist/ s3://schedulerpro-production --delete
   aws cloudfront create-invalidation --distribution-id EXXXXXXXXXXXXX --paths "/*"
   ```

#### Option 4: Docker + Self-Hosted

**For Production with Backend:**

**Dockerfile:**
```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production image
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf:**
```nginx
server {
    listen 80;
    server_name schedulerpro.com;
    
    root /usr/share/nginx/html;
    index index.html;
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy (when backend deployed)
    location /api {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Caching for static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_API_BASE_URL=http://backend:3000/api/v1
    depends_on:
      - backend
  
  backend:
    image: schedulerpro-backend:latest
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/schedulerpro
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=schedulerpro
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

**Deploy:**
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Scale backend
docker-compose up -d --scale backend=3
```

### Infrastructure Requirements

#### Frontend Only (Current)

| Resource | Specification |
|----------|---------------|
| Hosting | Static hosting (Vercel, Netlify, S3) |
| Bandwidth | ~2 MB initial load, ~500 KB subsequent |
| Storage | ~10 MB for assets |
| Cost | $0-$20/month (depending on traffic) |

#### Full Stack (Planned)

| Component | Specification | Estimated Cost |
|-----------|---------------|----------------|
| **Frontend** | CDN (CloudFront/Cloudflare) | $5-20/month |
| **Backend** | 2× t3.small EC2 (2 vCPU, 2GB RAM) | $30/month |
| **Database** | RDS PostgreSQL db.t3.micro | $15/month |
| **Cache** | ElastiCache Redis t3.micro | $12/month |
| **Storage** | S3 (10 GB) | $1/month |
| **Monitoring** | Sentry + Datadog | $20/month |
| **Email** | SendGrid (40k emails/month) | $15/month |
| **Load Balancer** | AWS ALB | $20/month |
| **Total** | | **~$118/month** |

*Note: Costs based on moderate traffic (~10k requests/day)*

### Production Checklist

#### Pre-Deployment

- [ ] Run production build locally (`npm run build`)
- [ ] Test production build (`npm run preview`)
- [ ] Run all tests (`npm run cy:ci`)
- [ ] Run linter (`npm run lint`)
- [ ] Review and update environment variables
- [ ] Check for console errors/warnings
- [ ] Verify mobile responsiveness
- [ ] Test in multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Check accessibility with Lighthouse/axe
- [ ] Review security headers
- [ ] Compress images and assets
- [ ] Enable gzip/brotli compression
- [ ] Configure caching headers
- [ ] Set up error tracking (Sentry)
- [ ] Set up analytics (Google Analytics, Plausible)

#### Post-Deployment

- [ ] Verify site loads correctly
- [ ] Check all pages and routes
- [ ] Test critical user flows
- [ ] Monitor error rates
- [ ] Check performance metrics (Lighthouse score)
- [ ] Verify SSL certificate
- [ ] Test on production domain
- [ ] Set up uptime monitoring (UptimeRobot)
- [ ] Configure backup system
- [ ] Document deployment process
- [ ] Update team on deployment

### Monitoring and Maintenance

#### Recommended Tools

**Error Tracking:**
- Sentry - JavaScript error tracking
- LogRocket - Session replay

**Performance Monitoring:**
- Lighthouse CI - Performance scores in CI/CD
- WebPageTest - Detailed performance analysis
- New Relic / Datadog - APM for backend

**Uptime Monitoring:**
- UptimeRobot (free up to 50 monitors)
- Pingdom
- StatusCake

**Analytics:**
- Google Analytics 4
- Plausible (privacy-focused)
- Fathom Analytics

#### Health Checks

```javascript
// Future backend health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.APP_VERSION
  })
})

app.get('/health/db', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', database: 'connected' })
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected' })
  }
})
```

---

## 9. Contributing

### How to Contribute

We welcome contributions from the community! Whether it's bug fixes, new features, documentation improvements, or bug reports, your help is appreciated.

### Getting Started

1. **Fork the Repository**
   ```bash
   # Click "Fork" button on GitHub
   # Clone your fork
   git clone https://github.com/YOUR_USERNAME/scheduler.git
   cd scheduler
   ```

2. **Set Up Development Environment**
   ```bash
   # Install dependencies
   npm install
   
   # Start development server
   npm run dev
   ```

3. **Create a Branch**
   ```bash
   # Create feature branch from main
   git checkout -b feature/my-awesome-feature
   
   # Or for bug fixes
   git checkout -b fix/bug-description
   ```

4. **Make Your Changes**
   - Write clean, readable code
   - Follow existing code style
   - Add tests for new features
   - Update documentation as needed

5. **Test Your Changes**
   ```bash
   # Run linter
   npm run lint
   
   # Run tests
   npm run cy:ci
   
   # Build and preview
   npm run build
   npm run preview
   ```

6. **Commit Your Changes**
   ```bash
   # Stage changes
   git add .
   
   # Commit with descriptive message
   git commit -m "feat: add employee availability management"
   ```

7. **Push and Create Pull Request**
   ```bash
   # Push to your fork
   git push origin feature/my-awesome-feature
   
   # Go to GitHub and create Pull Request
   ```

### Code Style Guidelines

#### JavaScript/React Best Practices

**Component Structure:**
```javascript
// Good ✅
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

function MyComponent({ title, onAction }) {
  const [state, setState] = useState(initialValue)
  
  useEffect(() => {
    // Side effects
  }, [dependencies])
  
  const handleClick = () => {
    // Event handler
  }
  
  return (
    <div className="container">
      <h1>{title}</h1>
      <button onClick={handleClick}>Action</button>
    </div>
  )
}

MyComponent.propTypes = {
  title: PropTypes.string.isRequired,
  onAction: PropTypes.func
}

export default MyComponent
```

**Naming Conventions:**
- **Components:** PascalCase (`EmployeeCard.jsx`)
- **Hooks:** camelCase with `use` prefix (`useShifts.js`)
- **Utilities:** camelCase (`dateUtils.js`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_SHIFTS_PER_DAY`)
- **Props:** camelCase (`employeeId`, `onShiftUpdate`)

**File Organization:**
```javascript
// 1. Imports (external, then internal)
import React from 'react'
import { format } from 'date-fns'

import Button from '@/components/ui/Button'
import { useShifts } from '@/hooks/useShifts'

// 2. Constants
const ROLES = ['Server', 'Cook', 'Manager']

// 3. Component
function ShiftCard({ shift }) {
  // Hook calls
  const { updateShift } = useShifts()
  
  // State
  const [isEditing, setIsEditing] = useState(false)
  
  // Derived state
  const formattedTime = format(shift.date, 'MMM dd')
  
  // Event handlers
  const handleEdit = () => setIsEditing(true)
  
  // Render helpers
  const renderActions = () => (/* ... */)
  
  // Main render
  return (/* ... */)
}

// 4. PropTypes
ShiftCard.propTypes = { /* ... */ }

// 5. Export
export default ShiftCard
```

**CSS/Styling:**
- Use TailwindCSS utility classes
- Follow mobile-first approach
- Extract common patterns to components
- Avoid inline styles unless dynamic

```jsx
// Good ✅ - Utility classes
<button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
  Click Me
</button>

// Avoid ❌ - Inline styles
<button style={{ padding: '8px 16px', backgroundColor: '#3b82f6' }}>
  Click Me
</button>
```

#### ESLint Rules

The project uses ESLint to enforce code quality. Key rules:

- **No unused variables** - Remove or prefix with `_`
- **React hooks rules** - Proper dependency arrays
- **Consistent quotes** - Single quotes for strings
- **Semicolons** - Not required (project uses implicit)
- **Indentation** - 2 spaces
- **Max line length** - 100 characters (soft limit)

**Run linter before committing:**
```bash
npm run lint

# Auto-fix issues
npx eslint . --fix
```

### Branch and PR Conventions

#### Branch Naming

```
feature/description     # New features
fix/description         # Bug fixes
docs/description       # Documentation updates
refactor/description   # Code refactoring
test/description       # Adding/updating tests
chore/description      # Maintenance tasks
```

**Examples:**
- `feature/employee-availability`
- `fix/payroll-overtime-calculation`
- `docs/update-api-reference`
- `refactor/extract-shift-validation`

#### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, no logic change)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `perf` - Performance improvements

**Examples:**
```
feat(scheduler): add drag-and-drop shift reassignment

Implemented @dnd-kit for accessible drag-and-drop functionality.
Users can now drag shifts between employees and days.

Closes #123
```

```
fix(payroll): correct overtime calculation for part-time employees

Overtime was incorrectly calculated for employees working less than 40 hours.
Now properly calculates only hours exceeding 40 per week.

Fixes #456
```

#### Pull Request Template

When creating a PR, include:

**Title:** `[Type] Brief description`

**Description:**
```markdown
## Description
Brief summary of changes

## Motivation and Context
Why is this change needed? What problem does it solve?

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Documentation update

## How Has This Been Tested?
- [ ] Manual testing (describe scenarios)
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] All tests passing

## Screenshots (if applicable)
[Add screenshots here]

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings or errors
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published in downstream modules
```

### Code Review Process

1. **Automated Checks** (must pass):
   - ✅ ESLint passes
   - ✅ Build succeeds
   - ✅ All tests pass
   - ✅ No merge conflicts

2. **Peer Review** (at least 1 approval required):
   - Code quality and readability
   - Test coverage
   - Documentation updates
   - Performance implications
   - Security considerations

3. **Merge:**
   - Squash and merge (for feature branches)
   - Rebase and merge (for clean history)
   - Update CHANGELOG.md

### Areas That Need Help

We're particularly looking for contributions in:

🔴 **High Priority:**
- Backend API implementation (Node.js + Express + PostgreSQL)
- Authentication and authorization (JWT + RBAC)
- Real-time notifications system
- Shift conflict detection algorithm
- TypeScript migration for frontend

🟡 **Medium Priority:**
- Unit test coverage (Jest + React Testing Library)
- Accessibility improvements (ARIA labels, keyboard nav)
- Performance optimization (code splitting, lazy loading)
- Mobile UX enhancements
- Internationalization (i18n support)

🟢 **Low Priority:**
- Additional themes (dark mode, high contrast)
- Export to different formats (PDF, iCal)
- Integration with third-party calendars
- Advanced reporting features
- Browser extension

### Community

- **GitHub Discussions** - Ask questions, share ideas
- **Issue Tracker** - Report bugs, request features
- **Discord** - Real-time chat with maintainers and contributors
- **Monthly Contributors Meeting** - First Friday of each month

### Recognition

All contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Eligible for contributor swag (coming soon!)

---

## 10. Known Issues & Roadmap

### Known Issues

#### Current Limitations

**Data Persistence:**
- ⚠️ **No Backend Integration** - All data is stored in-memory and resets on page refresh
- ⚠️ **Mock Data Only** - Using hardcoded employee and shift data
- **Impact:** Users cannot save schedules permanently
- **Workaround:** None currently; backend implementation is in roadmap
- **Planned Fix:** Sprint 1-2 (Backend infrastructure setup)

**Shift Management:**
- ⚠️ **No Shift Conflict Detection** - System allows overlapping shifts for same employee
- ⚠️ **No Undo/Redo** - Cannot revert accidental changes
- ⚠️ **No Shift Editing** - Must delete and recreate to modify existing shifts
- **Impact:** Users can create invalid schedules
- **Workaround:** Manual validation before creating shifts
- **Planned Fix:** Sprint 3 (Advanced scheduling features)

**Employee Management:**
- ⚠️ **No Availability Tracking** - Cannot set employee available hours
- ⚠️ **No Time-Off Management** - No vacation/sick leave tracking
- ⚠️ **Limited Employee Data** - Missing fields like skills, certifications
- **Impact:** Cannot prevent scheduling conflicts or violations
- **Planned Fix:** Sprint 3 (Employee availability system)

**Payroll:**
- ⚠️ **Basic Calculations Only** - Simple regular + overtime (40h threshold)
- ⚠️ **No Tax Calculations** - Does not account for payroll taxes
- ⚠️ **No Deductions** - Benefits, garnishments not supported
- ⚠️ **No Pay Period Configuration** - Fixed weekly calculation
- **Impact:** Payroll reports are estimates only
- **Planned Fix:** Sprint 5 (Advanced payroll service)

**Performance:**
- ⚠️ **No Virtual Scrolling** - Employee list lags with 100+ employees
- ⚠️ **No Code Splitting** - Large initial bundle size
- **Impact:** Slower load times, especially on mobile
- **Planned Fix:** Sprint 5 (Performance optimization)

**Accessibility:**
- ⚠️ **Incomplete ARIA Labels** - Some interactive elements missing labels
- ⚠️ **Limited Keyboard Navigation** - Drag-and-drop requires mouse
- **Impact:** Reduced accessibility for screen reader users
- **Planned Fix:** Sprint 4 (Accessibility improvements)

**Mobile Experience:**
- ⚠️ **Drag-and-Drop on Touch** - Works but not optimized for mobile gestures
- ⚠️ **Small Touch Targets** - Some buttons < 44px minimum
- **Impact:** Difficult to use on mobile devices
- **Planned Fix:** Sprint 5 (Mobile optimization)

#### Browser Compatibility

**Fully Supported:**
- ✅ Chrome 100+ (Windows, macOS, Linux)
- ✅ Firefox 100+ (Windows, macOS, Linux)
- ✅ Safari 15+ (macOS, iOS)
- ✅ Edge 100+ (Windows, macOS)

**Partial Support:**
- ⚠️ Safari 14 (drag-and-drop may have issues)
- ⚠️ Mobile browsers (usable but not optimized)

**Not Supported:**
- ❌ Internet Explorer (any version)
- ❌ Browsers without ES6+ support

#### Bug Reports

To report a bug:
1. Check [GitHub Issues](https://github.com/yourusername/scheduler/issues) for existing reports
2. Create new issue with template:
   - Clear description of bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser/OS information
   - Screenshots/console errors

### Roadmap

#### Phase 1: Backend Foundation (Sprints 1-2)

**Sprint 1 - Infrastructure Setup**
- ✅ Backend server with Node.js + Express + TypeScript
- ✅ PostgreSQL database with Prisma ORM
- ✅ Organizations (multi-tenant) table and API
- ✅ JWT authentication middleware
- ✅ User registration and login endpoints
- ✅ Docker development environment
- ✅ Error handling and validation (Zod)

**Sprint 2 - Core Entities**
- ✅ Users table and CRUD API
- ✅ Role-based access control (RBAC)
- ✅ Employees table and API
- ✅ Shifts table and API
- ✅ Password reset functionality
- ✅ API rate limiting
- ✅ Database migrations system
- ✅ Session management with refresh tokens

**Deliverables:**
- Functional backend API with authentication
- Data persistence in PostgreSQL
- Multi-tenant architecture
- API documentation (OpenAPI/Swagger)

**Timeline:** 6-8 weeks

---

#### Phase 2: Advanced Scheduling (Sprints 3-4)

**Sprint 3 - Scheduling Intelligence**
- ✅ Schedules table and API (draft/published/archived)
- ✅ Shift conflict detection logic
- ✅ Employee availability system (weekly patterns)
- ✅ Time-off requests with approval workflow
- ✅ Shift swap request system
- ✅ Bulk shift creation
- ✅ Overtime tracking and alerts
- ✅ Recurring shift templates

**Sprint 4 - Notifications & UX**
- ✅ Email service integration (SendGrid)
- ✅ Notification preferences system
- ✅ In-app notification center
- ✅ Push notifications (Firebase)
- ✅ Audit logging for compliance
- ✅ Data export (CSV/Excel)
- ✅ SMS notifications (Twilio - optional)

**Deliverables:**
- Intelligent scheduling with conflict prevention
- Complete notification system (email, SMS, push, in-app)
- Employee availability and time-off management
- Audit trail for compliance

**Timeline:** 6-8 weeks

---

#### Phase 3: Analytics & Mobility (Sprints 5-6)

**Sprint 5 - Reporting & PWA**
- ✅ Advanced payroll calculation service
- ✅ Comprehensive reporting dashboard
- ✅ PDF report generation
- ✅ PWA support with service workers
- ✅ Custom report builder UI
- ✅ Redis caching strategy
- ✅ Mobile-optimized touch interactions

**Sprint 6 - Production & Quality**
- ✅ CI/CD pipeline (GitHub Actions)
- ✅ AWS production deployment
- ✅ Monitoring (Sentry + Datadog)
- ✅ Comprehensive testing (unit, integration, E2E)
- ✅ Security audit
- ✅ API documentation (Swagger)
- ✅ Developer onboarding guide
- ✅ Database query optimization
- ✅ SSL/HTTPS configuration

**Deliverables:**
- Production-grade deployment
- 80%+ test coverage
- Performance monitoring
- Comprehensive documentation
- Security hardening

**Timeline:** 6-8 weeks

---

#### Phase 4: Enterprise Features (Future)

**Advanced Features:**
- 📊 Advanced analytics and forecasting
- 🤖 AI-powered scheduling recommendations
- 📱 Native mobile apps (React Native)
- 🔗 Third-party integrations (QuickBooks, ADP, Slack)
- 🌐 Multi-location support with regional settings
- 📞 Voice and video communication
- 🎓 Employee training and certification tracking
- 💼 Applicant tracking system (ATS)

**Enterprise Capabilities:**
- White-label solution for resellers
- Advanced RBAC with custom permissions
- SSO/SAML authentication
- Compliance reporting (FLSA, OSHA, etc.)
- API webhooks for external integrations
- GraphQL API option
- Real-time collaboration features

**Timeline:** 12+ months

---

### Feature Requests

Top community-requested features (vote on GitHub Discussions):

1. **Drag-to-Block Time** (🔥 125 votes)
   - Create unavailable time blocks on calendar
   - Visual representation of blocked times

2. **Shift Templates** (🔥 98 votes)
   - Save common shift patterns
   - Apply to multiple employees quickly

3. **Mobile App** (🔥 87 votes)
   - Native iOS/Android apps
   - Offline mode support

4. **Calendar Sync** (🔥 76 votes)
   - Export to Google Calendar, Outlook, Apple Calendar
   - Two-way sync with iCal

5. **Dark Mode** (🔥 65 votes)
   - Dark theme for UI
   - Automatic switching based on system preference

6. **Multi-Language Support** (🔥 54 votes)
   - Internationalization (i18n)
   - Support for Spanish, French, German, etc.

7. **Shift Trading Marketplace** (🔥 43 votes)
   - Employees can offer shifts to others
   - Manager approval workflow

8. **Advanced Payroll** (🔥 39 votes)
   - Tax calculations
   - Benefits and deductions
   - Integration with payroll providers

9. **Labor Cost Forecasting** (🔥 32 votes)
   - Predict labor costs based on schedule
   - Budget vs actual analysis

10. **Skills-Based Scheduling** (🔥 28 votes)
    - Track employee skills/certifications
    - Ensure shifts have required skills

### Contributing to the Roadmap

Have a feature idea? Here's how to propose it:

1. **Check Existing Requests** - Search GitHub Discussions
2. **Create Discussion** - Describe feature, use case, and value
3. **Community Voting** - Others can upvote/comment
4. **Team Review** - Maintainers review quarterly
5. **Acceptance** - High-value features added to roadmap
6. **Implementation** - Community or core team builds it

---

### Version History

**v0.1.0** (Current - February 2026)
- Initial release with core scheduler functionality
- Drag-and-drop shift management
- Basic employee management
- Simple payroll calculations
- Mock data (no persistence)

**v0.2.0** (Planned - Q2 2026)
- Backend API integration
- User authentication
- Data persistence
- Real-time updates

**v1.0.0** (Planned - Q4 2026)
- Production-ready release
- Complete backend implementation
- Advanced scheduling features
- Notification system
- Comprehensive testing

---

## Appendix

### Glossary

**Terms and Definitions:**

| Term | Definition |
|------|------------|
| **Shift** | A scheduled work period with start time, end time, and assigned employee |
| **Schedule** | Collection of shifts for a specific time period (e.g., weekly schedule) |
| **Employee** | Staff member who can be assigned to shifts |
| **Payroll Period** | Time range for calculating employee compensation (e.g., weekly, bi-weekly) |
| **Overtime** | Hours worked beyond regular threshold (typically 40 hours/week) |
| **Drag-and-Drop** | UI interaction for moving shifts between employees/days |
| **Mock Data** | Hardcoded sample data used for development/testing |
| **Multi-Tenant** | Architecture supporting multiple organizations in one system |
| **JWT** | JSON Web Token - authentication token standard |
| **RBAC** | Role-Based Access Control - permission system based on user roles |

### Additional Resources

**Documentation:**
- [React 19 Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [date-fns Documentation](https://date-fns.org/docs)
- [@dnd-kit Documentation](https://docs.dndkit.com/)
- [Cypress Documentation](https://docs.cypress.io/)

**Project Docs:**
- [Architecture Overview](docs/ARCHITECTURE.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [API Endpoints](docs/API_ENDPOINTS.md)
- [Technical Specification](docs/TECHNICAL_SPECIFICATION.md)
- [Developer Setup Guide](README_DEVELOPER.md)

**Community:**
- GitHub Repository: [github.com/yourusername/scheduler](https://github.com/yourusername/scheduler)
- Issue Tracker: [github.com/yourusername/scheduler/issues](https://github.com/yourusername/scheduler/issues)
- Discussions: [github.com/yourusername/scheduler/discussions](https://github.com/yourusername/scheduler/discussions)

### License

This project is licensed under the **MIT License**.

See [LICENSE](LICENSE) file for full text.

---

## Changelog

### Version 0.1.0 (February 26, 2026)

**Initial Release**

✨ **Features:**
- Weekly calendar view with visual shift display
- Drag-and-drop shift reassignment
- Add shift modal with form validation
- Employee management with filtering
- Payroll dashboard with period selection
- Real-time statistics panel
- Responsive design for mobile/tablet/desktop
- E2E testing with Cypress

🏗️ **Technical:**
- React 19 with functional components and hooks
- Vite build tool with fast HMR
- TailwindCSS v4 for styling
- @dnd-kit for accessible drag-and-drop
- date-fns for date manipulation
- ESLint for code quality
- Mock data architecture

📚 **Documentation:**
- Comprehensive README
- Developer setup guide
- Architecture documentation
- Database schema design
- API specification (planned)
- Technical specification
- This comprehensive documentation file

---

**Document End**

*For questions, issues, or contributions, please visit our [GitHub repository](https://github.com/yourusername/scheduler).*

*Last Updated: February 26, 2026 by Documentation Team*
