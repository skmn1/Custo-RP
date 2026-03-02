import { useState, useCallback } from 'react';
import { posApi } from '../api/posApi';

/**
 * usePos — manages PoS data fetching and mutations,
 * including employee management scoped to a PoS.
 *
 * Returns:
 *   posList          — array of PoS objects
 *   selectedPos      — single PoS detail (with dashboard + employees)
 *   managers         — array of employees with isManager: true
 *   isLoading        — boolean
 *   error            — error object or null
 *   fetchPosList     — (includeInactive?: boolean) => Promise
 *   fetchPosDetail   — (id: number) => Promise
 *   createPos        — (data: object) => Promise
 *   updatePos        — (id: number, data: object) => Promise
 *   deletePos        — (id: number) => Promise
 *   fetchManagers    — () => Promise
 *   addEmployee      — (posId, data) => Promise
 *   updateEmployee   — (posId, empId, data) => Promise
 *   removeEmployee   — (posId, empId) => Promise
 *   clearError       — () => void
 *   clearSelectedPos — () => void
 */
export const usePos = () => {
  const [posList, setPosList] = useState([]);
  const [selectedPos, setSelectedPos] = useState(null);
  const [managers, setManagers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => setError(null), []);
  const clearSelectedPos = useCallback(() => setSelectedPos(null), []);

  const fetchPosList = useCallback(async (includeInactive = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await posApi.list(includeInactive);
      setPosList(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch PoS locations');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPosDetail = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await posApi.getById(id);
      setSelectedPos(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch PoS detail');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createPos = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const newPos = await posApi.create(data);
      // Refetch list to stay in sync
      const updatedList = await posApi.list(false);
      setPosList(updatedList);
      return newPos;
    } catch (err) {
      setError(err.message || 'Failed to create PoS');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePos = useCallback(async (id, data) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await posApi.update(id, data);
      // Refetch list and detail
      const updatedList = await posApi.list(false);
      setPosList(updatedList);
      setSelectedPos((prev) =>
        prev && prev.id === Number(id) ? { ...prev, ...updated } : prev
      );
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to update PoS');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deletePos = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      await posApi.delete(id);
      // Refetch list
      const updatedList = await posApi.list(false);
      setPosList(updatedList);
      setSelectedPos(null);
    } catch (err) {
      setError(err.message || 'Failed to delete PoS');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Manager list ──

  const fetchManagers = useCallback(async () => {
    try {
      const data = await posApi.listManagers();
      setManagers(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch managers');
      throw err;
    }
  }, []);

  // ── Employee CRUD scoped to a PoS ──

  const addEmployee = useCallback(async (posId, data) => {
    setIsLoading(true);
    setError(null);
    try {
      const newEmp = await posApi.addEmployee(posId, data);
      // Refetch detail to stay in sync
      const updated = await posApi.getById(posId);
      setSelectedPos(updated);
      // Refresh managers list in case a new manager was added
      const mgrs = await posApi.listManagers();
      setManagers(mgrs);
      return newEmp;
    } catch (err) {
      setError(err.message || 'Failed to add employee');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateEmployee = useCallback(async (posId, empId, data) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await posApi.updateEmployee(posId, empId, data);
      // Refetch detail to stay in sync
      const posDetail = await posApi.getById(posId);
      setSelectedPos(posDetail);
      // Refresh managers list
      const mgrs = await posApi.listManagers();
      setManagers(mgrs);
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to update employee');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeEmployee = useCallback(async (posId, empId) => {
    setIsLoading(true);
    setError(null);
    try {
      await posApi.removeEmployee(posId, empId);
      // Refetch detail
      const posDetail = await posApi.getById(posId);
      setSelectedPos(posDetail);
      // Refresh managers list
      const mgrs = await posApi.listManagers();
      setManagers(mgrs);
    } catch (err) {
      setError(err.message || 'Failed to remove employee');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Employee swap ──

  const fetchAvailableEmployees = useCallback(async (posId) => {
    try {
      const data = await posApi.listAvailableEmployees(posId);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch available employees');
      throw err;
    }
  }, []);

  const swapEmployee = useCallback(async (posId, currentEmpId, newEmpId) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await posApi.swapEmployee(posId, currentEmpId, newEmpId);
      // Refetch detail to stay in sync
      const posDetail = await posApi.getById(posId);
      setSelectedPos(posDetail);
      // Refresh managers list
      const mgrs = await posApi.listManagers();
      setManagers(mgrs);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to swap employee');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    posList,
    selectedPos,
    managers,
    isLoading,
    error,
    fetchPosList,
    fetchPosDetail,
    createPos,
    updatePos,
    deletePos,
    fetchManagers,
    addEmployee,
    updateEmployee,
    removeEmployee,
    swapEmployee,
    fetchAvailableEmployees,
    clearError,
    clearSelectedPos,
  };
};
