import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { loginApi, registerApi, logoutApi, refreshTokenApi, getMeApi } from '../api/authApi';
import { hasPermission, hasAnyPermission } from '../constants/permissions';

const AuthContext = createContext(null);

const TOKEN_REFRESH_MARGIN_MS = 60_000; // refresh 1 min before expiry

function parseJwtPayload(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef(null);

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
        setUser(data.user);
        scheduleRefresh(data.accessToken);
      } catch {
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
        setUser(userData);
        scheduleRefresh(accessToken);
      } catch (err) {
        // Access token expired — try refresh
        if (err.status === 401 && refreshToken) {
          try {
            const data = await refreshTokenApi(refreshToken);
            storeTokens(data.accessToken, data.refreshToken);
            setUser(data.user);
            scheduleRefresh(data.accessToken);
          } catch {
            clearTokens();
            setUser(null);
          }
        } else {
          clearTokens();
          setUser(null);
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
    setUser(data.user);
    scheduleRefresh(data.accessToken);
    return data.user;
  }, [storeTokens, scheduleRefresh]);

  const register = useCallback(async ({ email, password, firstName, lastName }) => {
    const data = await registerApi({ email, password, firstName, lastName });
    storeTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
    scheduleRefresh(data.accessToken);
    return data.user;
  }, [storeTokens, scheduleRefresh]);

  const logout = useCallback(async () => {
    const rt = localStorage.getItem('refreshToken');
    try {
      if (rt) await logoutApi(rt);
    } catch {
      // Best effort
    }
    clearTokens();
    setUser(null);
  }, [clearTokens]);

  const can = useCallback((permission) => {
    return user ? hasPermission(user.role, permission) : false;
  }, [user]);

  const canAny = useCallback((...permissions) => {
    return user ? hasAnyPermission(user.role, ...permissions) : false;
  }, [user]);

  const isAdmin = useMemo(() => user?.role === 'admin', [user]);
  const isManager = useMemo(() => user?.role === 'manager', [user]);
  const isEmployee = useMemo(() => user?.role === 'employee', [user]);
  const isViewer = useMemo(() => user?.role === 'viewer', [user]);

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
    isEmployee,
    isViewer,
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
