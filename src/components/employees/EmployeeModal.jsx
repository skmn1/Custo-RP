import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';

const EmployeeModal = ({ isOpen, onClose, onSave, employee, departments, roles }) => {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    department: '',
    maxHours: 40,
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        role: employee.role || '',
        email: employee.email || '',
        department: employee.department || '',
        maxHours: employee.maxHours || 40,
      });
    } else {
      setFormData({
        name: '',
        role: '',
        email: '',
        department: '',
        maxHours: 40,
      });
    }
    setErrors({});
  }, [employee, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.role.trim()) {
      newErrors.role = 'Role is required';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }

    if (!formData.maxHours || formData.maxHours < 1 || formData.maxHours > 80) {
      newErrors.maxHours = 'Max hours must be between 1 and 80';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxHours' ? parseInt(value) || 0 : value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  const isFormValid = () => {
    return formData.name.trim() && 
           formData.email.trim() && 
           formData.role.trim() && 
           formData.department.trim() && 
           formData.maxHours > 0 && 
           formData.maxHours <= 80 &&
           /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={employee ? 'Edit Employee' : 'Add New Employee'}
      size="lg"
      showValidate={true}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                  errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500'
                }`}
                placeholder="Enter full name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                  errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500'
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                    errors.role ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500'
                  }`}
                  placeholder="Enter role"
                  list="roles"
                />
                <datalist id="roles">
                  {roles.map(role => (
                    <option key={role} value={role} />
                  ))}
                </datalist>
              </div>
              {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                    errors.department ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500'
                  }`}
                  placeholder="Enter department"
                  list="departments"
                />
                <datalist id="departments">
                  {departments.map(dept => (
                    <option key={dept} value={dept} />
                  ))}
                </datalist>
              </div>
              {errors.department && <p className="mt-1 text-sm text-red-600">{errors.department}</p>}
            </div>
          </div>
        </div>

        {/* Schedule Information */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Schedule Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Hours per Week *
              </label>
              <input
                type="number"
                name="maxHours"
                value={formData.maxHours}
                onChange={handleChange}
                min="1"
                max="80"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                  errors.maxHours ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500'
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
                    {formData.name ? formData.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase() : '??'}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {formData.name || 'Employee Name'}
                    </div>
                    <div className="text-xs text-gray-600">
                      {formData.role || 'Role'} • {formData.department || 'Department'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          * Required fields
        </div>
      </div>
    </Modal>
  );
};

export default EmployeeModal;
