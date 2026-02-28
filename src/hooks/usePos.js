import { useState, useCallback } from 'react';
import { posApi } from '../data/pos';

/**
 * usePos — manages PoS data fetching and mutations.
 *
 * Returns:
 *   posList          — array of PoS objects
 *   selectedPos      — single PoS detail (with dashboard)
 *   isLoading        — boolean
 *   error            — error object or null
 *   fetchPosList     — (includeInactive?: boolean) => Promise
 *   fetchPosDetail   — (id: number) => Promise
 *   createPos        — (data: object) => Promise
 *   updatePos        — (id: number, data: object) => Promise
 *   deletePos        — (id: number) => Promise
 *   clearError       — () => void
 *   clearSelectedPos — () => void
 */
export const usePos = () => {
  const [posList, setPosList] = useState([]);
  const [selectedPos, setSelectedPos] = useState(null);
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

  return {
    posList,
    selectedPos,
    isLoading,
    error,
    fetchPosList,
    fetchPosDetail,
    createPos,
    updatePos,
    deletePos,
    clearError,
    clearSelectedPos,
  };
};
