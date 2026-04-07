import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import Button from '../ui/Button';
import PayrollDetailsModal from './PayrollDetailsModal';

const PayrollEmployeeList = ({ payrollData, employees }) => {
  const { t } = useTranslation(['payroll']);
  const { employeePayrolls } = payrollData;
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [sortField, setSortField] = useState('grossPay');
  const [sortDirection, setSortDirection] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  // Get unique departments
  const departments = [...new Set(employees.map(emp => emp.department))];

  // Filter and sort employees
  const filteredEmployees = employeePayrolls
    .filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           emp.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = departmentFilter === 'all' || emp.department === departmentFilter;
      return matchesSearch && matchesDepartment;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const direction = sortDirection === 'asc' ? 1 : -1;
      return (aValue - bValue) * direction;
    });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↗️' : '↘️';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('payroll:employeeList.title')}</h2>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder={t('payroll:employeeList.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">{t('payroll:employeeList.allDepartments')}</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Employee Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('payroll:table.employee')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('grossPay')}
              >
                <div className="flex items-center gap-1">
                  {t('payroll:table.grossPay')} {getSortIcon('grossPay')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('netPay')}
              >
                <div className="flex items-center gap-1">
                  {t('payroll:table.netPay')} {getSortIcon('netPay')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('totalHours')}
              >
                <div className="flex items-center gap-1">
                  {t('payroll:table.hours')} {getSortIcon('totalHours')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('overtimeHours')}
              >
                <div className="flex items-center gap-1">
                  {t('payroll:table.overtime')} {getSortIcon('overtimeHours')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('hourlyRate')}
              >
                <div className="flex items-center gap-1">
                  {t('payroll:table.rate')} {getSortIcon('hourlyRate')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('payroll:table.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEmployees.map((employee) => (
              <tr key={employee.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                      <div className="text-sm text-gray-500">{employee.role}</div>
                      <div className="text-xs text-gray-400">{employee.department}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">${employee.grossPay.toFixed(2)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">${employee.netPay.toFixed(2)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{employee.totalHours.toFixed(1)}h</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {employee.overtimeHours > 0 ? (
                      <span className="text-orange-600 font-medium">{employee.overtimeHours.toFixed(1)}h</span>
                    ) : (
                      <span className="text-gray-400">0h</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">${employee.hourlyRate.toFixed(2)}/h</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Button
                    onClick={() => setSelectedEmployee(employee)}
                    variant="outline"
                    size="sm"
                  >
                    {t('payroll:employeeList.viewDetails')}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">
            {t('payroll:employeeList.showing', { shown: filteredEmployees.length, total: employeePayrolls.length })}
          </span>
          <div className="flex gap-6">
            <span className="text-gray-600">
              {t('payroll:employeeList.totalGross')}: <span className="font-semibold text-gray-900">
                ${filteredEmployees.reduce((sum, emp) => sum + emp.grossPay, 0).toFixed(2)}
              </span>
            </span>
            <span className="text-gray-600">
              {t('payroll:employeeList.totalHours')}: <span className="font-semibold text-gray-900">
                {filteredEmployees.reduce((sum, emp) => sum + emp.totalHours, 0).toFixed(1)}h
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Payroll Details Modal */}
      {selectedEmployee && (
        <PayrollDetailsModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )}
    </div>
  );
};

export default PayrollEmployeeList;
