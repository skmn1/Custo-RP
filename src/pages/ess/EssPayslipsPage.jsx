import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '../../api/config';

const EssPayslipsPage = () => {
  const { t } = useTranslation('ess');
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/ess/payslips')
      .then((res) => setPayslips(res.data || []))
      .catch(() => setPayslips([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        {t('payslips.title')}
      </h1>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : payslips.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 py-12 text-center">{t('payslips.noPayslips')}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">{t('payslips.period')}</th>
                <th className="px-4 py-3 text-right">{t('payslips.grossPay')}</th>
                <th className="px-4 py-3 text-right">{t('payslips.netPay')}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {payslips.map((p) => (
                <tr key={p.id} className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{p.period}</td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{p.grossPay}</td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{p.netPay}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 text-xs font-medium">
                      {t('payslips.download')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EssPayslipsPage;
