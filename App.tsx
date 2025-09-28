import React from 'react';
import { HashRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationProvider } from './components/ui';
import Dashboard from './components/Dashboard';
import ProjectPage, { DocumentsTab, IndexesTab } from './components/ProjectPage';

const queryClient = new QueryClient();

const Header: React.FC = () => (
    <header className="bg-[#2a2f35] border-b border-[#3a3f47]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link to="/" className="text-2xl font-bold text-[#76b900] hover:text-[#82cc00] transition-colors">
                Knowledge Base AI
            </Link>
        </div>
    </header>
);

const App: React.FC = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <NotificationProvider>
                <HashRouter>
                    <Header />
                    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/projects/:projectId" element={<ProjectPage />}>
                                <Route index element={<Navigate to="documents" replace />} />
                                <Route path="documents" element={<DocumentsTab />} />
                                <Route path="indexes" element={<IndexesTab />} />
                            </Route>
                        </Routes>
                    </main>
                </HashRouter>
            </NotificationProvider>
        </QueryClientProvider>
    );
};

export default App;