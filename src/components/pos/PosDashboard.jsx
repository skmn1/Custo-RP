import React from 'react';
import StatCard from '../ui/StatCard';

const PosDashboard = ({ dashboard }) => {
  if (!dashboard) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
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
        title="Employees"
        value={dashboard.employeeCount}
        icon="👥"
        color="blue"
        subtitle="Active staff assigned"
      />
      <StatCard
        title="Shifts Today"
        value={dashboard.shiftsToday}
        icon="📅"
        color="green"
        subtitle="Scheduled for today"
      />
      <StatCard
        title="Last Inventory"
        value={formatDate(dashboard.lastInventoryDate)}
        icon="📦"
        color="purple"
        subtitle="Most recent check"
      />
      <StatCard
        title="Low Stock Alerts"
        value={dashboard.lowStockAlerts}
        icon="⚠️"
        color={dashboard.lowStockAlerts > 0 ? 'red' : 'green'}
        subtitle={
          dashboard.lowStockAlerts > 0
            ? 'Items below threshold'
            : 'All stock levels OK'
        }
      />
    </div>
  );
};

export default PosDashboard;
