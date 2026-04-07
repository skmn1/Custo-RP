import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useEmployees } from '../hooks/useEmployees';
import { usePos } from '../hooks/usePos';
import EmployeeModal from '../components/employees/EmployeeModal';
import EmployeeFilters from '../components/employees/EmployeeFilters';
import EmployeeStats from '../components/employees/EmployeeStats';
import EmployeeList from '../components/employees/EmployeeList';
import EmployeeGrid from '../components/employees/EmployeeGrid';
import EmployeeCards from '../components/employees/EmployeeCards';
import Button from '../components/ui/Button';

const EmployeesPage = () => {
  const { t } = useTranslation(['employees', 'common']);
  const {
    employees,
    roles,
    stats,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    searchTerm,
    setSearchTerm,
    filterPos,
    setFilterPos,
    filterRole,
    setFilterRole,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
  } = useEmployees();

  const { posList, fetchPosList } = usePos();

  useEffect(() => {
    fetchPosList().catch(() => {});
  }, [fetchPosList]);

  const [viewMode, setViewMode] = useState('list'); // 'list', 'grid', 'cards'
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setShowModal(true);
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setShowModal(true);
  };

  const handleDeleteEmployee = (employeeId) => {
    if (window.confirm(t('employees:confirmDelete'))) {
      deleteEmployee(employeeId);
    }
  };

  const handleSaveEmployee = (employeeData) => {
    if (editingEmployee) {
      updateEmployee(editingEmployee.id, employeeData);
    } else {
      addEmployee(employeeData);
    }
    setShowModal(false);
    setEditingEmployee(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
  };

  const renderEmployees = () => {
    const commonProps = {
      employees,
      onEdit: handleEditEmployee,
      onDelete: handleDeleteEmployee,
      posList,
    };

    switch (viewMode) {
      case 'grid':
        return <EmployeeGrid {...commonProps} />;
      case 'cards':
        return <EmployeeCards {...commonProps} />;
      default:
        return <EmployeeList {...commonProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('employees:title')}</h1>
              <p className="text-sm text-gray-600 mt-1">
                {t('employees:subtitleStats', { count: employees.length })}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button onClick={handleAddEmployee} className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>{t('employees:addEmployee')}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <EmployeeStats stats={stats} />

        {/* Filters and View Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Filters */}
              <EmployeeFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterPos={filterPos}
                setFilterPos={setFilterPos}
                filterRole={filterRole}
                setFilterRole={setFilterRole}
                sortBy={sortBy}
                setSortBy={setSortBy}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                posList={posList}
                roles={roles}
              />

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'cards'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Employee Display */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {employees.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">{t('employees:noEmployeesFound')}</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterPos || filterRole
                  ? t('employees:tryAdjustingFilters')
                  : t('employees:getStartedAdding')}
              </p>
              {!searchTerm && !filterPos && !filterRole && (
                <Button onClick={handleAddEmployee}>{t('employees:addEmployee')}</Button>
              )}
            </div>
          ) : (
            renderEmployees()
          )}
        </div>
      </div>

      {/* Employee Modal */}
      <EmployeeModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={handleSaveEmployee}
        employee={editingEmployee}
        roles={roles}
        posList={posList}
      />
    </div>
  );
};

export default EmployeesPage;
