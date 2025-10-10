import React from 'react';
import { HashRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationProvider } from './components/ui';
import Dashboard from './components/Dashboard';
import ProjectPage from './components/ProjectPage';
import { DocumentsTab } from './components/project/DocumentsTab';
import { IndexesTab } from './components/project/IndexesTab';
import { IntegrationsTab } from './components/project/IntegrationsTab';

const queryClient = new QueryClient();

const Header: React.FC = () => (
    <header className="bg-[#1f2328]/80 backdrop-blur-lg sticky top-0 z-30 border-b border-[#3a3f47]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3">
                <Link to="/" className="text-xl font-bold text-slate-100 flex items-center gap-3">
                     <span className="w-8 h-8 bg-[#76b900] rounded-md flex items-center justify-center text-black font-extrabold text-lg">K</span>
                    <span>Knowledge Base AI</span>
                </Link>
            </div>
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
                                <Route path="integrations" element={<IntegrationsTab />} />
                            </Route>
                        </Routes>
                    </main>
                </HashRouter>
            </NotificationProvider>
        </QueryClientProvider>
    );
};

export default App;