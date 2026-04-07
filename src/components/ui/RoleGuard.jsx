import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import AccessDeniedPage from '../../pages/AccessDeniedPage';

/**
 * Route-level guard that checks if the current user's role is in the allowed list.
 * Shows AccessDeniedPage if the user's role is not permitted.
 *
 * @param {string[]} roles - Array of allowed role names
 * @param {React.ReactNode} children - Route content to render when permitted
 */
const RoleGuard = ({ roles, children }) => {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return <AccessDeniedPage />;
  }

  return children;
};

export default RoleGuard;
