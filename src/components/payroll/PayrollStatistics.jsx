import React from 'react';
import StatCard from '../ui/StatCard';

const PayrollStatistics = ({ payrollData }) => {
  const { payrollStats, departmentPayroll, rolePayroll, payrollTrends } = payrollData;

  const statsCards = [
    {
      title: 'Average Hourly Rate',
      value: `$${payrollStats.avgHourlyRate.toFixed(2)}`,
      icon: '💵',
      color: 'blue',
      change: payrollStats.rateChange || 0,
    },
    {
      title: 'Overtime Rate',
      value: `${payrollStats.overtimePercentage.toFixed(1)}%`,
      icon: '⚡',
      color: 'orange',
      change: payrollStats.overtimeChange || 0,
    },
    {
      title: 'Total Tax Burden',
      value: `$${payrollStats.totalTaxes.toFixed(2)}`,
      icon: '📊',
      color: 'red',
      change: payrollStats.taxChange || 0,
    },
    {
      title: 'Benefits Cost',
      value: `$${payrollStats.totalBenefits.toFixed(2)}`,
      icon: '🏥',
      color: 'green',
      change: payrollStats.benefitsChange || 0,
    },
    {
      title: 'Labor Cost Ratio',
      value: `${payrollStats.laborCostRatio.toFixed(1)}%`,
      icon: '📈',
      color: 'purple',
      change: payrollStats.laborRatioChange || 0,
    },
    {
      title: 'Average Weekly Hours',
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payroll Statistics</h2>
        <p className="text-gray-600">Comprehensive payroll analytics and insights</p>
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
            Department Analysis
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
                      <span>{data.employeeCount} employees</span>
                      <span>{percentage.toFixed(1)}% of total</span>
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
            Role Analysis
          </h3>
          <div className="space-y-4">
            {Object.entries(rolePayroll)
              .sort(([,a], [,b]) => b.avgPay - a.avgPay)
              .map(([role, data]) => (
                <div key={role} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-900">{role}</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ${data.avgPay.toFixed(2)} avg
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                    <div>
                      <span>Count: </span>
                      <span className="font-medium">{data.count}</span>
                    </div>
                    <div>
                      <span>Total: </span>
                      <span className="font-medium">${data.totalPay.toFixed(2)}</span>
                    </div>
                    <div>
                      <span>Avg Hours: </span>
                      <span className="font-medium">{data.avgHours.toFixed(1)}h</span>
                    </div>
                    <div>
                      <span>Avg Rate: </span>
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
          Cost Breakdown Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              ${payrollStats.totalGrossPay.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Gross Pay</div>
            <div className="text-xs text-gray-500 mt-1">
              {((payrollStats.totalGrossPay / (payrollStats.totalGrossPay + payrollStats.totalTaxes + payrollStats.totalBenefits)) * 100).toFixed(1)}% of total cost
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              ${payrollStats.totalTaxes.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Taxes</div>
            <div className="text-xs text-gray-500 mt-1">
              {((payrollStats.totalTaxes / (payrollStats.totalGrossPay + payrollStats.totalTaxes + payrollStats.totalBenefits)) * 100).toFixed(1)}% of total cost
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              ${payrollStats.totalBenefits.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Benefits</div>
            <div className="text-xs text-gray-500 mt-1">
              {((payrollStats.totalBenefits / (payrollStats.totalGrossPay + payrollStats.totalTaxes + payrollStats.totalBenefits)) * 100).toFixed(1)}% of total cost
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              ${(payrollStats.totalGrossPay + payrollStats.totalTaxes + payrollStats.totalBenefits).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Total Cost</div>
            <div className="text-xs text-gray-500 mt-1">
              All-in labor cost
            </div>
          </div>
        </div>
      </div>

      {/* Overtime Analysis */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-xl">⚡</span>
          Overtime Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {payrollStats.overtimePercentage.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 mt-1">Overtime Rate</div>
              <div className="text-xs text-gray-500 mt-2">
                {payrollStats.totalOvertimeHours.toFixed(1)} overtime hours
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                ${payrollStats.overtimeCost.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Overtime Cost</div>
              <div className="text-xs text-gray-500 mt-2">
                ${payrollStats.overtimePremium.toFixed(2)} premium
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {payrollStats.employeesWithOvertime}
              </div>
              <div className="text-sm text-gray-600 mt-1">Employees with OT</div>
              <div className="text-xs text-gray-500 mt-2">
                {((payrollStats.employeesWithOvertime / payrollStats.totalEmployees) * 100).toFixed(1)}% of workforce
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
            Payroll Trends
          </h3>
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-4">📊</div>
            <p>Trend analysis will be available with more historical data</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollStatistics;
