import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { usePosLocation } from '../../hooks/usePosLocation';

/**
 * Guards a PoS location-scoped route.
 * Redirects to /app/pos if the user has no access to the requested PoS location.
 * super_admin bypasses the check automatically.
 */
const PosLocationGuard = ({ children }) => {
  const { posLocationId } = useParams();
  const { hasAccess, isLoading } = usePosLocation();
  const { t } = useTranslation(['pos']);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
      </div>
    );
  }

  if (!hasAccess(posLocationId)) {
    toast.error(t('pos:notAssignedToLocation'));
    return <Navigate to="/app/pos" replace />;
  }

  return children;
};

export default PosLocationGuard;
