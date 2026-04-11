/**
 * MobileRequestsPage — Task 83 UI shell, Task 88 API wiring
 *
 * ESS Leave & Requests screen, Nexus Kinetic styled:
 * - Balance bento cards from useEssLeaveBalance() with pending portion
 * - FAB opens bottom sheet for new leave requests
 * - Live working-day preview via calculateWorkingDays()
 * - Balance warning when request exceeds available days
 * - Request list from useEssLeaveRequests() with cancel support
 * - Client-side form validation with inline errors
 *
 * Data:
 *   useEssLeaveBalance()   → GET /api/ess/requests/leave/balance
 *   useEssLeaveTypes()     → GET /api/ess/requests/leave/types
 *   useEssLeaveRequests()  → GET /api/ess/requests/leave
 *   useSubmitLeaveRequest  → POST /api/ess/requests/leave
 *   useCancelLeaveRequest  → DELETE /api/ess/requests/leave/:id
 */
import { useState, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import {
  useEssLeaveBalance,
  useEssLeaveTypes,
  useEssLeaveRequests,
  useSubmitLeaveRequest,
  useCancelLeaveRequest,
  useEssAbsenceReports,
  useReportAbsence,
  useCancelAbsenceReport,
  useUploadAbsenceCert,
  useEssSwapRequests,
  usePeerAcceptSwap,
  usePeerDeclineSwap,
  useCancelSwapRequest,
} from '../../../hooks/useEssRequests';
import { calculateWorkingDays } from '../../../utils/dateUtils';

// ── Constants ────────────────────────────────────────────────────

/** Leave type keys rendered as balance cards */
const BALANCE_KEYS = [
  { key: 'annual', icon: 'beach_access', fill: true },
  { key: 'sick',   icon: 'sick',         fill: true },
];

/** Types that require a reason */
const REASON_REQUIRED_TYPES = new Set(['annual', 'unpaid', 'personal']);
/** Types where reason field is hidden */
const REASON_HIDDEN_TYPES = new Set(['maternity', 'paternity']);

// ── Helpers ──────────────────────────────────────────────────────

/** YYYY-MM-DD for today */
const todayString = () => new Date().toISOString().split('T')[0];

/** Leave type key → icon name */
function typeIcon(leaveType) {
  const lt = (leaveType || '').toLowerCase();
  if (lt.includes('sick')) return 'sick';
  if (lt.includes('personal')) return 'person';
  if (lt.includes('unpaid')) return 'money_off';
  return 'beach_access';
}

/** API status → Tailwind colour classes */
function statusChipClass(status) {
  switch (status) {
    case 'approved':  return 'bg-primary-container/40 text-primary';
    case 'rejected':
    case 'declined':  return 'bg-error-container/40 text-error';
    case 'cancelled': return 'bg-surface-container text-outline';
    case 'submitted':
    case 'pending':
    default:          return 'bg-secondary-container/40 text-secondary';
  }
}

/** Format date range compactly, locale-aware */
function formatDateRange(startDate, endDate) {
  const fmt = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
  const start = fmt.format(new Date(startDate));
  if (!endDate || endDate === startDate) return start;
  return `${start} – ${fmt.format(new Date(endDate))}`;
}

// ── Skeleton ─────────────────────────────────────────────────────

const MobileRequestsSkeleton = () => (
  <div className="pb-6 max-w-2xl mx-auto animate-pulse" data-testid="requests-skeleton">
    <div className="px-6 pt-6">
      <div className="h-3 w-32 bg-surface-variant rounded mb-2" />
      <div className="h-10 w-48 bg-surface-variant rounded" />
    </div>
    <div className="px-6 mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      {[0, 1].map(i => <div key={i} className="h-36 bg-surface-variant rounded-2xl" />)}
    </div>
    <div className="px-6 mt-6 space-y-3">
      {[0, 1, 2].map(i => <div key={i} className="h-20 bg-surface-variant rounded-2xl" />)}
    </div>
  </div>
);

// ── LeaveBalanceCards ─────────────────────────────────────────────

const LeaveBalanceCards = ({ balanceData, t }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 mt-6" data-testid="leave-balance-cards">
    {BALANCE_KEYS.map(lt => {
      const balance = balanceData?.[lt.key];
      const used    = balance?.used ?? 0;
      const pending = balance?.pending ?? 0;
      const total   = balance?.total ?? 0;
      const available = balance?.available ?? (total - used - pending);
      const usedPct    = total > 0 ? Math.min((used / total) * 100, 100) : 0;
      const pendingPct = total > 0 ? Math.min((pending / total) * 100, 100 - usedPct) : 0;

      return (
        <div
          key={lt.key}
          className="relative overflow-hidden bg-surface-container-lowest rounded-2xl p-6 shadow-[0_8px_24px_rgba(218,51,107,0.06)] hover:shadow-md transition-all"
          data-testid={`balance-card-${lt.key}`}
        >
          {/* Decorative background icon */}
          <span
            className="material-symbols-outlined absolute -top-2 -right-2 text-8xl text-primary opacity-[0.06] select-none pointer-events-none"
            aria-hidden="true"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {lt.icon}
          </span>

          <span
            className="material-symbols-outlined text-3xl text-primary mb-3 block relative z-10"
            aria-hidden="true"
            style={lt.fill ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            {lt.icon}
          </span>

          <p className="font-headline text-sm font-bold text-on-surface relative z-10">
            {t(`mobile.leave.types.${lt.key}`)}
          </p>

          {balance ? (
            <>
              <p className="font-headline text-3xl font-extrabold text-primary mt-1 relative z-10">
                {available}{' '}
                <span className="text-base font-medium text-on-surface-variant">
                  {t('mobile.leave.daysLeft')}
                </span>
              </p>
              <p className="text-on-surface-variant text-xs mt-0.5 font-body relative z-10">
                {t('mobile.leave.daysUsedOf', { used, total })}
              </p>

              {/* Progress bar with pending portion */}
              <div className="h-1.5 rounded-full bg-surface-container mt-3 overflow-hidden relative z-10">
                <div className="h-full flex">
                  <div
                    className="h-full bg-primary transition-[width] duration-500"
                    style={{ width: `${usedPct}%` }}
                  />
                  {pendingPct > 0 && (
                    <div
                      className="h-full bg-primary/40 transition-[width] duration-500"
                      style={{ width: `${pendingPct}%` }}
                    />
                  )}
                </div>
                {/* Hidden accessible progress bar */}
                <div
                  className="sr-only"
                  role="progressbar"
                  aria-valuenow={used}
                  aria-valuemin={0}
                  aria-valuemax={total}
                  aria-label={t(`mobile.leave.types.${lt.key}`)}
                />
              </div>

              {/* Pending badge */}
              {pending > 0 && (
                <p className="text-secondary text-[11px] mt-1.5 font-body relative z-10">
                  {t('mobile.leave.pendingDays', { count: pending })}
                </p>
              )}
            </>
          ) : (
            <p className="text-on-surface-variant text-sm mt-2 font-body relative z-10">
              {t('mobile.leave.noData')}
            </p>
          )}
        </div>
      );
    })}
  </div>
);

// ── RecentRequests ────────────────────────────────────────────────

const RecentRequests = ({ requests, onCancel, isCancelling, t }) => {
  if (!requests || requests.length === 0) {
    return (
      <div
        className="bg-surface-container-lowest rounded-2xl text-center py-12 shadow-[0_8px_24px_rgba(25,28,30,0.06)]"
        data-testid="requests-empty"
      >
        <span className="material-symbols-outlined text-4xl text-outline block mb-2" aria-hidden="true">
          beach_access
        </span>
        <p className="text-on-surface-variant font-medium font-body">
          {t('mobile.leave.noRequests')}
        </p>
        <p className="text-outline text-xs mt-1 font-body">
          {t('mobile.leave.noRequestsHint')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="requests-list">
      {requests.map(req => {
        const canCancel = req.status === 'submitted' || req.status === 'pending';
        return (
          <div
            key={req.id}
            className="bg-surface-container-lowest rounded-2xl p-5 shadow-[0_4px_12px_rgba(25,28,30,0.04)] hover:shadow-md transition-all"
            data-testid="request-row"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center flex-shrink-0"
                  style={req.color ? { borderLeft: `3px solid ${req.color}` } : {}}
                >
                  <span
                    className="material-symbols-outlined text-primary text-xl"
                    aria-hidden="true"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {typeIcon(req.leaveType)}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-headline text-sm font-bold text-on-surface">
                    {req.leaveType || t('mobile.leave.types.annual')}
                  </p>
                  <p className="text-on-surface-variant text-xs mt-0.5 font-body truncate">
                    {formatDateRange(req.startDate, req.endDate)}
                    {req.totalDays && (
                      <span className="text-outline"> · {req.totalDays}d</span>
                    )}
                  </p>
                  {req.reason && (
                    <p className="text-outline text-xs mt-0.5 font-body truncate">{req.reason}</p>
                  )}
                </div>
              </div>
              <span
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide font-label flex-shrink-0 ml-3 ${statusChipClass(req.status)}`}
                data-testid="status-chip"
              >
                {t(`mobile.leave.status.${req.status}`, { defaultValue: req.status })}
              </span>
            </div>

            {/* Cancel action for submitted requests */}
            {canCancel && (
              <div className="mt-3 pt-3 border-t border-outline-variant/20 flex justify-end">
                <button
                  onClick={() => onCancel(req.id)}
                  disabled={isCancelling}
                  className="text-error text-xs font-bold uppercase tracking-wide font-label px-3 py-1.5 rounded-lg hover:bg-error-container/20 transition-colors disabled:opacity-50"
                  data-testid="cancel-request-btn"
                >
                  {t('requests.cancel', { defaultValue: 'Cancel' })}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── NexusBottomSheet ──────────────────────────────────────────────

const NexusBottomSheet = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" data-testid="leave-sheet">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-3xl max-h-[90dvh] flex flex-col"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-9 h-1.5 rounded-full bg-outline-variant" aria-hidden="true" />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4 pt-1 border-b border-outline-variant/30 flex-shrink-0">
          <h2 className="font-headline text-lg font-bold text-on-surface">{title}</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-container hover:bg-surface-container-high transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-xl text-on-surface-variant" aria-hidden="true">close</span>
          </button>
        </div>
        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

// ── NewRequestSheet ───────────────────────────────────────────────

const NewRequestSheet = ({
  isOpen,
  onClose,
  leaveTypes,
  balanceData,
  t,
}) => {
  const [leaveTypeId, setLeaveTypeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const submitLeave = useSubmitLeaveRequest();

  // Resolve selected type metadata
  const selectedType = useMemo(
    () => leaveTypes?.find(lt => String(lt.id) === String(leaveTypeId)),
    [leaveTypes, leaveTypeId]
  );
  const typeCode = selectedType?.name?.toLowerCase().replace(/\s+/g, '_') ?? '';

  // Working days preview
  const { workingDays, holidaysExcluded } = useMemo(
    () => calculateWorkingDays(startDate, endDate),
    [startDate, endDate]
  );

  // Balance warning check
  const balanceExceeded = useMemo(() => {
    if (!selectedType || !workingDays) return false;
    const name = (selectedType.name || '').toLowerCase();
    const balKey = name.includes('annual') ? 'annual' : name.includes('sick') ? 'sick' : null;
    if (!balKey || !balanceData?.[balKey]) return false;
    return workingDays > (balanceData[balKey].available ?? 0);
  }, [selectedType, workingDays, balanceData]);

  // Reason field behaviour
  const reasonHidden = REASON_HIDDEN_TYPES.has(typeCode);
  const reasonRequired = REASON_REQUIRED_TYPES.has(typeCode) ||
    (selectedType && !REASON_HIDDEN_TYPES.has(typeCode) && !['sick', 'bereavement'].includes(typeCode));

  // ── Validation ──────────────────────────────────────────

  const validate = useCallback(() => {
    const errs = {};
    if (!leaveTypeId) errs.leaveType = t('mobile.leave.validation.leaveTypeRequired');
    if (!startDate)   errs.startDate = t('mobile.leave.validation.startDateRequired');
    else if (startDate < todayString()) errs.startDate = t('mobile.leave.validation.startDateFuture');
    if (!endDate)     errs.endDate = t('mobile.leave.validation.endDateRequired');
    else if (startDate && endDate < startDate) errs.endDate = t('mobile.leave.validation.endDateAfterStart');
    if (reasonRequired && !reason.trim()) errs.reason = t('mobile.leave.validation.reasonRequired');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [leaveTypeId, startDate, endDate, reason, reasonRequired, t]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const result = await submitLeave.mutateAsync({
        leaveTypeId: Number(leaveTypeId),
        startDate,
        endDate,
        reason: reasonHidden ? undefined : reason,
      });

      if (result?.balanceWarning) {
        setToast({ type: 'warning', message: t('requests.balanceWarning') });
      } else {
        setToast({ type: 'success', message: t('mobile.leave.submitSuccess') });
      }

      // Reset form
      setLeaveTypeId('');
      setStartDate('');
      setEndDate('');
      setReason('');
      setErrors({});

      setTimeout(() => {
        setToast(null);
        onClose();
      }, 1500);
    } catch (err) {
      setToast({ type: 'error', message: err.message ?? t('errors.generic', { defaultValue: 'Something went wrong' }) });
      setTimeout(() => setToast(null), 3000);
    }
  }, [leaveTypeId, startDate, endDate, reason, reasonHidden, validate, submitLeave, onClose, t]);

  const handleClose = useCallback(() => {
    setErrors({});
    setToast(null);
    onClose();
  }, [onClose]);

  return (
    <NexusBottomSheet isOpen={isOpen} onClose={handleClose} title={t('mobile.leave.newRequest')}>
      <form onSubmit={handleSubmit} className="space-y-5 px-6 pt-4 pb-10" data-testid="new-request-form" noValidate>

        {/* Toast */}
        {toast && (
          <div
            className={`rounded-xl px-4 py-3 text-sm font-body flex items-center gap-2 ${
              toast.type === 'success' ? 'bg-primary-container/40 text-primary' :
              toast.type === 'warning' ? 'bg-amber-50 border border-amber-200 text-amber-800' :
              'bg-error-container/40 text-error'
            }`}
            role="status"
            data-testid="form-toast"
          >
            <span className="material-symbols-outlined text-lg" aria-hidden="true">
              {toast.type === 'success' ? 'check_circle' : toast.type === 'warning' ? 'warning' : 'error'}
            </span>
            {toast.message}
          </div>
        )}

        {/* Leave type selector */}
        <div>
          <label
            htmlFor="leave-type-select"
            className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 block font-label"
          >
            {t('mobile.leave.leaveType')}
          </label>
          <div className="flex flex-wrap gap-2" role="group" aria-label={t('mobile.leave.leaveType')}>
            {leaveTypes?.map(lt => (
              <button
                key={lt.id}
                type="button"
                onClick={() => setLeaveTypeId(String(lt.id))}
                aria-pressed={String(lt.id) === String(leaveTypeId)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide font-label transition-all ${
                  String(lt.id) === String(leaveTypeId)
                    ? 'text-on-primary shadow-lg shadow-primary/20'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
                style={String(lt.id) === String(leaveTypeId) ? {
                  background: lt.color ? `linear-gradient(135deg, ${lt.color} 0%, ${lt.color}cc 100%)` : 'linear-gradient(135deg, #da336b 0%, #8b2044 100%)',
                } : {}}
                data-testid={`leave-type-${lt.id}`}
              >
                {lt.name}
              </button>
            ))}
          </div>
          {errors.leaveType && (
            <p className="text-error text-xs mt-1 font-body" role="alert">{errors.leaveType}</p>
          )}
        </div>

        {/* Date range */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="leave-start-date"
              className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 block font-label"
            >
              {t('mobile.leave.startDate')}
            </label>
            <input
              id="leave-start-date"
              type="date"
              value={startDate}
              min={todayString()}
              onChange={e => { setStartDate(e.target.value); setErrors(prev => ({ ...prev, startDate: undefined })); }}
              className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl outline-none border-b-2 border-transparent focus:border-primary transition-all text-on-surface font-body text-base"
              data-testid="start-date-input"
            />
            {errors.startDate && (
              <p className="text-error text-xs mt-1 font-body" role="alert">{errors.startDate}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="leave-end-date"
              className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 block font-label"
            >
              {t('mobile.leave.endDate')}
            </label>
            <input
              id="leave-end-date"
              type="date"
              value={endDate}
              min={startDate || todayString()}
              onChange={e => { setEndDate(e.target.value); setErrors(prev => ({ ...prev, endDate: undefined })); }}
              className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl outline-none border-b-2 border-transparent focus:border-primary transition-all text-on-surface font-body text-base"
              data-testid="end-date-input"
            />
            {errors.endDate && (
              <p className="text-error text-xs mt-1 font-body" role="alert">{errors.endDate}</p>
            )}
          </div>
        </div>

        {/* Working days preview */}
        {startDate && endDate && endDate >= startDate && (
          <p className="text-on-surface-variant text-sm font-body flex items-center gap-1" data-testid="working-days-preview">
            <span className="material-symbols-outlined text-base text-primary" aria-hidden="true">event</span>
            {t('mobile.leave.workingDays', { count: workingDays })}
            {holidaysExcluded > 0 && (
              <span className="text-outline"> · {t('mobile.leave.holidaysExcluded', { count: holidaysExcluded })}</span>
            )}
          </p>
        )}

        {/* Balance warning */}
        {balanceExceeded && (
          <div
            className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-800 text-sm font-body flex items-center gap-2"
            role="status"
            data-testid="balance-warning"
          >
            <span className="material-symbols-outlined text-lg" aria-hidden="true">warning</span>
            {t('requests.balanceWarning')}
          </div>
        )}

        {/* Reason */}
        {!reasonHidden && (
          <div>
            <label
              htmlFor="leave-reason"
              className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 block font-label"
            >
              {t('mobile.leave.reason')}
              {!reasonRequired && (
                <span className="text-outline font-normal normal-case tracking-normal ml-1">
                  ({t('requests.reasonOptional', { defaultValue: 'optional' })})
                </span>
              )}
            </label>
            <textarea
              id="leave-reason"
              value={reason}
              onChange={e => { setReason(e.target.value); setErrors(prev => ({ ...prev, reason: undefined })); }}
              placeholder={t('mobile.leave.reasonPlaceholder')}
              className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl outline-none border-b-2 border-transparent focus:border-primary transition-all text-on-surface font-body text-base min-h-[80px] resize-none"
              data-testid="reason-input"
            />
            {errors.reason && (
              <p className="text-error text-xs mt-1 font-body" role="alert">{errors.reason}</p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={submitLeave.isPending}
          className="w-full py-4 rounded-xl text-on-primary font-bold text-base font-headline flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #da336b 0%, #8b2044 100%)' }}
          data-testid="submit-request-btn"
        >
          {submitLeave.isPending ? (
            <span className="material-symbols-outlined text-xl animate-spin" aria-hidden="true">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined text-xl" aria-hidden="true">send</span>
          )}
          {t('mobile.leave.submitRequest')}
        </button>
      </form>
    </NexusBottomSheet>
  );
};

// ── Page ──────────────────────────────────────────────────────────

/** Sub-tab definitions */
const REQUEST_TABS = [
  { key: 'leave',   icon: 'beach_access' },
  { key: 'absence', icon: 'sick' },
  { key: 'swap',    icon: 'swap_horiz' },
];

/** Absence type → icon mapping */
const ABSENCE_TYPE_ICONS = {
  sick: 'sick',
  late_arrival: 'schedule',
  emergency: 'emergency',
  personal: 'person',
  other: 'help',
};

/** Absence status → Tailwind colour classes */
function absenceStatusChipClass(status) {
  switch (status) {
    case 'acknowledged': return 'bg-primary-container/40 text-primary';
    case 'disputed':     return 'bg-error-container/40 text-error';
    case 'cancelled':    return 'bg-surface-container text-outline';
    case 'reported':
    default:             return 'bg-secondary-container/40 text-secondary';
  }
}

// ── AbsenceList ───────────────────────────────────────────────────

const AbsenceList = ({ absences, onCancel, isCancelling, onUploadCert, t }) => {
  if (!absences || absences.length === 0) {
    return (
      <div
        className="bg-surface-container-lowest rounded-2xl text-center py-12 shadow-[0_8px_24px_rgba(25,28,30,0.06)]"
        data-testid="absences-empty"
      >
        <span className="material-symbols-outlined text-4xl text-outline block mb-2" aria-hidden="true">sick</span>
        <p className="text-on-surface-variant font-medium font-body">{t('mobile.absence.noAbsences')}</p>
        <p className="text-outline text-xs mt-1 font-body">{t('mobile.absence.noAbsencesHint')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="absences-list">
      {absences.map(ab => {
        const canCancel = ab.status === 'reported' && ab.absenceDate === todayString();
        const icon = ABSENCE_TYPE_ICONS[ab.absenceType] || 'help';
        const needsCert = ab.certRequired && !ab.certUploaded;
        const hasCert   = ab.certRequired && ab.certUploaded;

        return (
          <div
            key={ab.id}
            className="bg-surface-container-lowest rounded-2xl p-5 shadow-[0_4px_12px_rgba(25,28,30,0.04)] hover:shadow-md transition-all"
            data-testid="absence-row"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-xl" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {icon}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-headline text-sm font-bold text-on-surface">
                    {t(`mobile.absence.type.${ab.absenceType}`, { defaultValue: ab.absenceType })}
                  </p>
                  <p className="text-on-surface-variant text-xs mt-0.5 font-body">
                    {new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(ab.absenceDate))}
                  </p>
                  {ab.reason && (
                    <p className="text-outline text-xs mt-0.5 font-body truncate">{ab.reason}</p>
                  )}
                </div>
              </div>
              <span
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide font-label flex-shrink-0 ml-3 ${absenceStatusChipClass(ab.status)}`}
                data-testid="absence-status-chip"
              >
                {t(`mobile.absence.status.${ab.status}`, { defaultValue: ab.status })}
              </span>
            </div>

            {/* Certificate required badge */}
            {needsCert && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mt-3 flex items-center justify-between" data-testid="cert-required-badge">
                <div>
                  <p className="text-red-800 text-sm font-bold font-body">{t('mobile.absence.certRequired')}</p>
                  <p className="text-red-600 text-xs font-body">{t('mobile.absence.certUploadHint')}</p>
                </div>
                <button
                  onClick={() => onUploadCert(ab.id)}
                  className="px-4 py-2 rounded-lg text-xs font-bold font-label text-on-primary"
                  style={{ background: 'linear-gradient(135deg, #da336b 0%, #8b2044 100%)' }}
                  aria-label={t('mobile.absence.upload')}
                  data-testid="cert-upload-btn"
                >
                  {t('mobile.absence.upload')}
                </button>
              </div>
            )}

            {/* Certificate uploaded badge */}
            {hasCert && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mt-3 flex items-center gap-2" data-testid="cert-uploaded-badge">
                <span className="material-symbols-outlined text-green-700 text-lg" aria-hidden="true">check_circle</span>
                <p className="text-green-800 text-sm font-bold font-body">{t('mobile.absence.certUploaded')}</p>
              </div>
            )}

            {/* Cancel action */}
            {canCancel && (
              <div className="mt-3 pt-3 border-t border-outline-variant/20 flex justify-end">
                <button
                  onClick={() => onCancel(ab.id)}
                  disabled={isCancelling}
                  className="text-error text-xs font-bold uppercase tracking-wide font-label px-3 py-1.5 rounded-lg hover:bg-error-container/20 transition-colors disabled:opacity-50"
                  data-testid="cancel-absence-btn"
                >
                  {t('mobile.absence.cancel')}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── ReportAbsenceSheet ────────────────────────────────────────────

const ABSENCE_TYPES = ['sick', 'late_arrival', 'emergency', 'personal', 'other'];

const ReportAbsenceSheet = ({ isOpen, onClose, t }) => {
  const [absenceDate, setAbsenceDate] = useState(todayString());
  const [absenceType, setAbsenceType] = useState('');
  const [expectedStart, setExpectedStart] = useState('');
  const [actualArrival, setActualArrival] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const reportAbsence = useReportAbsence();

  const reasonRequired = absenceType === 'other';
  const showTimePickers = absenceType === 'late_arrival';

  const validate = useCallback(() => {
    const errs = {};
    if (!absenceDate) errs.absenceDate = t('mobile.absence.validation.dateRequired');
    else if (absenceDate > todayString()) errs.absenceDate = t('mobile.absence.validation.dateFuture');
    if (!absenceType) errs.absenceType = t('mobile.absence.validation.typeRequired');
    if (showTimePickers) {
      if (!expectedStart) errs.expectedStart = t('mobile.absence.validation.expectedStartRequired');
      if (!actualArrival) errs.actualArrival = t('mobile.absence.validation.actualArrivalRequired');
      else if (expectedStart && actualArrival <= expectedStart) errs.actualArrival = t('mobile.absence.validation.actualAfterExpected');
    }
    if (reasonRequired && !reason.trim()) errs.reason = t('mobile.absence.validation.reasonRequired');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [absenceDate, absenceType, expectedStart, actualArrival, reason, reasonRequired, showTimePickers, t]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const body = { absenceDate, absenceType, reason: reason || undefined };
    if (showTimePickers) {
      body.expectedStart = expectedStart;
      body.actualArrival = actualArrival;
    }

    try {
      const result = await reportAbsence.mutateAsync(body);

      if (result?.certRequired) {
        setToast({ type: 'warning', message: t('mobile.absence.certRequiredToast') });
      } else {
        setToast({ type: 'success', message: t('mobile.absence.submitSuccess') });
      }

      setAbsenceDate(todayString());
      setAbsenceType('');
      setExpectedStart('');
      setActualArrival('');
      setReason('');
      setErrors({});

      setTimeout(() => { setToast(null); onClose(); }, 1500);
    } catch (err) {
      const msg = err?.status === 409
        ? t('mobile.absence.duplicateDate')
        : (err.message ?? t('errors.generic', { defaultValue: 'Something went wrong' }));
      setToast({ type: 'error', message: msg });
      setTimeout(() => setToast(null), 3000);
    }
  }, [absenceDate, absenceType, expectedStart, actualArrival, reason, showTimePickers, validate, reportAbsence, onClose, t]);

  const handleClose = useCallback(() => { setErrors({}); setToast(null); onClose(); }, [onClose]);

  return (
    <NexusBottomSheet isOpen={isOpen} onClose={handleClose} title={t('mobile.absence.title')}>
      <form onSubmit={handleSubmit} className="space-y-5 px-6 pt-4 pb-10" data-testid="report-absence-form" noValidate>

        {/* Toast */}
        {toast && (
          <div
            className={`rounded-xl px-4 py-3 text-sm font-body flex items-center gap-2 ${
              toast.type === 'success' ? 'bg-primary-container/40 text-primary' :
              toast.type === 'warning' ? 'bg-amber-50 border border-amber-200 text-amber-800' :
              'bg-error-container/40 text-error'
            }`}
            role="status"
            data-testid="absence-form-toast"
          >
            <span className="material-symbols-outlined text-lg" aria-hidden="true">
              {toast.type === 'success' ? 'check_circle' : toast.type === 'warning' ? 'warning' : 'error'}
            </span>
            {toast.message}
          </div>
        )}

        {/* Absence date */}
        <div>
          <label htmlFor="absence-date" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 block font-label">
            {t('mobile.absence.dateLabel')}
          </label>
          <input
            id="absence-date"
            type="date"
            value={absenceDate}
            max={todayString()}
            onChange={e => { setAbsenceDate(e.target.value); setErrors(prev => ({ ...prev, absenceDate: undefined })); }}
            className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl outline-none border-b-2 border-transparent focus:border-primary transition-all text-on-surface font-body text-base"
            data-testid="absence-date-input"
          />
          {errors.absenceDate && <p className="text-error text-xs mt-1 font-body" role="alert">{errors.absenceDate}</p>}
        </div>

        {/* Absence type selector */}
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 block font-label">
            {t('mobile.absence.typeLabel')}
          </label>
          <div className="flex flex-wrap gap-2" role="group" aria-label={t('mobile.absence.typeLabel')}>
            {ABSENCE_TYPES.map(at => (
              <button
                key={at}
                type="button"
                onClick={() => { setAbsenceType(at); setErrors(prev => ({ ...prev, absenceType: undefined })); }}
                aria-pressed={absenceType === at}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide font-label transition-all flex items-center gap-1.5 ${
                  absenceType === at
                    ? 'text-on-primary shadow-lg shadow-primary/20'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
                style={absenceType === at ? { background: 'linear-gradient(135deg, #da336b 0%, #8b2044 100%)' } : {}}
                data-testid={`absence-type-${at}`}
              >
                <span className="material-symbols-outlined text-sm" aria-hidden="true">{ABSENCE_TYPE_ICONS[at]}</span>
                {t(`mobile.absence.type.${at}`)}
              </button>
            ))}
          </div>
          {errors.absenceType && <p className="text-error text-xs mt-1 font-body" role="alert">{errors.absenceType}</p>}
        </div>

        {/* Late arrival time pickers */}
        {showTimePickers && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="expected-start" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 block font-label">
                {t('mobile.absence.expectedStart')}
              </label>
              <input
                id="expected-start"
                type="time"
                value={expectedStart}
                onChange={e => { setExpectedStart(e.target.value); setErrors(prev => ({ ...prev, expectedStart: undefined })); }}
                className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl outline-none border-b-2 border-transparent focus:border-primary transition-all text-on-surface font-body text-base"
                data-testid="expected-start-input"
              />
              {errors.expectedStart && <p className="text-error text-xs mt-1 font-body" role="alert">{errors.expectedStart}</p>}
            </div>
            <div>
              <label htmlFor="actual-arrival" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 block font-label">
                {t('mobile.absence.actualArrival')}
              </label>
              <input
                id="actual-arrival"
                type="time"
                value={actualArrival}
                onChange={e => { setActualArrival(e.target.value); setErrors(prev => ({ ...prev, actualArrival: undefined })); }}
                className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl outline-none border-b-2 border-transparent focus:border-primary transition-all text-on-surface font-body text-base"
                data-testid="actual-arrival-input"
              />
              {errors.actualArrival && <p className="text-error text-xs mt-1 font-body" role="alert">{errors.actualArrival}</p>}
            </div>
          </div>
        )}

        {/* Reason */}
        <div>
          <label htmlFor="absence-reason" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 block font-label">
            {t('mobile.absence.reason')}
            {!reasonRequired && <span className="text-outline font-normal normal-case tracking-normal ml-1">({t('requests.reasonOptional', { defaultValue: 'optional' })})</span>}
          </label>
          <textarea
            id="absence-reason"
            value={reason}
            onChange={e => { setReason(e.target.value); setErrors(prev => ({ ...prev, reason: undefined })); }}
            placeholder={t('mobile.absence.reasonPlaceholder')}
            rows={3}
            className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl outline-none border-b-2 border-transparent focus:border-primary transition-all text-on-surface font-body text-base resize-none"
            data-testid="absence-reason-input"
          />
          {errors.reason && <p className="text-error text-xs mt-1 font-body" role="alert">{errors.reason}</p>}
        </div>

        <button
          type="submit"
          disabled={reportAbsence.isPending}
          className="w-full py-4 rounded-xl text-on-primary font-bold text-base font-headline flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #da336b 0%, #8b2044 100%)' }}
          data-testid="submit-absence-btn"
        >
          {reportAbsence.isPending ? (
            <span className="material-symbols-outlined text-xl animate-spin" aria-hidden="true">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined text-xl" aria-hidden="true">send</span>
          )}
          {t('mobile.absence.submitReport')}
        </button>
      </form>
    </NexusBottomSheet>
  );
};

// ── AbsenceTab ────────────────────────────────────────────────────

const AbsenceTab = ({ t }) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const fileInputRef = useRef(null);
  const [uploadTargetId, setUploadTargetId] = useState(null);

  const { data: absencesRes, isLoading } = useEssAbsenceReports();
  const cancelAbsence = useCancelAbsenceReport();
  const uploadCert = useUploadAbsenceCert();

  const absences = absencesRes?.data ?? absencesRes ?? [];
  const sortedAbsences = useMemo(
    () => [...absences].sort((a, b) => (b.absenceDate || '').localeCompare(a.absenceDate || '')),
    [absences]
  );

  const handleCancel = useCallback((id) => {
    cancelAbsence.mutate(id);
  }, [cancelAbsence]);

  const handleUploadCert = useCallback((id) => {
    setUploadTargetId(id);
    fileInputRef.current?.click();
  }, []);

  const handleFileSelected = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTargetId) return;
    // Validate file size and type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) return;
    if (file.size > 5 * 1024 * 1024) return; // 5 MB max
    uploadCert.mutate({ id: uploadTargetId, file });
    setUploadTargetId(null);
    e.target.value = '';
  }, [uploadTargetId, uploadCert]);

  if (isLoading) {
    return (
      <div className="px-6 mt-4 space-y-3 animate-pulse" data-testid="absences-skeleton">
        {[0, 1, 2].map(i => <div key={i} className="h-24 bg-surface-variant rounded-2xl" />)}
      </div>
    );
  }

  return (
    <>
      <div className="mt-4 px-6">
        <AbsenceList
          absences={sortedAbsences}
          onCancel={handleCancel}
          isCancelling={cancelAbsence.isPending}
          onUploadCert={handleUploadCert}
          t={t}
        />
      </div>

      {/* Hidden file input for cert upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={handleFileSelected}
        data-testid="cert-file-input"
      />

      {/* Report absence FAB */}
      <button
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-24 right-6 text-on-primary p-4 rounded-full shadow-2xl flex items-center gap-3 font-bold text-sm font-label hover:opacity-90 active:scale-[0.97] transition-all"
        style={{ background: 'linear-gradient(135deg, #da336b 0%, #8b2044 100%)' }}
        aria-label={t('mobile.absence.newReportAriaLabel')}
        data-testid="report-absence-fab"
      >
        <span className="material-symbols-outlined text-xl" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
        <span className="hidden md:inline">{t('mobile.absence.title')}</span>
      </button>

      <ReportAbsenceSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        t={t}
      />
    </>
  );
};

// ── LeaveTab ──────────────────────────────────────────────────────

const LeaveTab = ({ t }) => {
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data: balanceRes, isLoading: balLoading } = useEssLeaveBalance();
  const { data: typesRes } = useEssLeaveTypes();
  const { data: requestsRes, isLoading: reqLoading } = useEssLeaveRequests();
  const cancelLeave = useCancelLeaveRequest();

  const balanceData = balanceRes?.data ?? balanceRes ?? null;
  const leaveTypes  = typesRes?.data ?? typesRes ?? [];
  const requests    = requestsRes?.data ?? requestsRes ?? [];

  const sortedRequests = useMemo(
    () => [...requests].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')),
    [requests]
  );

  const handleCancel = useCallback((requestId) => {
    if (window.confirm(t('requests.cancelConfirm'))) {
      cancelLeave.mutate(requestId);
    }
  }, [cancelLeave, t]);

  if (balLoading || reqLoading) {
    return (
      <div className="px-6 mt-4 animate-pulse" data-testid="leave-skeleton">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1].map(i => <div key={i} className="h-36 bg-surface-variant rounded-2xl" />)}
        </div>
        <div className="mt-4 space-y-3">
          {[0, 1, 2].map(i => <div key={i} className="h-20 bg-surface-variant rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Balance cards */}
      <LeaveBalanceCards balanceData={balanceData} t={t} />

      {/* Recent requests */}
      <div className="mt-6 px-6">
        <h2 className="font-headline text-lg font-bold text-on-surface mb-3">
          {t('mobile.leave.recentRequests')}
        </h2>
        <RecentRequests
          requests={sortedRequests}
          onCancel={handleCancel}
          isCancelling={cancelLeave.isPending}
          t={t}
        />
      </div>

      {/* FAB */}
      <button
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-24 right-6 text-on-primary p-4 rounded-full shadow-2xl flex items-center gap-3 font-bold text-sm font-label hover:opacity-90 active:scale-[0.97] transition-all"
        style={{ background: 'linear-gradient(135deg, #da336b 0%, #8b2044 100%)' }}
        aria-label={t('mobile.leave.newRequestAriaLabel')}
        data-testid="new-request-fab"
      >
        <span className="material-symbols-outlined text-xl" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
        <span className="hidden md:inline">{t('mobile.leave.newRequest')}</span>
      </button>

      <NewRequestSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        leaveTypes={leaveTypes}
        balanceData={balanceData}
        t={t}
      />
    </>
  );
};

// ── SwapTab ───────────────────────────────────────────────────────

/** Swap status → Tailwind chip class */
function swapStatusChipClass(status) {
  switch (status) {
    case 'pending_peer':    return 'bg-secondary-container/40 text-secondary';
    case 'pending_manager': return 'bg-primary-container/40 text-primary';
    case 'approved':        return 'bg-primary-container/40 text-primary';
    case 'rejected':        return 'bg-error-container/40 text-error';
    case 'peer_declined':
    case 'cancelled':
    default:                return 'bg-surface-container text-outline';
  }
}

/** Mini card for showing a shift inside a swap card */
const SwapShiftMini = ({ shift, label }) => {
  const dateStr = shift?.date;
  const d = dateStr ? new Date(dateStr.includes?.('T') ? dateStr : dateStr + 'T00:00:00') : null;
  return (
    <div className="bg-surface-container-low rounded-xl px-4 py-3 flex items-center gap-3" data-testid="swap-shift-mini">
      <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center flex-shrink-0">
        <span className="material-symbols-outlined text-primary text-lg" aria-hidden="true">event</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs text-on-surface-variant font-label">{label}</p>
        <p className="text-sm font-bold text-on-surface font-body">
          {d ? new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short' }).format(d) : dateStr}
          {' · '}{shift?.startTime}–{shift?.endTime}
        </p>
        {(shift?.locationName ?? shift?.location) && (
          <p className="text-xs text-on-surface-variant font-body">{shift.locationName ?? shift.location}</p>
        )}
      </div>
    </div>
  );
};

/** Single swap card — sender or receiver layout */
const SwapCard = ({ swap, isReceiver, onAccept, onDecline, onCancel, t }) => (
  <div className="bg-surface-container-lowest rounded-2xl p-5 space-y-3 shadow-[0_4px_12px_rgba(25,28,30,0.04)]" data-testid="swap-card">
    {/* Requester's shift */}
    <SwapShiftMini
      shift={swap.requesterShift}
      label={isReceiver ? (swap.requesterName ?? '') : t('swap.yourShift')}
    />

    {/* Swap arrows */}
    <div className="flex items-center justify-center gap-2 text-primary">
      <span className="material-symbols-outlined text-xl" aria-hidden="true">swap_horiz</span>
    </div>

    {/* Recipient's shift */}
    <SwapShiftMini
      shift={swap.recipientShift}
      label={isReceiver ? t('swap.yourShift') : (swap.recipientName ?? '')}
    />

    {/* Reason */}
    {swap.reason && (
      <p className="text-on-surface-variant text-xs font-body italic">{swap.reason}</p>
    )}

    {/* Status + actions */}
    <div className="flex items-center justify-between">
      <span
        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide font-label ${swapStatusChipClass(swap.status)}`}
        data-testid="swap-status-chip"
      >
        {t(`requests.status${swap.status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`,
          { defaultValue: swap.status })}
      </span>
      <div className="flex gap-2">
        {isReceiver && swap.status === 'pending_peer' && (
          <>
            <button
              onClick={() => onAccept(swap.id)}
              className="px-4 py-2 rounded-lg font-bold text-xs font-label text-on-primary"
              style={{ background: 'linear-gradient(135deg, #da336b 0%, #8b2044 100%)' }}
              aria-label={`${t('swap.accept')} — ${swap.requesterName ?? ''}`}
              data-testid="swap-accept-btn"
            >
              {t('swap.accept')}
            </button>
            <button
              onClick={() => onDecline(swap.id)}
              className="px-4 py-2 rounded-lg border-2 border-primary text-primary font-bold text-xs font-label"
              aria-label={`${t('swap.decline')} — ${swap.requesterName ?? ''}`}
              data-testid="swap-decline-btn"
            >
              {t('swap.decline')}
            </button>
          </>
        )}
        {!isReceiver && swap.status === 'pending_peer' && (
          <button
            onClick={() => onCancel(swap.id)}
            className="text-error text-xs font-bold uppercase tracking-wide font-label px-3 py-1.5 rounded-lg hover:bg-error-container/20 transition-colors"
            data-testid="swap-cancel-btn"
          >
            {t('swap.cancel')}
          </button>
        )}
      </div>
    </div>
  </div>
);

const SwapTab = ({ t }) => {
  const { data: swapsRes, isLoading } = useEssSwapRequests();
  const peerAccept  = usePeerAcceptSwap();
  const peerDecline = usePeerDeclineSwap();
  const cancelSwap  = useCancelSwapRequest();

  const swaps = swapsRes?.data ?? swapsRes ?? [];

  // We use currentEmployeeId from localStorage JWT or fallback
  const currentEmployeeId = useMemo(() => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.employeeId ?? payload.sub ?? null;
    } catch { return null; }
  }, []);

  const sent = useMemo(() => swaps.filter(s => s.requesterId === currentEmployeeId), [swaps, currentEmployeeId]);
  const received = useMemo(() => swaps.filter(s => s.recipientId === currentEmployeeId), [swaps, currentEmployeeId]);

  const handleAccept = useCallback((id) => {
    peerAccept.mutate(id);
  }, [peerAccept]);

  const handleDecline = useCallback((id) => {
    if (window.confirm(t('swap.declineConfirm'))) {
      peerDecline.mutate(id);
    }
  }, [peerDecline, t]);

  const handleCancel = useCallback((id) => {
    cancelSwap.mutate(id);
  }, [cancelSwap]);

  if (isLoading) {
    return (
      <div className="px-6 mt-4 space-y-3 animate-pulse" data-testid="swaps-skeleton">
        {[0, 1, 2].map(i => <div key={i} className="h-36 bg-surface-variant rounded-2xl" />)}
      </div>
    );
  }

  if (sent.length === 0 && received.length === 0) {
    return (
      <div className="px-6 mt-6">
        <div className="bg-surface-container-lowest rounded-2xl text-center py-12 shadow-[0_8px_24px_rgba(25,28,30,0.06)]" data-testid="swaps-empty">
          <span className="material-symbols-outlined text-4xl text-outline block mb-2" aria-hidden="true">swap_horiz</span>
          <p className="text-on-surface-variant font-medium font-body">{t('swap.noSwaps')}</p>
          <p className="text-outline text-xs mt-1 font-body">{t('swap.noSwapsHint')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 mt-4 space-y-6" data-testid="swaps-content">
      {/* Received — action required */}
      {received.length > 0 && (
        <div>
          <h3 className="font-headline text-sm font-bold text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-lg text-primary" aria-hidden="true">notifications_active</span>
            {t('swap.receivedRequests')}
          </h3>
          <div className="space-y-3">
            {received.map(sw => (
              <SwapCard key={sw.id} swap={sw} isReceiver onAccept={handleAccept} onDecline={handleDecline} onCancel={handleCancel} t={t} />
            ))}
          </div>
        </div>
      )}

      {/* Sent */}
      {sent.length > 0 && (
        <div>
          <h3 className="font-headline text-sm font-bold text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-lg text-primary" aria-hidden="true">send</span>
            {t('swap.sentRequests')}
          </h3>
          <div className="space-y-3">
            {sent.map(sw => (
              <SwapCard key={sw.id} swap={sw} isReceiver={false} onAccept={handleAccept} onDecline={handleDecline} onCancel={handleCancel} t={t} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────

export const MobileRequestsPage = () => {
  const { t } = useTranslation('ess');
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'leave';
  const [activeTab, setActiveTab] = useState(() => {
    const valid = ['leave', 'absence', 'swap'];
    return valid.includes(initialTab) ? initialTab : 'leave';
  });

  return (
    <>
      <Helmet><meta name="theme-color" content="#fff8f7" /></Helmet>
      <div className="pb-6 max-w-2xl mx-auto" data-testid="requests-page">

        {/* Editorial header */}
        <div className="px-6 pt-6 pb-2">
          <span className="text-primary font-bold text-[10px] uppercase tracking-[0.15em] font-label block mb-1">
            {t('mobile.leave.sectionLabel')}
          </span>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-primary">
            {t('mobile.leave.title')}
          </h1>
        </div>

        {/* Sub-tab pills */}
        <div className="flex gap-2 px-6 mt-4" role="tablist" data-testid="request-tabs">
          {REQUEST_TABS.map(tab => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide font-label transition-all flex items-center gap-1.5 ${
                activeTab === tab.key
                  ? 'text-on-primary shadow-lg shadow-primary/20'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
              style={activeTab === tab.key ? { background: 'linear-gradient(135deg, #da336b 0%, #8b2044 100%)' } : {}}
              data-testid={`tab-${tab.key}`}
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true">{tab.icon}</span>
              {t(`requests.tab${tab.key.charAt(0).toUpperCase() + tab.key.slice(1)}`)}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div role="tabpanel" data-testid={`panel-${activeTab}`}>
          {activeTab === 'leave' && <LeaveTab t={t} />}
          {activeTab === 'absence' && <AbsenceTab t={t} />}
          {activeTab === 'swap' && <SwapTab t={t} />}
        </div>
      </div>
    </>
  );
};
