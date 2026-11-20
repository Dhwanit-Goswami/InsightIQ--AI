import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext(null);

const TOKEN_KEY = 'insightiq_token';
const USER_KEY  = 'insightiq_user';

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [token, setToken]   = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [user,  setUser]    = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) || null; }
    catch { return null; }
  });

  const login = useCallback(async (email, password) => {
    const res = await axios.post('/api/v1/auth/login', { email, password });
    const { access_token, user: u, company } = res.data;
    localStorage.setItem(TOKEN_KEY, access_token);
    localStorage.setItem(USER_KEY, JSON.stringify({ ...u, company }));
    setToken(access_token);
    setUser({ ...u, company });
    return res.data;
  }, []);

  const register = useCallback(async (data) => {
    const res = await axios.post('/api/v1/auth/register', data);
    const { access_token, user: u, company } = res.data;
    localStorage.setItem(TOKEN_KEY, access_token);
    localStorage.setItem(USER_KEY, JSON.stringify({ ...u, company }));
    setToken(access_token);
    setUser({ ...u, company });
    return res.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // Listen for unauthorized 401 events emitted by Axios interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      // Redirect to login if not already on an unauthenticated route
      const publicPaths = ['/login', '/signup', '/forgot-password', '/'];
      if (!publicPaths.includes(window.location.pathname)) {
        navigate('/login', { replace: true, state: { sessionExpired: true } });
      }
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [logout, navigate]);

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

// oxlint-disable-next-line react/only-export-components
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export default AuthContext;
