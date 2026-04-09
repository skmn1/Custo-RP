import { useState, useCallback, useEffect } from 'react';
import { shiftsApi } from '../api/shiftsApi';
import { initialShifts } from '../data/shifts';
import { SHIFT_TYPES } from '../constants/scheduler';
import { generateShiftId, calculateShiftDuration } from '../utils/shiftUtils';
import { createLogger } from '../utils/logger';

const log = createLogger('Shifts');

// ── localStorage fallback persistence ──────────────────────────
const STORAGE_KEY = 'ssp:shifts:local';

function loadLocalShifts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore parse errors */ }
  return null;
}

function saveLocalShifts(shifts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shifts));
  } catch { /* quota exceeded — silently ignore */ }
}

export const useShifts = () => {
  const [shifts, setShifts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Fetch shifts from backend (falls back to localStorage → static seed) ──

  const fetchShifts = useCallback(async (filters = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await shiftsApi.list(filters);
      setShifts(data);
      log.info(`Loaded ${data.length} shifts from API`);
    } catch (err) {
      const cached = loadLocalShifts();
      if (cached) {
        setShifts(cached);
        log.warn(`API unavailable – restored ${cached.length} shifts from local cache`);
      } else {
        setShifts(initialShifts);
        log.warn('API unavailable – using seed data (no local cache found)');
      }
      setError(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  // Helper function to get color based on shift type
  const getShiftColor = (shiftType) => {
    const colorMap = {
      'Regular': 'bg-blue-100 border-blue-300 text-blue-800',
      'Overtime': 'bg-red-100 border-red-300 text-red-800',
      'Training': 'bg-green-100 border-green-300 text-green-800',
      'Meeting': 'bg-yellow-100 border-yellow-300 text-yellow-800',
      'Break': 'bg-gray-100 border-gray-300 text-gray-800',
    };
    return colorMap[shiftType] || 'bg-blue-100 border-blue-300 text-blue-800';
  };

  const addShift = useCallback(async (employeeId, day, customShiftData = null) => {
    let payload;

    if (customShiftData) {
      payload = {
        employeeId,
        day,
        startTime: customShiftData.startTime,
        endTime: customShiftData.endTime,
        duration: customShiftData.duration,
        type: customShiftData.type,
        department: customShiftData.department,
        color: getShiftColor(customShiftData.type),
      };
    } else {
      const randomShiftType = SHIFT_TYPES[Math.floor(Math.random() * SHIFT_TYPES.length)];
      const duration = calculateShiftDuration(randomShiftType.start, randomShiftType.end);
      payload = {
        employeeId,
        day,
        startTime: randomShiftType.start,
        endTime: randomShiftType.end,
        duration,
        type: randomShiftType.type,
        color: randomShiftType.color,
        department: 'General',
      };
    }

    try {
      const created = await shiftsApi.create(payload);
      setShifts(prev => [...prev, created]);
      log.info(`shift/create id=${created.id} type=${created.type}`);
      return created;
    } catch (err) {
      const localShift = { id: generateShiftId(), ...payload };
      setShifts(prev => {
        const next = [...prev, localShift];
        saveLocalShifts(next);
        return next;
      });
      log.warn(`shift/create offline id=${localShift.id} type=${localShift.type}`);
      return localShift;
    }
  }, []);

  const deleteShift = useCallback(async (shiftId) => {
    // Optimistic removal
    setShifts(prev => {
      const next = prev.filter(s => s.id !== shiftId);
      return next;
    });
    try {
      await shiftsApi.delete(shiftId);
      log.info(`shift/delete id=${shiftId}`);
      // Persist updated list after confirmed server delete
      setShifts(prev => { saveLocalShifts(prev); return prev; });
    } catch (err) {
      setShifts(prev => {
        const next = prev.filter(s => s.id !== shiftId);
        saveLocalShifts(next);
        return next;
      });
      log.warn(`shift/delete offline id=${shiftId}`);
    }
  }, []);

  const updateShift = useCallback(async (shiftId, updates) => {
    // Optimistic update
    setShifts(prev =>
      prev.map(s => (s.id === shiftId ? { ...s, ...updates } : s)),
    );
    try {
      const updated = await shiftsApi.update(shiftId, updates);
      setShifts(prev => {
        const next = prev.map(s => (s.id === shiftId ? updated : s));
        saveLocalShifts(next);
        return next;
      });
      log.info(`shift/update id=${shiftId}`);
    } catch (err) {
      setShifts(prev => {
        const next = prev.map(s => (s.id === shiftId ? { ...s, ...updates } : s));
        saveLocalShifts(next);
        return next;
      });
      log.warn(`shift/update offline id=${shiftId}`);
    }
  }, []);

  const moveShift = useCallback(async (shiftId, newEmployeeId, newDay) => {
    // Optimistic update for drag-and-drop responsiveness
    setShifts(prev =>
      prev.map(s =>
        s.id === shiftId ? { ...s, employeeId: newEmployeeId, day: newDay } : s,
      ),
    );
    try {
      const moved = await shiftsApi.move(shiftId, {
        employeeId: newEmployeeId,
        day: newDay,
      });
      setShifts(prev => {
        const next = prev.map(s => (s.id === shiftId ? moved : s));
        saveLocalShifts(next);
        return next;
      });
      log.info(`shift/move id=${shiftId} day=${newDay}`);
    } catch (err) {
      setShifts(prev => {
        const next = prev.map(s =>
          s.id === shiftId ? { ...s, employeeId: newEmployeeId, day: newDay } : s,
        );
        saveLocalShifts(next);
        return next;
      });
      log.warn(`shift/move offline id=${shiftId} day=${newDay}`);
    }
  }, []);

  return {
    shifts,
    isLoading,
    error,
    addShift,
    deleteShift,
    updateShift,
    moveShift,
    refetch: fetchShifts,
  };
};
