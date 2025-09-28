// FIX: Removed self-import of `Project` which was causing a name conflict.
export interface Project {
    id: string;
    name: string;
    description: string;
    created_at: string;
    jobs_count: number;
    indexes_count: number;
}

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
    id: number;
    message: string;
    type: NotificationType;
}

export interface ProjectJob {
    id: string;
    project_id: string;
    filename: string;
    status: 'completed' | 'parsing' | 'failed' | 'processing';
    file_size: number;
    type: 'web' | 'pdf' | 'manual';
    markdown_size: number;
    error: string | null;
    created_at: string;
    updated_at: string;
}

export interface ProjectIndex {
    id: string;
    project_id: string;
    name: string;
    description: string;
    job_ids: string[];
    status: 'synced' | 'syncing' | 'failed' | 'created' | 'sync_failed';
    synced: boolean;
    embedding_model: string;
    chunks_count: number;
    embedding_dimension: number;
    sync_started_at: string | null;
    sync_completed_at: string | null;
    sync_failed_at: string | null;
    sync_error: string | null;
    created_at: string;
    updated_at: string;
}

export interface SearchResult {
    score: number;
    text: string;
    document_source: string;
}