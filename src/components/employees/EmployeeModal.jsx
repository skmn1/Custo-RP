import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import ComboBox from '../ui/ComboBox';

/**
 * Generic employee create / edit modal.
 *
 * Props:
 *  - employee      : existing employee object when editing, null/undefined when creating
 *  - roles         : string[] — list of role suggestions for teh ComboBox
 *  - posList       : { id, name }[] — all PoS locations for the select
 *  - lockedPosId   : number | string — when set, posId is pre-filled & disabled (PoS context)
 *  - onSave(data)  : called with form payload on submit
 */
const EmployeeModal = ({
  isOpen,
  onClose,
  onSave,
  employee,
  roles = [],
  posList = [],
  lockedPosId = null,
}) => {
  const initialForm = (emp) => ({
    name:     emp?.name     || '',
    role:     emp?.role     || '',
    email:    emp?.email    || '',
    maxHours: emp?.maxHours ?? 40,
    posId:    lockedPosId != null ? lockedPosId : (emp?.posId ?? ''),
  });

  const [formData, setFormData] = useState(initialForm(employee));
  const [errors, setErrors]     = useState({});

  useEffect(() => {
    setFormData(initialForm(employee));
    setErrors({});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee, isOpen, lockedPosId]);

  const validate = () => {
    const e = {};
    if (!formData.name.trim())  e.name  = 'Name is required';
    if (!formData.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = 'Please enter a valid email address';
    if (!formData.role.trim())  e.role  = 'Role is required';
    if (!formData.maxHours || formData.maxHours < 1 || formData.maxHours > 80)
      e.maxHours = 'Max hours must be between 1 and 80';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const isFormValid = () =>
    formData.name.trim() &&
    formData.role.trim() &&
    formData.email.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
    formData.maxHours >= 1 &&
    formData.maxHours <= 80;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxHours' ? parseInt(value) || 0 : value,
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = () => {
    if (validate()) onSave(formData);
  };

  const posName = posList.find(p => String(p.id) === String(formData.posId))?.name;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={employee ? 'Edit Employee' : 'Add New Employee'}
      size="lg"
      showValidate
      onValidate={handleSubmit}
      validateText={employee ? 'Update Employee' : 'Add Employee'}
      validateDisabled={!isFormValid()}
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
                value={formData.name}
                onChange={handleChange}
                autoFocus={!employee}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                  errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500'
                }`}
                placeholder="Enter full name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                  errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500'
                }`}
                placeholder="Enter email address"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
          </div>
        </div>

        {/* Work Information */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Work Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
              <ComboBox
                name="role"
                value={formData.role}
                onChange={handleChange}
                options={roles}
                placeholder="Select or type a role"
                error={!!errors.role}
              />
              {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
            </div>

            {/* Point of Sale */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Point of Sale{lockedPosId != null ? ' *' : ''}
              </label>
              <div className="relative">
                <select
                  name="posId"
                  value={formData.posId}
                  onChange={handleChange}
                  disabled={lockedPosId != null}
                  className={`w-full pl-3 pr-8 py-2 border rounded-md appearance-none text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                    lockedPosId != null
                      ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'border-gray-300 text-gray-900 focus:border-indigo-500'
                  }`}
                  style={{ backgroundImage: 'none' }}
                >
                  {lockedPosId == null && <option value="">— Not assigned —</option>}
                  {posList.map((pos) => (
                    <option key={pos.id} value={pos.id}>{pos.name}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none">
                  {lockedPosId != null ? (
                    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </div>
              {lockedPosId != null && (
                <p className="mt-1 text-xs text-indigo-500">Auto-filled from the PoS location</p>
              )}
            </div>
          </div>
        </div>

        {/* Schedule Information */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Schedule Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Hours per Week *</label>
              <input
                type="number"
                name="maxHours"
                value={formData.maxHours}
                onChange={handleChange}
                min="1"
                max="80"
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                  errors.maxHours ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500'
                }`}
                placeholder="40"
              />
              {errors.maxHours && <p className="mt-1 text-sm text-red-600">{errors.maxHours}</p>}
              <p className="mt-1 text-xs text-gray-500">Hours between 1 and 80</p>
            </div>

            <div className="flex items-end">
              <div className="bg-gray-50 rounded-lg p-4 w-full">
                <div className="text-sm font-medium text-gray-700 mb-2">Preview</div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {formData.name
                      ? formData.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase()
                      : '??'}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {formData.name || 'Employee Name'}
                    </div>
                    <div className="text-xs text-gray-600">
                      {formData.role || 'Role'}{posName ? ` · ${posName}` : ''}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500">* Required fields</div>
      </div>
    </Modal>
  );
};

export default EmployeeModal;
