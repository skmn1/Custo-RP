import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { SettingsProvider } from './hooks/useSettings';
import AuthGuard from './components/ui/AuthGuard';
import RoleGuard from './components/ui/RoleGuard';
import Navbar from './components/Navbar';
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

const ProtectedLayout = ({ children }) => (
  <AuthGuard>
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {children}
    </div>
  </AuthGuard>
);

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

          {/* Protected routes */}
          <Route path="/" element={<ProtectedLayout><Navigate to="/scheduler" replace /></ProtectedLayout>} />
          <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
          <Route path="/scheduler" element={<ProtectedLayout><SchedulerPage /></ProtectedLayout>} />
          <Route path="/employees" element={<ProtectedLayout><EmployeesPage /></ProtectedLayout>} />
          <Route path="/payroll" element={<ProtectedLayout><RoleGuard roles={['admin', 'manager', 'employee']}><PayrollPage /></RoleGuard></ProtectedLayout>} />
          <Route path="/pos" element={<ProtectedLayout><RoleGuard roles={['admin', 'manager']}><PosListPage /></RoleGuard></ProtectedLayout>} />
          <Route path="/pos/:id" element={<ProtectedLayout><RoleGuard roles={['admin', 'manager']}><PosDetailPage /></RoleGuard></ProtectedLayout>} />
          <Route path="/admin/users" element={<ProtectedLayout><RoleGuard roles={['admin']}><UserManagementPage /></RoleGuard></ProtectedLayout>} />
          <Route path="/settings" element={<ProtectedLayout><SettingsPage /></ProtectedLayout>} />
          <Route path="/access-denied" element={<ProtectedLayout><AccessDeniedPage /></ProtectedLayout>} />

          {/* Stock management routes */}
          <Route path="/stock" element={<ProtectedLayout><RoleGuard roles={['admin', 'manager']}><StockDashboardPage /></RoleGuard></ProtectedLayout>} />
          <Route path="/stock/items" element={<ProtectedLayout><RoleGuard roles={['admin', 'manager']}><StockItemListPage /></RoleGuard></ProtectedLayout>} />
          <Route path="/stock/items/new" element={<ProtectedLayout><RoleGuard roles={['admin', 'manager']}><StockItemFormPage /></RoleGuard></ProtectedLayout>} />
          <Route path="/stock/items/:id" element={<ProtectedLayout><RoleGuard roles={['admin', 'manager']}><StockItemDetailPage /></RoleGuard></ProtectedLayout>} />
          <Route path="/stock/items/:id/edit" element={<ProtectedLayout><RoleGuard roles={['admin', 'manager']}><StockItemFormPage /></RoleGuard></ProtectedLayout>} />
          <Route path="/stock/movements" element={<ProtectedLayout><RoleGuard roles={['admin', 'manager']}><StockMovementPage /></RoleGuard></ProtectedLayout>} />
          <Route path="/stock/categories" element={<ProtectedLayout><RoleGuard roles={['admin', 'manager']}><StockCategoryPage /></RoleGuard></ProtectedLayout>} />
          <Route path="/stock/locations" element={<ProtectedLayout><RoleGuard roles={['admin', 'manager']}><StockLocationPage /></RoleGuard></ProtectedLayout>} />
          <Route path="/stock/suppliers" element={<ProtectedLayout><RoleGuard roles={['admin', 'manager']}><SupplierListPage /></RoleGuard></ProtectedLayout>} />
          <Route path="/stock/suppliers/new" element={<ProtectedLayout><RoleGuard roles={['admin', 'manager']}><SupplierFormPage /></RoleGuard></ProtectedLayout>} />
          <Route path="/stock/suppliers/:id/edit" element={<ProtectedLayout><RoleGuard roles={['admin', 'manager']}><SupplierFormPage /></RoleGuard></ProtectedLayout>} />
          <Route path="/stock/purchase-orders" element={<ProtectedLayout><RoleGuard roles={['admin', 'manager']}><PurchaseOrderListPage /></RoleGuard></ProtectedLayout>} />
          <Route path="/stock/purchase-orders/new" element={<ProtectedLayout><RoleGuard roles={['admin', 'manager']}><PurchaseOrderFormPage /></RoleGuard></ProtectedLayout>} />
          <Route path="/stock/purchase-orders/:id" element={<ProtectedLayout><RoleGuard roles={['admin', 'manager']}><PurchaseOrderDetailPage /></RoleGuard></ProtectedLayout>} />
          <Route path="/stock/purchase-orders/:id/edit" element={<ProtectedLayout><RoleGuard roles={['admin', 'manager']}><PurchaseOrderFormPage /></RoleGuard></ProtectedLayout>} />
          <Route path="/stock/stocktakes" element={<ProtectedLayout><RoleGuard roles={['admin', 'manager']}><StocktakeListPage /></RoleGuard></ProtectedLayout>} />
          <Route path="/stock/stocktakes/:id" element={<ProtectedLayout><RoleGuard roles={['admin', 'manager']}><StocktakeSessionPage /></RoleGuard></ProtectedLayout>} />
          <Route path="/stock/reorder-queue" element={<ProtectedLayout><RoleGuard roles={['admin', 'manager']}><ReorderQueuePage /></RoleGuard></ProtectedLayout>} />

          {/* Invoice management routes */}
          <Route path="/invoices" element={<ProtectedLayout><RoleGuard roles={['admin', 'manager']}><InvoiceListPage /></RoleGuard></ProtectedLayout>} />
          <Route path="/invoices/new" element={<ProtectedLayout><RoleGuard roles={['admin', 'manager']}><InvoiceFormPage /></RoleGuard></ProtectedLayout>} />
          <Route path="/invoices/review" element={<ProtectedLayout><RoleGuard roles={['admin', 'manager']}><InvoiceReviewPage /></RoleGuard></ProtectedLayout>} />
          <Route path="/invoices/:id/edit" element={<ProtectedLayout><RoleGuard roles={['admin', 'manager']}><InvoiceFormPage /></RoleGuard></ProtectedLayout>} />
          <Route path="/invoices/:id" element={<ProtectedLayout><RoleGuard roles={['admin', 'manager']}><InvoiceDetailPage /></RoleGuard></ProtectedLayout>} />
        </Routes>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
