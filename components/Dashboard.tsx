import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { getProjects, createProject, deleteProject } from '../services/api';
import { Spinner, Button, Card, Modal, useNotification, Badge, Input, Textarea, PlusIcon, TrashIcon, ConfirmationModal } from './ui';
import { Project } from '../types';

type CreateProjectForm = {
    name: string;
    description: string;
};

const Dashboard: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
    const queryClient = useQueryClient();
    const { addNotification } = useNotification();

    const { data: projects, isLoading, error } = useQuery<Project[], Error>({
        queryKey: ['projects'],
        queryFn: getProjects
    });

    const createProjectMutation = useMutation({
        mutationFn: createProject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            addNotification('Project created successfully', 'success');
            setIsModalOpen(false);
        },
        onError: (err: Error) => {
            addNotification(`Error: ${err.message}`, 'error');
        }
    });

    const deleteProjectMutation = useMutation<any, Error, string>({
        mutationFn: deleteProject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            addNotification('Project deleted successfully', 'success');
            setProjectToDelete(null);
        },
        onError: (err: Error) => {
            addNotification(`Error deleting project: ${err.message}`, 'error');
            setProjectToDelete(null);
        }
    });
    
    const { register, handleSubmit, reset } = useForm<CreateProjectForm>();

    const onSubmit = (data: CreateProjectForm) => {
        createProjectMutation.mutate(data);
        reset();
    };

    const handleDeleteClick = (e: React.MouseEvent, project: Project) => {
        e.preventDefault();
        e.stopPropagation();
        setProjectToDelete(project);
    };

    const confirmDeleteProject = () => {
        if (projectToDelete) {
            deleteProjectMutation.mutate(projectToDelete.id);
        }
    };

    const validProjects = projects?.filter(p => p && p.id) || [];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-100">Projects</h1>
                <Button onClick={() => setIsModalOpen(true)}>
                    <PlusIcon />
                    <span className="ml-2">Create Project</span>
                </Button>
            </div>

            {isLoading && <Spinner />}
            {error && <p className="text-red-500">Error fetching projects: {error.message}</p>}

            {!isLoading && !error && (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {validProjects.length > 0 ? (
                        validProjects.map(project => (
                            <Link to={`/projects/${project.id}`} key={project.id} className="block group">
                                <Card className="hover:border-[#76b900]/50 hover:-translate-y-1 transition-all duration-200 h-full flex flex-col justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-[#76b900] group-hover:text-[#82cc00] transition-colors">{project.name}</h2>
                                        <p className="text-slate-400 mt-2 flex-grow">{project.description}</p>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-[#3a3f47]">
                                         <div className="flex justify-between items-center text-sm text-slate-400">
                                            <div className="flex space-x-4">
                                                <Badge color="blue">Docs: {project.jobs_count}</Badge>
                                                <Badge color="green">Indexes: {project.indexes_count}</Badge>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span>{new Date(project.created_at).toLocaleDateString()}</span>
                                                <Button 
                                                    variant="danger" 
                                                    iconOnly 
                                                    onClick={(e) => handleDeleteClick(e, project)}
                                                    disabled={deleteProjectMutation.isPending}
                                                    aria-label={`Delete project ${project.name}`}
                                                >
                                                    <TrashIcon />
                                                </Button>
                                            </div>
                                         </div>
                                    </div>
                                </Card>
                            </Link>
                        ))
                    ) : (
                        <Card className="md:col-span-2 lg:col-span-3">
                            <div className="text-center text-slate-500 py-8">
                                <h3 className="text-lg font-semibold">No Projects Found</h3>
                                <p className="mt-2">Get started by creating your first project.</p>
                            </div>
                        </Card>
                    )}
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">Project Name</label>
                            <Input id="name" type="text" {...register('name', { required: true })} />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                            <Textarea id="description" {...register('description', { required: true })} rows={3} />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={createProjectMutation.isPending}>
                            {createProjectMutation.isPending ? 'Creating...' : 'Create'}
                        </Button>
                    </div>
                </form>
            </Modal>

            <ConfirmationModal
                isOpen={!!projectToDelete}
                onClose={() => setProjectToDelete(null)}
                onConfirm={confirmDeleteProject}
                title={`Delete Project: ${projectToDelete?.name}?`}
                isConfirming={deleteProjectMutation.isPending && deleteProjectMutation.variables === projectToDelete?.id}
            >
                <p>Are you sure you want to delete this project? This will permanently delete all associated documents and indexes.</p>
                <p className="mt-2 font-semibold text-red-400">This action cannot be undone.</p>
            </ConfirmationModal>
        </div>
    );
};

export default Dashboard;