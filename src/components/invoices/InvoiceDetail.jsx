import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useInvoices } from '../../hooks/useInvoices';
import { pdf } from '@react-pdf/renderer';
import InvoicePDF from './InvoicePDF';
import Button from '../ui/Button';

const STATUS_COLORS = {
  received: 'bg-blue-100 text-blue-800',
  approved: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-500',
};

const PAYMENT_METHODS = ['cash', 'bank_transfer', 'card', 'cheque', 'other'];

const formatAmount = (amount) => {
  if (amount == null) return '0,00 €';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR');
};

export default function InvoiceDetail() {
  const { t } = useTranslation(['invoices', 'common']);
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    invoice, fetchInvoice, approveInvoice, cancelInvoice, deleteInvoice,
    recordPayment, duplicateInvoice, isLoading, error,
  } = useInvoices();

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    paymentDate: new Date().toISOString().slice(0, 10),
    amount: '',
    method: 'bank_transfer',
    reference: '',
    note: '',
  });

  useEffect(() => {
    fetchInvoice(id);
  }, [id]);

  const handleApprove = async () => {
    if (!window.confirm(t('invoices:action.approveConfirm'))) return;
    await approveInvoice(id);
    fetchInvoice(id);
  };

  const handleDuplicate = async () => {
    const result = await duplicateInvoice(id);
    if (result?.id) {
      navigate(`/invoices/${result.id}`);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm(t('invoices:action.cancelConfirm'))) return;
    await cancelInvoice(id);
    fetchInvoice(id);
  };

  const handleDelete = async () => {
    if (!window.confirm(t('invoices:action.deleteConfirm'))) return;
    await deleteInvoice(id);
    navigate('/invoices');
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    await recordPayment(id, {
      ...paymentForm,
      amount: parseFloat(paymentForm.amount),
    });
    setShowPaymentForm(false);
    setPaymentForm({
      paymentDate: new Date().toISOString().slice(0, 10),
      amount: '',
      method: 'bank_transfer',
      reference: '',
      note: '',
    });
    fetchInvoice(id);
  };

  const handlePdfExport = async () => {
    if (!invoice) return;
    const blob = await pdf(<InvoicePDF invoice={invoice} />).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  if (isLoading && !invoice) {
    return <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-500">{t('common:status.loading')}</div>;
  }

  if (!invoice) {
    return <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-500">{t('invoices:empty')}</div>;
  }

  const isEditable = invoice.status === 'received';
  const canPay = invoice.status === 'approved';
  const canCancel = invoice.status !== 'cancelled' && invoice.status !== 'paid';
  const canDelete = invoice.status === 'received' || invoice.status === 'cancelled';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[invoice.status]}`}>
              {t(`invoices:status.${invoice.status}`)}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">{invoice.counterpartyName}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => navigate('/invoices')}>
            {t('invoices:action.back')}
          </Button>
          {isEditable && (
            <>
              <Button variant="secondary" onClick={() => navigate(`/invoices/${id}/edit`)}>
                {t('invoices:action.edit')}
              </Button>
              <Button data-testid="approve-btn" onClick={handleApprove}>
                {t('invoices:action.approve')}
              </Button>
            </>
          )}
          <Button data-testid="duplicate-btn" variant="secondary" onClick={handleDuplicate}>
            {t('invoices:action.duplicate')}
          </Button>
          <Button data-testid="pdf-btn" variant="secondary" onClick={handlePdfExport}>
            {t('invoices:action.pdf')}
          </Button>
          {canCancel && (
            <Button data-testid="cancel-btn" variant="secondary" onClick={handleCancel}>
              {t('invoices:action.cancelInvoice')}
            </Button>
          )}
          {canDelete && (
            <Button data-testid="delete-btn" variant="danger" onClick={handleDelete}>
              {t('invoices:action.delete')}
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {/* Invoice Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500">{t('invoices:field.supplier')}</span>
            <p className="font-medium text-gray-900">{invoice.counterpartyName}</p>
            {invoice.counterpartyAddress && <p className="text-gray-600 text-xs mt-1">{invoice.counterpartyAddress}</p>}
          </div>
          <div>
            <span className="text-gray-500">{t('invoices:field.supplierSiret')}</span>
            <p className="font-medium text-gray-900">{invoice.supplierSiret || '—'}</p>
          </div>
          <div>
            <span className="text-gray-500">{t('invoices:field.supplierVat')}</span>
            <p className="font-medium text-gray-900">{invoice.supplierVatNumber || '—'}</p>
          </div>
          <div>
            <span className="text-gray-500">{t('invoices:field.buyerVat')}</span>
            <p className="font-medium text-gray-900">{invoice.buyerVatNumber || '—'}</p>
          </div>
          <div>
            <span className="text-gray-500">{t('invoices:field.issueDate')}</span>
            <p className="font-medium text-gray-900">{formatDate(invoice.issueDate)}</p>
          </div>
          <div>
            <span className="text-gray-500">{t('invoices:field.dueDate')}</span>
            <p className="font-medium text-gray-900">{formatDate(invoice.dueDate)}</p>
          </div>
          {invoice.deliveryDate && (
            <div>
              <span className="text-gray-500">{t('invoices:field.deliveryDate')}</span>
              <p className="font-medium text-gray-900">{formatDate(invoice.deliveryDate)}</p>
            </div>
          )}
          <div>
            <span className="text-gray-500">{t('invoices:field.paymentTerms')}</span>
            <p className="font-medium text-gray-900">{invoice.paymentTerms || '—'}</p>
          </div>
          <div>
            <span className="text-gray-500">{t('invoices:field.earlyPaymentDiscount')}</span>
            <p className="font-medium text-gray-900">{invoice.earlyPaymentDiscount ?? 0} %</p>
          </div>
          <div>
            <span className="text-gray-500">{t('invoices:field.latePaymentRate')}</span>
            <p className="font-medium text-gray-900">{invoice.latePaymentRate ?? 0} %</p>
          </div>
          {invoice.poNumber && (
            <div>
              <span className="text-gray-500">{t('invoices:field.po')}</span>
              <p className="font-medium text-indigo-600">{invoice.poNumber}</p>
            </div>
          )}
        </div>
      </div>

      {/* Lines */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('invoices:line.description')}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('invoices:line.qty')}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('invoices:line.unitPrice')}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('invoices:line.discount')}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('invoices:line.taxRate')}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('invoices:line.lineTotal')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoice.lines?.map((line) => (
                <tr key={line.id}>
                  <td className="px-4 py-3 text-sm text-gray-900">{line.description}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{line.qty}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatAmount(line.unitPrice)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-right">{line.discountPct} %</td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-right">{line.taxRate} %</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{formatAmount(line.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-200 px-4 py-4 bg-gray-50">
          <div className="flex flex-col items-end space-y-1">
            <div className="flex justify-between w-64">
              <span className="text-sm text-gray-600">{t('invoices:field.subtotal')}:</span>
              <span className="text-sm font-medium">{formatAmount(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between w-64">
              <span className="text-sm text-gray-600">{t('invoices:field.taxAmount')}:</span>
              <span className="text-sm font-medium">{formatAmount(invoice.taxAmount)}</span>
            </div>
            {invoice.discountAmount > 0 && (
              <div className="flex justify-between w-64">
                <span className="text-sm text-gray-600">{t('invoices:field.discountAmount')}:</span>
                <span className="text-sm font-medium text-red-600">-{formatAmount(invoice.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between w-64 border-t border-gray-300 pt-1">
              <span className="text-base font-semibold">{t('invoices:field.total')}:</span>
              <span className="text-base font-bold">{formatAmount(invoice.totalAmount)}</span>
            </div>
            <div className="flex justify-between w-64">
              <span className="text-sm text-gray-600">{t('invoices:field.paid')}:</span>
              <span className="text-sm font-medium text-green-600">{formatAmount(invoice.amountPaid)}</span>
            </div>
            <div className="flex justify-between w-64">
              <span className="text-sm font-semibold text-gray-900">{t('invoices:field.outstanding')}:</span>
              <span className="text-sm font-bold text-amber-600">{formatAmount(invoice.amountOutstanding)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payments */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('invoices:payment.title')}</h2>
          {canPay && (
            <Button data-testid="record-payment-btn" size="sm" onClick={() => setShowPaymentForm(true)}>
              {t('invoices:payment.record')}
            </Button>
          )}
        </div>

        {/* Payment form (bottom-sheet on mobile) */}
        {showPaymentForm && (
          <form onSubmit={handleRecordPayment} className="border border-indigo-200 rounded-lg p-4 mb-4 bg-indigo-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700">{t('invoices:payment.date')}</label>
                <input
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm((p) => ({ ...p, paymentDate: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">{t('invoices:payment.amount')}</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm((p) => ({ ...p, amount: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">{t('invoices:payment.method')}</label>
                <select
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm((p) => ({ ...p, method: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>{t(`invoices:payment.methods.${m}`)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">{t('invoices:payment.reference')}</label>
                <input
                  type="text"
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm((p) => ({ ...p, reference: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700">{t('invoices:payment.note')}</label>
                <input
                  type="text"
                  value={paymentForm.note}
                  onChange={(e) => setPaymentForm((p) => ({ ...p, note: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowPaymentForm(false)}>
                {t('invoices:action.cancel')}
              </Button>
              <Button type="submit" data-testid="submit-payment-btn" size="sm" disabled={isLoading}>
                {t('invoices:payment.record')}
              </Button>
            </div>
          </form>
        )}

        {invoice.payments?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('invoices:payment.date')}</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">{t('invoices:payment.amount')}</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('invoices:payment.method')}</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('invoices:payment.reference')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoice.payments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-3 py-2 text-gray-900">{formatDate(p.paymentDate)}</td>
                    <td className="px-3 py-2 text-right font-medium text-green-600">{formatAmount(p.amount)}</td>
                    <td className="px-3 py-2 text-gray-600">{t(`invoices:payment.methods.${p.method}`, p.method)}</td>
                    <td className="px-3 py-2 text-gray-600">{p.reference || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">{t('invoices:payment.noPayments')}</p>
        )}
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('invoices:field.notes')}</h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
        </div>
      )}
    </div>
  );
}
