'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthCtx {
  user: any;
  loading: boolean;
}

const AuthContext = createContext<AuthCtx>({ user: null, loading: false });

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider value={{ user: { email: 'demo@appgen.com' }, loading: false }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);