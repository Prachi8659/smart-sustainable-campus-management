import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { DEMO_USERS } from '../services/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('campus_auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('campus_auth_token'));
  const [loading, setLoading] = useState(true);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [demoMode, setDemoMode] = useState(() => {
    const saved = localStorage.getItem('campus_demo_mode');
    return saved ? JSON.parse(saved) : false;
  });

  // Check backend server health
  const checkBackendHealth = async () => {
    try {
      const res = await api.get('/health', { timeout: 3000 });
      if (res.data?.status === 'online') {
        setIsBackendConnected(true);
        return true;
      }
      setIsBackendConnected(false);
      return false;
    } catch (e) {
      setIsBackendConnected(false);
      return false;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const backendOnline = await checkBackendHealth();

      const savedToken = localStorage.getItem('campus_auth_token');
      if (savedToken && backendOnline && !demoMode) {
        // If saved token is an offline synthetic token, attempt to upgrade to a genuine JWT
        if (savedToken.startsWith('demo_jwt_token_')) {
          const savedUserStr = localStorage.getItem('campus_auth_user');
          if (savedUserStr) {
            try {
              const parsedUser = JSON.parse(savedUserStr);
              if (parsedUser?.role) {
                const res = await api.post('/auth/demo-login', { role: parsedUser.role });
                if (res.data?.success && res.data?.token && isMounted) {
                  setToken(res.data.token);
                  setUser(res.data.user);
                  localStorage.setItem('campus_auth_token', res.data.token);
                  localStorage.setItem('campus_auth_user', JSON.stringify(res.data.user));
                  setLoading(false);
                  return;
                }
              }
            } catch (upgradeErr) {
              console.warn('[AuthContext] Could not upgrade offline token to backend JWT:', upgradeErr.message);
            }
          }
        } else {
          // Token is a genuine JWT: verify validity on backend
          try {
            const res = await api.get('/auth/me');
            if (res.data?.user && isMounted) {
              setUser(res.data.user);
              localStorage.setItem('campus_auth_user', JSON.stringify(res.data.user));
            }
          } catch (e) {
            console.warn('Session verification error:', e.message);
            if (e.response?.status === 401 && isMounted) {
              setUser(null);
              setToken(null);
            }
          }
        }
      }
      if (isMounted) setLoading(false);
    };

    initAuth();

    // Sync auth state if another service or interceptor reports session expiration
    const handleAuthExpired = () => {
      if (isMounted) {
        setUser(null);
        setToken(null);
      }
    };
    window.addEventListener('campus:auth-expired', handleAuthExpired);

    const interval = setInterval(checkBackendHealth, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('campus:auth-expired', handleAuthExpired);
    };
  }, [demoMode]);

  const login = async (email, password) => {
    // 1. Try real API first if not forced demo mode
    if (!demoMode) {
      try {
        const response = await api.post('/auth/login', { email, password });
        if (response.data?.success) {
          const { token: authToken, user: authUser } = response.data;
          setToken(authToken);
          setUser(authUser);
          localStorage.setItem('campus_auth_token', authToken);
          localStorage.setItem('campus_auth_user', JSON.stringify(authUser));
          return { success: true, user: authUser, mode: 'api' };
        }
      } catch (err) {
        // If server is unreachable or 500, fallback to demo check
        if (!err.response || err.response.status >= 500) {
          console.warn('[Auth] Server unavailable, falling back to demo credentials matching.');
        } else {
          // If server explicitly returned 401/400 invalid credentials
          throw new Error(err.response?.data?.message || 'Invalid email or password.');
        }
      }
    }

    // 2. Demo fallback credential check
    const matched = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      const demoToken = `demo_jwt_token_${matched.role}_${Date.now()}`;
      setToken(demoToken);
      setUser(matched);
      localStorage.setItem('campus_auth_token', demoToken);
      localStorage.setItem('campus_auth_user', JSON.stringify(matched));
      return { success: true, user: matched, mode: 'demo' };
    }

    throw new Error('User not found. Please verify credentials or use one-click demo login.');
  };

  const register = async (userData) => {
    if (!demoMode) {
      try {
        const response = await api.post('/auth/register', userData);
        if (response.data?.success) {
          const { token: authToken, user: authUser } = response.data;
          setToken(authToken);
          setUser(authUser);
          localStorage.setItem('campus_auth_token', authToken);
          localStorage.setItem('campus_auth_user', JSON.stringify(authUser));
          return { success: true, user: authUser };
        }
      } catch (err) {
        if (!err.response || err.response.status >= 500) {
          console.warn('[Auth] Server unreachable, using local registration.');
        } else {
          throw new Error(err.response?.data?.message || 'Registration failed.');
        }
      }
    }

    // Demo registration
    const newUser = {
      _id: `usr_${Date.now()}`,
      id: `usr_${Date.now()}`,
      name: userData.name,
      email: userData.email,
      role: userData.role === 'staff' ? 'staff' : 'student', // Admin forbidden on registration
      campus: userData.campus || 'Main Campus',
      isActive: true,
    };
    const demoToken = `demo_jwt_token_${newUser.role}_${Date.now()}`;
    setToken(demoToken);
    setUser(newUser);
    localStorage.setItem('campus_auth_token', demoToken);
    localStorage.setItem('campus_auth_user', JSON.stringify(newUser));
    return { success: true, user: newUser };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('campus_auth_token');
    localStorage.removeItem('campus_auth_user');
  };

  // One-click demo role switcher: authenticates via backend genuine JWT when online
  const switchDemoRole = async (role) => {
    const roleKey = role === 'maintenance_staff' ? 'staff' : role;

    // 1. If not explicitly forced to offline demo mode, request genuine JWT from backend
    if (!demoMode) {
      try {
        const response = await api.post('/auth/demo-login', { role: roleKey });
        if (response.data?.success && response.data?.token) {
          const { token: realToken, user: realUser } = response.data;
          setToken(realToken);
          setUser(realUser);
          localStorage.setItem('campus_auth_token', realToken);
          localStorage.setItem('campus_auth_user', JSON.stringify(realUser));
          return realUser;
        }
      } catch (err) {
        console.warn('[AuthContext] Backend demo login unavailable, using offline fallback:', err.message);
      }
    }

    // 2. Offline fallback if backend is unreachable or in offline demo mode
    let target = DEMO_USERS.find((u) => u.role === roleKey);
    if (!target) target = DEMO_USERS.find((u) => u.role === role) || DEMO_USERS[0];

    const demoToken = `demo_jwt_token_${target.role}_${Date.now()}`;
    setToken(demoToken);
    setUser(target);
    localStorage.setItem('campus_auth_token', demoToken);
    localStorage.setItem('campus_auth_user', JSON.stringify(target));
    return target;
  };

  const toggleDemoMode = () => {
    const nextMode = !demoMode;
    setDemoMode(nextMode);
    localStorage.setItem('campus_demo_mode', JSON.stringify(nextMode));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        isBackendConnected,
        demoMode,
        toggleDemoMode,
        login,
        register,
        logout,
        switchDemoRole,
        checkBackendHealth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
