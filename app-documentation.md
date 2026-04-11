# Staff Scheduler Pro — Complete Application Documentation

**Version:** 0.1.0  
**Last Updated:** February 26, 2026  
**Status:** Development / Frontend Only (Backend Integration Pending)

---

## 1. Overview

### Application Purpose
Staff Scheduler Pro is a modern, interactive web application designed to streamline staff scheduling, employee management, and payroll tracking. It provides managers and HR professionals with an intuitive drag-and-drop interface to create, modify, and manage staff schedules efficiently while tracking labor costs and employee hours.

### Target Users
- **Shift Managers** — Create and manage weekly schedules
- **HR Personnel** — Manage employee information and payroll
- **Business Owners** — Monitor labor costs and payroll statistics
- **Department Supervisors** — Track team schedules and overtime

### Tech Stack (Detectable)
- **Frontend Framework:** React 19.1.0
- **Build Tool:** Vite 7.0
- **Styling:** TailwindCSS 4.1.11
- **Drag & Drop:** @dnd-kit (v6.3.1 core, v10.0.0 sortable)
- **Date Handling:** date-fns 4.1.0
- **Testing:** Cypress 14.5.0
- **Linting:** ESLint 9.29.0
- **Language:** JavaScript (with TypeScript planned)

### General Navigation Structure
The application uses a single-page application (SPA) architecture with client-side routing. Navigation is controlled via a persistent top navigation bar that allows users to switch between five main sections:

```
Dashboard → Scheduler → Employees → Payroll → (Additional Features)
```

All state is managed through React hooks with localStorage for mock data persistence.

---

## 2. Authentication & Access

### Current Status
⚠️ **No authentication system is currently implemented.** The application operates with public access to all features. All data is stored in-memory (mock data) and resets on page refresh.

### Authentication Roadmap
- **Planned for Sprint 1:** JWT-based authentication with role-based access control (RBAC)
- **Planned Roles:**
  - `admin` — Full system access
  - `manager` — Can manage schedules and employees
  - `employee` — Read-only access to own schedule
  - `viewer` — Read-only access to schedules

### Data Persistence
- **Current:** Mock data loaded from `src/data/` files
- **Planned:** Backend API with PostgreSQL database integration
- **Authentication Method:** JWT tokens with refresh rotation

---

## 3. Views & Pages

### 3.1 Dashboard Page
**Route:** `/` (default view, accessed via "Dashboard" nav item)

**Description:**  
The landing page and overview dashboard introduces users to the application's core features and serves as an entry point. It displays feature highlights and navigation prompts to guide new users to the scheduler and other key areas.

**Components:**
- **Header Section**
  - Title: "Welcome to Staff Scheduler"
  - Tagline: "Manage your team's schedules with ease using our drag-and-drop interface"
  
- **Feature Highlight Cards (3-column grid)**
  1. **Weekly View Card** (Blue icon)
     - Icon: Calendar SVG
     - Title: "Weekly View"
     - Description: "Visual weekly calendar with drag-and-drop shift management"
  
  2. **Staff Management Card** (Green icon)
     - Icon: People/Users SVG
     - Title: "Staff Management"
     - Description: "Complete employee profiles with roles and hour tracking"
  
  3. **Analytics Card** (Purple icon)
     - Icon: Chart/Analytics SVG
     - Title: "Analytics"
     - Description: "Real-time statistics and schedule optimization insights"

**Functionalities:**
- Static information display
- Visual feature showcase
- Navigation guidance for first-time users

**User Actions:**
- Click on navigation items in top navbar to navigate to other pages
- Read feature descriptions
- Navigate back to Dashboard via navbar or logo

**Data Displayed:**
- Static text content (no dynamic data)
- Responsive grid layout (1 column on mobile, 3 columns on desktop)

**Navigation Links:**
- → Scheduler Page (via navbar)
- → Employees Page (via navbar)
- → Payroll Page (via navbar)
- → Settings (planned)
- → Reports (planned)

**Technical Notes:**
- Pure functional component (no hooks required)
- Location: `src/pages/Dashboard.jsx`
- Uses TailwindCSS for responsive layout

---

### 3.2 Staff Scheduler Page
**Route:** `/scheduler` (accessed via "Staff Scheduler" nav item)

**Description:**  
The core feature of the application. Users can view a weekly calendar, manage employee shifts, and use drag-and-drop to reassign shifts. The page provides real-time statistics and the ability to add new shifts through a modal form.

**UI Components:**

#### 3.2.1 Header Section
- **Title:** "Staff Scheduler"
- **Subtitle:** "Manage staff schedules with drag and drop • X employees • X shifts"
- **Action Buttons:**
  - "Today" button → Jump to current week
  - "Add Shift" button → Opens AddShiftModal
  - Stats display (employee/shift counts)

#### 3.2.2 Calendar Navigation (CalendarHeader Component)
- **Week Display:** Shows week range (e.g., "Feb 24 - Mar 1, 2026")
- **Week Number:** Displays current week number
- **Navigation Arrows:**
  - ← Previous Week (left arrow button)
  - → Next Week (right arrow button)
- **Date Selector:** Shows formatted week dates
- **Quick Navigation:** "Today" button to jump to current week

#### 3.2.3 Main Schedule Grid (Drag-and-Drop Area)
The core scheduler displays employees in rows and days in columns.

**Structure:**
```
         Mon      Tue      Wed      Thu      Fri      Sat      Sun
Employee 1 [Shift] [Shift]  [Shift]  [Shift]  [Free]   [Free]   [Free]
Employee 2 [Free]  [Shift]  [Shift]  [Free]   [Shift]  [Shift]  [Free]
Employee 3 [Shift] [Shift]  [Free]   [Shift]  [Shift]  [Free]   [Shift]
```

**Employee Row Components (EmployeeRow):**
- **Employee Avatar:** Color-coded circle with initials
- **Employee Name:** Full name display
- **Employee Role:** Title/role badge
- **Employee Department:** Department label
- **7 Day Cells:** One for each day of the week

**Shift Cards (DraggableShift):**
- **Visual Design:**
  - Color-coded by shift type
  - Rounded corners with subtle shadow
  - Time display (e.g., "9:00 AM - 5:00 PM")
  - Duration in hours (e.g., "8h")
  - Shift type badge (Regular, Evening, Night, etc.)

- **Interactive States:**
  - **Hover:** Scale up and increase shadow (draggable indicator)
  - **Dragging:** Opacity reduced, semi-transparent appearance
  - **Drop Hover:** Highlight target cell

- **Shift Data Displayed:**
  - Start time
  - End time
  - Duration in hours
  - Shift type/name
  - Role assigned

#### 3.2.4 Statistics Panel (Right Sidebar)
Real-time stats that update as shifts are added/modified:
- **Total Shifts:** Number of all scheduled shifts
- **Total Hours:** Sum of all shift hours
- **Scheduled Employees:** Count of employees with shifts this week
- **Average Hours Per Employee:** 
- **Shift Type Breakdown:** Chart/list of shift types
- **This Week vs Last Week:** Comparison metrics
- **Department Summary:** Hours per department

#### 3.2.5 Add Shift Modal (AddShiftModal)
Opens when "Add Shift" button is clicked or when user clicks an empty cell.

**Form Fields:**
1. **Employee Selection** (Required, Select dropdown)
   - Options: All employees
   - Format: "Employee Name - Role"
   - Placeholder: "Select employee..."

2. **Day Selection** (Required, Select dropdown)
   - Options: All 7 days of the current week
   - Format: Abbreviated day name + date
   - Default: Today or selected day

3. **Shift Type** (Optional, Select dropdown)
   - Options: Regular, Morning, Afternoon, Night, Overtime
   - Default: "Regular"

4. **Department** (Optional, Select dropdown)
   - Options: General, Kitchen, Front of House, Management, etc.
   - Default: "General"

5. **Start Time** (Required, Time select)
   - Format: 24-hour (HH:MM)
   - Increments: 30 minutes
   - Range: 00:00 - 23:30
   - Default: "09:00"

6. **End Time** (Required, Time select)
   - Format: 24-hour (HH:MM)
   - Increments: 30 minutes
   - Range: 00:00 - 23:30
   - Default: "17:00"
   - **Validation:** Must be after start time; handles overnight shifts

7. **Duration Display** (Read-only, calculated)
   - Auto-calculated when start/end times change
   - Format: "8.0 hours"
   - Handles overnight shifts (e.g., 23:00 - 07:00 = 8h next day)

**Modal Actions:**
- **"Add Shift" Button** (Blue/primary) → Validates and adds shift; resets form; closes modal
- **"Cancel" Button** (Gray/secondary) → Closes modal without action
- **Validation:** 
  - Requires employee, start time, end time
  - Prevents shift creation if validation fails (button disabled)
  - Shows validation errors inline (planned)

**Functionally:**
- Launched from navbar "Add Shift" button
- Can also be launched by clicking empty calendar cells (planned)
- Form resets on close
- Real-time duration calculation

#### 3.2.6 Empty States
- **No Employees:** Message: "No employees found. Add employees in the Employees section first."
- **No Shifts:** Message: "No shifts scheduled for this week. Click 'Add Shift' to create one."

**Functionalities:**

1. **View Weekly Schedule**
   - Navigate between weeks using arrow buttons
   - Jump to current week via "Today" button
   - View all employees and their scheduled hours

2. **Add Shifts**
   - Open modal via "Add Shift" button
   - Select employee, day, time, and shift details
   - Submit to add shift to schedule

3. **Edit Shifts** (Drag-and-Drop)
   - Click and hold shift card
   - Drag to different employee or different day
   - Drop to reassign
   - Real-time update with visual feedback

4. **Delete Shifts** (Planned)
   - Right-click on shift to show context menu
   - Or click delete icon on shift card

5. **Shift Conflict Detection** (Planned)
   - Prevents overlapping shifts for same employee
   - Shows warning if attempting conflicting shift

6. **Real-time Statistics**
   - Auto-updates as shifts are modified
   - Shows labor cost projections
   - Displays overtime hours

**User Actions:**
1. **Navigate Weeks:**
   - Click left/right arrows in week navigation
   - Click "Today" button to jump to current week
   - Week range updates in real-time

2. **Add Shift:**
   - Click "Add Shift" button in header
   - Modal opens
   - Fill in form and click "Add Shift"
   - Shift appears in calendar

3. **Drag-and-Drop Reassignment:**
   - Click and hold shift card
   - Drag over target cell (visual feedback)
   - Release to drop and reassign
   - Shift updates immediately

4. **View Statistics:**
   - Look at right-side statistics panel
   - Statistics auto-update as shifts change
   - Click stats to expand or drill down (planned)

**Data Displayed:**
- **Employee Data:**
  - Name, Role, Department, Color-coded avatar
  
- **Shift Data:**
  - Start time, End time, Duration, Type, Role
  - Associated employee and date

- **Calculated Data:**
  - Total shifts this week
  - Total hours worked
  - Employees scheduled
  - Average hours per employee
  - Department-level summaries
  - Week-to-week comparisons

**Navigation Links:**
- → Employees Page (via navbar)
- → Payroll Page (via navbar)
- → Dashboard (via navbar)
- → Add/Edit Employee Modal (planned)

**State Management:**
- `useShifts()` — Manages all shift state (add, update, delete, move)
- `useWeekNavigation()` — Manages current week and navigation
- `useDragAndDrop()` — Handles DnD interactions
- `useState()` — Local state for modal visibility

**Technical Implementation:**
- Uses `@dnd-kit` for drag-and-drop (accessible, WCAG-compliant)
- Custom collision detection for accurate drop zones
- Real-time state updates with React hooks
- Location: `src/pages/SchedulerPage.jsx` + `src/components/scheduler/`

---

### 3.3 Employees Page
**Route:** `/employees` (accessed via "Employees" nav item)

**Description:**  
Complete employee management system. Users can view all employees, filter by department/role/status, search by name, add new employees, and edit/delete existing employees. Multiple view modes provide flexibility for different use cases.

**UI Components:**

#### 3.3.1 Header Section
- **Title:** "Employee Management"
- **Subtitle:** "Manage your workforce with roles, departments, and hours tracking"
- **"Add Employee" Button** (Blue/primary)
  - Opens EmployeeModal in "create" mode
  - Initializes empty form

#### 3.3.2 Employee Filters & Search (EmployeeFilters Component)
Located below header, sticky on scroll.

**Form Fields:**

1. **Search by Name** (Text input)
   - Placeholder: "Search employees by name..."
   - Real-time filtering as user types
   - Searches across: name, email, phone
   - Case-insensitive

2. **Filter by Department** (Select dropdown)
   - Options: All Departments, Kitchen, Front of House, Management, Administrative
   - Default: "All Departments"
   - Updates employee list on change

3. **Filter by Role** (Select dropdown)
   - Options: All Roles, Full-time, Part-time, Contractor, Manager
   - Default: "All Roles"
   - Updates employee list on change

4. **Filter by Status** (Select dropdown)
   - Options: All, Active, Inactive
   - Default: "All"
   - Updates employee list on change

5. **Sort By** (Select dropdown)
   - Options: Name (A-Z), Name (Z-A), Department, Role, Hours (High-Low)
   - Default: "Name (A-Z)"

6. **Clear Filters** Button
   - Resets all filters to default
   - Shows employee count

**Applied Filters Display:**
- Shows active filter count (e.g., "2 filters applied")
- Shows matching employee count (e.g., "5 of 25 employees")

#### 3.3.3 View Mode Toggle
Three rendering modes for employees:

1. **List View** (Default)
   - Table format with columns:
     - Employee (Avatar + Name + ID)
     - Role
     - Department
     - Max Hours per week
     - Contact (Email)
     - Actions (Edit, Delete buttons)
   - Hover state: Row background lightens
   - Color-coded role/department badges

2. **Grid View**
   - Card layout (2-3 columns responsive)
   - Each card shows:
     - Avatar (larger)
     - Name
     - Role & Department badges
     - Max hours
     - Email
     - Quick action buttons (Edit, Delete)
   - Hover effect: Card shadow increases

3. **Card View**
   - Larger, more detailed cards
   - Shows additional info:
     - Avatar
     - Name & Title
     - Department
     - Contact info (email, phone)
     - Hire date
     - Employment type badge
     - Hours tracking
   - More prominent action buttons

#### 3.3.4 Employee Statistics (EmployeeStats Component)
Quick summary cards above employee list:
- **Total Employees:** Count of all employees
- **Active Employees:** Count of active employees
- **Average Hours:** Avg hours per employee this week
- **Departments:** Count of unique departments
- **Roles Distribution:** Pie/bar chart (planned)

#### 3.3.5 Employee List / Grid / Cards
Displays employees based on selected view mode.

**Employee Item Elements** (Common across all views):
- **Avatar:** Color-coded circle with initials
- **Name:** Full given name
- **ID:** Unique employee identifier
- **Role:** Job title/position
- **Department:** Department name
- **Max Hours:** Weekly hour limit
- **Email:** Contact email
- **Phone:** Contact phone number (in expanded view)
- **Hire Date:** When employee was hired (in expanded view)
- **Status Badge:** Active/Inactive indicator

**Action Buttons (on each employee):**
- **Edit Button** (Pencil icon, Blue)
  - Opens EmployeeModal in "edit" mode
  - Pre-fills form with employee data
  - Allows modification of all fields

- **Delete Button** (Trash icon, Red)
  - Shows confirmation dialog: "Are you sure you want to delete this employee?"
  - On confirm: removes employee from list
  - Updates statistics

#### 3.3.6 Employee Modal (EmployeeModal)
Opens when editing or adding an employee.

**Form Fields:**

1. **First Name** (Text input, Required)
   - Placeholder: "John"
   - Validation: Min 2 characters

2. **Last Name** (Text input, Required)
   - Placeholder: "Doe"
   - Validation: Min 2 characters

3. **Email** (Email input, Required)
   - Placeholder: "john.doe@example.com"
   - Validation: Valid email format, unique

4. **Phone** (Tel input, Optional)
   - Placeholder: "(555) 123-4567"
   - Validation: Valid phone format

5. **Department** (Select dropdown, Required)
   - Options: Kitchen, Front of House, Management, Administrative, Other
   - Default: "Kitchen"

6. **Role/Position** (Select dropdown, Required)
   - Options: Full-time, Part-time, Contractor, Manager, Intern
   - Default: "Full-time"

7. **Max Hours per Week** (Number input, Required)
   - Range: 1 - 168 hours
   - Default: 40
   - Validation: Must be positive number

8. **Hourly Rate** (Number input, Optional)
   - Range: 0.00 - 999.99
   - Format: Currency (2 decimals)
   - Used for payroll calculations

9. **Status** (Radio buttons)
   - Options: Active, Inactive
   - Default: Active

10. **Hire Date** (Date input, Optional)
    - Format: MM/DD/YYYY
    - Used for employee history

**Modal Actions:**
- **"Save" Button** (Blue/primary)
  - Validates all required fields
  - Creates new employee or updates existing
  - Closes modal on success
  - Shows success message (planned)

- **"Cancel" Button** (Gray/secondary)
  - Closes modal without changes
  - Discards form data

**Validation:**
- Required fields marked with asterisk
- Inline validation on blur (planned)
- Shows validation errors (planned)
- Submit button disabled until form is valid

**Functionalities:**

1. **View All Employees**
   - Displays list/grid/cards of employees
   - Shows employee details and statistics
   - Pagination (if 50+ employees, planned)

2. **Filter & Search**
   - Search by name in real-time
   - Filter by department, role, status
   - Combine multiple filters
   - Clear all filters with one click

3. **Change View Mode**
   - Toggle between list, grid, card views
   - View preference is remembered (localStorage, planned)

4. **Add New Employee**
   - Click "Add Employee" button
   - Fill in form
   - Click "Save" to add
   - Employee appears in list

5. **Edit Employee**
   - Click edit icon on employee
   - Modal opens with pre-filled data
   - Modify fields
   - Click "Save" to update
   - List updates immediately

6. **Delete Employee**
   - Click delete icon on employee
   - Confirmation dialog appears
   - Click confirm to delete
   - Employee removed from list

7. **Sort Employees**
   - Select sort option from dropdown
   - List reorganizes in selected order
   - Sorting options: By name, department, role, hours

**User Actions:**
1. **Search:** Type in search box to filter employees by name
2. **Filter:** Select department, role, or status to filter list
3. **Sort:** Choose sort order from dropdown
4. **View Mode:** Click view mode toggle to change display format
5. **Add:** Click "Add Employee" button, fill form, save
6. **Edit:** Click edit icon, modify form, save
7. **Delete:** Click delete icon, confirm, employee is removed
8. **Clear Filters:** Click "Clear Filters" to show all employees

**Data Displayed:**
- **Employee Information:**
  - Name, ID, Email, Phone
  - Department, Role, Status
  - Max hours per week, Hourly rate
  - Hire date, Experience level

- **Aggregated Statistics:**
  - Total employee count
  - Active/inactive count
  - Average hours
  - Department distribution
  - Role distribution

**Navigation Links:**
- → Scheduler Page (via navbar)
- → Payroll Page (via navbar)
- → Dashboard (via navbar)
- → Employee Details (planned expanded view)

**State Management:**
- `useEmployees()` — Manages all employee state and filtering
- `useState()` — Local state for modal, view mode, sort options
- LocalStorage (planned) — Persistent view preferences

**Technical Implementation:**
- Multiple conditional renders based on `viewMode` state
- Real-time filter updates with debouncing (planned)
- Location: `src/pages/EmployeesPage.jsx` + `src/components/employees/`
- Responsive grid layout (1 column mobile, 2-3 columns desktop)

---

### 3.4 Payroll Page
**Route:** `/payroll` (accessed via "Payroll" nav item)

**Description:**  
Comprehensive payroll management system. Users can view detailed payroll calculations, employee earnings breakdown, generate reports, and export payroll data. Multiple tabs provide different views of payroll data and analytics.

**UI Components:**

#### 3.4.1 Header Section
- **Title:** "Payroll Management"
- **Subtitle:** "Manage employee payroll, calculate wages, and generate reports"

#### 3.4.2 Tab Navigation (Horizontal Tabs)
Five distinct sections accessible via tabs, each with an icon:

1. **Dashboard Tab** (📊 icon)
   - Overview of payroll data
   - Quick statistics and trends
   - Current pay period summary

2. **Employee Payroll Tab** (👥 icon)
   - Per-employee payroll breakdown
   - Individual earnings details
   - Search and filter options

3. **Statistics Tab** (📈 icon)
   - Department-level payroll summaries
   - Overtime analysis
   - Payment trend charts
   - Comparative metrics

4. **Accounting Tab** (💰 icon)
   - Accounting-focused views
   - Tax withholding (planned)
   - Deductions and benefits (planned)
   - Balance sheet integration (planned)

5. **Export & Reports Tab** (📄 icon)
   - Export payroll data to CSV
   - Generate PDF reports
   - Email payroll slip distribution (planned)
   - Historical reports

#### 3.4.3 Pay Period Selector (PayrollPeriodSelector Component)
Found at the top of each tab view.

**Controls:**
- **Selected Period Display:** Shows current pay period range
  - Format: "Feb 17, 2026 - Feb 23, 2026"
  - Shows week number (e.g., "Week 8")

- **Navigation Buttons:**
  - ← Previous Period (left arrow)
  - → Next Period (right arrow)

- **Period Quick Select** (Dropdown or buttons):
  - This Week
  - Last Week
  - This Month
  - Last Month
  - Custom Date Range (calendar picker, planned)

- **Pay Schedule:** Shows when paychecks are processed

#### 3.4.4 Payroll Dashboard Tab (PayrollDashboard Component)

**Quick Statistics Cards** (6-card grid):
1. **Total Gross Pay**
   - Value: $XXXX.XX
   - Icon: 💰
   - Color: Green
   - Change indicator: ↑/↓ percentage vs last period
   - In tooltip: Breakdown by employee count

2. **Total Net Pay**
   - Value: $XXXX.XX
   - Icon: 💵
   - Color: Blue
   - Change indicator: ↑/↓ percentage
   - In tooltip: After deductions & taxes

3. **Total Hours**
   - Value: 000.0 hours
   - Icon: ⏰
   - Color: Purple
   - Change indicator: ↑/↓ percentage
   - In tooltip: Regular + Overtime hours

4. **Overtime Hours**
   - Value: 00.0 hours
   - Icon: ⚡
   - Color: Orange
   - In tooltip: Hours exceeding 40/week
   - Alert: Shows if over threshold

5. **Total Employees**
   - Value: 00 employees
   - Icon: 👥
   - Color: Indigo
   - Links to: Employee Payroll tab

6. **Average Hourly Rate**
   - Value: $XX.XX
   - Icon: 📊
   - Color: Pink
   - Calculation: Total pay ÷ Total hours

**Department Breakdown Section:**
- Table or cards showing:
  - Department name
  - Total pay
  - Total hours
  - Employee count
  - Average rate
  - Overtime hours

**Top Earners Section:**
- List of highest-paid employees this period
- Shows: Name, Total earnings, Hours worked, Hourly rate
- Sortable and filterable

**Recent Pay Periods Section:**
- Table showing last 4-5 pay periods
- Columns: Period, Total Gross, Total Net, EmployeeCount
- Click to view details for past period

#### 3.4.5 Employee Payroll Tab (PayrollEmployeeList Component)

**Controls:**
- Search by employee name
- Filter by department
- Sort by: Name, Gross Pay, Hours, Department

**Employee Payroll Table:**

| Employee Name | Regular Hours | Regular Pay | OT Hours | OT Pay | Gross Pay | Net Pay | Hourly Rate |
|---|---|---|---|---|---|---|---|
| John Doe | 40.0 | $740.00 | 5.0 | $138.75 | $878.75 | $702.00 | $18.50 |
| Jane Smith | 35.5 | $746.50 | 0.0 | $0.00 | $746.50 | $597.20 | $21.00 |

**Row Details:**
- **Name:** Clickable to expand row
- **Regular Hours:** Hours at regular rate (≤40/week)
- **Regular Pay:** Regular hours × hourly rate
- **OT Hours:** Hours at overtime rate (>40/week)
- **OT Pay:** OT hours × (hourly rate × 1.5)
- **Gross Pay:** Regular pay + OT pay (before taxes)
- **Net Pay:** Gross pay - deductions/taxes (planned)
- **Hourly Rate:** Employee's base hourly rate

**Expandable Row Details** (Click employee to expand):
- Shifts worked this period
- Break time deducted
- Bonuses (if any)
- Deductions (if configured)
- Tax withholding (planned)
- Take-home pay calculation

**Actions:**
- Click employee name → View full details in drawer/modal
- Click row → Expand/collapse details
- Print/Export individual payroll slip (planned)

**Empty State:**
- Message: "No employees found for this pay period."
- Suggests adding shifts or employees

#### 3.4.6 Statistics Tab (PayrollStatistics Component)

**Charts & Visualizations:**
1. **Gross Pay by Department** (Bar chart)
   - X-axis: Department names
   - Y-axis: Total gross pay
   - Hover shows: Exact amounts
   - Color-coded by department

2. **Hours Worked Distribution** (Pie chart)
   - Segments: Regular hours vs Overtime hours
   - Shows percentages
   - Click segment to filter

3. **Top 10 Earners** (Bar chart)
   - Horizontal bars sorted by pay amount
   - Shows employee names and amounts
   - Highlights top 3 earners

4. **Overtime Trend** (Line chart)
   - X-axis: Previous weeks/periods
   - Y-axis: Overtime hours
   - Shows trend over time
   - Helpful for identifying patterns

5. **Payroll Cost Trend** (Area chart)
   - Shows gross pay trend over weeks/months
   - Multiple colored areas for different categories
   - Helps identify cost patterns

**Key Metrics Display:**
- Average gross pay per employee
- Median gross pay
- Total payroll cost this period
- Payroll as % of revenue (if configured)
- Cost per hour worked
- Highest paid vs lowest paid differential

#### 3.4.7 Accounting Tab (PayrollAccounting Component)

**Features:**
- Payroll journal entry display
- Tax and deduction summaries (planned)
- General ledger impact (planned)
- Accounts payable tracking
- Compliance checklist

#### 3.4.8 Export & Reports Tab (PayrollExport Component)

**Export Options:**

1. **Export to CSV**
   - Button: "Export as CSV"
   - Downloads: `payroll_YYYY-MM-DD_to_YYYY-MM-DD.csv`
   - Contains: All columns from Employee Payroll table
   - Format: Comma-separated values

2. **Export to Excel**
   - Button: "Export as Excel"
   - Downloads: `payroll_YYYY-MM-DD_to_YYYY-MM-DD.xlsx`
   - Features: Formatted, colored cells, formulas
   - Multiple sheets: Summary, Details, Charts (planned)

3. **Export to PDF**
   - Button: "Generate PDF Report"
   - Downloads: `payroll_report_YYYY-MM-DD_to_YYYY-MM-DD.pdf`
   - Includes: Cover page, summary, detailed tables, charts
   - Professional formatting with company branding

4. **Email Payroll Slips** (Planned)
   - Individual payroll slip generation
   - Email distribution to employees
   - PDF attachment per employee
   - Email templates

**Report Templates:**
- **Payroll Summary Report** — Executive overview
- **Employee Payroll Detail Report** — Full breakdown per employee
- **Department Payroll Report** — Cost analysis by department
- **Tax Report** — Tax withholding summary (planned)
- **Compliance Report** — Labor law compliance checks (planned)

**Selected Report Options:**
- Include signatures line
- Include company logo/letterhead
- Date range selector
- Department filter
- Employee filter

**Functionalities:**

1. **View Payroll Dashboard**
   - See quick statistics for current pay period
   - Review top earners and department breakdown
   - Compare with previous periods

2. **Review Employee Payroll**
   - View detailed earnings for each employee
   - See regular and overtime pay
   - Expand rows for detailed shift breakdown
   - Search and filter by employee/department

3. **Analyze Payroll Statistics**
   - View charts and trends
   - Identify cost patterns
   - Compare periods
   - Analyze overtime impact

4. **Export Payroll Data**
   - Download in multiple formats (CSV, Excel, PDF)
   - Generate professional reports
   - Send to accounting system (planned integration)

5. **Change Pay Period**
   - Use period selector to view historical payroll
   - Navigate to previous/next weeks
   - Compare across periods
   - Generate reports for past periods

**User Actions:**
1. **Navigate Tabs:** Click tab to view different payroll sections
2. **Select Period:** Use period selector to choose pay period
3. **View Data:** Review statistics, tables, and charts
4. **Search/Filter:** Search employees, filter by department
5. **Expand Details:** Click employee to see shift breakdown
6. **Export:** Click export button to download payroll data
7. **Generate Report:** Select report type and generate PDF

**Data Displayed:**
- **Summary Data:**
  - Total gross pay, net pay, hours, overtime
  - Employee count, average rates
  
- **Individual Data:**
  - Per-employee earnings and hours
  - Regular and overtime breakdown
  - Deductions and tax withholding (planned)
  
- **Aggregate Data:**
  - Department totals and averages
  - Trend data across periods
  - Top earners and cost leaders
  
- **Calculated Fields:**
  - Gross and net pay
  - Overtime premium (1.5x rate)
  - Effective hourly rates
  - Cost per hour

**Navigation Links:**
- → Scheduler Page (via navbar)
- → Employees Page (via navbar)
- → Dashboard (via navbar)

**State Management:**
- `usePayroll()` — Manages all payroll calculations and data
- `useEmployees()` — Retrieves employee and rate information
- `useShifts()` — Gets shift data for calculations
- `useState()` — Local state for selected period and tab

**Technical Implementation:**
- Payroll calculations done in `usePayroll()` hook
- Date range filtering for different pay periods
- Real-time updates when shifts change
- Location: `src/pages/PayrollPage.jsx` + `src/components/payroll/`
- Export functionality uses client-side library (planned backend integration)

---

## 4. Core Features Summary

### 4.1 Scheduling
- ✅ **Weekly Calendar View** — Visual 7-day schedule with all employees
- ✅ **Drag-and-Drop Shifts** — Move shifts between employees and days
- ✅ **Add Shifts Modal** — Create new shifts with form validation
- ❌ **Edit Shifts** — Edit existing shifts (planned)
- ❌ **Delete Shifts** — Remove shifts (planned)
- ❌ **Conflict Detection** — Prevent overlapping shifts (planned)
- ❌ **Employee Availability** — Set available work hours (planned)
- ❌ **Time-Off Requests** — Handle vacation/sick days (planned)
- ❌ **Shift Swap Requests** — Allow employee shift trading (planned)
- ❌ **Recurring Shift Templates** — Create repeating patterns (planned)

### 4.2 Employee Management
- ✅ **Employee List** — View all employees with details
- ✅ **Multiple View Modes** — List, grid, and card views
- ✅ **Add Employees** — Create new employee records
- ✅ **Edit Employees** — Modify employee information
- ✅ **Delete Employees** — Remove employees with confirmation
- ✅ **Search Employees** — Real-time search by name
- ✅ **Filter by Department** — Filter employee list
- ✅ **Filter by Role** — Filter by employment type
- ✅ **Filter by Status** — Show active/inactive
- ✅ **Sort Employees** — Multiple sort options
- ❌ **Employee Profiles** — Detailed employee pages (planned)
- ❌ **Skills Tracking** — Track employee certifications (planned)
- ❌ **Performance Ratings** — Employee evaluations (planned)

### 4.3 Payroll & Analytics
- ✅ **Payroll Calculation** — Auto-calculate regular and overtime pay
- ✅ **Payroll Dashboard** — Summary statistics and trends
- ✅ **Employee Payroll Details** — Per-employee earnings breakdown
- ✅ **Select Pay Period** — View payroll for different weeks/months
- ✅ **Department Breakdown** — Cost analysis by department
- ✅ **Statistics & Charts** — Visualize payroll data
- ✅ **Export to CSV** — Download payroll data
- ✅ **Export to Excel** — Excel format export (planned)
- ✅ **Export to PDF** — PDF reports (planned)
- ❌ **Tax Calculations** — Automatic tax withholding (planned)
- ❌ **Deductions Management** — Benefits and deductions (planned)
- ❌ **Direct Deposit Integration** — Automate payments (planned)

### 4.4 User Interface
- ✅ **Responsive Design** — Works on desktop, tablet, mobile
- ✅ **Dark Mode Ready** — TailwindCSS configured for theming (planned)
- ✅ **Accessible Navigation** — Keyboard navigation support
- ✅ **Modal Dialogs** — For add/edit operations
- ✅ **Real-time Updates** — Instant state changes
- ✅ **Form Validation** — Input validation (basic)
- ❌ **Advanced Validation Messages** — Detailed error messages (planned)
- ❌ **Toast Notifications** — Success/error messages (planned)
- ❌ **Undo/Redo** — Revert actions (planned)

### 4.5 Data Management
- ✅ **Mock Data** — Sample data for development
- ❌ **Database Storage** — PostgreSQL (planned)
- ❌ **Data Export** — Full data backup (planned)
- ❌ **Data Import** — Bulk employee/shift upload (planned)
- ❌ **Data Privacy** — GDPR compliance (planned)
- ❌ **Audit Logging** — Track all changes (planned)

---

## 5. User Flows

### 5.1 Onboarding Flow (New User)
```
1. User arrives at Dashboard
2. User reads feature descriptions
3. User navigates to Employees page
4. User adds employee(s) via add modal
5. User navigates to Scheduler
6. User adds shift(s) via add modal
7. User views statistics
8. User navigates to Payroll to see earnings
```

### 5.2 Weekly Scheduling Flow
```
1. User navigates to Scheduler page
2. User selects desired week (or clicks "Today")
3. User clicks "Add Shift" button
4. User fills in shift form (employee, day, time)
5. User submits form
6. Shift appears in calendar
7. [Optional] User drags shift to different employee/day
8. [Optional] User adds more shifts
9. User navigates to Payroll to see labor costs
```

### 5.3 Employee Management Flow
```
1. User navigates to Employees page
2. User sees list of all employees
3. [Optional] User searches/filters employees
4. User clicks "Add Employee" button
5. User fills in employee form
6. User clicks "Save"
7. Employee appears in list
8. [Optional] User clicks edit to modify
9. [Optional] User clicks delete to remove (with confirmation)
```

### 5.4 Payroll Review Flow
```
1. User navigates to Payroll page
2. User selects desired pay period
3. User reviews Payroll Dashboard:
   - Quick statistics (gross pay, hours, etc.)
   - Department breakdown
   - Top earners
   - Previous period comparison
4. User clicks "Employee Payroll" tab
5. User sees detailed breakdown per employee
6. [Optional] User searches/filters employees
7. [Optional] User clicks employee to expand details
8. User clicks "Export" tab
9. User downloads payroll data (CSV/Excel/PDF)
```

### 5.5 Shift Reassignment Flow (Drag-and-Drop)
```
1. User views Scheduler page
2. User locates shift to move
3. User clicks and holds shift card
4. Visual feedback shows shift is selected
5. User drags shift to target cell
6. Target cell highlights to show valid drop zone
7. User releases mouse to drop
8. Shift moves to new employee/day
9. Statistics update automatically
10. User confirms change (or undo, planned)
```

---

## 6. Data & Forms

### 6.1 Add/Edit Shift Form
**Location:** AddShiftModal Component  
**Used For:** Creating new shifts or editing existing

**Fields:**

| Field | Type | Required | Validation | Default | Notes |
|-------|------|----------|-----------|---------|-------|
| Employee | Select | Yes | Must select valid employee | None | Populated from employees list |
| Day | Select | Yes | Must select day from current week | Today | Monday-Friday + weekends |
| Shift Type | Select | No | Valid shift type | Regular | Regular, Morning, Evening, Night, Overtime |
| Department | Select | No | Valid department | General | General, Kitchen, Front, Management |
| Start Time | Time Select | Yes | Valid time (HH:MM, 30-min increments) | 09:00 | 00:00-23:30 |
| End Time | Time Select | Yes | Must be after start time | 17:00 | Handles overnight shifts |
| Duration | Display (Read-only) | - | Auto-calculated | Calculated | Shown as hours (e.g., 8.0h) |

**Validation Rules:**
- All required fields must be filled
- Start time must be before end time
- Employee must be selected from available list
- Times must be in valid 24-hour format
- Cannot create duplicate shifts for same employee/day (planned)

**Submission Behavior:**
- On valid submit:
  1. Shift data is processed
  2. Shift added to state with unique ID
  3. Modal closes and form resets
  4. Shift appears immediately in calendar
  5. Statistics update
- On invalid submit:
  1. Submit button disabled (grayed out)
  2. Validation errors highlighted (planned)
  3. Form remains open for correction

---

### 6.2 Add/Edit Employee Form
**Location:** EmployeeModal Component  
**Used For:** Creating or editing employee records

**Fields:**

| Field | Type | Required | Validation | Default | Notes |
|-------|------|----------|-----------|---------|-------|
| First Name | Text | Yes | Min 2 chars, max 50 | Empty | Given name |
| Last Name | Text | Yes | Min 2 chars, max 50 | Empty | Family name |
| Email | Email | Yes | Valid email format, unique | Empty | Must be unique across employees |
| Phone | Tel | No | Valid phone format (optional) | Empty | For contact purposes |
| Department | Select | Yes | Valid department | Kitchen | Kitchen, Front, Management, Admin, Other |
| Role | Select | Yes | Valid role | Full-time | Full-time, Part-time, Contractor, Manager, Intern |
| Max Hours/Week | Number | Yes | 1-168, must be positive | 40 | Schedule limit check (planned) |
| Hourly Rate | Number | No | 0.00-999.99, 2 decimals | 0.00 | Used for payroll calculations |
| Status | Radio | No | Active or Inactive | Active | Active employees show in schedule |
| Hire Date | Date | No | Valid date (MM/DD/YYYY) | Empty | Employee start date |

**Validation Rules:**
- First and last names: min 2 characters
- Email: must be valid email format and unique
- Phone: optional but if provided must be valid format
- Max hours: must be positive number between 1-168
- Hourly rate: must be positive number with max 2 decimals
- All required fields must be filled

**Submission Behavior:**
- **Creating (Add mode):**
  1. Form validates
  2. New employee record created with unique ID
  3. Employee added to employee list
  4. Modal closes
  5. Employee appears in list/grid/cards immediately
  6. Success message shown (planned)

- **Editing (Edit mode):**
  1. Form pre-fills with existing data
  2. User modifies desired fields
  3. Form validates changes
  4. Updated data replaces old data in state
  5. Modal closes
  6. Employee appears updated in list
  7. Success message shown (planned)

---

### 6.3 Pay Period Selector
**Location:** PayrollPeriodSelector Component  
**Used For:** Selecting date range for payroll view

**Controls:**
- Start Date picker
- End Date picker
- Preset buttons: This Week, Last Week, This Month, Last Month
- Navigation: Previous/Next week

**Behavior:**
- Selecting a date range filters payroll data
- All payroll views update based on selected period
- Statistics and tables show data only for selected range
- Export functions use selected period in filename

---

## 7. Navigation Map

### 7.1 Visual Site Map

```
┌─────────────────────────────────────────────────────────────┐
│                    SCHEDULER PRO APP                         │
└─────────────────────────────────────────────────────────────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            ▼              ▼              ▼
        ┌────────┐    ┌─────────┐   ┌──────────┐
        │NAV BAR │    │ SIDEBAR │   │ MODALS   │
        └────────┘    │ (if any)│   │ & FORMS  │
            │         └─────────┘   └──────────┘
            │
     ┌──────┴──────┬──────────┬──────────┬──────────┐
     │             │          │          │          │
     ▼             ▼          ▼          ▼          ▼
  DASHBOARD   SCHEDULER  EMPLOYEES   PAYROLL    [FUTURE]
     │             │          │          │
     │             │          │          │
  ┌──────────────────────────────────────────────┐
  │         VARIOUS MODALS & COMPONENTS          │
  │ · Add Shift Modal                            │
  │ · Employee Modal (Add/Edit)                  │
  │ · Confirmation Dialogs                       │
  │ · Statistics Panels                          │
  └──────────────────────────────────────────────┘
```

### 7.2 Route Structure

```
/                          → Dashboard Page
/scheduler                 → Scheduler Page
  ├─ Add Shift Modal       (Modal overlay)
  └─ Statistics Sidebar    (Persistent)

/employees                 → Employees Page
  ├─ Add Employee Modal    (Modal overlay)
  ├─ Edit Employee Modal   (Modal overlay)
  ├─ Delete Confirmation   (Dialog overlay)
  └─ Multiple View Modes:
     ├─ List View
     ├─ Grid View
     └─ Card View

/payroll                   → Payroll Page
  ├─ Dashboard Tab
  │  ├─ Pay Period Selector
  │  ├─ Statistics Cards
  │  └─ Charts & Breakdowns
  ├─ Employee Payroll Tab
  │  ├─ Pay Period Selector
  │  └─ Employee Payroll Table
  ├─ Statistics Tab
  │  ├─ Charts & Graphs
  │  └─ Key Metrics
  ├─ Accounting Tab
  │  └─ Accounting Views (planned)
  └─ Export & Reports Tab
     ├─ CSV Export
     ├─ Excel Export
     └─ PDF Export

[Future Routes - Not Yet Implemented]
/settings                  → Settings Page (planned)
/reports                   → Reports Page (planned)
/shift-templates           → Shift Templates (planned)
/time-off                  → Time-Off Management (planned)
```

### 7.3 Navigation Links Reference

**From Dashboard:**
- → Scheduler (via "View Full Scheduler" link or navbar)
- → Employees (via navbar)
- → Payroll (via navbar)

**From Scheduler:**
- → Employees (via navbar)
- → Payroll (via navbar)
- → Dashboard (via navbar or logo)

**From Employees:**
- → Scheduler (via navbar)
- → Payroll (via navbar)
- → Dashboard (via navbar or logo)

**From Payroll:**
- → Scheduler (via navbar)
- → Employees (via navbar)
- → Dashboard (via navbar or logo)

---

## 8. Edge Cases & Notes

### 8.1 Empty States

**No Employees:**
- Message: "No employees found"
- Action: "Add Employee" button in Employees page
- Impact: Scheduler cannot add shifts without employees
- Scheduler shows: Empty employee list with message

**No Shifts:**
- Message: "No shifts scheduled for this week"
- Action: "Add Shift" button
- Impact: Statistics panel shows zeros
- Visual: Calendar shows all empty cells

**No Payroll Data:**
- Occurs when: No shifts for selected period OR too early in week
- Message: "No payroll data available for selected period"
- Shows: All statistics as zero or N/A

### 8.2 Data Validation Issues

**Duplicate Employee Names:**
- Allowed (multiple Johns possible)
- Recommended: Use unique emails to identify

**Invalid Time Ranges:**
- Start time = End time: Prevented (error message, planned)
- End time < Start time: Handled with overnight shift logic
- Example: 23:00-07:00 = 8 hour overnight shift ✓

**Negative Hours:**
- Prevented at input level
- Number fields have min="0"

**Excessive Hours:**
- Technically possible to exceed 168 hours/week
- Warning shown (planned) if exceeds max hours
- Overtime calculated correctly regardless

### 8.3 Cross-page Consistency

**Employee Updates:**
- Add/edit/delete on Employees page
- Immediately reflected in Scheduler shifts
- Payroll calculated based on current employee data

**Shift Updates:**
- Add/edit/delete on Scheduler page
- Payroll auto-recalculates
- Statistics update instantly

**Data Isolation:**
- No employee can appear twice
- No duplicate shifts for same employee/day (planned)
- Shifts belong to specific employees (not generic)

### 8.4 Browser Compatibility

**Supported Browsers:**
- Chrome 100+ ✓
- Firefox 100+ ✓
- Safari 15+ ✓
- Edge 100+ ✓

**Not Supported:**
- Internet Explorer ✗
- Browsers without ES6+ support ✗

**Known Issues:**
- Mobile drag-and-drop not optimized (planned for improvement)
- Very small screens (<320px) may have layout issues

### 8.5 Performance Considerations

**Scalability Limits (Current Mock Data):**
- ~50 employees: Fully responsive
- ~100 employees: Some lag in list rendering
- ~200+ employees: Virtual scrolling recommended (planned)

**Shift Limits:**
- ~500 shifts: Smooth drag-and-drop
- ~1000+ shifts: May experience slowdown

**Payroll Calculations:**
- Real-time calculation up to ~100 employees
- Calculation time: <100ms for typical dataset

**Storage:**
- Mock data stored in browser memory
- No persistent storage without backend
- Data lost on page refresh

### 8.6 Planned Fixes & Improvements

**Upcoming Features:**
- ✅ Backend API integration (Spring 1)
- ✅ Database persistence (Spring 1-2)
- ✅ User authentication with JWT (Spring 1)
- ✅ Role-based access control (Spring 2)
- ✅ Shift conflict detection (Spring 3)
- ✅ Employee availability management (Spring 3)
- ✅ Time-off requests (Spring 3)
- ✅ Advanced validation messages (Multiple sprints)
- ✅ Toast notifications (Spring 4)
- ✅ Mobile optimization (Spring 5)
- ✅ Virtual scrolling for large lists (Spring 5)
- ✅ Dark mode support (Spring 5)
- ✅ Undo/redo functionality (Spring 5)

### 8.7 Known Limitations

**Current Constraints:**
1. **No Data Persistence** — Data resets on page refresh
2. **No Authentication** — Anyone can access all features
3. **No Permissions** — No role-based restrictions
4. **No Notifications** — No email/SMS alerts
5. **Limited Error Handling** — Minimal error messages
6. **No Undo/Redo** — Changes cannot be reverted
7. **No Bulk Operations** — Must add shifts one at a time
8. **No Time-Off Tracking** — Cannot mark unavailable days
9. **No Conflict Detection** — Can schedule overlapping shifts
10. **No Mobile Optimization** — Desktop experience only

### 8.8 Testing Notes

**E2E Tests Available:**
- ✅ Scheduler workflow (cypress/e2e/scheduler-workflow.cy.js)
- ✅ Add single shift (cypress/e2e/add-single-shift-simple.cy.js)
- ✅ Today's date handling (cypress/e2e/add-single-shift-today.cy.js)
- ✅ Payroll calculations (cypress/e2e/payroll.cy.js)

**Test Data:**
- Default mock employees loaded
- Default mock shifts pre-populated
- Fresh state on each test run

**Running Tests:**
```bash
# Interactive mode
npm run cy:open

# Headless mode
npm run cy:run

# Dev + tests
npm run cy:dev
```

---

## 9. Component Tree & Hierarchy

```
App
├── Navbar
│   ├── Logo
│   ├── Navigation Items
│   │   ├── Dashboard
│   │   ├── Scheduler
│   │   ├── Employees
│   │   ├── Payroll
│   │   ├── Settings (planned)
│   │   └── Reports (planned)
│   └── Mobile Menu Toggle
│
├── Dashboard (Page)
│   ├── Hero Section
│   └── Feature Cards (3)
│
├── SchedulerPage (Page)
│   ├── Header
│   ├── StaffScheduler
│   │   ├── CalendarHeader
│   │   │   ├── Week Selector
│   │   │   ├── Week Navigation
│   │   │   └── Today Button
│   │   ├── DragDropContext
│   │   │   ├── EmployeeRow (×N for each employee)
│   │   │   │   ├── Employee Avatar
│   │   │   │   ├── Employee Info
│   │   │   │   └── DraggableShift (×7 for each day)
│   │   │   │       └── Shift Card
│   │   │   └── AddShiftModal
│   │   │       └── Form Fields
│   │   └── StatisticsPanel
│   │       └── Stats Cards (×N)
│   ├── AddShiftModal (Overlay)
│   │   ├── Employee Select
│   │   ├── Day Select
│   │   ├── Time Inputs
│   │   ├── Shift Type Select
│   │   └── Buttons
│   └── (DragOverlay - Visual feedback)
│
├── EmployeesPage (Page)
│   ├── Header
│   ├── EmployeeFilters
│   │   ├── Search Input
│   │   ├── Department Filter
│   │   ├── Role Filter
│   │   ├── Status Filter
│   │   ├── Sort Selector
│   │   └── Clear Button
│   ├── EmployeeStats
│   │   └── Stat Cards (×N)
│   ├── View Mode Toggle
│   ├── EmployeeList | EmployeeGrid | EmployeeCards
│   │   └── Employee Items (×N)
│   │       ├── Avatar
│   │       ├── Info
│   │       └── Actions (Edit, Delete)
│   ├── Add Employee Button
│   ├── EmployeeModal (Overlay - Add/Edit)
│   │   └── Form Fields
│   └── Confirmation Dialog (Overlay - Delete)
│
├── PayrollPage (Page)
│   ├── Header
│   ├── Tab Navigation
│   │   ├── Dashboard Tab
│   │   ├── Employee Payroll Tab
│   │   ├── Statistics Tab
│   │   ├── Accounting Tab
│   │   └── Export & Reports Tab
│   └── Tab Content (Dynamic):
│       ├── PayrollDashboard
│       │   ├── PayrollPeriodSelector
│       │   ├── StatCards (×6)
│       │   ├── Department Breakdown
│       │   └── Top Earners
│       ├── PayrollEmployeeList
│       │   ├── PayrollPeriodSelector
│       │   ├── Controls (Search, Filter, Sort)
│       │   └── Payroll Table
│       ├── PayrollStatistics
│       │   ├── PayrollPeriodSelector
│       │   └── Charts (×5)
│       ├── PayrollAccounting
│       │   └── Accounting Views
│       └── PayrollExport
│           ├── PayrollPeriodSelector
│           ├── Format Selection
│           └── Export Buttons
│
└── (UI Components Library)
    ├── Button
    │   └── Variants: primary, secondary, danger
    ├── Modal
    │   └── Configurable size, title, actions
    ├── StatCard
    │   └── Icon, value, change indicator
    └── (Other shared components)
```

---

## 10. Appendix

### 10.1 Keyboard Shortcuts (Planned)
| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + N` | New shift |
| `Ctrl/Cmd + E` | New employee |
| `Ctrl/Cmd + K` | Search |
| `Ctrl/Cmd + /` | Help |
| `←/→` | Navigate weeks |
| `Tab` | Next form field |
| `Shift + Tab` | Previous form field |
| `Esc` | Close modal |

### 10.2 Data Model (Mock Structure)

**Employee Object:**
```javascript
{
  id: 'emp_001',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '(555) 123-4567',
  role: 'Full-time',
  department: 'Kitchen',
  hourlyRate: 18.50,
  maxHours: 40,
  status: 'active',
  avatar: 'J',
  color: 'bg-blue-500',
  hireDate: '2023-01-15'
}
```

**Shift Object:**
```javascript
{
  id: 'shift_001',
  employeeId: 'emp_001',
  date: '2026-02-24',
  startTime: '09:00',
  endTime: '17:00',
  duration: 8,
  type: 'Regular',
  department: 'Kitchen',
  notes: ''
}
```

### 10.3 Form Field Types Reference

- **Text Input:** `<input type="text" />`
- **Email Input:** `<input type="email" />`
- **Tel Input:** `<input type="tel" />`
- **Number Input:** `<input type="number" />`
- **Date Input:** `<input type="date" />`
- **Time Select:** Custom time selector (30-min increments)
- **Select Dropdown:** `<select></select>`
- **Radio Buttons:** `<input type="radio" />`
- **Checkbox:** `<input type="checkbox" />`

### 10.4 Color Coding System

**Shift Types:**
- Regular: Blue (#3B82F6)
- Morning: Orange (#F59E0B)
- Afternoon: Green (#10B981)
- Night: Purple (#8B5CF6)
- Overtime: Red (#EF4444)

**Department Badges:**
- Kitchen: Blue badge
- Front of House: Green badge
- Management: Purple badge
- Administrative: Gray badge

**Role Badges:**
- Full-time: Green
- Part-time: Yellow
- Contractor: Orange
- Manager: Purple

**Card Colors (Employee Avatars):**
- Blue, Green, Purple, Pink, Orange, Red (randomly assigned)

### 10.5 File Structure

```
src/
├── pages/
│   ├── Dashboard.jsx
│   ├── SchedulerPage.jsx
│   ├── EmployeesPage.jsx
│   └── PayrollPage.jsx
│
├── components/
│   ├── Navbar.jsx
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Modal.jsx
│   │   └── StatCard.jsx
│   ├── scheduler/
│   │   ├── StaffScheduler.jsx
│   │   ├── CalendarHeader.jsx
│   │   ├── EmployeeRow.jsx
│   │   ├── DraggableShift.jsx
│   │   ├── AddShiftModal.jsx
│   │   └── StatisticsPanel.jsx
│   ├── employees/
│   │   ├── EmployeeList.jsx
│   │   ├── EmployeeGrid.jsx
│   │   ├── EmployeeCards.jsx
│   │   ├── EmployeeFilters.jsx
│   │   ├── EmployeeStats.jsx
│   │   └── EmployeeModal.jsx
│   └── payroll/
│       ├── PayrollDashboard.jsx
│       ├── PayrollPeriodSelector.jsx
│       ├── PayrollStatistics.jsx
│       ├── PayrollEmployeeList.jsx
│       ├── PayrollDetailsModal.jsx
│       ├── PayrollExport.jsx
│       └── PayrollAccounting.jsx
│
├── hooks/
│   ├── useShifts.js
│   ├── useEmployees.js
│   ├── useWeekNavigation.js
│   ├── useDragAndDrop.js
│   └── usePayroll.js
│
├── utils/
│   ├── dateUtils.js
│   └── shiftUtils.js
│
├── data/
│   ├── employees.js
│   ├── shifts.js
│   ├── payroll.js
│   ├── payrollRecords.js
│   └── historicalData.js
│
├── constants/
│   └── scheduler.js
│
├── App.jsx
├── main.jsx
└── index.css
```

---

**Document Complete**

*For questions or updates to this documentation, please refer to the comprehensive project documentation at `COMPREHENSIVE_DOCUMENTATION.md` or create an issue on GitHub.*

*Last Updated: April 11, 2026*  
*Status: Active Development — Frontend Functional, Backend Integration Pending*

---

## Design System — Nexus Kinetic (Task 77, Sprint 22)

**Introduced:** April 11, 2026  
**Scope:** ESS mobile screens only (`src/styles/mobile.css`, `tailwind.config.js`)  
**Colour mode:** Light only (dark mode removed in Task 76)

### Colour Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--mobile-primary` | `#da336b` | Brand Magenta — primary CTA, active icons |
| `--mobile-on-primary` | `#ffffff` | Text on primary fill |
| `--mobile-primary-container` | `#ffdae2` | Pill backgrounds, tint surfaces |
| `--mobile-secondary` | `#d30035` | Secondary actions |
| `--mobile-bg` | `#fffbff` | Page background (warm near-white) |
| `--mobile-bg-card` | `#ffffff` | Card fill |
| `--mobile-on-surface` | `#201a1b` | Primary text |
| `--mobile-on-surface-variant` | `#514345` | Secondary text |
| `--mobile-label-tertiary` | `#837375` | Placeholders, hints |
| `--mobile-outline` | `#837375` | Borders |
| `--mobile-outline-variant` | `#d5c2c5` | Subtle borders, card borders |
| `--mobile-tint` | `#da336b` | Backwards-compat accent alias |
| `--mobile-tint-subtle` | `rgba(218,51,107,0.10)` | Focus rings, hover fills |
| `--mobile-success` | `#16a34a` | Approved / present |
| `--mobile-warning` | `#d97706` | Pending |
| `--mobile-destructive` | `#ba1a1a` | Declined / absent / error |

### Tailwind Theme (tailwind.config.js)

Key colour aliases available as Tailwind utilities:

- `bg-primary` → `#da336b`
- `bg-surface-container-lowest` → `#ffffff` (card fill)
- `bg-primary-container` → `#ffdae2`
- `bg-error-container` → `#ffdad6`
- `shadow-editorial` → `0 8px 24px rgba(218,51,107,0.06)`
- `shadow-card` → `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)`
- `shadow-nav` → `0 -2px 10px rgba(0,0,0,0.05)`
- `font-headline` → `Plus Jakarta Sans`
- `font-body` / `font-label` → `Manrope`

### Font Stacks

| Token | Font | Usage |
|-------|------|-------|
| `--mobile-font-headline` | Plus Jakarta Sans → system-ui fallback | `.text-mobile-largeTitle` through `.text-mobile-title3` |
| `--mobile-font-body` | Manrope → system-ui fallback | All body, callout, footnote, caption, label classes |

Fonts are loaded from Google Fonts with `display=swap`. Preconnect hints are set in `index.html`.

### Border Radius Tokens

| Token | Value | Tailwind equivalent |
|-------|-------|---------------------|
| `--mobile-radius-card` | `24px` | `rounded-3xl` / `rounded-[24px]` |
| `--mobile-radius-button` | `16px` | `rounded-2xl` |
| `--mobile-radius-input` | `12px` | `rounded-xl` |
| `--mobile-radius-chip` | `8px` | `rounded-lg` |
| `--mobile-radius-full` | `9999px` | `rounded-full` |

### Primitive CSS Classes (src/styles/mobile.css)

#### Buttons
| Class | Description |
|-------|-------------|
| `.btn-mobile-primary` | Magenta fill, white text, 16px radius, 44px min-height |
| `.btn-mobile-secondary` | Outlined, Magenta text/border, transparent bg |
| `.btn-mobile-tonal` | Surface-variant fill, muted text |

#### Cards
| Class | Description |
|-------|-------------|
| `.card-mobile` | 24px radius, white bg, subtle shadow, 20px padding |
| `.card-mobile-active` | Same as `.card-mobile` + 4px Magenta left border accent |

#### Inputs
| Class | Description |
|-------|-------------|
| `.input-mobile` | 12px radius, full-width, Magenta focus ring |

#### Typography
| Class | Font | Size | Weight |
|-------|------|------|--------|
| `.text-mobile-largeTitle` | Plus Jakarta Sans | 34px | 700 |
| `.text-mobile-title1` | Plus Jakarta Sans | 28px | 700 |
| `.text-mobile-title2` | Plus Jakarta Sans | 22px | 700 |
| `.text-mobile-title3` | Plus Jakarta Sans | 20px | 600 |
| `.text-mobile-headline` | Manrope | 17px | 600 |
| `.text-mobile-body` | Manrope | 17px | 400 |
| `.text-mobile-callout` | Manrope | 16px | 400 |
| `.text-mobile-subheadline` | Manrope | 15px | 500 |
| `.text-mobile-footnote` | Manrope | 13px | 400 |
| `.text-mobile-caption` | Manrope | 12px | 500 |
| `.text-mobile-label` | Manrope | 14px | 500 |

### Primitive Components

| Component | File | Task 77 Changes |
|-----------|------|-----------------|
| `MobileCard` | `src/components/mobile/MobileCard.jsx` | 24px radius (`rounded-3xl`), `shadow-editorial`, Magenta active accent |
| `AccentCard` | same file | Gradient left bar `from-primary to-secondary-fixed` |
| `StatusChip` | `src/components/mobile/StatusChip.jsx` | Magenta palette for approved/pending/active; error-container for declined |
| `MobileTopBar` | `src/components/mobile/MobileTopBar.jsx` | Material Symbols bell icon, Magenta badge, headline font |
| `TopAppBar` | same file | Sprint 22 standard bar — avatar + ESS brand + Material Symbols bell |

### Icon Library — Material Symbols Outlined

All sprint 22 screens use Google Material Symbols Outlined loaded via `index.html`.

**Usage:**
```jsx
// Outlined (default)
<span className="material-symbols-outlined">home</span>

// Filled (active state)
<span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>

// Helper component
export const Icon = ({ name, filled = false, className = '' }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
  >
    {name}
  </span>
);
```

**Key icon names:** `home`, `calendar_today`, `pending_actions`, `person`, `notifications`, `payments`, `download`, `swap_horiz`, `timer`, `calendar_month`, `health_and_safety`, `event_repeat`, `campaign`, `location_on`, `trending_up`, `arrow_forward`, `chevron_left`, `more_vert`


---

## Navigation Shell — ESS Bottom Nav (Task 78, Sprint 22)

**Introduced:** April 11, 2026  
**Component:** `src/components/mobile/BottomNav.jsx`  
**Shell:** `src/components/mobile/MobileShell.jsx`

### 4-Tab Structure

| Tab | Icon (Material Symbol) | Route | Active when |
|-----|----------------------|-------|-------------|
| Home | `home` (filled when active) | `/app/ess/dashboard` | `pathname.startsWith('/app/ess/dashboard')` |
| Schedule | `calendar_today` (filled when active) | `/app/ess/schedule` | `pathname.startsWith('/app/ess/schedule')` |
| Requests | `pending_actions` (filled when active) | `/app/ess/requests` | `pathname.startsWith('/app/ess/requests')` |
| Profile | `person` (filled when active) | `/app/ess/profile` | `pathname.startsWith('/app/ess/profile')` |

Secondary routes (no tab — accessible via cards/top-bar):
- `/app/ess/payroll` — Payroll Hub (linked from Dashboard)
- `/app/ess/payroll/:id` — Payslip Detail
- `/app/ess/notifications` — Notification Centre (linked from top-bar bell)

### Active State Behaviour

- **Active icon:** Material Symbol with `fontVariationSettings: "'FILL' 1"` — solid/filled appearance  
- **Active colour:** `#da336b` (Magenta primary)  
- **Active background:** `bg-[#ffdae2] rounded-xl px-3 py-1` (primary-container pill)  
- **Inactive icon:** Material Symbol default (outlined, `'FILL' 0`)  
- **Inactive colour:** `text-zinc-500`  
- **Labels:** Permanent on all tabs (11px semibold uppercase)

### Safe Area

`pb-safe` (`env(safe-area-inset-bottom)`) is applied via the `pb-safe` utility class defined in `src/styles/mobile.css`. Main content padding uses `pb-32` to clear the frosted nav bar + safe area on all devices.

### Accessibility

- `role="navigation"` + `aria-label` (from `mobile.nav.label` i18n key)
- `aria-current="page"` on the active `NavLink`
- Each tab is a `NavLink` with visible label — no icon-only buttons

### i18n Keys (`ess` namespace, `mobile.nav` section)

| Key | EN | FR |
|-----|----|----|
| `mobile.nav.label` | "Main navigation" | "Navigation principale" |
| `mobile.nav.dashboard` | "Home" | "Accueil" |
| `mobile.nav.schedule` | "Schedule" | "Planning" |
| `mobile.nav.requests` | "Requests" | "Demandes" |
| `mobile.nav.profile` | "Profile" | "Profil" |
| `mobile.nav.notifications` | "Alerts" | "Alertes" |

### Desktop Behaviour

`<BottomNav>` is rendered inside `<MobileShell>`, which is only mounted at viewports `< 1024px`. Desktop layouts use the sidebar navigation — the bottom nav is never visible at ≥ 1024px.
