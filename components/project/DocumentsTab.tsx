import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
    getProjectJobs,
    uploadPdf,
    scrapeUrl,
    addManualContent,
    getJobContent,
    deleteJob
} from '../../services/api';
import { ProjectJob } from '../../types';
import {
    Spinner, Card, NavigationTabs, Button, Modal, useNotification, Textarea, Input,
    TrashIcon, ViewIcon, ManualIcon, ConfirmationModal, FileTextIcon, BrowserIcon
} from '../ui';
import { JobStatusBadge } from './shared';


const DocumentUpload: React.FC<{ projectId: string }> = ({ projectId }) => {
    const [isDragging, setIsDragging] = useState(false);
    const queryClient = useQueryClient();
    const { addNotification } = useNotification();

    const mutation = useMutation({
        mutationFn: (formData: FormData) => uploadPdf(projectId, formData),
        onSuccess: () => {
            addNotification('PDF uploaded successfully. Processing started.', 'success');
            queryClient.invalidateQueries({ queryKey: ['jobs', projectId] });
        },
        onError: (error: Error) => {
            addNotification(`Upload failed: ${error.message}`, 'error');
        },
    });

    const handleFileChange = (files: FileList | null) => {
        if (files && files.length > 0) {
            const formData = new FormData();
            formData.append('file', files[0]);
            mutation.mutate(formData);
        }
    };
    
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileChange(e.dataTransfer.files);
            e.dataTransfer.clearData();
        }
    };

    return (
        <Card className="h-full">
            <h3 className="text-lg font-semibold mb-4 text-slate-100">Upload PDF</h3>
            <div
                onDrop={handleDrop} onDragOver={handleDragOver} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragging ? 'border-[#76b900] bg-[#76b900]/10' : 'border-[#3a3f47] hover:border-[#76b900]/50'
                }`}
            >
                <input id="file-upload" type="file" accept=".pdf" className="hidden" onChange={(e) => handleFileChange(e.target.files)} disabled={mutation.isPending} />
                <label htmlFor="file-upload" className="cursor-pointer">
                    <p className="text-slate-400">{isDragging ? "Drop the file here" : "Drag & drop a PDF here, or click to select"}</p>
                </label>
            </div>
            {mutation.isPending && <div className="mt-4 flex items-center justify-center space-x-2 text-slate-300"><Spinner /><p>Uploading...</p></div>}
        </Card>
    );
};

const WebScraper: React.FC<{ projectId: string }> = ({ projectId }) => {
    const queryClient = useQueryClient();
    const { addNotification } = useNotification();
    const { register, handleSubmit, reset, formState: { errors } } = useForm<{ url: string }>();
    
    const mutation = useMutation({
        mutationFn: (url: string) => scrapeUrl({ projectId, url }),
        onSuccess: () => {
            addNotification('Scraping started successfully.', 'success');
            queryClient.invalidateQueries({ queryKey: ['jobs', projectId] });
            reset();
        },
        onError: (error: Error) => { addNotification(`Scraping failed: ${error.message}`, 'error'); },
    });

    const onSubmit = (data: { url: string }) => mutation.mutate(data.url);

    return (
        <Card className="h-full">
            <h3 className="text-lg font-semibold mb-4 text-slate-100">Scrape Website</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div>
                    <Input type="url" placeholder="https://example.com" {...register('url', { required: 'URL is required' })} />
                    {errors.url && <p className="text-red-500 text-sm mt-1">{errors.url.message}</p>}
                </div>
                <Button type="submit" disabled={mutation.isPending} className="w-full">{mutation.isPending ? 'Scraping...' : 'Scrape'}</Button>
            </form>
        </Card>
    );
};

const ManualContent: React.FC<{ projectId: string }> = ({ projectId }) => {
    const queryClient = useQueryClient();
    const { addNotification } = useNotification();
    const { register, handleSubmit, reset, formState: { errors } } = useForm<{ title: string; content: string }>();

    const mutation = useMutation({
        mutationFn: (data: { title: string; content: string }) => addManualContent({ projectId, ...data }),
        onSuccess: () => {
            addNotification('Content added successfully.', 'success');
            queryClient.invalidateQueries({ queryKey: ['jobs', projectId] });
            reset();
        },
        onError: (error: Error) => { addNotification(`Failed to add content: ${error.message}`, 'error'); },
    });

    const onSubmit = (data: { title: string; content: string }) => mutation.mutate(data);

    return (
        <Card className="h-full">
            <h3 className="text-lg font-semibold mb-4 text-slate-100">Add Manual Content</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div>
                    <Input type="text" placeholder="Title" {...register('title', { required: 'Title is required' })} />
                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                </div>
                <div>
                    <Textarea placeholder="Content..." {...register('content', { required: 'Content is required' })} rows={3} />
                    {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
                </div>
                <Button type="submit" disabled={mutation.isPending} className="w-full">{mutation.isPending ? 'Adding...' : 'Add Content'}</Button>
            </form>
        </Card>
    );
};

const ViewContentModal: React.FC<{ job: ProjectJob | null; onClose: () => void }> = ({ job, onClose }) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['jobContent', job?.id],
        queryFn: () => getJobContent(job!.id),
        enabled: !!job,
    });

    return (
        <Modal isOpen={!!job} onClose={onClose} title={job?.filename || 'Document Content'}>
            {isLoading && <div className="flex justify-center p-8"><Spinner /></div>}
            {error && <p className="text-red-400">Error fetching content: {(error as Error).message}</p>}
            {data && (
                <div className="prose prose-invert max-w-none bg-[#1a1d21] p-4 rounded-md max-h-[60vh] overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-slate-300">{data.content}</pre>
                </div>
            )}
        </Modal>
    );
};

const DocumentList: React.FC<{ projectId: string }> = ({ projectId }) => {
    const queryClient = useQueryClient();
    const { addNotification } = useNotification();
    const [jobToView, setJobToView] = useState<ProjectJob | null>(null);
    const [jobToDelete, setJobToDelete] = useState<ProjectJob | null>(null);

    const { data: jobs, isLoading, error } = useQuery<ProjectJob[], Error>({ 
        queryKey: ['jobs', projectId], 
        queryFn: () => getProjectJobs(projectId),
        refetchInterval: (query) => {
            const data = query.state.data as ProjectJob[] | undefined;
            if (data?.some(job => job.status === 'parsing' || job.status === 'processing')) {
                return 6000;
            }
            return false; // Stop polling if no jobs are processing
        },
        refetchIntervalInBackground: true,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteJob,
        onSuccess: () => {
            addNotification('Document deleted successfully.', 'success');
            queryClient.invalidateQueries({ queryKey: ['jobs', projectId] });
            setJobToDelete(null);
        },
        onError: (error: Error) => { addNotification(`Deletion failed: ${error.message}`, 'error'); },
    });
    
    const getIconForType = (type: ProjectJob['type']) => {
        if (type === 'pdf') return <FileTextIcon />;
        if (type === 'web') return <BrowserIcon />;
        return <ManualIcon />;
    };
    
    return (
        <Card>
            <h3 className="text-lg font-semibold mb-4 text-slate-100">Documents</h3>
            <div className="space-y-3">
                {isLoading && <div className="text-center p-8"><Spinner /></div>}
                {error && <div className="text-center p-8 text-red-500">{error.message}</div>}
                {jobs && jobs.length > 0 ? jobs.map(job => (
                    <div key={job.id} className="bg-[#2a2f35]/70 border border-[#3a3f47] rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-600 transition-colors">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <span className="text-slate-500">{getIconForType(job.type)}</span>
                            <div className="flex-1">
                                <p className="font-medium text-slate-200 break-all">{job.filename}</p>
                                <p className="text-xs text-slate-500">
                                    {new Date(job.created_at).toLocaleDateString()}
                                    {job.file_size ? ` - ${(job.file_size / 1024).toFixed(2)} KB` : ''}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 self-end sm:self-center">
                             {job.status === 'failed' && job.error ? (
                                <div className="relative group">
                                    <JobStatusBadge status={job.status} />
                                    <div className="absolute bottom-full left-1/2 z-10 mb-2 w-64 -translate-x-1/2 transform rounded-lg bg-slate-900 p-3 text-sm text-slate-300 shadow-lg opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none border border-slate-700">
                                        <p className="font-bold text-red-400">Processing Failed</p>
                                        <p className="mt-1">{job.error}</p>
                                    </div>
                                </div>
                            ) : (
                                <JobStatusBadge status={job.status} />
                            )}
                             <div className="flex items-center gap-2">
                                <Button variant="secondary" iconOnly onClick={() => setJobToView(job)} disabled={job.status !== 'completed'} aria-label="View Content"><ViewIcon /></Button>
                                <Button variant="danger" iconOnly onClick={() => setJobToDelete(job)} disabled={deleteMutation.isPending && deleteMutation.variables === job.id} aria-label="Delete Document"><TrashIcon /></Button>
                             </div>
                        </div>
                    </div>
                )) : (
                   !isLoading && <div className="text-center p-8 text-slate-500">No documents added yet.</div>
                )}
            </div>
            <ViewContentModal job={jobToView} onClose={() => setJobToView(null)} />
            <ConfirmationModal
                isOpen={!!jobToDelete}
                onClose={() => setJobToDelete(null)}
                onConfirm={() => jobToDelete && deleteMutation.mutate(jobToDelete.id)}
                title={`Delete ${jobToDelete?.filename}?`}
                isConfirming={deleteMutation.isPending}
            >
                Are you sure you want to delete this document? This action cannot be undone.
            </ConfirmationModal>
        </Card>
    );
};

export const DocumentsTab: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    if (!projectId) return <div>Project not found.</div>;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <DocumentUpload projectId={projectId} />
                <WebScraper projectId={projectId} />
                <ManualContent projectId={projectId} />
            </div>
            <DocumentList projectId={projectId} />
        </div>
    );
};
