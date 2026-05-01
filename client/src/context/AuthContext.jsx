// client/src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(() => {
    try { return JSON.parse(localStorage.getItem('dpc_user') || 'null'); }
    catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  // Verify token on mount
  useEffect(() => {
    const token = localStorage.getItem('dpc_token');
    if (!token || !user) return;
    api.get('/auth/me')
      .then((r) => { setUser(r.data.user); save(r.data.user); })
      .catch(() => {/* axios interceptor handles 401 */});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = (u) => {
    if (u) localStorage.setItem('dpc_user', JSON.stringify(u));
    else   localStorage.removeItem('dpc_user');
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('dpc_token', data.token);
      save(data.user);
      setUser(data.user);
      return data.user;
    } finally { setLoading(false); }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', payload);
      localStorage.setItem('dpc_token', data.token);
      save(data.user);
      setUser(data.user);
      return data.user;
    } finally { setLoading(false); }
  };

  const logout = () => {
    localStorage.removeItem('dpc_token');
    save(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
