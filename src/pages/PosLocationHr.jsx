import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UsersIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { posApi } from '../api/posApi';

const PosLocationHr = () => {
  const { posLocationId } = useParams();
  const { t } = useTranslation(['pos']);
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    posApi
      .getHrStaff(posLocationId)
      .then((result) => {
        if (!cancelled) setStaff(result?.data ?? result ?? []);
      })
      .catch(() => {
        if (!cancelled) setStaff([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [posLocationId]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t('pos:hr.title')}
        </h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
        </div>
      ) : staff.length === 0 ? (
        <div className="text-center py-16">
          <UsersIcon className="mx-auto h-10 w-10 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {t('pos:hr.noStaff')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((member) => (
            <div
              key={member.id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-teal-700 dark:text-teal-300">
                    {(member.firstName?.[0] ?? '') + (member.lastName?.[0] ?? '')}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {member.firstName} {member.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{member.role}</p>
                </div>
              </div>
              {member.email && (
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <EnvelopeIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{member.email}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PosLocationHr;
