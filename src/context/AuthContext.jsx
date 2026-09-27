import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const TOKEN_KEY = 'insightiq_token';
const USER_KEY  = 'insightiq_user';

export const AuthProvider = ({ children }) => {
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

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export default AuthContext;
