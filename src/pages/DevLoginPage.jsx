import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';

// ── Seed test accounts (created by data.sql) ────────────────────────────────
const TEST_ACCOUNTS = [
  {
    role: 'admin',
    email: 'admin@staffscheduler.com',
    password: 'Admin@123',
    firstName: 'System',
    lastName: 'Admin',
    description: 'Full access — all features, user management',
    color: 'from-purple-500 to-indigo-600',
    bg: 'bg-purple-50 border-purple-200 hover:border-purple-400 hover:bg-purple-100',
    badge: 'bg-purple-100 text-purple-700',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    role: 'manager',
    email: 'manager@staffscheduler.com',
    password: 'Manager@123',
    firstName: 'Jane',
    lastName: 'Smith',
    description: 'Manage schedules, employees, payroll — no user admin',
    color: 'from-blue-500 to-cyan-600',
    bg: 'bg-blue-50 border-blue-200 hover:border-blue-400 hover:bg-blue-100',
    badge: 'bg-blue-100 text-blue-700',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    role: 'employee',
    email: 'employee@staffscheduler.com',
    password: 'Employee@123',
    firstName: 'Sarah',
    lastName: 'Johnson',
    description: 'View & edit own schedule and profile only',
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-100',
    badge: 'bg-emerald-100 text-emerald-700',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    role: 'viewer',
    email: 'viewer@staffscheduler.com',
    password: 'Viewer@123',
    firstName: 'Robert',
    lastName: 'Taylor',
    description: 'Read-only — schedules and employees, no payroll',
    color: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50 border-amber-200 hover:border-amber-400 hover:bg-amber-100',
    badge: 'bg-amber-100 text-amber-700',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-3-9a9 9 0 100 18A9 9 0 0012 3z" />
      </svg>
    ),
  },
];

// ── RoleCard ─────────────────────────────────────────────────────────────────
const RoleCard = ({ account, onLogin, loading }) => {
  const { t } = useTranslation(['common']);
  const active = loading === account.role;
  return (
    <button
      type="button"
      data-role={account.role}
      disabled={!!loading}
      onClick={() => onLogin(account)}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${account.bg} ${
        active ? 'opacity-80 scale-[0.98]' : 'cursor-pointer'
      } ${loading && !active ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${account.color} flex items-center justify-center text-white flex-shrink-0 shadow-sm`}>
          {active ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : account.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold text-gray-900 capitalize">{account.firstName} {account.lastName}</span>
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${account.badge}`}>
              {t(`common:role.${account.role}`)}
            </span>
          </div>
          <p className="text-xs text-gray-500 leading-snug">{account.description}</p>
          <p className="text-xs text-gray-400 mt-1 font-mono">{account.email}</p>
        </div>
        {!active && (
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>
    </button>
  );
};

// ── DevLoginPage ──────────────────────────────────────────────────────────────
const DevLoginPage = () => {
  const { t } = useTranslation(['auth', 'common']);
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [roleLoading, setRoleLoading] = useState(null);

  const doLogin = async (e, pwd) => {
    setError('');
    setSubmitting(true);
    try {
      await login(e, pwd);
      navigate('/scheduler', { replace: true });
    } catch (err) {
      if (err.status === 403 && err.code === 'FORBIDDEN') {
        setError(t('auth:login.error.deactivated'));
      } else if (!err.status || err.status >= 500) {
        setError(t('auth:login.error.unavailable'));
      } else {
        setError(t('auth:login.error.invalid'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    doLogin(email, password);
  };

  const handleRoleLogin = async (account) => {
    setError('');
    setRoleLoading(account.role);
    try {
      await login(account.email, account.password);
      navigate('/scheduler', { replace: true });
    } catch (err) {
      if (err.status === 403 && err.code === 'FORBIDDEN') {
        setError(t('auth:login.error.deactivated'));
      } else if (!err.status || err.status >= 500) {
        setError(t('auth:login.error.unavailable'));
      } else {
        setError(t('auth:login.error.invalid'));
      }
      setRoleLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* ── Left panel: Sign-in form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="mx-auto w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mb-4">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{t('auth:login.title')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('common:app.tagline')}</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth:login.email')}
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth:login.password')}
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !!roleLoading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
              {submitting && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              )}
              {submitting ? t('auth:login.submitting') : t('auth:login.submit')}
            </button>

            <p className="text-center text-sm text-gray-600">
              {t('auth:login.noAccount')}{' '}
              <Link to="/register" className="text-indigo-600 hover:text-indigo-500 font-medium">
                {t('auth:login.register')}
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="hidden lg:flex items-center">
        <div className="h-3/4 w-px bg-gray-200" />
      </div>

      {/* ── Right panel: Quick role access ── */}
      <div className="hidden lg:flex flex-1 items-center justify-center px-6 py-12 bg-white border-l border-gray-100">
        <div className="w-full max-w-sm">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-semibold uppercase tracking-wide">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Dev only
              </span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Quick role access</h2>
            <p className="text-sm text-gray-500 mt-0.5">Click any role card to sign in as that test user.</p>
          </div>

          <div className="space-y-3">
            {TEST_ACCOUNTS.map((account) => (
              <RoleCard
                key={account.role}
                account={account}
                onLogin={handleRoleLogin}
                loading={roleLoading}
              />
            ))}
          </div>

          <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-medium text-gray-700 mb-2">Test credentials</p>
            <div className="space-y-1">
              {TEST_ACCOUNTS.map((a) => (
                <div key={a.role} className="flex items-center justify-between text-xs">
                  <span className={`px-1.5 py-0.5 rounded font-medium ${a.badge}`}>{a.role}</span>
                  <span className="text-gray-500 font-mono">{a.password}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile: quick role cards below the form ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <p className="text-xs text-amber-600 font-semibold uppercase tracking-wide mb-3 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Dev — Quick access
        </p>
        <div className="grid grid-cols-2 gap-2">
          {TEST_ACCOUNTS.map((account) => {
            const active = roleLoading === account.role;
            return (
              <button
                key={account.role}
                type="button"
                data-role={account.role}
                disabled={!!roleLoading || submitting}
                onClick={() => handleRoleLogin(account)}
                className={`flex items-center gap-2 p-2.5 rounded-lg border-2 transition-all text-left ${account.bg} ${
                  active ? 'opacity-80' : ''
                } ${roleLoading && !active ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <div className={`w-7 h-7 rounded-md bg-gradient-to-br ${account.color} flex items-center justify-center text-white flex-shrink-0`}>
                  {active ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : (
                    <span className="text-white">{React.cloneElement(account.icon, { className: 'w-4 h-4' })}</span>
                  )}
                </div>
                <div>
                  <div className={`text-xs font-semibold ${account.badge.split(' ')[1]} capitalize`}>{account.role}</div>
                  <div className="text-xs text-gray-500">{account.firstName}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DevLoginPage;
