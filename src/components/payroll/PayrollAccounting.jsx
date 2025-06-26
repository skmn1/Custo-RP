import React from 'react';
import StatCard from '../ui/StatCard';

const PayrollAccounting = ({ payrollData }) => {
  const { payrollStats, selectedPayPeriod } = payrollData;

  // Calculate accounting entries
  const accountingEntries = [
    {
      account: 'Salaries and Wages Expense',
      type: 'Debit',
      amount: payrollStats.totalGrossPay,
      description: 'Employee gross wages for the pay period'
    },
    {
      account: 'Payroll Tax Expense',
      type: 'Debit', 
      amount: payrollStats.totalEmployerTaxes,
      description: 'Employer portion of payroll taxes'
    },
    {
      account: 'Benefits Expense',
      type: 'Debit',
      amount: payrollStats.totalEmployerBenefits,
      description: 'Employer-paid benefits'
    },
    {
      account: 'Federal Income Tax Payable',
      type: 'Credit',
      amount: payrollStats.totalFederalTax,
      description: 'Federal income tax withheld'
    },
    {
      account: 'State Income Tax Payable',
      type: 'Credit',
      amount: payrollStats.totalStateTax,
      description: 'State income tax withheld'
    },
    {
      account: 'Social Security Tax Payable',
      type: 'Credit',
      amount: payrollStats.totalSocialSecurity * 2, // Employee + Employer
      description: 'Social Security tax (employee + employer)'
    },
    {
      account: 'Medicare Tax Payable',
      type: 'Credit',
      amount: payrollStats.totalMedicare * 2, // Employee + Employer
      description: 'Medicare tax (employee + employer)'
    },
    {
      account: 'Health Insurance Payable',
      type: 'Credit',
      amount: payrollStats.totalHealthInsurance,
      description: 'Health insurance premiums withheld'
    },
    {
      account: 'Wages Payable',
      type: 'Credit',
      amount: payrollStats.totalNetPay,
      description: 'Net wages payable to employees'
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
      title: 'Direct Labor Cost',
      value: `$${payrollStats.totalGrossPay.toFixed(2)}`,
      icon: '💼',
      color: 'blue',
      description: 'Employee wages and salaries'
    },
    {
      title: 'Employer Tax Burden',
      value: `$${payrollStats.totalEmployerTaxes.toFixed(2)}`,
      icon: '🏛️',
      color: 'red',
      description: 'Employer portion of payroll taxes'
    },
    {
      title: 'Benefits Cost',
      value: `$${payrollStats.totalEmployerBenefits.toFixed(2)}`,
      icon: '🏥',
      color: 'green',
      description: 'Employer-paid benefits and contributions'
    },
    {
      title: 'Total Labor Cost',
      value: `$${(payrollStats.totalGrossPay + payrollStats.totalEmployerTaxes + payrollStats.totalEmployerBenefits).toFixed(2)}`,
      icon: '💰',
      color: 'purple',
      description: 'All-in cost of labor for this period'
    }
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payroll Accounting</h2>
        <p className="text-gray-600">Journal entries and cost analysis for payroll transactions</p>
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
                  Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Debit
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credit
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
                  TOTALS
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
            <span className="font-medium text-gray-900">Balance Check:</span>
            <span className={`font-bold ${Math.abs(totalDebits - totalCredits) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(totalDebits - totalCredits) < 0.01 ? '✅ Balanced' : `⚠️ Out of Balance: $${Math.abs(totalDebits - totalCredits).toFixed(2)}`}
            </span>
          </div>
        </div>
      </div>

      {/* Cost per Hour Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-xl">⏰</span>
            Cost per Hour Analysis
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-gray-700">Direct Hourly Cost</span>
              <span className="font-semibold text-blue-600">
                ${(payrollStats.totalGrossPay / payrollStats.totalHours).toFixed(2)}/hour
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-gray-700">Tax Burden per Hour</span>
              <span className="font-semibold text-red-600">
                ${(payrollStats.totalEmployerTaxes / payrollStats.totalHours).toFixed(2)}/hour
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-gray-700">Benefits Cost per Hour</span>
              <span className="font-semibold text-green-600">
                ${(payrollStats.totalEmployerBenefits / payrollStats.totalHours).toFixed(2)}/hour
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
              <span className="font-medium text-gray-900">Total Cost per Hour</span>
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
            Tax Breakdown
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Federal Income Tax</span>
              <span className="font-medium">${payrollStats.totalFederalTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">State Income Tax</span>
              <span className="font-medium">${payrollStats.totalStateTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Social Security (Employee)</span>
              <span className="font-medium">${payrollStats.totalSocialSecurity.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Social Security (Employer)</span>
              <span className="font-medium">${payrollStats.totalSocialSecurity.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Medicare (Employee)</span>
              <span className="font-medium">${payrollStats.totalMedicare.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Medicare (Employer)</span>
              <span className="font-medium">${payrollStats.totalMedicare.toFixed(2)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between items-center font-semibold">
              <span className="text-gray-900">Total Tax Liability</span>
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
