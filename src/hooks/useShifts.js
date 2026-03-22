import { useState, useCallback, useEffect } from 'react';
import { shiftsApi } from '../api/shiftsApi';
import { initialShifts } from '../data/shifts';
import { SHIFT_TYPES } from '../constants/scheduler';
import { generateShiftId, calculateShiftDuration } from '../utils/shiftUtils';

export const useShifts = () => {
  const [shifts, setShifts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Fetch shifts from backend (falls back to static data) ──

  const fetchShifts = useCallback(async (filters = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await shiftsApi.list(filters);
      setShifts(data);
    } catch (err) {
      console.warn('Backend unavailable, using local data:', err.message);
      setShifts(initialShifts);
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
      return created;
    } catch (err) {
      // Fallback to local-only if backend is down
      const localShift = { id: generateShiftId(), ...payload };
      setShifts(prev => [...prev, localShift]);
      return localShift;
    }
  }, []);

  const deleteShift = useCallback(async (shiftId) => {
    // Optimistic removal
    setShifts(prev => prev.filter(s => s.id !== shiftId));
    try {
      await shiftsApi.delete(shiftId);
    } catch (err) {
      console.warn('Failed to delete shift on server:', err.message);
    }
  }, []);

  const updateShift = useCallback(async (shiftId, updates) => {
    // Optimistic update
    setShifts(prev =>
      prev.map(s => (s.id === shiftId ? { ...s, ...updates } : s)),
    );
    try {
      const updated = await shiftsApi.update(shiftId, updates);
      setShifts(prev =>
        prev.map(s => (s.id === shiftId ? updated : s)),
      );
    } catch (err) {
      console.warn('Failed to update shift on server:', err.message);
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
      setShifts(prev =>
        prev.map(s => (s.id === shiftId ? moved : s)),
      );
    } catch (err) {
      console.warn('Failed to move shift on server:', err.message);
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
