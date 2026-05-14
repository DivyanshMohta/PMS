import React, { createContext, useContext, useState, useCallback } from 'react';
import type { User, UserRole } from '../mock/data';
import { MOCK_USERS, DEMO_ACCOUNTS } from '../mock/data';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('hrms_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('hrms_token'));

  const login = useCallback(async (email: string, password: string) => {
    const account = DEMO_ACCOUNTS.find(a => a.email === email && a.password === password);
    if (!account) throw new Error('Invalid credentials');
    const foundUser = MOCK_USERS.find(u => u.email === email);
    if (!foundUser) throw new Error('User not found');
    const mockToken = `mock_jwt_${foundUser.id}_${Date.now()}`;
    setUser(foundUser);
    setToken(mockToken);
    localStorage.setItem('hrms_user', JSON.stringify(foundUser));
    localStorage.setItem('hrms_token', mockToken);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('hrms_user');
    localStorage.removeItem('hrms_token');
  }, []);

  const hasRole = useCallback((...roles: UserRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
