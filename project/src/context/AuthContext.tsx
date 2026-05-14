import React, { createContext, useContext, useState, useCallback } from 'react';
import type { UserRole } from '../mock/data';
import { MOCK_USERS, DEMO_ACCOUNTS } from '../mock/data';

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
  return {
    _id: id,
    id,
    name,
    email: (raw.email ?? '') as string,
    role: (raw.role ?? 'Employee') as UserRole,
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
    // Use mock credentials (no backend required for login)
    const account = DEMO_ACCOUNTS.find((a) => a.email === email && a.password === password);
    if (!account) throw new Error('Invalid credentials');
    const foundUser = MOCK_USERS.find((u) => u.email === email);
    if (!foundUser) throw new Error('User not found');

    const mockToken = `mock_jwt_${foundUser.id}_${Date.now()}`;
    const authUser = normalizeUser({ ...foundUser, _id: foundUser.id });
    setUser(authUser);
    setToken(mockToken);
    localStorage.setItem('hrms_user', JSON.stringify(authUser));
    localStorage.setItem('hrms_token', mockToken);
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
