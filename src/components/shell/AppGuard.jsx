import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getAccessibleApps } from '../../apps/registry';

/**
 * Checks that the current user has access to the given app.
 * Renders children if allowed, otherwise redirects to /access-denied.
 */
const AppGuard = ({ appId, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const accessibleApps = getAccessibleApps(user.role);
  const hasAccess = accessibleApps.some((app) => app.id === appId);

  if (!hasAccess) {
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
};

export default AppGuard;
