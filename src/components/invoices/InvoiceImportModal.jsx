import React, { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function InvoiceImportModal({ isOpen, onClose, onImportComplete, importPdf }) {
  const { t } = useTranslation(['invoices', 'common']);
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [useFallback, setUseFallback] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const validateFile = useCallback((f) => {
    if (!f) return null;
    if (f.type !== 'application/pdf') {
      return t('invoices:import.errorFormat');
    }
    if (f.size > MAX_FILE_SIZE) {
      return t('invoices:import.errorSize');
    }
    return null;
  }, [t]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files?.[0];
    const err = validateFile(droppedFile);
    if (err) {
      setError(err);
      return;
    }
    setFile(droppedFile);
    setError(null);
  }, [validateFile]);

  const handleFileSelect = useCallback((e) => {
    const selectedFile = e.target.files?.[0];
    const err = validateFile(selectedFile);
    if (err) {
      setError(err);
      return;
    }
    setFile(selectedFile);
    setError(null);
  }, [validateFile]);

  const handlePdfjsFallback = useCallback(async (pdfFile) => {
    setProgress(20);
    try {
      const pdfJS = await import('pdfjs-dist');
      pdfJS.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url
      ).toString();
      setProgress(40);

      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfJS.getDocument({ data: arrayBuffer }).promise;
      setProgress(55);

      // Extract text from all pages with positional data
      const allItems = [];
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        // Offset y-coordinates by page so items don't overlap across pages
        const pageOffset = (pageNum - 1) * 10000;
        content.items.forEach((item) => {
          if (item.str) {
            allItems.push({
              ...item,
              transform: [
                item.transform[0], item.transform[1], item.transform[2],
                item.transform[3], item.transform[4],
                item.transform[5] + pageOffset,
              ],
            });
          }
        });
        setProgress(55 + Math.round((pageNum / pdf.numPages) * 35));
      }

      const { mapTextItemsToInvoice } = await import('../../utils/fieldMapper');
      const result = mapTextItemsToInvoice(allItems);
      setProgress(100);
      return result;
    } catch (err) {
      throw new Error(t('invoices:import.errorOcr') + ': ' + err.message);
    }
  }, [t]);

  const handleSubmit = useCallback(async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setProgress(10);

    try {
      let result;
      if (useFallback) {
        result = await handlePdfjsFallback(file);
      } else {
        try {
          result = await importPdf(file);
          setProgress(100);
        } catch (serverErr) {
          // Fallback to pdf.js text extraction on server error
          setError(null);
          result = await handlePdfjsFallback(file);
        }
      }
      onImportComplete(result, file);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  }, [file, useFallback, importPdf, handlePdfjsFallback, onImportComplete]);

  const handleClose = useCallback(() => {
    setFile(null);
    setError(null);
    setProgress(0);
    setIsProcessing(false);
    setUseFallback(false);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" data-testid="invoice-import-modal">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-40 transition-opacity" onClick={handleClose} />
        <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6 z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{t('invoices:import.title')}</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={t('common:action.close', 'Fermer')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Drop zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            data-testid="pdf-drop-zone"
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              dragActive
                ? 'border-indigo-500 bg-indigo-50'
                : file
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileSelect}
              className="hidden"
              data-testid="pdf-file-input"
            />
            {file ? (
              <div>
                <svg className="w-10 h-10 mx-auto text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div>
                <svg className="w-10 h-10 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm text-gray-600">{t('invoices:import.dropzone')}</p>
                <p className="text-xs text-gray-400 mt-1">{t('invoices:import.maxSize')}</p>
              </div>
            )}
          </div>

          {/* Fallback toggle */}
          <label className="flex items-center gap-2 mt-4 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={useFallback}
              onChange={(e) => setUseFallback(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            {t('invoices:import.useFallback')}
          </label>

          {/* Progress bar */}
          {isProcessing && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>{t('invoices:import.processing')}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700" data-testid="import-error">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={handleClose} disabled={isProcessing}>
              {t('common:action.cancel', 'Annuler')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!file || isProcessing}
              data-testid="import-submit-btn"
            >
              {isProcessing ? t('invoices:import.processing') : t('invoices:import.submit')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
