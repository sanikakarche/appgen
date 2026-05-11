'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';

interface User { id: number; email: string; }
interface AuthCtx {
  user: User | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx | null>(null);

const DEMO_EMAIL = 'demo@appgen.com';
const DEMO_PASSWORD = 'demo123456';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    autoLogin();
  }, []);

  const autoLogin = async () => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
        setLoading(false);
        return;
      }
      // Try login first
      try {
        const { data } = await api.post('/auth/login', { email: DEMO_EMAIL, password: DEMO_PASSWORD });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
      } catch {
        // If login fails, register
        const { data } = await api.post('/auth/register', { email: DEMO_EMAIL, password: DEMO_PASSWORD });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
      }
    } catch (e) {
      console.error('Auto login failed', e);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    autoLogin();
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext)!;