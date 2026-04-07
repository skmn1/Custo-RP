import React from 'react';
import { useAuth } from '../../hooks/useAuth';

/**
 * Conditionally renders children based on the current user's permissions.
 *
 * @param {string} permission - Required permission string (e.g., 'employees:create')
 * @param {React.ReactNode} fallback - Optional fallback to render when permission denied
 * @param {React.ReactNode} children - Content to render when permitted
 */
const PermissionGate = ({ permission, fallback = null, children }) => {
  const { can } = useAuth();
  return can(permission) ? children : fallback;
};

export default PermissionGate;
