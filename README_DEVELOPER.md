# Developer Setup Guide - Staff Scheduler Pro

**Last Updated:** December 18, 2024  
**Target Audience:** New developers joining the project

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Development Setup](#development-setup)
4. [Project Structure](#project-structure)
5. [Development Workflow](#development-workflow)
6. [Testing](#testing)
7. [Common Tasks](#common-tasks)
8. [Troubleshooting](#troubleshooting)
9. [Resources](#resources)

---

## Prerequisites

Before you begin, ensure you have the following installed on your development machine:

### Required Software

| Software | Version | Purpose | Installation |
|----------|---------|---------|--------------|
| **Node.js** | 20 LTS+ | JavaScript runtime | [nodejs.org](https://nodejs.org) |
| **npm** | 10+ | Package manager | Included with Node.js |
| **Git** | 2.40+ | Version control | [git-scm.com](https://git-scm.com) |
| **Docker** | 24+ | Containerization | [docker.com](https://docker.com) |
| **Docker Compose** | 2.20+ | Multi-container orchestration | Included with Docker Desktop |
| **PostgreSQL** | 15+ | Database (or Docker) | [postgresql.org](https://postgresql.org) |

### Optional (Recommended)

- **VSCode** - IDE with excellent TypeScript/React support
- **Postman** - API testing tool
- **pgAdmin** or **TablePlus** - Database GUI client
- **Redis Desktop Manager** - Redis GUI (if using Redis locally)

### Verify Installation

```bash
# Check Node.js and npm versions
node --version  # Should be v20.x.x or higher
npm --version   # Should be 10.x.x or higher

# Check Git
git --version

# Check Docker
docker --version
docker compose version
```

---

## Quick Start

Get up and running in 5 minutes:

### 1. Clone Repository

```bash
git clone https://github.com/your-org/scheduler-pro.git
cd scheduler-pro
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies (when implemented)
cd backend
npm install
cd ..
```

### 3. Start Development Server (Current - Frontend Only)

```bash
# Start Vite development server
npm run dev

# Open browser to http://localhost:5173
```

### 4. Run Tests

```bash
# Run Cypress E2E tests
npm run cy:open
```

---

## Development Setup

### Frontend Setup (Current)

The current application is a frontend-only React application.

#### 1. Clone and Install

```bash
git clone https://github.com/your-org/scheduler-pro.git
cd scheduler-pro
npm install
```

#### 2. Environment Configuration

Create `.env` file in the root directory:

```env
# Vite environment variables (prefix with VITE_)
VITE_APP_NAME="Staff Scheduler Pro"
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_ENABLE_ANALYTICS=false
```

#### 3. Start Development Server

```bash
npm run dev
```

Access the application at `http://localhost:5173`

#### 4. Build for Production

```bash
npm run build
npm run preview  # Preview production build
```

---

### Full-Stack Setup (Future)

Once backend is implemented:

#### 1. Start Services with Docker Compose

```bash
# Start all services (PostgreSQL, Redis, Backend, Frontend)
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

#### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed database with sample data
npx prisma db seed

# Start backend server
npm run dev
```

Backend will run on `http://localhost:3000`

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start frontend server
npm run dev
```

Frontend will run on `http://localhost:5173`

---

## Project Structure

### Current Structure (Frontend Only)

```
scheduler/
├── cypress/               # E2E tests
│   ├── e2e/              # Test specs
│   ├── fixtures/         # Test data
│   └── support/          # Test utilities
├── public/               # Static assets
├── src/
│   ├── components/       # React components
│   │   ├── ui/          # Reusable UI components
│   │   ├── scheduler/   # Scheduler-specific components
│   │   ├── employees/   # Employee management components
│   │   └── payroll/     # Payroll components
│   ├── pages/           # Page components (routes)
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   ├── data/            # Mock data (temporary)
│   ├── constants/       # App constants
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── .eslintrc.json       # ESLint configuration
├── .gitignore           # Git ignore rules
├── cypress.config.js    # Cypress configuration
├── package.json         # Dependencies and scripts
├── README.md            # User documentation
├── tailwind.config.js   # TailwindCSS configuration
└── vite.config.js       # Vite configuration
```

### Future Structure (Full-Stack)

```
scheduler-pro/
├── frontend/            # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/             # Node.js backend
│   ├── src/
│   │   ├── routes/     # Express routes
│   │   ├── controllers/# Request handlers
│   │   ├── services/   # Business logic
│   │   ├── middleware/ # Express middleware
│   │   ├── utils/      # Utilities
│   │   └── index.ts    # Entry point
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── tests/          # Backend tests
│   └── package.json
├── docs/               # Project documentation
│   ├── FEATURE_GAP_ANALYSIS.md
│   ├── TECHNICAL_SPECIFICATION.md
│   ├── ARCHITECTURE.md
│   ├── API_ENDPOINTS.md
│   └── DATABASE_SCHEMA.md
├── jira-backlog/       # Jira import files
│   └── scheduler-pro-backlog.csv
├── docker-compose.yml  # Docker orchestration
└── README_DEVELOPER.md # This file
```

---

## Development Workflow

### Git Workflow (GitFlow)

We follow GitFlow branching strategy:

```
main           # Production-ready code
├── develop    # Integration branch
    ├── feature/user-management
    ├── feature/shift-swapping
    ├── bugfix/calendar-rendering
    └── hotfix/authentication-bug
```

### Creating a New Feature

```bash
# 1. Pull latest develop
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/shift-templates

# 3. Make changes and commit
git add .
git commit -m "feat: Add shift template functionality"

# 4. Push to remote
git push origin feature/shift-templates

# 5. Create Pull Request on GitHub
# - Target: develop
# - Reviewers: Team members
# - Link to Jira ticket
```

### Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes (formatting)
- refactor: Code refactoring
- test: Adding or updating tests
- chore: Maintenance tasks

Examples:
feat(auth): Add JWT authentication
fix(scheduler): Resolve shift overlap validation bug
docs(api): Update API endpoint documentation
test(employees): Add unit tests for employee service
```

### Code Review Process

1. **Create Pull Request**
   - Descriptive title and description
   - Link to Jira ticket
   - Screenshots/videos for UI changes

2. **Automated Checks**
   - Linting (ESLint)
   - Type checking (TypeScript)
   - Unit tests
   - E2E tests

3. **Peer Review**
   - At least 1 approval required
   - Address review comments
   - Request re-review if needed

4. **Merge**
   - Squash and merge to develop
   - Delete feature branch

---

## Testing

### Unit Tests (Future - Vitest)

```bash
# Run unit tests
npm run test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Integration Tests (Future - Supertest)

```bash
# Run API integration tests
npm run test:integration
```

### E2E Tests (Cypress - Current)

```bash
# Open Cypress Test Runner (interactive)
npm run cy:open

# Run Cypress tests headlessly
npm run cy:run

# Run specific test file
npx cypress run --spec "cypress/e2e/add-single-shift-simple.cy.js"

# Run with development server
npm run cy:dev
```

#### Writing E2E Tests

Example test structure:

```javascript
// cypress/e2e/employee-management.cy.js

describe('Employee Management', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
    // Navigate to employees page
  });

  it('should display list of employees', () => {
    cy.get('[data-testid="employee-list"]').should('be.visible');
    cy.get('[data-testid="employee-card"]').should('have.length.gt', 0);
  });

  it('should create new employee', () => {
    cy.get('[data-testid="add-employee-btn"]').click();
    cy.get('[data-testid="employee-form"]').should('be.visible');
    
    cy.get('input[name="firstName"]').type('John');
    cy.get('input[name="lastName"]').type('Doe');
    cy.get('input[name="email"]').type('john@example.com');
    
    cy.get('button[type="submit"]').click();
    
    cy.contains('John Doe').should('be.visible');
  });
});
```

### Load Testing (Future - k6)

```bash
# Run load test
k6 run tests/load/api-load-test.js
```

---

## Common Tasks

### Adding a New Component

```bash
# 1. Create component file
touch src/components/scheduler/ShiftTemplate.jsx

# 2. Write component
```

```jsx
// src/components/scheduler/ShiftTemplate.jsx
import React from 'react';

const ShiftTemplate = ({ template }) => {
  return (
    <div className="shift-template">
      <h3>{template.name}</h3>
      {/* Component content */}
    </div>
  );
};

export default ShiftTemplate;
```

### Adding a New API Endpoint (Future)

```typescript
// 1. Define route
// backend/src/routes/templateRoutes.ts
import express from 'express';
import { templateController } from '../controllers/templateController';

const router = express.Router();

router.get('/templates', templateController.list);
router.post('/templates', templateController.create);

export default router;

// 2. Create controller
// backend/src/controllers/templateController.ts
export const templateController = {
  async list(req, res) {
    // Implementation
  },
  async create(req, res) {
    // Implementation
  }
};

// 3. Add service layer
// backend/src/services/templateService.ts
export const templateService = {
  async findAll(organizationId: string) {
    return prisma.template.findMany({
      where: { organizationId }
    });
  }
};
```

### Running Database Migrations (Future)

```bash
# Create new migration
npx prisma migrate dev --name add_template_table

# Apply migrations in production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# View migration status
npx prisma migrate status
```

### Generating Prisma Client (Future)

```bash
# After schema changes
npx prisma generate

# With custom output
npx prisma generate --schema=./prisma/schema.prisma
```

### Debugging

#### Frontend Debugging

1. **Browser DevTools**
   - Open Chrome DevTools (F12)
   - Use React DevTools extension
   - Check Console for errors
   - Inspect Network requests

2. **VSCode Debugging**
   ```json
   // .vscode/launch.json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "type": "chrome",
         "request": "launch",
         "name": "Launch Chrome",
         "url": "http://localhost:5173",
         "webRoot": "${workspaceFolder}/src"
       }
     ]
   }
   ```

#### Backend Debugging (Future)

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::5173`

**Solution:**
```bash
# Find process using port
lsof -i :5173

# Kill process
kill -9 <PID>

# Or use different port
npm run dev -- --port 5174
```

#### 2. Module Not Found

**Problem:** `Cannot find module 'xyz'`

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 3. TypeScript Errors (Future)

**Problem:** Type errors after pulling new code

**Solution:**
```bash
# Regenerate Prisma client
npx prisma generate

# Restart TypeScript server in VSCode
# Cmd/Ctrl + Shift + P -> "TypeScript: Restart TS Server"
```

#### 4. Database Connection Error (Future)

**Problem:** `Can't reach database server`

**Solution:**
```bash
# Check if PostgreSQL is running
docker compose ps

# Restart database
docker compose restart postgres

# Check connection string in .env
DATABASE_URL="postgresql://user:password@localhost:5432/scheduler_dev"
```

#### 5. Cypress Test Failures

**Problem:** Tests failing locally

**Solution:**
```bash
# Clear Cypress cache
npx cypress cache clear

# Reinstall Cypress
npm install cypress --save-dev

# Run in headed mode to debug
npx cypress open
```

### Getting Help

1. **Check Documentation**
   - [README.md](../README.md) - User documentation
   - [docs/](../docs/) - Technical documentation

2. **Search Existing Issues**
   - GitHub Issues
   - Jira tickets

3. **Ask the Team**
   - Slack: #scheduler-dev channel
   - Daily standup meetings

4. **Create New Issue**
   - Provide detailed description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots/logs

---

## Resources

### Documentation

- **Project Docs:** [docs/](../docs/)
  - [Feature Gap Analysis](../docs/FEATURE_GAP_ANALYSIS.md)
  - [Technical Specification](../docs/TECHNICAL_SPECIFICATION.md)
  - [Architecture](../docs/ARCHITECTURE.md)
  - [API Endpoints](../docs/API_ENDPOINTS.md)
  - [Database Schema](../docs/DATABASE_SCHEMA.md)

### Technology Stack Documentation

- **React:** https://react.dev/
- **Vite:** https://vitejs.dev/
- **TailwindCSS:** https://tailwindcss.com/
- **Cypress:** https://docs.cypress.io/
- **Prisma:** https://www.prisma.io/docs/
- **Express:** https://expressjs.com/
- **PostgreSQL:** https://www.postgresql.org/docs/

### Tools

- **VSCode Extensions:**
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - Prisma (future)
  - GitLens
  - Error Lens

- **Chrome Extensions:**
  - React Developer Tools
  - Redux DevTools (if using Redux)

### Learning Resources

- **React:**
  - [React Docs](https://react.dev/)
  - [React Hooks](https://react.dev/reference/react)

- **TypeScript (Future):**
  - [TypeScript Handbook](https://www.typescriptlang.org/docs/)
  - [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

- **Node.js/Express (Future):**
  - [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
  - [Express.js Guide](https://expressjs.com/en/guide/routing.html)

---

## Development Best Practices

### Code Style

✅ **Use consistent naming conventions**
- Components: PascalCase (`EmployeeCard.jsx`)
- Files: camelCase (`shiftUtils.js`)
- Constants: UPPER_SNAKE_CASE (`MAX_HOURS_PER_WEEK`)

✅ **Write clean, readable code**
- Keep functions small and focused
- Use descriptive variable names
- Add comments for complex logic

✅ **Follow React best practices**
- Use functional components
- Leverage hooks for state and side effects
- Avoid prop drilling (use context or state management)

✅ **Keep components reusable**
- Extract common UI into reusable components
- Use props for customization
- Avoid hardcoding values

### Performance

✅ **Optimize renders**
- Use `React.memo` for expensive components
- Use `useMemo` and `useCallback` appropriately
- Avoid anonymous functions in JSX

✅ **Lazy load components**
- Use `React.lazy` for route components
- Implement code splitting

✅ **Optimize assets**
- Compress images
- Use WebP format when possible
- Lazy load images below the fold

### Security

✅ **Never commit secrets**
- Use `.env` files for sensitive data
- Add `.env` to `.gitignore`
- Use environment variables in production

✅ **Validate user input**
- Client-side validation for UX
- Server-side validation for security (future)
- Sanitize inputs to prevent XSS

✅ **Follow security best practices**
- Use HTTPS in production
- Implement authentication and authorization
- Keep dependencies updated

---

## Next Steps

After setting up your development environment:

1. ✅ Read through the [Feature Gap Analysis](../docs/FEATURE_GAP_ANALYSIS.md)
2. ✅ Review the [Technical Specification](../docs/TECHNICAL_SPECIFICATION.md)
3. ✅ Familiarize yourself with the codebase
4. ✅ Pick up a Jira ticket from Sprint 1
5. ✅ Create a feature branch and start coding!

### Recommended First Tasks

For new developers, start with these tasks to familiarize yourself with the codebase:

1. **Add a new UI component** - Create a reusable button or card component
2. **Fix a small bug** - Find and fix minor UI issues
3. **Write tests** - Add Cypress tests for existing features
4. **Update documentation** - Improve inline comments or README

---

## Contact

**Team Lead:** [Name] - [email]  
**Backend Lead:** [Name] - [email]  
**Frontend Lead:** [Name] - [email]  

**Slack Channels:**
- #scheduler-dev - Development discussions
- #scheduler-support - Help and questions
- #scheduler-announcements - Important updates

---

**Happy Coding! 🚀**

If you have questions or run into issues, don't hesitate to ask the team. We're here to help!

---

**Document Owner:** Development Team  
**Last Updated:** December 18, 2024  
**Version:** 1.0
