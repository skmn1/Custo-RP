import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PosDashboard from '../components/pos/PosDashboard';
import PosModal from '../components/pos/PosModal';
import Button from '../components/ui/Button';
import { usePos } from '../hooks/usePos';
import { POS_TYPE_LABELS, POS_TYPE_COLORS, DAYS_OF_WEEK, DAY_LABELS } from '../constants/pos';

const PosDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedPos, isLoading, error, fetchPosDetail, updatePos, deletePos } = usePos();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPosDetail(id).catch(() => {});
    }
  }, [id, fetchPosDetail]);

  const handleEdit = useCallback(() => {
    setEditModalOpen(true);
  }, []);

  const handleEditSubmit = useCallback(
    async (data) => {
      await updatePos(id, data);
      // Refetch detail to get updated dashboard
      await fetchPosDetail(id);
    },
    [id, updatePos, fetchPosDetail]
  );

  const handleDelete = useCallback(async () => {
    try {
      await deletePos(id);
      navigate('/pos');
    } catch {
      // error handled by hook
    }
    setDeleteConfirm(false);
  }, [id, deletePos, navigate]);

  // Loading state
  if (isLoading && !selectedPos) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="h-10 w-10 bg-gray-200 rounded-lg mb-3" />
              <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
              <div className="h-6 w-16 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="space-y-4">
            <div className="h-5 w-64 bg-gray-200 rounded" />
            <div className="h-5 w-48 bg-gray-200 rounded" />
            <div className="h-5 w-40 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  // Error / Not found
  if (error || (!isLoading && !selectedPos)) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div data-testid="pos-not-found" className="text-center py-16">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            PoS Location Not Found
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {error || 'The requested location could not be found.'}
          </p>
          <Button variant="primary" onClick={() => navigate('/pos')}>
            ← Back to PoS List
          </Button>
        </div>
      </div>
    );
  }

  const pos = selectedPos;
  const typeColor = POS_TYPE_COLORS[pos.type] || POS_TYPE_COLORS.MIXED;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <button
          data-testid="pos-back-link"
          onClick={() => navigate('/pos')}
          className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to PoS List
        </button>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleEdit}
            data-testid="pos-detail-edit-btn"
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setDeleteConfirm(true)}
            data-testid="pos-detail-delete-btn"
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Title row */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h1 data-testid="pos-detail-name" className="text-2xl font-bold text-gray-900">
          {pos.name}
        </h1>
        <span
          data-testid="pos-detail-type-badge"
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColor.bg} ${typeColor.text} ${typeColor.border} border`}
        >
          {POS_TYPE_LABELS[pos.type] || pos.type}
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              pos.isActive ? 'bg-green-400' : 'bg-gray-400'
            }`}
          />
          {pos.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Dashboard KPIs */}
      <PosDashboard dashboard={pos.dashboard} />

      {/* Info section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Location Information</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-lg shrink-0">📍</span>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Address</p>
              <p data-testid="pos-detail-address" className="text-sm text-gray-900">
                {pos.address}
              </p>
            </div>
          </div>
          {pos.phone && (
            <div className="flex items-start gap-3">
              <span className="text-lg shrink-0">📞</span>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</p>
                <p data-testid="pos-detail-phone" className="text-sm text-gray-900">
                  {pos.phone}
                </p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-3">
            <span className="text-lg shrink-0">👤</span>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Manager</p>
              <p data-testid="pos-detail-manager" className="text-sm text-gray-900">
                {pos.managerName || 'Unassigned'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Opening Hours */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Opening Hours</h2>
        <div data-testid="pos-detail-hours" className="divide-y divide-gray-100">
          {DAYS_OF_WEEK.map((day) => {
            const hours = pos.openingHours?.[day];
            return (
              <div
                key={day}
                data-testid={`pos-detail-hours-${day}`}
                className="flex items-center justify-between py-3"
              >
                <span className="text-sm font-medium text-gray-700 w-28">
                  {DAY_LABELS[day]}
                </span>
                {hours?.closed ? (
                  <span className="text-sm text-gray-400 italic">Closed</span>
                ) : (
                  <span className="text-sm text-gray-900">
                    {hours?.open || '—'} – {hours?.close || '—'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Modal */}
      <PosModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        initialData={pos}
        mode="edit"
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-300/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            data-testid="pos-delete-confirm-dialog"
            className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Delete PoS Location
              </h3>
              <p className="text-sm text-gray-600 text-center">
                Are you sure you want to delete{' '}
                <span className="font-semibold">{pos.name}</span>?
                This will deactivate the location.
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDeleteConfirm(false)}
                data-testid="pos-delete-cancel-btn"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                data-testid="pos-delete-confirm-btn"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PosDetailPage;
