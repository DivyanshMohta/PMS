import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import MyPerformancePage from './pages/MyPerformance';
import TeamManagementPage from './pages/TeamManagement';
import DevelopmentPlansPage from './pages/DevelopmentPlans';
import CompetencyDictionaryPage from './pages/CompetencyDictionary';
import ProfilePage from './pages/Profile';
import NewEmployeePage from './pages/NewEmployee';
import AssignManagerPage from './pages/AssignManager';

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { isAuthenticated, hasRole } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !hasRole(...(roles as never[]))) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/my-performance" element={<MyPerformancePage />} />
        <Route path="/team" element={<ProtectedRoute roles={['Admin', 'HR', 'Manager']}><TeamManagementPage /></ProtectedRoute>} />
        <Route path="/new-employee" element={<ProtectedRoute roles={['HR']}><NewEmployeePage /></ProtectedRoute>} />
        <Route path="/assign-manager" element={<ProtectedRoute roles={['HR']}><AssignManagerPage /></ProtectedRoute>} />
        <Route path="/development" element={<DevelopmentPlansPage />} />
        <Route path="/competencies" element={<ProtectedRoute roles={['Admin']}><CompetencyDictionaryPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
