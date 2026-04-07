import React from 'react';
import { useTranslation } from 'react-i18next';
import StatCard from '../ui/StatCard';

const PayrollAccounting = ({ payrollData }) => {
  const { t } = useTranslation(['payroll']);
  const { payrollStats, selectedPayPeriod } = payrollData;

  // Calculate accounting entries
  const accountingEntries = [
    {
      account: t('payroll:accounting.accounts.salariesExpense'),
      type: 'Debit',
      amount: payrollStats.totalGrossPay,
      description: t('payroll:accounting.accounts.salariesExpenseDesc')
    },
    {
      account: t('payroll:accounting.accounts.payrollTaxExpense'),
      type: 'Debit', 
      amount: payrollStats.totalEmployerTaxes,
      description: t('payroll:accounting.accounts.payrollTaxExpenseDesc')
    },
    {
      account: t('payroll:accounting.accounts.benefitsExpense'),
      type: 'Debit',
      amount: payrollStats.totalEmployerBenefits,
      description: t('payroll:accounting.accounts.benefitsExpenseDesc')
    },
    {
      account: t('payroll:accounting.accounts.federalTaxPayable'),
      type: 'Credit',
      amount: payrollStats.totalFederalTax,
      description: t('payroll:accounting.accounts.federalTaxPayableDesc')
    },
    {
      account: t('payroll:accounting.accounts.stateTaxPayable'),
      type: 'Credit',
      amount: payrollStats.totalStateTax,
      description: t('payroll:accounting.accounts.stateTaxPayableDesc')
    },
    {
      account: t('payroll:accounting.accounts.socialSecurityPayable'),
      type: 'Credit',
      amount: payrollStats.totalSocialSecurity * 2,
      description: t('payroll:accounting.accounts.socialSecurityPayableDesc')
    },
    {
      account: t('payroll:accounting.accounts.medicarePayable'),
      type: 'Credit',
      amount: payrollStats.totalMedicare * 2,
      description: t('payroll:accounting.accounts.medicarePayableDesc')
    },
    {
      account: t('payroll:accounting.accounts.healthInsurancePayable'),
      type: 'Credit',
      amount: payrollStats.totalHealthInsurance,
      description: t('payroll:accounting.accounts.healthInsurancePayableDesc')
    },
    {
      account: t('payroll:accounting.accounts.wagesPayable'),
      type: 'Credit',
      amount: payrollStats.totalNetPay,
      description: t('payroll:accounting.accounts.wagesPayableDesc')
    }
  ];

  const totalDebits = accountingEntries
    .filter(entry => entry.type === 'Debit')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const totalCredits = accountingEntries
    .filter(entry => entry.type === 'Credit')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const costAnalysis = [
    {
      title: t('payroll:accounting.directLabor'),
      value: `$${payrollStats.totalGrossPay.toFixed(2)}`,
      icon: '💼',
      color: 'blue',
      description: t('payroll:accounting.directLaborDesc')
    },
    {
      title: t('payroll:accounting.employerTax'),
      value: `$${payrollStats.totalEmployerTaxes.toFixed(2)}`,
      icon: '🏛️',
      color: 'red',
      description: t('payroll:accounting.employerTaxDesc')
    },
    {
      title: t('payroll:accounting.benefitsCost'),
      value: `$${payrollStats.totalEmployerBenefits.toFixed(2)}`,
      icon: '🏥',
      color: 'green',
      description: t('payroll:accounting.benefitsCostDesc')
    },
    {
      title: t('payroll:accounting.totalLabor'),
      value: `$${(payrollStats.totalGrossPay + payrollStats.totalEmployerTaxes + payrollStats.totalEmployerBenefits).toFixed(2)}`,
      icon: '💰',
      color: 'purple',
      description: t('payroll:accounting.totalLaborDesc')
    }
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('payroll:accounting.title')}</h2>
        <p className="text-gray-600">{t('payroll:accounting.subtitle')}</p>
      </div>

      {/* Cost Analysis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {costAnalysis.map((item, index) => (
          <StatCard
            key={index}
            title={item.title}
            value={item.value}
            icon={item.icon}
            color={item.color}
            description={item.description}
          />
        ))}
      </div>

      {/* Journal Entries */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-xl">📚</span>
          Journal Entries
        </h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('payroll:accounting.tableAccount')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('payroll:accounting.tableDescription')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('payroll:accounting.tableDebit')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('payroll:accounting.tableCredit')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {accountingEntries.map((entry, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{entry.account}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {entry.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {entry.type === 'Debit' ? (
                      <span className="text-red-600">${entry.amount.toFixed(2)}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {entry.type === 'Credit' ? (
                      <span className="text-green-600">${entry.amount.toFixed(2)}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
              
              {/* Totals Row */}
              <tr className="bg-gray-50 border-t-2 border-gray-300">
                <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">
                  {t('payroll:accounting.totals')}
                </td>
                <td className="px-6 py-4"></td>
                <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-red-600">
                  ${totalDebits.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-green-600">
                  ${totalCredits.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Balance Check */}
        <div className="mt-4 p-4 rounded-lg bg-gray-50">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-900">{t('payroll:accounting.balanceCheck')}</span>
            <span className={`font-bold ${Math.abs(totalDebits - totalCredits) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(totalDebits - totalCredits) < 0.01 ? `✅ ${t('payroll:accounting.balanced')}` : `⚠️ ${t('payroll:accounting.outOfBalance', { amount: Math.abs(totalDebits - totalCredits).toFixed(2) })}`}
            </span>
          </div>
        </div>
      </div>

      {/* Cost per Hour Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-xl">⏰</span>
            {t('payroll:accounting.costPerHour')}
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-gray-700">{t('payroll:accounting.directHourlyCost')}</span>
              <span className="font-semibold text-blue-600">
                ${(payrollStats.totalGrossPay / payrollStats.totalHours).toFixed(2)}/hour
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-gray-700">{t('payroll:accounting.taxBurdenPerHour')}</span>
              <span className="font-semibold text-red-600">
                ${(payrollStats.totalEmployerTaxes / payrollStats.totalHours).toFixed(2)}/hour
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-gray-700">{t('payroll:accounting.benefitsCostPerHour')}</span>
              <span className="font-semibold text-green-600">
                ${(payrollStats.totalEmployerBenefits / payrollStats.totalHours).toFixed(2)}/hour
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
              <span className="font-medium text-gray-900">{t('payroll:accounting.totalCostPerHour')}</span>
              <span className="font-bold text-purple-600 text-lg">
                ${((payrollStats.totalGrossPay + payrollStats.totalEmployerTaxes + payrollStats.totalEmployerBenefits) / payrollStats.totalHours).toFixed(2)}/hour
              </span>
            </div>
          </div>
        </div>

        {/* Tax Breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-xl">🏛️</span>
            {t('payroll:accounting.taxBreakdown')}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">{t('payroll:accounting.federalIncomeTax')}</span>
              <span className="font-medium">${payrollStats.totalFederalTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">{t('payroll:accounting.stateIncomeTax')}</span>
              <span className="font-medium">${payrollStats.totalStateTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">{t('payroll:accounting.socialSecurityEmployee')}</span>
              <span className="font-medium">${payrollStats.totalSocialSecurity.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">{t('payroll:accounting.socialSecurityEmployer')}</span>
              <span className="font-medium">${payrollStats.totalSocialSecurity.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">{t('payroll:accounting.medicareEmployee')}</span>
              <span className="font-medium">${payrollStats.totalMedicare.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">{t('payroll:accounting.medicareEmployer')}</span>
              <span className="font-medium">${payrollStats.totalMedicare.toFixed(2)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between items-center font-semibold">
              <span className="text-gray-900">{t('payroll:accounting.totalTaxLiability')}</span>
              <span className="text-red-600">
                ${(payrollStats.totalFederalTax + payrollStats.totalStateTax + (payrollStats.totalSocialSecurity * 2) + (payrollStats.totalMedicare * 2)).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollAccounting;
