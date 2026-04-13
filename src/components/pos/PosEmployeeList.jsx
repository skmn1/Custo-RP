import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import EmployeeModal from '../employees/EmployeeModal';

const ROLE_SUGGESTIONS = [
  'Store Manager', 'Assistant Manager', 'Cashier', 'Butcher',
  'Baker', 'Deli Clerk', 'Stock Clerk', 'Sales Associate',
  'Shift Lead', 'Technician', 'Cook', 'Server',
];

// ── SVG icon helpers ──
const ListIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </svg>
);
const GridIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);
const CardsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);
const EditIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
const DeleteIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
const SwapIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
  </svg>
);

const ManagerBadge = () => {
  const { t } = useTranslation(['pos']);
  return (
    <span className="inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
      {t('pos:form.manager')}
    </span>
  );
};

// ── Cards View ──
const EmpCardsView = ({ employees, onEdit, onRemove, onSwap }) => {
  const { t } = useTranslation(['pos']);
  return (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
    {employees.map((emp) => (
      <div
        key={emp.id}
        data-testid="pos-employee-card"
        className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all duration-200 group"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-14 h-14 ${emp.color || 'bg-gray-500'} rounded-full flex items-center justify-center text-white font-bold text-base shadow-lg`}>
              {emp.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 mb-0.5 truncate">{emp.name}</h3>
              <p className="text-sm text-gray-600 mb-1.5">{emp.role}</p>
              <div className="flex flex-wrap items-center gap-1.5">
                {emp.isManager && <ManagerBadge />}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onSwap(emp)} className="text-emerald-600 hover:text-emerald-800 p-2 rounded-full hover:bg-emerald-50 transition-colors" title={t('pos:btn.edit')} data-testid="pos-employee-swap-btn">
              <SwapIcon className="w-4.5 h-4.5" />
            </button>
            <button onClick={() => onEdit(emp)} className="text-indigo-600 hover:text-indigo-800 p-2 rounded-full hover:bg-indigo-50 transition-colors" title={t('pos:btn.edit')} data-testid="pos-employee-edit-btn">
              <EditIcon className="w-4.5 h-4.5" />
            </button>
            <button onClick={() => onRemove(emp)} className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors" title={t('pos:btn.delete')} data-testid="pos-employee-remove-btn">
              <DeleteIcon className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-xs font-medium text-gray-500">{t('pos:emp.maxHours')}</dt>
              <dd className="mt-0.5 text-sm font-semibold text-gray-900">{emp.maxHours}{t('pos:emp.perWeek')}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500">{t('pos:emp.emailLabel')}</dt>
              <dd className="mt-0.5 text-sm text-gray-900 truncate" title={emp.email}>
                <a href={`mailto:${emp.email}`} className="text-indigo-600 hover:text-indigo-800 transition-colors">{emp.email}</a>
              </dd>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
  );
};

// ── Grid View ──
const EmpGridView = ({ employees, onEdit, onRemove, onSwap }) => {
  const { t } = useTranslation(['pos']);
  return (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
    {employees.map((emp) => (
      <div
        key={emp.id}
        data-testid="pos-employee-card"
        className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow duration-200 group"
      >
        <div className="flex items-center justify-between mb-3">
          <div className={`w-12 h-12 ${emp.color || 'bg-gray-500'} rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md`}>
            {emp.avatar}
          </div>
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onSwap(emp)} className="text-emerald-600 hover:text-emerald-800 p-1 rounded-full hover:bg-emerald-50 transition-colors" title={t('pos:btn.edit')} data-testid="pos-employee-swap-btn">
              <SwapIcon />
            </button>
            <button onClick={() => onEdit(emp)} className="text-indigo-600 hover:text-indigo-800 p-1 rounded-full hover:bg-indigo-50 transition-colors" title={t('pos:btn.edit')} data-testid="pos-employee-edit-btn">
              <EditIcon />
            </button>
            <button onClick={() => onRemove(emp)} className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors" title={t('pos:btn.delete')} data-testid="pos-employee-remove-btn">
              <DeleteIcon />
            </button>
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-base font-semibold text-gray-900 mb-1 truncate">{emp.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{emp.role}</p>
          {emp.isManager && (
            <div className="flex justify-center mb-2">
              <ManagerBadge />
            </div>
          )}
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">{t('pos:emp.maxHours')}:</span>
              <span className="font-medium">{emp.maxHours}{t('pos:emp.perWeek')}</span>
            </div>
            <div className="text-xs text-gray-400 truncate" title={emp.email}>{emp.email}</div>
          </div>
        </div>
      </div>
    ))}
  </div>
  );
};

// ── List View ──
const EmpListView = ({ employees, onEdit, onRemove, onSwap }) => {
  const { t } = useTranslation(['pos']);
  return (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('pos:emp.employee')}</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('pos:emp.role')}</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('pos:emp.maxHours')}</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('pos:emp.contact')}</th>
          <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {employees.map((emp) => (
          <tr key={emp.id} className="hover:bg-gray-50 transition-colors group">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 ${emp.color || 'bg-gray-500'} rounded-full flex items-center justify-center text-white font-semibold text-xs shrink-0`}>
                  {emp.avatar}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                  {emp.isManager && <ManagerBadge />}
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{emp.role}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{emp.maxHours}{t('pos:emp.perWeek')}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-[160px]">
              <a href={`mailto:${emp.email}`} className="text-indigo-600 hover:text-indigo-800">{emp.email}</a>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
              <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onSwap(emp)} className="text-emerald-600 hover:text-emerald-800 p-1 rounded-full hover:bg-emerald-50 transition-colors" title={t('pos:btn.edit')} data-testid="pos-employee-swap-btn">
                  <SwapIcon />
                </button>
                <button onClick={() => onEdit(emp)} className="text-indigo-600 hover:text-indigo-800 p-1 rounded-full hover:bg-indigo-50 transition-colors" title={t('pos:btn.edit')} data-testid="pos-employee-edit-btn">
                  <EditIcon />
                </button>
                <button onClick={() => onRemove(emp)} className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors" title={t('pos:btn.delete')} data-testid="pos-employee-remove-btn">
                  <DeleteIcon />
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

// ── Main Component ──
const PosEmployeeList = ({
  employees = [],
  posId,
  posName = '',
  onAdd,
  onAssign,
  onUpdate,
  onRemove,
  onSwap,
  onFetchAvailableEmployees,
}) => {
  const { t } = useTranslation(['pos']);
  const [search, setSearch]     = useState('');
  const [viewMode, setViewMode] = useState('cards');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // ── Assign existing modal ──
  const [assignOpen, setAssignOpen]                 = useState(false);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [availableSearch, setAvailableSearch]       = useState('');
  const [selectedExisting, setSelectedExisting]     = useState(null);
  const [availableLoading, setAvailableLoading]     = useState(false);

  // ── Shared EmployeeModal (create / edit) ──
  const [empModalOpen, setEmpModalOpen]     = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // ── Swap modal ──
  const [swapTarget, setSwapTarget]         = useState(null);
  const [swapCandidates, setSwapCandidates] = useState([]);
  const [swapSearch, setSwapSearch]         = useState('');
  const [selectedSwap, setSelectedSwap]     = useState(null);
  const [swapLoading, setSwapLoading]       = useState(false);

  // ── Filtered list ──
  const filtered = search.trim()
    ? employees.filter(
        (e) =>
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          e.role.toLowerCase().includes(search.toLowerCase())
      )
    : employees;

  // ── Assign existing handlers ──
  const openAssign = async () => {
    setSelectedExisting(null);
    setAvailableSearch('');
    setAvailableLoading(true);
    setAssignOpen(true);
    try {
      const available = await onFetchAvailableEmployees(posId);
      setAvailableEmployees(available);
    } catch {
      setAvailableEmployees([]);
    }
    setAvailableLoading(false);
  };

  const handleAssignConfirm = async () => {
    if (!selectedExisting) return;
    try {
      await onAssign(posId, selectedExisting.id);
      setAssignOpen(false);
      setSelectedExisting(null);
    } catch { /* handled by hook */ }
  };

  // ── EmployeeModal handlers ──
  const openCreate = () => {
    setEditingEmployee(null);
    setEmpModalOpen(true);
  };

  const openEdit = (emp) => {
    setEditingEmployee(emp);
    setEmpModalOpen(true);
  };

  const handleEmpSave = async (formData) => {
    try {
      if (editingEmployee) {
        await onUpdate(posId, editingEmployee.id, { ...formData, isManager: editingEmployee.isManager });
      } else {
        await onAdd(posId, { ...formData, isManager: false });
      }
      setEmpModalOpen(false);
      setEditingEmployee(null);
    } catch { /* handled by hook */ }
  };

  // ── Remove handler ──
  const handleRemoveConfirm = async () => {
    if (!deleteConfirm) return;
    try {
      await onRemove(posId, deleteConfirm.id);
    } catch { /* handled by hook */ }
    setDeleteConfirm(null);
  };

  // ── Swap handlers ──
  const openSwapModal = async (emp) => {
    setSwapTarget(emp);
    setSwapSearch('');
    setSelectedSwap(null);
    setSwapLoading(true);
    try {
      const candidates = await onFetchAvailableEmployees(posId);
      setSwapCandidates(candidates);
    } catch {
      setSwapCandidates([]);
    }
    setSwapLoading(false);
  };

  const closeSwapModal = () => {
    setSwapTarget(null);
    setSelectedSwap(null);
    setSwapCandidates([]);
    setSwapSearch('');
  };

  const handleSwapConfirm = async () => {
    if (!swapTarget || !selectedSwap) return;
    try {
      await onSwap(posId, swapTarget.id, selectedSwap.id);
    } catch { /* handled by hook */ }
    closeSwapModal();
  };

  const filteredSwapCandidates = swapSearch.trim()
    ? swapCandidates.filter(
        (e) =>
          e.name.toLowerCase().includes(swapSearch.toLowerCase()) ||
          e.role.toLowerCase().includes(swapSearch.toLowerCase())
      )
    : swapCandidates;

  // ── View toggle button ──
  const ViewBtn = ({ mode, icon: Icon }) => (
    <button
      onClick={() => setViewMode(mode)}
      data-testid={`pos-emp-view-${mode}-btn`}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        viewMode === mode
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-600 hover:text-gray-900'
      }`}
      title={`${mode.charAt(0).toUpperCase() + mode.slice(1)} view`}
    >
      <Icon />
    </button>
  );

  const renderView = () => {
    const props = { employees: filtered, onEdit: openEdit, onRemove: setDeleteConfirm, onSwap: openSwapModal };
    switch (viewMode) {
      case 'list':  return <EmpListView {...props} />;
      case 'grid':  return <EmpGridView {...props} />;
      default:      return <EmpCardsView {...props} />;
    }
  };

  const lockedPosList = posName ? [{ id: posId, name: posName }] : [];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6" data-testid="pos-employee-section">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{t('pos:emp.title')}</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {t('pos:emp.assignedCount', { count: employees.length })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={openAssign} data-testid="pos-assign-employee-btn">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {t('pos:emp.btnAssignExisting')}
            </span>
          </Button>
          <Button variant="primary" size="sm" onClick={openCreate} data-testid="pos-add-employee-btn">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {t('pos:emp.btnNewEmployee')}
            </span>
          </Button>
        </div>
      </div>

      {/* Search + View Toggle */}
      {employees.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div className="relative max-w-md flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              data-testid="pos-employee-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('pos:emp.searchPlaceholder')}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:outline-none"
            />
          </div>
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1" data-testid="pos-emp-view-toggle">
            <ViewBtn mode="list"  icon={ListIcon} />
            <ViewBtn mode="grid"  icon={GridIcon} />
            <ViewBtn mode="cards" icon={CardsIcon} />
          </div>
        </div>
      )}

      {/* Employee Display */}
      {filtered.length === 0 ? (
        <div className="text-center py-10" data-testid="pos-employee-empty">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          <h3 className="text-sm font-medium text-gray-900 mb-1">{t('pos:emp.noEmployeesTitle')}</h3>
          <p className="text-xs text-gray-500">
            {search ? t('pos:emp.noEmployeesSearch') : t('pos:emp.noEmployeesEmpty')}
          </p>
        </div>
      ) : (
        renderView()
      )}

      {/* ── Assign Existing Modal ── */}
      <Modal
        isOpen={assignOpen}
        onClose={() => setAssignOpen(false)}
        title={t('pos:emp.assignTitle')}
        size="lg"
        showValidate
        onValidate={handleAssignConfirm}
        validateText={t('pos:emp.btnAssign')}
        validateDisabled={!selectedExisting}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {t('pos:emp.assignDesc')}
          </p>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={availableSearch}
              onChange={(e) => setAvailableSearch(e.target.value)}
              placeholder={t('pos:emp.assignSearchPlaceholder')}
              className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              data-testid="pos-assign-search"
            />
          </div>
          {availableLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
          ) : (() => {
            const filteredAvailable = availableSearch.trim()
              ? availableEmployees.filter(
                  (e) =>
                    e.name.toLowerCase().includes(availableSearch.toLowerCase()) ||
                    e.role.toLowerCase().includes(availableSearch.toLowerCase())
                )
              : availableEmployees;
            return filteredAvailable.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-500">
                {availableSearch ? t('pos:emp.noMatchingEmployees') : t('pos:emp.noAvailableEmployees')}
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                {filteredAvailable.map((emp) => (
                  <div
                    key={emp.id}
                    onClick={() => setSelectedExisting(emp)}
                    data-testid="pos-assign-candidate"
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                      selectedExisting?.id === emp.id
                        ? 'bg-indigo-50 border-l-4 border-l-indigo-500'
                        : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className={`w-9 h-9 ${emp.color || 'bg-gray-500'} rounded-full flex items-center justify-center text-white font-semibold text-xs shrink-0`}>
                      {emp.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{emp.name}</div>
                      <div className="text-xs text-gray-500 truncate">{emp.role}</div>
                    </div>
                    {selectedExisting?.id === emp.id && (
                      <svg className="w-5 h-5 text-indigo-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}
          {selectedExisting && (
            <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 ${selectedExisting.color || 'bg-gray-500'} rounded-full flex items-center justify-center text-white font-semibold text-xs shrink-0`}>
                  {selectedExisting.avatar}
                </div>
                <div className="text-sm text-indigo-800">
                  <span className="font-semibold">{selectedExisting.name}</span>
                  <span className="text-indigo-600"> — {selectedExisting.role}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* ── Shared EmployeeModal (create / edit) ── */}
      <EmployeeModal
        isOpen={empModalOpen}
        onClose={() => { setEmpModalOpen(false); setEditingEmployee(null); }}
        onSave={handleEmpSave}
        employee={editingEmployee}
        roles={ROLE_SUGGESTIONS}
        posList={lockedPosList}
        lockedPosId={posId}
      />

      {/* ── Swap Employee Modal ── */}
      <Modal
        isOpen={!!swapTarget}
        onClose={closeSwapModal}
        title={swapTarget ? t('pos:emp.swapTitle', { name: swapTarget.name }) : t('pos:emp.swapTitleDefault')}
        size="lg"
        showValidate
        onValidate={handleSwapConfirm}
        validateText={t('pos:emp.btnSwap')}
        validateDisabled={!selectedSwap}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {t('pos:emp.swapDesc')}{' '}
            <span className="font-semibold">{swapTarget?.name}</span>.
          </p>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={swapSearch}
              onChange={(e) => setSwapSearch(e.target.value)}
              placeholder={t('pos:emp.assignSearchPlaceholder')}
              className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              data-testid="pos-swap-search"
            />
          </div>
          {swapLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
          ) : filteredSwapCandidates.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500">
              {swapSearch ? t('pos:emp.noMatchingEmployees') : t('pos:emp.noSwapCandidates')}
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
              {filteredSwapCandidates.map((emp) => (
                <div
                  key={emp.id}
                  onClick={() => setSelectedSwap(emp)}
                  data-testid="pos-swap-candidate"
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                    selectedSwap?.id === emp.id
                      ? 'bg-indigo-50 border-l-4 border-l-indigo-500'
                      : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                  }`}
                >
                  <div className={`w-9 h-9 ${emp.color || 'bg-gray-500'} rounded-full flex items-center justify-center text-white font-semibold text-xs shrink-0`}>
                    {emp.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{emp.name}</div>
                    <div className="text-xs text-gray-500 truncate">{emp.role}</div>
                  </div>
                  {selectedSwap?.id === emp.id && (
                    <svg className="w-5 h-5 text-indigo-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          )}
          {selectedSwap && (
            <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
              <div className="flex items-center gap-3">
                <SwapIcon className="w-5 h-5 text-indigo-600 shrink-0" />
                <div className="text-sm text-indigo-800">
                  <span className="font-semibold">{swapTarget?.name}</span>
                  {' ⇄ '}
                  <span className="font-semibold">{selectedSwap.name}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* ── Delete Confirmation ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-300/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div data-testid="pos-employee-delete-dialog" className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">{t('pos:emp.removeTitle')}</h3>
              <p className="text-sm text-gray-600 text-center">
                {t('pos:emp.removeConfirm')}{' '}
                <span className="font-semibold">{deleteConfirm.name}</span> {t('pos:emp.removeFromLocation')}
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <Button variant="secondary" size="sm" onClick={() => setDeleteConfirm(null)} data-testid="pos-emp-delete-cancel">
                {t('pos:emp.btnCancel')}
              </Button>
              <Button variant="danger" size="sm" onClick={handleRemoveConfirm} data-testid="pos-emp-delete-confirm">
                {t('pos:emp.btnRemove')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PosEmployeeList;
