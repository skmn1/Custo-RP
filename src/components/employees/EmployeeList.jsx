import React from 'react';
import { useTranslation } from 'react-i18next';

const EmployeeList = ({ employees, onEdit, onDelete, posList = [] }) => {
  const { t } = useTranslation(['employees']);
  return (
    <div className="overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('employees:table.employee')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('employees:table.role')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('employees:table.pos')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('employees:table.maxHours')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('employees:table.contact')}
            </th>
            <th className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {employees.map((employee) => (
            <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 h-10 w-10 ${employee.color} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                    {employee.avatar}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {employee.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {t('employees:table.id', { id: employee.id })}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{employee.role}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                  {posList.find(p => p.id === employee.posId)?.name ?? '—'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{t('employees:hoursPerWeek', { value: employee.maxHours })}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{employee.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => onEdit(employee)}
                    className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 transition-colors"
                    title={t('employees:actions.edit')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(employee.id)}
                    className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors"
                    title={t('employees:actions.delete')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeList;
