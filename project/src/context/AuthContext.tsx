import React, { createContext, useContext, useState, useCallback } from 'react';
import type { UserRole } from '../mock/data';
import { MOCK_USERS, DEMO_ACCOUNTS } from '../mock/data';
import apiClient from '../api/client';

export interface AuthUser {
  _id: string;
  id: string; // keep both for compat
  name: string;
  email: string;
  role: UserRole;
  department: string;
  title: string;
  avatar: string;
  managerId?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  isAuthenticated: boolean;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function normalizeUser(raw: Record<string, unknown>): AuthUser {
  const id = (raw._id ?? raw.id ?? '') as string;
  const name = (raw.name ?? '') as string;
  const rawRole = (raw.role ?? 'Employee') as string;
  const role: UserRole = rawRole === 'Manager' || rawRole === 'Employee' ? rawRole : 'HR';
  return {
    _id: id,
    id,
    name,
    email: (raw.email ?? '') as string,
    role,
    department: (raw.department ?? '') as string,
    title: (raw.title ?? '') as string,
    avatar: (raw.avatar as string | undefined) ?? getInitials(name),
    managerId: raw.managerId as string | undefined,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('hrms_user');
    if (!stored) return null;
    try {
      return normalizeUser(JSON.parse(stored));
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('hrms_token'));

  const login = useCallback(async (email: string, password: string) => {
    // Try backend authentication first
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      const token = res.data?.access_token;
      const user = res.data?.user;
      if (!token || !user) throw new Error('Invalid login response');
      const authUser = normalizeUser(user);
      setUser(authUser);
      setToken(token);
      localStorage.setItem('hrms_user', JSON.stringify(authUser));
      localStorage.setItem('hrms_token', token);
      return;
    } catch (err) {
      // Fallback to local demo accounts for offline/demo mode
      const account = DEMO_ACCOUNTS.find(a => a.email === email && a.password === password);
      if (!account) throw err; // return the backend error to the caller
      const foundUser = MOCK_USERS.find(u => u.email === email);
      if (!foundUser) throw new Error('User not found');
      const mockToken = `mock_jwt_${foundUser.id}_${Date.now()}`;
      const authUser = normalizeUser({ ...foundUser, _id: foundUser.id });
      setUser(authUser);
      setToken(mockToken);
      localStorage.setItem('hrms_user', JSON.stringify(authUser));
      localStorage.setItem('hrms_token', mockToken);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('hrms_user');
    localStorage.removeItem('hrms_token');
  }, []);

  /** Merge updated fields into the in-memory + localStorage user */
  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next: AuthUser = {
        ...prev,
        ...updates,
        avatar: updates.name ? getInitials(updates.name) : (updates.avatar ?? prev.avatar),
      };
      localStorage.setItem('hrms_user', JSON.stringify(next));
      return next;
    });
  }, []);

  const hasRole = useCallback(
    (...roles: UserRole[]) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user],
  );

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, isAuthenticated: !!user, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
