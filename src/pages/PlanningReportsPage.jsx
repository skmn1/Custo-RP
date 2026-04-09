import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useShifts } from '../hooks/useShifts';
import { useEmployees } from '../hooks/useEmployees';
import { useLocaleDateFns } from '../utils/formatLocale';
import { generateWeekDays } from '../utils/dateUtils';
import { useSettings } from '../hooks/useSettings';
import Button from '../components/ui/Button';

/**
 * Planning Reports — KPI tables and charts for planning managers.
 * Roles: super_admin, hr_manager, planner.
 */
const PlanningReportsPage = () => {
  const { t } = useTranslation(['planning', 'common', 'scheduler']);
  const { formatDate } = useLocaleDateFns();
  const { shifts, isLoading: shiftsLoading } = useShifts();
  const { employees, isLoading: employeesLoading } = useEmployees();
  const { settings } = useSettings();

  const [dateRange, setDateRange] = useState('month');

  const isLoading = shiftsLoading || employeesLoading;

  // ── Weekly Coverage ──
  const weeklyCoverage = useMemo(() => {
    const weekDays = generateWeekDays(new Date(), settings?.general?.workWeekStart);
    return weekDays.map((day, idx) => {
      const count = shifts.filter((s) => s.day === idx).length;
      return { day: idx, label: formatDate(day, 'EEE'), count, target: 5 };
    });
  }, [shifts, settings, formatDate]);

  // ── Overtime Summary ──
  const overtimeSummary = useMemo(() => {
    const hoursPerEmployee = {};
    shifts.forEach((s) => {
      hoursPerEmployee[s.employeeId] = (hoursPerEmployee[s.employeeId] || 0) + (s.duration || 0);
    });
    return Object.entries(hoursPerEmployee)
      .filter(([, hours]) => hours > 40)
      .map(([empId, hours]) => {
        const emp = employees.find((e) => e.id === empId);
        return { employeeId: empId, name: emp ? `${emp.firstName} ${emp.lastName}` : empId, hours };
      })
      .sort((a, b) => b.hours - a.hours);
  }, [shifts, employees]);

  // ── Unfilled Shifts ──
  const unfilledShifts = useMemo(() => {
    return shifts.filter((s) => !s.employeeId || s.employeeId === '');
  }, [shifts]);

  // ── Shift Distribution by department ──
  const shiftDistribution = useMemo(() => {
    const byDept = {};
    shifts.forEach((s) => {
      const dept = s.department || 'Unassigned';
      byDept[dept] = (byDept[dept] || 0) + 1;
    });
    return Object.entries(byDept).map(([department, count]) => ({ department, count }));
  }, [shifts]);

  // ── Absence Heatmap (placeholder data — would need time-off API) ──
  const absenceHeatmap = useMemo(() => {
    const weekDays = generateWeekDays(new Date(), settings?.general?.workWeekStart);
    return weekDays.map((day, idx) => ({
      day: formatDate(day, 'EEE'),
      absences: Math.floor(Math.random() * 4),
    }));
  }, [settings, formatDate]);

  // ── CSV Export ──
  const handleExport = () => {
    const rows = [['Report', 'Metric', 'Value']];
    overtimeSummary.forEach((e) => rows.push(['Overtime', e.name, e.hours]));
    shiftDistribution.forEach((d) => rows.push(['Distribution', d.department, d.count]));
    weeklyCoverage.forEach((d) => rows.push(['Coverage', d.label, d.count]));

    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `planning-reports-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const maxCoverage = Math.max(...weeklyCoverage.map((d) => Math.max(d.count, d.target)), 1);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('planning:reports.title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('planning:reports.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="week">{t('common:time.thisWeek')}</option>
            <option value="month">{t('common:time.thisMonth')}</option>
          </select>
          <Button variant="secondary" size="sm" onClick={handleExport}>
            {t('common:actions.export')}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Coverage — Bar Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('planning:reports.weeklyCoverage')}
            </h2>
            <div className="flex items-end gap-2 h-48">
              {weeklyCoverage.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col items-center gap-0.5" style={{ height: '160px' }}>
                    <div className="relative w-full flex justify-center gap-1" style={{ height: '100%' }}>
                      {/* Actual */}
                      <div
                        className="w-5 bg-blue-500 rounded-t transition-all"
                        style={{ height: `${(d.count / maxCoverage) * 100}%`, marginTop: 'auto' }}
                        title={`${d.count} scheduled`}
                      />
                      {/* Target */}
                      <div
                        className="w-5 bg-gray-200 dark:bg-gray-600 rounded-t transition-all"
                        style={{ height: `${(d.target / maxCoverage) * 100}%`, marginTop: 'auto' }}
                        title={`${d.target} target`}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{d.label}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded" /> {t('planning:reports.scheduled')}</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-200 dark:bg-gray-600 rounded" /> {t('planning:reports.target')}</span>
            </div>
          </div>

          {/* Shift Distribution — Donut approximation */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('planning:reports.shiftDistribution')}
            </h2>
            {shiftDistribution.length === 0 ? (
              <p className="text-sm text-gray-400">{t('common:status.noData')}</p>
            ) : (
              <div className="space-y-3">
                {shiftDistribution.map((d) => {
                  const pct = shifts.length > 0 ? Math.round((d.count / shifts.length) * 100) : 0;
                  return (
                    <div key={d.department}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 dark:text-gray-300">
                          {t(`scheduler:departments.${d.department}`, { defaultValue: d.department })}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">{d.count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Overtime Summary — Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('planning:reports.overtimeSummary')}
            </h2>
            {overtimeSummary.length === 0 ? (
              <p className="text-sm text-gray-400">{t('planning:reports.noOvertime')}</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 text-gray-500 dark:text-gray-400 font-medium">{t('scheduler:employee')}</th>
                    <th className="text-right py-2 text-gray-500 dark:text-gray-400 font-medium">{t('common:time.hours')}</th>
                  </tr>
                </thead>
                <tbody>
                  {overtimeSummary.map((e) => (
                    <tr key={e.employeeId} className="border-b border-gray-100 dark:border-gray-700/50">
                      <td className="py-2 text-gray-900 dark:text-white">{e.name}</td>
                      <td className="py-2 text-right font-medium text-red-600 dark:text-red-400">{e.hours}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Absence Heatmap — Grid */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('planning:reports.absenceHeatmap')}
            </h2>
            <div className="grid grid-cols-7 gap-2">
              {absenceHeatmap.map((d, i) => {
                const intensity = Math.min(d.absences / 4, 1);
                const bg = intensity > 0.6
                  ? 'bg-red-400 dark:bg-red-600'
                  : intensity > 0.3
                    ? 'bg-orange-300 dark:bg-orange-500'
                    : intensity > 0
                      ? 'bg-yellow-200 dark:bg-yellow-600'
                      : 'bg-gray-100 dark:bg-gray-700';
                return (
                  <div key={i} className="text-center">
                    <div className={`${bg} rounded-md p-3 mb-1`}>
                      <span className="text-sm font-medium text-gray-800 dark:text-white">{d.absences}</span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{d.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Unfilled Shifts — Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('planning:reports.unfilledShifts')}
            </h2>
            {unfilledShifts.length === 0 ? (
              <p className="text-sm text-gray-400">{t('planning:reports.allShiftsFilled')}</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 text-gray-500 dark:text-gray-400 font-medium">{t('scheduler:day')}</th>
                    <th className="text-left py-2 text-gray-500 dark:text-gray-400 font-medium">{t('scheduler:shiftType')}</th>
                    <th className="text-left py-2 text-gray-500 dark:text-gray-400 font-medium">{t('scheduler:startTime')}</th>
                    <th className="text-left py-2 text-gray-500 dark:text-gray-400 font-medium">{t('scheduler:endTime')}</th>
                    <th className="text-left py-2 text-gray-500 dark:text-gray-400 font-medium">{t('scheduler:department')}</th>
                  </tr>
                </thead>
                <tbody>
                  {unfilledShifts.map((s) => (
                    <tr key={s.id} className="border-b border-gray-100 dark:border-gray-700/50">
                      <td className="py-2 text-gray-900 dark:text-white">{s.day}</td>
                      <td className="py-2 text-gray-900 dark:text-white">{t(`scheduler:shiftTypes.${s.type}`, { defaultValue: s.type })}</td>
                      <td className="py-2 text-gray-600 dark:text-gray-300">{s.startTime}</td>
                      <td className="py-2 text-gray-600 dark:text-gray-300">{s.endTime}</td>
                      <td className="py-2 text-gray-600 dark:text-gray-300">{s.department || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanningReportsPage;
