import React, { useState } from 'react';
import { useParams, Outlet, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { 
    getProject, 
    getProjectJobs, 
    getProjectIndexes,
    uploadPdf,
    scrapeUrl,
    addManualContent,
    getJobContent,
    deleteJob,
    createIndex,
    syncIndex,
    queryIndex,
    deleteIndex
} from '../services/api';
import { Project, ProjectJob, ProjectIndex, SearchResult } from '../types';
import { 
    Spinner, Card, Badge, NavigationTabs, Button, Modal, useNotification, Textarea, Input,
    TrashIcon, SearchIcon, SyncIcon, ViewIcon, DocumentIcon, WebIcon, ManualIcon
} from './ui';

// --- Reusable Badge Components ---

const JobStatusBadge: React.FC<{ status: ProjectJob['status'] }> = ({ status }) => {
    const statusMap: Record<ProjectJob['status'], { text: string; color: 'green' | 'yellow' | 'red' | 'blue' }> = {
        completed: { text: 'Completed', color: 'green' },
        parsing: { text: 'Parsing', color: 'yellow' },
        processing: { text: 'Processing', color: 'blue' },
        failed: { text: 'Failed', color: 'red' },
    };
    const { text, color } = statusMap[status] || { text: status, color: 'gray' as 'green' };
    return <Badge color={color}>{text}</Badge>;
};

const IndexStatusBadge: React.FC<{ status: ProjectIndex['status'] }> = ({ status }) => {
    const statusMap: Record<ProjectIndex['status'], { text: string; color: 'green' | 'yellow' | 'red' | 'blue' | 'gray' }> = {
        synced: { text: 'Synced', color: 'green' },
        syncing: { text: 'Syncing', color: 'blue' },
        sync_failed: { text: 'Sync Failed', color: 'red' },
        failed: { text: 'Failed', color: 'red' },
        created: { text: 'Created', color: 'gray' },
    };
    const { text, color } = statusMap[status] || { text: status, color: 'gray' };
    return <Badge color={color}>{text}</Badge>;
};

// --- Document Management Components (for DocumentsTab) ---

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
    const { register, handleSubmit, reset, formState: { errors } } = useForm<{ title: string, content: string }>();

    const mutation = useMutation({
        mutationFn: (data: { title: string, content: string }) => addManualContent({ projectId, ...data }),
        onSuccess: () => {
            addNotification('Content added successfully.', 'success');
            queryClient.invalidateQueries({ queryKey: ['jobs', projectId] });
            reset();
        },
        onError: (error: Error) => { addNotification(`Failed to add content: ${error.message}`, 'error'); },
    });
    
    const onSubmit = (data: { title: string, content: string }) => mutation.mutate(data);

    return (
        <Card className="h-full">
            <h3 className="text-lg font-semibold mb-4 text-slate-100">Manual Content</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div>
                     <Input type="text" placeholder="Title" {...register('title', { required: 'Title is required' })} />
                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                </div>
                <div>
                    <Textarea placeholder="Enter content here..." rows={3} {...register('content', { required: 'Content is required' })} />
                    {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
                </div>
                <Button type="submit" disabled={mutation.isPending} className="w-full">{mutation.isPending ? 'Saving...' : 'Save Content'}</Button>
            </form>
        </Card>
    );
};

const DocumentViewer: React.FC<{ jobId: string | null; isOpen: boolean; onClose: () => void }> = ({ jobId, isOpen, onClose }) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['jobContent', jobId],
        queryFn: () => getJobContent(jobId!),
        enabled: !!jobId,
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Document Content">
            {isLoading && <Spinner />}
            {error && <p className="text-red-500">Error fetching content: {error.message}</p>}
            {data && <pre className="whitespace-pre-wrap bg-[#1a1d21] p-4 rounded-md text-sm max-h-[60vh] overflow-y-auto text-slate-300">{data.content}</pre>}
        </Modal>
    );
};

const DocumentsList: React.FC<{ jobs: ProjectJob[]; onSelectView: (jobId: string) => void; }> = ({ jobs, onSelectView }) => {
    const { projectId } = useParams<{ projectId: string }>();
    const queryClient = useQueryClient();
    const { addNotification } = useNotification();
    
    const deleteMutation = useMutation({
        mutationFn: deleteJob,
        onSuccess: () => {
            addNotification('Document deleted.', 'success');
            queryClient.invalidateQueries({ queryKey: ['jobs', projectId] });
        },
        onError: (error: Error) => { addNotification(`Delete failed: ${error.message}`, 'error'); },
    });

    const handleDelete = (jobId: string) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            deleteMutation.mutate(jobId);
        }
    };
    
    const getTypeIcon = (type: ProjectJob['type']) => {
        const icons: Record<ProjectJob['type'], React.ReactNode> = {
            pdf: <DocumentIcon />,
            web: <WebIcon />,
            manual: <ManualIcon />
        };
        return icons[type] || null;
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold mt-8 mb-4 text-slate-100">Documents List</h3>
            {[...jobs].reverse().map(job => (
                <Card key={job.id}>
                    <div className="flex justify-between items-center flex-wrap gap-4">
                       <div className="flex-grow min-w-0 flex items-center gap-4">
                           <div className="text-slate-400">{getTypeIcon(job.type)}</div>
                            <div>
                                <p className="font-mono text-sm break-all text-slate-200">{job.filename}</p>
                                <div className="text-xs text-slate-500 mt-2">
                                    Added: {new Date(job.created_at).toLocaleString()}
                                </div>
                            </div>
                       </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                            <JobStatusBadge status={job.status} />
                            <Button variant="secondary" iconOnly onClick={() => onSelectView(job.id)}><ViewIcon /></Button>
                            <Button variant="danger" iconOnly onClick={() => handleDelete(job.id)} disabled={deleteMutation.isPending}><TrashIcon /></Button>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};


// --- Index Management Components (for IndexesTab) ---

const SearchInterface: React.FC<{ indexId: string }> = ({ indexId }) => {
    const [expandedResult, setExpandedResult] = useState<number | null>(null);
    const { register, handleSubmit } = useForm<{ query: string }>();
    const { addNotification } = useNotification();

    const searchMutation = useMutation({
        mutationFn: (query: string) => queryIndex({ indexId, query }),
        onError: (error: Error) => addNotification(`Search failed: ${error.message}`, 'error'),
    });

    const onSubmit = (data: { query: string }) => {
        searchMutation.mutate(data.query);
        setExpandedResult(null);
    };

    return (
        <div className="mt-4 pt-4 border-t border-[#3a3f47]">
            <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-2">
                <Input type="search" placeholder="Search this index..." {...register('query', { required: true })} />
                <Button type="submit" disabled={searchMutation.isPending}>
                    {searchMutation.isPending ? <Spinner /> : 'Search'}
                </Button>
            </form>

            {searchMutation.isError && <p className="text-red-500 mt-2">Error: {searchMutation.error.message}</p>}
            
            {searchMutation.data && (
                <div className="mt-4 space-y-3">
                    {(!Array.isArray(searchMutation.data) || searchMutation.data.length === 0) ? (
                        <p className="text-slate-500">No results found.</p>
                    ) : (
                        searchMutation.data.map((result, idx) => (
                            <div key={idx} className="p-3 border border-[#3a3f47] rounded-md bg-[#1a1d21]/50">
                                <div className="flex justify-between items-center">
                                    <p className="text-xs font-mono break-all text-slate-500">{result.document_source}</p>
                                    <Badge color="blue">Score: {result.score.toFixed(4)}</Badge>
                                </div>
                                <p className="mt-2 text-sm text-slate-300 cursor-pointer" onClick={() => setExpandedResult(expandedResult === idx ? null : idx)}>
                                    {expandedResult !== idx ? `${result.text.substring(0, 150)}...` : result.text}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

const IndexCard: React.FC<{ index: ProjectIndex }> = ({ index }) => {
    const { projectId } = useParams<{ projectId: string }>();
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const queryClient = useQueryClient();
    const { addNotification } = useNotification();

    const syncMutation = useMutation({
        mutationFn: () => syncIndex(index.id),
        onSuccess: () => {
            addNotification('Sync process started.', 'info');
            queryClient.invalidateQueries({ queryKey: ['indexes', projectId] });
        },
        onError: (error: Error) => addNotification(`Sync failed: ${error.message}`, 'error'),
    });

    const deleteMutation = useMutation({
        mutationFn: () => deleteIndex(index.id),
        onSuccess: () => {
            addNotification('Index deleted.', 'success');
            queryClient.invalidateQueries({ queryKey: ['indexes', projectId] });
        },
        onError: (error: Error) => addNotification(`Delete failed: ${error.message}`, 'error'),
    });

    return (
        <Card>
            <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-100">{index.name}</h3>
                    <p className="text-sm text-slate-400 mt-1">{index.description}</p>
                     <div className="mt-3 text-xs text-slate-500 flex items-center gap-4">
                        <span><strong>Documents:</strong> {index.job_ids.length}</span>
                        <span><strong>Chunks:</strong> {index.chunks_count}</span>
                    </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                    <IndexStatusBadge status={index.status} />
                    <Button variant="secondary" iconOnly onClick={() => setIsSearchVisible(!isSearchVisible)} disabled={index.status !== 'synced'}><SearchIcon /></Button>
                    <Button variant="danger" iconOnly onClick={() => { if(window.confirm('Delete this index?')) deleteMutation.mutate()}} disabled={deleteMutation.isPending}><TrashIcon /></Button>
                </div>
            </div>

            {index.status === 'created' && (
                <div className="mt-4 pt-4 border-t border-[#3a3f47] flex justify-end">
                    <Button onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending}>
                        {syncMutation.isPending ? <><SyncIcon /><span className="ml-2">Starting Sync...</span></> : 'Sync Now'}
                    </Button>
                </div>
            )}

            {index.status === 'sync_failed' && <p className="text-red-500 text-xs mt-2">Error: {index.sync_error}</p>}
            
            {isSearchVisible && <SearchInterface indexId={index.id} />}
        </Card>
    );
};

const CreateIndexModal: React.FC<{ isOpen: boolean; onClose: () => void; projectId: string; jobs: ProjectJob[] }> = ({ isOpen, onClose, projectId, jobs }) => {
    const queryClient = useQueryClient();
    const { addNotification } = useNotification();
    const { register, handleSubmit, watch, formState: { errors } } = useForm<{ name: string; description: string; job_ids: string[] }>();
    const selectedJobs = watch('job_ids') || [];

    const mutation = useMutation({
        mutationFn: (data: { name: string; description: string; job_ids: string[] }) => createIndex({ projectId, ...data }),
        onSuccess: () => {
            addNotification('Index created successfully.', 'success');
            queryClient.invalidateQueries({ queryKey: ['indexes', projectId] });
            onClose();
        },
        onError: (error: Error) => addNotification(`Failed to create index: ${error.message}`, 'error'),
    });

    const onSubmit = (data: { name: string; description: string; job_ids: string[] }) => mutation.mutate(data);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Index">
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Index Name</label>
                        <Input {...register('name', { required: 'Name is required' })} />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                        <Textarea {...register('description')} rows={2} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300">Select Documents ({selectedJobs.length}/5)</label>
                        <div className="mt-2 border border-[#3a3f47] rounded-md max-h-40 overflow-y-auto p-2 space-y-1 bg-[#1a1d21]">
                            {jobs.map(job => (
                                <div key={job.id}>
                                    <label className="flex items-center space-x-3 p-2 rounded hover:bg-slate-700/50 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            value={job.id}
                                            {...register('job_ids', { validate: value => (value && value.length > 5) ? 'Select up to 5 documents' : true })}
                                            className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-[#76b900] focus:ring-[#76b900]"
                                        />
                                        <span className="text-sm font-mono truncate text-slate-300">{job.filename}</span>
                                    </label>
                                </div>
                            ))}
                        </div>
                        {errors.job_ids && <p className="text-red-500 text-xs mt-1">{errors.job_ids.message}</p>}
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Creating...' : 'Create'}</Button>
                </div>
            </form>
        </Modal>
    );
};

// --- Tab Components ---

export const DocumentsTab: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const [viewingJobId, setViewingJobId] = useState<string | null>(null);

    const { data: jobs, isLoading, error } = useQuery<ProjectJob[], Error>({
        queryKey: ['jobs', projectId],
        queryFn: () => getProjectJobs(projectId!),
        enabled: !!projectId,
        refetchInterval: query => {
            const data = query.state.data;
            const needsPolling = data?.some(job => job.status === 'parsing' || job.status === 'processing');
            return needsPolling ? 2000 : false;
        },
    });

    return (
        <div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <DocumentUpload projectId={projectId!} />
                <WebScraper projectId={projectId!} />
                <ManualContent projectId={projectId!} />
            </div>

            {isLoading && <div className="flex justify-center mt-8"><Spinner /></div>}
            {error && <p className="text-red-500 text-center">Error fetching documents: {error.message}</p>}

            {jobs && (jobs.length > 0 ? <DocumentsList jobs={jobs} onSelectView={setViewingJobId} /> : 
                <Card><p className="text-slate-500 text-center py-4">No documents found. Add one above to get started.</p></Card>
            )}

            <DocumentViewer jobId={viewingJobId} isOpen={!!viewingJobId} onClose={() => setViewingJobId(null)} />
        </div>
    );
};


export const IndexesTab: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    
    const { data: indexes, isLoading, error } = useQuery<ProjectIndex[], Error>({
        queryKey: ['indexes', projectId],
        queryFn: () => getProjectIndexes(projectId!),
        enabled: !!projectId,
        refetchInterval: query => {
            const data = query.state.data;
            const needsPolling = data?.some(index => index.status === 'syncing');
            return needsPolling ? 3000 : false;
        },
    });

    const { data: jobs } = useQuery<ProjectJob[], Error>({
        queryKey: ['jobs', projectId],
        queryFn: () => getProjectJobs(projectId!),
        enabled: !!projectId,
    });

    const completedJobs = jobs?.filter(job => job.status === 'completed') || [];

    if (isLoading) return <div className="flex justify-center mt-8"><Spinner /></div>;
    if (error) return <p className="text-red-500 text-center">Error fetching indexes: {error.message}</p>;

    return (
        <div>
             <div className="flex justify-end mb-6">
                <Button onClick={() => setCreateModalOpen(true)}>Create Index</Button>
            </div>
            <div className="space-y-4">
                {indexes && indexes.length > 0 ? (
                     [...indexes].reverse().map(index => <IndexCard key={index.id} index={index} />)
                ) : (
                     <Card>
                        <p className="text-slate-500 text-center py-4">No indexes found. Create one to start searching.</p>
                    </Card>
                )}
            </div>
             <CreateIndexModal
                isOpen={isCreateModalOpen}
                onClose={() => setCreateModalOpen(false)}
                projectId={projectId!}
                jobs={completedJobs}
            />
        </div>
    );
};

// --- Main Page Layout ---

const ProjectPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();

    const { data: project, isLoading: isLoadingProject } = useQuery<Project | undefined, Error>({
        queryKey: ['project', projectId],
        queryFn: () => getProject(projectId!),
        enabled: !!projectId,
    });

    const tabs = [
        { name: 'Documents', to: `/projects/${projectId}/documents` },
        { name: 'Indexes', to: `/projects/${projectId}/indexes` },
    ];

    if (isLoadingProject) return <div className="flex justify-center mt-8"><Spinner /></div>;
    if (!project) return <p className="text-red-500 text-center mt-8">Project not found.</p>;

    return (
        <div>
             <div className="mb-4 text-sm text-slate-400">
                <Link to="/" className="hover:underline hover:text-[#76b900]">Projects</Link>
                <span className="mx-2">/</span>
                <span className="text-slate-200">{project.name}</span>
            </div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-100">{project.name}</h1>
                <p className="text-slate-400 mt-2">{project.description}</p>
            </div>

            <NavigationTabs tabs={tabs} />

            <div className="mt-6">
                <Outlet />
            </div>
        </div>
    );
};

export default ProjectPage;