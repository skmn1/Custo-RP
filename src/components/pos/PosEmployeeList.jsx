import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const ROLE_SUGGESTIONS = [
  'Store Manager', 'Assistant Manager', 'Cashier', 'Butcher',
  'Baker', 'Deli Clerk', 'Stock Clerk', 'Sales Associate',
  'Shift Lead', 'Technician', 'Cook', 'Server',
];

const DEPARTMENT_SUGGESTIONS = [
  'Management', 'Sales', 'Production', 'Kitchen',
  'Front of House', 'Warehouse', 'Administration', 'General',
];

const PosEmployeeList = ({ employees = [], posId, onAdd, onUpdate, onRemove }) => {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [form, setForm] = useState({
    name: '',
    role: '',
    email: '',
    department: '',
    maxHours: 40,
    isManager: false,
  });
  const [formErrors, setFormErrors] = useState({});

  const filtered = search.trim()
    ? employees.filter(
        (e) =>
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          e.role.toLowerCase().includes(search.toLowerCase()) ||
          e.department.toLowerCase().includes(search.toLowerCase())
      )
    : employees;

  // --- Form helpers ---
  const resetForm = () => {
    setForm({ name: '', role: '', email: '', department: '', maxHours: 40, isManager: false });
    setFormErrors({});
  };

  const openCreate = () => {
    setEditingEmployee(null);
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (emp) => {
    setEditingEmployee(emp);
    setForm({
      name: emp.name || '',
      role: emp.role || '',
      email: emp.email || '',
      department: emp.department || '',
      maxHours: emp.maxHours || 40,
      isManager: emp.isManager || false,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name === 'maxHours' ? parseInt(value) || 0 : value,
    }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email';
    if (!form.role.trim()) errs.role = 'Role is required';
    if (!form.department.trim()) errs.department = 'Department is required';
    if (!form.maxHours || form.maxHours < 1 || form.maxHours > 80)
      errs.maxHours = 'Must be 1–80';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const isFormValid =
    form.name.trim() &&
    form.email.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    form.role.trim() &&
    form.department.trim() &&
    form.maxHours >= 1 &&
    form.maxHours <= 80;

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      if (editingEmployee) {
        await onUpdate(posId, editingEmployee.id, form);
      } else {
        await onAdd(posId, form);
      }
      setModalOpen(false);
      resetForm();
    } catch {
      // error handled by hook
    }
  };

  const handleRemoveConfirm = async () => {
    if (!deleteConfirm) return;
    try {
      await onRemove(posId, deleteConfirm.id);
    } catch {
      // error handled by hook
    }
    setDeleteConfirm(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6" data-testid="pos-employee-section">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Employees</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {employees.length} employee{employees.length !== 1 ? 's' : ''} assigned to this location
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={openCreate} data-testid="pos-add-employee-btn">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Employee
          </span>
        </Button>
      </div>

      {/* Search */}
      {employees.length > 0 && (
        <div className="mb-5">
          <div className="relative max-w-md">
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
              placeholder="Search employees..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Employee Grid — matches existing EmployeeCards style */}
      {filtered.length === 0 ? (
        <div className="text-center py-10" data-testid="pos-employee-empty">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          <h3 className="text-sm font-medium text-gray-900 mb-1">No employees found</h3>
          <p className="text-xs text-gray-500">
            {search ? 'Try a different search term.' : 'Add employees to this PoS location.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((emp) => (
            <div
              key={emp.id}
              data-testid="pos-employee-card"
              className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all duration-200 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-14 h-14 ${emp.color || 'bg-gray-500'} rounded-full flex items-center justify-center text-white font-bold text-base shadow-lg`}
                  >
                    {emp.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 mb-0.5 truncate">
                      {emp.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1.5">{emp.role}</p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {emp.department}
                      </span>
                      {emp.isManager && (
                        <span className="inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                          Manager
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions — visible on hover like EmployeeCards */}
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(emp)}
                    className="text-indigo-600 hover:text-indigo-800 p-2 rounded-full hover:bg-indigo-50 transition-colors"
                    title="Edit employee"
                    data-testid="pos-employee-edit-btn"
                  >
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(emp)}
                    className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors"
                    title="Remove employee"
                    data-testid="pos-employee-remove-btn"
                  >
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Detail row */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-xs font-medium text-gray-500">Max Hours</dt>
                    <dd className="mt-0.5 text-sm font-semibold text-gray-900">{emp.maxHours}h/week</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500">Email</dt>
                    <dd className="mt-0.5 text-sm text-gray-900 truncate" title={emp.email}>
                      <a href={`mailto:${emp.email}`} className="text-indigo-600 hover:text-indigo-800 transition-colors">
                        {emp.email}
                      </a>
                    </dd>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Employee Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingEmployee ? 'Edit Employee' : 'Add Employee to PoS'}
        size="lg"
        showValidate
        onValidate={handleSubmit}
        validateText={editingEmployee ? 'Update Employee' : 'Add Employee'}
        validateDisabled={!isFormValid}
      >
        <div className="space-y-6">
          {/* Personal Information */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  data-testid="pos-emp-name-input"
                  value={form.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                    formErrors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500'
                  }`}
                  placeholder="Enter full name"
                />
                {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  data-testid="pos-emp-email-input"
                  value={form.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                    formErrors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500'
                  }`}
                  placeholder="Enter email address"
                />
                {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
              </div>
            </div>
          </div>

          {/* Work Information */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Work Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                <div className="relative">
                  <input
                    type="text"
                    name="role"
                    data-testid="pos-emp-role-input"
                    value={form.role}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                      formErrors.role ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500'
                    }`}
                    placeholder="Enter role"
                    list="pos-emp-roles"
                  />
                  <datalist id="pos-emp-roles">
                    {ROLE_SUGGESTIONS.map((r) => (
                      <option key={r} value={r} />
                    ))}
                  </datalist>
                </div>
                {formErrors.role && <p className="mt-1 text-sm text-red-600">{formErrors.role}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                <div className="relative">
                  <input
                    type="text"
                    name="department"
                    data-testid="pos-emp-dept-input"
                    value={form.department}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                      formErrors.department ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500'
                    }`}
                    placeholder="Enter department"
                    list="pos-emp-depts"
                  />
                  <datalist id="pos-emp-depts">
                    {DEPARTMENT_SUGGESTIONS.map((d) => (
                      <option key={d} value={d} />
                    ))}
                  </datalist>
                </div>
                {formErrors.department && <p className="mt-1 text-sm text-red-600">{formErrors.department}</p>}
              </div>
            </div>
          </div>

          {/* Schedule & Flags */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Schedule & Status</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Hours per Week *</label>
                <input
                  type="number"
                  name="maxHours"
                  data-testid="pos-emp-hours-input"
                  value={form.maxHours}
                  onChange={handleChange}
                  min="1"
                  max="80"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                    formErrors.maxHours ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500'
                  }`}
                  placeholder="40"
                />
                {formErrors.maxHours && <p className="mt-1 text-sm text-red-600">{formErrors.maxHours}</p>}
                <p className="mt-1 text-xs text-gray-500">Hours between 1 and 80</p>
              </div>
              <div className="flex items-end">
                <div className="bg-gray-50 rounded-lg p-4 w-full">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isManager"
                      data-testid="pos-emp-manager-toggle"
                      checked={form.isManager}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="text-sm font-semibold text-gray-900">Manager Status</span>
                      <p className="text-xs text-gray-500 mt-0.5">
                        This employee can be assigned as PoS manager
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Preview</div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {form.name
                  ? form.name.split(' ').map((n) => n.charAt(0)).join('').toUpperCase()
                  : '??'}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">{form.name || 'Employee Name'}</div>
                <div className="text-xs text-gray-600">
                  {form.role || 'Role'} • {form.department || 'Department'}
                  {form.isManager && (
                    <span className="ml-2 inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                      Manager
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500">* Required fields</div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-300/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div data-testid="pos-employee-delete-dialog" className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Remove Employee</h3>
              <p className="text-sm text-gray-600 text-center">
                Are you sure you want to remove{' '}
                <span className="font-semibold">{deleteConfirm.name}</span> from this location?
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <Button variant="secondary" size="sm" onClick={() => setDeleteConfirm(null)} data-testid="pos-emp-delete-cancel">
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleRemoveConfirm} data-testid="pos-emp-delete-confirm">
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PosEmployeeList;
