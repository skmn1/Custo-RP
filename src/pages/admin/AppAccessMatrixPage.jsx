import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppAccessMatrix, useAdminUsers } from '../../hooks/useAdmin';
import { APPS } from '../../apps/registry';
import { ALL_ROLES } from '../../constants/roles';

const LEVELS = ['none', 'read', 'full'];

function levelLabel(level, t) {
  if (level === 'none' || !level) return t('admin:appAccess.none');
  if (level === 'read') return t('admin:appAccess.read');
  return t('admin:appAccess.full');
}

function levelColor(level) {
  if (level === 'full') return 'bg-green-100 text-green-800 border-green-300';
  if (level === 'read') return 'bg-blue-100 text-blue-800 border-blue-300';
  return 'bg-gray-50 text-gray-400 border-gray-200';
}

const AppAccessMatrixPage = () => {
  const { t } = useTranslation(['admin', 'common', 'apps', 'roles']);
  const { matrix, loading, error, save } = useAppAccessMatrix();
  const { users } = useAdminUsers();
  const [pendingChange, setPendingChange] = useState(null);
  const [saving, setSaving] = useState(false);

  // Build a local editable copy of the matrix
  const [localMatrix, setLocalMatrix] = useState(null);

  // Sync from loaded matrix
  useMemo(() => {
    if (matrix && !localMatrix) {
      setLocalMatrix(JSON.parse(JSON.stringify(matrix)));
    }
  }, [matrix]);

  const userCountByRole = useMemo(() => {
    const counts = {};
    ALL_ROLES.forEach((r) => { counts[r] = 0; });
    users.forEach((u) => { if (u.role && counts[u.role] !== undefined) counts[u.role]++; });
    return counts;
  }, [users]);

  const handleCellClick = (appId, role) => {
    if (role === 'super_admin') return; // super_admin always has full access
    const current = localMatrix?.[appId]?.[role] || 'none';
    const nextIdx = (LEVELS.indexOf(current) + 1) % LEVELS.length;
    const next = LEVELS[nextIdx];
    setPendingChange({ appId, role, from: current, to: next, count: userCountByRole[role] || 0 });
  };

  const confirmChange = async () => {
    if (!pendingChange) return;
    const { appId, role, to } = pendingChange;
    const updated = { ...localMatrix };
    if (!updated[appId]) updated[appId] = {};
    updated[appId] = { ...updated[appId], [role]: to };
    setLocalMatrix(updated);
    setSaving(true);
    try {
      await save(updated);
    } catch { /* error handled by hook */ }
    setSaving(false);
    setPendingChange(null);
  };

  const apps = APPS.filter((a) => a.id !== 'admin');
  const roles = ALL_ROLES;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">{t('admin:appAccess.title')}</h1>
          <p className="text-sm text-gray-600 mt-1">{t('admin:appAccess.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                    {t('admin:appAccess.app')}
                  </th>
                  {roles.map((role) => (
                    <th key={role} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t(`common:role.${role}`, role)}
                      <div className="text-[10px] text-gray-400 font-normal mt-0.5">{userCountByRole[role] || 0} users</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {apps.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                      {t(`apps:${app.id}.name`, app.name)}
                    </td>
                    {roles.map((role) => {
                      const level = role === 'super_admin' ? 'full' : (localMatrix?.[app.id]?.[role] || 'none');
                      return (
                        <td key={role} className="px-3 py-3 text-center">
                          <button
                            onClick={() => handleCellClick(app.id, role)}
                            disabled={role === 'super_admin'}
                            className={`inline-flex items-center px-2.5 py-1 rounded border text-xs font-medium transition-colors ${levelColor(level)} ${
                              role === 'super_admin' ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:shadow-sm'
                            }`}
                          >
                            {levelLabel(level, t)}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {pendingChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog">
          <div className="fixed inset-0 bg-black/30" onClick={() => setPendingChange(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('admin:appAccess.confirmTitle')}</h3>
            <p className="text-sm text-gray-600 mb-4">
              {t('admin:appAccess.confirmMessage', {
                count: pendingChange.count,
                role: t(`common:role.${pendingChange.role}`, pendingChange.role),
              })}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium ${levelColor(pendingChange.from)}`}>
                {levelLabel(pendingChange.from, t)}
              </span>
              <span className="mx-2">→</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium ${levelColor(pendingChange.to)}`}>
                {levelLabel(pendingChange.to, t)}
              </span>
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setPendingChange(null)}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('common:actions.cancel')}
              </button>
              <button
                onClick={confirmChange}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-slate-600 rounded-lg hover:bg-slate-700 disabled:opacity-50"
              >
                {t('common:actions.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppAccessMatrixPage;
