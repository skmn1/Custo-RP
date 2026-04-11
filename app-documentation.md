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

---

## Auth Screens — ESS Mobile Login & Password Reset (Task 79, Sprint 22)

**Introduced:** April 11, 2026  
**Components:**
- `src/pages/ess/mobile/MobileLoginPage.jsx` — SCREEN_128
- `src/pages/ess/mobile/MobileResetPasswordPage.jsx` — SCREEN_129

**Design System:** Nexus Kinetic (Task 77) — Magenta primary, Plus Jakarta Sans headings, Manrope body  
**Shell:** Standalone full-screen routes — no `<MobileShell>`, no bottom nav

### Routes

| Path | Desktop | Mobile (< 1024px) |
|------|---------|-------------------|
| `/login` | `DevLoginPage` | `MobileLoginPage` |
| `/login/classic` | `LoginPage` | `LoginPage` |
| `/forgot-password` | `MobileResetPasswordPage` | `MobileResetPasswordPage` |

Route selection uses `useMobileLayout()` — the hook fires on breakpoint crossing (1024px threshold).

### Login Screen (SCREEN_128) — MobileLoginPage

**Layout:**  
- Mobile (< 768px): Single-column centred form, warm white background
- Tablet/Desktop (≥ 768px): Two-column split — Magenta brand panel (left) + form panel (right)

**Form elements:**
- Email input with `person` Material Symbol icon at left; `border-b-2 focus:border-[#da336b]` underline effect
- Password input with `lock` icon + visibility toggle (`visibility`/`visibility_off` icons); `aria-label` on toggle button
- `Forgot Password?` link → `/forgot-password`
- **Primary CTA:** "Sign In" — Magenta gradient (`#da336b` → `#8b2044`), `rounded-2xl`, arrow icon
- **Tonal button:** "Use Biometric Login" — `bg-[#f2dee1]`, `text-[#da336b]`, face icon filled; logs `console.warn` as placeholder
- Footer: "Request Access Link" text link (Magenta)

**Auth integration:**
- Calls `useAuth().login(email, password)` from `src/hooks/useAuth.jsx`
- Local `isLoading` / `error` state (the shared hook doesn't expose these)
- Client-side validation: email regex, password ≥ 8 characters; inline `role="alert"` error messages
- On success: navigates to `/app/ess/dashboard`

### Password Reset Screen (SCREEN_129) — MobileResetPasswordPage

**Layout:** Centred glass-card with ambient Magenta orbs in background; mobile quick-action bar (Call Us / Chat / FAQ) pinned to bottom.

**Form elements:**
- Back button `arrow_back` → `navigate(-1)`; `aria-label="Back to Login"`
- `lock_reset` icon badge (filled, Magenta)
- Email input with `mail` icon
- **Primary CTA:** "Send Reset Link" — same Magenta gradient; `send` icon
- Security tile: `verified_user` icon — link expiry notice
- Support tile: `support_agent` icon — IT contact

**API integration:**
- Calls `forgotPasswordApi(email)` from `src/api/authApi.js` (POST `/auth/forgot-password`)
- Email enumeration prevention: non-503 errors show success state
- Success banner: `check_circle` icon, `role="status"`; submit button disabled after success

**Validation:** Email required + regex format; inline `role="alert"` error.

### i18n Keys (`ess` namespace, `auth` section)

| Key | EN | FR |
|-----|----|----|
| `auth.appName` | "ESS" | "ESS" |
| `auth.welcomeBack` | "Welcome Back" | "Bon retour" |
| `auth.loginSubtitle` | "Sign in to your employee portal." | "Connectez-vous à votre portail employé." |
| `auth.email` | "Email address" | "Adresse e-mail" |
| `auth.password` | "Password" | "Mot de passe" |
| `auth.forgotPassword` | "Forgot Password?" | "Mot de passe oublié ?" |
| `auth.signIn` | "Sign In" | "Se connecter" |
| `auth.biometricLogin` | "Use Biometric Login" | "Connexion biométrique" |
| `auth.resetTitle` | "Reset Password" | "Réinitialiser le mot de passe" |
| `auth.sendResetLink` | "Send Reset Link" | "Envoyer le lien de réinitialisation" |
| `auth.resetSuccess` | "Reset link sent! Please check your inbox." | "Lien de réinitialisation envoyé ! Vérifiez votre messagerie." |

### Accessibility

- All inputs have associated `<label>` elements
- Field errors rendered with `role="alert"` below each input
- Global error banner has `role="alert"`
- Reset success banner has `role="status"`
- Biometric and visibility-toggle buttons have descriptive `aria-label`
- All interactive elements ≥ 44×44pt (`min-h-[44px]`)

---

## Mobile Dashboard — ESS Nexus Kinetic (Task 80)

**Screen:** SCREEN_39  
**Route:** `/app/ess/dashboard` (inside `<EssLayout>`)  
**File:** `src/pages/ess/mobile/MobileDashboardPage.jsx`  
**Branch:** `feature/80-ess-mobile-dashboard`

### Layout

Full-screen single-column scroll on mobile. At `md:` breakpoint, renders a 12-column bento grid: Shift Hero (col-span-8) | Leave Card (col-span-4) | Company Pulse (col-span-12).

### Sections

| Section | Component | Data source |
|---|---|---|
| Greeting header | `EssDashboardGreeting` | `dashboard.greeting.firstName` + `new Date()` |
| Next Shift hero | `NextShiftHero` | `dashboard.upcomingShifts[0]` |
| Annual Leave card | `LeaveBalanceCard` | `dashboard.leaveBalance` (defaults: used=0, total=21) |
| Company Pulse carousel | `CompanyPulseCarousel` | `dashboard.companyNews` (defaults: []) |
| Quick Links grid | `QuickLinks` | Static links: Payroll Hub, My Profile, Leave & Time, Schedule |

### Time-Based Greeting Logic

| Hour range | i18n key | EN | FR |
|---|---|---|---|
| 00:00–11:59 | `mobile.dashboard.goodMorning` | Good morning | Bonjour |
| 12:00–17:59 | `mobile.dashboard.goodAfternoon` | Good afternoon | Bon après-midi |
| 18:00–23:59 | `mobile.dashboard.goodEvening` | Good evening | Bonsoir |

### Next Shift Hero Card

- Magenta left accent bar (`linear-gradient(to bottom, #da336b, #8b2044)`, absolute 6px wide)
- Date formatted using `Intl.DateTimeFormat` (weekday long, day numeric, month short)
- Time + duration row with `schedule` Material Symbol
- Location row with `location_on` Material Symbol
- Footer: team avatar stack (max 4) + "Clock In" gradient CTA button
- **Clock In CTA navigates to `/app/ess/schedule`** — actual time-tracking is a future feature
- Empty state: `event_busy` icon + `mobile.dashboard.noUpcomingShift` text (neutral card, no accent bar)

### Annual Leave Card

- Full-width gradient surface: `linear-gradient(135deg, #8b003b 0%, #da336b 100%)`
- `remaining` days computed as `total - used`
- Progress bar: `<div role="progressbar" aria-valuenow={used} aria-valuemin={0} aria-valuemax={total}>`
- White fill bar, `transition-all duration-700`
- "Request Time Off" tonal button → navigates to `/app/ess/schedule` (leave request flow is future)
- Decorative white-opacity orbs for visual depth

### Company Pulse Carousel

- Horizontal `overflow-x-auto` with `snap-x snap-mandatory`
- Scrollbar hidden via `[scrollbar-width:none] [&::-webkit-scrollbar]:hidden`
- Each card: 220px wide, `snap-center`, optional banner image (lazy loaded), category badge, title (2-line clamp), date
- Only renders when `companyNews.length > 0` (no empty state placeholder)

### Quick Links Grid

2-column `grid grid-cols-2 gap-3`. Static links:

| Icon | Label key | Route |
|---|---|---|
| `payments` (filled) | `mobile.dashboard.payrollHub` | `/app/ess/payslips` |
| `badge` (filled) | `mobile.dashboard.myProfile` | `/app/ess/profile` |
| `beach_access` | `mobile.dashboard.leaveTime` | `/app/ess/schedule` |
| `calendar_today` | `mobile.nav.schedule` | `/app/ess/schedule` |

### Desktop Coexistence

`EssDashboardPage.jsx` checks `useMobileLayout()` (1024px breakpoint):
- Mobile → renders `<MobileDashboardPage />` (this task)
- Desktop → renders the original multi-column widget grid (task 54, unchanged)

### i18n Keys Added (`mobile.dashboard` namespace)

New keys in both `en/ess.json` and `fr/ess.json`:

| Key | EN | FR |
|---|---|---|
| `essPortal` | Employee Self-Service | Espace Employé |
| `noUpcomingShift` | No upcoming shifts scheduled | Aucun quart à venir |
| `clockIn` | Clock In | Pointer |
| `annualLeave` | Annual Leave | Congés annuels |
| `daysLeft` | days left | jours restants |
| `leaveProgress` | {{used}} of {{total}} days used | {{used}} sur {{total}} jours utilisés |
| `requestTimeOff` | Request Time Off | Demander un congé |
| `companyPulse` | Company Pulse | Actualités |
| `seeAll` | See All | Voir tout |
| `quickLinks` | Quick Links | Accès rapides |
| `payrollHub` | Payroll Hub | Fiches de paie |
| `myProfile` | My Profile | Mon profil |
| `leaveTime` | Leave & Time | Congés & temps |
| `view` | View | Voir |

### Accessibility Checklist

- [x] Leave bar: `role="progressbar"`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax`
- [x] All decorative icons have `aria-hidden="true"`
- [x] Clock In button has `aria-label` from i18n
- [x] Quick link buttons have `aria-label` from i18n
- [x] Company Pulse carousel has `role="list"` + `aria-label`
- [x] Each carousel item has `role="listitem"`
- [x] Greeting section has `data-testid="mobile-dashboard-greeting"`

### Loading & Error States

- **Loading:** `<MobileDashboardSkeleton />` — pulsing grey placeholders for all sections. Shown when `isLoading && !dashboard`.
- **Error:** `<MobileDashboardError onRetry={refetch} />` — error icon, "Unable to load" text, Magenta retry button. Shown when `error && !dashboard`.
- Stale data falls through to render dashboard with previous data.

### Unit Tests

`tests/mobile-dashboard-nexus.test.js` — 57 tests:
- `getGreetingKey()` boundary checks (0, 6, 11, 12, 15, 17, 18, 21, 23)
- Leave bar `%` calculation (0%, 57%, 100%, overflow cap, null/undefined)
- EN/FR i18n key presence and interpolation placeholder checks
- Source structural assertions: testids, aria attributes, routes, gradient colours, scroll classes

---

## Work Schedule — ESS Nexus Kinetic (Task 81)

**Screen:** SCREEN_103  
**Route:** `/app/ess/schedule` (inside `<EssLayout>`)  
**File:** `src/pages/ess/mobile/MobileSchedulePage.jsx`  
**Branch:** `feature/81-ess-mobile-schedule`

### Layout

Single-column scroll. Calendar picker at top, shift list below.

### Components

| Component | Purpose |
|---|---|
| `ScheduleCalendar` | Monthly grid, previous/next month nav, shift dots, selected day fill |
| `ShiftList` | Filters `shifts[]` to `selectedDate`, renders empty state or list |
| `ShiftCard` | Individual shift — date box, time, role, location tag, Request Swap CTA |
| `MobileScheduleSkeleton` | Pulse placeholders while loading |

### Monthly Calendar Grid

Helper `buildMonthGrid(monthDate)`:
- Returns an array padded to full ISO weeks (Mon – Sun)
- Padding cells are `null` (rendered as empty `gridcell` with `aria-hidden`)
- Length is always a multiple of 7

Day cell states:

| State | Visual |
|---|---|
| Selected | `bg-primary text-on-primary shadow-lg` |
| Today (not selected) | `ring-2 ring-primary text-primary font-bold` |
| Has shift | Magenta 4px dot at `bottom-1` (`bg-primary`, white when selected) |
| Out-of-month | `text-outline/40` (dimmed) |
| Default | `text-on-surface hover:bg-surface-container` |

Accessibility: each day button has `aria-label` with full date string, `aria-pressed={isSelected}`, `aria-current="date"` on today.  
Calendar container: `role="grid"` + `aria-label`. Day cells: `role="gridcell"`.

### Month Navigation

Delegated to `useEssSchedule()` hook:
- `navigatePrev` / `navigateNext` change the hook's `anchor` date
- Hook is set to `viewMode='month'` so it fetches the full calendar month range: `GET /api/ess/schedule?from=YYYY-MM-01&to=YYYY-MM-DD`
- Month title uses `Intl.DateTimeFormat` with `aria-live="polite" aria-atomic="true"`

### Shift Card

| Element | Detail |
|---|---|
| Left accent bar | Magenta gradient for today's shifts; muted grey for future |
| Date box | Square tile (`w-14 h-14`) with day number + month abbr in `text-primary` |
| Time range | `startTime – endTime · duration` with `schedule` Material Symbol |
| Role | `text-on-surface-variant` below time |
| Location | `location_on` Material Symbol icon + `locationName ?? location` field |
| Status badge | `confirmed` → `bg-primary-container/40 text-primary`; `pending` → `bg-primary-fixed/50`; others → error |
| Request Swap | Magenta filled button — navigates to swap flow (placeholder, logs to console in this sprint) |

### Empty State

`event_available` icon + `mobile.schedule.noShifts` text, neutral card `bg-surface-container-lowest`.

### Desktop Coexistence

`EssSchedulePage.jsx` checks `useMobileLayout()` (1024px breakpoint):
- Mobile → `<MobileSchedulePage />`
- Desktop → existing `ScheduleHeader / WeekView / MonthView` (task 49, unchanged)

All hooks (`useEssSchedule`, `useEssConnectivity`, `useMobileLayout`) are called at the top of `EssSchedulePage` before any conditional return to comply with React's rules of hooks.

### i18n Keys Added (`mobile.schedule`)

New keys in both `en/ess.json` and `fr/ess.json`:

| Key | EN | FR |
|---|---|---|
| `title` | Work Schedule | Planning |
| `workforceLabel` | Workforce Management | Gestion du personnel |
| `previousMonth` | Previous month | Mois précédent |
| `nextMonth` | Next month | Mois suivant |
| `calendarLabel` | Monthly shift calendar | Calendrier mensuel des quarts |
| `today` | Today | Aujourd'hui |
| `noShifts` | No shifts scheduled for this day | Aucun quart prévu ce jour |
| `shiftSingular` | shift | quart |
| `shiftPlural` | shifts | quarts |
| `requestSwap` | Request Swap | Demander un échange |
| `statusConfirmed` | Confirmed | Confirmé |
| `statusPending` | Pending | En attente |
| `statusSwapRequested` | Swap Requested | Échange demandé |

### Accessibility Checklist

- [x] Calendar `role="grid"`, day cells `role="gridcell"`
- [x] Selected day: `aria-pressed={isSelected}`
- [x] Today: `aria-current="date"`
- [x] Month heading: `aria-live="polite" aria-atomic="true"`
- [x] Month nav buttons: `aria-label` from i18n
- [x] Shift cards: accessible `aria-label` on Request Swap including date
- [x] All decorative icons: `aria-hidden="true"`

### Unit Tests

`tests/mobile-schedule-nexus.test.js` — 62 tests:
- `buildMonthGrid()`: cell count, Monday-first padding, April 2026 layout, Feb/Jan
- `toDateString()`: ISO format, zero-padding, year-end
- ShiftList filtering: multi-shift days, ISO datetime strings, null guards
- Shift dot Set construction
- EN/FR i18n key presence and value checks
- Source structural assertions: testids, aria attributes, Material Symbols, hook imports

---

## Payroll Hub — ESS Nexus Kinetic (Task 82)

**Branch:** `feature/82-ess-payroll-hub`
**Screens:** SCREEN_7 (Payroll Hub), SCREEN_89 (Payslip Detail), SCREEN_45 (Payslip History)

### Components

| Component | File | Purpose |
|---|---|---|
| `MobilePayrollHubPage` | `src/pages/ess/mobile/MobilePayrollHubPage.jsx` | YTD earnings overview, current period summary, quick-link bento grid, recent activity list |
| `MobilePayslipDetailPage` | `src/pages/ess/mobile/MobilePayslipDetailPage.jsx` | Full payslip breakdown: earnings, deductions, employer contributions, PDF download |
| `MobilePayslipHistoryPage` | `src/pages/ess/mobile/MobilePayslipHistoryPage.jsx` | Searchable, year-grouped payslip list with inline download buttons |
| `MobilePayrollSkeleton` | — (inline in Hub) | Pulse skeleton for hub loading state |
| `MobilePayslipSkeleton` | — (inline in Detail) | Pulse skeleton for detail loading state |
| `MobileHistorySkeleton` | — (inline in History) | Pulse skeleton for history loading state |
| `PayslipSection` | — (inline in Detail) | Reusable earnings/deductions card with subtotal row |

### Routes

```
/app/ess/payroll           → MobilePayrollHubPage
/app/ess/payroll/history   → MobilePayslipHistoryPage  (static, before :id)
/app/ess/payroll/:id       → MobilePayslipDetailPage
```

### Data Model

**`useEssPayrollSummary()`** — `GET /api/ess/payslips/summary`

| Field | Type | Description |
|---|---|---|
| `ytdGross` | number | Year-to-date gross earnings |
| `ytdPeriod` | string | Human-readable period, e.g. "Jan – Apr 2026" |
| `ytdPaidMonths` | number | Payslips processed this year (0–12) |
| `currentPayslip.id` | string | ID for View Payslip navigation |
| `currentPayslip.period` | string | e.g. "March 2026" |
| `currentPayslip.netPay` | number | |
| `currentPayslip.grossPay` | number | |
| `currentPayslip.status` | string | e.g. "Processed" |
| `recentActivity[]` | array | Optional; each: `{ icon, label, date, amount }` |

**`useEssPayslipDetail(id)`** — `GET /api/ess/payslips/:id`

| Field | Type | Description |
|---|---|---|
| `period` / `payPeriod` | string | e.g. "March 2026" |
| `payDate` | string | Pay date string |
| `netPay` | number | |
| `grossPay` | number | |
| `baseSalary` | number | |
| `overtime` | number? | Optional; `overtimeHours` gives the label |
| `bonuses[]` | array? | `{ name, amount }` |
| `deductions[]` | array | `{ name, amount }` |
| `totalDeductions` | number | |
| `employerContributions[]` | array | `{ name, amount }` |

### Payroll Hub Layout

```
Editorial header (Financial Overview / Payroll Hub)
├── YTD hero card (Magenta gradient, lg:col-span-2)
│   ├── YTD earnings figure
│   ├── Period label
│   └── Progress bar (role=progressbar, paid months / 12)
└── Current period card (border-l-4 border-primary, lg:col-span-1)
    ├── Net pay + gross pay
    └── View Payslip button → /app/ess/payroll/:id

Financial Tools (2-col / 4-col grid)
  receipt_long → Tax Documents
  account_balance → Banking Info
  history → Pay History (/app/ess/payroll/history)
  bar_chart → Analytics

Recent Activity (conditional — only when data.recentActivity is non-empty)
```

### Payslip Detail Layout

```
Back button (navigate(-1))
Payslip title + pay date
Net pay hero (Magenta gradient, mx-6)
  ├── Net Pay figure (5xl)
  └── Gross / Deductions summary line

md+ bento: earnings (col-8) | deductions (col-4)
PayslipSection — Earnings
  base salary, overtime (with hours), bonuses[]
  subtotal row: Gross Pay

PayslipSection — Deductions (negative=true → text-error, '−' prefix)
  deductions[]
  subtotal row: Total Deductions

Employer Contributions (bg-primary-container/30 tinted card)
  employerContributions[] (conditional — only if non-empty)

PDF download: <a href="/api/ess/payslips/:id/pdf" download>
  aria-label uses t('mobile.payroll.downloadPdfLabel', { period })
```

### History Search & Filter

- Search input filters `period` (or `periodLabel`) case-insensitively via `String.includes`
- Year dropdown: derived from unique years across the **full unfiltered** payslip list
- `selectedYear=null` shows all years; selecting a year hides other groups
- Groups rendered newest year first (sorted descending)
- Each row: period label + status chip + net pay → tap to navigate to detail
- Inline download: `<a href="/api/ess/payslips/:id/pdf" download>` per row

### Desktop Coexistence

Routes at `/app/ess/payroll/*` are new and do not replace the existing `/app/ess/payslips` and `/app/ess/payslips/:id` desktop routes. The quick-link on the Dashboard page already links to `/app/ess/payslips`; the payroll hub is accessible via the quick-links icon `payrollHub` on the dashboard or direct navigation.

### i18n (36 keys)

All strings live under `mobile.payroll.*` in `public/locales/{en,fr}/ess.json`.

| Key | EN | FR |
|---|---|---|
| `title` | Payroll Hub | Tableau de paie |
| `ytdEarnings` | Year-to-Date Earnings | Salaire cumulé (YTD) |
| `netPay` | Net Pay | Salaire net |
| `grossPay` | Gross Pay | Salaire brut |
| `downloadPdf` | Download PDF | Télécharger PDF |
| `historyTitle` | Payslip History | Historique des fiches |
| `employerContributions` | Employer Contributions | Cotisations patronales |
| `downloadPdfLabel` | Download payslip for {{period}} | Télécharger la fiche de paie pour {{period}} |

### Accessibility

- YTD progress bar: `role="progressbar"`, `aria-valuenow`, `aria-valuemin=0`, `aria-valuemax=100`, `aria-label`
- PDF download anchor: `aria-label={t('mobile.payroll.downloadPdfLabel', { period })}` (on both Detail and History pages)
- All Material Symbol `<span>` elements: `aria-hidden="true"`
- Section headings: `h1` (page title), `h2` (section titles)
- Touch targets: all interactive elements use `p-5` or `py-3/py-4` padding (≥ 44px)

### Loading & Error States

| View | State | Behaviour |
|---|---|---|
| Payroll Hub | `isLoading` | `MobilePayrollSkeleton` (animate-pulse) |
| Payroll Hub | `error` | `MobilePayrollError` with retry button |
| Payroll Hub | `!data` | Falls through to skeleton |
| Payslip Detail | `isLoading` | `MobilePayslipSkeleton` |
| Payslip Detail | `error=restricted` | `t('mobile.payroll.restricted')` |
| Payslip Detail | other error | Error message + retry |
| History | `isLoading` | `MobileHistorySkeleton` |
| History | no results after filter | Empty state with `receipt_long` icon |

### Unit Tests

`tests/mobile-payroll-nexus.test.js` — **156 tests, all passing**

- `getPayYear()` — extracts year from `payDate`, `paidAt`, fallback to current year
- `filterPayslips()` — case-insensitive search on `period`/`periodLabel`
- `groupByYear()` — groups payslips by integer year, handles edge cases
- `ytdProgress()` — percentage clamped at 100, null/undefined safe
- EN + FR i18n key presence and value assertions (36 + 20 keys)
- Source structural assertions: testids, aria attrs, Magenta gradients, anchor download, hooks imports, route ordering

---

## Task 83 — ESS Requests & Leave Screen (SCREEN_69)

### Overview

`src/pages/ess/mobile/MobileRequestsPage.jsx` — Nexus Kinetic styled leave and requests hub for the ESS "Requests" bottom-navigation tab. Task 83 created the UI shell; **Task 88** wired it to the Task 87 React Query hooks and real API endpoints.

**Route:** `/app/ess/requests`

### Features

| Section | Description |
|---|---|
| Balance dashboard | 2-card bento grid (Annual, Sick) with dual-tint progress bars (used + pending portions) and pending badge |
| Recent requests list | Chronological list from API with colour-coded status chips and cancel action for submitted requests |
| New Request sheet | `NexusBottomSheet` FAB → form with API-driven leave-type selector, date range with live working-day preview, balance warning, conditional reason field |
| Form validation | Client-side: leave type required, start in future, end ≥ start, reason required for annual/unpaid/personal types |
| Empty state | Icon + hint text when no requests exist |
| Working day preview | `calculateWorkingDays()` shows working days (excluding weekends & public holidays) below date picker |
| Balance warning | Inline amber alert when requested days exceed available balance |
| Cancel requests | Cancel button on submitted/pending requests with confirmation dialog |

### Components

| Component | Purpose |
|---|---|
| `MobileRequestsSkeleton` | `animate-pulse` skeleton for loading state (`data-testid="requests-skeleton"`) |
| `LeaveBalanceCards` | 2-card bento with dual-tint progress bars (used solid + pending translucent), `role="progressbar"`, pending badge |
| `RecentRequests` | Request rows with type icon, date range, total days, reason snippet, status chip, cancel action + empty state with hint |
| `NexusBottomSheet` | Inline sheet; `role="dialog" aria-modal="true"`, `bg-surface rounded-t-3xl`, handles overlay click to close |
| `NewRequestSheet` | Form with API-driven leave-type pills (`aria-pressed`), date inputs, working-day preview, balance warning, conditional reason, inline toast feedback |
| `MobileRequestsPage` | Named export; orchestrates Task 87 hooks, cancel confirmation, FAB (`fixed bottom-24 right-6`) |

### Status Chips

| Status | Tailwind classes |
|---|---|
| `approved` | `bg-primary-container/40 text-primary` |
| `pending` / `submitted` | `bg-secondary-container/40 text-secondary` |
| `declined` / `rejected` | `bg-error-container/40 text-error` |
| `cancelled` | `bg-surface-container text-outline` |

### Hooks (Task 87 React Query)

| Hook | Endpoint | Purpose |
|---|---|---|
| `useEssLeaveBalance` | `GET /api/ess/requests/leave/balance` | Balance data with `{ total, used, pending, available }` per type |
| `useEssLeaveTypes` | `GET /api/ess/requests/leave/types` | API-driven leave type list `[{ id, name, color }]` |
| `useEssLeaveRequests` | `GET /api/ess/requests/leave` | Paginated leave request list |
| `useSubmitLeaveRequest` | `POST /api/ess/requests/leave` | Mutation to submit new leave request |
| `useCancelLeaveRequest` | `DELETE /api/ess/requests/leave/:id` | Mutation to cancel a submitted request |

**Balance response shape:**
```json
{
  "data": {
    "annual": { "total": 21, "used": 12, "pending": 3, "available": 6 },
    "sick":   { "total": 10, "used": 2,  "pending": 0, "available": 8 }
  }
}
```

### Utilities

| Function | Module | Purpose |
|---|---|---|
| `calculateWorkingDays(start, end, holidays)` | `src/utils/dateUtils.js` | Returns `{ workingDays, holidaysExcluded }` excluding weekends and public holidays |

### Leave Request Flow

1. Employee taps FAB → bottom sheet opens
2. Selects leave type from API-driven pill selector
3. Picks start/end dates → live working-day count shown
4. If days exceed available balance → amber warning displayed
5. Enters reason (required for annual/unpaid/personal, optional for sick, hidden for maternity/paternity)
6. Submits → `useSubmitLeaveRequest` mutation fires → success toast → sheet closes → list auto-refreshes
7. Submitted request appears in list with cancel button
8. Cancel → confirmation dialog → `useCancelLeaveRequest` mutation → status updates to cancelled

### i18n Namespace: `ess` → `mobile.leave.*`

**Flat keys:** `title`, `sectionLabel`, `annualLeave`, `sickDays`, `shiftSwaps`, `daysLeft`, `daysUsedOf` (`{{used}} of {{total}} used`), `noData`, `newRequest`, `newRequestAriaLabel`, `recentRequests`, `noRequests`, `noRequestsHint`, `leaveType`, `startDate`, `endDate`, `reason`, `reasonPlaceholder`, `submitRequest`, `submitSuccess`, `cancelSuccess`, `workingDays`/`_plural`, `holidaysExcluded`/`_plural`, `pendingDays`/`_plural`

**Nested:** `types.{annual, sick, swap, personal, unpaid}`, `status.{approved, pending, submitted, declined, rejected, cancelled}`, `validation.{leaveTypeRequired, startDateRequired, startDateFuture, endDateRequired, endDateAfterStart, reasonRequired}`

### Accessibility

- Progress bars: `role="progressbar"`, `aria-valuenow`, `aria-valuemin=0`, `aria-valuemax`
- Bottom sheet: `role="dialog"`, `aria-modal="true"`, `aria-label={title}`
- Leave type pills: `aria-pressed={selected}`
- Validation errors: `role="alert"` on each field error
- Toast feedback: `role="status"` for success/warning/error
- Balance warning: `role="status"`
- FAB: `aria-label={t('mobile.leave.newRequestAriaLabel')}`
- All Material Symbol `<span>` elements: `aria-hidden="true"`
- Touch targets ≥ 44px padding on all interactive elements

### Unit Tests

`tests/mobile-leave-nexus.test.js` — **104 tests, all passing** (Task 83)

- `balancePct()` — clamped at 100, zero/null-safe, decimal values
- `statusChipClass()` — approved/pending/declined/rejected/unknown edge cases
- `isEndDateValid()` — before/after/equal/empty combinations
- EN i18n key presence, `{{used}}/{{total}}` interpolation, exact values for title/submitRequest/status
- FR i18n key values: title, newRequest, submitRequest, status chips, types
- Source structural assertions: testids, aria attrs, Magenta gradient (`#da336b`/`#8b2044`), hooks imports, FAB position, form validation, named export
- Hook assertions: endpoints, POST method, `fetchRequests()` re-fetch, exported function names
- App.jsx: `MobileRequestsPage` import + `path="requests"` route

`tests/ess-leave-request-logic.test.js` — Task 88 tests

- `calculateWorkingDays()` — weekday-only counting, holiday exclusion, edge cases
- `statusChipClass()` — all status values including new submitted/cancelled
- Form validation — all 6 rules validated
- Balance warning logic — triggered when workingDays > available
- i18n keys — all new Task 88 keys present in EN and FR
- Source structure — new hook imports, testids, data-testid attributes

---

## Task 84 — ESS Employee Profile & Edit (SCREEN_67 + SCREEN_97)

### Overview

Two views forming the ESS "Profile" bottom-navigation tab. `MobileProfilePage` presents a read-only hero view; `MobileEditProfilePage` provides an inline edit form.

**Routes:**
- `/app/ess/profile` → `MobileProfilePage`
- `/app/ess/profile/edit` → `MobileEditProfilePage`

### Hook

| Hook | Endpoint | Returns |
|---|---|---|
| `useEssProfile` *(existing)* | `GET /api/ess/profile` | `{ profile, isLoading, error, ... }` |
| `useEssUpdateProfile` *(new)* | `PATCH /api/ess/profile` | `{ updateProfile, isLoading, error }` |

`useEssUpdateProfile` sends partial fields (`phone`, `email`, `emergencyContact`, `workPreferences`, `preferredLocation`) as JSON; triggers re-navigation on success.

### MobileProfilePage (SCREEN_67)

#### Sections

| Section | Component | testid |
|---|---|---|
| Hero header | `ProfileHeader` | `profile-header` |
| Avatar image | *(img)* | `profile-avatar` |
| Name heading | *(h1)* | `profile-name` |
| Active score badge | *(div)* | `cert-badge` |
| SVG ring card | *(div)* | `cert-ring-card` |
| SVG ring element | *(svg)* | `cert-ring-svg` |
| Ring progress arc | *(circle)* | `cert-ring-progress` |
| Personal info card | `InfoSection` | `info-section` / `info-row` |
| Work preference chips | `WorkPreferenceTags` | `work-preferences` / `preference-chip` |
| Location history | `LocationHistory` | `location-history` / `location-row` |
| Edit CTA | *(button)* | `edit-profile-btn` |
| Loading skeleton | `MobileProfileSkeleton` | `profile-skeleton` |

#### SVG Certification Ring Geometry

- Viewport: `0 0 96 96`, centre `cx=48 cy=48`, radius `r=45`
- Circumference: $2\pi \times 45 \approx 282.74$
- `strokeDashoffset = 282.74 \times (1 - \text{score}/100)`
- Ring starts from top (12 o'clock) via `transform: rotate(-90deg)` on `<svg>`
- Stroke: `#da336b` (Nexus Magenta); track: `stroke-surface-container`
- Default score when API returns `null`: **85**

#### PREF_ICONS mapping

| Key | Material Symbol |
|---|---|
| `fastFood` | `lunch_dining` |
| `grocery` | `shopping_cart` |
| `butcher` | `kitchen` |
| `bakery` | `bakery_dining` |
| `cafe` | `coffee` |

### MobileEditProfilePage (SCREEN_97)

#### Form Fields

| Field | Input type | testid |
|---|---|---|
| Phone Number | `tel` | `input-phone` *(via config)* |
| Email | `email` | `input-email` *(via config)* |
| Emergency Contact | `text` | `input-emergency` *(via config)* |

Each field rendered from the `contactFields` config array with `<label htmlFor={field.testid}>` and `<input id={field.testid} data-testid={field.testid}>` for full ARIA association.

#### Work Preferences Edit

- Active chips: `pref-chip-{pref}` with remove button `remove-pref-{pref}` (`aria-label="Remove {label}"`)
- Add buttons: `add-pref-{pref}` with `aria-label="Add Preference {label}"`
- Available preferences: `fastFood`, `grocery`, `butcher`, `bakery`, `cafe`

#### Location Selector

3-button toggle: Downtown / Westside / Northgate. Selected state uses Magenta gradient; `aria-pressed={selected}`. `data-testid="location-btn-{loc.toLowerCase()}"`.

#### Save / Cancel

- **Save**: calls `updateProfile(fields)` → navigates back (-1) on success; error shown in `role="alert" data-testid="save-error"`
- **Cancel**: calls `navigate(-1)` with no API call

### i18n Namespace: `ess` → `mobile.profile.*`

**New keys added (flat):** `employeeProfile`, `activeScore`, `profileCompleteness`, `completeHint`, `started`, `workPreferences`, `workLocations`, `present`, `editProfile`, `editTitle`, `save`, `contactDetails`, `addPreference`, `remove`, `noPreferences`, `noLocations`, `preferredLocation`, `avatarAlt`, `avatarHint`

**Preserved existing keys:** `personalInfo`, `email`, `phone`, `cancel`, `emergencyContact`, `department`, `title`, `firstName`, `lastName`, `startDate`, and change-request keys.

**Nested:** `pref.{fastFood, grocery, butcher, bakery, cafe}`

### Accessibility

- SVG certification ring: `aria-hidden="true"` (decorative)
- Edit CTA: `aria-label={t('mobile.profile.editProfile')}`
- All Material Symbol `<span>`: `aria-hidden="true"`
- Location toggle buttons: `aria-pressed={selected}`
- Save error: `role="alert"`
- Form inputs: associated `<label htmlFor>` for screen readers
- Remove preference buttons: `aria-label="Remove {preferenceName}"`
- Touch targets: all interactive elements use `py-3`/`py-4` padding (≥ 44px)

### Unit Tests

`tests/mobile-profile-nexus.test.js` — **137 tests, all passing**

- `certRingOffset()` — score 0/50/80/98/100, clamped above 100, clamped below 0, null input
- `removePreference()` — present / absent / last-element edge cases
- `addPreference()` — new / duplicate / empty-array cases
- EN i18n: 23 flat keys + 5 `pref.*` nested values; exact values for editProfile, save, present
- FR i18n: personalInfo, editProfile, save, cancel, workPreferences, workLocations, present, pref keys
- MobileProfilePage source: 30+ assertions covering testids, aria, ring SVG, Magenta gradient, hooks, navigation, null guards
- MobileEditProfilePage source: 30+ assertions covering form config, labels, testids, aria-pressed, save/cancel flow
- `useEssUpdateProfile`: PATCH endpoint, JSON body, return shape, useCallback, error tracking
- App.jsx: MobileProfilePage + MobileEditProfilePage imports, both routes, profile path now uses MobileProfilePage

---

## Task 85 — ESS Notification Feed & Inline Actions (SCREEN_2 + SCREEN_95)

**Branch:** `feature/85-ess-notification-feed`  
**Route:** `/app/ess/notifications` → `MobileNotificationsPage`  
**Files added/modified:**

| File | Type | Description |
|------|------|-------------|
| `src/hooks/useEssNotifications.js` | New hook | GET /api/ess/notifications |
| `src/hooks/useEssMarkRead.js` | New hook | PATCH single + bulk mark-as-read |
| `src/pages/ess/mobile/MobileNotificationsPage.jsx` | New page | Categorised feed, inline swap actions, push toast |
| `src/App.jsx` | Modified | Route `notifications` → `MobileNotificationsPage` |
| `public/locales/en/ess.json` | Modified | `mobile.notifications.*` keys added |
| `public/locales/fr/ess.json` | Modified | FR translations added |
| `tests/mobile-notifications-nexus.test.js` | New tests | 119 tests, all passing |

---

### Hooks

#### `useEssNotifications`

```js
import { useEssNotifications } from '@/hooks/useEssNotifications';
const { data, isLoading, error, refetch } = useEssNotifications();
```

- Calls `GET /api/ess/notifications` on mount via `apiFetch`
- Returns `{ data: Notification[], isLoading: boolean, error: Error|null, refetch: fn }`
- Exposes `refetch` (wrapped in `useCallback`) for manual refresh after optimistic updates revert

#### `useEssMarkRead`

```js
import { useEssMarkRead } from '@/hooks/useEssMarkRead';
const { markRead, markAllRead } = useEssMarkRead();
```

- `markRead(id)` → `PATCH /api/ess/notifications/${id}/read`
- `markAllRead()` → `PATCH /api/ess/notifications/mark-all-read`
- Both are `useCallback`-wrapped; neither manages local state (caller holds optimistic state)

---

### Components

#### `formatRelativeTime(isoString)`

Exported pure helper. Converts ISO timestamp to human label:

| Delta | Output |
|-------|--------|
| < 60 s | `"Just now"` |
| < 60 min | `"Xm ago"` |
| < 24 h | `"Xh ago"` |
| 1 day | `"1 day ago"` |
| > 1 day | `"X days ago"` |

#### `groupByDate(notifications)`

Exported pure helper. Groups a flat `Notification[]` into a `{ [dateLabel]: Notification[] }` object. Date labels: `"Today"`, `"Yesterday"`, or `Intl.DateTimeFormat('en-US', { weekday:'short', month:'short', day:'numeric' })` for older dates.

#### `MobileNotificationsSkeleton`

- `data-testid="notifications-skeleton"`
- Renders 5 animated pulse cards (Magenta tint `bg-[#da336b]/5`)

#### `NotificationItem`

- `data-testid="notification-item"`, `data-unread={isUnread}`
- `role="button"`, `tabIndex={0}`, keyboard-accessible (`onKeyDown` Enter triggers tap)
- `aria-label` composed from category + title
- Unread left accent bar: `data-testid="unread-accent"`, `bg-[#da336b]` (disappears on tap — optimistic)
- Icon badge: Material Symbol icon per `CATEGORY_ICONS` map, Magenta gradient circle

**Category icon map:**

| category | icon |
|----------|------|
| `shift` | `swap_horiz` |
| `payroll` | `payments` |
| `news` | `campaign` |
| `schedule` | `event` |
| *(default)* | `notifications` |

**Swap actions** (shown when `type === 'swap'`):
- Container: `data-testid="swap-actions"`
- Accept: `data-testid="accept-btn"`, `aria-label="Accept shift swap"`
- Decline: `data-testid="decline-btn"`, `aria-label="Decline shift swap"`
- POSTs to `/ess/notifications/:id/swap-accept` or `swap-decline` via `apiFetch`
- Both buttons call `e.stopPropagation()` to prevent row-level tap

**Navigate action** (shown for other notification types):
- `data-testid="view-action-btn"`, `aria-label="View details"`

#### `EssNotificationToast` (SCREEN_95)

```jsx
<EssNotificationToast notification={notif} onDismiss={fn} onView={fn} />
```

- Glassmorphism pill: `bg-white/80 backdrop-blur-[20px] rounded-[2rem] border border-white/30`
- `role="alert"`, `aria-live="assertive"`
- `data-testid="notification-toast"`
- View button: `data-testid="toast-view-btn"`
- Dismiss button: `data-testid="toast-dismiss-btn"`, `aria-label="Dismiss notification"`

**Push payload shape (for backend/FCM integration):**

```json
{
  "id": "notif-uuid",
  "type": "shift|payroll|news|schedule",
  "category": "shift|payroll|news|schedule",
  "title": "Notif title",
  "body": "Short body text",
  "timestamp": "2025-01-15T10:30:00Z",
  "read": false,
  "actionUrl": "/app/ess/schedule"
}
```

#### `MobileNotificationsPage`

**Filter tabs:**

- Container: `data-testid="filter-tabs"`, `role="tablist"`
- Each tab: `role="tab"`, `aria-selected={active}`, `data-testid="filter-tab-{key}"`
- Keys: `all`, `shift`, `payroll`, `news`

**Mark-all-read button:**

- `data-testid="mark-all-read-btn"`, `aria-label={t('mobile.notifications.markAllRead')}`
- Fires `markAllRead()` from `useEssMarkRead`, then clears `localRead` set

**Date-grouped feed:**

- Each group header: `data-testid="date-group"` with date label text
- Renders `<NotificationItem>` per grouped notification

**Optimistic mark-as-read:**

- `localRead` set (React state) tracks IDs marked read during session
- On tap: ID added to `localRead` (instant visual revert of accent bar)
- `markRead(id)` called; on PATCH failure → ID removed from `localRead` to revert

**Empty state:** `data-testid="notifications-empty"`

**Sidebar (md+ only):**

- `hidden md:block md:col-span-4`, `data-testid="notifications-sidebar"`

**Weekly Pulse card:**

- `data-testid="weekly-pulse"`, Magenta gradient (`from-[#da336b] to-[#8b2044]`)
- Read Digest button: `data-testid="read-digest-btn"`

**Feed Preferences toggles:**

- Container: `data-testid="feed-preferences"`
- Each toggle: `role="switch"`, `aria-checked={active}`
- Preferences: `prefShiftAlerts`, `prefPayrollUpdates`, `prefTeamNews`, `prefHrAnnouncements`

---

### i18n Namespace: `ess` → `mobile.notifications.*`

**New keys added (EN + FR):**

| Key | EN | FR |
|-----|----|----|
| `stayInformed` | Stay Informed | Restez informé |
| `empty` | No notifications | Aucune notification |
| `filterLabel` | Filter by | Filtrer par |
| `filterAll` | All | Tout |
| `filterShifts` | Shifts | Quarts |
| `filterPayroll` | Payroll | Paie |
| `filterNews` | News | Nouvelles |
| `shiftChanges` | Shift Changes | Changements de quart |
| `news` | Announcements | Annonces |
| `accept` | Accept | Accepter |
| `decline` | Decline | Refuser |
| `viewAction` | View | Voir |
| `weeklyPulse` | Weekly Pulse | Pulse de la semaine |
| `weeklyPulseBody` | Your team's highlights... | Les points forts... |
| `readDigest` | Read Digest | Lire le résumé |
| `feedPreferences` | Feed Preferences | Préférences de fil |
| `prefShiftAlerts` | Shift Alerts | Alertes de quart |
| `prefPayrollUpdates` | Payroll Updates | Mises à jour paie |
| `prefTeamNews` | Team News | Nouvelles d'équipe |
| `prefHrAnnouncements` | HR Announcements | Annonces RH |

**Preserved existing keys:** `title`, `markAllRead`, `today`, `yesterday`, `earlier`, `emptyTitle`, `emptyBody`, `hoursAgo`, `minutesAgo`, `justNow`, `unread`

---

### Accessibility

| Element | Role / Attribute |
|---------|-----------------|
| Filter bar | `role="tablist"` |
| Each filter pill | `role="tab"`, `aria-selected` |
| Notification rows | `role="button"`, `tabIndex={0}`, `aria-label` |
| Toast | `role="alert"`, `aria-live="assertive"` |
| Dismiss toast btn | `aria-label="Dismiss notification"` |
| Accept/Decline btns | `aria-label` descriptive |
| Feed preference toggles | `role="switch"`, `aria-checked` |
| Material Symbol spans | `aria-hidden="true"` |

---

### Unit Tests

`tests/mobile-notifications-nexus.test.js` — **119 tests, all passing**

- `formatRelativeTime` — 9 tests: just now, minutes, hours, 1 day, multi-day, boundary cases
- `groupByDate` — 5 tests: today/yesterday, older dates, mixed groups, empty array
- Filter logic — 5 tests: all/shift/payroll/news filtering, unread count
- Optimistic read — 2 tests: immediate visual update, revert on failure
- EN i18n — 25 assertions: all new + preserved keys, exact values
- FR i18n — 9 assertions: accept/decline/markAllRead, filter keys, shiftChanges, weeklyPulse
- MobileNotificationsPage source — 21 assertions: testids, aria, hooks, filter tabs, sidebar
- NotificationItem source — 15 assertions: testids, aria, swap actions, keyboard handler
- EssNotificationToast source — 8 assertions: glassmorphism CSS, role, aria-live, testids
- `useEssNotifications` — 5 assertions: endpoint, useState, useEffect, useCallback, return shape
- `useEssMarkRead` — 6 assertions: single+bulk endpoints, useCallback, both keys returned
- App.jsx route — 3 assertions: MobileNotificationsPage import, notifications path, element

---

## Task 86 — Responsive QA & Cross-Device Polish (Sprint 22 QA Gate)

**Branch:** `feature/86-ess-responsive-qa`  
**Scope:** QA audit of Tasks 77–85 — fixes only, no new features.

---

### Fixes Applied

| # | Issue | Severity | Files Changed |
|---|-------|----------|---------------|
| 1 | Stale `#3B82F6` blue in `theme-color` + `msapplication-TileColor` meta tags | P1 | `EssLayout.jsx` |
| 2 | Forgot-password link used native `<a href>` instead of React Router `<Link>` (full-page reload on SPA) | P1 | `MobileLoginPage.jsx` |
| 3 | Input/select/textarea elements with `text-sm` (14px) trigger Safari iOS auto-zoom on focus | P1 | `MobileEditProfilePage.jsx`, `MobilePayslipHistoryPage.jsx`, `MobileRequestsPage.jsx` |
| 4 | Main scroll container missing `overscroll-contain` (Android rubber-banding on Chrome) | P2 | `MobileShell.jsx` |
| 5 | `pb-safe` (= `env(safe-area-inset-bottom)`) overrode `pb-6` — on devices with no safe area inset (Android, iPhone SE), the bottom nav had 0px bottom padding | P2 | `BottomNav.jsx` |
| 6 | Google Fonts (Plus Jakarta Sans + Manrope) loaded only via CSS `@import` (blocks render); missing `<link>` tags in HTML | P2 | `index.html` |
| 7 | `viewport` meta had `user-scalable=no, maximum-scale=1.0` — WCAG 1.4.4 violation (prevents accessibility zoom) | P1 | `index.html` |
| 8 | `TopAppBar` notification button had hardcoded `aria-label="Notifications"` (English only) | P2 | `MobileTopBar.jsx` |
| 9 | Avatar images in Profile, EditProfile, Dashboard teammate list lacked `loading="lazy"` | P3 | `MobileProfilePage.jsx`, `MobileEditProfilePage.jsx`, `MobileDashboardPage.jsx` |

---

### Device Width Matrix

All screens tested at the following viewport widths. Mobile shell renders at < 1024px; desktop sidebar shell at ≥ 1024px via `useMobileLayout()`.

| Width | Device Reference | Shell |
|-------|-----------------|-------|
| 360px | Samsung Galaxy S21 | MobileShell |
| 390px | iPhone 14 | MobileShell |
| 414px | iPhone 14 Plus | MobileShell |
| 640px | Tablet portrait | MobileShell |
| 768px | iPad Mini | MobileShell |
| 1024px | iPad Pro / laptop | AppShell (sidebar) |
| 1440px | Desktop monitor | AppShell (sidebar) |

**Breakpoint transition:** At exactly 1024px, `useMobileLayout()` fires a `matchMedia` change event. The ternary in `EssLayout` immediately swaps shells without re-routing. URL is preserved. Active route remains highlighted in the desktop sidebar.

---

### Visual Consistency — Confirmed

| Token | Value | Status |
|-------|-------|--------|
| Primary Magenta | `#da336b` | ✅ All pages |
| Secondary | `#8b2044` | ✅ Gradient `from-[#da336b] to-[#8b2044]` |
| Surface | `#fffbff` | ✅ `theme-color` on all mobile pages |
| Card radius | 24px (`rounded-2xl` / `rounded-[2rem]`) | ✅ |
| Button radius | 16px (`rounded-xl`) | ✅ |
| Input radius | 12px (`rounded-xl`) | ✅ |
| Separator colour | `#d5c2c5` (`--mobile-outline-variant`) | ✅ |

No stale `#3B82F6` (blue) tokens remain in any mobile page or layout component.

---

### Accessibility Audit — Confirmed

- **Touch targets**: All buttons, tabs, and interactive elements use `min-h-[44px] min-w-[44px]` or `py-4` padding ≥ 44px.
- **Bottom nav**: `role="navigation"`, `aria-label={t('mobile.nav.label')}`, `aria-current="page"` on active tab.
- **Progress bars**: All 3 progressbars (Dashboard leave, Requests balances, Payroll YTD) have `role="progressbar"` + `aria-valuenow` / `aria-valuemin` / `aria-valuemax`.
- **Form inputs**: All `<input>` elements have associated `<label htmlFor>` or `aria-label`.
- **Keyboard support**: `NotificationItem` rows have `role="button"`, `tabIndex={0}`, `onKeyDown` Enter handler.
- **Screen reader**: All Material Symbol `<span>` elements have `aria-hidden="true"`.
- **Toast**: `role="alert"`, `aria-live="assertive"` on `EssNotificationToast`.
- **User scalability**: Removed `user-scalable=no` and `maximum-scale=1.0` from viewport meta (WCAG 1.4.4 compliance).

---

### Performance Audit — Confirmed

- **Font loading**: Plus Jakarta Sans + Manrope loaded via `<link rel="stylesheet">` with `&display=swap` in `index.html`. No FOIT — text renders immediately with system fallback stack, then swaps to web font.
- **Animations**: All CSS `@keyframes` use only `opacity` and `transform`. No layout-triggering properties (`width`, `height`, `top`, `left`) in any keyframe.
- **Overscroll**: `overscroll-contain` on the MobileShell main scroll container prevents pull-to-refresh rubber-banding on Android Chrome.
- **Image lazy loading**: `loading="lazy"` on teammate avatars, pulse carousel images, profile avatars. News carousel images already had `loading="lazy"`.
- **Safe area**: BottomNav uses `max(1.5rem, env(safe-area-inset-bottom, 0px))` for bottom padding — guarantees minimum 24px on all devices while respecting the iPhone home indicator area (34px).

---

### Cross-Browser Notes

| Concern | Fix |
|---------|-----|
| Safari iOS auto-zoom on small inputs | All inputs/selects/textareas have `text-base` (16px minimum) |
| `100dvh` — Safari 15.4+ | Already used in MobileShell (`h-[100dvh]`). No fallback needed for target browsers. |
| `-webkit-backdrop-filter` — Top bar + BottomNav | Tailwind's `backdrop-blur-md` emits both `-webkit-backdrop-filter` and `backdrop-filter`. |
| Bottom nav over Android gesture bar | `max(1.5rem, env(safe-area-inset-bottom))` clears the Android gesture navigation area. |
| `font-display: swap` | Both Google Fonts URLs include `&display=swap`. |

---

### i18n

- **264** `mobile.*` keys in both `en/ess.json` and `fr/ess.json`. Zero missing keys. Zero empty values. Symmetric.
- Date formatting via `Intl.DateTimeFormat(undefined, ...)` — uses the browser locale automatically.
- All visible strings in every screen use `t()` calls with translation keys.

---

### Unit Tests

`tests/mobile-responsive-qa.test.js` — **108 tests, all passing**

Test categories:
- i18n completeness (6 tests): key count, symmetric EN↔FR, no empty values
- i18n EN exact values (20 tests): nav labels, feature titles, status chips
- i18n FR exact values (10 tests): critical UI strings validated
- EssLayout theme-color fix (3 tests): no #3B82F6, #da336b present
- MobileLoginPage SPA nav (3 tests): Link import, `to` attribute, no `href`
- Input font-size ≥ 16px (6 tests): no text-sm on inputs in 3 pages
- MobileShell overscroll (2 tests): overscroll-contain class
- BottomNav safe-area padding (7 tests): max() expression, role, aria, touch targets
- index.html fonts (7 tests): both fonts, display=swap, WCAG viewport
- TopAppBar i18n (3 tests): no hardcoded English aria-label
- Image lazy loading (4 tests): lazy on avatars and team images
- Progress bar ARIA (3 tests): all 4 attributes on each progressbar
- Animation safety (5 tests): keyframes use only transform/opacity
- No stale #3B82F6 tokens (12 tests): 11 mobile pages + EssLayout
- EssLayout shell swap (3 tests): useMobileLayout, ternary, single shell
- App.jsx routes (10 tests): all 8 routes + mobile delegation for dashboard/schedule
- MobileShell structure (4 tests): dvh, TopBar, BottomNav, CSS import

**Known Remaining Items (tracked, P3 — non-blocking):**
- `html[lang="fr"]` in `index.html` should be dynamic (set by i18next on mount). Tracked as separate cleanup task.
- Desktop payslips route (`/app/ess/payslips`) still uses the desktop `EssPayslipsPage` with `MobilePayslipList` delegation rather than the Sprint 22 `MobilePayslipDetailPage`. Separate migration task planned.

---

## Task 87 — Request Workflows: Database Schema & ESS/HR API Endpoints (Sprint 23)

### Overview

Full-stack request workflow infrastructure covering three request types:
- **Leave Requests** — submit, cancel, approve/reject (uses existing `leave_requests` table)
- **Absence Reports** — report, cancel, acknowledge/dispute (new `absence_reports` table via V45 migration)
- **Shift Swap Requests** — initiate, peer accept/decline, manager approve/reject (new `shift_swap_requests` JPA entity)

### Database — V45 Migration (`absence_reports`)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | Generated |
| employee_id | UUID NOT NULL | FK concept (not enforced) |
| absence_date | DATE NOT NULL | |
| absence_type | VARCHAR(30) | CHECK: sick, late_arrival, emergency, personal, other |
| expected_start / actual_start | TIME | For late_arrival tracking |
| reason | TEXT | Optional |
| cert_required / cert_uploaded | BOOLEAN | Auto-set by rolling 30-day sick threshold |
| cert_file_key | VARCHAR(255) | S3/storage key |
| status | VARCHAR(20) | CHECK: reported, acknowledged, disputed, cancelled |
| acknowledged_by / acknowledged_at | UUID / TIMESTAMPTZ | |
| disputed_by / disputed_at / dispute_reason | UUID / TIMESTAMPTZ / TEXT | |
| created_at / updated_at | TIMESTAMPTZ | Auto-managed |

Indexes: `(employee_id, absence_date DESC)`, partial on `status IN ('reported','disputed')`, unique on `(employee_id, absence_date)`.

### Backend Models

- **`AbsenceReport.java`** — JPA entity with @PrePersist/@PreUpdate lifecycle hooks
- **`ShiftSwapRequest.java`** — JPA entity for 1-to-1 direct shift swaps (requesterId/recipientId as String, matching employee ID format)

### Repositories

- **`AbsenceReportRepository`** — `countSickInWindow()`, `existsByEmployeeIdAndAbsenceDate()`, `findOpenReports()`
- **`ShiftSwapRequestRepository`** — `findByRequesterOrRecipient()`, `existsActiveSwapForShift()`, peer/requester auth lookups, `findOpenSwaps()`
- **`LeaveRequestRepository`** — added `findByEmployeeIdOrderByStartDateDesc()`, `findByStatusInOrderByCreatedAtDesc()`, `findAllByOrderByCreatedAtDesc()`

### ESS API Endpoints (`EssRequestController` — `/api/ess/requests/**`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/leave/balance` | Own leave balances (annual/sick) for current year |
| GET | `/leave/types` | Active leave types with colours |
| GET | `/leave?year=&status=` | List own leave requests |
| POST | `/leave` | Submit leave request (validates dates, calculates working days, balance warning) |
| DELETE | `/leave/{id}` | Cancel own submitted leave request |
| POST | `/absence` | Report unplanned absence (duplicate check, cert_required policy) |
| GET | `/absence?year=` | List own absence reports |
| PATCH | `/absence/{id}/cancel` | Cancel same-day absence report |
| GET | `/swap` | List own swap requests (sent + received) |
| POST | `/swap` | Initiate shift swap (validates ownership, no active swap conflict) |
| PATCH | `/swap/{id}/peer-accept` | Recipient accepts proposed swap |
| PATCH | `/swap/{id}/peer-decline` | Recipient declines proposed swap |
| PATCH | `/swap/{id}/cancel` | Requester cancels pending_peer swap |
| GET | `/summary` | Badge counts (pending leave, reported absence, pending swaps) |

### HR API Endpoints (`HrRequestController` — `/api/hr/requests/**`)

All endpoints require `SUPER_ADMIN` or `HR_MANAGER` role via `@PreAuthorize`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/?type=&status=` | Unified list of all request types with filters |
| GET | `/export?type=&status=` | CSV export of requests |
| PUT | `/leave/{id}/approve` | Approve a leave request |
| PUT | `/leave/{id}/reject` | Reject with optional reason |
| PATCH | `/absence/{id}/acknowledge` | Acknowledge absence report |
| PATCH | `/absence/{id}/dispute` | Dispute with required reason |
| PATCH | `/absence/{id}/cert-required` | Toggle cert_required flag |
| PUT | `/swap/{id}/approve` | Approve swap — atomically reassigns shift employee_ids |
| PUT | `/swap/{id}/reject` | Reject with optional reason |

### Frontend API Layer (`src/api/requestsApi.js`)

Two exported objects:
- **`essRequestsApi`** — 15 methods mapping to ESS endpoints
- **`hrRequestsApi`** — 9 methods mapping to HR endpoints

### React Query Hooks (`src/hooks/useEssRequests.js`)

17 hooks exported:

| Hook | Type | Key Details |
|------|------|-------------|
| `useEssLeaveBalance` | query | staleTime 2min |
| `useEssLeaveTypes` | query | staleTime 10min |
| `useEssLeaveRequests` | query | staleTime 2min, year/status filters |
| `useEssSubmitLeave` | mutation | invalidates all |
| `useEssCancelLeave` | mutation | invalidates all |
| `useEssAbsenceReports` | query | staleTime 2min |
| `useEssReportAbsence` | mutation | invalidates all |
| `useEssCancelAbsence` | mutation | invalidates all |
| `useEssSwapRequests` | query | staleTime 2min |
| `useEssSubmitSwap` | mutation | invalidates all |
| `useEssPeerAcceptSwap` | mutation | invalidates all |
| `useEssPeerDeclineSwap` | mutation | invalidates all |
| `useEssCancelSwap` | mutation | invalidates all |
| `useEssRequestsSummary` | query | 60s polling |
| `useHrRequests` | query | staleTime 30s, type/status filters |
| `useHrExportCsv` | query | disabled by default (manual) |
| `getRequestStatusLabel` | fn | i18n helper for status display |

### i18n Keys

**`ess.json` → `requests.*`** (17 keys): title, tab labels, status labels, balanceWarning, certRequired, cancelConfirm
**`hr.json` → `requests.*`** (14 keys): title, filter labels, action verbs, rejectReason, disputeReason, exportCsv, urgentBadge

### Business Rules

1. **cert_required policy**: Auto-set when rolling 30-day sick absence count ≥ `hr.sickCertThreshold` setting (default: 3)
2. **Leave balance**: Non-blocking warning when submission would exceed annual allowance
3. **Absence duplicate check**: 409 if employee already has a report for the same date
4. **Swap conflict check**: 409 if active swap exists for either shift
5. **Swap approval**: Atomically swaps `employee_id` on both shifts
6. **Cancellation rules**: Leave — only submitted/pending. Absence — only reported + same day. Swap — only pending_peer by requester.
