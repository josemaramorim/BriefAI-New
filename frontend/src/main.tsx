import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n';
import { ThemeProvider } from './components/theme-provider';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/toaster';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthProvider>
            <App />
            <Toaster />
        </AuthProvider>
    </ThemeProvider>
);
