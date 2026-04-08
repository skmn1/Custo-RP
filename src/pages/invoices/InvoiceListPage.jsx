import React from 'react';
import InvoiceList from '../../components/invoices/InvoiceList';
import InvoiceKPIWidgets from '../../components/invoices/InvoiceKPIWidgets';

export default function InvoiceListPage() {
  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <InvoiceKPIWidgets />
      </div>
      <InvoiceList />
    </div>
  );
}
