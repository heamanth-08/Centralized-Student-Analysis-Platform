import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('campusiq_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('campusiq_token') || null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('campusiq_theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('campusiq_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('campusiq_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  useEffect(() => {
    const handleLogoutEvent = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener('campusiq_auth_logout', handleLogoutEvent);
    return () => window.removeEventListener('campusiq_auth_logout', handleLogoutEvent);
  }, []);

  useEffect(() => {
    async function verifySession() {
      if (token) {
        try {
          const me = await api.auth.me();
          setUser(me);
          localStorage.setItem('campusiq_user', JSON.stringify(me));
        } catch (e) {
          console.error('Session expired or invalid', e);
          setUser(null);
          setToken(null);
          localStorage.removeItem('campusiq_token');
          localStorage.removeItem('campusiq_user');
        }
      }
      setLoading(false);
    }
    verifySession();
  }, [token]);

  const login = async (username, password) => {
    const res = await api.auth.login(username, password);
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem('campusiq_token', res.access_token);
    localStorage.setItem('campusiq_user', JSON.stringify(res.user));
    return res.user;
  };

  const register = async (username, email, fullName, password) => {
    const res = await api.auth.register(username, email, fullName, password);
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem('campusiq_token', res.access_token);
    localStorage.setItem('campusiq_user', JSON.stringify(res.user));
    return res.user;
  };

  const logout = async () => {
    try {
      if (token) await api.auth.logout();
    } catch (e) {
      // ignore
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('campusiq_token');
      localStorage.removeItem('campusiq_user');
    }
  };

  // Helper for quick demonstration role switching
  const demoLogin = async (role) => {
    const demoAccounts = {
      admin: { u: 'admin', p: 'admin123' },
      faculty: { u: 'faculty.cs', p: 'faculty123' },
      coordinator: { u: 'coord.cs', p: 'coord123' },
      student: { u: 'student.cs', p: 'student123' },
    };
    const acc = demoAccounts[role] || demoAccounts.admin;
    return await login(acc.u, acc.p);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role,
        token,
        loading,
        darkMode,
        toggleDarkMode,
        login,
        register,
        logout,
        demoLogin,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
