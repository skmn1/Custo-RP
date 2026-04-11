import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useEssLeaveBalance } from '../../hooks/useEssLeaveBalance';
import { useEssLeaveRequests } from '../../hooks/useEssLeaveRequests';
import { useEssConnectivity } from '../../contexts/EssConnectivityContext';
import { useMobileLayout } from '../../hooks/useMobileLayout';
import EssOfflineFallback from '../../components/ess/EssOfflineFallback';
import { MobileRequestsPage } from './mobile/MobileRequestsPage';

/* ─── Constants ───────────────────────────────────────────── */

const LEAVE_TYPES = ['annual', 'sick', 'swap'];

const STATUS_COLORS = {
  approved: 'bg-green-100 text-green-800',
  pending:  'bg-yellow-100 text-yellow-800',
  declined: 'bg-red-100 text-red-800',
  rejected: 'bg-red-100 text-red-800',
};

/* ─── Helpers ─────────────────────────────────────────────── */

function todayString() {
  return new Date().toISOString().split('T')[0];
}

function formatDateRange(startDate, endDate) {
  const fmt = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  const start = fmt.format(new Date(startDate));
  if (!endDate || endDate === startDate) return start;
  return `${start} – ${fmt.format(new Date(endDate))}`;
}

/* ─── BalanceCard ─────────────────────────────────────────── */

function BalanceCard({ type, balance, t }) {
  const remaining = balance ? balance.total - balance.used : 0;
  const pct = balance ? Math.min((balance.used / balance.total) * 100, 100) : 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="font-semibold text-gray-900 text-sm">
        {t(`requests.typeLabels.${type}`)}
      </h3>
      {balance ? (
        <>
          <p className="text-3xl font-bold text-indigo-600 mt-2">{remaining}</p>
          <p className="text-xs text-gray-500 mt-1">
            {t('requests.daysUsed', { used: balance.used, total: balance.total })}
          </p>
          <div className="mt-3 h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-indigo-500 transition-[width] duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-400 mt-2">{t('requests.noBalance')}</p>
      )}
    </div>
  );
}

/* ─── NewRequestDialog ────────────────────────────────────── */

function NewRequestDialog({ isOpen, onClose, onSubmit, isSubmitting, submitError, t }) {
  const [type, setType] = useState('annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setValidationError('');

    if (endDate && startDate && endDate < startDate) {
      setValidationError(t('requests.validationEndDate'));
      return;
    }

    try {
      await onSubmit({ type, startDate, endDate, reason });
      setType('annual');
      setStartDate('');
      setEndDate('');
      setReason('');
    } catch {
      // submitError shown from props
    }
  }, [type, startDate, endDate, reason, onSubmit, t]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">{t('requests.newRequest')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={t('requests.cancel')}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Leave type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('requests.leaveType')}
            </label>
            <div className="flex gap-2">
              {LEAVE_TYPES.map(lt => (
                <button
                  key={lt}
                  type="button"
                  onClick={() => setType(lt)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    type === lt
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t(`requests.typeLabels.${lt}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="desktop-leave-start" className="block text-sm font-medium text-gray-700 mb-1">
                {t('requests.startDate')}
              </label>
              <input
                id="desktop-leave-start"
                type="date"
                value={startDate}
                min={todayString()}
                onChange={e => setStartDate(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="desktop-leave-end" className="block text-sm font-medium text-gray-700 mb-1">
                {t('requests.endDate')}
              </label>
              <input
                id="desktop-leave-end"
                type="date"
                value={endDate}
                min={startDate || todayString()}
                onChange={e => setEndDate(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Validation error */}
          {(validationError || submitError) && (
            <p className="text-red-600 text-sm" role="alert">
              {validationError || submitError}
            </p>
          )}

          {/* Reason */}
          <div>
            <label htmlFor="desktop-leave-reason" className="block text-sm font-medium text-gray-700 mb-1">
              {t('requests.reasonOptional')}
            </label>
            <textarea
              id="desktop-leave-reason"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder={t('requests.reasonPlaceholder')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[80px] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {t('requests.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {t('requests.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────── */

const EssRequestsPage = () => {
  const isMobile = useMobileLayout();
  const { t } = useTranslation('ess');
  const { isOnline } = useEssConnectivity();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: balance, isLoading: balanceLoading } = useEssLeaveBalance();
  const {
    data: requests,
    isLoading: requestsLoading,
    error,
    createRequest,
    isSubmitting,
    submitError,
    refetch,
  } = useEssLeaveRequests();

  // Mobile delegation
  if (isMobile) return <MobileRequestsPage />;

  const handleSubmit = async (formData) => {
    await createRequest(formData);
    setDialogOpen(false);
    refetch();
  };

  // Offline with no data
  if (!isOnline && !balance && requests.length === 0 && !balanceLoading && !requestsLoading) {
    return <EssOfflineFallback />;
  }

  const isLoading = balanceLoading || requestsLoading;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('requests.title')}
        </h1>
        <button
          onClick={() => setDialogOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {t('requests.newRequest')}
        </button>
      </div>
      <p className="text-gray-500 text-sm mb-6">{t('requests.subtitle')}</p>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Content */}
      {!isLoading && (
        <>
          {/* Balance cards */}
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('requests.leaveBalance')}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3 mb-8">
            {LEAVE_TYPES.map(type => (
              <BalanceCard key={type} type={type} balance={balance?.[type]} t={t} />
            ))}
          </div>

          {/* Requests table */}
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('requests.recentRequests')}
          </h2>

          {requests.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
              <p className="text-gray-500">{t('requests.noRequests')}</p>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('requests.type')}
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('requests.dates')}
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('requests.reason')}
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('requests.status')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.map(req => (
                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 font-medium text-gray-900">
                        {t(`requests.typeLabels.${req.type}`, { defaultValue: req.type })}
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {formatDateRange(req.startDate, req.endDate)}
                      </td>
                      <td className="px-5 py-4 text-gray-500 max-w-xs truncate">
                        {req.reason || '—'}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[req.status] || 'bg-gray-100 text-gray-600'}`}>
                          {t(`requests.statusLabels.${req.status}`, { defaultValue: req.status })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* New Request dialog */}
      <NewRequestDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitError={submitError}
        t={t}
      />
    </div>
  );
};

export default EssRequestsPage;
