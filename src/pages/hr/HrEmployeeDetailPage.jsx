import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  UserCircleIcon,
  FolderIcon,
  DocumentIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { employeesApi } from '../../api/employeesApi';
import { hrApi } from '../../api/hrApi';
import { useAuth } from '../../hooks/useAuth';

/* ─── helpers ─── */

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

const ACCEPTED_TYPES = '.pdf,.jpg,.jpeg,.png';

/* ─── DocumentsTab ─── */

function DocumentsTab({ employeeId, isSuperAdmin }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [description, setDescription] = useState('');
  const fileInputRef = useRef(null);

  const loadDocs = () => {
    setLoading(true);
    hrApi
      .listDocuments(employeeId)
      .then((data) => setDocuments(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(loadDocs, [employeeId]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side size guard (10 MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File must be smaller than 10 MB.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    if (description.trim()) formData.append('description', description.trim());

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      await hrApi.uploadDocument(employeeId, formData);
      setUploadSuccess(true);
      setDescription('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      loadDocs();
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Upload form */}
      <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-5">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <ArrowUpTrayIcon className="w-4 h-4" />
          Upload Document
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <label className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer transition-colors disabled:opacity-50">
            {uploading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <ArrowUpTrayIcon className="w-4 h-4" />
                Choose file
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES}
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Accepted: PDF, JPEG, PNG · Max 10 MB
        </p>

        {uploadSuccess && (
          <div className="mt-3 flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
            <CheckCircleIcon className="w-4 h-4" />
            Document uploaded successfully.
          </div>
        )}
        {uploadError && (
          <div className="mt-3 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
            <XCircleIcon className="w-4 h-4" />
            {uploadError}
          </div>
        )}
      </div>

      {/* Document list */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-7 h-7 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <ExclamationTriangleIcon className="w-8 h-8 text-red-400 mb-2" />
          <p className="text-sm text-red-500">{error}</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400">
          <FolderIcon className="w-10 h-10 mb-2" />
          <p className="text-sm">No documents yet. Upload the first one above.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
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
              {documents.map((doc) => (
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
  );
}

/* ─── HrEmployeeDetailPage ─── */

const TABS = [
  { id: 'overview', label: 'Overview', icon: UserCircleIcon },
  { id: 'documents', label: 'Documents', icon: FolderIcon },
];

const HrEmployeeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSuperAdmin =
    user?.roles?.includes('ROLE_SUPER_ADMIN') || user?.roles?.includes('SUPER_ADMIN');

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    employeesApi
      .getById(id)
      .then(setEmployee)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mb-3" />
        <p className="text-red-500 mb-4">{error || 'Employee not found'}</p>
        <Link
          to="/app/hr/employees"
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Back to employees
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back
      </button>

      {/* Employee header */}
      <div className="flex items-start gap-4 mb-6">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0 ${
            employee.color || 'bg-indigo-500'
          }`}
        >
          {employee.avatar || employee.name?.slice(0, 2)}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{employee.name}</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {employee.jobTitle || employee.role}
          </p>
          <div className="flex items-center gap-3 mt-1">
            {employee.department && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                {employee.department}
              </span>
            )}
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                employee.status === 'active'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              {employee.status}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Contact Information
            </h3>
            <dl className="space-y-3 text-sm">
              <div className="flex gap-2">
                <dt className="w-28 text-gray-400 flex-shrink-0">Email</dt>
                <dd className="text-gray-900 dark:text-gray-100 truncate">{employee.email || '–'}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-28 text-gray-400 flex-shrink-0">Phone</dt>
                <dd className="text-gray-900 dark:text-gray-100">{employee.phone || '–'}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Employment Details
            </h3>
            <dl className="space-y-3 text-sm">
              <div className="flex gap-2">
                <dt className="w-28 text-gray-400 flex-shrink-0">Hire date</dt>
                <dd className="text-gray-900 dark:text-gray-100">{formatDate(employee.hireDate)}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-28 text-gray-400 flex-shrink-0">Max hours</dt>
                <dd className="text-gray-900 dark:text-gray-100">{employee.maxHours ?? '–'} h/week</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-28 text-gray-400 flex-shrink-0">Hourly rate</dt>
                <dd className="text-gray-900 dark:text-gray-100">
                  {employee.hourlyRate != null ? `$${employee.hourlyRate}` : '–'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <DocumentsTab employeeId={id} isSuperAdmin={isSuperAdmin} />
      )}
    </div>
  );
};

export default HrEmployeeDetailPage;
