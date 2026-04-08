import React from 'react';
import { useTranslation } from 'react-i18next';
import { POS_TYPE_COLORS } from '../../constants/pos';

const TYPE_KEY_MAP = { BUTCHER: 'butcher', GROCERY: 'grocery', FAST_FOOD: 'fastFood', MIXED: 'mixed' };

const PosListView = ({ posList, onView, onEdit, onDelete }) => {
  const { t } = useTranslation(['pos']);
  return (
    <div className="overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('pos:table.location')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('pos:table.type')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('pos:table.address')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('pos:table.manager')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('pos:table.phone')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('pos:table.rating')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('pos:table.status')}
            </th>
            <th className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {posList.map((pos) => {
            const typeColor = POS_TYPE_COLORS[pos.type] || POS_TYPE_COLORS.MIXED;
            return (
              <tr
                key={pos.id}
                data-testid="pos-card"
                data-pos-id={pos.id}
                className={`hover:bg-gray-50 transition-colors ${!pos.isActive ? 'opacity-50' : ''}`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-semibold text-gray-900" data-testid="pos-name">
                      {pos.name}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    data-testid="pos-type-badge"
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColor.bg} ${typeColor.text} ${typeColor.border} border`}
                  >
                    {t(`pos:type.${TYPE_KEY_MAP[pos.type]}`) || pos.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate" data-testid="pos-address" title={pos.address}>
                    {pos.address}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900" data-testid="pos-manager">
                    {pos.managerName || <span className="text-gray-400 italic">{t('pos:detail.unassigned')}</span>}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{pos.phone || '—'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {pos.googleRating != null ? (
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-semibold text-gray-700">{pos.googleRating.toFixed(1)}</span>
                      {pos.googleReviewCount != null && (
                        <span className="text-xs text-gray-400">({pos.googleReviewCount})</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="flex items-center gap-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${pos.isActive ? 'bg-green-400' : 'bg-gray-400'}`}
                    />
                    <span className="text-sm text-gray-700">
                      {pos.isActive ? t('pos:status.active') : t('pos:status.inactive')}
                    </span>
                    {!pos.isActive && (
                      <span
                        data-testid="pos-inactive-badge"
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 ml-1"
                      >
                        {t('pos:status.inactive')}
                      </span>
                    )}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onView(pos)}
                      className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 transition-colors"
                      title={t('pos:btn.view')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onEdit(pos)}
                      className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 transition-colors"
                      title={t('pos:btn.edit')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(pos)}
                      className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors"
                      title={t('pos:btn.delete')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PosListView;
