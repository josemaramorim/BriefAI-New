import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface MainLayoutProps {
    children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col md:flex-row">
            {/* Desktop Sidebar */}
            <Sidebar />

            <div className="flex flex-col flex-1 md:pl-64 transition-all duration-300">
                <Header />
                <main className="flex-1 p-4 md:p-6 lg:p-8 pt-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
