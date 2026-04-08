import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import InvoiceReviewView from '../../components/invoices/InvoiceReviewView';

export default function InvoiceReviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { ocrResult, pdfFile } = location.state || {};

  if (!ocrResult) {
    navigate('/invoices');
    return null;
  }

  return (
    <InvoiceReviewView
      ocrResult={ocrResult}
      pdfFile={pdfFile}
      onCancel={() => navigate('/invoices')}
    />
  );
}
