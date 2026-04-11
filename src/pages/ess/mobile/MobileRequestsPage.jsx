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
import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import {
  useEssLeaveBalance,
  useEssLeaveTypes,
  useEssLeaveRequests,
  useSubmitLeaveRequest,
  useCancelLeaveRequest,
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

export const MobileRequestsPage = () => {
  const { t } = useTranslation('ess');
  const [sheetOpen, setSheetOpen] = useState(false);

  // Task 87 React Query hooks
  const { data: balanceRes, isLoading: balLoading } = useEssLeaveBalance();
  const { data: typesRes } = useEssLeaveTypes();
  const { data: requestsRes, isLoading: reqLoading } = useEssLeaveRequests();
  const cancelLeave = useCancelLeaveRequest();

  // Unwrap API response shape: { data: ... }
  const balanceData = balanceRes?.data ?? balanceRes ?? null;
  const leaveTypes  = typesRes?.data ?? typesRes ?? [];
  const requests    = requestsRes?.data ?? requestsRes ?? [];

  // Sort by createdAt DESC
  const sortedRequests = useMemo(
    () => [...requests].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')),
    [requests]
  );

  const handleCancel = useCallback((requestId) => {
    if (window.confirm(t('requests.cancelConfirm'))) {
      cancelLeave.mutate(requestId);
    }
  }, [cancelLeave, t]);

  if (balLoading || reqLoading) return <MobileRequestsSkeleton />;

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
      </div>

      {/* Floating Action Button */}
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

      {/* New Request bottom sheet */}
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
