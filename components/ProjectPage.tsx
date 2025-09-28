import React from 'react';
import { useParams, Outlet, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProject } from '../services/api';
import { Project } from '../types';
import { Spinner, NavigationTabs } from './ui';

// --- Main Project Page Component ---

const ProjectPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const { data: project, isLoading, error } = useQuery<Project | undefined, Error>({
        queryKey: ['project', projectId],
        queryFn: () => getProject(projectId!),
        enabled: !!projectId,
    });

    if (isLoading) return <div className="flex justify-center py-12"><Spinner /></div>;
    if (error) return <p className="text-red-500">Error: {error.message}</p>;
    if (!project) return <div><h1 className="text-2xl font-bold mb-4">Project not found</h1><Link to="/" className="text-[#76b900] hover:underline">&larr; Back to Dashboard</Link></div>;

    const tabs = [
        { name: 'Documents', to: `/projects/${projectId}/documents` },
        { name: 'Indexes', to: `/projects/${projectId}/indexes` },
    ];

    return (
        <div>
            <div className="mb-6">
                <Link to="/" className="text-sm text-[#76b900] hover:underline mb-2 inline-block">&larr; Back to Projects</Link>
                <h1 className="text-3xl font-bold text-slate-100">{project.name}</h1>
                <p className="text-slate-400 mt-1">{project.description}</p>
            </div>
            <NavigationTabs tabs={tabs} />
            <div className="mt-6">
                <Outlet />
            </div>
        </div>
    );
};

export default ProjectPage;