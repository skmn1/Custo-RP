import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * Redirects the `employee` role away from admin-facing apps to their ESS
 * equivalents or /access-denied. Non-employee roles are passed through unchanged.
 *
 * Redirect map (employee only):
 *   /app/planning/my-schedule  → /app/ess/schedule
 *   /app/planning/my-profile   → /app/ess/profile
 *   /app/planning/leave        → /app/ess/schedule
 *   /app/hr/profile/me         → /app/ess/profile
 *   /app/planning/*            → /access-denied
 *   /app/hr/*                  → /access-denied
 *   /app/payroll/*             → /access-denied
 *   /app/accounting/*          → /access-denied
 *   /app/stock/*               → /access-denied
 *   /app/pos/*                 → /access-denied
 *   /app/admin/*               → /access-denied
 */
const EmployeeRoleGuard = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user || user.role !== 'employee') return <>{children}</>;

  const path = location.pathname;

  // Specific legacy redirects
  if (path === '/app/planning/my-schedule') return <Navigate to="/app/ess/schedule" replace />;
  if (path === '/app/planning/my-profile')  return <Navigate to="/app/ess/profile" replace />;
  if (path === '/app/planning/leave')       return <Navigate to="/app/ess/schedule" replace />;
  if (path.startsWith('/app/hr/profile/me')) return <Navigate to="/app/ess/profile" replace />;

  // Block all other admin-facing apps
  const blockedPrefixes = [
    '/app/planning',
    '/app/hr',
    '/app/payroll',
    '/app/accounting',
    '/app/stock',
    '/app/pos',
    '/app/admin',
  ];

  if (blockedPrefixes.some((prefix) => path.startsWith(prefix))) {
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
};

export default EmployeeRoleGuard;
