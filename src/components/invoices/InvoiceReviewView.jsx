import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { useInvoices } from '../../hooks/useInvoices';
import { useStock } from '../../hooks/useStock';
import { clearPdfFile } from '../../utils/pdfFileStore';
import Button from '../ui/Button';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const TVA_RATES = [
  { value: '20.00', label: '20 %' },
  { value: '10.00', label: '10 %' },
  { value: '5.50', label: '5,5 %' },
  { value: '2.10', label: '2,1 %' },
];

const emptyLine = () => ({
  description: '',
  qty: '',
  unitPrice: '',
  discountPct: '0',
  taxRate: '20.00',
});

const formatAmount = (amount) => {
  if (amount == null || isNaN(amount)) return '0,00 €';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
};

export default function InvoiceReviewView({ ocrResult, pdfFile, onCancel }) {
  const { t } = useTranslation(['invoices', 'common']);
  const navigate = useNavigate();
  const { createInvoice, isLoading } = useInvoices();
  const { items: stockItems, fetchItems } = useStock();
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [validationErrors, setValidationErrors] = useState({});

  const confidence = useMemo(() => ocrResult?.confidence || {}, [ocrResult]);
  const draft = ocrResult?.draft || {};
  const threshold = 0.7;

  React.useEffect(() => {
    fetchItems();
  }, []);

  const [form, setForm] = useState({
    counterpartyName: draft.counterpartyName || '',
    counterpartyEmail: draft.counterpartyEmail || '',
    counterpartyAddress: draft.counterpartyAddress || '',
    supplierSiret: draft.supplierSiret || '',
    supplierVatNumber: draft.supplierVatNumber || '',
    buyerVatNumber: draft.buyerVatNumber || '',
    deliveryDate: draft.deliveryDate || '',
    issueDate: draft.issueDate || new Date().toISOString().slice(0, 10),
    dueDate: draft.dueDate || '',
    currency: draft.currency || 'EUR',
    taxRate: draft.taxRate?.toString() || '20.00',
    paymentTerms: draft.paymentTerms || '',
    earlyPaymentDiscount: draft.earlyPaymentDiscount?.toString() || '0',
    latePaymentRate: draft.latePaymentRate?.toString() || '12.37',
    notes: draft.notes || '',
    poId: '',
  });

  const [lines, setLines] = useState(() => {
    if (draft.lines && draft.lines.length > 0) {
      return draft.lines.map((l) => ({
        stockItemId: '',
        description: l.description || '',
        qty: l.qty?.toString() || '',
        unitPrice: l.unitPrice?.toString() || '',
        discountPct: l.discountPct?.toString() || '0',
        taxRate: l.taxRate?.toString() || '20.00',
      }));
    }
    return [emptyLine()];
  });

  const pdfUrl = useMemo(() => {
    if (pdfFile) return URL.createObjectURL(pdfFile);
    return null;
  }, [pdfFile]);

  // Cleanup blob URL and file store on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      clearPdfFile();
    };
  }, [pdfUrl]);

  // Sync form with draft when ocrResult changes (handles delayed state)
  useEffect(() => {
    if (!draft || Object.keys(draft).length === 0) return;
    setForm({
      counterpartyName: draft.counterpartyName || '',
      counterpartyEmail: draft.counterpartyEmail || '',
      counterpartyAddress: draft.counterpartyAddress || '',
      supplierSiret: draft.supplierSiret || '',
      supplierVatNumber: draft.supplierVatNumber || '',
      buyerVatNumber: draft.buyerVatNumber || '',
      deliveryDate: draft.deliveryDate || '',
      issueDate: draft.issueDate || new Date().toISOString().slice(0, 10),
      dueDate: draft.dueDate || '',
      currency: draft.currency || 'EUR',
      taxRate: draft.taxRate?.toString() || '20.00',
      paymentTerms: draft.paymentTerms || '',
      earlyPaymentDiscount: draft.earlyPaymentDiscount?.toString() || '0',
      latePaymentRate: draft.latePaymentRate?.toString() || '12.37',
      notes: draft.notes || '',
      poId: '',
    });
    if (draft.lines && draft.lines.length > 0) {
      setLines(draft.lines.map((l) => ({
        stockItemId: '',
        description: l.description || '',
        qty: l.qty?.toString() || '',
        unitPrice: l.unitPrice?.toString() || '',
        discountPct: l.discountPct?.toString() || '0',
        taxRate: l.taxRate?.toString() || '20.00',
      })));
    }
  }, [draft]);

  const isLowConfidence = (field) => {
    return confidence[field] !== undefined && confidence[field] < threshold;
  };

  const fieldClass = (field) => {
    const base = 'block w-full rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500';
    if (isLowConfidence(field)) {
      return `${base} border-2 border-orange-400 bg-orange-50`;
    }
    if (validationErrors[field]) {
      return `${base} border border-red-300`;
    }
    return `${base} border border-gray-300`;
  };

  const handleFieldChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (validationErrors[key]) {
      setValidationErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const handleLineChange = (index, key, value) => {
    setLines((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      if (key === 'stockItemId' && value) {
        const item = stockItems.find((si) => si.id === value);
        if (item) {
          updated[index].description = item.nameFr || item.nameEn || '';
        }
      }
      return updated;
    });
  };

  const addLine = () => setLines((prev) => [...prev, emptyLine()]);
  const removeLine = (index) => setLines((prev) => prev.filter((_, i) => i !== index));

  const computeLineTotal = (line) => {
    const qty = parseFloat(line.qty) || 0;
    const price = parseFloat(line.unitPrice) || 0;
    const disc = parseFloat(line.discountPct) || 0;
    return qty * price * (1 - disc / 100);
  };

  const computeLineTax = (line) => {
    const total = computeLineTotal(line);
    const rate = parseFloat(line.taxRate) || 0;
    return (total * rate) / 100;
  };

  const subtotal = lines.reduce((sum, l) => sum + computeLineTotal(l), 0);
  const totalTax = lines.reduce((sum, l) => sum + computeLineTax(l), 0);
  const totalTTC = subtotal + totalTax;

  const validate = () => {
    const errors = {};
    if (!form.counterpartyName.trim()) errors.counterpartyName = t('invoices:validation.supplierRequired');
    if (!form.issueDate) errors.issueDate = t('invoices:validation.issueDateRequired');
    if (!form.dueDate) errors.dueDate = t('invoices:validation.dueDateRequired');
    if (form.supplierSiret && !/^\d{14}$/.test(form.supplierSiret)) {
      errors.supplierSiret = t('invoices:validation.siretFormat');
    }
    if (form.supplierVatNumber && !/^FR\d{2}\d{9}$/.test(form.supplierVatNumber)) {
      errors.supplierVatNumber = t('invoices:validation.vatFormat');
    }
    const validLines = lines.filter((l) => l.description || l.qty || l.unitPrice);
    if (validLines.length === 0) errors.lines = t('invoices:validation.atLeastOneLine');
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const payload = {
      ...form,
      taxRate: parseFloat(form.taxRate) || 20,
      earlyPaymentDiscount: parseFloat(form.earlyPaymentDiscount) || 0,
      latePaymentRate: parseFloat(form.latePaymentRate) || 12.37,
      lines: lines
        .filter((l) => l.description || l.qty || l.unitPrice)
        .map((l) => ({
          stockItemId: l.stockItemId || null,
          description: l.description,
          qty: parseFloat(l.qty) || 0,
          unitPrice: parseFloat(l.unitPrice) || 0,
          discountPct: parseFloat(l.discountPct) || 0,
          taxRate: parseFloat(l.taxRate) || 20,
        })),
    };

    try {
      const result = await createInvoice(payload);
      navigate(`/invoices/${result.id}`);
    } catch {
      // error handled by hook
    }
  };

  return (
    <div data-testid="invoice-review-view" className="max-w-full mx-auto">
      {/* Header with OCR provider info */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-gray-900">{t('invoices:import.reviewTitle')}</h1>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
            OCR: {ocrResult?.ocrProvider || 'unknown'}
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onCancel}>
            {t('invoices:action.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} data-testid="review-submit-btn">
            {isLoading ? t('invoices:action.save') + '…' : t('invoices:import.confirmImport')}
          </Button>
        </div>
      </div>

      {/* Confidence legend */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded border-2 border-orange-400 bg-orange-50 inline-block" />
          {t('invoices:import.lowConfidence')}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded border border-gray-300 bg-white inline-block" />
          {t('invoices:import.highConfidence')}
        </span>
      </div>

      {/* Split pane */}
      <div className="flex flex-col lg:flex-row" style={{ height: 'calc(100vh - 180px)' }}>
        {/* Left: PDF Viewer */}
        <div className="lg:w-1/2 w-full overflow-auto bg-gray-100 border-r border-gray-200 p-4" data-testid="pdf-viewer-pane">
          {pdfUrl ? (
            <>
              <div className="flex items-center justify-center gap-2 mb-3">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="px-2 py-1 rounded bg-white border text-sm disabled:opacity-40"
                >
                  ←
                </button>
                <span className="text-sm text-gray-600">
                  {currentPage} / {numPages || '?'}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(numPages || 1, p + 1))}
                  disabled={currentPage >= (numPages || 1)}
                  className="px-2 py-1 rounded bg-white border text-sm disabled:opacity-40"
                >
                  →
                </button>
              </div>
              <Document
                file={pdfUrl}
                onLoadSuccess={({ numPages: n }) => setNumPages(n)}
                className="flex justify-center"
              >
                <Page pageNumber={currentPage} width={500} />
              </Document>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              {t('invoices:import.noPdf')}
            </div>
          )}
        </div>

        {/* Right: Form */}
        <div className="lg:w-1/2 w-full overflow-auto p-4 bg-white" data-testid="review-form-pane">
          {/* Supplier info */}
          <fieldset className="mb-6">
            <legend className="text-sm font-semibold text-gray-700 mb-3">{t('invoices:field.supplier')}</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t('invoices:field.supplier')}</label>
                <input
                  type="text"
                  value={form.counterpartyName}
                  onChange={(e) => handleFieldChange('counterpartyName', e.target.value)}
                  className={fieldClass('counterpartyName')}
                />
                {validationErrors.counterpartyName && <p className="text-xs text-red-500 mt-1">{validationErrors.counterpartyName}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t('invoices:field.supplierEmail')}</label>
                <input
                  type="email"
                  value={form.counterpartyEmail}
                  onChange={(e) => handleFieldChange('counterpartyEmail', e.target.value)}
                  className={fieldClass('counterpartyEmail')}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">{t('invoices:field.supplierAddress')}</label>
                <input
                  type="text"
                  value={form.counterpartyAddress}
                  onChange={(e) => handleFieldChange('counterpartyAddress', e.target.value)}
                  className={fieldClass('counterpartyAddress')}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t('invoices:field.supplierSiret')}</label>
                <input
                  type="text"
                  value={form.supplierSiret}
                  onChange={(e) => handleFieldChange('supplierSiret', e.target.value)}
                  className={fieldClass('supplierSiret')}
                  maxLength={14}
                />
                {validationErrors.supplierSiret && <p className="text-xs text-red-500 mt-1">{validationErrors.supplierSiret}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t('invoices:field.supplierVat')}</label>
                <input
                  type="text"
                  value={form.supplierVatNumber}
                  onChange={(e) => handleFieldChange('supplierVatNumber', e.target.value)}
                  className={fieldClass('supplierVatNumber')}
                />
                {validationErrors.supplierVatNumber && <p className="text-xs text-red-500 mt-1">{validationErrors.supplierVatNumber}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t('invoices:field.buyerVat')}</label>
                <input
                  type="text"
                  value={form.buyerVatNumber}
                  onChange={(e) => handleFieldChange('buyerVatNumber', e.target.value)}
                  className={fieldClass('buyerVatNumber')}
                />
              </div>
            </div>
          </fieldset>

          {/* Dates and terms */}
          <fieldset className="mb-6">
            <legend className="text-sm font-semibold text-gray-700 mb-3">{t('invoices:field.issueDate')}</legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t('invoices:field.issueDate')}</label>
                <input
                  type="date"
                  value={form.issueDate}
                  onChange={(e) => handleFieldChange('issueDate', e.target.value)}
                  className={fieldClass('issueDate')}
                />
                {validationErrors.issueDate && <p className="text-xs text-red-500 mt-1">{validationErrors.issueDate}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t('invoices:field.deliveryDate')}</label>
                <input
                  type="date"
                  value={form.deliveryDate}
                  onChange={(e) => handleFieldChange('deliveryDate', e.target.value)}
                  className={fieldClass('deliveryDate')}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t('invoices:field.dueDate')}</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => handleFieldChange('dueDate', e.target.value)}
                  className={fieldClass('dueDate')}
                />
                {validationErrors.dueDate && <p className="text-xs text-red-500 mt-1">{validationErrors.dueDate}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t('invoices:field.taxRate')}</label>
                <select
                  value={form.taxRate}
                  onChange={(e) => handleFieldChange('taxRate', e.target.value)}
                  className={fieldClass('taxRate')}
                >
                  {TVA_RATES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t('invoices:field.paymentTerms')}</label>
                <input
                  type="text"
                  value={form.paymentTerms}
                  onChange={(e) => handleFieldChange('paymentTerms', e.target.value)}
                  className={fieldClass('paymentTerms')}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t('invoices:field.currency')}</label>
                <input
                  type="text"
                  value={form.currency}
                  onChange={(e) => handleFieldChange('currency', e.target.value)}
                  className={fieldClass('currency')}
                />
              </div>
            </div>
          </fieldset>

          {/* Lines */}
          <fieldset className="mb-6">
            <legend className="text-sm font-semibold text-gray-700 mb-3">{t('invoices:line.description')}</legend>
            {validationErrors.lines && <p className="text-xs text-red-500 mb-2">{validationErrors.lines}</p>}
            <div className="space-y-3">
              {lines.map((line, idx) => (
                <div key={idx} className={`p-3 rounded-lg border ${isLowConfidence('lines') ? 'border-orange-400 bg-orange-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-5">
                      <input
                        type="text"
                        placeholder={t('invoices:line.description')}
                        value={line.description}
                        onChange={(e) => handleLineChange(idx, 'description', e.target.value)}
                        className="block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        placeholder={t('invoices:line.qty')}
                        value={line.qty}
                        onChange={(e) => handleLineChange(idx, 'qty', e.target.value)}
                        className="block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        placeholder={t('invoices:line.unitPrice')}
                        value={line.unitPrice}
                        onChange={(e) => handleLineChange(idx, 'unitPrice', e.target.value)}
                        className="block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-2 text-right text-sm font-medium text-gray-700 py-1.5">
                      {formatAmount(computeLineTotal(line))}
                    </div>
                    <div className="col-span-1 flex justify-end">
                      {lines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLine(idx)}
                          className="text-red-400 hover:text-red-600 p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addLine}
              className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              + {t('invoices:line.addLine')}
            </button>
          </fieldset>

          {/* Totals */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>{t('invoices:field.subtotal')}</span>
              <span>{formatAmount(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>{t('invoices:field.taxAmount')}</span>
              <span>{formatAmount(totalTax)}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold text-gray-900 pt-2 border-t">
              <span>{t('invoices:field.total')}</span>
              <span>{formatAmount(totalTTC)}</span>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('invoices:field.notes')}</label>
            <textarea
              value={form.notes}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
