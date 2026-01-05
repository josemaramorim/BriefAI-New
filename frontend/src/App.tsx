import React from 'react';
// automatic JSX runtime handles React imports
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Templates from './pages/Templates';
import TemplateBuilder from './pages/TemplateBuilder';
import Dashboard from './pages/Dashboard';
import BriefFiller from './pages/BriefFiller';
import './index.css';
import { MainLayout } from './components/layout/MainLayout';
import { Toaster } from './components/ui/toaster';
import { ThemeProvider } from './components/theme-provider';

function PrivateRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

import BriefingResults from './pages/BriefingResults';
import BriefingDetails from './pages/BriefingDetails';
import Briefings from './pages/Briefings';
import WorkflowEditorPage from './pages/WorkflowEditorPage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/templates"
        element={
          <PrivateRoute>
            <MainLayout>
              <Templates />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/templates/:id"
        element={
          <PrivateRoute>
            <MainLayout>
              <TemplateBuilder />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/templates/:id/results"
        element={
          <PrivateRoute>
            <MainLayout>
              <BriefingResults />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/briefings"
        element={
          <PrivateRoute>
            <MainLayout>
              <Briefings />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/briefings/:id"
        element={
          <PrivateRoute>
            <MainLayout>
              <BriefingDetails />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/workflow-editor"
        element={
          <PrivateRoute>
            <MainLayout>
              <WorkflowEditorPage />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route path="/fill/:id" element={<BriefFiller />} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <AppRoutes />
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
