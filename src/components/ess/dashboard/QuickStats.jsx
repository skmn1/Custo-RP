import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CalendarDaysIcon,
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

function getAttendanceStatus(rate) {
  if (rate == null) return 'normal';
  if (rate >= 95) return 'green';
  if (rate >= 80) return 'amber';
  return 'red';
}

const statusBg = {
  normal: 'bg-white border-gray-200',
  green: 'bg-green-50 border-green-200',
  amber: 'bg-amber-50 border-amber-200',
  red: 'bg-red-50 border-red-200',
};

const statusIcon = {
  normal: 'text-gray-400',
  green: 'text-green-500',
  amber: 'text-amber-500',
  red: 'text-red-500',
};

const QuickStats = ({ shifts, payslip, attendance, restricted }) => {
  const { t } = useTranslation('ess');

  const shiftsCount = Array.isArray(shifts) ? shifts.length : 0;
  const netPay = payslip?.netPay;
  const currency = payslip?.currency || 'EUR';
  const totalHours = attendance?.totalActualHours;
  const attendanceRate = attendance?.attendanceRate;
  const attStatus = getAttendanceStatus(attendanceRate);

  const formatCurrency = (amount) => {
    if (amount == null) return '—';
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
  };

  const cards = [
    {
      icon: CalendarDaysIcon,
      value: String(shiftsCount),
      label: t('dashboard.stats.shiftsThisWeek'),
      link: '/app/ess/schedule',
      status: 'normal',
    },
    {
      icon: BanknotesIcon,
      value: restricted ? '—' : formatCurrency(netPay),
      label: t('dashboard.stats.lastPay'),
      link: '/app/ess/payslips',
      status: 'normal',
      hidden: false,
    },
    {
      icon: ClockIcon,
      value: totalHours != null ? `${totalHours}h` : '—',
      label: t('dashboard.stats.hoursThisMonth'),
      link: '/app/ess/attendance',
      status: 'normal',
    },
    {
      icon: CheckCircleIcon,
      value: attendanceRate != null ? `${attendanceRate}%` : '—',
      label: t('dashboard.stats.attendance'),
      link: '/app/ess/attendance',
      status: attStatus,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Link
            key={card.label}
            to={card.link}
            className={`rounded-xl border p-4 transition-shadow hover:shadow-md ${statusBg[card.status]}`}
          >
            <div className="flex items-center justify-between mb-2">
              <Icon className={`h-6 w-6 ${statusIcon[card.status]}`} />
            </div>
            <p className="text-xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </Link>
        );
      })}
    </div>
  );
};

export default QuickStats;
