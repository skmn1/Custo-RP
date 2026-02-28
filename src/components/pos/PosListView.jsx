import React from 'react';
import Button from '../ui/Button';
import { POS_TYPE_LABELS, POS_TYPE_COLORS } from '../../constants/pos';

const PosListView = ({ posList, onView, onEdit, onDelete }) => {
  return (
    <div className="overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Location
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Address
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Manager
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Phone
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
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
                    {POS_TYPE_LABELS[pos.type] || pos.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate" data-testid="pos-address" title={pos.address}>
                    {pos.address}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900" data-testid="pos-manager">
                    {pos.managerName || <span className="text-gray-400 italic">Unassigned</span>}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{pos.phone || '—'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="flex items-center gap-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${pos.isActive ? 'bg-green-400' : 'bg-gray-400'}`}
                    />
                    <span className="text-sm text-gray-700">
                      {pos.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {!pos.isActive && (
                      <span
                        data-testid="pos-inactive-badge"
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 ml-1"
                      >
                        Inactive
                      </span>
                    )}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="secondary" size="sm" onClick={() => onView(pos)} data-testid="pos-view-btn">
                      View
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => onEdit(pos)} data-testid="pos-edit-btn">
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => onDelete(pos)} data-testid="pos-delete-btn">
                      Delete
                    </Button>
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
