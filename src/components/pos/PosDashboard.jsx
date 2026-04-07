import React from 'react';
import { useTranslation } from 'react-i18next';
import StatCard from '../ui/StatCard';

const PosDashboard = ({ dashboard }) => {
  const { t } = useTranslation(['pos']);

  if (!dashboard) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return t('pos:dashboard.never');
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div
      data-testid="pos-dashboard"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
    >
      <StatCard
        title={t('pos:dashboard.employees')}
        value={dashboard.employeeCount}
        icon="👥"
        color="blue"
        subtitle={t('pos:dashboard.activeStaff')}
      />
      <StatCard
        title={t('pos:dashboard.shiftsToday')}
        value={dashboard.shiftsToday}
        icon="📅"
        color="green"
        subtitle={t('pos:dashboard.scheduledForToday')}
      />
      <StatCard
        title={t('pos:dashboard.lastInventory')}
        value={formatDate(dashboard.lastInventoryDate)}
        icon="📦"
        color="purple"
        subtitle={t('pos:dashboard.mostRecentCheck')}
      />
      <StatCard
        title={t('pos:dashboard.lowStock')}
        value={dashboard.lowStockAlerts}
        icon="⚠️"
        color={dashboard.lowStockAlerts > 0 ? 'red' : 'green'}
        subtitle={
          dashboard.lowStockAlerts > 0
            ? t('pos:dashboard.itemsBelow')
            : t('pos:dashboard.allOk')
        }
      />
    </div>
  );
};

export default PosDashboard;
