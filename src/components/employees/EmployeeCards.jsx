import React from 'react';
import { useTranslation } from 'react-i18next';

const EmployeeCards = ({ employees, onEdit, onDelete, posList = [] }) => {
  const { t } = useTranslation(['employees']);
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {employees.map((employee) => (
          <div
            key={employee.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 ${employee.color} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                  {employee.avatar}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {employee.name}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    {employee.role}
                  </p>
                  <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-indigo-100 text-indigo-800">
                    {posList.find(p => p.id === employee.posId)?.name ?? '—'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEdit(employee)}
                  className="text-indigo-600 hover:text-indigo-800 p-2 rounded-full hover:bg-indigo-50 transition-colors"
                  title={t('employees:actions.edit')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(employee.id)}
                  className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors"
                  title={t('employees:actions.delete')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">{t('employees:table.maxHours')}</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">{t('employees:hoursPerWeek', { value: employee.maxHours })}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">{t('employees:fields.employeeId')}</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono">{employee.id}</dd>
                </div>
              </div>
              
              <div className="mt-4">
                <dt className="text-sm font-medium text-gray-500">{t('employees:fields.email')}</dt>
                <dd className="mt-1 text-sm text-gray-900 truncate" title={employee.email}>
                  <a 
                    href={`mailto:${employee.email}`}
                    className="text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    {employee.email}
                  </a>
                </dd>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeCards;
