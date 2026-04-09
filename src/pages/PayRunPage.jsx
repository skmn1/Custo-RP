import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useEmployees } from '../hooks/useEmployees';
import { useShifts } from '../hooks/useShifts';
import { usePayroll } from '../hooks/usePayroll';
import { useAuth } from '../hooks/useAuth';

const PAY_FREQUENCIES = ['weekly', 'bi-weekly', 'semi-monthly', 'monthly'];
const STATUSES = { DRAFT: 'draft', APPROVED: 'approved', PAID: 'paid', VOIDED: 'voided' };

/**
 * Pay Run wizard — 4-step workflow.
 * Step 1: Period Selection
 * Step 2: Hours Review
 * Step 3: Deductions & Additions
 * Step 4: Summary & Approve
 */
const PayRunPage = () => {
  const { t } = useTranslation(['payroll', 'common']);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, can } = useAuth();
  const { employees } = useEmployees();
  const { shifts } = useShifts();
  const payrollData = usePayroll(employees, shifts);
  const { employeePayrolls, payrollSummary } = payrollData;

  const isNew = !id || id === 'new';

  // Wizard state
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState(STATUSES.DRAFT);
  const [frequency, setFrequency] = useState('bi-weekly');
  const [periodStart, setPeriodStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + 1); // Monday
    return d.toISOString().slice(0, 10);
  });
  const [periodEnd, setPeriodEnd] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + 14);
    return d.toISOString().slice(0, 10);
  });

  // In-flight edits for hours (Step 2)
  const [hoursOverrides, setHoursOverrides] = useState({});

  // One-off adjustments (Step 3)
  const [adjustments, setAdjustments] = useState({});

  const isLocked = status === STATUSES.APPROVED || status === STATUSES.PAID;

  // Merge employee payroll data with overrides
  const runEmployees = useMemo(() => {
    return employeePayrolls.map((emp) => {
      const overrideHrs = hoursOverrides[emp.id];
      const adj = adjustments[emp.id] || { bonus: 0, deduction: 0 };
      const totalHours = overrideHrs !== undefined ? parseFloat(overrideHrs) : emp.totalHours;
      const gross = (totalHours / (emp.totalHours || 1)) * emp.grossPay;
      const totalDeductions = emp.deductions?.total ?? 0;
      const net = gross - totalDeductions + (adj.bonus || 0) - (adj.deduction || 0);

      return {
        ...emp,
        adjustedHours: totalHours,
        adjustedGross: gross,
        adjustedNet: net,
        adjustment: adj,
        hoursChanged: overrideHrs !== undefined && parseFloat(overrideHrs) !== emp.totalHours,
      };
    });
  }, [employeePayrolls, hoursOverrides, adjustments]);

  // Totals
  const totals = useMemo(() => {
    const gross = runEmployees.reduce((s, e) => s + e.adjustedGross, 0);
    const deductions = runEmployees.reduce((s, e) => s + (e.deductions?.total ?? 0), 0);
    const bonuses = runEmployees.reduce((s, e) => s + (e.adjustment?.bonus ?? 0), 0);
    const extras = runEmployees.reduce((s, e) => s + (e.adjustment?.deduction ?? 0), 0);
    const net = gross - deductions + bonuses - extras;
    return { gross, deductions, bonuses, extras, net, count: runEmployees.length };
  }, [runEmployees]);

  const handleApprove = useCallback(() => {
    setStatus(STATUSES.APPROVED);
    setStep(4);
    // In a real app this would POST to /api/payroll/runs/:id/approve
  }, []);

  const handleVoid = useCallback(() => {
    if (!can('payroll:modify-rates')) return; // only super_admin
    setStatus(STATUSES.DRAFT);
  }, [can]);

  const handleUpdateHours = (empId, value) => {
    if (isLocked) return;
    setHoursOverrides((prev) => ({ ...prev, [empId]: value }));
  };

  const handleAdjustment = (empId, field, value) => {
    if (isLocked) return;
    setAdjustments((prev) => ({
      ...prev,
      [empId]: { ...(prev[empId] || { bonus: 0, deduction: 0 }), [field]: parseFloat(value) || 0 },
    }));
  };

  // ── Step renderers ──

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        {t('payroll:payRun.step1Title')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('payroll:payRun.payFrequency')}
          </label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            disabled={isLocked}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm disabled:opacity-60"
          >
            {PAY_FREQUENCIES.map((f) => (
              <option key={f} value={f}>
                {t(`payroll:payRun.frequency.${f}`)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('payroll:payRun.startDate')}
          </label>
          <input
            type="date"
            value={periodStart}
            onChange={(e) => setPeriodStart(e.target.value)}
            disabled={isLocked}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm disabled:opacity-60"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('payroll:payRun.endDate')}
          </label>
          <input
            type="date"
            value={periodEnd}
            onChange={(e) => setPeriodEnd(e.target.value)}
            disabled={isLocked}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm disabled:opacity-60"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        {t('payroll:payRun.step2Title')}
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('payroll:table.employee')}</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">{t('payroll:payRun.scheduledHours')}</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">{t('payroll:payRun.actualHours')}</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">{t('payroll:payRun.overtimeHours')}</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">{t('payroll:payRun.flag')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {runEmployees.map((emp) => {
              const hrs = hoursOverrides[emp.id] !== undefined ? parseFloat(hoursOverrides[emp.id]) : emp.totalHours;
              const pctChange = emp.totalHours > 0 ? Math.abs((hrs - emp.totalHours) / emp.totalHours) * 100 : 0;
              const flagged = pctChange > 20;
              return (
                <tr key={emp.id} className={flagged ? 'bg-amber-50 dark:bg-amber-900/10' : ''}>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{emp.name}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-300">
                    {emp.totalHours.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={hoursOverrides[emp.id] ?? emp.totalHours.toFixed(1)}
                      onChange={(e) => handleUpdateHours(emp.id, e.target.value)}
                      disabled={isLocked}
                      className="w-20 text-right rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm disabled:opacity-60"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100">
                    {emp.overtimeHours.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {flagged && (
                      <span className="inline-block px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                        {t('payroll:payRun.hoursWarning')}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        {t('payroll:payRun.step3Title')}
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('payroll:table.employee')}</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">{t('payroll:table.gross')}</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">{t('payroll:payRun.taxes')}</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">{t('payroll:payRun.bonus')}</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">{t('payroll:payRun.extraDeduction')}</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">{t('payroll:table.net')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {runEmployees.map((emp) => (
              <tr key={emp.id}>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{emp.name}</td>
                <td className="px-4 py-3 text-sm text-right">${emp.adjustedGross.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-right text-red-600">${(emp.deductions?.total ?? 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-right">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={emp.adjustment.bonus || ''}
                    placeholder="0.00"
                    onChange={(e) => handleAdjustment(emp.id, 'bonus', e.target.value)}
                    disabled={isLocked}
                    className="w-24 text-right rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm disabled:opacity-60"
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={emp.adjustment.deduction || ''}
                    placeholder="0.00"
                    onChange={(e) => handleAdjustment(emp.id, 'deduction', e.target.value)}
                    disabled={isLocked}
                    className="w-24 text-right rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm disabled:opacity-60"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-right font-medium">${emp.adjustedNet.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        {t('payroll:payRun.step4Title')}
      </h2>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase">{t('payroll:payRun.totalGross')}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">${totals.gross.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase">{t('payroll:payRun.totalDeductions')}</p>
          <p className="text-xl font-bold text-red-600">${totals.deductions.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase">{t('payroll:payRun.totalNet')}</p>
          <p className="text-xl font-bold text-green-600">${totals.net.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase">{t('payroll:payRun.employeeCount')}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{totals.count}</p>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600 dark:text-gray-300">{t('payroll:payRun.status')}:</span>
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            status === STATUSES.APPROVED
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              : status === STATUSES.VOIDED
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
          }`}
        >
          {t(`payroll:status.${status}`)}
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {status === STATUSES.DRAFT && (
          <button
            type="button"
            onClick={handleApprove}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            data-testid="approve-pay-run"
          >
            {t('payroll:payRun.approve')}
          </button>
        )}
        {status === STATUSES.APPROVED && can('payroll:modify-rates') && (
          <button
            type="button"
            onClick={handleVoid}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            data-testid="void-pay-run"
          >
            {t('payroll:payRun.void')}
          </button>
        )}
      </div>
    </div>
  );

  const steps = [
    { num: 1, label: t('payroll:payRun.stepPeriod') },
    { num: 2, label: t('payroll:payRun.stepHours') },
    { num: 3, label: t('payroll:payRun.stepDeductions') },
    { num: 4, label: t('payroll:payRun.stepSummary') },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isNew ? t('payroll:payRun.newTitle') : t('payroll:payRun.editTitle', { id })}
        </h1>
        <button
          type="button"
          onClick={() => navigate('/app/payroll/runs')}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          {t('common:btn.close')}
        </button>
      </div>

      {/* Step indicator */}
      <nav className="flex items-center gap-2">
        {steps.map((s) => (
          <button
            key={s.num}
            type="button"
            onClick={() => !isLocked && setStep(s.num)}
            disabled={isLocked && s.num < 4}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              step === s.num
                ? 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300'
                : s.num < step
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
            }`}
            data-testid={`step-${s.num}`}
          >
            <span className="w-5 h-5 flex items-center justify-center rounded-full bg-current/10 text-xs">
              {s.num}
            </span>
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        ))}
      </nav>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </div>

      {/* Navigation */}
      {!isLocked && (
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40"
          >
            {t('payroll:payRun.previous')}
          </button>
          {step < 4 && (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(4, s + 1))}
              className="px-4 py-2 text-sm font-medium bg-violet-600 text-white rounded-lg hover:bg-violet-700"
              data-testid="next-step"
            >
              {t('payroll:payRun.next')}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PayRunPage;
