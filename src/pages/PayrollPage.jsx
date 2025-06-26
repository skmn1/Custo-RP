import React, { useState } from 'react';
import { useEmployees } from '../hooks/useEmployees';
import { useShifts } from '../hooks/useShifts';
import { usePayroll } from '../hooks/usePayroll';
import PayrollDashboard from '../components/payroll/PayrollDashboard';
import PayrollEmployeeList from '../components/payroll/PayrollEmployeeList';
import PayrollStatistics from '../components/payroll/PayrollStatistics';
import PayrollAccounting from '../components/payroll/PayrollAccounting';
import PayrollExport from '../components/payroll/PayrollExport';

const PayrollPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { employees } = useEmployees();
  const { shifts } = useShifts();
  const payrollData = usePayroll(employees, shifts);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'employees', label: 'Employee Payroll', icon: '👥' },
    { id: 'statistics', label: 'Statistics', icon: '📈' },
    { id: 'accounting', label: 'Accounting', icon: '💰' },
    { id: 'export', label: 'Export & Reports', icon: '📄' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <PayrollDashboard payrollData={payrollData} />;
      case 'employees':
        return <PayrollEmployeeList payrollData={payrollData} employees={employees} />;
      case 'statistics':
        return <PayrollStatistics payrollData={payrollData} />;
      case 'accounting':
        return <PayrollAccounting payrollData={payrollData} />;
      case 'export':
        return <PayrollExport payrollData={payrollData} employees={employees} />;
      default:
        return <PayrollDashboard payrollData={payrollData} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Payroll Management</h1>
          <p className="text-gray-600">
            Manage employee payroll, calculate wages, and generate reports
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default PayrollPage;
