import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  FolderIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  DocumentIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { hrApi } from '../../api/hrApi';
import { employeesApi } from '../../api/employeesApi';
import { useAuth } from '../../hooks/useAuth';

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso) {
  if (!iso) return '–';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const MIME_LABELS = {
  'application/pdf': 'PDF',
  'image/jpeg': 'JPEG',
  'image/png': 'PNG',
};

const HrDocumentsPage = () => {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const isSuperAdmin = user?.roles?.includes('ROLE_SUPER_ADMIN') || user?.roles?.includes('SUPER_ADMIN');

  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [empLoading, setEmpLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // Load employees list
  useEffect(() => {
    employeesApi
      .list()
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.content || []);
        setEmployees(list);
        if (list.length > 0) setSelectedEmpId(list[0].id);
      })
      .catch(() => setError('Failed to load employees'))
      .finally(() => setEmpLoading(false));
  }, []);

  // Load documents when employee changes
  useEffect(() => {
    if (!selectedEmpId) return;
    setLoading(true);
    setError(null);
    hrApi
      .listDocuments(selectedEmpId)
      .then((data) => setDocuments(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedEmpId]);

  const handleDownload = async (docId, filename) => {
    try {
      const { downloadUrl } = await hrApi.getDownloadUrl(docId);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert(`Download failed: ${err.message}`);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Delete this document permanently?')) return;
    setDeletingId(docId);
    try {
      await hrApi.deleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredDocs = documents.filter((d) =>
    d.originalFilename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.description || '').toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const selectedEmployee = employees.find((e) => e.id === selectedEmpId);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
          <FolderIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {t('nav.documents')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Employee document library
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Employee selector sidebar */}
        <div className="lg:w-56 flex-shrink-0">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Employees
              </p>
            </div>
            {empLoading ? (
              <div className="p-4 text-center text-sm text-gray-400">Loading…</div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[60vh] overflow-y-auto">
                {employees.map((emp) => (
                  <li key={emp.id}>
                    <button
                      onClick={() => setSelectedEmpId(emp.id)}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        selectedEmpId === emp.id
                          ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-2 border-indigo-500'
                          : ''
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 ${
                          emp.color || 'bg-gray-400'
                        }`}
                      >
                        {emp.avatar || emp.name?.slice(0, 2)}
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        {emp.name}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Document list */}
        <div className="flex-1 min-w-0">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            {/* Toolbar */}
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                  {selectedEmployee?.name || 'Select an employee'}
                </p>
                {!loading && (
                  <p className="text-xs text-gray-400">
                    {filteredDocs.length} document{filteredDocs.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search documents…"
                    className="pl-8 pr-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-44"
                  />
                </div>
                {selectedEmpId && (
                  <Link
                    to={`/app/hr/employees/${selectedEmpId}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                  >
                    Upload
                  </Link>
                )}
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-7 h-7 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <ExclamationTriangleIcon className="w-10 h-10 text-red-400 mb-2" />
                <p className="text-sm text-red-500">{error}</p>
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
                <DocumentIcon className="w-10 h-10 mb-2" />
                <p className="text-sm">No documents found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700/50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        File
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                        Type
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                        Size
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                        Uploaded
                      </th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredDocs.map((doc) => (
                      <tr
                        key={doc.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <DocumentIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
                                {doc.originalFilename}
                              </p>
                              {doc.description && (
                                <p className="text-xs text-gray-400 truncate max-w-[200px]">
                                  {doc.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            {MIME_LABELS[doc.mimeType] || doc.mimeType}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-gray-500 dark:text-gray-400">
                          {formatBytes(doc.fileSizeBytes)}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell text-gray-500 dark:text-gray-400">
                          {formatDate(doc.uploadedAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleDownload(doc.id, doc.originalFilename)}
                              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                              title="Download"
                            >
                              <ArrowDownTrayIcon className="w-4 h-4" />
                            </button>
                            {isSuperAdmin && (
                              <button
                                onClick={() => handleDelete(doc.id)}
                                disabled={deletingId === doc.id}
                                className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                                title="Delete"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HrDocumentsPage;
