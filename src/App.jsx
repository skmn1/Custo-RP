import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { SettingsProvider } from './hooks/useSettings';
import AuthGuard from './components/ui/AuthGuard';
import AppShell from './components/shell/AppShell';
import AppLauncherPage from './pages/AppLauncherPage';
import Dashboard from './pages/Dashboard';
import SchedulerPage from './pages/SchedulerPage';
import EmployeesPage from './pages/EmployeesPage';
import PayrollPage from './pages/PayrollPage';
import PosListPage from './pages/PosListPage';
import PosDetailPage from './pages/PosDetailPage';
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

/* ─── Sidebar nav items per app ───────────────────────────────── */
const planningSidebar = [
  { label: 'common:nav.dashboard', icon: 'Squares2X2Icon', to: '/app/planning' },
  { label: 'common:nav.scheduler', icon: 'CalendarDaysIcon', to: '/app/planning/scheduler' },
  { label: 'common:nav.employees', icon: 'UsersIcon', to: '/app/planning/employees' },
];

const hrSidebar = [
  { label: 'common:nav.employees', icon: 'UsersIcon', to: '/app/hr/employees' },
];

const payrollSidebar = [
  { label: 'common:nav.payroll', icon: 'BanknotesIcon', to: '/app/payroll' },
];

const accountingSidebar = [
  { label: 'common:nav.invoices', icon: 'ReceiptPercentIcon', to: '/app/accounting/invoices' },
  { label: 'common:nav.invoiceReview', icon: 'ClipboardDocumentCheckIcon', to: '/app/accounting/invoices/review' },
];

const stockSidebar = [
  { label: 'common:nav.stockDashboard', icon: 'Squares2X2Icon', to: '/app/stock' },
  { label: 'common:nav.items', icon: 'ArchiveBoxIcon', to: '/app/stock/items' },
  { label: 'common:nav.movements', icon: 'ArrowsRightLeftIcon', to: '/app/stock/movements' },
  { label: 'common:nav.categories', icon: 'TagIcon', to: '/app/stock/categories' },
  { label: 'common:nav.locations', icon: 'MapPinIcon', to: '/app/stock/locations' },
  { label: 'common:nav.suppliers', icon: 'TruckIcon', to: '/app/stock/suppliers' },
  { label: 'common:nav.purchaseOrders', icon: 'ClipboardDocumentListIcon', to: '/app/stock/purchase-orders' },
  { label: 'common:nav.stocktakes', icon: 'ClipboardDocumentCheckIcon', to: '/app/stock/stocktakes' },
  { label: 'common:nav.reorderQueue', icon: 'ArrowPathIcon', to: '/app/stock/reorder-queue' },
];

const posSidebar = [
  { label: 'common:nav.terminals', icon: 'ShoppingCartIcon', to: '/app/pos' },
];

const adminSidebar = [
  { label: 'common:nav.users', icon: 'UsersIcon', to: '/app/admin/users' },
  { label: 'common:nav.settings', icon: 'Cog8ToothIcon', to: '/app/admin/settings' },
];

const App = () => {
  return (
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
          <Route path="/app/planning" element={<AppShell appId="planning" sidebarItems={planningSidebar} />}>
            <Route index element={<Dashboard />} />
            <Route path="scheduler" element={<SchedulerPage />} />
            <Route path="employees" element={<EmployeesPage />} />
          </Route>

          {/* ═══ HR app ═══ */}
          <Route path="/app/hr" element={<AppShell appId="hr" sidebarItems={hrSidebar} />}>
            <Route index element={<Navigate to="/app/hr/employees" replace />} />
            <Route path="employees" element={<EmployeesPage />} />
          </Route>

          {/* ═══ Payroll app ═══ */}
          <Route path="/app/payroll" element={<AppShell appId="payroll" sidebarItems={payrollSidebar} />}>
            <Route index element={<PayrollPage />} />
          </Route>

          {/* ═══ Accounting app ═══ */}
          <Route path="/app/accounting" element={<AppShell appId="accounting" sidebarItems={accountingSidebar} />}>
            <Route index element={<Navigate to="/app/accounting/invoices" replace />} />
            <Route path="invoices" element={<InvoiceListPage />} />
            <Route path="invoices/new" element={<InvoiceFormPage />} />
            <Route path="invoices/review" element={<InvoiceReviewPage />} />
            <Route path="invoices/:id/edit" element={<InvoiceFormPage />} />
            <Route path="invoices/:id" element={<InvoiceDetailPage />} />
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
          </Route>

          {/* ═══ POS app ═══ */}
          <Route path="/app/pos" element={<AppShell appId="pos" sidebarItems={posSidebar} />}>
            <Route index element={<PosListPage />} />
            <Route path=":id" element={<PosDetailPage />} />
          </Route>

          {/* ═══ Admin app ═══ */}
          <Route path="/app/admin" element={<AppShell appId="admin" sidebarItems={adminSidebar} />}>
            <Route index element={<Navigate to="/app/admin/users" replace />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* ─── Legacy route redirects ─── */}
          <Route path="/dashboard" element={<Navigate to="/app/planning" replace />} />
          <Route path="/scheduler" element={<Navigate to="/app/planning/scheduler" replace />} />
          <Route path="/employees" element={<Navigate to="/app/planning/employees" replace />} />
          <Route path="/payroll" element={<Navigate to="/app/payroll" replace />} />
          <Route path="/pos" element={<Navigate to="/app/pos" replace />} />
          <Route path="/pos/:id" element={<Navigate to="/app/pos/:id" replace />} />
          <Route path="/admin/users" element={<Navigate to="/app/admin/users" replace />} />
          <Route path="/settings" element={<Navigate to="/app/admin/settings" replace />} />
          <Route path="/stock/*" element={<Navigate to="/app/stock" replace />} />
          <Route path="/invoices/*" element={<Navigate to="/app/accounting/invoices" replace />} />
        </Routes>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
