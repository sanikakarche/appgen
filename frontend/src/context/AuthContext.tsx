'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import api from '@/lib/api';

interface User { id: number; email: string; }
interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user] = useState<User>({ id: 1, email: 'demo@appgen.com' });
  const [loading] = useState(false);

  const login = async () => {};
  const register = async () => {};
  const logout = () => {};

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext)!;