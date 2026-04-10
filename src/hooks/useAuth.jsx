import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { loginApi, registerApi, logoutApi, refreshTokenApi, getMeApi } from '../api/authApi';
import { hasPermission, hasAnyPermission } from '../constants/permissions';
import { normaliseRole, ROLES } from '../constants/roles';
import { essLogoutCleanup } from '../lib/essLogoutCleanup';

// Helper to broadcast the authenticated employee ID to the service worker.

const AuthContext = createContext(null);

const TOKEN_REFRESH_MARGIN_MS = 60_000; // refresh 1 min before expiry

/** Send the authenticated employee ID to the ESS service worker (Task 61). */
function notifySwEmployeeSet(employeeId) {
  try {
    navigator.serviceWorker?.controller?.postMessage({
      type: 'ESS_SET_EMPLOYEE',
      employeeId: employeeId || null,
    });
  } catch {
    // Non-fatal — SW may not be registered
  }
}

function parseJwtPayload(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

/** Normalise the role on a user object (in-place, returns same ref). */
function normaliseUser(user) {
  if (user && user.role) {
    user.role = normaliseRole(user.role);
  }
  return user;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef(null);
  // Ref so scheduleRefresh closure can access current user without re-creating itself
  const userRef = useRef(null);

  const clearTokens = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const storeTokens = useCallback((accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }, []);

  const scheduleRefresh = useCallback((accessToken) => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
    const payload = parseJwtPayload(accessToken);
    if (!payload?.exp) return;

    const expiresIn = payload.exp * 1000 - Date.now() - TOKEN_REFRESH_MARGIN_MS;
    if (expiresIn <= 0) return;

    refreshTimerRef.current = setTimeout(async () => {
      try {
        const rt = localStorage.getItem('refreshToken');
        if (!rt) return;
        const data = await refreshTokenApi(rt);
        storeTokens(data.accessToken, data.refreshToken);
        setUser(normaliseUser(data.user));
        scheduleRefresh(data.accessToken);
      } catch {
        // Refresh token expired — full logout + ESS cleanup (Task 61, AC#13)
        const employeeId = userRef.current?.employee_id || null;
        essLogoutCleanup(employeeId).catch(() => {});
        clearTokens();
        setUser(null);
      }
    }, expiresIn);
  }, [clearTokens, storeTokens]);

  // Bootstrap: check stored tokens on mount
  useEffect(() => {
    const init = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (!accessToken || !refreshToken) {
        setLoading(false);
        return;
      }

      try {
        const userData = await getMeApi();
        const normUser = normaliseUser(userData);
        setUser(normUser);
        userRef.current = normUser;
        scheduleRefresh(accessToken);
        notifySwEmployeeSet(normUser?.employee_id || null);
      } catch (err) {
        // Access token expired — try refresh
        if (err.status === 401 && refreshToken) {
          try {
            const data = await refreshTokenApi(refreshToken);
            storeTokens(data.accessToken, data.refreshToken);
            const normUser = normaliseUser(data.user);
            setUser(normUser);
            userRef.current = normUser;
            scheduleRefresh(data.accessToken);
            notifySwEmployeeSet(normUser?.employee_id || null);
          } catch {
            clearTokens();
            setUser(null);
            userRef.current = null;
          }
        } else {
          clearTokens();
          setUser(null);
          userRef.current = null;
        }
      } finally {
        setLoading(false);
      }
    };
    init();

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (email, password) => {
    const data = await loginApi(email, password);
    storeTokens(data.accessToken, data.refreshToken);
    const normUser = normaliseUser(data.user);
    setUser(normUser);
    userRef.current = normUser;
    scheduleRefresh(data.accessToken);
    notifySwEmployeeSet(normUser?.employee_id || null);
    return normUser;
  }, [storeTokens, scheduleRefresh]);

  const register = useCallback(async ({ email, password, firstName, lastName }) => {
    const data = await registerApi({ email, password, firstName, lastName });
    storeTokens(data.accessToken, data.refreshToken);
    const normUser = normaliseUser(data.user);
    setUser(normUser);
    userRef.current = normUser;
    scheduleRefresh(data.accessToken);
    notifySwEmployeeSet(normUser?.employee_id || null);
    return normUser;
  }, [storeTokens, scheduleRefresh]);

  const logout = useCallback(async () => {
    // Step 1: Wipe ESS PWA storage BEFORE clearing tokens so push unsubscribe
    // API call still has a valid auth token (Task 61)
    const employeeId = user?.employee_id || null;
    await essLogoutCleanup(employeeId);

    // Step 2: Invalidate the refresh token on the server
    const rt = localStorage.getItem('refreshToken');
    try {
      if (rt) await logoutApi(rt);
    } catch {
      // Best effort
    }
    clearTokens();
    setUser(null);
    userRef.current = null;
  }, [clearTokens, user]);

  const can = useCallback((permission) => {
    return user ? hasPermission(user.role, permission) : false;
  }, [user]);

  const canAny = useCallback((...permissions) => {
    return user ? hasAnyPermission(user.role, ...permissions) : false;
  }, [user]);

  const isAdmin = useMemo(() => user?.role === ROLES.SUPER_ADMIN, [user]);
  const isManager = useMemo(() => user?.role === ROLES.HR_MANAGER, [user]);
  const isPlanner = useMemo(() => user?.role === ROLES.PLANNER, [user]);
  const isAccountingAgent = useMemo(() => user?.role === ROLES.ACCOUNTING_AGENT, [user]);
  const isStockManager = useMemo(() => user?.role === ROLES.STOCK_MANAGER, [user]);
  const isPosManager = useMemo(() => user?.role === ROLES.POS_MANAGER, [user]);
  const isEmployee = useMemo(() => user?.role === ROLES.EMPLOYEE, [user]);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    can,
    canAny,
    isAdmin,
    isManager,
    isPlanner,
    isAccountingAgent,
    isStockManager,
    isPosManager,
    isEmployee,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
