import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { posApi } from '../api/posApi';
import { useAuth } from './useAuth';

const PosTerminalContext = createContext(null);

export function PosTerminalProvider({ children }) {
  const { user } = useAuth();
  const [terminals, setTerminals] = useState([]);
  const [selectedTerminalId, setSelectedTerminalId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTerminals = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const result = await posApi.myTerminals();
      const list = Array.isArray(result) ? result : [];
      setTerminals(list);
      // Auto-select first terminal if none selected or current selection invalid
      if (list.length > 0) {
        const savedId = localStorage.getItem('pos-selected-terminal');
        const validSaved = savedId && list.some((t) => String(t.id) === savedId);
        if (validSaved) {
          setSelectedTerminalId(Number(savedId));
        } else {
          setSelectedTerminalId(list[0].id);
        }
      }
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load terminals');
      setTerminals([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTerminals();
  }, [fetchTerminals]);

  const selectTerminal = useCallback((id) => {
    setSelectedTerminalId(id);
    localStorage.setItem('pos-selected-terminal', String(id));
  }, []);

  const selectedTerminal = terminals.find((t) => t.id === selectedTerminalId) || null;
  const hasAccess = useCallback(
    (terminalId) => {
      if (!user) return false;
      if (user.role === 'super_admin') return true;
      return terminals.some((t) => t.id === Number(terminalId));
    },
    [user, terminals],
  );

  return (
    <PosTerminalContext.Provider
      value={{
        terminals,
        selectedTerminal,
        selectedTerminalId,
        selectTerminal,
        hasAccess,
        isLoading,
        error,
        refresh: fetchTerminals,
      }}
    >
      {children}
    </PosTerminalContext.Provider>
  );
}

export function usePosTerminal() {
  const ctx = useContext(PosTerminalContext);
  if (!ctx) throw new Error('usePosTerminal must be used within PosTerminalProvider');
  return ctx;
}
