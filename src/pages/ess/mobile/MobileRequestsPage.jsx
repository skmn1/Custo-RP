/**
 * MobileRequestsPage — Task 83 (SCREEN_69)
 *
 * ESS Leave & Requests screen, Nexus Kinetic styled:
 * - Balance bento cards: Annual Leave, Sick Days, Shift Swaps (with progress bars)
 * - Floating Action Button opens a bottom sheet for new leave requests
 * - Recent requests list with colour-coded status chips
 * - Form validation: endDate ≥ startDate
 *
 * Data:
 *   useEssLeaveBalance() → GET /api/ess/leave/balance
 *   useEssLeaveRequests() → GET /api/ess/leave/requests
 *                         + POST /api/ess/leave/requests (create)
 */
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useEssLeaveBalance } from '../../../hooks/useEssLeaveBalance';
import { useEssLeaveRequests } from '../../../hooks/useEssLeaveRequests';

// ── Constants ────────────────────────────────────────────────────

const LEAVE_TYPES = [
  { key: 'annual', icon: 'beach_access', fill: true },
  { key: 'sick',   icon: 'sick',         fill: true },
  { key: 'swap',   icon: 'swap_horiz',   fill: false },
];

// ── Helpers ──────────────────────────────────────────────────────

/** YYYY-MM-DD for today, used as min on date inputs */
const todayString = () => new Date().toISOString().split('T')[0];

/** Leave type → icon name */
function typeIcon(type) {
  if (type === 'sick') return 'sick';
  if (type === 'swap') return 'swap_horiz';
  return 'beach_access';
}

/** Status → Tailwind class string */
function statusChipClass(status) {
  if (status === 'approved') return 'bg-primary-container/40 text-primary';
  if (status === 'declined' || status === 'rejected') return 'bg-error-container/40 text-error';
  return 'bg-secondary-container/40 text-secondary';
}

/** Format date range compactly */
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
    <div className="px-6 mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      {[0, 1, 2].map(i => <div key={i} className="h-36 bg-surface-variant rounded-2xl" />)}
    </div>
    <div className="px-6 mt-6 space-y-3">
      {[0, 1, 2].map(i => <div key={i} className="h-20 bg-surface-variant rounded-2xl" />)}
    </div>
  </div>
);

// ── LeaveBalanceCards ─────────────────────────────────────────────

const LeaveBalanceCards = ({ balances, t }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 mt-6" data-testid="leave-balance-cards">
    {LEAVE_TYPES.map(lt => {
      const balance = balances?.[lt.key];
      const pct = balance ? Math.min((balance.used / balance.total) * 100, 100) : 0;
      const remaining = balance ? balance.total - balance.used : 0;

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
                {remaining}{' '}
                <span className="text-base font-medium text-on-surface-variant">
                  {t('mobile.leave.daysLeft')}
                </span>
              </p>
              <p className="text-on-surface-variant text-xs mt-0.5 font-body relative z-10">
                {t('mobile.leave.daysUsedOf', { used: balance.used, total: balance.total })}
              </p>
              <div
                className="h-1.5 rounded-full bg-surface-container mt-3 overflow-hidden relative z-10"
              >
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-500"
                  style={{ width: `${pct}%` }}
                  role="progressbar"
                  aria-valuenow={balance.used}
                  aria-valuemin={0}
                  aria-valuemax={balance.total}
                  aria-label={t(`mobile.leave.types.${lt.key}`)}
                />
              </div>
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

const RecentRequests = ({ requests, t }) => {
  if (!requests || requests.length === 0) {
    return (
      <div
        className="bg-surface-container-lowest rounded-2xl text-center py-10 shadow-[0_8px_24px_rgba(25,28,30,0.06)]"
        data-testid="requests-empty"
      >
        <span className="material-symbols-outlined text-4xl text-outline block mb-2" aria-hidden="true">
          event_available
        </span>
        <p className="text-on-surface-variant font-medium font-body">
          {t('mobile.leave.noRequests')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="requests-list">
      {requests.map(req => (
        <div
          key={req.id}
          className="bg-surface-container-lowest rounded-2xl p-5 flex items-center justify-between shadow-[0_4px_12px_rgba(25,28,30,0.04)] hover:shadow-md transition-all"
          data-testid="request-row"
        >
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center flex-shrink-0">
              <span
                className="material-symbols-outlined text-primary text-xl"
                aria-hidden="true"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {typeIcon(req.type)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-headline text-sm font-bold text-on-surface">
                {t(`mobile.leave.types.${req.type}`, { defaultValue: req.type })}
              </p>
              <p className="text-on-surface-variant text-xs mt-0.5 font-body truncate">
                {formatDateRange(req.startDate, req.endDate)}
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
      ))}
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

const NewRequestSheet = ({ isOpen, onClose, onSubmit, isSubmitting, submitError, t }) => {
  const [type, setType] = useState('annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setValidationError('');

    if (endDate && startDate && endDate < startDate) {
      setValidationError(t('mobile.leave.validationEndDate'));
      return;
    }

    try {
      await onSubmit({ type, startDate, endDate, reason });
      // Reset form on success
      setType('annual');
      setStartDate('');
      setEndDate('');
      setReason('');
    } catch {
      // submitError shown from prop
    }
  }, [type, startDate, endDate, reason, onSubmit, t]);

  const handleClose = useCallback(() => {
    setValidationError('');
    onClose();
  }, [onClose]);

  return (
    <NexusBottomSheet isOpen={isOpen} onClose={handleClose} title={t('mobile.leave.newRequest')}>
      <form onSubmit={handleSubmit} className="space-y-5 px-6 pt-4 pb-10" data-testid="new-request-form">
        {/* Leave type pills */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 font-label">
            {t('mobile.leave.leaveType')}
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-label={t('mobile.leave.leaveType')}>
            {LEAVE_TYPES.map(lt => (
              <button
                key={lt.key}
                type="button"
                onClick={() => setType(lt.key)}
                aria-pressed={type === lt.key}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide font-label transition-all ${
                  type === lt.key
                    ? 'text-on-primary shadow-lg shadow-primary/20'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
                style={type === lt.key ? { background: 'linear-gradient(135deg, #da336b 0%, #8b2044 100%)' } : {}}
                data-testid={`leave-type-${lt.key}`}
              >
                {t(`mobile.leave.types.${lt.key}`)}
              </button>
            ))}
          </div>
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
              onChange={e => setStartDate(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl outline-none border-b-2 border-transparent focus:border-primary transition-all text-on-surface font-body text-sm"
              required
              data-testid="start-date-input"
            />
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
              onChange={e => setEndDate(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl outline-none border-b-2 border-transparent focus:border-primary transition-all text-on-surface font-body text-sm"
              required
              data-testid="end-date-input"
            />
          </div>
        </div>

        {/* Validation error */}
        {(validationError || submitError) && (
          <p className="text-error text-sm font-body flex items-center gap-2" role="alert" data-testid="form-error">
            <span className="material-symbols-outlined text-base" aria-hidden="true">error</span>
            {validationError || submitError}
          </p>
        )}

        {/* Reason */}
        <div>
          <label
            htmlFor="leave-reason"
            className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 block font-label"
          >
            {t('mobile.leave.reason')}
          </label>
          <textarea
            id="leave-reason"
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder={t('mobile.leave.reasonPlaceholder')}
            className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl outline-none border-b-2 border-transparent focus:border-primary transition-all text-on-surface font-body text-sm min-h-[80px] resize-none"
            data-testid="reason-input"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-xl text-on-primary font-bold text-base font-headline flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #da336b 0%, #8b2044 100%)' }}
          data-testid="submit-request-btn"
        >
          {isSubmitting ? (
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

  const { data: balance, isLoading: balanceLoading } = useEssLeaveBalance();
  const {
    data: requests,
    isLoading: requestsLoading,
    createRequest,
    isSubmitting,
    submitError,
    refetch,
  } = useEssLeaveRequests();

  const handleSubmit = useCallback(async (formData) => {
    await createRequest(formData);
    setSheetOpen(false);
    refetch();
  }, [createRequest, refetch]);

  if (balanceLoading || requestsLoading) return <MobileRequestsSkeleton />;

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
        <LeaveBalanceCards balances={balance} t={t} />

        {/* Recent requests */}
        <div className="mt-6 px-6">
          <h2 className="font-headline text-lg font-bold text-on-surface mb-3">
            {t('mobile.leave.recentRequests')}
          </h2>
          <RecentRequests requests={requests} t={t} />
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
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitError={submitError}
        t={t}
      />
    </>
  );
};
