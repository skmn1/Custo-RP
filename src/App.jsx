import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { SettingsProvider } from './hooks/useSettings';
import { DarkModeProvider } from './hooks/useDarkMode.jsx';
import AuthGuard from './components/ui/AuthGuard';
import AppShell from './components/shell/AppShell';
import AppLauncherPage from './pages/AppLauncherPage';
import Dashboard from './pages/Dashboard';
import SchedulerPage from './pages/SchedulerPage';
import EmployeesPage from './pages/EmployeesPage';
import PayrollPage from './pages/PayrollPage';
import PosListPage from './pages/PosListPage';
import PosDetailPage from './pages/PosDetailPage';
import MyTerminalsPage from './pages/MyTerminalsPage';
import PosTerminalDashboard from './pages/PosTerminalDashboard';
import PosStockLookup from './pages/PosStockLookup';
import PosReportsPage from './pages/PosReportsPage';
import PosTerminalAssignmentsPage from './pages/PosTerminalAssignmentsPage';
import PosAppShell from './components/pos/PosAppShell';
import TerminalGuard from './components/pos/TerminalGuard';
import UserManagementPage from './pages/UserManagementPage';
import SettingsPage from './pages/SettingsPage';
import AccessDeniedPage from './pages/AccessDeniedPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DevLoginPage from './pages/DevLoginPage';
import AccessibilityEffects from './components/AccessibilityEffects';
import StockDashboardPage from './pages/stock/StockDashboardPage';
import StockItemListPage from './pages/stock/StockItemListPage';
import StockItemDetailPage from './pages/stock/StockItemDetailPage';
import StockItemFormPage from './pages/stock/StockItemFormPage';
import StockMovementPage from './pages/stock/StockMovementPage';
import StockCategoryPage from './pages/stock/StockCategoryPage';
import StockLocationPage from './pages/stock/StockLocationPage';
import StockValuationPage from './pages/stock/StockValuationPage';
import SupplierListPage from './pages/stock/SupplierListPage';
import SupplierFormPage from './pages/stock/SupplierFormPage';
import PurchaseOrderListPage from './pages/stock/PurchaseOrderListPage';
import PurchaseOrderDetailPage from './pages/stock/PurchaseOrderDetailPage';
import PurchaseOrderFormPage from './pages/stock/PurchaseOrderFormPage';
import StocktakeListPage from './pages/stock/StocktakeListPage';
import StocktakeSessionPage from './pages/stock/StocktakeSessionPage';
import ReorderQueuePage from './pages/stock/ReorderQueuePage';
import InvoiceListPage from './pages/invoices/InvoiceListPage';
import InvoiceFormPage from './pages/invoices/InvoiceFormPage';
import InvoiceDetailPage from './pages/invoices/InvoiceDetailPage';
import InvoiceReviewPage from './pages/invoices/InvoiceReviewPage';
import HrSkillsPage from './pages/hr/HrSkillsPage';
import HrPerformancePage from './pages/hr/HrPerformancePage';
import OrgChartPage from './pages/hr/OrgChartPage';
import HrDocumentsPage from './pages/hr/HrDocumentsPage';
import HrEmployeeDetailPage from './pages/hr/HrEmployeeDetailPage';
import MySchedulePage from './pages/MySchedulePage';
import AvailabilityPage from './pages/AvailabilityPage';
import TimeOffPage from './pages/TimeOffPage';
import ShiftSwapsPage from './pages/ShiftSwapsPage';
import TemplatesPage from './pages/TemplatesPage';
import PlanningReportsPage from './pages/PlanningReportsPage';
import PayrollOverviewPage from './pages/PayrollOverviewPage';
import PayRunListPage from './pages/PayRunListPage';
import PayRunPage from './pages/PayRunPage';
import PaySlipListPage from './pages/PaySlipListPage';
import PaySlipDetailPage from './pages/PaySlipDetailPage';
import MyPaySlipsPage from './pages/MyPaySlipsPage';
import DeductionsPage from './pages/DeductionsPage';
import DirectDepositPage from './pages/DirectDepositPage';
import PayrollExportPage from './pages/PayrollExportPage';
import { planningSidebarItems } from './apps/planning/sidebarItems';
import { payrollSidebarItems } from './apps/payroll/sidebarItems';
import { accountingSidebarItems } from './apps/accounting/sidebarItems';
import { adminSidebarItems } from './apps/admin/sidebarItems';
import AccountingDashboardPage from './pages/accounting/AccountingDashboardPage';
import PaymentsPage from './pages/accounting/PaymentsPage';
import AgingPage from './pages/accounting/AgingPage';
import AccountingReportsPage from './pages/accounting/AccountingReportsPage';
import AccountingSettingsPage from './pages/accounting/AccountingSettingsPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AppAccessMatrixPage from './pages/admin/AppAccessMatrixPage';
import AdminPosTerminalsPage from './pages/admin/AdminPosTerminalsPage';
import AdminAuditLogPage from './pages/admin/AdminAuditLogPage';
import AdminSystemHealthPage from './pages/admin/AdminSystemHealthPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

/* ─── Sidebar nav items per app ───────────────────────────────── */
// Planning sidebar is imported from src/apps/planning/sidebarItems.js

const hrSidebar = [
  { label: 'common:nav.employees',   icon: 'UsersIcon',           to: '/app/hr/employees'  },
  { label: 'common:nav.skills',      icon: 'AcademicCapIcon',     to: '/app/hr/skills'     },
  { label: 'common:nav.performance', icon: 'StarIcon',            to: '/app/hr/performance' },
  { label: 'common:nav.orgChart',    icon: 'RectangleGroupIcon',  to: '/app/hr/org-chart'  },
  { label: 'common:nav.documents',   icon: 'FolderIcon',          to: '/app/hr/documents'  },
];

const payrollSidebar = payrollSidebarItems;

const accountingSidebar = accountingSidebarItems;

const stockSidebar = [
  { label: 'common:nav.stockDashboard',  icon: 'Squares2X2Icon',              to: '/app/stock',                     roles: ['super_admin', 'stock_manager'] },
  { label: 'common:nav.items',           icon: 'ArchiveBoxIcon',               to: '/app/stock/items',               roles: ['super_admin', 'stock_manager', 'pos_manager'] },
  { label: 'common:nav.movements',       icon: 'ArrowsRightLeftIcon',          to: '/app/stock/movements',           roles: ['super_admin', 'stock_manager'] },
  { label: 'common:nav.categories',      icon: 'TagIcon',                      to: '/app/stock/categories',          roles: ['super_admin', 'stock_manager'] },
  { label: 'common:nav.locations',       icon: 'MapPinIcon',                   to: '/app/stock/locations',           roles: ['super_admin', 'stock_manager', 'pos_manager'] },
  { label: 'common:nav.valuation',       icon: 'CurrencyEuroIcon',             to: '/app/stock/valuation',           roles: ['super_admin', 'stock_manager'] },
  { label: 'common:nav.suppliers',       icon: 'TruckIcon',                    to: '/app/stock/suppliers',           roles: ['super_admin', 'stock_manager'] },
  { label: 'common:nav.purchaseOrders',  icon: 'ClipboardDocumentListIcon',    to: '/app/stock/purchase-orders',     roles: ['super_admin', 'stock_manager'] },
  { label: 'common:nav.stocktakes',      icon: 'ClipboardDocumentCheckIcon',   to: '/app/stock/stocktakes',          roles: ['super_admin', 'stock_manager'] },
  { label: 'common:nav.reorderQueue',    icon: 'ArrowPathIcon',                to: '/app/stock/reorder-queue',       roles: ['super_admin', 'stock_manager'] },
];

const posSidebar = []; // PoS uses PosAppShell with dynamic sidebar

const adminSidebar = adminSidebarItems;

const App = () => {
  return (
    <DarkModeProvider>
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
        <AccessibilityEffects />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<DevLoginPage />} />
          <Route path="/login/classic" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* App Launcher (home) */}
          <Route path="/" element={<AuthGuard><AppLauncherPage /></AuthGuard>} />
          <Route path="/access-denied" element={<AuthGuard><AccessDeniedPage /></AuthGuard>} />

          {/* ═══ Planning app ═══ */}
          <Route path="/app/planning" element={<AppShell appId="planning" sidebarItems={planningSidebarItems} />}>
            <Route index element={<Dashboard />} />
            <Route path="schedule" element={<SchedulerPage />} />
            <Route path="my-schedule" element={<MySchedulePage />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="availability" element={<AvailabilityPage />} />
            <Route path="time-off" element={<TimeOffPage />} />
            <Route path="shift-swaps" element={<ShiftSwapsPage />} />
            <Route path="templates" element={<TemplatesPage />} />
            <Route path="reports" element={<PlanningReportsPage />} />
          </Route>

          {/* ═══ HR app ═══ */}
          <Route path="/app/hr" element={<AppShell appId="hr" sidebarItems={hrSidebar} />}>
            <Route index element={<Navigate to="/app/hr/employees" replace />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="employees/:id" element={<HrEmployeeDetailPage />} />
            <Route path="skills" element={<HrSkillsPage />} />
            <Route path="performance" element={<HrPerformancePage />} />
            <Route path="org-chart" element={<OrgChartPage />} />
            <Route path="documents" element={<HrDocumentsPage />} />
          </Route>

          {/* ═══ Payroll app ═══ */}
          <Route path="/app/payroll" element={<AppShell appId="payroll" sidebarItems={payrollSidebar} />}>
            <Route index element={<Navigate to="/app/payroll/overview" replace />} />
            <Route path="overview" element={<PayrollOverviewPage />} />
            <Route path="runs" element={<PayRunListPage />} />
            <Route path="runs/new" element={<PayRunPage />} />
            <Route path="runs/:id" element={<PayRunPage />} />
            <Route path="slips" element={<PaySlipListPage />} />
            <Route path="slips/mine" element={<MyPaySlipsPage />} />
            <Route path="slips/:id" element={<PaySlipDetailPage />} />
            <Route path="deductions" element={<DeductionsPage />} />
            <Route path="direct-deposit" element={<DirectDepositPage />} />
            <Route path="export" element={<PayrollExportPage />} />
            {/* Legacy: old single-page view */}
            <Route path="legacy" element={<PayrollPage />} />
          </Route>

          {/* ═══ Accounting app ═══ */}
          <Route path="/app/accounting" element={<AppShell appId="accounting" sidebarItems={accountingSidebar} />}>
            <Route index element={<Navigate to="/app/accounting/dashboard" replace />} />
            <Route path="dashboard" element={<AccountingDashboardPage />} />
            <Route path="invoices" element={<InvoiceListPage />} />
            <Route path="invoices/new" element={<InvoiceFormPage />} />
            <Route path="invoices/review" element={<InvoiceReviewPage />} />
            <Route path="invoices/:id/edit" element={<InvoiceFormPage />} />
            <Route path="invoices/:id" element={<InvoiceDetailPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="aging" element={<AgingPage />} />
            <Route path="reports" element={<AccountingReportsPage />} />
            <Route path="settings" element={<AccountingSettingsPage />} />
          </Route>

          {/* ═══ Stock app ═══ */}
          <Route path="/app/stock" element={<AppShell appId="stock" sidebarItems={stockSidebar} />}>
            <Route index element={<StockDashboardPage />} />
            <Route path="items" element={<StockItemListPage />} />
            <Route path="items/new" element={<StockItemFormPage />} />
            <Route path="items/:id" element={<StockItemDetailPage />} />
            <Route path="items/:id/edit" element={<StockItemFormPage />} />
            <Route path="movements" element={<StockMovementPage />} />
            <Route path="categories" element={<StockCategoryPage />} />
            <Route path="locations" element={<StockLocationPage />} />
            <Route path="suppliers" element={<SupplierListPage />} />
            <Route path="suppliers/new" element={<SupplierFormPage />} />
            <Route path="suppliers/:id/edit" element={<SupplierFormPage />} />
            <Route path="purchase-orders" element={<PurchaseOrderListPage />} />
            <Route path="purchase-orders/new" element={<PurchaseOrderFormPage />} />
            <Route path="purchase-orders/:id" element={<PurchaseOrderDetailPage />} />
            <Route path="purchase-orders/:id/edit" element={<PurchaseOrderFormPage />} />
            <Route path="stocktakes" element={<StocktakeListPage />} />
            <Route path="stocktakes/:id" element={<StocktakeSessionPage />} />
            <Route path="reorder-queue" element={<ReorderQueuePage />} />
            <Route path="valuation" element={<StockValuationPage />} />
          </Route>

          {/* ═══ POS app ═══ */}
          <Route path="/app/pos" element={<PosAppShell />}>
            <Route index element={<MyTerminalsPage />} />
            {/* Admin-only routes — must be before :terminalId to avoid param collision */}
            <Route path="admin/assignments" element={<PosTerminalAssignmentsPage />} />
            <Route path="admin/terminals" element={<PosListPage />} />
            <Route path=":terminalId/dashboard" element={<TerminalGuard><PosTerminalDashboard /></TerminalGuard>} />
            <Route path=":terminalId/detail" element={<TerminalGuard><PosDetailPage /></TerminalGuard>} />
            <Route path=":terminalId/stock" element={<TerminalGuard><PosStockLookup /></TerminalGuard>} />
            <Route path=":terminalId/reports" element={<TerminalGuard><PosReportsPage /></TerminalGuard>} />
          </Route>

          {/* ═══ Admin app ═══ */}
          <Route path="/app/admin" element={<AppShell appId="admin" sidebarItems={adminSidebar} />}>
            <Route index element={<Navigate to="/app/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="app-access" element={<AppAccessMatrixPage />} />
            <Route path="pos-terminals" element={<AdminPosTerminalsPage />} />
            <Route path="audit-log" element={<AdminAuditLogPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="system" element={<AdminSystemHealthPage />} />
          </Route>

          {/* ─── Legacy route redirects ─── */}
          <Route path="/dashboard" element={<Navigate to="/app/planning" replace />} />
          <Route path="/scheduler" element={<Navigate to="/app/planning/schedule" replace />} />
          <Route path="/my-schedule" element={<Navigate to="/app/planning/my-schedule" replace />} />
          <Route path="/availability" element={<Navigate to="/app/planning/availability" replace />} />
          <Route path="/time-off" element={<Navigate to="/app/planning/time-off" replace />} />
          <Route path="/shifts/swap" element={<Navigate to="/app/planning/shift-swaps" replace />} />
          <Route path="/templates" element={<Navigate to="/app/planning/templates" replace />} />
          <Route path="/planning/reports" element={<Navigate to="/app/planning/reports" replace />} />
          <Route path="/employees" element={<Navigate to="/app/planning/employees" replace />} />
          <Route path="/payroll" element={<Navigate to="/app/payroll/overview" replace />} />
          <Route path="/payroll/runs" element={<Navigate to="/app/payroll/runs" replace />} />
          <Route path="/payroll/runs/:id" element={<Navigate to="/app/payroll/runs/:id" replace />} />
          <Route path="/payroll/slips" element={<Navigate to="/app/payroll/slips" replace />} />
          <Route path="/payroll/slips/:id" element={<Navigate to="/app/payroll/slips/:id" replace />} />
          <Route path="/payroll/deductions" element={<Navigate to="/app/payroll/deductions" replace />} />
          <Route path="/payroll/direct-deposit" element={<Navigate to="/app/payroll/direct-deposit" replace />} />
          <Route path="/payroll/export" element={<Navigate to="/app/payroll/export" replace />} />
          <Route path="/pos" element={<Navigate to="/app/pos" replace />} />
          <Route path="/pos/:id" element={<Navigate to="/app/pos" replace />} />
          <Route path="/admin/users" element={<Navigate to="/app/admin/users" replace />} />
          <Route path="/settings" element={<Navigate to="/app/admin/settings" replace />} />
          <Route path="/stock/*" element={<Navigate to="/app/stock" replace />} />
          <Route path="/suppliers" element={<Navigate to="/app/stock/suppliers" replace />} />
          <Route path="/suppliers/*" element={<Navigate to="/app/stock/suppliers" replace />} />
          <Route path="/purchase-orders" element={<Navigate to="/app/stock/purchase-orders" replace />} />
          <Route path="/purchase-orders/*" element={<Navigate to="/app/stock/purchase-orders" replace />} />
          <Route path="/invoices" element={<Navigate to="/app/accounting/invoices" replace />} />
          <Route path="/invoices/new" element={<Navigate to="/app/accounting/invoices/new" replace />} />
          <Route path="/invoices/aging" element={<Navigate to="/app/accounting/aging" replace />} />
          <Route path="/invoices/:id" element={<Navigate to="/app/accounting/invoices/:id" replace />} />
          <Route path="/invoices/*" element={<Navigate to="/app/accounting/invoices" replace />} />
        </Routes>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
    </DarkModeProvider>
  );
};

export default App;
