import React from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { hasPermission } from '../../constants/permissions';

/**
 * Displays a read-only access banner when the current user has 'stock:view'
 * but not 'stock:create' (i.e. pos_manager).
 * Renders nothing for stock_manager and super_admin.
 */
const StockReadOnlyBanner = () => {
  const { user } = useAuth();

  const isReadOnly =
    user &&
    hasPermission(user.role, 'stock:view') &&
    !hasPermission(user.role, 'stock:create');

  if (!isReadOnly) return null;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 px-4 py-3 mb-4 text-sm text-blue-800 dark:text-blue-300">
      <InformationCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <p>
        You have <strong>read-only access</strong> to Stock — contact your stock manager to make changes.
      </p>
    </div>
  );
};

export default StockReadOnlyBanner;
