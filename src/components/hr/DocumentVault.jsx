import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  ShieldCheckIcon,
  DocumentIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { hrApi } from '../../api/hrApi';

const DOCUMENT_TYPES = [
  'national_id', 'passport', 'work_permit', 'contract_signed',
  'rib', 'social_security', 'other',
];

const REQUIRED_TYPES = new Set([
  'national_id', 'passport', 'contract_signed', 'rib', 'social_security',
]);

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso) {
  if (!iso) return '–';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function DocumentVault({ candidateId, documents, onUpload, onVerify, onDelete }) {
  const { t } = useTranslation('hr');
  const [uploadType, setUploadType] = useState('national_id');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(t('candidates.documents.errors.size'));
      return;
    }
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowed.includes(file.type)) {
      setError(t('candidates.documents.errors.type'));
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', uploadType);
      await onUpload(formData);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDownload = async (docId, filename) => {
    try {
      const { url } = await hrApi.getCandidateDocumentUrl(candidateId, docId);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert(`Download failed: ${err.message}`);
    }
  };

  // Group documents by type
  const docsByType = {};
  for (const doc of documents || []) {
    if (!docsByType[doc.documentType]) docsByType[doc.documentType] = [];
    docsByType[doc.documentType].push(doc);
  }

  return (
    <div className="space-y-4">
      {/* Upload bar */}
      <div className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
        <select
          value={uploadType}
          onChange={(e) => setUploadType(e.target.value)}
          className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
        >
          {DOCUMENT_TYPES.map((dt) => (
            <option key={dt} value={dt}>
              {t(`candidates.documents.types.${dt}`, dt)}
            </option>
          ))}
        </select>

        <label className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg cursor-pointer transition-colors ${
          uploading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}>
          <ArrowUpTrayIcon className="w-4 h-4" />
          {uploading ? 'Uploading…' : t('candidates.documents.upload')}
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>

        {error && (
          <div className="flex items-center gap-1 text-xs text-red-500">
            <ExclamationTriangleIcon className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>

      {/* Document type slots */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {DOCUMENT_TYPES.map((dt) => {
          const typeDocs = docsByType[dt] || [];
          const isRequired = REQUIRED_TYPES.has(dt);

          return (
            <div
              key={dt}
              className={`rounded-lg border p-3 ${
                isRequired
                  ? 'border-orange-200 dark:border-orange-700/50 bg-orange-50/30 dark:bg-orange-900/10'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <DocumentIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t(`candidates.documents.types.${dt}`, dt)}
                </span>
                {isRequired && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold">
                    required
                  </span>
                )}
              </div>

              {typeDocs.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No document uploaded</p>
              ) : (
                <div className="space-y-2">
                  {typeDocs.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-2 text-xs">
                      <span className="truncate flex-1 text-gray-600 dark:text-gray-400">
                        {doc.originalFilename}
                      </span>
                      <span className="text-gray-400">{formatBytes(doc.fileSizeBytes)}</span>

                      {doc.verifiedAt ? (
                        <span className="flex items-center gap-0.5 text-green-600 dark:text-green-400">
                          <ShieldCheckIcon className="w-3.5 h-3.5" />
                          {t('candidates.documents.verified')}
                        </span>
                      ) : (
                        <button
                          onClick={() => onVerify(doc.id)}
                          className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800/40 font-medium"
                        >
                          {t('candidates.documents.verify')}
                        </button>
                      )}

                      <button
                        onClick={() => handleDownload(doc.id, doc.originalFilename)}
                        className="p-1 rounded text-gray-400 hover:text-indigo-500"
                        title="Download"
                      >
                        <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(doc.id)}
                        className="p-1 rounded text-gray-400 hover:text-red-500"
                        title="Delete"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
