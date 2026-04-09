import React from 'react';
import { useTranslation } from 'react-i18next';

const EssAttendancePage = () => {
  const { t } = useTranslation('ess');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        {t('attendance.title')}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <AttendanceCard label={t('attendance.hoursWorked')} value="—" />
        <AttendanceCard label={t('attendance.shiftsCompleted')} value="—" />
        <AttendanceCard label={t('attendance.absences')} value="0" />
      </div>
    </div>
  );
};

const AttendanceCard = ({ label, value }) => (
  <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">{label}</p>
    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
  </div>
);

export default EssAttendancePage;
