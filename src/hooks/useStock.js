import { useState, useCallback } from 'react';
import { stockApi } from '../api/stockApi';

/**
 * useStock — manages stock data fetching and mutations
 * for items, categories, locations, suppliers, purchase orders,
 * stocktakes, movements, and KPI.
 */
export const useStock = () => {
  const [items, setItems] = useState([]);
  const [item, setItem] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoriesFlat, setCategoriesFlat] = useState([]);
  const [locations, setLocations] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [stocktakes, setStocktakes] = useState([]);
  const [stocktake, setStocktake] = useState(null);
  const [movements, setMovements] = useState([]);
  const [kpi, setKpi] = useState(null);
  const [reorderQueue, setReorderQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => setError(null), []);

  // ── Items ──

  const fetchItems = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await stockApi.items.list(params);
      setItems(data);
      return data;
    } catch (err) {
      setError(err.message);
      setItems([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchItem = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await stockApi.items.getById(id);
      setItem(data);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchItemByBarcode = useCallback(async (barcode) => {
    try {
      return await stockApi.items.getByBarcode(barcode);
    } catch {
      return null;
    }
  }, []);

  const createItem = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const created = await stockApi.items.create(data);
      const updated = await stockApi.items.list();
      setItems(updated);
      return created;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateItem = useCallback(async (id, data) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await stockApi.items.update(id, data);
      const list = await stockApi.items.list();
      setItems(list);
      setItem(updated);
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteItem = useCallback(async (id) => {
    setIsLoading(true);
    try {
      await stockApi.items.delete(id);
      const list = await stockApi.items.list();
      setItems(list);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Movements ──

  const fetchMovements = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await stockApi.movements.list(params);
      setMovements(data);
      return data;
    } catch (err) {
      setError(err.message);
      setMovements([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchItemMovements = useCallback(async (itemId) => {
    setIsLoading(true);
    try {
      const data = await stockApi.items.movements(itemId);
      setMovements(data);
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createMovement = useCallback(async (data) => {
    setIsLoading(true);
    try {
      const created = await stockApi.movements.create(data);
      return created;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTransfer = useCallback(async (params) => {
    setIsLoading(true);
    try {
      await stockApi.movements.transfer(params);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Categories ──

  const fetchCategories = useCallback(async () => {
    try {
      const data = await stockApi.categories.listTree();
      setCategories(data);
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, []);

  const fetchCategoriesFlat = useCallback(async () => {
    try {
      const data = await stockApi.categories.listFlat();
      setCategoriesFlat(data);
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, []);

  const createCategory = useCallback(async (data) => {
    const created = await stockApi.categories.create(data);
    await fetchCategories();
    await fetchCategoriesFlat();
    return created;
  }, [fetchCategories, fetchCategoriesFlat]);

  const updateCategory = useCallback(async (id, data) => {
    const updated = await stockApi.categories.update(id, data);
    await fetchCategories();
    await fetchCategoriesFlat();
    return updated;
  }, [fetchCategories, fetchCategoriesFlat]);

  const deleteCategory = useCallback(async (id) => {
    await stockApi.categories.delete(id);
    await fetchCategories();
    await fetchCategoriesFlat();
  }, [fetchCategories, fetchCategoriesFlat]);

  // ── Locations ──

  const fetchLocations = useCallback(async () => {
    try {
      const data = await stockApi.locations.list();
      setLocations(data);
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, []);

  const createLocation = useCallback(async (data) => {
    const created = await stockApi.locations.create(data);
    await fetchLocations();
    return created;
  }, [fetchLocations]);

  const updateLocation = useCallback(async (id, data) => {
    const updated = await stockApi.locations.update(id, data);
    await fetchLocations();
    return updated;
  }, [fetchLocations]);

  const deleteLocation = useCallback(async (id) => {
    await stockApi.locations.delete(id);
    await fetchLocations();
  }, [fetchLocations]);

  // ── Suppliers ──

  const fetchSuppliers = useCallback(async () => {
    try {
      const data = await stockApi.suppliers.list();
      setSuppliers(data);
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, []);

  const fetchSupplierById = useCallback(async (id) => {
    try {
      return await stockApi.suppliers.getById(id);
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  const createSupplier = useCallback(async (data) => {
    const created = await stockApi.suppliers.create(data);
    await fetchSuppliers();
    return created;
  }, [fetchSuppliers]);

  const updateSupplier = useCallback(async (id, data) => {
    const updated = await stockApi.suppliers.update(id, data);
    await fetchSuppliers();
    return updated;
  }, [fetchSuppliers]);

  const deleteSupplier = useCallback(async (id) => {
    await stockApi.suppliers.delete(id);
    await fetchSuppliers();
  }, [fetchSuppliers]);

  // ── Purchase Orders ──

  const fetchPurchaseOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await stockApi.purchaseOrders.list();
      setPurchaseOrders(data);
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPurchaseOrder = useCallback(async (id) => {
    setIsLoading(true);
    try {
      const data = await stockApi.purchaseOrders.getById(id);
      setPurchaseOrder(data);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createPurchaseOrder = useCallback(async (data) => {
    const created = await stockApi.purchaseOrders.create(data);
    await fetchPurchaseOrders();
    return created;
  }, [fetchPurchaseOrders]);

  const updatePurchaseOrder = useCallback(async (id, data) => {
    const updated = await stockApi.purchaseOrders.update(id, data);
    await fetchPurchaseOrders();
    setPurchaseOrder(updated);
    return updated;
  }, [fetchPurchaseOrders]);

  const submitPurchaseOrder = useCallback(async (id) => {
    const updated = await stockApi.purchaseOrders.submit(id);
    await fetchPurchaseOrders();
    setPurchaseOrder(updated);
    return updated;
  }, [fetchPurchaseOrders]);

  const receivePOLine = useCallback(async (poId, lineId, params) => {
    const updated = await stockApi.purchaseOrders.receiveLine(poId, lineId, params);
    setPurchaseOrder(updated);
    await fetchPurchaseOrders();
    return updated;
  }, [fetchPurchaseOrders]);

  const cancelPurchaseOrder = useCallback(async (id) => {
    await stockApi.purchaseOrders.cancel(id);
    await fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  // ── Stocktakes ──

  const fetchStocktakes = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await stockApi.stocktakes.list();
      setStocktakes(data);
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStocktake = useCallback(async (id) => {
    setIsLoading(true);
    try {
      const data = await stockApi.stocktakes.getById(id);
      setStocktake(data);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startStocktake = useCallback(async (data) => {
    const created = await stockApi.stocktakes.start(data);
    await fetchStocktakes();
    setStocktake(created);
    return created;
  }, [fetchStocktakes]);

  const submitStocktakeCount = useCallback(async (sessionId, itemId, countedQty) => {
    const updated = await stockApi.stocktakes.submitCount(sessionId, itemId, countedQty);
    setStocktake(updated);
    return updated;
  }, []);

  const finaliseStocktake = useCallback(async (id) => {
    const updated = await stockApi.stocktakes.finalise(id);
    setStocktake(updated);
    await fetchStocktakes();
    return updated;
  }, [fetchStocktakes]);

  // ── KPI ──

  const fetchKpi = useCallback(async () => {
    try {
      const data = await stockApi.kpi();
      setKpi(data);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  // ── Reorder Queue ──

  const fetchReorderQueue = useCallback(async () => {
    try {
      const data = await stockApi.items.reorderQueue();
      setReorderQueue(data);
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, []);

  return {
    // State
    items, item, categories, categoriesFlat, locations, suppliers,
    purchaseOrders, purchaseOrder, stocktakes, stocktake,
    movements, kpi, reorderQueue, isLoading, error,
    clearError,
    // Items
    fetchItems, fetchItem, fetchItemByBarcode, createItem, updateItem, deleteItem,
    // Movements
    fetchMovements, fetchItemMovements, createMovement, createTransfer,
    // Categories
    fetchCategories, fetchCategoriesFlat, createCategory, updateCategory, deleteCategory,
    // Locations
    fetchLocations, createLocation, updateLocation, deleteLocation,
    // Suppliers
    fetchSuppliers, fetchSupplierById, createSupplier, updateSupplier, deleteSupplier,
    // Purchase Orders
    fetchPurchaseOrders, fetchPurchaseOrder, createPurchaseOrder,
    updatePurchaseOrder, submitPurchaseOrder, receivePOLine, cancelPurchaseOrder,
    // Stocktakes
    fetchStocktakes, fetchStocktake, startStocktake, submitStocktakeCount, finaliseStocktake,
    // KPI
    fetchKpi,
    // Reorder
    fetchReorderQueue,
  };
};
