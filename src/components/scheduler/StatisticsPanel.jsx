import React from 'react';
import { useTranslation } from 'react-i18next';
import StatCard from '../ui/StatCard';

const StatisticsPanel = ({ employees, shifts }) => {
  const { t } = useTranslation(['scheduler']);
  const totalHours = shifts.reduce((sum, shift) => sum + shift.duration, 0);
  const averageHoursPerEmployee = employees.length > 0 ? (totalHours / employees.length).toFixed(1) : 0;
  const overtimeEmployees = employees.filter(emp => {
    const empHours = shifts
      .filter(shift => shift.employeeId === emp.id)
      .reduce((sum, shift) => sum + shift.duration, 0);
    return empHours > emp.maxHours;
  }).length;

  const statsData = [
    {
      title: t('scheduler:stats.totalStaff'),
      value: employees.length,
      subtitle: t('scheduler:stats.activeEmployees'),
      color: 'blue',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      title: t('scheduler:stats.totalShifts'),
      value: shifts.length,
      subtitle: t('scheduler:stats.thisWeek'),
      color: 'green',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: t('scheduler:stats.totalHours'),
      value: `${totalHours}h`,
      subtitle: t('scheduler:stats.averagePerEmployee', { value: averageHoursPerEmployee }),
      color: 'purple',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      title: t('scheduler:stats.overtime'),
      value: overtimeEmployees,
      subtitle: overtimeEmployees > 0 ? t('scheduler:stats.employeesOverLimit') : t('scheduler:stats.allWithinLimits'),
      color: overtimeEmployees > 0 ? 'red' : 'green',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.168 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          subtitle={stat.subtitle}
          color={stat.color}
          icon={stat.icon}
        />
      ))}
    </div>
  );
};

export default StatisticsPanel;
