import React from 'react';
import { useTranslation } from 'react-i18next';
import StatCard from '../ui/StatCard';

const PayrollStatistics = ({ payrollData }) => {
  const { t } = useTranslation(['payroll']);
  const { payrollStats, departmentPayroll, rolePayroll, payrollTrends } = payrollData;

  const statsCards = [
    {
      title: t('payroll:stats.averageHourlyRateLong'),
      value: `$${payrollStats.avgHourlyRate.toFixed(2)}`,
      icon: '💵',
      color: 'blue',
      change: payrollStats.rateChange || 0,
    },
    {
      title: t('payroll:stats.overtimeRate'),
      value: `${payrollStats.overtimePercentage.toFixed(1)}%`,
      icon: '⚡',
      color: 'orange',
      change: payrollStats.overtimeChange || 0,
    },
    {
      title: t('payroll:stats.totalTaxBurden'),
      value: `$${payrollStats.totalTaxes.toFixed(2)}`,
      icon: '📊',
      color: 'red',
      change: payrollStats.taxChange || 0,
    },
    {
      title: t('payroll:stats.benefitsCost'),
      value: `$${payrollStats.totalBenefits.toFixed(2)}`,
      icon: '🏥',
      color: 'green',
      change: payrollStats.benefitsChange || 0,
    },
    {
      title: t('payroll:stats.laborCostRatio'),
      value: `${payrollStats.laborCostRatio.toFixed(1)}%`,
      icon: '📈',
      color: 'purple',
      change: payrollStats.laborRatioChange || 0,
    },
    {
      title: t('payroll:stats.averageWeeklyHours'),
      value: `${payrollStats.avgWeeklyHours.toFixed(1)}h`,
      icon: '⏰',
      color: 'indigo',
      change: payrollStats.hoursChange || 0,
    },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('payroll:statistics.title')}</h2>
        <p className="text-gray-600">{t('payroll:statistics.subtitle')}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            change={stat.change}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Department Analysis */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-xl">🏢</span>
            {t('payroll:statistics.departmentAnalysis')}
          </h3>
          <div className="space-y-4">
            {Object.entries(departmentPayroll)
              .sort(([,a], [,b]) => b.totalPay - a.totalPay)
              .map(([department, data]) => {
                const percentage = (data.totalPay / payrollStats.totalGrossPay * 100);
                return (
                  <div key={department} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">{department}</span>
                      <span className="text-sm text-gray-600">${data.totalPay.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{t('payroll:departmentEmployees', { count: data.employeeCount })}</span>
                      <span>{t('payroll:statistics.percentOfTotal', { value: percentage.toFixed(1) })}</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Role Analysis */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-xl">👔</span>
            {t('payroll:statistics.roleAnalysis')}
          </h3>
          <div className="space-y-4">
            {Object.entries(rolePayroll)
              .sort(([,a], [,b]) => b.avgPay - a.avgPay)
              .map(([role, data]) => (
                <div key={role} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-900">{role}</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {t('payroll:statistics.avg', { value: `$${data.avgPay.toFixed(2)}` })}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                    <div>
                      <span>{t('payroll:statistics.count')}</span>
                      <span className="font-medium">{data.count}</span>
                    </div>
                    <div>
                      <span>{t('payroll:statistics.total')}</span>
                      <span className="font-medium">${data.totalPay.toFixed(2)}</span>
                    </div>
                    <div>
                      <span>{t('payroll:statistics.avgHours')}</span>
                      <span className="font-medium">{data.avgHours.toFixed(1)}h</span>
                    </div>
                    <div>
                      <span>{t('payroll:statistics.avgRate')}</span>
                      <span className="font-medium">${data.avgRate.toFixed(2)}/h</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-xl">💰</span>
          {t('payroll:statistics.costBreakdown')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              ${payrollStats.totalGrossPay.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">{t('payroll:statistics.grossPay')}</div>
            <div className="text-xs text-gray-500 mt-1">
              {t('payroll:statistics.percentOfCost', { value: ((payrollStats.totalGrossPay / (payrollStats.totalGrossPay + payrollStats.totalTaxes + payrollStats.totalBenefits)) * 100).toFixed(1) })}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              ${payrollStats.totalTaxes.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">{t('payroll:statistics.taxes')}</div>
            <div className="text-xs text-gray-500 mt-1">
              {t('payroll:statistics.percentOfCost', { value: ((payrollStats.totalTaxes / (payrollStats.totalGrossPay + payrollStats.totalTaxes + payrollStats.totalBenefits)) * 100).toFixed(1) })}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              ${payrollStats.totalBenefits.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">{t('payroll:statistics.benefits')}</div>
            <div className="text-xs text-gray-500 mt-1">
              {t('payroll:statistics.percentOfCost', { value: ((payrollStats.totalBenefits / (payrollStats.totalGrossPay + payrollStats.totalTaxes + payrollStats.totalBenefits)) * 100).toFixed(1) })}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              ${(payrollStats.totalGrossPay + payrollStats.totalTaxes + payrollStats.totalBenefits).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">{t('payroll:statistics.totalCost')}</div>
            <div className="text-xs text-gray-500 mt-1">
              {t('payroll:statistics.allInLaborCost')}
            </div>
          </div>
        </div>
      </div>

      {/* Overtime Analysis */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-xl">⚡</span>
          {t('payroll:statistics.overtimeAnalysis')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {payrollStats.overtimePercentage.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 mt-1">{t('payroll:statistics.overtimeRate')}</div>
              <div className="text-xs text-gray-500 mt-2">
                {t('payroll:statistics.overtimeHoursLabel', { value: payrollStats.totalOvertimeHours.toFixed(1) })}
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                ${payrollStats.overtimeCost.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600 mt-1">{t('payroll:statistics.overtimeCost')}</div>
              <div className="text-xs text-gray-500 mt-2">
                {t('payroll:statistics.overtimePremium', { value: `$${payrollStats.overtimePremium.toFixed(2)}` })}
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {payrollStats.employeesWithOvertime}
              </div>
              <div className="text-sm text-gray-600 mt-1">{t('payroll:statistics.employeesWithOT')}</div>
              <div className="text-xs text-gray-500 mt-2">
                {t('payroll:statistics.ofWorkforce', { value: ((payrollStats.employeesWithOvertime / payrollStats.totalEmployees) * 100).toFixed(1) })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trends */}
      {payrollTrends && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-xl">📈</span>
            {t('payroll:statistics.trendsTitle')}
          </h3>
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-4">📊</div>
            <p>{t('payroll:statistics.trendsPlaceholder')}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollStatistics;
