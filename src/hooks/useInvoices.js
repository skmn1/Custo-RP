import { useState, useCallback } from 'react';
import { invoicesApi } from '../api/invoicesApi';

export function useInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [invoice, setInvoice] = useState(null);
  const [kpi, setKpi] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => setError(null), []);

  const fetchInvoices = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await invoicesApi.list(params);
      setInvoices(data || []);
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchInvoice = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await invoicesApi.getById(id);
      setInvoice(data);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createInvoice = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await invoicesApi.create(data);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateInvoice = useCallback(async (id, data) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await invoicesApi.update(id, data);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const approveInvoice = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await invoicesApi.approve(id);
      setInvoice(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const recordPayment = useCallback(async (invoiceId, data) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await invoicesApi.recordPayment(invoiceId, data);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const duplicateInvoice = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await invoicesApi.duplicate(id);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const exportCsv = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      await invoicesApi.exportCsv(params);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchKpi = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await invoicesApi.getApKpis();
      setKpi(data);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    invoices,
    invoice,
    kpi,
    isLoading,
    error,
    clearError,
    fetchInvoices,
    fetchInvoice,
    createInvoice,
    updateInvoice,
    approveInvoice,
    recordPayment,
    duplicateInvoice,
    exportCsv,
    fetchKpi,
  };
}
