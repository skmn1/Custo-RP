/**
 * MobileSchedulePage — Task 81 (SCREEN_103)
 *
 * ESS work schedule screen with Nexus Kinetic styling:
 * - Monthly calendar picker with Magenta shift-day dots and selected-day fill
 * - Month navigation reusing useEssSchedule() navigatePrev/navigateNext
 * - Scrollable shift list filtered to the selected date
 * - Location tagging on each shift card
 * - "Request Swap" placeholder button
 *
 * Data: useEssSchedule() → GET /api/ess/schedule?from=…&to=…
 */
import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import {
  isSameDay,
  isSameMonth,
  startOfMonth,
  getDaysInMonth,
  getDay,
  format,
} from 'date-fns';
import { useEssSchedule } from '../../../hooks/useEssSchedule';
import {
  useSubmitSwapRequest,
  useColleagues,
  useColleagueSchedule,
} from '../../../hooks/useEssRequests';

// ── Helpers ─────────────────────────────────────────────────────

/**
 * Returns an array of Date objects for every day in the month that contains
 * `monthDate`, padded at the start so Monday = column 0 (ISO week).
 *
 * Padding cells are `null` — the calendar renders empty slots for them.
 */
function buildMonthGrid(monthDate) {
  const first = startOfMonth(monthDate);
  // getDay() returns 0=Sun…6=Sat; convert so Mon=0
  const startPad = (getDay(first) + 6) % 7;
  const days = getDaysInMonth(monthDate);
  const total = startPad + days;
  const cells = new Array(Math.ceil(total / 7) * 7).fill(null);
  for (let i = 0; i < days; i++) {
    cells[startPad + i] = new Date(first.getFullYear(), first.getMonth(), i + 1);
  }
  return cells;
}

/** Formats a Date to 'YYYY-MM-DD' without UTC conversion. */
function toDateString(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ── Monthly Calendar (B.1) ───────────────────────────────────────

const DAY_HEADERS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const ScheduleCalendar = ({ selectedDate, onSelectDate, shifts, anchor, onPrev, onNext }) => {
  const { t } = useTranslation('ess');
  const today = new Date();
  const shiftDates = new Set(shifts.map((s) => s.date));
  const cells = buildMonthGrid(anchor);

  return (
    <div
      className="mx-6 mt-6 bg-surface-container-lowest rounded-2xl shadow-[0_8px_24px_rgba(25,28,30,0.06)] p-5"
      data-testid="schedule-calendar"
    >
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={onPrev}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-container active:bg-surface-container transition-colors"
          aria-label={t('mobile.schedule.previousMonth')}
        >
          <span className="material-symbols-outlined text-xl text-on-surface" aria-hidden="true">
            chevron_left
          </span>
        </button>
        <h2
          className="font-headline text-base font-bold text-on-surface"
          aria-live="polite"
          aria-atomic="true"
        >
          {new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(anchor)}
        </h2>
        <button
          onClick={onNext}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-container active:bg-surface-container transition-colors"
          aria-label={t('mobile.schedule.nextMonth')}
        >
          <span className="material-symbols-outlined text-xl text-on-surface" aria-hidden="true">
            chevron_right
          </span>
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_HEADERS.map((d) => (
          <span
            key={d}
            className="text-[11px] text-on-surface-variant text-center font-bold uppercase tracking-wide font-label"
          >
            {d}
          </span>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-1" role="grid" aria-label={t('mobile.schedule.calendarLabel')}>
        {cells.map((day, idx) => {
          if (!day) {
            return <div key={`pad-${idx}`} role="gridcell" aria-hidden="true" />;
          }
          const dateStr = toDateString(day);
          const hasShift = shiftDates.has(dateStr);
          const isSelected = isSameDay(day, selectedDate);
          const isTodayDay = isSameDay(day, today);
          const isCurrentMonth = isSameMonth(day, anchor);

          return (
            <div key={dateStr} role="gridcell">
              <button
                onClick={() => onSelectDate(day)}
                className={[
                  'relative flex flex-col items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all text-sm',
                  isSelected
                    ? 'bg-primary text-on-primary shadow-lg shadow-primary/20 font-bold'
                    : isTodayDay
                    ? 'ring-2 ring-primary text-primary font-bold'
                    : isCurrentMonth
                    ? 'text-on-surface hover:bg-surface-container'
                    : 'text-outline/40',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-label={new Intl.DateTimeFormat(undefined, {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                }).format(day)}
                aria-pressed={isSelected}
                aria-current={isTodayDay ? 'date' : undefined}
              >
                <span>{day.getDate()}</span>
                {hasShift && (
                  <span
                    className={`absolute bottom-1 w-1 h-1 rounded-full ${
                      isSelected ? 'bg-on-primary' : 'bg-primary'
                    }`}
                    aria-hidden="true"
                  />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Shift Card (B.3) ─────────────────────────────────────────────

const ShiftCard = ({ shift, onRequestSwap }) => {
  const { t } = useTranslation('ess');
  const today = new Date();
  const shiftDate = shift.date ? new Date(shift.date.includes('T') ? shift.date : shift.date + 'T00:00:00') : null;
  const isShiftToday = shiftDate ? isSameDay(shiftDate, today) : false;

  // Status badge styles
  const statusStyle =
    shift.status === 'confirmed'
      ? 'bg-primary-container/40 text-primary'
      : shift.status === 'pending'
      ? 'bg-primary-fixed/50 text-primary'
      : 'bg-error-container/40 text-error';

  const statusLabel =
    shift.status === 'confirmed'
      ? t('mobile.schedule.statusConfirmed')
      : shift.status === 'pending'
      ? t('mobile.schedule.statusPending')
      : shift.status === 'swap_requested'
      ? t('mobile.schedule.statusSwapRequested')
      : shift.status;

  return (
    <div
      className="relative bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0_8px_24px_rgba(25,28,30,0.06)] hover:shadow-md transition-all"
      data-testid="shift-card"
    >
      {/* Left accent bar — Magenta for today, muted for future */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5 rounded-r-full"
        style={{
          background: isShiftToday
            ? 'linear-gradient(to bottom, #da336b, #8b2044)'
            : 'linear-gradient(to bottom, #cac4d0, transparent)',
        }}
        aria-hidden="true"
      />

      <div className="pl-7 p-5">
        <div className="flex items-start justify-between gap-3">
          {/* Date box */}
          {shiftDate && (
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-surface-container flex flex-col items-center justify-center text-primary shadow-sm">
              <span className="font-headline text-xl font-extrabold leading-none">
                {shiftDate.getDate()}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wide font-label opacity-70">
                {new Intl.DateTimeFormat(undefined, { month: 'short' }).format(shiftDate)}
              </span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-headline text-sm font-bold text-on-surface">
                {shift.startTime} – {shift.endTime}
              </span>
              {shift.duration && (
                <span className="text-outline text-xs font-body">· {shift.duration}</span>
              )}
              {isShiftToday && (
                <span className="px-2 py-0.5 rounded-full bg-primary-container/40 text-primary text-[10px] font-bold uppercase tracking-wide font-label">
                  {t('mobile.schedule.today')}
                </span>
              )}
            </div>
            {shift.role && (
              <p className="text-on-surface-variant text-sm mt-1 font-medium font-body">
                {shift.role}
              </p>
            )}
            {(shift.locationName ?? shift.location) && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="material-symbols-outlined text-sm text-outline" aria-hidden="true">
                  location_on
                </span>
                <p className="text-outline text-xs font-body">
                  {shift.locationName ?? shift.location}
                </p>
              </div>
            )}
          </div>

          {shift.status && (
            <span
              className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide font-label ${statusStyle}`}
            >
              {statusLabel}
            </span>
          )}
        </div>

        {/* Request Swap CTA */}
        <button
          onClick={() => onRequestSwap?.(shift)}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl font-bold text-xs font-label tracking-wide hover:opacity-90 active:scale-[0.97] transition-all"
          aria-label={`${t('mobile.schedule.requestSwap')} — ${shift.startTime} ${shiftDate ? format(shiftDate, 'd MMM') : ''}`}
        >
          <span className="material-symbols-outlined text-sm" aria-hidden="true">
            swap_horiz
          </span>
          {t('mobile.schedule.requestSwap')}
        </button>
      </div>
    </div>
  );
};

// ── Shift List (B.2) ─────────────────────────────────────────────

const ShiftList = ({ shifts, selectedDate, onRequestSwap }) => {
  const { t } = useTranslation('ess');
  const dayShifts = shifts.filter((s) => {
    if (!s.date) return false;
    const shiftDate = new Date(s.date.includes('T') ? s.date : s.date + 'T00:00:00');
    return isSameDay(shiftDate, selectedDate);
  });

  return (
    <div className="px-6 mt-6" data-testid="shift-list">
      {/* Date heading + count */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline text-base font-bold text-on-surface">
          {new Intl.DateTimeFormat(undefined, {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          }).format(selectedDate)}
        </h3>
        <span className="text-primary font-bold text-xs uppercase tracking-widest font-label">
          {dayShifts.length}{' '}
          {dayShifts.length === 1 ? t('mobile.schedule.shiftSingular') : t('mobile.schedule.shiftPlural')}
        </span>
      </div>

      {/* Empty state */}
      {dayShifts.length === 0 ? (
        <div
          className="bg-surface-container-lowest rounded-2xl text-center py-10 shadow-[0_8px_24px_rgba(25,28,30,0.06)]"
          data-testid="shift-list-empty"
        >
          <span
            className="material-symbols-outlined text-4xl text-outline mb-2 block"
            aria-hidden="true"
          >
            event_available
          </span>
          <p className="text-on-surface-variant font-medium font-body">
            {t('mobile.schedule.noShifts')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {dayShifts.map((shift) => (
            <ShiftCard key={shift.id ?? `${shift.date}-${shift.startTime}`} shift={shift} onRequestSwap={onRequestSwap} />
          ))}
        </div>
      )}
    </div>
  );
};

// ── Skeleton ─────────────────────────────────────────────────────

const MobileScheduleSkeleton = () => (
  <div className="animate-pulse px-6 pt-6 space-y-4" data-testid="schedule-skeleton">
    {/* Header */}
    <div>
      <div className="h-2.5 w-36 bg-zinc-200 rounded mb-2" />
      <div className="h-9 w-48 bg-zinc-200 rounded" />
    </div>
    {/* Calendar */}
    <div className="h-72 rounded-2xl bg-zinc-200" />
    {/* Shift cards */}
    <div className="h-5 w-40 bg-zinc-200 rounded" />
    <div className="h-36 rounded-2xl bg-zinc-200" />
    <div className="h-36 rounded-2xl bg-zinc-200" />
  </div>
);

// ── Page Assembly (C.1) ──────────────────────────────────────────

// ── BottomSheet (shared) ──────────────────────────────────────────

const BottomSheet = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50" data-testid="swap-sheet">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-label={title}
        className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-3xl max-h-[90dvh] flex flex-col">
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-9 h-1.5 rounded-full bg-outline-variant" aria-hidden="true" />
        </div>
        <div className="flex items-center justify-between px-6 pb-4 pt-1 border-b border-outline-variant/30 flex-shrink-0">
          <h2 className="font-headline text-lg font-bold text-on-surface">{title}</h2>
          <button onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-container hover:bg-surface-container-high transition-colors"
            aria-label="Close">
            <span className="material-symbols-outlined text-xl text-on-surface-variant" aria-hidden="true">close</span>
          </button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

// ── ShiftMiniCard ─────────────────────────────────────────────────

const ShiftMiniCard = ({ shift, label }) => {
  const shiftDate = shift?.date ? new Date(shift.date.includes?.('T') ? shift.date : shift.date + 'T00:00:00') : null;
  return (
    <div className="bg-surface-container-low rounded-xl px-4 py-3 flex items-center gap-3" data-testid="shift-mini-card">
      <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center flex-shrink-0">
        <span className="material-symbols-outlined text-primary text-lg" aria-hidden="true">event</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs text-on-surface-variant font-label">{label}</p>
        <p className="text-sm font-bold text-on-surface font-body">
          {shiftDate ? format(shiftDate, 'EEE d MMM') : shift?.date} · {shift?.startTime}–{shift?.endTime}
        </p>
        {(shift?.locationName ?? shift?.location) && (
          <p className="text-xs text-on-surface-variant font-body">{shift.locationName ?? shift.location}</p>
        )}
      </div>
    </div>
  );
};

// ── SwapRequestSheet ──────────────────────────────────────────────

const SwapRequestSheet = ({ isOpen, onClose, shift, myShifts }) => {
  const { t } = useTranslation('ess');
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedColleague, setSelectedColleague] = useState(null);
  const [selectedColleagueShift, setSelectedColleagueShift] = useState(null);
  const [search, setSearch] = useState('');
  const [reason, setReason] = useState('');
  const [toast, setToast] = useState(null);

  const { data: colleaguesRes, isLoading: collLoading } = useColleagues();
  const colleagues = colleaguesRes?.data ?? colleaguesRes ?? [];

  // Determine month to fetch for colleague schedule
  const colleagueMonth = shift?.date ? shift.date.substring(0, 7) : format(new Date(), 'yyyy-MM');
  const { data: scheduleRes, isLoading: schedLoading } = useColleagueSchedule(
    selectedColleague?.id, colleagueMonth
  );
  const colleagueShifts = scheduleRes?.data?.shifts ?? scheduleRes?.shifts ?? scheduleRes?.data ?? [];

  const submitSwap = useSubmitSwapRequest();

  // Filter colleagues by search
  const filteredColleagues = useMemo(() => {
    const q = search.toLowerCase().trim();
    const list = q
      ? colleagues.filter(c => (c.firstName + ' ' + c.lastName).toLowerCase().includes(q))
      : colleagues;
    // Sort same-department first
    const myDept = shift?.departmentId;
    return [...list].sort((a, b) => {
      const aDept = a.departmentId === myDept ? 0 : 1;
      const bDept = b.departmentId === myDept ? 0 : 1;
      return aDept - bDept;
    });
  }, [colleagues, search, shift?.departmentId]);

  // Filter colleague shifts — exclude those that overlap with my shifts
  const availableColleagueShifts = useMemo(() => {
    if (!colleagueShifts?.length) return [];
    const myDates = new Set((myShifts ?? []).map(s => s.date));
    return colleagueShifts.filter(cs => {
      const dateStr = typeof cs.date === 'string' ? cs.date.split('T')[0] : cs.date;
      return !myDates.has(dateStr);
    });
  }, [colleagueShifts, myShifts]);

  const conflictShiftDates = useMemo(() => {
    const myDates = new Set((myShifts ?? []).map(s => s.date));
    return new Set((colleagueShifts ?? []).filter(cs => {
      const dateStr = typeof cs.date === 'string' ? cs.date.split('T')[0] : cs.date;
      return myDates.has(dateStr);
    }).map(cs => cs.id));
  }, [colleagueShifts, myShifts]);

  const handleSelectColleague = useCallback((colleague) => {
    setSelectedColleague(colleague);
    setSelectedColleagueShift(null);
    setStep(2);
  }, []);

  const handleBack = useCallback(() => {
    setStep(1);
    setSelectedColleague(null);
    setSelectedColleagueShift(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!shift?.id || !selectedColleague?.id || !selectedColleagueShift?.id) return;
    try {
      await submitSwap.mutateAsync({
        requesterShiftId: shift.id,
        recipientId: selectedColleague.id,
        recipientShiftId: selectedColleagueShift.id,
        reason: reason || '',
      });
      setToast({ type: 'success', message: t('swap.submitSuccess') });
      setTimeout(() => {
        setToast(null);
        onClose();
        setStep(1);
        setSelectedColleague(null);
        setSelectedColleagueShift(null);
        setReason('');
        navigate('/app/ess/requests?tab=swap');
      }, 1200);
    } catch (err) {
      const msg = err?.status === 409
        ? (err.message ?? 'Conflict — swap already exists')
        : (err.message ?? 'Something went wrong');
      setToast({ type: 'error', message: msg });
      setTimeout(() => setToast(null), 3000);
    }
  }, [shift, selectedColleague, selectedColleagueShift, reason, submitSwap, onClose, navigate, t]);

  const handleClose = useCallback(() => {
    setStep(1); setSelectedColleague(null); setSelectedColleagueShift(null);
    setSearch(''); setReason(''); setToast(null); onClose();
  }, [onClose]);

  if (!shift) return null;

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title={t('swap.title')}>
      <div className="px-6 pt-4 pb-10 space-y-5" data-testid="swap-request-sheet">

        {/* Toast */}
        {toast && (
          <div className={`rounded-xl px-4 py-3 text-sm font-body flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-primary-container/40 text-primary' : 'bg-error-container/40 text-error'
          }`} role="status" data-testid="swap-toast">
            <span className="material-symbols-outlined text-lg" aria-hidden="true">
              {toast.type === 'success' ? 'check_circle' : 'error'}
            </span>
            {toast.message}
          </div>
        )}

        {/* Your shift summary */}
        <ShiftMiniCard shift={shift} label={t('swap.yourShift')} />

        {/* ── Step 1: Colleague Picker ── */}
        {step === 1 && (
          <div data-testid="swap-step-1">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3 font-label">
              {t('swap.step1')}
            </p>

            {/* Search */}
            <div className="relative mb-4">
              <span className="material-symbols-outlined text-lg text-outline absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true">search</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('swap.searchColleague')}
                className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest rounded-xl outline-none border-b-2 border-transparent focus:border-primary transition-all text-on-surface font-body text-sm"
                data-testid="colleague-search"
              />
            </div>

            {/* Colleague list */}
            {collLoading ? (
              <div className="space-y-3 animate-pulse">
                {[0, 1, 2].map(i => <div key={i} className="h-16 bg-surface-variant rounded-xl" />)}
              </div>
            ) : (
              <div className="space-y-2 max-h-[40vh] overflow-y-auto" role="listbox" aria-label={t('swap.step1')}>
                {filteredColleagues.map(c => (
                  <button
                    key={c.id}
                    role="option"
                    aria-selected={false}
                    onClick={() => handleSelectColleague(c)}
                    className="w-full flex items-center gap-3 p-3 bg-surface-container-lowest rounded-xl hover:bg-surface-container-high transition-all text-left"
                    data-testid="colleague-row"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-primary text-lg" aria-hidden="true">person</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-on-surface font-body truncate">{c.firstName} {c.lastName}</p>
                      <p className="text-xs text-on-surface-variant font-body">
                        {c.departmentName ?? c.department ?? ''}
                        {c.weekShiftCount != null && ` · ${t('swap.shiftsThisWeek', { count: c.weekShiftCount })}`}
                      </p>
                    </div>
                  </button>
                ))}
                {filteredColleagues.length === 0 && !collLoading && (
                  <p className="text-center text-on-surface-variant text-sm font-body py-6">{t('swap.noColleagueShifts')}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Step 2: Shift Picker ── */}
        {step === 2 && selectedColleague && (
          <div data-testid="swap-step-2">
            <div className="flex items-center gap-2 mb-3">
              <button onClick={handleBack} className="w-8 h-8 rounded-full flex items-center justify-center bg-surface-container hover:bg-surface-container-high transition-colors" aria-label="Back">
                <span className="material-symbols-outlined text-lg text-on-surface-variant" aria-hidden="true">arrow_back</span>
              </button>
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">
                {t('swap.step2')}
              </p>
            </div>

            <p className="text-sm font-bold text-on-surface font-body mb-3">
              {selectedColleague.firstName} {selectedColleague.lastName}
            </p>

            {schedLoading ? (
              <div className="space-y-3 animate-pulse">
                {[0, 1, 2].map(i => <div key={i} className="h-16 bg-surface-variant rounded-xl" />)}
              </div>
            ) : colleagueShifts.length === 0 ? (
              <p className="text-center text-on-surface-variant text-sm font-body py-6" data-testid="no-colleague-shifts">
                {t('swap.noColleagueShifts')}
              </p>
            ) : (
              <div className="space-y-2 max-h-[30vh] overflow-y-auto" role="radiogroup" aria-label={t('swap.step2')}>
                {colleagueShifts.map(cs => {
                  const isConflict = conflictShiftDates.has(cs.id);
                  const isSelected = selectedColleagueShift?.id === cs.id;
                  const csDate = cs.date ? new Date(cs.date.includes?.('T') ? cs.date : cs.date + 'T00:00:00') : null;
                  return (
                    <button
                      key={cs.id}
                      role="radio"
                      aria-checked={isSelected}
                      disabled={isConflict}
                      onClick={() => !isConflict && setSelectedColleagueShift(cs)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                        isConflict
                          ? 'bg-error-container/10 opacity-50 cursor-not-allowed'
                          : isSelected
                          ? 'ring-2 ring-primary bg-primary-container/20'
                          : 'bg-surface-container-lowest hover:bg-surface-container-high'
                      }`}
                      data-testid="colleague-shift-row"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-primary text-lg" aria-hidden="true">event</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-on-surface font-body">
                          {csDate ? format(csDate, 'EEE d MMM') : cs.date} · {cs.startTime}–{cs.endTime}
                        </p>
                        {(cs.locationName ?? cs.location) && (
                          <p className="text-xs text-on-surface-variant font-body">{cs.locationName ?? cs.location}</p>
                        )}
                        {isConflict && (
                          <p className="text-xs text-error font-body mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs" aria-hidden="true">warning</span>
                            {t('swap.conflictWarning')}
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <span className="material-symbols-outlined text-primary text-xl flex-shrink-0" aria-hidden="true">check_circle</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Reason */}
            <div className="mt-4">
              <label htmlFor="swap-reason" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 block font-label">
                {t('swap.reason')}
              </label>
              <textarea
                id="swap-reason"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder={t('swap.reasonPlaceholder')}
                rows={2}
                className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl outline-none border-b-2 border-transparent focus:border-primary transition-all text-on-surface font-body text-sm resize-none"
                data-testid="swap-reason"
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!selectedColleagueShift || submitSwap.isPending}
              className="w-full mt-4 py-4 rounded-xl text-on-primary font-bold text-base font-headline flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #da336b 0%, #8b2044 100%)' }}
              data-testid="submit-swap-btn"
            >
              {submitSwap.isPending ? (
                <span className="material-symbols-outlined text-xl animate-spin" aria-hidden="true">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-xl" aria-hidden="true">swap_horiz</span>
              )}
              {t('swap.sendRequest')}
            </button>
          </div>
        )}
      </div>
    </BottomSheet>
  );
};

// ── Page (updated) ───────────────────────────────────────────────

export const MobileSchedulePage = () => {
  const { t } = useTranslation('ess');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [swapShift, setSwapShift] = useState(null);

  const { shifts, isLoading, anchor, navigatePrev, navigateNext, setViewMode } = useEssSchedule();

  // Ensure hook is in month view so it fetches the full month range
  useState(() => {
    setViewMode('month');
  });

  const handleRequestSwap = useCallback((shift) => {
    setSwapShift(shift);
  }, []);

  if (isLoading && (!shifts || shifts.length === 0)) {
    return <MobileScheduleSkeleton />;
  }

  return (
    <>
      <Helmet>
        <meta name="theme-color" content="#fff8f7" />
      </Helmet>

      <div className="pb-6 max-w-2xl mx-auto" data-testid="mobile-schedule-page">
        {/* Editorial header */}
        <div className="px-6 pt-6 pb-2">
          <span className="text-secondary font-bold text-[10px] tracking-[0.15em] uppercase block mb-1 font-label">
            {t('mobile.schedule.workforceLabel')}
          </span>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-primary">
            {t('mobile.schedule.title')}
          </h1>
        </div>

        <ScheduleCalendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          shifts={shifts ?? []}
          anchor={anchor}
          onPrev={navigatePrev}
          onNext={navigateNext}
        />

        <ShiftList shifts={shifts ?? []} selectedDate={selectedDate} onRequestSwap={handleRequestSwap} />
      </div>

      <SwapRequestSheet
        isOpen={!!swapShift}
        onClose={() => setSwapShift(null)}
        shift={swapShift}
        myShifts={shifts ?? []}
      />
    </>
  );
};

export default MobileSchedulePage;
