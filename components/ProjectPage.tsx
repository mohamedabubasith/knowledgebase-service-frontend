import React, { useState } from 'react';
import { useParams, Outlet, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProject, deleteProject } from '../services/api';
import { Project } from '../types';
import { Spinner, Button, TrashIcon, ConfirmationModal, useNotification } from './ui';


const ProjectPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { addNotification } = useNotification();

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const { data: project, isLoading, error } = useQuery<Project | undefined, Error>({
        queryKey: ['project', projectId],
        queryFn: () => getProject(projectId!),
        enabled: !!projectId,
    });
    
    const deleteProjectMutation = useMutation<any, Error, string>({
        mutationFn: deleteProject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            addNotification('Project deleted successfully', 'success');
            navigate('/');
        },
        onError: (err: Error) => {
            addNotification(`Error deleting project: ${err.message}`, 'error');
            setIsDeleteModalOpen(false);
        }
    });

    if (isLoading) return <div className="flex justify-center py-12"><Spinner /></div>;
    if (error) return <p className="text-red-500">Error: {error.message}</p>;
    if (!project) return <div><h1 className="text-2xl font-bold mb-4">Project not found</h1><Link to="/" className="text-[#76b900] hover:underline">&larr; Back to Dashboard</Link></div>;
    
    const confirmDeleteProject = () => {
        if (project) {
            deleteProjectMutation.mutate(project.id);
        }
    };

    return (
        <div>
            <div className="mb-6 pt-12 md:pt-0">
                 <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-100">{project.name}</h1>
                        <p className="text-slate-400 mt-1">{project.description}</p>
                    </div>
                    <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)}>
                        <TrashIcon />
                        <span className="ml-2 hidden sm:inline">Delete Project</span>
                    </Button>
                </div>
            </div>
            <div className="mt-6">
                <Outlet />
            </div>
             <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteProject}
                title={`Delete Project: ${project?.name}?`}
                isConfirming={deleteProjectMutation.isPending}
            >
                <p>Are you sure you want to delete this project? This will permanently delete all associated documents and indexes.</p>
                <p className="mt-2 font-semibold text-red-400">This action cannot be undone.</p>
            </ConfirmationModal>
        </div>
    );
};

export default ProjectPage;