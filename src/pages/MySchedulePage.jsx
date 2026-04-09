import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useShifts } from '../hooks/useShifts';
import { useWeekNavigation } from '../hooks/useWeekNavigation';
import { generateWeekDays, getWeekNumber } from '../utils/dateUtils';
import { useLocaleDateFns } from '../utils/formatLocale';
import { useSettings } from '../hooks/useSettings';
import { useEmployees } from '../hooks/useEmployees';
import Button from '../components/ui/Button';

/**
 * My Schedule — read-only weekly view of the logged-in employee's own shifts.
 * Visible only to `employee` role.
 */
const MySchedulePage = () => {
  const { t } = useTranslation(['scheduler', 'common', 'planning', 'timeOff', 'swaps']);
  const { formatDate } = useLocaleDateFns();
  const { user } = useAuth();
  const { settings } = useSettings();
  const { employees } = useEmployees();
  const { shifts, isLoading } = useShifts();
  const { currentWeek, navigateWeek, goToCurrentWeek } = useWeekNavigation();
  const navigate = useNavigate();

  const weekDays = generateWeekDays(currentWeek, settings?.general?.workWeekStart);
  const weekNumber = getWeekNumber(currentWeek);

  // Filter shifts to only the current user's shifts for the displayed week
  const myShifts = shifts.filter((shift) => {
    if (!user) return false;
    // Match by employee id — employee may be linked via user id or employee id
    const myEmployee = employees.find(
      (e) => e.userId === user.id || e.id === user.employeeId || e.email === user.email
    );
    if (!myEmployee) return false;
    return shift.employeeId === myEmployee.id;
  });

  // Group shifts by day index for easy rendering
  const shiftsByDay = weekDays.map((day, dayIndex) => {
    return myShifts.filter((s) => s.day === dayIndex);
  });

  // Total hours this week
  const totalHours = myShifts.reduce((sum, s) => sum + (s.duration || 0), 0);

  const getShiftTypeBadge = (type) => {
    const colors = {
      Morning: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      Day: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      Evening: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      Night: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      Overtime: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      Regular: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('planning:mySchedule.title')}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t('planning:mySchedule.subtitle')}
        </p>
      </div>

      {/* Week Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => navigateWeek(-1)}>
            {t('common:actions.previous')}
          </Button>
          <Button variant="secondary" size="sm" onClick={goToCurrentWeek}>
            {t('common:time.today')}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigateWeek(1)}>
            {t('common:actions.next')}
          </Button>
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('scheduler:week', { number: weekNumber })} — {formatDate(weekDays[0], 'PP')} – {formatDate(weekDays[6], 'PP')}
        </span>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/app/planning/time-off')}
        >
          {t('timeOff:btn.request')}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/app/planning/shift-swaps')}
        >
          {t('swaps:btn.newSwap')}
        </Button>
      </div>

      {/* Week Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{totalHours}h</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {t('planning:mySchedule.totalHoursThisWeek')}
          </span>
        </div>
      </div>

      {/* Daily Schedule */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {weekDays.map((day, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatDate(day, 'EEEE, MMMM d')}
                </span>
              </div>
              <div className="px-4 py-3">
                {shiftsByDay[idx].length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                    {t('scheduler:noShiftsScheduled')}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {shiftsByDay[idx].map((shift) => (
                      <div
                        key={shift.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-md"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getShiftTypeBadge(shift.type)}`}>
                            {t(`scheduler:shiftTypes.${shift.type}`, { defaultValue: shift.type })}
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {shift.startTime} – {shift.endTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          {shift.department && (
                            <span>{t(`scheduler:departments.${shift.department}`, { defaultValue: shift.department })}</span>
                          )}
                          <span>{shift.duration}h</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MySchedulePage;
