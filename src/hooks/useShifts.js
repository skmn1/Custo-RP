import { useState, useCallback, useEffect } from 'react';
import { shiftsApi } from '../api/shiftsApi';
import { initialShifts } from '../data/shifts';
import { SHIFT_TYPES } from '../constants/scheduler';
import { generateShiftId, calculateShiftDuration } from '../utils/shiftUtils';
import { createLogger } from '../utils/logger';

const log = createLogger('Shifts');

// ── Dual localStorage strategy ────────────────────────────────────────────────
//
//  SERVER_KEY  – last successful response from GET /api/shifts.
//                Overwritten on every successful fetch.
//                Used as fallback when the API is unreachable.
//
//  OFFLINE_KEY – shifts created / mutated while the API was unavailable.
//                NEVER cleared by a successful fetch; only cleared when a
//                pending shift is finally synced to the server or deleted.
//                Merged on top of server data at render time.
//
// On page load:
//   API ok  → state = serverShifts + offlinePending (not yet on server)
//   API down → state = cachedServer + offlinePending (both survive)
// ─────────────────────────────────────────────────────────────────────────────

const SERVER_KEY  = 'ssp:shifts:server';
const OFFLINE_KEY = 'ssp:shifts:offline';

function readJson(key)       { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; } catch { return null; } }
function writeJson(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }

const loadServerCache  = ()          => readJson(SERVER_KEY)  ?? null;
const saveServerCache  = (shifts)    => writeJson(SERVER_KEY, shifts);
const loadOffline      = ()          => readJson(OFFLINE_KEY) ?? [];
const saveOffline      = (shifts)    => writeJson(OFFLINE_KEY, shifts);
const addToOffline     = (shift)     => saveOffline([...loadOffline(), shift]);
const removeFromOffline = (id)       => saveOffline(loadOffline().filter(s => s.id !== id));
const updateInOffline  = (id, patch) => saveOffline(loadOffline().map(s => s.id === id ? { ...s, ...patch } : s));
const isOfflineOnly    = (id)        => loadOffline().some(s => s.id === id);

/** Merge: server shifts + offline-pending that the server doesn't know about yet. */
function mergeWithOffline(serverShifts) {
  const pending = loadOffline();
  if (!pending.length) return serverShifts;
  const serverIds = new Set(serverShifts.map(s => s.id));
  const newPending = pending.filter(s => !serverIds.has(s.id));
  if (newPending.length) log.info(`Merging ${newPending.length} offline-pending shift(s) with server data`);
  return [...serverShifts, ...newPending];
}

export const useShifts = () => {
  const [shifts, setShifts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Fetch: server → merge offline pending on top ──

  const fetchShifts = useCallback(async (filters = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await shiftsApi.list(filters);
      saveServerCache(data);
      const merged = mergeWithOffline(data);
      setShifts(merged);
      log.info(`Loaded ${data.length} shifts from API`);
    } catch (err) {
      const cached = loadServerCache();
      const base   = cached ?? initialShifts;
      const merged = mergeWithOffline(base);
      setShifts(merged);
      if (cached) {
        log.warn(`API unavailable – restored ${base.length} shifts from cache + ${merged.length - base.length} offline pending`);
      } else {
        log.warn('API unavailable – using seed data', { error: err.message });
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
    // customShiftData.date carries the ISO date string set by StaffScheduler
    const dateStr = customShiftData?.date ?? null;
    let payload;

    if (customShiftData?.startTime) {
      // Full data from AddShiftModal
      payload = {
        employeeId, day, date: dateStr,
        startTime:  customShiftData.startTime,
        endTime:    customShiftData.endTime,
        duration:   customShiftData.duration,
        type:       customShiftData.type,
        department: customShiftData.department,
        color:      getShiftColor(customShiftData.type),
      };
    } else {
      // Quick-add (no modal) – pick a random shift type
      const rnd      = SHIFT_TYPES[Math.floor(Math.random() * SHIFT_TYPES.length)];
      const duration = calculateShiftDuration(rnd.start, rnd.end);
      payload = {
        employeeId, day, date: dateStr,
        startTime: rnd.start, endTime: rnd.end, duration,
        type: rnd.type, color: rnd.color, department: 'General',
      };
    }

    try {
      const created = await shiftsApi.create(payload);
      setShifts(prev => {
        const next = [...prev, created];
        saveServerCache(next);
        return next;
      });
      log.info(`shift/create id=${created.id} type=${created.type}`);
      return created;
    } catch (err) {
      const localShift = { id: generateShiftId(), ...payload, _offline: true };
      addToOffline(localShift);
      setShifts(prev => [...prev, localShift]);
      log.warn(`shift/create offline id=${localShift.id}`, { status: err.status, error: err.message });
      return localShift;
    }
  }, []);

  const deleteShift = useCallback(async (shiftId) => {
    const wasOfflineOnly = isOfflineOnly(shiftId);

    // Optimistic removal + always clear from offline store
    removeFromOffline(shiftId);
    setShifts(prev => prev.filter(s => s.id !== shiftId));

    if (wasOfflineOnly) {
      log.info(`shift/delete offline-only id=${shiftId}`);
      return; // never reached server – no DELETE needed
    }

    try {
      await shiftsApi.delete(shiftId);
      log.info(`shift/delete id=${shiftId}`);
    } catch (err) {
      log.warn(`shift/delete failed id=${shiftId}`, { status: err.status, error: err.message });
    }
  }, []);

  const updateShift = useCallback(async (shiftId, updates) => {
    setShifts(prev => prev.map(s => (s.id === shiftId ? { ...s, ...updates } : s)));

    if (isOfflineOnly(shiftId)) {
      updateInOffline(shiftId, updates);
      log.info(`shift/update offline-only id=${shiftId}`);
      return;
    }

    try {
      const updated = await shiftsApi.update(shiftId, updates);
      setShifts(prev => prev.map(s => (s.id === shiftId ? updated : s)));
      log.info(`shift/update id=${shiftId}`);
    } catch (err) {
      log.warn(`shift/update offline id=${shiftId}`, { status: err.status, error: err.message });
    }
  }, []);

  const moveShift = useCallback(async (shiftId, newEmployeeId, newDay) => {
    setShifts(prev =>
      prev.map(s => s.id === shiftId ? { ...s, employeeId: newEmployeeId, day: newDay } : s),
    );

    if (isOfflineOnly(shiftId)) {
      updateInOffline(shiftId, { employeeId: newEmployeeId, day: newDay });
      log.info(`shift/move offline-only id=${shiftId} day=${newDay}`);
      return;
    }

    try {
      const moved = await shiftsApi.move(shiftId, { employeeId: newEmployeeId, day: newDay });
      setShifts(prev => prev.map(s => (s.id === shiftId ? moved : s)));
      log.info(`shift/move id=${shiftId} day=${newDay}`);
    } catch (err) {
      log.warn(`shift/move offline id=${shiftId}`, { status: err.status, error: err.message });
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
