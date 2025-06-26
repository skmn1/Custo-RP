import React from 'react';
import { format } from 'date-fns';
import StatCard from '../ui/StatCard';
import PayrollPeriodSelector from './PayrollPeriodSelector';

const PayrollDashboard = ({ payrollData }) => {
  const {
    payrollSummary,
    selectedPayPeriod,
    setSelectedPayPeriod,
    navigatePayPeriod,
    topEarners,
    departmentPayroll,
    recentPayPeriods
  } = payrollData;

  const quickStats = [
    {
      title: 'Total Gross Pay',
      value: `$${payrollSummary.totalGrossPay.toFixed(2)}`,
      icon: '💰',
      color: 'green',
      change: payrollSummary.grossPayChange || 0,
    },
    {
      title: 'Total Net Pay',
      value: `$${payrollSummary.totalNetPay.toFixed(2)}`,
      icon: '💵',
      color: 'blue',
      change: payrollSummary.netPayChange || 0,
    },
    {
      title: 'Total Hours',
      value: payrollSummary.totalHours.toFixed(1),
      icon: '⏰',
      color: 'purple',
      change: payrollSummary.hoursChange || 0,
    },
    {
      title: 'Overtime Hours',
      value: payrollSummary.totalOvertimeHours.toFixed(1),
      icon: '⚡',
      color: 'orange',
      change: payrollSummary.overtimeChange || 0,
    },
    {
      title: 'Total Employees',
      value: payrollSummary.totalEmployees,
      icon: '👥',
      color: 'indigo',
      change: 0,
    },
    {
      title: 'Avg. Hourly Rate',
      value: `$${payrollSummary.avgHourlyRate.toFixed(2)}`,
      icon: '📊',
      color: 'pink',
      change: 0,
    },
  ];

  return (
    <div className="p-6">
      {/* Pay Period Selector */}
      <div className="mb-8">
        <PayrollPeriodSelector
          selectedPayPeriod={selectedPayPeriod}
          onPeriodChange={setSelectedPayPeriod}
          onNavigate={navigatePayPeriod}
        />
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {quickStats.map((stat, index) => (
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

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Earners */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-xl">🏆</span>
            Top Earners This Period
          </h3>
          <div className="space-y-3">
            {topEarners.slice(0, 5).map((employee, index) => (
              <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{employee.name}</div>
                    <div className="text-sm text-gray-500">{employee.role}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">${employee.grossPay.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">{employee.totalHours.toFixed(1)}h</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-xl">🏢</span>
            Payroll by Department
          </h3>
          <div className="space-y-3">
            {Object.entries(departmentPayroll).map(([department, data]) => (
              <div key={department} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{department}</div>
                  <div className="text-sm text-gray-500">{data.employeeCount} employees</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">${data.totalPay.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">{data.totalHours.toFixed(1)}h</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Pay Periods */}
      <div className="mt-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-xl">📅</span>
            Recent Pay Periods
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gross Pay
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Pay
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employees
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentPayPeriods.slice(0, 5).map((period, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(period.start, 'MMM dd')} - {format(period.end, 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${period.grossPay.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${period.netPay.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {period.totalHours.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {period.employeeCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollDashboard;
