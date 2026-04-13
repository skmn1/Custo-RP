import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { posApi } from '../api/posApi';
import { useAuth } from './useAuth';

const PosLocationContext = createContext(null);

export function PosLocationProvider({ children }) {
  const { user } = useAuth();
  const [posLocations, setPosLocations] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosLocations = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const result = await posApi.myPosLocations();
      const list = Array.isArray(result) ? result : [];
      setPosLocations(list);
      if (list.length > 0) {
        const savedId = localStorage.getItem('pos-selected-location');
        const validSaved = savedId && list.some((loc) => String(loc.id) === savedId);
        if (validSaved) {
          setSelectedLocationId(Number(savedId));
        } else {
          setSelectedLocationId(list[0].id);
        }
      }
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load PoS locations');
      setPosLocations([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPosLocations();
  }, [fetchPosLocations]);

  const selectLocation = useCallback((id) => {
    setSelectedLocationId(id);
    localStorage.setItem('pos-selected-location', String(id));
  }, []);

  const selectedLocation = posLocations.find((loc) => loc.id === selectedLocationId) || null;

  const hasAccess = useCallback(
    (posLocationId) => {
      if (!user) return false;
      if (user.role === 'super_admin') return true;
      return posLocations.some((loc) => loc.id === Number(posLocationId));
    },
    [user, posLocations],
  );

  return (
    <PosLocationContext.Provider
      value={{
        posLocations,
        selectedLocation,
        selectedLocationId,
        selectLocation,
        hasAccess,
        isLoading,
        error,
        refresh: fetchPosLocations,
      }}
    >
      {children}
    </PosLocationContext.Provider>
  );
}

export function usePosLocation() {
  const ctx = useContext(PosLocationContext);
  if (!ctx) throw new Error('usePosLocation must be used within PosLocationProvider');
  return ctx;
}
