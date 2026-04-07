import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
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
import AccessDeniedPage from './pages/AccessDeniedPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

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
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
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
          <Route path="/access-denied" element={<ProtectedLayout><AccessDeniedPage /></ProtectedLayout>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
