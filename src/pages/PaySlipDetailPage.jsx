import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { useEmployees } from '../hooks/useEmployees';
import { useShifts } from '../hooks/useShifts';
import { usePayroll } from '../hooks/usePayroll';
import { useSettings } from '../hooks/useSettings';

/**
 * Pay Slip detail page — /app/payroll/slips/:id
 * Full breakdown: regular hours × rate, OT, deductions, net.
 * Print + PDF download buttons.
 */
const PaySlipDetailPage = () => {
  const { t } = useTranslation(['payroll', 'common']);
  const { id } = useParams();
  const { employees } = useEmployees();
  const { shifts } = useShifts();
  const { employeePayrolls, recentPayPeriods } = usePayroll(employees, shifts);
  const { settings } = useSettings();

  // Resolve employee from slip id (format: slip-{empId})
  const empId = id?.replace('slip-', '') ?? '';
  const slip = useMemo(() => employeePayrolls.find((e) => String(e.id) === empId), [employeePayrolls, empId]);

  const period = recentPayPeriods?.[recentPayPeriods.length - 1];
  const company = settings?.company || { name: 'Staff Scheduler Pro', address: '' };

  if (!slip) {
    return (
      <div className="p-6">
        <p className="text-gray-500">{t('payroll:paySlip.notFound')}</p>
        <Link to="/app/payroll/slips" className="text-violet-600 hover:underline text-sm mt-2 inline-block">
          {t('payroll:paySlips.backToList')}
        </Link>
      </div>
    );
  }

  const deductionLines = [
    { label: t('payroll:paySlip.federalTax'), amount: slip.taxes?.federal ?? 0 },
    { label: t('payroll:paySlip.stateTax'), amount: slip.taxes?.state ?? 0 },
    { label: t('payroll:paySlip.socialSecurity'), amount: slip.taxes?.socialSecurity ?? 0 },
    { label: t('payroll:paySlip.medicare'), amount: slip.taxes?.medicare ?? 0 },
    { label: t('payroll:paySlip.healthInsurance'), amount: slip.deductions?.healthInsurance ?? 0 },
    { label: t('payroll:paySlip.retirement'), amount: slip.deductions?.retirement401k ?? 0 },
  ];

  const totalDeductions = deductionLines.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto" id="pay-slip-print">
      {/* Back link */}
      <Link to="/app/payroll/slips" className="text-sm text-violet-600 hover:underline">
        ← {t('payroll:paySlips.backToList')}
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 print:shadow-none print:border-none">
        {/* Header: Company + Employee */}
        <div className="flex justify-between items-start mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{company.name}</h2>
            {company.address && <p className="text-sm text-gray-500">{company.address}</p>}
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{slip.name}</p>
            <p className="text-xs text-gray-500">{slip.role} — {slip.department}</p>
          </div>
        </div>

        {/* Period */}
        {period && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {t('payroll:paySlip.payPeriod')}: {new Date(period.start).toLocaleDateString()} — {new Date(period.end).toLocaleDateString()}
          </p>
        )}

        {/* Earnings */}
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-2">
          {t('payroll:paySlip.earnings')}
        </h3>
        <table className="w-full mb-6 text-sm">
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            <tr>
              <td className="py-2 text-gray-600 dark:text-gray-300">{t('payroll:paySlip.regularHours')} × ${slip.hourlyRate?.toFixed(2)}</td>
              <td className="py-2 text-right">{slip.regularHours?.toFixed(1)} hrs</td>
              <td className="py-2 text-right font-medium">${((slip.regularHours || 0) * (slip.hourlyRate || 0)).toFixed(2)}</td>
            </tr>
            {(slip.overtimeHours || 0) > 0 && (
              <tr>
                <td className="py-2 text-gray-600 dark:text-gray-300">{t('payroll:paySlip.overtimeHours')} × ${((slip.hourlyRate || 0) * 1.5).toFixed(2)}</td>
                <td className="py-2 text-right">{slip.overtimeHours?.toFixed(1)} hrs</td>
                <td className="py-2 text-right font-medium">${((slip.overtimeHours || 0) * (slip.hourlyRate || 0) * 1.5).toFixed(2)}</td>
              </tr>
            )}
            {(slip.shiftDifferentials || 0) > 0 && (
              <tr>
                <td className="py-2 text-gray-600 dark:text-gray-300">{t('payroll:paySlip.shiftDifferentials')}</td>
                <td className="py-2" />
                <td className="py-2 text-right font-medium">${(slip.shiftDifferentials || 0).toFixed(2)}</td>
              </tr>
            )}
            <tr className="font-semibold bg-gray-50 dark:bg-gray-750">
              <td className="py-2" colSpan="2">{t('payroll:table.gross')}</td>
              <td className="py-2 text-right">${slip.grossPay?.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        {/* Deductions */}
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-2">
          {t('payroll:paySlip.deductionsBreakdown')}
        </h3>
        <table className="w-full mb-6 text-sm">
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {deductionLines.filter((d) => d.amount > 0).map((d, i) => (
              <tr key={i}>
                <td className="py-2 text-gray-600 dark:text-gray-300">{d.label}</td>
                <td className="py-2 text-right text-red-600">-${d.amount.toFixed(2)}</td>
              </tr>
            ))}
            <tr className="font-semibold bg-gray-50 dark:bg-gray-750">
              <td className="py-2">{t('payroll:paySlip.totalDeductions')}</td>
              <td className="py-2 text-right text-red-600">-${totalDeductions.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        {/* Net Pay */}
        <div className="border-t-2 border-gray-900 dark:border-gray-100 pt-3 flex justify-between text-lg font-bold">
          <span>{t('payroll:table.net')}</span>
          <span className="text-green-600">${slip.netPay?.toFixed(2)}</span>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 text-sm font-medium bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50"
          >
            {t('payroll:paySlip.print')}
          </button>
          <button
            type="button"
            onClick={() => {
              // Simple PDF-like download via print
              window.print();
            }}
            className="px-4 py-2 text-sm font-medium bg-violet-600 text-white rounded-lg hover:bg-violet-700"
          >
            {t('payroll:paySlip.downloadPdf')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaySlipDetailPage;
