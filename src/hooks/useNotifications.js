import { useState, useCallback, useEffect, useRef } from 'react';
import { apiFetch } from '../api/config';

/**
 * useNotifications — data-fetching hook for the notification centre.
 *
 * Provides:
 * - Paginated notification list with filtering
 * - Unread count with 60-second polling
 * - Mark-as-read (single + all) and delete operations
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, hasNextPage: false });
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  // ── Fetch notification list ──────────────────────────────

  const fetchList = useCallback(async ({ page = 1, pageSize = 20, unreadOnly = false, append = false } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page, pageSize, unreadOnly });
      const res = await apiFetch(`/ess/notifications?${params}`);
      if (append) {
        setNotifications((prev) => [...prev, ...(res.data || [])]);
      } else {
        setNotifications(res.data || []);
      }
      if (res.pagination) setPagination(res.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch unread count (lightweight) ─────────────────────

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await apiFetch('/ess/notifications/unread-count');
      setUnreadCount(res?.data?.count ?? 0);
    } catch {
      // silently ignore — badge will just stay stale
    }
  }, []);

  // ── Mark as read ─────────────────────────────────────────

  const markAsRead = useCallback(async (id) => {
    try {
      await apiFetch(`/ess/notifications/${id}/read`, { method: 'PUT' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await apiFetch('/ess/notifications/read-all', { method: 'PUT' });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  }, []);

  // ── Delete ───────────────────────────────────────────────

  const deleteNotification = useCallback(async (id) => {
    try {
      await apiFetch(`/ess/notifications/${id}`, { method: 'DELETE' });
      setNotifications((prev) => {
        const removed = prev.find((n) => n.id === id);
        if (removed && !removed.isRead) setUnreadCount((c) => Math.max(0, c - 1));
        return prev.filter((n) => n.id !== id);
      });
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  }, []);

  // ── Poll unread count every 60s ──────────────────────────

  useEffect(() => {
    fetchUnreadCount();
    intervalRef.current = setInterval(fetchUnreadCount, 60_000);
    return () => clearInterval(intervalRef.current);
  }, [fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    pagination,
    isLoading,
    error,
    fetchList,
    fetchUnreadCount,
    markAsRead,
    markAllRead,
    deleteNotification,
  };
}
