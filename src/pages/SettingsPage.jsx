import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useSettings } from '../hooks/useSettings';
import useLocale from '../hooks/useLocale';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ── Reusable Setting Input Components ──────────────────────────────

const SettingToggle = ({ label, description, value, onChange, disabled }) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex-1 mr-4">
      <p className="text-sm font-medium text-gray-900">{label}</p>
      {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={value}
      disabled={disabled}
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
        value ? 'bg-indigo-600' : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
        value ? 'translate-x-5' : 'translate-x-0'
      }`} />
    </button>
  </div>
);

const SettingSelect = ({ label, value, onChange, options, disabled }) => (
  <div className="py-3">
    <label className="block text-sm font-medium text-gray-900 mb-1">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const SettingNumber = ({ label, value, onChange, min, max, step = 1, disabled }) => (
  <div className="py-3">
    <label className="block text-sm font-medium text-gray-900 mb-1">{label}</label>
    <input
      type="number"
      value={value ?? ''}
      onChange={(e) => onChange(Number(e.target.value))}
      min={min} max={max} step={step}
      disabled={disabled}
      className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
    />
  </div>
);

const SettingText = ({ label, value, onChange, disabled, placeholder }) => (
  <div className="py-3">
    <label className="block text-sm font-medium text-gray-900 mb-1">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
    />
  </div>
);

const SettingGroup = ({ title, children }) => (
  <div className="border-b border-gray-100 last:border-b-0 pb-4 mb-4 last:pb-0 last:mb-0">
    {title && <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{title}</h4>}
    {children}
  </div>
);

// ── Unsaved Changes Modal ──────────────────────────────────────────

const UnsavedChangesModal = ({ isOpen, onSave, onDiscard, onCancel, t }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('settings:unsavedChanges.title')}</h3>
        <p className="text-sm text-gray-600 mb-6">{t('settings:unsavedChanges.message')}</p>
        <div className="flex justify-end space-x-3">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            {t('settings:unsavedChanges.cancel')}
          </button>
          <button onClick={onDiscard} className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
            {t('settings:unsavedChanges.discard')}
          </button>
          <button onClick={onSave} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
            {t('settings:unsavedChanges.save')}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Section Action Bar ─────────────────────────────────────────────

const SectionActions = ({ hasChanges, onSave, onReset, saving, t }) => (
  <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200">
    <button type="button" onClick={onReset} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
      {t('settings:actions.resetSection')}
    </button>
    <button
      type="button" onClick={onSave}
      disabled={!hasChanges || saving}
      className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
        hasChanges && !saving
          ? 'text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm'
          : 'text-gray-400 bg-gray-100 cursor-not-allowed'
      }`}
    >
      {saving ? t('settings:actions.saving') : t('settings:actions.saveChanges')}
    </button>
  </div>
);

// ── Sortable Nav Row ───────────────────────────────────────────────

const SortableNavRow = ({ item, onToggle, t }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.routeKey });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <tr ref={setNodeRef} style={style} className="border-b border-gray-100 hover:bg-gray-50">
      <td className="py-2 px-3">
        <button {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600" aria-label="Drag">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
          </svg>
        </button>
      </td>
      <td className="py-2 px-3 text-sm text-gray-900 capitalize">
        {t(`common:nav.${item.routeKey}`, item.routeKey)}
        {item.systemLocked && (
          <span className="ml-2 text-xs text-amber-600" title={t('settings:navbar.locked')}>🔒</span>
        )}
      </td>
      <td className="py-2 px-3 text-center">
        <input type="checkbox" checked={item.visibleAdmin} disabled={item.systemLocked}
          onChange={() => onToggle(item.routeKey, 'visibleAdmin')} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
      </td>
      <td className="py-2 px-3 text-center">
        <input type="checkbox" checked={item.visibleManager} disabled={item.systemLocked}
          onChange={() => onToggle(item.routeKey, 'visibleManager')} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
      </td>
      <td className="py-2 px-3 text-center">
        <input type="checkbox" checked={item.visibleEmployee} disabled={item.systemLocked}
          onChange={() => onToggle(item.routeKey, 'visibleEmployee')} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
      </td>
    </tr>
  );
};

// ── Category Icons ─────────────────────────────────────────────────

const CATEGORY_ICONS = {
  general: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  navbar: 'M4 6h16M4 12h16M4 18h16',
  language: 'M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129',
  scheduling: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  payroll: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  timeOff: 'M20 12H4m0 0l6-6m-6 6l6 6',
  swaps: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
  notifications: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  featureFlags: 'M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9',
  display: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  accessibility: 'M13 10V3L4 14h7v7l9-11h-7z',
  security: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  dataPrivacy: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  departments: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  shiftTypes: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  invoices: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
};

// ── Departments Inline CRUD ─────────────────────────────────────────

const DepartmentsEditor = ({ departments, createDepartment, updateDepartment, deleteDepartment, t }) => {
  const [editingId, setEditingId] = useState(null);
  const [draftRow, setDraftRow] = useState({ nameEn: '', nameFr: '', color: '#3B82F6', active: true });

  const handleAdd = async () => {
    if (!draftRow.nameEn.trim()) return;
    await createDepartment(draftRow);
    setDraftRow({ nameEn: '', nameFr: '', color: '#3B82F6', active: true });
  };

  const handleSave = async (id) => {
    await updateDepartment(id, draftRow);
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('settings:departments.confirmDelete'))) return;
    await deleteDepartment(id);
  };

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">{t('settings:departments.description')}</p>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
            <th className="py-2 px-2">{t('settings:departments.nameEn')}</th>
            <th className="py-2 px-2">{t('settings:departments.nameFr')}</th>
            <th className="py-2 px-2 w-16">{t('settings:departments.color')}</th>
            <th className="py-2 px-2 w-16">{t('settings:departments.active')}</th>
            <th className="py-2 px-2 w-24"></th>
          </tr>
        </thead>
        <tbody>
          {departments.map((dept) => (
            <tr key={dept.id} className="border-b border-gray-100">
              {editingId === dept.id ? (
                <>
                  <td className="py-2 px-2"><input type="text" value={draftRow.nameEn} onChange={(e) => setDraftRow((d) => ({ ...d, nameEn: e.target.value }))} className="w-full border border-gray-300 rounded px-2 py-1 text-sm" /></td>
                  <td className="py-2 px-2"><input type="text" value={draftRow.nameFr} onChange={(e) => setDraftRow((d) => ({ ...d, nameFr: e.target.value }))} className="w-full border border-gray-300 rounded px-2 py-1 text-sm" /></td>
                  <td className="py-2 px-2"><input type="color" value={draftRow.color} onChange={(e) => setDraftRow((d) => ({ ...d, color: e.target.value }))} className="w-8 h-8 rounded cursor-pointer" /></td>
                  <td className="py-2 px-2"><input type="checkbox" checked={draftRow.active} onChange={(e) => setDraftRow((d) => ({ ...d, active: e.target.checked }))} className="rounded border-gray-300" /></td>
                  <td className="py-2 px-2 space-x-1">
                    <button onClick={() => handleSave(dept.id)} className="text-indigo-600 hover:text-indigo-800 text-xs font-medium">{t('settings:actions.save')}</button>
                    <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-gray-700 text-xs font-medium">{t('settings:actions.cancel')}</button>
                  </td>
                </>
              ) : (
                <>
                  <td className="py-2 px-2 text-gray-900">{dept.nameEn}</td>
                  <td className="py-2 px-2 text-gray-600">{dept.nameFr}</td>
                  <td className="py-2 px-2"><span className="inline-block w-6 h-6 rounded" style={{ backgroundColor: dept.color }} /></td>
                  <td className="py-2 px-2">{dept.active ? '✓' : '–'}</td>
                  <td className="py-2 px-2 space-x-1">
                    <button onClick={() => { setEditingId(dept.id); setDraftRow({ nameEn: dept.nameEn, nameFr: dept.nameFr, color: dept.color, active: dept.active }); }} className="text-indigo-600 hover:text-indigo-800 text-xs font-medium">{t('settings:actions.edit')}</button>
                    <button onClick={() => handleDelete(dept.id)} className="text-red-600 hover:text-red-800 text-xs font-medium">{t('settings:actions.delete')}</button>
                  </td>
                </>
              )}
            </tr>
          ))}
          {/* New row */}
          <tr className="border-b border-gray-100 bg-gray-50">
            <td className="py-2 px-2"><input type="text" value={draftRow.nameEn} onChange={(e) => setDraftRow((d) => ({ ...d, nameEn: e.target.value }))} placeholder="English name" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" /></td>
            <td className="py-2 px-2"><input type="text" value={draftRow.nameFr} onChange={(e) => setDraftRow((d) => ({ ...d, nameFr: e.target.value }))} placeholder="Nom français" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" /></td>
            <td className="py-2 px-2"><input type="color" value={draftRow.color} onChange={(e) => setDraftRow((d) => ({ ...d, color: e.target.value }))} className="w-8 h-8 rounded cursor-pointer" /></td>
            <td className="py-2 px-2"><input type="checkbox" checked={draftRow.active} onChange={(e) => setDraftRow((d) => ({ ...d, active: e.target.checked }))} className="rounded border-gray-300" /></td>
            <td className="py-2 px-2">
              <button onClick={handleAdd} disabled={!draftRow.nameEn.trim()} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-40">{t('settings:departments.add')}</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// ── Shift Types Inline CRUD ─────────────────────────────────────────

const ShiftTypesEditor = ({ shiftTypes, createShiftType, updateShiftType, deleteShiftType, t }) => {
  const [editingId, setEditingId] = useState(null);
  const [draftRow, setDraftRow] = useState({ nameEn: '', nameFr: '', defaultStart: '09:00', durationHours: 8, color: '#3B82F6', active: true });

  const handleAdd = async () => {
    if (!draftRow.nameEn.trim()) return;
    await createShiftType(draftRow);
    setDraftRow({ nameEn: '', nameFr: '', defaultStart: '09:00', durationHours: 8, color: '#3B82F6', active: true });
  };

  const handleSave = async (id) => {
    await updateShiftType(id, draftRow);
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('settings:shiftTypes.confirmDelete'))) return;
    await deleteShiftType(id);
  };

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">{t('settings:shiftTypes.description')}</p>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
            <th className="py-2 px-2">{t('settings:shiftTypes.nameEn')}</th>
            <th className="py-2 px-2">{t('settings:shiftTypes.nameFr')}</th>
            <th className="py-2 px-2 w-24">{t('settings:shiftTypes.defaultStart')}</th>
            <th className="py-2 px-2 w-20">{t('settings:shiftTypes.duration')}</th>
            <th className="py-2 px-2 w-16">{t('settings:shiftTypes.color')}</th>
            <th className="py-2 px-2 w-16">{t('settings:shiftTypes.active')}</th>
            <th className="py-2 px-2 w-24"></th>
          </tr>
        </thead>
        <tbody>
          {shiftTypes.map((st) => (
            <tr key={st.id} className="border-b border-gray-100">
              {editingId === st.id ? (
                <>
                  <td className="py-2 px-2"><input type="text" value={draftRow.nameEn} onChange={(e) => setDraftRow((d) => ({ ...d, nameEn: e.target.value }))} className="w-full border border-gray-300 rounded px-2 py-1 text-sm" /></td>
                  <td className="py-2 px-2"><input type="text" value={draftRow.nameFr} onChange={(e) => setDraftRow((d) => ({ ...d, nameFr: e.target.value }))} className="w-full border border-gray-300 rounded px-2 py-1 text-sm" /></td>
                  <td className="py-2 px-2"><input type="time" value={draftRow.defaultStart} onChange={(e) => setDraftRow((d) => ({ ...d, defaultStart: e.target.value }))} className="border border-gray-300 rounded px-2 py-1 text-sm" /></td>
                  <td className="py-2 px-2"><input type="number" value={draftRow.durationHours} onChange={(e) => setDraftRow((d) => ({ ...d, durationHours: Number(e.target.value) }))} min={0.5} max={24} step={0.5} className="w-16 border border-gray-300 rounded px-2 py-1 text-sm" /></td>
                  <td className="py-2 px-2"><input type="color" value={draftRow.color} onChange={(e) => setDraftRow((d) => ({ ...d, color: e.target.value }))} className="w-8 h-8 rounded cursor-pointer" /></td>
                  <td className="py-2 px-2"><input type="checkbox" checked={draftRow.active} onChange={(e) => setDraftRow((d) => ({ ...d, active: e.target.checked }))} className="rounded border-gray-300" /></td>
                  <td className="py-2 px-2 space-x-1">
                    <button onClick={() => handleSave(st.id)} className="text-indigo-600 hover:text-indigo-800 text-xs font-medium">{t('settings:actions.save')}</button>
                    <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-gray-700 text-xs font-medium">{t('settings:actions.cancel')}</button>
                  </td>
                </>
              ) : (
                <>
                  <td className="py-2 px-2 text-gray-900">{st.nameEn}</td>
                  <td className="py-2 px-2 text-gray-600">{st.nameFr}</td>
                  <td className="py-2 px-2 text-gray-600">{st.defaultStart}</td>
                  <td className="py-2 px-2 text-gray-600">{st.durationHours}h</td>
                  <td className="py-2 px-2"><span className="inline-block w-6 h-6 rounded" style={{ backgroundColor: st.color }} /></td>
                  <td className="py-2 px-2">{st.active ? '✓' : '–'}</td>
                  <td className="py-2 px-2 space-x-1">
                    <button onClick={() => { setEditingId(st.id); setDraftRow({ nameEn: st.nameEn, nameFr: st.nameFr, defaultStart: st.defaultStart, durationHours: st.durationHours, color: st.color, active: st.active }); }} className="text-indigo-600 hover:text-indigo-800 text-xs font-medium">{t('settings:actions.edit')}</button>
                    <button onClick={() => handleDelete(st.id)} className="text-red-600 hover:text-red-800 text-xs font-medium">{t('settings:actions.delete')}</button>
                  </td>
                </>
              )}
            </tr>
          ))}
          {/* New row */}
          <tr className="border-b border-gray-100 bg-gray-50">
            <td className="py-2 px-2"><input type="text" value={draftRow.nameEn} onChange={(e) => setDraftRow((d) => ({ ...d, nameEn: e.target.value }))} placeholder="English name" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" /></td>
            <td className="py-2 px-2"><input type="text" value={draftRow.nameFr} onChange={(e) => setDraftRow((d) => ({ ...d, nameFr: e.target.value }))} placeholder="Nom français" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" /></td>
            <td className="py-2 px-2"><input type="time" value={draftRow.defaultStart} onChange={(e) => setDraftRow((d) => ({ ...d, defaultStart: e.target.value }))} className="border border-gray-300 rounded px-2 py-1 text-sm" /></td>
            <td className="py-2 px-2"><input type="number" value={draftRow.durationHours} onChange={(e) => setDraftRow((d) => ({ ...d, durationHours: Number(e.target.value) }))} min={0.5} max={24} step={0.5} className="w-16 border border-gray-300 rounded px-2 py-1 text-sm" /></td>
            <td className="py-2 px-2"><input type="color" value={draftRow.color} onChange={(e) => setDraftRow((d) => ({ ...d, color: e.target.value }))} className="w-8 h-8 rounded cursor-pointer" /></td>
            <td className="py-2 px-2"><input type="checkbox" checked={draftRow.active} onChange={(e) => setDraftRow((d) => ({ ...d, active: e.target.checked }))} className="rounded border-gray-300" /></td>
            <td className="py-2 px-2">
              <button onClick={handleAdd} disabled={!draftRow.nameEn.trim()} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-40">{t('settings:shiftTypes.add')}</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// ── Main Page Component ────────────────────────────────────────────

const SettingsPage = () => {
  const { t } = useTranslation(['settings', 'common']);
  const { isAdmin, isManager } = useAuth();
  const { language, setLocale } = useLocale();
  const {
    appSettings, preferences,
    navItems: savedNavItems,
    departments: savedDepartments,
    shiftTypes: savedShiftTypes,
    updateAppSettings, resetAppSettings,
    updatePreferences, resetPreferences,
    saveNavItems,
    createDepartment, updateDepartment, deleteDepartment,
    createShiftType, updateShiftType, deleteShiftType,
    isLoading: settingsLoading,
  } = useSettings();

  // ── Draft state for each settings category ────────────────────────
  const [generalDraft, setGeneralDraft] = useState({});
  const [schedulingDraft, setSchedulingDraft] = useState({});
  const [payrollDraft, setPayrollDraft] = useState({});
  const [timeOffDraft, setTimeOffDraft] = useState({});
  const [swapsDraft, setSwapsDraft] = useState({});
  const [notificationsDraft, setNotificationsDraft] = useState({});
  const [featureFlagsDraft, setFeatureFlagsDraft] = useState({});
  const [securityDraft, setSecurityDraft] = useState({});
  const [dataPrivacyDraft, setDataPrivacyDraft] = useState({});
  const [invoicesDraft, setInvoicesDraft] = useState({});
  const [displayDraft, setDisplayDraft] = useState({});
  const [accessibilityDraft, setAccessibilityDraft] = useState({});
  const [navDraft, setNavDraft] = useState([]);

  const [activeCategory, setActiveCategory] = useState(isAdmin ? 'general' : 'display');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const pendingCategoryRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync drafts when settings load
  useEffect(() => {
    setGeneralDraft(appSettings.general);
    setSchedulingDraft(appSettings.scheduling);
    setPayrollDraft(appSettings.payroll);
    setTimeOffDraft(appSettings.timeOff);
    setSwapsDraft(appSettings.swaps);
    setNotificationsDraft(appSettings.notifications);
    setFeatureFlagsDraft(appSettings.featureFlags);
    setSecurityDraft(appSettings.security);
    setDataPrivacyDraft(appSettings.dataPrivacy);
    setInvoicesDraft(appSettings.invoices || {});
  }, [appSettings]);

  useEffect(() => {
    // Split preferences into display vs accessibility
    const { fontSize, highContrast, reducedMotion, focusRingAlwaysVisible, ...displayPrefs } = preferences;
    setDisplayDraft(displayPrefs);
    setAccessibilityDraft({ fontSize, highContrast, reducedMotion, focusRingAlwaysVisible });
  }, [preferences]);

  useEffect(() => {
    setNavDraft(savedNavItems);
  }, [savedNavItems]);

  // Draft / original maps
  const drafts = {
    general: generalDraft, scheduling: schedulingDraft, payroll: payrollDraft,
    timeOff: timeOffDraft, swaps: swapsDraft, notifications: notificationsDraft,
    featureFlags: featureFlagsDraft, security: securityDraft, dataPrivacy: dataPrivacyDraft,
    invoices: invoicesDraft, display: displayDraft, accessibility: accessibilityDraft,
  };

  const setDraft = {
    general: setGeneralDraft, scheduling: setSchedulingDraft, payroll: setPayrollDraft,
    timeOff: setTimeOffDraft, swaps: setSwapsDraft, notifications: setNotificationsDraft,
    featureFlags: setFeatureFlagsDraft, security: setSecurityDraft, dataPrivacy: setDataPrivacyDraft,
    invoices: setInvoicesDraft, display: setDisplayDraft, accessibility: setAccessibilityDraft,
  };

  const originals = useMemo(() => {
    const { fontSize, highContrast, reducedMotion, focusRingAlwaysVisible, ...displayPrefs } = preferences;
    return {
      general: appSettings.general, scheduling: appSettings.scheduling, payroll: appSettings.payroll,
      timeOff: appSettings.timeOff, swaps: appSettings.swaps, notifications: appSettings.notifications,
      featureFlags: appSettings.featureFlags, security: appSettings.security, dataPrivacy: appSettings.dataPrivacy,
      invoices: appSettings.invoices || {},
      display: displayPrefs, accessibility: { fontSize, highContrast, reducedMotion, focusRingAlwaysVisible },
    };
  }, [appSettings, preferences]);

  // Check if current category has unsaved changes
  const hasChanges = useCallback((category) => {
    if (category === 'navbar') {
      return JSON.stringify(navDraft) !== JSON.stringify(savedNavItems);
    }
    const draft = drafts[category];
    const original = originals[category];
    if (!draft || !original) return false;
    return Object.keys(draft).some((k) => String(draft[k]) !== String(original[k]));
  }, [generalDraft, schedulingDraft, payrollDraft, timeOffDraft, swapsDraft,
    notificationsDraft, featureFlagsDraft, securityDraft, dataPrivacyDraft, invoicesDraft,
    displayDraft, accessibilityDraft, navDraft, appSettings, preferences, savedNavItems, originals]);

  const updateDraftField = (category, key, value) => {
    setDraft[category]?.((prev) => ({ ...prev, [key]: value }));
  };

  // ── Save / Reset handlers ─────────────────────────────────────────

  const saveCategory = useCallback(async (category) => {
    setSaving(true);
    setSaveMessage('');
    try {
      if (category === 'navbar') {
        await saveNavItems(navDraft);
      } else if (category === 'display' || category === 'accessibility') {
        const draft = drafts[category];
        const original = originals[category];
        const changed = {};
        Object.keys(draft).forEach((k) => {
          if (String(draft[k]) !== String(original[k])) changed[k] = draft[k];
        });
        if (Object.keys(changed).length > 0) await updatePreferences(changed);
      } else {
        const draft = drafts[category];
        const original = originals[category];
        const changed = {};
        Object.keys(draft).forEach((k) => {
          if (String(draft[k]) !== String(original[k])) changed[k] = draft[k];
        });
        if (Object.keys(changed).length > 0) await updateAppSettings(category, changed);
      }
      setSaveMessage(t('settings:actions.saved'));
      setTimeout(() => setSaveMessage(''), 2000);
    } catch {
      setSaveMessage('Error saving');
    } finally {
      setSaving(false);
    }
  }, [generalDraft, schedulingDraft, payrollDraft, timeOffDraft, swapsDraft,
    notificationsDraft, featureFlagsDraft, securityDraft, dataPrivacyDraft, invoicesDraft,
    displayDraft, accessibilityDraft, navDraft, originals,
    updateAppSettings, updatePreferences, saveNavItems, t]);

  const resetCategory = useCallback(async (category) => {
    if (!window.confirm(t('settings:actions.resetConfirm'))) return;
    setSaving(true);
    try {
      if (category === 'display' || category === 'accessibility') {
        await resetPreferences();
      } else if (category !== 'navbar' && category !== 'language' && category !== 'departments' && category !== 'shiftTypes') {
        await resetAppSettings(category);
      }
      setSaveMessage(t('settings:actions.saved'));
      setTimeout(() => setSaveMessage(''), 2000);
    } catch {
      setSaveMessage('Error resetting');
    } finally {
      setSaving(false);
    }
  }, [resetAppSettings, resetPreferences, t]);

  // ── Unsaved changes navigation guard ──────────────────────────────

  const tryChangeCategory = (newCategory) => {
    if (hasChanges(activeCategory)) {
      pendingCategoryRef.current = newCategory;
      setShowUnsavedModal(true);
    } else {
      setActiveCategory(newCategory);
    }
  };

  const handleSaveAndLeave = async () => {
    await saveCategory(activeCategory);
    setShowUnsavedModal(false);
    if (pendingCategoryRef.current) {
      setActiveCategory(pendingCategoryRef.current);
      pendingCategoryRef.current = null;
    }
  };

  const handleDiscard = () => {
    if (activeCategory === 'navbar') {
      setNavDraft(savedNavItems);
    } else if (setDraft[activeCategory]) {
      setDraft[activeCategory](originals[activeCategory]);
    }
    setShowUnsavedModal(false);
    if (pendingCategoryRef.current) {
      setActiveCategory(pendingCategoryRef.current);
      pendingCategoryRef.current = null;
    }
  };

  // ── Category list ─────────────────────────────────────────────────

  const categories = useMemo(() => {
    const cats = [];
    if (isAdmin) {
      cats.push(
        { id: 'general', labelKey: 'settings:category.general' },
        { id: 'navbar', labelKey: 'settings:category.navbar' },
        { id: 'language', labelKey: 'settings:category.language' },
        { id: 'scheduling', labelKey: 'settings:category.scheduling' },
        { id: 'payroll', labelKey: 'settings:category.payroll' },
        { id: 'timeOff', labelKey: 'settings:category.timeOff' },
        { id: 'swaps', labelKey: 'settings:category.swaps' },
        { id: 'notifications', labelKey: 'settings:category.notifications' },
        { id: 'featureFlags', labelKey: 'settings:category.featureFlags' },
        { id: 'invoices', labelKey: 'settings:category.invoices' },
      );
    } else if (isManager) {
      cats.push(
        { id: 'scheduling', labelKey: 'settings:category.scheduling' },
        { id: 'language', labelKey: 'settings:category.language' },
        { id: 'notifications', labelKey: 'settings:category.notifications' },
        { id: 'invoices', labelKey: 'settings:category.invoices' },
      );
    } else {
      cats.push(
        { id: 'language', labelKey: 'settings:category.language' },
        { id: 'notifications', labelKey: 'settings:category.notifications' },
      );
    }
    cats.push(
      { id: 'display', labelKey: 'settings:category.display' },
      { id: 'accessibility', labelKey: 'settings:category.accessibility' },
    );
    if (isAdmin) {
      cats.push(
        { id: 'security', labelKey: 'settings:category.security' },
        { id: 'dataPrivacy', labelKey: 'settings:category.dataPrivacy' },
        { id: 'departments', labelKey: 'settings:category.departments' },
        { id: 'shiftTypes', labelKey: 'settings:category.shiftTypes' },
      );
    }
    return cats;
  }, [isAdmin, isManager]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter((cat) => {
      const label = t(cat.labelKey).toLowerCase();
      return label.includes(q) || cat.id.toLowerCase().includes(q);
    });
  }, [categories, searchQuery, t]);

  // ── DnD sensors for nav ─────────────────────────────────────────

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleNavDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setNavDraft((items) => {
        const oldIndex = items.findIndex((i) => i.routeKey === active.id);
        const newIndex = items.findIndex((i) => i.routeKey === over.id);
        return arrayMove(items, oldIndex, newIndex).map((item, idx) => ({ ...item, displayOrder: idx }));
      });
    }
  };

  const toggleNavVisibility = (routeKey, field) => {
    setNavDraft((items) => items.map((item) =>
      item.routeKey === routeKey && !item.systemLocked
        ? { ...item, [field]: !item[field] }
        : item
    ));
  };

  // ── Section renderers ─────────────────────────────────────────────

  const renderGeneral = () => (
    <div>
      <SettingGroup>
        <SettingText label={t('settings:general.companyName')} value={generalDraft.companyName || ''} onChange={(v) => updateDraftField('general', 'companyName', v)} />
        <SettingSelect label={t('settings:general.timezone')} value={generalDraft.timezone || 'America/New_York'} onChange={(v) => updateDraftField('general', 'timezone', v)}
          options={[
            { value: 'America/New_York', label: 'Eastern (America/New_York)' },
            { value: 'America/Chicago', label: 'Central (America/Chicago)' },
            { value: 'America/Denver', label: 'Mountain (America/Denver)' },
            { value: 'America/Los_Angeles', label: 'Pacific (America/Los_Angeles)' },
            { value: 'America/Toronto', label: 'Toronto (America/Toronto)' },
            { value: 'America/Montreal', label: 'Montreal (America/Montreal)' },
            { value: 'Europe/London', label: 'London (Europe/London)' },
            { value: 'Europe/Paris', label: 'Paris (Europe/Paris)' },
            { value: 'UTC', label: 'UTC' },
          ]}
        />
        <SettingSelect label={t('settings:general.workWeekStart')} value={generalDraft.workWeekStart || 'monday'} onChange={(v) => updateDraftField('general', 'workWeekStart', v)}
          options={['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((d) => ({ value: d, label: t(`settings:weekDays.${d}`) }))}
        />
      </SettingGroup>
      <SettingGroup>
        <SettingSelect label={t('settings:general.dateFormat')} value={generalDraft.dateFormat || 'yyyy-MM-dd'} onChange={(v) => updateDraftField('general', 'dateFormat', v)}
          options={[{ value: 'MM/dd/yyyy', label: 'MM/dd/yyyy' }, { value: 'dd/MM/yyyy', label: 'dd/MM/yyyy' }, { value: 'yyyy-MM-dd', label: 'yyyy-MM-dd' }]}
        />
        <SettingSelect label={t('settings:general.timeFormat')} value={generalDraft.timeFormat || '24h'} onChange={(v) => updateDraftField('general', 'timeFormat', v)}
          options={[{ value: '12h', label: '12-hour (AM/PM)' }, { value: '24h', label: '24-hour' }]}
        />
        <SettingSelect label={t('settings:general.currency')} value={generalDraft.currency || 'CAD'} onChange={(v) => updateDraftField('general', 'currency', v)}
          options={[{ value: 'CAD', label: 'CAD ($)' }, { value: 'USD', label: 'USD ($)' }, { value: 'EUR', label: 'EUR (€)' }, { value: 'GBP', label: 'GBP (£)' }]}
        />
        <SettingSelect label={t('settings:general.fiscalYearStart')} value={String(generalDraft.fiscalYearStart || '1')} onChange={(v) => updateDraftField('general', 'fiscalYearStart', v)}
          options={['january','february','march','april','may','june','july','august','september','october','november','december'].map((m, i) => ({ value: String(i + 1), label: t(`settings:months.${m}`) }))}
        />
      </SettingGroup>
      <SectionActions hasChanges={hasChanges('general')} onSave={() => saveCategory('general')} onReset={() => resetCategory('general')} saving={saving} t={t} />
    </div>
  );

  const renderNavbar = () => (
    <div>
      <p className="text-sm text-gray-500 mb-4">{t('settings:navbar.description')}</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleNavDragEnd}>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
              <th className="py-2 px-3 w-8"></th>
              <th className="py-2 px-3">{t('settings:navbar.col_item')}</th>
              <th className="py-2 px-3 text-center">{t('settings:navbar.col_admin')}</th>
              <th className="py-2 px-3 text-center">{t('settings:navbar.col_manager')}</th>
              <th className="py-2 px-3 text-center">{t('settings:navbar.col_employee')}</th>
            </tr>
          </thead>
          <SortableContext items={navDraft.map((i) => i.routeKey)} strategy={verticalListSortingStrategy}>
            <tbody>
              {navDraft.map((item) => (
                <SortableNavRow key={item.routeKey} item={item} onToggle={toggleNavVisibility} t={t} />
              ))}
            </tbody>
          </SortableContext>
        </table>
      </DndContext>
      <div className="flex justify-end pt-4 mt-4 border-t border-gray-200">
        <button type="button" onClick={() => saveCategory('navbar')} disabled={!hasChanges('navbar') || saving}
          className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
            hasChanges('navbar') && !saving ? 'text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm' : 'text-gray-400 bg-gray-100 cursor-not-allowed'
          }`}>
          {saving ? t('settings:actions.saving') : t('settings:actions.saveChanges')}
        </button>
      </div>
    </div>
  );

  const renderLanguage = () => (
    <div>
      <p className="text-sm text-gray-500 mb-4">{t('settings:language.description')}</p>
      <SettingGroup>
        <div className="py-3">
          <label className="block text-sm font-medium text-gray-900 mb-3">{t('settings:language.current')}</label>
          <div className="inline-flex items-center rounded-lg border border-gray-300 bg-white p-1">
            <button type="button" onClick={() => setLocale('en')}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${language === 'en' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}>
              English
            </button>
            <button type="button" onClick={() => setLocale('fr')}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${language === 'fr' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}>
              Français
            </button>
          </div>
        </div>
      </SettingGroup>
    </div>
  );

  const renderScheduling = () => (
    <div>
      <SettingGroup>
        <SettingSelect label={t('settings:scheduling.defaultView')} value={schedulingDraft.defaultView || 'week'} onChange={(v) => updateDraftField('scheduling', 'defaultView', v)}
          options={[{ value: 'day', label: t('settings:scheduling.defaultView_day') }, { value: 'week', label: t('settings:scheduling.defaultView_week') }, { value: 'month', label: t('settings:scheduling.defaultView_month') }]}
        />
        <SettingNumber label={t('settings:scheduling.defaultShiftDuration')} value={schedulingDraft.defaultShiftDuration ?? 8} onChange={(v) => updateDraftField('scheduling', 'defaultShiftDuration', v)} min={1} max={24} step={0.5} />
        <SettingNumber label={t('settings:scheduling.maxShiftDuration')} value={schedulingDraft.maxShiftDuration ?? 12} onChange={(v) => updateDraftField('scheduling', 'maxShiftDuration', v)} min={1} max={24} step={0.5} />
        <SettingNumber label={t('settings:scheduling.minHoursBetweenShifts')} value={schedulingDraft.minHoursBetweenShifts ?? 8} onChange={(v) => updateDraftField('scheduling', 'minHoursBetweenShifts', v)} min={0} max={48} step={1} />
      </SettingGroup>
      <SettingGroup>
        <SettingToggle label={t('settings:scheduling.allowOverlap')} description={t('settings:scheduling.allowOverlap_desc')} value={schedulingDraft.allowOverlap ?? false} onChange={(v) => updateDraftField('scheduling', 'allowOverlap', v)} />
        <SettingToggle label={t('settings:scheduling.autoAssignColors')} description={t('settings:scheduling.autoAssignColors_desc')} value={schedulingDraft.autoAssignColors ?? true} onChange={(v) => updateDraftField('scheduling', 'autoAssignColors', v)} />
        <SettingToggle label={t('settings:scheduling.showCostOnCards')} description={t('settings:scheduling.showCostOnCards_desc')} value={schedulingDraft.showCostOnCards ?? true} onChange={(v) => updateDraftField('scheduling', 'showCostOnCards', v)} />
        <SettingToggle label={t('settings:scheduling.enableDragDrop')} description={t('settings:scheduling.enableDragDrop_desc')} value={schedulingDraft.enableDragDrop ?? true} onChange={(v) => updateDraftField('scheduling', 'enableDragDrop', v)} />
        <SettingToggle label={t('settings:scheduling.requireConfirmation')} description={t('settings:scheduling.requireConfirmation_desc')} value={schedulingDraft.requireConfirmation ?? false} onChange={(v) => updateDraftField('scheduling', 'requireConfirmation', v)} />
      </SettingGroup>
      <SectionActions hasChanges={hasChanges('scheduling')} onSave={() => saveCategory('scheduling')} onReset={() => resetCategory('scheduling')} saving={saving} t={t} />
    </div>
  );

  const renderPayroll = () => (
    <div>
      <SettingGroup>
        <SettingSelect label={t('settings:payroll.payPeriodType')} value={payrollDraft.payPeriodType || 'biweekly'} onChange={(v) => updateDraftField('payroll', 'payPeriodType', v)}
          options={[
            { value: 'weekly', label: t('settings:payroll.payPeriodType_weekly') },
            { value: 'biweekly', label: t('settings:payroll.payPeriodType_biweekly') },
            { value: 'semiMonthly', label: t('settings:payroll.payPeriodType_semiMonthly') },
            { value: 'monthly', label: t('settings:payroll.payPeriodType_monthly') },
          ]}
        />
        <SettingSelect label={t('settings:payroll.payDayOfWeek')} value={payrollDraft.payDayOfWeek || 'friday'} onChange={(v) => updateDraftField('payroll', 'payDayOfWeek', v)}
          options={['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map((d) => ({ value: d, label: t(`settings:weekDays.${d}`) }))}
        />
        <SettingNumber label={t('settings:payroll.payDayOfMonth')} value={payrollDraft.payDayOfMonth ?? 15} onChange={(v) => updateDraftField('payroll', 'payDayOfMonth', v)} min={1} max={28} step={1} />
      </SettingGroup>
      <SettingGroup>
        <SettingNumber label={t('settings:payroll.overtimeThreshold')} value={payrollDraft.overtimeThreshold ?? 40} onChange={(v) => updateDraftField('payroll', 'overtimeThreshold', v)} min={0} max={168} step={1} />
        <SettingNumber label={t('settings:payroll.overtimeMultiplier')} value={payrollDraft.overtimeMultiplier ?? 1.5} onChange={(v) => updateDraftField('payroll', 'overtimeMultiplier', v)} min={1} max={5} step={0.1} />
        <SettingNumber label={t('settings:payroll.dailyOvertimeThreshold')} value={payrollDraft.dailyOvertimeThreshold ?? 0} onChange={(v) => updateDraftField('payroll', 'dailyOvertimeThreshold', v)} min={0} max={24} step={0.5} />
        <SettingNumber label={t('settings:payroll.doubleTimeThreshold')} value={payrollDraft.doubleTimeThreshold ?? 60} onChange={(v) => updateDraftField('payroll', 'doubleTimeThreshold', v)} min={0} max={168} step={1} />
        <SettingNumber label={t('settings:payroll.doubleTimeMultiplier')} value={payrollDraft.doubleTimeMultiplier ?? 2.0} onChange={(v) => updateDraftField('payroll', 'doubleTimeMultiplier', v)} min={1} max={5} step={0.1} />
      </SettingGroup>
      <SettingGroup>
        <SettingToggle label={t('settings:payroll.autoApproveTimesheets')} description={t('settings:payroll.autoApproveTimesheets_desc')} value={payrollDraft.autoApproveTimesheets ?? false} onChange={(v) => updateDraftField('payroll', 'autoApproveTimesheets', v)} />
        <SettingNumber label={t('settings:payroll.roundClockEntries')} value={payrollDraft.roundClockEntries ?? 0} onChange={(v) => updateDraftField('payroll', 'roundClockEntries', v)} min={0} max={60} step={5} />
        <SettingToggle label={t('settings:payroll.showGrossPay')} description={t('settings:payroll.showGrossPay_desc')} value={payrollDraft.showGrossPay ?? true} onChange={(v) => updateDraftField('payroll', 'showGrossPay', v)} />
      </SettingGroup>
      <SectionActions hasChanges={hasChanges('payroll')} onSave={() => saveCategory('payroll')} onReset={() => resetCategory('payroll')} saving={saving} t={t} />
    </div>
  );

  const renderTimeOff = () => (
    <div>
      <SettingGroup>
        <SettingNumber label={t('settings:timeOff.ptoAccrualRate')} value={timeOffDraft.ptoAccrualRate ?? 1.25} onChange={(v) => updateDraftField('timeOff', 'ptoAccrualRate', v)} min={0} max={10} step={0.25} />
        <SettingNumber label={t('settings:timeOff.annualPtoCap')} value={timeOffDraft.annualPtoCap ?? 20} onChange={(v) => updateDraftField('timeOff', 'annualPtoCap', v)} min={0} max={365} step={1} />
        <SettingToggle label={t('settings:timeOff.requireApproval')} description={t('settings:timeOff.requireApproval_desc')} value={timeOffDraft.requireApproval ?? true} onChange={(v) => updateDraftField('timeOff', 'requireApproval', v)} />
        <SettingNumber label={t('settings:timeOff.maxConsecutiveDays')} value={timeOffDraft.maxConsecutiveDays ?? 15} onChange={(v) => updateDraftField('timeOff', 'maxConsecutiveDays', v)} min={1} max={365} step={1} />
        <SettingToggle label={t('settings:timeOff.blackoutDatesEnabled')} description={t('settings:timeOff.blackoutDatesEnabled_desc')} value={timeOffDraft.blackoutDatesEnabled ?? false} onChange={(v) => updateDraftField('timeOff', 'blackoutDatesEnabled', v)} />
        <SettingNumber label={t('settings:timeOff.minNoticeDays')} value={timeOffDraft.minNoticeDays ?? 7} onChange={(v) => updateDraftField('timeOff', 'minNoticeDays', v)} min={0} max={90} step={1} />
        <SettingNumber label={t('settings:timeOff.carryOverLimit')} value={timeOffDraft.carryOverLimit ?? 5} onChange={(v) => updateDraftField('timeOff', 'carryOverLimit', v)} min={0} max={365} step={1} />
      </SettingGroup>
      <SectionActions hasChanges={hasChanges('timeOff')} onSave={() => saveCategory('timeOff')} onReset={() => resetCategory('timeOff')} saving={saving} t={t} />
    </div>
  );

  const renderSwaps = () => (
    <div>
      <SettingGroup>
        <SettingToggle label={t('settings:swaps.swapRequireApproval')} description={t('settings:swaps.swapRequireApproval_desc')} value={swapsDraft.swapRequireApproval ?? true} onChange={(v) => updateDraftField('swaps', 'swapRequireApproval', v)} />
        <SettingNumber label={t('settings:swaps.swapWindowHours')} value={swapsDraft.swapWindowHours ?? 24} onChange={(v) => updateDraftField('swaps', 'swapWindowHours', v)} min={0} max={168} step={1} />
        <SettingNumber label={t('settings:swaps.maxSwapsPerMonth')} value={swapsDraft.maxSwapsPerMonth ?? 4} onChange={(v) => updateDraftField('swaps', 'maxSwapsPerMonth', v)} min={0} max={30} step={1} />
        <SettingToggle label={t('settings:swaps.allowCrossDepartment')} description={t('settings:swaps.allowCrossDepartment_desc')} value={swapsDraft.allowCrossDepartment ?? false} onChange={(v) => updateDraftField('swaps', 'allowCrossDepartment', v)} />
        <SettingToggle label={t('settings:swaps.notifyManager')} description={t('settings:swaps.notifyManager_desc')} value={swapsDraft.notifyManager ?? true} onChange={(v) => updateDraftField('swaps', 'notifyManager', v)} />
      </SettingGroup>
      <SectionActions hasChanges={hasChanges('swaps')} onSave={() => saveCategory('swaps')} onReset={() => resetCategory('swaps')} saving={saving} t={t} />
    </div>
  );

  const renderNotifications = () => (
    <div>
      <SettingGroup>
        <SettingToggle label={t('settings:notifications.emailEnabled')} description={t('settings:notifications.emailEnabled_desc')} value={notificationsDraft.emailEnabled ?? true} onChange={(v) => updateDraftField('notifications', 'emailEnabled', v)} />
        <SettingToggle label={t('settings:notifications.shiftAssignment')} description={t('settings:notifications.shiftAssignment_desc')} value={notificationsDraft.shiftAssignment ?? true} onChange={(v) => updateDraftField('notifications', 'shiftAssignment', v)} />
        <SettingToggle label={t('settings:notifications.schedulePublished')} description={t('settings:notifications.schedulePublished_desc')} value={notificationsDraft.schedulePublished ?? true} onChange={(v) => updateDraftField('notifications', 'schedulePublished', v)} />
        <SettingToggle label={t('settings:notifications.swapRequests')} description={t('settings:notifications.swapRequests_desc')} value={notificationsDraft.swapRequests ?? true} onChange={(v) => updateDraftField('notifications', 'swapRequests', v)} />
        <SettingToggle label={t('settings:notifications.timeOffDecision')} description={t('settings:notifications.timeOffDecision_desc')} value={notificationsDraft.timeOffDecision ?? true} onChange={(v) => updateDraftField('notifications', 'timeOffDecision', v)} />
        <SettingToggle label={t('settings:notifications.performanceReviews')} description={t('settings:notifications.performanceReviews_desc')} value={notificationsDraft.performanceReviews ?? true} onChange={(v) => updateDraftField('notifications', 'performanceReviews', v)} />
      </SettingGroup>
      <SettingGroup>
        <SettingNumber label={t('settings:notifications.reminderLeadTime')} value={notificationsDraft.reminderLeadTime ?? 24} onChange={(v) => updateDraftField('notifications', 'reminderLeadTime', v)} min={1} max={72} step={1} />
        <SettingSelect label={t('settings:notifications.digestFrequency')} value={notificationsDraft.digestFrequency || 'none'} onChange={(v) => updateDraftField('notifications', 'digestFrequency', v)}
          options={[{ value: 'none', label: t('settings:notifications.digestFrequency_none') }, { value: 'daily', label: t('settings:notifications.digestFrequency_daily') }, { value: 'weekly', label: t('settings:notifications.digestFrequency_weekly') }]}
        />
        <SettingText label={t('settings:notifications.quietHoursStart')} value={notificationsDraft.quietHoursStart || '22:00'} onChange={(v) => updateDraftField('notifications', 'quietHoursStart', v)} placeholder="HH:mm" />
        <SettingText label={t('settings:notifications.quietHoursEnd')} value={notificationsDraft.quietHoursEnd || '07:00'} onChange={(v) => updateDraftField('notifications', 'quietHoursEnd', v)} placeholder="HH:mm" />
      </SettingGroup>
      {/* User notification overrides */}
      <SettingGroup title={t('settings:notifications.userOverrides')}>
        <SettingToggle label={t('settings:notifications.myShiftAssignment')} value={displayDraft.myShiftAssignment ?? true} onChange={(v) => updateDraftField('display', 'myShiftAssignment', v)} />
        <SettingToggle label={t('settings:notifications.mySchedulePublished')} value={displayDraft.mySchedulePublished ?? true} onChange={(v) => updateDraftField('display', 'mySchedulePublished', v)} />
        <SettingToggle label={t('settings:notifications.mySwapRequests')} value={displayDraft.mySwapRequests ?? true} onChange={(v) => updateDraftField('display', 'mySwapRequests', v)} />
        <SettingToggle label={t('settings:notifications.myTimeOffDecision')} value={displayDraft.myTimeOffDecision ?? true} onChange={(v) => updateDraftField('display', 'myTimeOffDecision', v)} />
        <SettingToggle label={t('settings:notifications.myPerformanceReviews')} value={displayDraft.myPerformanceReviews ?? true} onChange={(v) => updateDraftField('display', 'myPerformanceReviews', v)} />
      </SettingGroup>
      <SectionActions hasChanges={hasChanges('notifications') || hasChanges('display')} onSave={async () => { await saveCategory('notifications'); await saveCategory('display'); }} onReset={() => resetCategory('notifications')} saving={saving} t={t} />
    </div>
  );

  const renderFeatureFlags = () => (
    <div>
      <p className="text-sm text-gray-500 mb-4">{t('settings:featureFlags.description')}</p>
      <SettingGroup>
        {['enablePayroll', 'enableTimeOff', 'enableShiftSwaps', 'enableReports', 'enableDashboard',
          'enablePOS', 'enableNotifications', 'enableMobile', 'enableAuditLog', 'enableBetaFeatures'].map((key) => (
          <SettingToggle
            key={key}
            label={t(`settings:featureFlags.${key}`)}
            description={t(`settings:featureFlags.${key}_desc`)}
            value={featureFlagsDraft[key] ?? false}
            onChange={(v) => updateDraftField('featureFlags', key, v)}
          />
        ))}
      </SettingGroup>
      <SectionActions hasChanges={hasChanges('featureFlags')} onSave={() => saveCategory('featureFlags')} onReset={() => resetCategory('featureFlags')} saving={saving} t={t} />
    </div>
  );

  const renderDisplay = () => (
    <div>
      <SettingGroup>
        <SettingSelect label={t('settings:display.theme')} value={displayDraft.theme || 'light'} onChange={(v) => updateDraftField('display', 'theme', v)}
          options={[{ value: 'light', label: t('settings:display.theme_light') }, { value: 'dark', label: t('settings:display.theme_dark') }, { value: 'system', label: t('settings:display.theme_system') }]}
        />
        <SettingSelect label={t('settings:display.rowsPerPage')} value={String(displayDraft.rowsPerPage ?? 10)} onChange={(v) => updateDraftField('display', 'rowsPerPage', Number(v))}
          options={[{ value: '5', label: '5' }, { value: '10', label: '10' }, { value: '20', label: '20' }, { value: '50', label: '50' }]}
        />
      </SettingGroup>
      <SettingGroup>
        <SettingToggle label={t('settings:display.compactMode')} description={t('settings:display.compactMode_desc')} value={displayDraft.compactMode ?? false} onChange={(v) => updateDraftField('display', 'compactMode', v)} />
        <SettingToggle label={t('settings:display.sidebarCollapsed')} description={t('settings:display.sidebarCollapsed_desc')} value={displayDraft.sidebarCollapsed ?? false} onChange={(v) => updateDraftField('display', 'sidebarCollapsed', v)} />
        <SettingToggle label={t('settings:display.animateTransitions')} description={t('settings:display.animateTransitions_desc')} value={displayDraft.animateTransitions ?? true} onChange={(v) => updateDraftField('display', 'animateTransitions', v)} />
      </SettingGroup>
      <SectionActions hasChanges={hasChanges('display')} onSave={() => saveCategory('display')} onReset={() => resetCategory('display')} saving={saving} t={t} />
    </div>
  );

  const renderAccessibility = () => (
    <div>
      <SettingGroup>
        <SettingSelect label={t('settings:accessibility.fontSize')} value={accessibilityDraft.fontSize || 'medium'} onChange={(v) => updateDraftField('accessibility', 'fontSize', v)}
          options={[{ value: 'small', label: t('settings:accessibility.fontSize_small') }, { value: 'medium', label: t('settings:accessibility.fontSize_medium') }, { value: 'large', label: t('settings:accessibility.fontSize_large') }]}
        />
        <SettingToggle label={t('settings:accessibility.highContrast')} description={t('settings:accessibility.highContrast_desc')} value={accessibilityDraft.highContrast ?? false} onChange={(v) => updateDraftField('accessibility', 'highContrast', v)} />
        <SettingToggle label={t('settings:accessibility.reducedMotion')} description={t('settings:accessibility.reducedMotion_desc')} value={accessibilityDraft.reducedMotion ?? false} onChange={(v) => updateDraftField('accessibility', 'reducedMotion', v)} />
        <SettingToggle label={t('settings:accessibility.focusRingAlwaysVisible')} description={t('settings:accessibility.focusRingAlwaysVisible_desc')} value={accessibilityDraft.focusRingAlwaysVisible ?? false} onChange={(v) => updateDraftField('accessibility', 'focusRingAlwaysVisible', v)} />
      </SettingGroup>
      <SectionActions hasChanges={hasChanges('accessibility')} onSave={() => saveCategory('accessibility')} onReset={() => resetCategory('accessibility')} saving={saving} t={t} />
    </div>
  );

  const renderSecurity = () => (
    <div>
      <SettingGroup>
        <SettingNumber label={t('settings:security.sessionTimeoutMinutes')} value={securityDraft.sessionTimeoutMinutes ?? 30} onChange={(v) => updateDraftField('security', 'sessionTimeoutMinutes', v)} min={5} max={480} step={5} />
        <SettingNumber label={t('settings:security.maxLoginAttempts')} value={securityDraft.maxLoginAttempts ?? 5} onChange={(v) => updateDraftField('security', 'maxLoginAttempts', v)} min={1} max={20} step={1} />
        <SettingNumber label={t('settings:security.lockoutDurationMinutes')} value={securityDraft.lockoutDurationMinutes ?? 15} onChange={(v) => updateDraftField('security', 'lockoutDurationMinutes', v)} min={1} max={1440} step={1} />
      </SettingGroup>
      <SettingGroup>
        <SettingNumber label={t('settings:security.passwordMinLength')} value={securityDraft.passwordMinLength ?? 8} onChange={(v) => updateDraftField('security', 'passwordMinLength', v)} min={4} max={32} step={1} />
        <SettingToggle label={t('settings:security.passwordRequireUppercase')} description={t('settings:security.passwordRequireUppercase_desc')} value={securityDraft.passwordRequireUppercase ?? true} onChange={(v) => updateDraftField('security', 'passwordRequireUppercase', v)} />
        <SettingToggle label={t('settings:security.passwordRequireNumbers')} description={t('settings:security.passwordRequireNumbers_desc')} value={securityDraft.passwordRequireNumbers ?? true} onChange={(v) => updateDraftField('security', 'passwordRequireNumbers', v)} />
        <SettingToggle label={t('settings:security.passwordRequireSpecial')} description={t('settings:security.passwordRequireSpecial_desc')} value={securityDraft.passwordRequireSpecial ?? false} onChange={(v) => updateDraftField('security', 'passwordRequireSpecial', v)} />
        <SettingNumber label={t('settings:security.passwordExpiryDays')} value={securityDraft.passwordExpiryDays ?? 0} onChange={(v) => updateDraftField('security', 'passwordExpiryDays', v)} min={0} max={365} step={1} />
      </SettingGroup>
      <SettingGroup>
        <SettingToggle label={t('settings:security.twoFactorEnabled')} description={t('settings:security.twoFactorEnabled_desc')} value={securityDraft.twoFactorEnabled ?? false} onChange={(v) => updateDraftField('security', 'twoFactorEnabled', v)} />
        <SettingToggle label={t('settings:security.ipWhitelistEnabled')} description={t('settings:security.ipWhitelistEnabled_desc')} value={securityDraft.ipWhitelistEnabled ?? false} onChange={(v) => updateDraftField('security', 'ipWhitelistEnabled', v)} />
        <SettingNumber label={t('settings:security.auditLogRetentionDays')} value={securityDraft.auditLogRetentionDays ?? 365} onChange={(v) => updateDraftField('security', 'auditLogRetentionDays', v)} min={30} max={3650} step={30} />
      </SettingGroup>
      <SectionActions hasChanges={hasChanges('security')} onSave={() => saveCategory('security')} onReset={() => resetCategory('security')} saving={saving} t={t} />
    </div>
  );

  const renderDataPrivacy = () => (
    <div>
      <SettingGroup>
        <SettingNumber label={t('settings:dataPrivacy.dataRetentionDays')} value={dataPrivacyDraft.dataRetentionDays ?? 730} onChange={(v) => updateDraftField('dataPrivacy', 'dataRetentionDays', v)} min={30} max={3650} step={30} />
        <SettingToggle label={t('settings:dataPrivacy.anonymizeAfterTermination')} description={t('settings:dataPrivacy.anonymizeAfterTermination_desc')} value={dataPrivacyDraft.anonymizeAfterTermination ?? true} onChange={(v) => updateDraftField('dataPrivacy', 'anonymizeAfterTermination', v)} />
        <SettingSelect label={t('settings:dataPrivacy.exportFormat')} value={dataPrivacyDraft.exportFormat || 'csv'} onChange={(v) => updateDraftField('dataPrivacy', 'exportFormat', v)}
          options={[{ value: 'csv', label: t('settings:dataPrivacy.exportFormat_csv') }, { value: 'xlsx', label: t('settings:dataPrivacy.exportFormat_xlsx') }, { value: 'pdf', label: t('settings:dataPrivacy.exportFormat_pdf') }]}
        />
        <SettingToggle label={t('settings:dataPrivacy.allowSelfDataExport')} description={t('settings:dataPrivacy.allowSelfDataExport_desc')} value={dataPrivacyDraft.allowSelfDataExport ?? true} onChange={(v) => updateDraftField('dataPrivacy', 'allowSelfDataExport', v)} />
        <SettingToggle label={t('settings:dataPrivacy.cookieConsentRequired')} description={t('settings:dataPrivacy.cookieConsentRequired_desc')} value={dataPrivacyDraft.cookieConsentRequired ?? false} onChange={(v) => updateDraftField('dataPrivacy', 'cookieConsentRequired', v)} />
        <SettingText label={t('settings:dataPrivacy.privacyPolicyUrl')} value={dataPrivacyDraft.privacyPolicyUrl || ''} onChange={(v) => updateDraftField('dataPrivacy', 'privacyPolicyUrl', v)} placeholder="https://..." />
      </SettingGroup>
      <SectionActions hasChanges={hasChanges('dataPrivacy')} onSave={() => saveCategory('dataPrivacy')} onReset={() => resetCategory('dataPrivacy')} saving={saving} t={t} />
    </div>
  );

  const renderDepartments = () => (
    <DepartmentsEditor
      departments={savedDepartments}
      createDepartment={createDepartment}
      updateDepartment={updateDepartment}
      deleteDepartment={deleteDepartment}
      t={t}
    />
  );

  const renderShiftTypes = () => (
    <ShiftTypesEditor
      shiftTypes={savedShiftTypes}
      createShiftType={createShiftType}
      updateShiftType={updateShiftType}
      deleteShiftType={deleteShiftType}
      t={t}
    />
  );

  const renderInvoices = () => {
    const readOnly = !isAdmin;
    const inputClass = readOnly
      ? 'block w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 cursor-not-allowed'
      : 'block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500';

    return (
      <div className="space-y-6" data-testid="invoice-settings-section">
        <p className="text-sm text-gray-500">{t('settings:invoices.description')}</p>

        {/* Defaults */}
        <fieldset>
          <legend className="text-sm font-semibold text-gray-700 mb-3">{t('settings:invoices.defaults')}</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings:invoices.defaultCurrency')}</label>
              <input type="text" value={invoicesDraft.defaultCurrency || 'EUR'} onChange={(e) => updateDraftField('invoices', 'defaultCurrency', e.target.value)} className={inputClass} readOnly={readOnly} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings:invoices.defaultTaxRate')}</label>
              <input type="number" step="0.01" value={invoicesDraft.defaultTaxRate ?? 20} onChange={(e) => updateDraftField('invoices', 'defaultTaxRate', e.target.value)} className={inputClass} readOnly={readOnly} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings:invoices.defaultPaymentTerms')}</label>
              <input type="text" value={invoicesDraft.defaultPaymentTerms || ''} onChange={(e) => updateDraftField('invoices', 'defaultPaymentTerms', e.target.value)} className={inputClass} readOnly={readOnly} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings:invoices.defaultEarlyPaymentDiscount')}</label>
              <input type="number" step="0.01" value={invoicesDraft.defaultEarlyPaymentDiscount ?? 0} onChange={(e) => updateDraftField('invoices', 'defaultEarlyPaymentDiscount', e.target.value)} className={inputClass} readOnly={readOnly} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings:invoices.defaultLatePaymentRate')}</label>
              <input type="number" step="0.01" value={invoicesDraft.defaultLatePaymentRate ?? 12.37} onChange={(e) => updateDraftField('invoices', 'defaultLatePaymentRate', e.target.value)} className={inputClass} readOnly={readOnly} />
            </div>
          </div>
        </fieldset>

        {/* Numbering */}
        <fieldset>
          <legend className="text-sm font-semibold text-gray-700 mb-3">{t('settings:invoices.numbering')}</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between sm:col-span-2">
              <div>
                <label className="text-sm font-medium text-gray-700">{t('settings:invoices.autoNumbering')}</label>
                <p className="text-xs text-gray-500">{t('settings:invoices.autoNumbering_desc')}</p>
              </div>
              <button type="button" role="switch" aria-checked={!!invoicesDraft.autoNumbering} disabled={readOnly} onClick={() => !readOnly && updateDraftField('invoices', 'autoNumbering', !invoicesDraft.autoNumbering)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${invoicesDraft.autoNumbering ? 'bg-indigo-600' : 'bg-gray-200'} ${readOnly ? 'opacity-50' : ''}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${invoicesDraft.autoNumbering ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings:invoices.numberPrefix')}</label>
              <input type="text" value={invoicesDraft.numberPrefix || 'FAC-'} onChange={(e) => updateDraftField('invoices', 'numberPrefix', e.target.value)} className={inputClass} readOnly={readOnly} />
            </div>
          </div>
        </fieldset>

        {/* Validation */}
        <fieldset>
          <legend className="text-sm font-semibold text-gray-700 mb-3">{t('settings:invoices.validationRules')}</legend>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">{t('settings:invoices.requireSiret')}</label>
                <p className="text-xs text-gray-500">{t('settings:invoices.requireSiret_desc')}</p>
              </div>
              <button type="button" role="switch" aria-checked={!!invoicesDraft.requireSiret} disabled={readOnly} onClick={() => !readOnly && updateDraftField('invoices', 'requireSiret', !invoicesDraft.requireSiret)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${invoicesDraft.requireSiret ? 'bg-indigo-600' : 'bg-gray-200'} ${readOnly ? 'opacity-50' : ''}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${invoicesDraft.requireSiret ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">{t('settings:invoices.requireVatNumber')}</label>
                <p className="text-xs text-gray-500">{t('settings:invoices.requireVatNumber_desc')}</p>
              </div>
              <button type="button" role="switch" aria-checked={!!invoicesDraft.requireVatNumber} disabled={readOnly} onClick={() => !readOnly && updateDraftField('invoices', 'requireVatNumber', !invoicesDraft.requireVatNumber)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${invoicesDraft.requireVatNumber ? 'bg-indigo-600' : 'bg-gray-200'} ${readOnly ? 'opacity-50' : ''}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${invoicesDraft.requireVatNumber ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </fieldset>

        {/* OCR */}
        <fieldset>
          <legend className="text-sm font-semibold text-gray-700 mb-3">{t('settings:invoices.ocr')}</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings:invoices.ocrProvider')}</label>
              <select value={invoicesDraft.ocrProvider || 'mistral'} onChange={(e) => updateDraftField('invoices', 'ocrProvider', e.target.value)} className={inputClass} disabled={readOnly}>
                <option value="mistral">Mistral AI (mistral-ocr-latest)</option>
                <option value="tesseract">Tesseract.js (local)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings:invoices.ocrConfidenceThreshold')}</label>
              <input type="number" step="0.05" min="0" max="1" value={invoicesDraft.ocrConfidenceThreshold ?? 0.7} onChange={(e) => updateDraftField('invoices', 'ocrConfidenceThreshold', e.target.value)} className={inputClass} readOnly={readOnly} />
            </div>
            <div className="flex items-center justify-between sm:col-span-2">
              <div>
                <label className="text-sm font-medium text-gray-700">{t('settings:invoices.ocrAutoImport')}</label>
                <p className="text-xs text-gray-500">{t('settings:invoices.ocrAutoImport_desc')}</p>
              </div>
              <button type="button" role="switch" aria-checked={!!invoicesDraft.ocrAutoImport} disabled={readOnly} onClick={() => !readOnly && updateDraftField('invoices', 'ocrAutoImport', !invoicesDraft.ocrAutoImport)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${invoicesDraft.ocrAutoImport ? 'bg-indigo-600' : 'bg-gray-200'} ${readOnly ? 'opacity-50' : ''}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${invoicesDraft.ocrAutoImport ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </fieldset>

        {/* Save/Reset */}
        {isAdmin && (
          <SectionActions hasChanges={hasChanges('invoices')} onSave={() => saveCategory('invoices')} onReset={() => resetCategory('invoices')} saving={saving} t={t} />
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeCategory) {
      case 'general': return renderGeneral();
      case 'navbar': return renderNavbar();
      case 'language': return renderLanguage();
      case 'scheduling': return renderScheduling();
      case 'payroll': return renderPayroll();
      case 'timeOff': return renderTimeOff();
      case 'swaps': return renderSwaps();
      case 'notifications': return renderNotifications();
      case 'featureFlags': return renderFeatureFlags();
      case 'invoices': return renderInvoices();
      case 'display': return renderDisplay();
      case 'accessibility': return renderAccessibility();
      case 'security': return renderSecurity();
      case 'dataPrivacy': return renderDataPrivacy();
      case 'departments': return renderDepartments();
      case 'shiftTypes': return renderShiftTypes();
      default: return null;
    }
  };

  if (settingsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('settings:title')}</h1>
            {saveMessage && <p className="mt-2 text-sm text-green-600 font-medium">{saveMessage}</p>}
          </div>
          <div className="w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('settings:searchPlaceholder')}
              className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-56 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden max-h-[calc(100vh-160px)] overflow-y-auto">
              {filteredCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => tryChangeCategory(cat.id)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors border-l-2 ${
                    activeCategory === cat.id
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent'
                  }`}
                >
                  <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={CATEGORY_ICONS[cat.id] || CATEGORY_ICONS.general} />
                  </svg>
                  <span className="truncate">{t(cat.labelKey)}</span>
                  {hasChanges(cat.id) && <span className="ml-auto w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {t(`settings:category.${activeCategory}`)}
              </h2>
              {renderContent()}
            </div>
          </div>
        </div>
      </div>

      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onSave={handleSaveAndLeave}
        onDiscard={handleDiscard}
        onCancel={() => setShowUnsavedModal(false)}
        t={t}
      />
    </div>
  );
};

export default SettingsPage;
