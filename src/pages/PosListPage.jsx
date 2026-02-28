import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PosCard from '../components/pos/PosCard';
import PosModal from '../components/pos/PosModal';
import Button from '../components/ui/Button';
import { usePos } from '../hooks/usePos';
import { POS_TYPES, POS_TYPE_LABELS } from '../constants/pos';

const PosListPage = () => {
  const navigate = useNavigate();
  const {
    posList,
    isLoading,
    error,
    fetchPosList,
    createPos,
    updatePos,
    deletePos,
    clearError,
  } = usePos();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingPos, setEditingPos] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch on mount and when showInactive changes
  useEffect(() => {
    fetchPosList(showInactive);
  }, [fetchPosList, showInactive]);

  // Filtered list
  const filteredList = useMemo(() => {
    let result = posList;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q)
      );
    }
    if (typeFilter) {
      result = result.filter((p) => p.type === typeFilter);
    }
    return result;
  }, [posList, search, typeFilter]);

  // Handlers
  const handleView = useCallback(
    (pos) => navigate(`/pos/${pos.id}`),
    [navigate]
  );

  const handleEdit = useCallback((pos) => {
    setEditingPos(pos);
    setModalMode('edit');
    setModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((pos) => {
    setDeleteConfirm(pos);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteConfirm) return;
    try {
      await deletePos(deleteConfirm.id);
    } catch {
      // error is handled by the hook
    }
    setDeleteConfirm(null);
  }, [deleteConfirm, deletePos]);

  const handleCreate = useCallback(() => {
    setEditingPos(null);
    setModalMode('create');
    setModalOpen(true);
  }, []);

  const handleModalSubmit = useCallback(
    async (data) => {
      if (modalMode === 'edit' && editingPos) {
        await updatePos(editingPos.id, data);
      } else {
        await createPos(data);
      }
    },
    [modalMode, editingPos, createPos, updatePos]
  );

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setEditingPos(null);
    clearError();
  }, [clearError]);

  // Skeleton loading cards
  const SkeletonCard = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 w-20 bg-gray-200 rounded-full" />
        <div className="h-3 w-3 bg-gray-200 rounded-full" />
      </div>
      <div className="h-6 w-3/4 bg-gray-200 rounded mb-3" />
      <div className="space-y-2 mb-5">
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-2/3 bg-gray-200 rounded" />
        <div className="h-4 w-1/2 bg-gray-200 rounded" />
      </div>
      <div className="flex gap-2 pt-4 border-t border-gray-100">
        <div className="h-8 w-16 bg-gray-200 rounded" />
        <div className="h-8 w-16 bg-gray-200 rounded" />
        <div className="h-8 w-16 bg-gray-200 rounded" />
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Point of Sale Locations
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all your retail locations
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleCreate}
          data-testid="create-pos-btn"
        >
          + New PoS
        </Button>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <input
            data-testid="pos-search-input"
            type="text"
            placeholder="Search by name or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          data-testid="pos-type-filter"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Types</option>
          {POS_TYPES.map((t) => (
            <option key={t} value={t}>
              {POS_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
        <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer whitespace-nowrap">
          <input
            data-testid="pos-show-inactive-toggle"
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          Show inactive
        </label>
      </div>

      {/* Error */}
      {error && (
        <div
          data-testid="pos-list-error"
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6"
        >
          {error}
        </div>
      )}

      {/* Grid */}
      {isLoading && posList.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <SkeletonCard key={n} />
          ))}
        </div>
      ) : filteredList.length === 0 ? (
        <div
          data-testid="pos-empty-state"
          className="text-center py-16"
        >
          <div className="text-5xl mb-4">🏪</div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No PoS locations found
          </h3>
          <p className="text-sm text-gray-500">
            {search || typeFilter
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating your first Point of Sale location.'}
          </p>
          {!search && !typeFilter && (
            <Button
              variant="primary"
              className="mt-4"
              onClick={handleCreate}
            >
              + Create PoS
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredList.map((pos) => (
            <PosCard
              key={pos.id}
              pos={pos}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <PosModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        initialData={editingPos}
        mode={modalMode}
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
                <span className="font-semibold">{deleteConfirm.name}</span>?
                This will deactivate the location.
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDeleteConfirm(null)}
                data-testid="pos-delete-cancel-btn"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteConfirm}
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

export default PosListPage;
