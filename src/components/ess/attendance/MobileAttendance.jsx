/**
 * MobileAttendance — Task 68
 *
 * Mobile-native attendance screen with weekly summary (progress ring),
 * week navigator, day-by-day card list, and collapsible monthly summary.
 * Reuses useEssAttendance hook from task 51.
 */
import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeftIcon, ChevronRightIcon, ArrowPathIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useEssAttendance } from '../../../hooks/useEssAttendance';
import { useEssConnectivity } from '../../../contexts/EssConnectivityContext';
import MobileHeader from '../../mobile/MobileHeader';
import MobileCard from '../../mobile/MobileCard';
import StatusChip from '../../mobile/StatusChip';
import EssOfflineFallback from '../EssOfflineFallback';

// ── Date helpers ─────────────────────────────────────────────

function getWeekRange(offset = 0) {
  const now = new Date();
  const day = now.getDay();
  // Monday-based week: day 0 (Sun) → offset -6, day 1 (Mon) → 0, etc.
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset + offset * 7);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (d) => d.toISOString().split('T')[0];
  return { from: fmt(monday), to: fmt(sunday), monday, sunday };
}

function formatWeekLabel(from, to) {
  const f = new Date(from + 'T00:00:00');
  const t = new Date(to + 'T00:00:00');
  const dOpts = { day: 'numeric' };
  const mOpts = { month: 'short' };
  const fDay = f.toLocaleDateString(undefined, dOpts);
  const fMonth = f.toLocaleDateString(undefined, mOpts);
  const tDay = t.toLocaleDateString(undefined, dOpts);
  const tMonth = t.toLocaleDateString(undefined, mOpts);
  const year = t.getFullYear();

  if (fMonth === tMonth) {
    return `${fDay}–${tDay} ${fMonth} ${year}`;
  }
  return `${fDay} ${fMonth} – ${tDay} ${tMonth} ${year}`;
}

function formatDayLabel(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' });
}

function formatMonthLabel(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
}

function getWeekDays(from) {
  const monday = new Date(from + 'T00:00:00');
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

// ── Status dot colours ───────────────────────────────────────

const STATUS_DOT_COLORS = {
  present:  'bg-[var(--mobile-success)]',
  late:     'bg-[var(--mobile-warning)]',
  absent:   'bg-[var(--mobile-destructive)]',
  leave:    'bg-[var(--mobile-info)]',
  on_leave: 'bg-[var(--mobile-info)]',
  half_day: 'bg-[var(--mobile-warning)]',
  holiday:  'bg-[var(--mobile-info)]',
};

const StatusDot = ({ status, className = '' }) => (
  <span
    className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${
      STATUS_DOT_COLORS[status] || 'bg-[var(--mobile-label-tertiary)]'
    } ${className}`}
    aria-hidden="true"
  />
);

// ── Ring colour helper ───────────────────────────────────────

function getRingColor(pct) {
  if (pct >= 90) return 'var(--mobile-tint)';
  if (pct >= 70) return 'var(--mobile-warning, #f59e0b)';
  return 'var(--mobile-destructive, #ef4444)';
}

// ── AttendanceRing ───────────────────────────────────────────

const AttendanceRing = ({ worked, expected }) => {
  const pct = expected > 0 ? Math.min((worked / expected) * 100, 100) : 0;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const color = getRingColor(pct);

  return (
    <div
      className="relative flex flex-col items-center py-4"
      role="img"
      aria-label={`${worked} hours worked out of ${expected} expected`}
      data-testid="attendance-ring"
    >
      <svg
        width="128"
        height="128"
        className="transform -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="var(--mobile-separator, #e5e7eb)"
          strokeWidth="8"
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-mobile-title1 font-bold text-[var(--mobile-label-primary)]">
          {worked}h
        </span>
        <span className="text-mobile-footnote text-[var(--mobile-label-secondary)]">
          / {expected}h
        </span>
      </div>
    </div>
  );
};

// ── WeekNavigator ────────────────────────────────────────────

const WeekNavigator = ({ weekLabel, onPrev, onNext, canGoNext, t }) => (
  <div
    className="flex items-center justify-between px-4 py-2"
    data-testid="week-navigator"
  >
    <button
      onClick={onPrev}
      className="p-2 rounded-lg active:bg-gray-100 touch-target"
      aria-label={t('mobile.attendance.previousWeek')}
    >
      <ChevronLeftIcon className="h-5 w-5 text-[var(--mobile-tint)]" />
    </button>
    <span className="text-mobile-body font-medium text-[var(--mobile-label-primary)]">
      {weekLabel}
    </span>
    <button
      onClick={onNext}
      disabled={!canGoNext}
      className="p-2 rounded-lg active:bg-gray-100 touch-target disabled:opacity-30"
      aria-label={t('mobile.attendance.nextWeek')}
    >
      <ChevronRightIcon className="h-5 w-5 text-[var(--mobile-tint)]" />
    </button>
  </div>
);

// ── DayRow ───────────────────────────────────────────────────

const DayRow = ({ record, t }) => {
  const status = record.status || 'no-record';
  const statusLabel =
    status === 'present' ? t('mobile.attendance.present') :
    status === 'late' ? t('mobile.attendance.late') :
    status === 'absent' ? t('mobile.attendance.absent') :
    (status === 'leave' || status === 'on_leave') ? t('mobile.attendance.leave') :
    null;

  const isInProgress = record.clockIn && !record.clockOut && status === 'present';

  return (
    <MobileCard className="mx-4 mb-2" testId="day-row">
      <div className="flex items-start gap-3">
        <StatusDot status={status} className="mt-1.5" />
        <div className="flex-1 min-w-0">
          <span className="text-mobile-body font-medium text-[var(--mobile-label-primary)]">
            {formatDayLabel(record.date)}
          </span>
          {record.clockIn || record.actualStart ? (
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <p className="text-mobile-subheadline text-[var(--mobile-label-secondary)]">
                {record.clockIn || record.actualStart} – {record.clockOut || record.actualEnd || '—'}
                {(record.hoursWorked != null || record.actualHours != null) && !isInProgress && (
                  <span>  •  {record.hoursWorked ?? Number(record.actualHours).toFixed(1)}h</span>
                )}
              </p>
              {isInProgress && (
                <StatusChip label="In progress" variant="info" />
              )}
            </div>
          ) : (status === 'leave' || status === 'on_leave') ? (
            <p className="text-mobile-subheadline text-[var(--mobile-label-secondary)] mt-0.5">
              {record.leaveType || t('mobile.attendance.leave')} ({t('mobile.attendance.approved')})
            </p>
          ) : (
            <p className="text-mobile-subheadline text-[var(--mobile-label-tertiary)] mt-0.5">
              {t('mobile.attendance.noRecord')}
            </p>
          )}
          {(record.note || record.notes) && (
            <p className="text-mobile-caption text-[var(--mobile-label-secondary)] mt-0.5">
              {record.note || record.notes}
            </p>
          )}
          {status === 'late' && !record.note && !record.notes && (
            <p className="text-mobile-caption text-[var(--mobile-label-secondary)] mt-0.5">
              {t('mobile.attendance.late')}
            </p>
          )}
        </div>
      </div>
    </MobileCard>
  );
};

// ── MonthlySummary ───────────────────────────────────────────

const MonthlySummary = ({ summary, records, weekFrom, t }) => {
  const [expanded, setExpanded] = useState(false);
  const monthLabel = formatMonthLabel(weekFrom);

  // compute summary from records if no summary object
  const stats = useMemo(() => {
    if (summary) {
      return {
        totalHours: Number(summary.totalHours || 0).toFixed(1),
        expectedHours: summary.expectedHours || '—',
        daysPresent: summary.daysPresent ?? '—',
        totalDays: summary.totalDays ?? '—',
        lateArrivals: summary.lateArrivals ?? 0,
        absences: summary.daysAbsent ?? 0,
        leaveTaken: summary.leaveDays ?? 0,
      };
    }
    // fallback: compute from records
    const present = records.filter((r) => r.status === 'present' || r.status === 'late').length;
    const late = records.filter((r) => r.status === 'late').length;
    const absent = records.filter((r) => r.status === 'absent').length;
    const leave = records.filter((r) => r.status === 'leave' || r.status === 'on_leave').length;
    const hours = records.reduce((sum, r) => sum + (r.actualHours || r.hoursWorked || 0), 0);
    return {
      totalHours: hours.toFixed(1),
      expectedHours: '—',
      daysPresent: present,
      totalDays: records.filter((r) => r.status && r.status !== 'no-record').length || '—',
      lateArrivals: late,
      absences: absent,
      leaveTaken: leave,
    };
  }, [summary, records]);

  return (
    <div className="mx-4 mt-4 mb-6" data-testid="monthly-summary">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[var(--mobile-bg-elevated)] rounded-xl text-left"
        aria-expanded={expanded}
        data-testid="monthly-summary-toggle"
      >
        <span className="text-mobile-body font-medium text-[var(--mobile-label-primary)]">
          {t('mobile.attendance.monthlySummary', { month: monthLabel })}
        </span>
        <ChevronDownIcon
          className={`h-5 w-5 text-[var(--mobile-label-secondary)] transition-transform duration-200 ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      </button>
      {expanded && (
        <div
          className="mt-1 bg-[var(--mobile-bg-elevated)] rounded-xl px-4 py-3 space-y-2"
          data-testid="monthly-summary-content"
        >
          <SummaryRow label={t('mobile.attendance.totalHours')} value={`${stats.totalHours}h`} />
          <SummaryRow
            label={t('mobile.attendance.daysPresent', { count: stats.daysPresent, total: stats.totalDays })}
            value=""
          />
          <SummaryRow label={t('mobile.attendance.lateArrivals')} value={stats.lateArrivals} />
          <SummaryRow label={t('mobile.attendance.absences')} value={stats.absences} />
          <SummaryRow
            label={t('mobile.attendance.leaveTaken')}
            value={stats.leaveTaken === 1
              ? t('mobile.attendance.day', { count: stats.leaveTaken })
              : t('mobile.attendance.days', { count: stats.leaveTaken })}
          />
        </div>
      )}
    </div>
  );
};

const SummaryRow = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-mobile-subheadline text-[var(--mobile-label-secondary)]">{label}</span>
    {value !== '' && value != null && (
      <span className="text-mobile-subheadline font-medium text-[var(--mobile-label-primary)]">{value}</span>
    )}
  </div>
);

// ── Loading Skeleton ─────────────────────────────────────────

const AttendanceSkeleton = () => (
  <div className="animate-pulse" data-testid="attendance-skeleton">
    <div className="flex flex-col items-center py-6">
      <div className="w-32 h-32 rounded-full bg-gray-200" />
    </div>
    <div className="px-4 space-y-2">
      <div className="h-4 w-40 bg-gray-200 rounded mx-auto" />
      <div className="h-3 w-32 bg-gray-200 rounded mx-auto" />
    </div>
    <div className="mt-6 space-y-3 px-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-16 bg-gray-200 rounded-xl" />
      ))}
    </div>
  </div>
);

// ── Main Component ───────────────────────────────────────────

const MobileAttendance = () => {
  const { t } = useTranslation('ess');
  const { isOnline } = useEssConnectivity();
  const {
    records,
    summary,
    isLoading,
    error,
    fetchAll,
  } = useEssAttendance();

  const [weekOffset, setWeekOffset] = useState(0);

  // Compute week range
  const { from, to } = useMemo(() => getWeekRange(weekOffset), [weekOffset]);
  const weekLabel = useMemo(() => formatWeekLabel(from, to), [from, to]);

  // Navigate weeks
  const goToPrevWeek = useCallback(() => {
    const newOffset = weekOffset - 1;
    setWeekOffset(newOffset);
    const range = getWeekRange(newOffset);
    fetchAll(range.from, range.to, '');
  }, [weekOffset, fetchAll]);

  const goToNextWeek = useCallback(() => {
    if (weekOffset >= 0) return;
    const newOffset = weekOffset + 1;
    setWeekOffset(newOffset);
    const range = getWeekRange(newOffset);
    fetchAll(range.from, range.to, '');
  }, [weekOffset, fetchAll]);

  // Build day list with all 7 days (Mon–Sun), merging with records
  const dayList = useMemo(() => {
    const weekDays = getWeekDays(from);
    const recordMap = {};
    for (const rec of (records || [])) {
      recordMap[rec.date] = rec;
    }
    return weekDays.map((date) => recordMap[date] || { date, status: null });
  }, [from, records]);

  // Weekly stats
  const weeklyStats = useMemo(() => {
    const hoursWorked = (records || []).reduce(
      (sum, r) => sum + (r.actualHours || r.hoursWorked || 0),
      0,
    );
    const expectedHours = summary?.expectedHours || 40;
    const daysPresent = (records || []).filter(
      (r) => r.status === 'present' || r.status === 'late',
    ).length;
    const totalWorkDays = summary?.totalDays || 5;
    const attendanceRate = totalWorkDays > 0
      ? Math.round((daysPresent / totalWorkDays) * 100)
      : 0;
    return { hoursWorked: Number(hoursWorked).toFixed(1), expectedHours, daysPresent, totalWorkDays, attendanceRate };
  }, [records, summary]);

  // Offline with no data
  if (!isOnline && (!records || records.length === 0) && !isLoading) {
    return (
      <div data-testid="mobile-attendance">
        <MobileHeader title={t('mobile.attendance.title')} />
        <EssOfflineFallback />
      </div>
    );
  }

  // Loading
  if (isLoading && (!records || records.length === 0)) {
    return (
      <div data-testid="mobile-attendance">
        <MobileHeader title={t('mobile.attendance.title')} />
        <AttendanceSkeleton />
      </div>
    );
  }

  // Error
  if (error && (!records || records.length === 0)) {
    return (
      <div data-testid="mobile-attendance">
        <MobileHeader title={t('mobile.attendance.title')} />
        <div className="flex flex-col items-center justify-center py-20 px-4" data-testid="mobile-attendance-error">
          <p className="text-mobile-body text-[var(--mobile-label-secondary)] mb-4">
            {error}
          </p>
          <button
            onClick={() => fetchAll(from, to, '')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--mobile-tint)] text-white rounded-lg text-mobile-body font-medium"
          >
            <ArrowPathIcon className="h-4 w-4" />
            {t('dashboard.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24" data-testid="mobile-attendance">
      <MobileHeader title={t('mobile.attendance.title')} />

      {/* Week navigator */}
      <WeekNavigator
        weekLabel={weekLabel}
        onPrev={goToPrevWeek}
        onNext={goToNextWeek}
        canGoNext={weekOffset < 0}
        t={t}
      />

      {/* Weekly summary card */}
      <div
        className="mx-4 mt-2 rounded-2xl overflow-hidden"
        style={{ boxShadow: 'var(--mobile-shadow-inner), var(--mobile-shadow-card)' }}
        data-testid="weekly-summary-card"
      >
        <div
          className="flex flex-col items-center px-4 py-5"
          style={{ background: 'linear-gradient(160deg, #EDE8DF 0%, #E5DDD0 100%)' }}
        >
          <p className="text-mobile-footnote font-semibold text-[var(--mobile-label-secondary)] text-center uppercase tracking-wide mb-3">
            {t('mobile.attendance.thisWeek')}
          </p>

          <AttendanceRing
            worked={weeklyStats.hoursWorked}
            expected={weeklyStats.expectedHours}
          />

          <div className="text-center space-y-1 mt-2">
            <p className="text-mobile-subheadline text-[var(--mobile-label-secondary)]">
              {t('mobile.attendance.attendanceRate', { rate: weeklyStats.attendanceRate })}
            </p>
            <p className="text-mobile-footnote text-[var(--mobile-label-tertiary)]">
              {t('mobile.attendance.daysPresent', {
                count: weeklyStats.daysPresent,
                total: weeklyStats.totalWorkDays,
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Day-by-day list */}
      <ol className="mt-4" data-testid="day-list" aria-label={t('attendance.dailyLog')}>
        {dayList.map((record) => (
          <li key={record.date}>
            <DayRow record={record} t={t} />
          </li>
        ))}
      </ol>

      {/* Monthly summary (collapsible) */}
      <MonthlySummary
        summary={summary}
        records={records || []}
        weekFrom={from}
        t={t}
      />
    </div>
  );
};

export { AttendanceRing, DayRow, WeekNavigator, getWeekRange, getRingColor, formatDayLabel };
export default MobileAttendance;
