import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../ui/Modal';
import {
  POS_TYPES,
  POS_TYPE_LABELS,
  DAYS_OF_WEEK,
  DAY_LABELS,
  DEFAULT_OPENING_HOURS,
} from '../../constants/pos';

const PosModal = ({ isOpen, onClose, onSubmit, initialData = null, mode = 'create', managers = [] }) => {
  const isEdit = mode === 'edit';

  const emptyForm = {
    name: '',
    address: '',
    type: '',
    phone: '',
    managerId: '',
    managerName: '',
    openingHours: { ...DEFAULT_OPENING_HOURS },
  };

  const [form, setForm] = useState(emptyForm);
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Reset form when modal opens / initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData && isEdit) {
        setForm({
          name: initialData.name || '',
          address: initialData.address || '',
          type: initialData.type || '',
          phone: initialData.phone || '',
          managerId: initialData.managerId ?? '',
          managerName: initialData.managerName || '',
          openingHours: initialData.openingHours
            ? JSON.parse(JSON.stringify(initialData.openingHours))
            : { ...DEFAULT_OPENING_HOURS },
        });
      } else {
        setForm({ ...emptyForm, openingHours: JSON.parse(JSON.stringify(DEFAULT_OPENING_HOURS)) });
      }
      setTouched({});
      setServerError(null);
      setSubmitting(false);
    }
  }, [isOpen, initialData, isEdit]);

  // --- Field change handlers ---
  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setServerError(null);
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleOpeningHoursChange = (day, field, value) => {
    setForm((prev) => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: { ...prev.openingHours[day], [field]: value },
      },
    }));
  };

  const handleClosedToggle = (day) => {
    setForm((prev) => {
      const current = prev.openingHours[day];
      const isClosed = !current.closed;
      return {
        ...prev,
        openingHours: {
          ...prev.openingHours,
          [day]: {
            open: isClosed ? null : '08:00',
            close: isClosed ? null : '20:00',
            closed: isClosed,
          },
        },
      };
    });
  };

  // --- Validation ---
  const errors = useMemo(() => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    else if (form.name.length > 100) errs.name = 'Name must be 100 characters or less';

    if (!form.address.trim()) errs.address = 'Address is required';
    else if (form.address.length > 255) errs.address = 'Address must be 255 characters or less';

    if (!form.type) errs.type = 'Type is required';

    // Opening hours validation
    const hoursErrors = {};
    DAYS_OF_WEEK.forEach((day) => {
      const hours = form.openingHours[day];
      if (!hours) {
        hoursErrors[day] = 'Hours required';
        return;
      }
      if (!hours.closed) {
        if (!hours.open) hoursErrors[day] = 'Open time required';
        else if (!hours.close) hoursErrors[day] = 'Close time required';
        else if (hours.close !== '00:00' && hours.open >= hours.close) {
          hoursErrors[day] = 'Close time must be after open time';
        }
      }
    });
    if (Object.keys(hoursErrors).length > 0) errs.openingHours = hoursErrors;

    return errs;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;

  // --- Submit ---
  const handleSubmit = async () => {
    // Touch all fields to show errors
    setTouched({
      name: true,
      address: true,
      type: true,
      phone: true,
      openingHours: true,
    });

    if (!isValid) return;

    setSubmitting(true);
    setServerError(null);

    try {
      const selectedManager = managers.find((m) => m.id === form.managerId);
      await onSubmit({
        name: form.name.trim(),
        address: form.address.trim(),
        type: form.type,
        phone: form.phone.trim() || null,
        managerId: form.managerId || null,
        managerName: selectedManager ? selectedManager.name : null,
        openingHours: form.openingHours,
      });
      onClose();
    } catch (err) {
      setServerError(err.message || 'An error occurred while saving');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit PoS Location' : 'Create New PoS Location'}
      size="2xl"
      showValidate
      validateText={submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create PoS'}
      validateDisabled={!isValid || submitting}
      onValidate={handleSubmit}
    >
      <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
        {/* Server error */}
        {serverError && (
          <div
            data-testid="pos-modal-server-error"
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
          >
            {serverError}
          </div>
        )}

        {/* Name */}
        <div>
          <label htmlFor="pos-name" className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="pos-name"
            data-testid="pos-name-input"
            type="text"
            maxLength={100}
            value={form.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            placeholder="e.g. Downtown Butcher Shop"
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              touched.name && errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {touched.name && errors.name && (
            <p data-testid="pos-name-error" className="mt-1 text-xs text-red-600">
              {errors.name}
            </p>
          )}
        </div>

        {/* Address */}
        <div>
          <label htmlFor="pos-address" className="block text-sm font-medium text-gray-700 mb-1">
            Address <span className="text-red-500">*</span>
          </label>
          <input
            id="pos-address"
            data-testid="pos-address-input"
            type="text"
            maxLength={255}
            value={form.address}
            onChange={(e) => handleFieldChange('address', e.target.value)}
            onBlur={() => handleBlur('address')}
            placeholder="e.g. 123 Main St, Downtown"
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              touched.address && errors.address ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {touched.address && errors.address && (
            <p data-testid="pos-address-error" className="mt-1 text-xs text-red-600">
              {errors.address}
            </p>
          )}
        </div>

        {/* Type */}
        <div>
          <label htmlFor="pos-type" className="block text-sm font-medium text-gray-700 mb-1">
            Type <span className="text-red-500">*</span>
          </label>
          <select
            id="pos-type"
            data-testid="pos-type-select"
            value={form.type}
            onChange={(e) => handleFieldChange('type', e.target.value)}
            onBlur={() => handleBlur('type')}
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              touched.type && errors.type ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="">Select type...</option>
            {POS_TYPES.map((t) => (
              <option key={t} value={t}>
                {POS_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
          {touched.type && errors.type && (
            <p data-testid="pos-type-error" className="mt-1 text-xs text-red-600">
              {errors.type}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="pos-phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            id="pos-phone"
            data-testid="pos-phone-input"
            type="text"
            value={form.phone}
            onChange={(e) => handleFieldChange('phone', e.target.value)}
            onBlur={() => handleBlur('phone')}
            placeholder="e.g. (555) 123-4567"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Manager (dropdown from employees with manager status) */}
        <div>
          <label htmlFor="pos-manager" className="block text-sm font-medium text-gray-700 mb-1">
            Manager
          </label>
          <select
            id="pos-manager"
            data-testid="pos-manager-select"
            value={form.managerId}
            onChange={(e) => {
              const id = e.target.value;
              const mgr = managers.find((m) => m.id === id);
              handleFieldChange('managerId', id);
              handleFieldChange('managerName', mgr ? mgr.name : '');
            }}
            onBlur={() => handleBlur('managerId')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">— Select a manager —</option>
            {managers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} — {m.role}
              </option>
            ))}
          </select>
          {managers.length === 0 && (
            <p className="mt-1 text-xs text-gray-500">
              No managers available. Add an employee with manager status first.
            </p>
          )}
        </div>

        {/* Opening Hours */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Opening Hours <span className="text-red-500">*</span>
          </h4>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
              <span>Day</span>
              <span>Open</span>
              <span>Close</span>
              <span className="text-center">Closed</span>
            </div>
            {/* Day rows */}
            {DAYS_OF_WEEK.map((day) => {
              const hours = form.openingHours[day];
              const dayError =
                touched.openingHours && errors.openingHours && errors.openingHours[day];
              return (
                <div
                  key={day}
                  data-testid={`opening-hours-${day}`}
                  className={`grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center px-4 py-2 border-t border-gray-100 ${
                    dayError ? 'bg-red-50' : ''
                  }`}
                >
                  <span className="text-sm font-medium text-gray-700">
                    {DAY_LABELS[day]}
                  </span>
                  <input
                    data-testid={`opening-hours-${day}-open`}
                    type="time"
                    value={hours.open || ''}
                    disabled={hours.closed}
                    onChange={(e) => handleOpeningHoursChange(day, 'open', e.target.value)}
                    className={`rounded border px-2 py-1 text-sm ${
                      hours.closed
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500'
                    }`}
                  />
                  <input
                    data-testid={`opening-hours-${day}-close`}
                    type="time"
                    value={hours.close || ''}
                    disabled={hours.closed}
                    onChange={(e) => handleOpeningHoursChange(day, 'close', e.target.value)}
                    className={`rounded border px-2 py-1 text-sm ${
                      hours.closed
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500'
                    }`}
                  />
                  <label className="flex items-center justify-center cursor-pointer">
                    <input
                      data-testid={`opening-hours-${day}-closed`}
                      type="checkbox"
                      checked={hours.closed}
                      onChange={() => handleClosedToggle(day)}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                  {dayError && (
                    <p className="col-span-4 text-xs text-red-600 -mt-1 mb-1">{dayError}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PosModal;
