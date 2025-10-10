import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationProvider, Button, MenuIcon } from './components/ui';
import Dashboard from './components/Dashboard';
import ProjectPage from './components/ProjectPage';
import { DocumentsTab } from './components/project/DocumentsTab';
import { IndexesTab } from './components/project/IndexesTab';
import { IntegrationsTab } from './components/project/IntegrationsTab';
import Sidebar from './components/Sidebar';

const queryClient = new QueryClient();

const ProjectLayout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="relative h-screen md:flex bg-[#181a1d]">
            <div className="flex-shrink-0 md:hidden">
                <Button 
                    variant="secondary"
                    iconOnly 
                    onClick={() => setSidebarOpen(true)}
                    className="absolute top-4 left-4 z-20"
                    aria-label="Open sidebar"
                >
                    <MenuIcon />
                </Button>
            </div>

            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <NotificationProvider>
                <HashRouter>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route element={<ProjectLayout />}>
                            <Route path="/projects/:projectId" element={<ProjectPage />}>
                                <Route index element={<Navigate to="documents" replace />} />
                                <Route path="documents" element={<DocumentsTab />} />
                                <Route path="indexes" element={<IndexesTab />} />
                                <Route path="integrations" element={<IntegrationsTab />} />
                            </Route>
                        </Route>
                    </Routes>
                </HashRouter>
            </NotificationProvider>
        </QueryClientProvider>
    );
};

export default App;