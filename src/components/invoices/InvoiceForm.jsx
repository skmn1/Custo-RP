import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useInvoices } from '../../hooks/useInvoices';
import { useStock } from '../../hooks/useStock';
import Button from '../ui/Button';

const TVA_RATES = [
  { value: '20.00', label: '20 %' },
  { value: '10.00', label: '10 %' },
  { value: '5.50', label: '5,5 %' },
  { value: '2.10', label: '2,1 %' },
];

const emptyLine = () => ({
  stockItemId: '',
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

export default function InvoiceForm() {
  const { t } = useTranslation(['invoices', 'common']);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { fetchInvoice, createInvoice, updateInvoice, isLoading, error } = useInvoices();
  const { items: stockItems, fetchItems, purchaseOrders, fetchPurchaseOrders } = useStock();

  const [form, setForm] = useState({
    counterpartyName: '',
    counterpartyEmail: '',
    counterpartyAddress: '',
    supplierSiret: '',
    supplierVatNumber: '',
    buyerVatNumber: '',
    deliveryDate: '',
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: '',
    currency: 'EUR',
    taxRate: '20.00',
    paymentTerms: '',
    earlyPaymentDiscount: '0',
    latePaymentRate: '12.37',
    notes: '',
    poId: '',
  });

  const [lines, setLines] = useState([emptyLine()]);
  const [validationErrors, setValidationErrors] = useState({});
  const [itemSearch, setItemSearch] = useState('');
  const [poWarning, setPoWarning] = useState(false);

  useEffect(() => {
    fetchItems();
    fetchPurchaseOrders();
  }, []);

  useEffect(() => {
    if (isEdit) {
      fetchInvoice(id).then((inv) => {
        if (inv) {
          setForm({
            counterpartyName: inv.counterpartyName || '',
            counterpartyEmail: inv.counterpartyEmail || '',
            counterpartyAddress: inv.counterpartyAddress || '',
            supplierSiret: inv.supplierSiret || '',
            supplierVatNumber: inv.supplierVatNumber || '',
            buyerVatNumber: inv.buyerVatNumber || '',
            deliveryDate: inv.deliveryDate || '',
            issueDate: inv.issueDate || '',
            dueDate: inv.dueDate || '',
            currency: inv.currency || 'EUR',
            taxRate: inv.taxRate?.toString() || '20.00',
            paymentTerms: inv.paymentTerms || '',
            earlyPaymentDiscount: inv.earlyPaymentDiscount?.toString() || '0',
            latePaymentRate: inv.latePaymentRate?.toString() || '12.37',
            notes: inv.notes || '',
            poId: inv.poId || '',
          });
          if (inv.lines && inv.lines.length > 0) {
            setLines(inv.lines.map((l) => ({
              stockItemId: l.stockItemId || '',
              description: l.description || '',
              qty: l.qty?.toString() || '',
              unitPrice: l.unitPrice?.toString() || '',
              discountPct: l.discountPct?.toString() || '0',
              taxRate: l.taxRate?.toString() || '20.00',
            })));
          }
        }
      });
    }
  }, [id]);

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
      // Auto-fill description from stock item
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
    return total * rate / 100;
  };

  const subtotal = lines.reduce((sum, l) => sum + computeLineTotal(l), 0);
  const totalTax = lines.reduce((sum, l) => sum + computeLineTax(l), 0);
  const totalTTC = subtotal + totalTax;

  // PO comparison warning
  useEffect(() => {
    if (form.poId && purchaseOrders?.length > 0) {
      const po = purchaseOrders.find((p) => p.id === form.poId);
      if (po?.lines) {
        const hasQtyDiff = lines.some((line) => {
          if (!line.stockItemId) return false;
          const poLine = po.lines.find((pl) => pl.itemId === line.stockItemId);
          if (!poLine) return false;
          return parseFloat(line.qty) !== parseFloat(poLine.qtyOrdered);
        });
        setPoWarning(hasQtyDiff);
      }
    } else {
      setPoWarning(false);
    }
  }, [form.poId, lines, purchaseOrders]);

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

    if (lines.length === 0 || lines.every((l) => !l.description && !l.qty)) {
      errors.lines = t('invoices:validation.atLeastOneLine');
    }

    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].description?.trim() && !lines[i].stockItemId) {
        errors[`line_${i}_description`] = t('invoices:validation.descriptionRequired');
      }
      if (!lines[i].qty || parseFloat(lines[i].qty) <= 0) {
        errors[`line_${i}_qty`] = t('invoices:validation.qtyRequired');
      }
      if (!lines[i].unitPrice || parseFloat(lines[i].unitPrice) < 0) {
        errors[`line_${i}_unitPrice`] = t('invoices:validation.unitPriceRequired');
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...form,
      taxRate: parseFloat(form.taxRate),
      earlyPaymentDiscount: parseFloat(form.earlyPaymentDiscount) || 0,
      latePaymentRate: parseFloat(form.latePaymentRate) || 12.37,
      poId: form.poId || null,
      deliveryDate: form.deliveryDate || null,
      lines: lines.map((l) => ({
        stockItemId: l.stockItemId || null,
        description: l.description,
        qty: parseFloat(l.qty),
        unitPrice: parseFloat(l.unitPrice),
        discountPct: parseFloat(l.discountPct) || 0,
        taxRate: parseFloat(l.taxRate),
      })),
    };

    try {
      if (isEdit) {
        await updateInvoice(id, payload);
      } else {
        await createInvoice(payload);
      }
      navigate('/invoices');
    } catch {
      // error is already set in the hook
    }
  };

  const filteredItems = stockItems?.filter((item) => {
    if (!itemSearch) return true;
    const s = itemSearch.toLowerCase();
    return (
      item.nameEn?.toLowerCase().includes(s) ||
      item.nameFr?.toLowerCase().includes(s) ||
      item.sku?.toLowerCase().includes(s)
    );
  }) || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? t('invoices:action.edit') : t('invoices:action.new')}
        </h1>
        <Button variant="ghost" onClick={() => navigate('/invoices')}>
          {t('invoices:action.back')}
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {poWarning && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
          ⚠ {t('invoices:poWarning')}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Supplier Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('invoices:field.supplier')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('invoices:field.supplier')} *</label>
              <input
                type="text"
                value={form.counterpartyName}
                onChange={(e) => handleFieldChange('counterpartyName', e.target.value)}
                className={`mt-1 block w-full rounded-md border ${validationErrors.counterpartyName ? 'border-red-300' : 'border-gray-300'} px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500`}
              />
              {validationErrors.counterpartyName && <p className="mt-1 text-xs text-red-600">{validationErrors.counterpartyName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('invoices:field.supplierEmail')}</label>
              <input
                type="email"
                value={form.counterpartyEmail}
                onChange={(e) => handleFieldChange('counterpartyEmail', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">{t('invoices:field.supplierAddress')}</label>
              <textarea
                value={form.counterpartyAddress}
                onChange={(e) => handleFieldChange('counterpartyAddress', e.target.value)}
                rows={2}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('invoices:field.supplierSiret')}</label>
              <input
                type="text"
                maxLength={14}
                value={form.supplierSiret}
                onChange={(e) => handleFieldChange('supplierSiret', e.target.value.replace(/\D/g, ''))}
                className={`mt-1 block w-full rounded-md border ${validationErrors.supplierSiret ? 'border-red-300' : 'border-gray-300'} px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500`}
                placeholder="12345678901234"
              />
              {validationErrors.supplierSiret && <p className="mt-1 text-xs text-red-600">{validationErrors.supplierSiret}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('invoices:field.supplierVat')}</label>
              <input
                type="text"
                maxLength={20}
                value={form.supplierVatNumber}
                onChange={(e) => handleFieldChange('supplierVatNumber', e.target.value)}
                className={`mt-1 block w-full rounded-md border ${validationErrors.supplierVatNumber ? 'border-red-300' : 'border-gray-300'} px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500`}
                placeholder="FR12345678901"
              />
              {validationErrors.supplierVatNumber && <p className="mt-1 text-xs text-red-600">{validationErrors.supplierVatNumber}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('invoices:field.buyerVat')}</label>
              <input
                type="text"
                maxLength={20}
                value={form.buyerVatNumber}
                onChange={(e) => handleFieldChange('buyerVatNumber', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Dates & Terms */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('invoices:field.paymentTerms')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('invoices:field.issueDate')} *</label>
              <input
                type="date"
                value={form.issueDate}
                onChange={(e) => handleFieldChange('issueDate', e.target.value)}
                className={`mt-1 block w-full rounded-md border ${validationErrors.issueDate ? 'border-red-300' : 'border-gray-300'} px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500`}
              />
              {validationErrors.issueDate && <p className="mt-1 text-xs text-red-600">{validationErrors.issueDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('invoices:field.deliveryDate')}</label>
              <input
                type="date"
                value={form.deliveryDate}
                onChange={(e) => handleFieldChange('deliveryDate', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('invoices:field.dueDate')} *</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => handleFieldChange('dueDate', e.target.value)}
                className={`mt-1 block w-full rounded-md border ${validationErrors.dueDate ? 'border-red-300' : 'border-gray-300'} px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500`}
              />
              {validationErrors.dueDate && <p className="mt-1 text-xs text-red-600">{validationErrors.dueDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('invoices:field.taxRate')}</label>
              <select
                value={form.taxRate}
                onChange={(e) => handleFieldChange('taxRate', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                {TVA_RATES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('invoices:field.earlyPaymentDiscount')}</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={form.earlyPaymentDiscount}
                onChange={(e) => handleFieldChange('earlyPaymentDiscount', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('invoices:field.latePaymentRate')}</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.latePaymentRate}
                onChange={(e) => handleFieldChange('latePaymentRate', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700">{t('invoices:field.paymentTerms')}</label>
              <textarea
                value={form.paymentTerms}
                onChange={(e) => handleFieldChange('paymentTerms', e.target.value)}
                rows={2}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('invoices:field.po')}</label>
              <select
                value={form.poId}
                onChange={(e) => handleFieldChange('poId', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">—</option>
                {purchaseOrders?.map((po) => (
                  <option key={po.id} value={po.id}>{po.poNumber}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('invoices:field.currency')}</label>
              <input
                type="text"
                value={form.currency}
                readOnly
                className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Lines */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{t('invoices:line.item')}</h2>
            <Button type="button" variant="secondary" size="sm" onClick={addLine}>
              {t('invoices:line.addLine')}
            </Button>
          </div>
          {validationErrors.lines && <p className="mb-2 text-xs text-red-600">{validationErrors.lines}</p>}

          <div className="space-y-4">
            {lines.map((line, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600">{t('invoices:line.item')}</label>
                    <select
                      value={line.stockItemId}
                      onChange={(e) => handleLineChange(idx, 'stockItemId', e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="">{t('invoices:line.freeText')}</option>
                      {filteredItems.map((item) => (
                        <option key={item.id} value={item.id}>{item.nameFr || item.nameEn} ({item.sku})</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600">{t('invoices:line.description')}</label>
                    <input
                      type="text"
                      value={line.description}
                      onChange={(e) => handleLineChange(idx, 'description', e.target.value)}
                      className={`mt-1 block w-full rounded-md border ${validationErrors[`line_${idx}_description`] ? 'border-red-300' : 'border-gray-300'} px-2 py-1.5 text-sm focus:border-indigo-500 focus:ring-indigo-500`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">{t('invoices:line.qty')}</label>
                    <input
                      type="number"
                      step="0.0001"
                      min="0"
                      value={line.qty}
                      onChange={(e) => handleLineChange(idx, 'qty', e.target.value)}
                      className={`mt-1 block w-full rounded-md border ${validationErrors[`line_${idx}_qty`] ? 'border-red-300' : 'border-gray-300'} px-2 py-1.5 text-sm focus:border-indigo-500 focus:ring-indigo-500`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">{t('invoices:line.unitPrice')}</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={line.unitPrice}
                      onChange={(e) => handleLineChange(idx, 'unitPrice', e.target.value)}
                      className={`mt-1 block w-full rounded-md border ${validationErrors[`line_${idx}_unitPrice`] ? 'border-red-300' : 'border-gray-300'} px-2 py-1.5 text-sm focus:border-indigo-500 focus:ring-indigo-500`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">{t('invoices:line.discount')}</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={line.discountPct}
                      onChange={(e) => handleLineChange(idx, 'discountPct', e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">{t('invoices:line.taxRate')}</label>
                    <select
                      value={line.taxRate}
                      onChange={(e) => handleLineChange(idx, 'taxRate', e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      {TVA_RATES.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end justify-between md:col-span-2">
                    <span className="text-sm font-medium text-gray-900">
                      {t('invoices:line.lineTotal')}: {formatAmount(computeLineTotal(line))}
                    </span>
                    {lines.length > 1 && (
                      <Button type="button" variant="danger" size="sm" onClick={() => removeLine(idx)}>
                        {t('invoices:line.removeLine')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 border-t border-gray-200 pt-4">
            <div className="flex flex-col items-end space-y-1">
              <div className="flex justify-between w-64">
                <span className="text-sm text-gray-600">{t('invoices:field.subtotal')}:</span>
                <span className="text-sm font-medium">{formatAmount(subtotal)}</span>
              </div>
              <div className="flex justify-between w-64">
                <span className="text-sm text-gray-600">{t('invoices:field.taxAmount')}:</span>
                <span className="text-sm font-medium">{formatAmount(totalTax)}</span>
              </div>
              <div className="flex justify-between w-64 border-t border-gray-300 pt-1">
                <span className="text-base font-semibold text-gray-900">{t('invoices:field.total')}:</span>
                <span className="text-base font-bold text-gray-900">{formatAmount(totalTTC)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('invoices:field.notes')}</label>
          <textarea
            value={form.notes}
            onChange={(e) => handleFieldChange('notes', e.target.value)}
            rows={3}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={() => navigate('/invoices')}>
            {t('invoices:action.cancel')}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? t('common:status.loading') : t('invoices:action.save')}
          </Button>
        </div>
      </form>
    </div>
  );
}
