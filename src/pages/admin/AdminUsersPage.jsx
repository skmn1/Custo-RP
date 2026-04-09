import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminUsers, useAdminInvitations } from '../../hooks/useAdmin';
import { ALL_ROLES } from '../../constants/roles';
import { getAccessibleApps } from '../../apps/registry';
import {
  XMarkIcon,
  PaperAirplaneIcon,
  ShieldExclamationIcon,
  ArrowPathIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';

const ROLE_COLORS = {
  super_admin: 'bg-red-100 text-red-800',
  hr_manager: 'bg-green-100 text-green-800',
  planner: 'bg-blue-100 text-blue-800',
  accounting_agent: 'bg-amber-100 text-amber-800',
  stock_manager: 'bg-orange-100 text-orange-800',
  pos_manager: 'bg-teal-100 text-teal-800',
  employee: 'bg-gray-100 text-gray-700',
};

// ── User Detail Slide-in Panel ────────────────────────────────────

function UserDetailPanel({ user, onClose, onSuspend, onUnsuspend, onResetPassword, onRoleChange, t }) {
  const [resetting, setResetting] = useState(false);
  const [resetLink, setResetLink] = useState(null);
  const apps = getAccessibleApps(user.role);

  const handleReset = async () => {
    setResetting(true);
    try {
      const result = await onResetPassword(user.id);
      setResetLink(result?.resetLink || 'Generated');
    } catch { /* error handled by caller */ }
    setResetting(false);
  };

  const copyLink = () => {
    if (resetLink && resetLink !== 'Generated') {
      navigator.clipboard.writeText(resetLink);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="ml-auto relative w-full max-w-md bg-white shadow-xl flex flex-col h-full overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{user.firstName} {user.lastName}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 p-4 space-y-6">
          {/* Profile */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {t('admin:users.detail.profile')}
            </h3>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-lg font-bold text-slate-700">
                {(user.firstName?.[0] || '') + (user.lastName?.[0] || '')}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
          </section>

          {/* Role Selector */}
          <section>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin:users.col.role')}</label>
            <select
              value={user.role}
              onChange={(e) => onRoleChange(user.id, e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500"
            >
              {ALL_ROLES.map((r) => (
                <option key={r} value={r}>{t(`common:role.${r}`)}</option>
              ))}
            </select>
          </section>

          {/* App Access (read-only) */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {t('admin:users.detail.appAccess')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {apps.map((app) => (
                <span key={app.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                  {t(`apps:${app.id}.name`, app.name)}
                </span>
              ))}
              {apps.length === 0 && (
                <span className="text-xs text-gray-400">{t('common:status.noData')}</span>
              )}
            </div>
          </section>

          {/* Account Status */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {t('admin:users.col.status')}
            </h3>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.isActive === false || user.status === 'suspended'
                  ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              }`}>
                {user.isActive === false || user.status === 'suspended'
                  ? t('admin:users.status.suspended')
                  : t('admin:users.status.active')}
              </span>
              {user.isActive !== false && user.status !== 'suspended' ? (
                <button
                  onClick={() => {
                    if (window.confirm(t('admin:users.actions.confirmSuspend'))) onSuspend(user.id);
                  }}
                  className="text-xs text-red-600 hover:text-red-800 flex items-center"
                >
                  <ShieldExclamationIcon className="h-4 w-4 mr-1" />
                  {t('admin:users.actions.suspend')}
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (window.confirm(t('admin:users.actions.confirmUnsuspend'))) onUnsuspend(user.id);
                  }}
                  className="text-xs text-green-600 hover:text-green-800 flex items-center"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-1" />
                  {t('admin:users.actions.unsuspend')}
                </button>
              )}
            </div>
          </section>

          {/* Reset Password */}
          <section>
            <button
              onClick={handleReset}
              disabled={resetting}
              className="inline-flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <KeyIcon className="h-4 w-4 mr-2" />
              {t('admin:users.actions.resetPassword')}
            </button>
            {resetLink && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-800 font-medium">{t('admin:users.actions.resetLinkGenerated')}</p>
                {resetLink !== 'Generated' && (
                  <div className="mt-1 flex items-center space-x-2">
                    <code className="text-xs bg-white px-2 py-1 rounded border border-green-200 flex-1 truncate">{resetLink}</code>
                    <button onClick={copyLink} className="text-xs text-green-700 hover:text-green-900">
                      {t('admin:users.actions.resetLinkCopied')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Last Login */}
          <section>
            <p className="text-xs text-gray-500">
              {t('admin:users.col.lastLogin')}: {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '—'}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

// ── Invite User Modal ─────────────────────────────────────────────

function InviteUserModal({ onClose, onInvite, t }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', role: 'employee' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onInvite(form);
      onClose();
    } catch { /* handled upstream */ }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('admin:users.inviteForm.title')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                required
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                required
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin:users.inviteForm.email')}</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin:users.inviteForm.role')}</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500"
            >
              {ALL_ROLES.map((r) => (
                <option key={r} value={r}>{t(`common:role.${r}`)}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
              {t('common:actions.cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-slate-600 rounded-lg hover:bg-slate-700 disabled:opacity-50"
            >
              <PaperAirplaneIcon className="h-4 w-4 mr-2" />
              {t('admin:users.inviteForm.send')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Pending Invitations ───────────────────────────────────────────

function InvitationsSection({ t }) {
  const { invitations, loading, invite, rescind } = useAdminInvitations();

  if (loading || invitations.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700">{t('admin:invitations.title')}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('admin:invitations.col.email')}</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('admin:invitations.col.role')}</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('admin:invitations.col.expiresAt')}</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">{t('admin:invitations.col.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invitations.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-900">{inv.email}</td>
                <td className="px-4 py-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[inv.role] || 'bg-gray-100 text-gray-700'}`}>
                    {t(`common:role.${inv.role}`, inv.role)}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">{inv.expiresAt ? new Date(inv.expiresAt).toLocaleDateString() : '—'}</td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => { if (window.confirm(t('admin:invitations.confirmRescind'))) rescind(inv.id); }}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    {t('admin:invitations.rescind')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────

const AdminUsersPage = () => {
  const { t } = useTranslation(['admin', 'common', 'auth']);
  const { users, loading, error, suspend, unsuspend, resetPassword, changeRole, refresh } = useAdminUsers();
  const { invite } = useAdminInvitations();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const filtered = users
    .filter((u) => {
      const matchesSearch = !searchTerm ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = !filterRole || u.role === filterRole;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortField === 'name') return dir * `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      if (sortField === 'role') return dir * (a.role || '').localeCompare(b.role || '');
      if (sortField === 'lastLogin') {
        const da = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
        const db = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
        return dir * (da - db);
      }
      return 0;
    });

  const handleInvite = useCallback(async (data) => {
    await invite(data);
    refresh();
  }, [invite, refresh]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('admin:users.title')}</h1>
              <p className="text-sm text-gray-600 mt-1">{t('admin:users.subtitle')}</p>
            </div>
            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center px-4 py-2 bg-slate-600 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors"
            >
              <PaperAirplaneIcon className="h-4 w-4 mr-2" />
              {t('admin:users.invite')}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        <InvitationsSection t={t} />

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder={t('admin:users.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500"
            >
              <option value="">{t('admin:users.col.role')}</option>
              {ALL_ROLES.map((r) => (
                <option key={r} value={r}>{t(`common:role.${r}`)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* User Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700" onClick={() => handleSort('name')}>
                    {t('admin:users.col.name')} {sortField === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin:users.col.email')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700" onClick={() => handleSort('role')}>
                    {t('admin:users.col.role')} {sortField === 'role' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin:users.col.status')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700" onClick={() => handleSort('lastLogin')}>
                    {t('admin:users.col.lastLogin')} {sortField === 'lastLogin' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedUser(u)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm font-semibold text-slate-700">
                          {(u.firstName?.[0] || '') + (u.lastName?.[0] || '')}
                        </div>
                        <span className="ml-3 text-sm font-medium text-gray-900">{u.firstName} {u.lastName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-700'}`}>
                        {t(`common:role.${u.role}`, u.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        u.isActive === false || u.status === 'suspended' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {u.isActive === false || u.status === 'suspended' ? t('admin:users.status.suspended') : t('admin:users.status.active')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      {t('common:status.noData')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
            {filtered.length} / {users.length}
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedUser && (
        <UserDetailPanel
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSuspend={async (id) => { await suspend(id); setSelectedUser(null); }}
          onUnsuspend={async (id) => { await unsuspend(id); setSelectedUser(null); }}
          onResetPassword={resetPassword}
          onRoleChange={async (id, role) => { await changeRole(id, role); setSelectedUser(null); }}
          t={t}
        />
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteUserModal
          onClose={() => setShowInviteModal(false)}
          onInvite={handleInvite}
          t={t}
        />
      )}
    </div>
  );
};

export default AdminUsersPage;
