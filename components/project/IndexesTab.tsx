import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
    getProjectJobs,
    getProjectIndexes,
    createIndex,
    syncIndex,
    queryIndex,
    deleteIndex
} from '../../services/api';
import { ProjectJob, ProjectIndex, SearchResult } from '../../types';
import {
    Spinner, Card, Button, Modal, useNotification, Textarea, Input,
    TrashIcon, SearchIcon, SyncIcon, ConfirmationModal,
    CalendarIcon, ChunksIcon, PlusIcon, FileTextIcon
} from '../ui';
import { IndexStatusBadge } from './shared';


type CreateIndexForm = {
    name: string;
    description: string;
    job_ids: string | string[];
};

type QueryForm = {
    query: string;
};

const CreateIndexModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    availableJobs: ProjectJob[];
}> = ({ isOpen, onClose, projectId, availableJobs }) => {
    const queryClient = useQueryClient();
    const { addNotification } = useNotification();
    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<CreateIndexForm>();

    const watchedJobIds = watch('job_ids');
    const selectedJobsCount = useMemo(() => {
        if (!watchedJobIds) return 0;
        if (typeof watchedJobIds === 'string') return 1;
        return Array.isArray(watchedJobIds) ? watchedJobIds.length : 0;
    }, [watchedJobIds]);
    
    const createMutation = useMutation({
        mutationFn: createIndex,
        onSuccess: () => {
            addNotification('Index created successfully. You can now sync it manually.', 'success');
            queryClient.invalidateQueries({ queryKey: ['indexes', projectId] });
            queryClient.invalidateQueries({ queryKey: ['project', projectId] });
            onClose();
        },
        onError: (error: Error) => { addNotification(`Index creation failed: ${error.message}`, 'error'); },
    });

    const onSubmit = (data: CreateIndexForm) => {
        const jobIdsAsArray = Array.isArray(data.job_ids) ? data.job_ids : (data.job_ids ? [data.job_ids] : []);
        const payload = {
            projectId,
            name: data.name,
            description: data.description,
            job_ids: jobIdsAsArray,
        };
        createMutation.mutate(payload);
    };

    React.useEffect(() => { if (!isOpen) reset(); }, [isOpen, reset]);

    const completedJobs = availableJobs.filter(job => job.status === 'completed');

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Index">
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="indexName" className="block text-sm font-medium text-slate-300 mb-1">Index Name</label>
                        <Input id="indexName" type="text" {...register('name', { required: 'Index name is required.' })} />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="indexDescription" className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                        <Textarea id="indexDescription" {...register('description', { required: 'Description is required.' })} rows={2} />
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Select Documents ({selectedJobsCount}/{completedJobs.length})</label>
                        <p className="text-xs text-slate-500 mb-2">Select 1 to 5 documents to include in this index.</p>
                        <Card className="max-h-60 overflow-y-auto p-4 bg-[#1a1d21] border border-[#3a3f47]">
                            {completedJobs.length > 0 ? completedJobs.map(job => (
                                <div key={job.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-[#2a2f35]">
                                    <input
                                        type="checkbox"
                                        id={`job-${job.id}`}
                                        value={job.id}
                                        {...register('job_ids', {
                                            required: 'Select at least one document.',
                                            validate: (value) => {
                                                const selected = Array.isArray(value) ? value : (value ? [value] : []);
                                                if (selected.length === 0) return 'Select at least one document.';
                                                if (selected.length > 5) return 'You can select up to 5 documents.';
                                                return true;
                                            }
                                        })}
                                        className="h-4 w-4 rounded border-gray-300 text-[#76b900] focus:ring-[#76b900]"
                                    />
                                    <label htmlFor={`job-${job.id}`} className="flex-grow text-sm text-slate-300">{job.filename}</label>
                                </div>
                            )) : <p className="text-slate-500 text-center py-4">No completed documents to select from.</p>}
                        </Card>
                         {errors.job_ids && <p className="text-red-500 text-sm mt-1">{errors.job_ids.message}</p>}
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={createMutation.isPending}>Cancel</Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                        {createMutation.isPending ? 'Creating...' : 'Create Index'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

const QueryIndexModal: React.FC<{ index: ProjectIndex | null, onClose: () => void }> = ({ index, onClose }) => {
    const { addNotification } = useNotification();
    const { register, handleSubmit, reset } = useForm<QueryForm>();
    const [results, setResults] = useState<SearchResult[]>([]);
    
    const queryMutation = useMutation({
        mutationFn: queryIndex,
        onSuccess: (data) => {
            setResults(data);
        },
        onError: (error: Error) => {
            addNotification(`Query failed: ${error.message}`, 'error');
        }
    });

    const onSubmit = (data: QueryForm) => {
        if (!index) return;
        queryMutation.mutate({ indexId: index.id, query: data.query });
    };

    React.useEffect(() => {
        if (!index) {
            reset();
            setResults([]);
        }
    }, [index, reset]);

    return (
        <Modal isOpen={!!index} onClose={onClose} title={`Query: ${index?.name}`}>
            <div className="space-y-4">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex gap-2">
                        <Input {...register('query', { required: true })} placeholder="Ask a question..." />
                        <Button type="submit" disabled={queryMutation.isPending}>
                            {queryMutation.isPending ? <Spinner /> : <SearchIcon />}
                        </Button>
                    </div>
                </form>
                <div className="max-h-[50vh] overflow-y-auto space-y-3 pr-2">
                    {queryMutation.isPending && <div className="flex justify-center p-4"><Spinner/></div>}
                    {results.length > 0 ? results.map((result, i) => (
                        <Card key={i} className="bg-[#1a1d21]/70">
                            <p className="text-slate-300">{result.text}</p>
                            <div className="text-xs text-slate-500 mt-2 flex justify-between">
                                <span>Source Doc ID: {result.document_source}</span>
                                <span className="font-semibold text-green-400">Score: {result.score.toFixed(2)}</span>
                            </div>
                        </Card>
                    )) : (
                        !queryMutation.isPending && <p className="text-slate-500 text-center pt-4">No results yet. Enter a query to begin.</p>
                    )}
                </div>
            </div>
        </Modal>
    );
};

const IndexList: React.FC<{ projectId: string }> = ({ projectId }) => {
    const queryClient = useQueryClient();
    const { addNotification } = useNotification();
    const [indexToDelete, setIndexToDelete] = useState<ProjectIndex | null>(null);
    const [indexToQuery, setIndexToQuery] = useState<ProjectIndex | null>(null);
    const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());

    const { data: indexes, isLoading, error } = useQuery<ProjectIndex[], Error>({
        queryKey: ['indexes', projectId],
        queryFn: () => getProjectIndexes(projectId),
        refetchInterval: (query) => {
            const data = query.state.data as ProjectIndex[] | undefined;
            // Only poll if an index is actively syncing.
            return data?.some(index => index.status === 'syncing') ? 6000 : false;
        },
        refetchIntervalInBackground: true,
    });

    const syncMutation = useMutation({
        mutationFn: syncIndex,
        onMutate: (variables) => {
            setSyncingIds(prev => new Set(prev).add(variables.indexId));
        },
        onSuccess: (data, variables) => {
            addNotification('Sync started successfully.', 'success');
            queryClient.invalidateQueries({ queryKey: ['indexes', projectId] });
        },
        onError: (error: Error, variables) => {
            addNotification(`Sync failed: ${error.message}`, 'error');
            setSyncingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(variables.indexId);
                return newSet;
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteIndex,
        onSuccess: () => {
            addNotification('Index deleted successfully.', 'success');
            queryClient.invalidateQueries({ queryKey: ['indexes', projectId] });
            queryClient.invalidateQueries({ queryKey: ['project', projectId] });
            setIndexToDelete(null);
        },
        onError: (error: Error) => { addNotification(`Deletion failed: ${error.message}`, 'error'); },
    });

    const handleSync = (index: ProjectIndex) => {
        syncMutation.mutate({
            indexId: index.id,
            embedding_model: "nvidia/llama-3.2-nv-embedqa-1b-v2",
            chunk_ratio: 0.8,
            overlap_ratio: 0.2
        });
    };

    return (
        <div className="mt-6">
            {isLoading && <div className="text-center p-8"><Spinner /></div>}
            {error && <div className="text-center p-8 text-red-500">{error.message}</div>}
            
            {indexes && indexes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {indexes.map(index => {
                        const isSyncing = index.status === 'syncing' || syncingIds.has(index.id);
                        const isSyncActionInProgress = syncMutation.isPending && syncMutation.variables?.indexId === index.id;
                        return (
                            <Card key={index.id} className="flex flex-col justify-between">
                                <div className="flex-grow">
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-lg font-bold text-slate-100 pr-2">{index.name}</h4>
                                        <IndexStatusBadge status={index.status} />
                                    </div>
                                    <p className="text-sm text-slate-400 mt-2 mb-4 min-h-[40px]">{index.description}</p>
                                    
                                    <div className="text-xs text-slate-500 space-y-2 border-t border-b border-[#3a3f47] py-3">
                                        <p className="flex items-center gap-2"><FileTextIcon /> {index.job_ids.length} Documents</p>
                                        <p className="flex items-center gap-2"><ChunksIcon className="w-4 h-4" /> {index.chunks_count || 0} Chunks</p>
                                        <p className="flex items-center gap-2"><CalendarIcon className="w-4 h-4" /> Created: {new Date(index.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                                    {index.status === 'created' && (
                                        <Button className="flex-1" onClick={() => handleSync(index)} disabled={isSyncActionInProgress}>
                                            {isSyncActionInProgress ? <SyncIcon spinning={true} /> : <><SyncIcon spinning={false} /><span className="ml-2">Start Sync</span></>}
                                        </Button>
                                    )}
                                    {index.status === 'syncing' && <Button className="flex-1" disabled><SyncIcon spinning={true}/> <span className="ml-2">Syncing...</span></Button>}
                                    {index.status === 'synced' && <Button className="flex-1" onClick={() => setIndexToQuery(index)}><SearchIcon /> <span className="ml-2">Query Index</span></Button>}
                                    {index.status === 'sync_failed' && (
                                        <Button className="flex-1" onClick={() => handleSync(index)} disabled={isSyncActionInProgress}>
                                             {isSyncActionInProgress ? <SyncIcon spinning={true} /> : <><SyncIcon spinning={false} /><span className="ml-2">Retry Sync</span></>}
                                        </Button>
                                    )}
                                    
                                    <Button variant="danger" iconOnly onClick={() => setIndexToDelete(index)} disabled={deleteMutation.isPending && deleteMutation.variables === index.id}><TrashIcon /></Button>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            ) : (
                !isLoading && (
                    <Card>
                        <div className="text-center text-slate-500 py-8">
                            <h3 className="text-lg font-semibold">No Indexes Found</h3>
                            <p className="mt-2">Create an index to start querying your documents.</p>
                        </div>
                    </Card>
                )
            )}

            <QueryIndexModal index={indexToQuery} onClose={() => setIndexToQuery(null)} />
             <ConfirmationModal
                isOpen={!!indexToDelete}
                onClose={() => setIndexToDelete(null)}
                onConfirm={() => indexToDelete && deleteMutation.mutate(indexToDelete.id)}
                title={`Delete index: ${indexToDelete?.name}?`}
                isConfirming={deleteMutation.isPending}
            >
                Are you sure you want to delete this index? This action cannot be undone.
            </ConfirmationModal>
        </div>
    );
};

export const IndexesTab: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { data: jobs, isLoading: isLoadingJobs } = useQuery<ProjectJob[], Error>({
        queryKey: ['jobs', projectId],
        queryFn: () => getProjectJobs(projectId),
    });

    if (!projectId) return <div>Project not found.</div>;
    
    return (
        <div>
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-slate-100">Indexes</h3>
                <Button onClick={() => setIsCreateModalOpen(true)} disabled={isLoadingJobs}>
                    <PlusIcon /> <span className="ml-2">Create Index</span>
                </Button>
            </div>
            
            <IndexList projectId={projectId} />

            <CreateIndexModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                projectId={projectId}
                availableJobs={jobs || []}
            />
        </div>
    );
};