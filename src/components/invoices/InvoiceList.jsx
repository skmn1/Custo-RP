import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useInvoices } from '../../hooks/useInvoices';
import Button from '../ui/Button';

const STATUS_COLORS = {
  received: 'bg-blue-100 text-blue-800',
  approved: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-500',
};

const formatAmount = (amount) => {
  if (amount == null) return '0,00 €';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR');
};

export default function InvoiceList() {
  const { t } = useTranslation(['invoices', 'common']);
  const navigate = useNavigate();
  const { invoices, isLoading, fetchInvoices, exportCsv } = useInvoices();

  const [filters, setFilters] = useState({
    status: '',
    supplier: '',
    dateFrom: '',
    dateTo: '',
  });

  useEffect(() => {
    fetchInvoices(filters);
  }, []);

  const handleSearch = () => {
    fetchInvoices(filters);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleExport = () => {
    exportCsv(filters);
  };

  return (
    <div data-testid="invoice-list-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
          {t('invoices:title')}
        </h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleExport} data-testid="export-csv-btn">
            {t('invoices:action.export')}
          </Button>
          <Button onClick={() => navigate('/invoices/new')} data-testid="new-invoice-btn">
            {t('invoices:action.new')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <select
            data-testid="status-filter"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">{t('invoices:filter.allStatuses')}</option>
            <option value="received">{t('invoices:status.received')}</option>
            <option value="approved">{t('invoices:status.approved')}</option>
            <option value="paid">{t('invoices:status.paid')}</option>
            <option value="cancelled">{t('invoices:status.cancelled')}</option>
          </select>
          <input
            type="text"
            placeholder={t('invoices:filter.supplier')}
            value={filters.supplier}
            onChange={(e) => handleFilterChange('supplier', e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            aria-label={t('invoices:filter.dateFrom')}
          />
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            aria-label={t('invoices:filter.dateTo')}
          />
          <Button onClick={handleSearch} className="w-full">
            {t('common:action.search', 'Rechercher')}
          </Button>
        </div>
      </div>

      {/* Table (desktop) */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('invoices:field.number')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('invoices:field.supplier')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('invoices:field.issueDate')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('invoices:field.dueDate')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('invoices:field.total')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('invoices:field.outstanding')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('common:status.label', 'Statut')}</th>
              </tr>
            </thead>
            <tbody data-testid="invoice-table-body" className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-500">{t('common:status.loading')}</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-500">{t('invoices:empty')}</td></tr>
              ) : (
                invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/invoices/${inv.id}`)}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-indigo-600">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{inv.counterpartyName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(inv.issueDate)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(inv.dueDate)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatAmount(inv.totalAmount)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatAmount(inv.amountOutstanding)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[inv.status] || 'bg-gray-100 text-gray-800'}`}>
                        {t(`invoices:status.${inv.status}`)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Card layout (mobile) */}
      <div data-testid="invoice-mobile-cards" className="md:hidden space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">{t('common:status.loading')}</div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-8 text-gray-500">{t('invoices:empty')}</div>
        ) : (
          invoices.map((inv) => (
            <div
              key={inv.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/invoices/${inv.id}`)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-indigo-600">{inv.invoiceNumber}</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[inv.status] || 'bg-gray-100 text-gray-800'}`}>
                  {t(`invoices:status.${inv.status}`)}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900">{inv.counterpartyName}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-lg font-bold text-gray-900">{formatAmount(inv.totalAmount)}</span>
                <span className="text-xs text-gray-500">{formatDate(inv.issueDate)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
