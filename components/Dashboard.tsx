import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { getProjects, createProject } from '../services/api';
import { Project } from '../types';
import { Card, Button, PlusIcon, Spinner, Modal, Input, Textarea, useNotification, DocumentIcon, DatabaseIcon } from './ui';

type CreateProjectForm = {
    name: string;
    description: string;
};

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => (
    <Link to={`/projects/${project.id}`} className="block h-full">
        <Card className="hover:border-[#76b900]/80 transition-colors h-full flex flex-col justify-between group">
            <div>
                <h3 className="text-lg font-bold text-slate-100 group-hover:text-[#82cc00] transition-colors">{project.name}</h3>
                <p className="text-sm text-slate-400 mt-2 min-h-[40px]">{project.description}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-[#3a3f47] flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                    <DocumentIcon className="w-4 h-4" />
                    <span>{project.jobs_count} Documents</span>
                </div>
                <div className="flex items-center gap-2">
                    <DatabaseIcon />
                    <span>{project.indexes_count} Indexes</span>
                </div>
            </div>
        </Card>
    </Link>
);


const Dashboard: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const queryClient = useQueryClient();
    const { addNotification } = useNotification();

    const { data: projects, isLoading, error } = useQuery<Project[], Error>({
        queryKey: ['projects'],
        queryFn: getProjects,
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
        },
    });

    const { register, handleSubmit, reset } = useForm<CreateProjectForm>();

    const onSubmit = (data: CreateProjectForm) => {
        createProjectMutation.mutate(data);
        reset();
    };

    return (
        <div className="min-h-screen bg-[#181a1d]">
            <main className="p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-100">Projects</h1>
                            <p className="text-slate-400 mt-1">Create and manage your knowledge bases.</p>
                        </div>
                        <Button onClick={() => setIsModalOpen(true)}>
                            <PlusIcon />
                            <span className="ml-2">Create Project</span>
                        </Button>
                    </div>

                    {isLoading && <div className="flex justify-center py-12"><Spinner /></div>}
                    {error && <div className="text-center p-8 text-red-500">{error.message}</div>}
                    
                    {projects && projects.length > 0 ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map(project => <ProjectCard key={project.id} project={project} />)}
                        </div>
                    ) : (
                        !isLoading && (
                             <Card>
                                <div className="text-center text-slate-500 py-12">
                                    <h3 className="text-xl font-semibold">No Projects Yet</h3>
                                    <p className="mt-2">Click "Create Project" to get started.</p>
                                </div>
                            </Card>
                        )
                    )}
                </div>
            </main>

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
        </div>
    );
};

export default Dashboard;