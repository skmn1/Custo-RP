import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  UsersIcon,
  PlusIcon,
  XMarkIcon,
  BuildingStorefrontIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { fetchUsers, fetchPosAssignments, assignTerminal, removeTerminalAssignment } from '../api/adminApi';
import { posApi } from '../api/posApi';

const PosTerminalAssignmentsPage = () => {
  const { t } = useTranslation(['pos', 'common']);

  const [users, setUsers] = useState([]);
  const [terminals, setTerminals] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState(null);

  // Load all pos_manager users and all terminals
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [allUsers, allTerminals] = await Promise.all([
          fetchUsers(),
          posApi.list(),
        ]);
        setUsers((Array.isArray(allUsers) ? allUsers : []).filter(
          (u) => u.role === 'pos_manager' && u.isActive,
        ));
        setTerminals(Array.isArray(allTerminals) ? allTerminals : []);
      } catch (err) {
        setError(err.message || t('common:error.generic'));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [t]);

  const loadAssignments = useCallback(async (userId) => {
    try {
      const data = await fetchPosAssignments(userId);
      setAssignments(Array.isArray(data) ? data : []);
    } catch {
      setAssignments([]);
    }
  }, []);

  const handleSelectUser = useCallback(
    (user) => {
      setSelectedUser(user);
      loadAssignments(user.id);
    },
    [loadAssignments],
  );

  const handleAssign = useCallback(
    async (terminalId) => {
      if (!selectedUser || isAssigning) return;
      setIsAssigning(true);
      try {
        await assignTerminal(selectedUser.id, terminalId);
        await loadAssignments(selectedUser.id);
      } catch {
        // Ignore duplicate-assignment errors silently
      } finally {
        setIsAssigning(false);
      }
    },
    [selectedUser, isAssigning, loadAssignments],
  );

  const handleRemove = useCallback(
    async (terminalId) => {
      if (!selectedUser) return;
      try {
        await removeTerminalAssignment(selectedUser.id, terminalId);
        await loadAssignments(selectedUser.id);
      } catch {
        // ignore
      }
    },
    [selectedUser, loadAssignments],
  );

  const assignedIds = new Set(assignments.map((a) => a.posTerminalId));
  const assignedTerminals = terminals.filter((t) => assignedIds.has(t.id));
  const availableTerminals = terminals.filter((t) => !assignedIds.has(t.id));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t('pos:assignments.title')}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t('pos:assignments.subtitle')}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── User list ── */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <UsersIcon className="w-4 h-4" />
                {t('pos:assignments.posManagers')}
              </h2>
            </div>

            {users.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 p-4">
                {t('pos:assignments.noPosManagers')}
              </p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {users.map((u) => (
                  <li key={u.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectUser(u)}
                      className={`w-full text-left px-4 py-3 transition-colors ${
                        selectedUser?.id === u.id
                          ? 'bg-teal-50 dark:bg-teal-900/30 border-l-2 border-teal-500'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <UserCircleIcon className="w-8 h-8 text-gray-400 dark:text-gray-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {u.firstName} {u.lastName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{u.email}</p>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ── Assignment panel ── */}
        <div className="lg:col-span-2">
          {!selectedUser ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center h-48 gap-3">
              <UsersIcon className="w-10 h-10 text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('pos:assignments.selectUser')}
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* User header */}
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                <UserCircleIcon className="w-10 h-10 text-teal-500 shrink-0" />
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{selectedUser.email}</p>
                </div>
              </div>

              {/* Assigned terminals */}
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
                  {t('pos:assignments.assignedTerminals')}
                </h3>
                {assignedTerminals.length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    {t('pos:assignments.noAssignedTerminals')}
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {assignedTerminals.map((terminal) => (
                      <span
                        key={terminal.id}
                        className="inline-flex items-center gap-1.5 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700 rounded-full px-3 py-1 text-sm"
                      >
                        <BuildingStorefrontIcon className="w-3.5 h-3.5 shrink-0" />
                        {terminal.name}
                        <button
                          type="button"
                          onClick={() => handleRemove(terminal.id)}
                          className="ml-0.5 text-teal-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                          aria-label={`Remove ${terminal.name}`}
                        >
                          <XMarkIcon className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Available terminals to assign */}
              {availableTerminals.length > 0 && (
                <div className="px-5 py-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
                    {t('pos:assignments.availableTerminals')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {availableTerminals.map((terminal) => (
                      <button
                        key={terminal.id}
                        type="button"
                        onClick={() => handleAssign(terminal.id)}
                        disabled={isAssigning}
                        className="inline-flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:text-teal-700 dark:hover:text-teal-300 hover:border-teal-300 dark:hover:border-teal-600 rounded-full px-3 py-1 text-sm transition-colors disabled:opacity-50"
                      >
                        <PlusIcon className="w-3.5 h-3.5 shrink-0" />
                        {terminal.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {availableTerminals.length === 0 && assignedTerminals.length > 0 && (
                <div className="px-5 py-4">
                  <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                    {t('pos:assignments.allAssigned')}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PosTerminalAssignmentsPage;
