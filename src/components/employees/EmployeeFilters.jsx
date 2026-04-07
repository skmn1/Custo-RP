import React from 'react';
import { useTranslation } from 'react-i18next';

const EmployeeFilters = ({
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
  posList,
  roles,
}) => {
  const { t } = useTranslation(['employees']);
  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterPos('');
    setFilterRole('');
    setSortBy('name');
    setSortOrder('asc');
  };

  const hasActiveFilters = searchTerm || filterPos || filterRole || sortBy !== 'name' || sortOrder !== 'asc';

  return (
    <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4 lg:items-end">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('employees:filters.search')}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('employees:placeholders.search')}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* PoS Location Filter */}
      <div className="min-w-0 flex-shrink-0">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('employees:filters.posLocation')}
        </label>
        <select
          value={filterPos}
          onChange={(e) => setFilterPos(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">{t('employees:filters.allLocations')}</option>
          {(posList || []).map(pos => (
            <option key={pos.id} value={String(pos.id)}>{pos.name}</option>
          ))}
        </select>
      </div>

      {/* Role Filter */}
      <div className="min-w-0 flex-shrink-0">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('employees:filters.role')}
        </label>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">{t('employees:filters.allRoles')}</option>
          {roles.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>

      {/* Sort By */}
      <div className="min-w-0 flex-shrink-0">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('employees:filters.sortBy')}
        </label>
        <div className="flex space-x-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="block px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="name">{t('employees:filters.sortName')}</option>
            <option value="role">{t('employees:filters.sortRole')}</option>
            <option value="maxHours">{t('employees:filters.sortMaxHours')}</option>
          </select>
          <button
            onClick={() => handleSortChange(sortBy)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            title={sortOrder === 'asc' ? t('employees:filters.sortDescending') : t('employees:filters.sortAscending')}
          >
            {sortOrder === 'asc' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="flex-shrink-0">
          <button
            onClick={clearFilters}
            className="mt-6 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            {t('employees:filters.clearAll')}
          </button>
        </div>
      )}
    </div>
  );
};

export default EmployeeFilters;
