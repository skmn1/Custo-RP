import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import InvoiceReviewView from '../../components/invoices/InvoiceReviewView';
import { retrievePdfFile, clearPdfFile } from '../../utils/pdfFileStore';

export default function InvoiceReviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { ocrResult } = location.state || {};
  const pdfFile = retrievePdfFile();

  if (!ocrResult) {
    navigate('/invoices');
    return null;
  }

  const handleCancel = () => {
    clearPdfFile();
    navigate('/invoices');
  };

  return (
    <InvoiceReviewView
      ocrResult={ocrResult}
      pdfFile={pdfFile}
      onCancel={handleCancel}
    />
  );
}
