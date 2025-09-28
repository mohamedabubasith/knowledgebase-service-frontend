import { Project, ProjectJob, ProjectIndex, SearchResult } from '../types';

const API_BASE_URL = 'https://abubasith86-knowledgebase-service.hf.space';

// --- API Helper ---

async function handleResponse<T>(response: Response): Promise<T> {
    const json = await response.json();
    if (json.status === 'success') {
        return json.data;
    } else {
        throw new Error(json.error || 'An unknown API error occurred');
    }
}

// --- Data Mappers ---

const mapProjectFromApi = (apiProject: any): Project => ({
    id: apiProject.project_id,
    name: apiProject.name,
    description: apiProject.description,
    created_at: apiProject.created_at,
    jobs_count: apiProject.jobs_count,
    indexes_count: apiProject.indexes_count,
});

const mapJobFromApi = (apiJob: any): ProjectJob => ({
    ...apiJob,
    status: apiJob.status?.toLowerCase() ?? 'failed',
    type: apiJob.type?.toLowerCase() === 'file' ? 'pdf' : (apiJob.type?.toLowerCase() ?? 'manual'),
});

const mapIndexFromApi = (apiIndex: any): ProjectIndex => {
    const status = apiIndex.status?.toLowerCase() ?? 'created';
    let finalStatus: ProjectIndex['status'] = 'created';

    const validStatuses: Array<ProjectIndex['status']> = ['synced', 'syncing', 'failed', 'created', 'sync_failed'];
    if (validStatuses.includes(status)) {
        finalStatus = status;
    }
    
    if (status === 'failed' && apiIndex.sync_error) {
        finalStatus = 'sync_failed';
    }

    return {
        ...apiIndex,
        status: finalStatus
    };
};

// --- Project Management ---

export const getProjects = async (): Promise<Project[]> => {
    const response = await fetch(`${API_BASE_URL}/api/projects/`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await handleResponse<any[]>(response);
    return data.map(mapProjectFromApi);
};

export const createProject = async (newProjectData: { name: string; description: string }): Promise<Project> => {
    const response = await fetch(`${API_BASE_URL}/api/projects/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProjectData),
    });
     if (!response.ok) throw new Error('Network response was not ok');
    const data = await handleResponse<any>(response);
    return mapProjectFromApi(data);
};

export const getProject = async (projectId: string): Promise<Project | undefined> => {
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`);
     if (!response.ok) return undefined; // Handle 404s gracefully
    const data = await handleResponse<any>(response);
    return mapProjectFromApi(data);
};

export const deleteProject = async (projectId: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete project');
    return handleResponse<any>(response);
};

// --- Project Details ---

export const getProjectJobs = async (projectId: string): Promise<ProjectJob[]> => {
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/jobs`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await handleResponse<{ jobs: any[] }>(response);
    return (data.jobs || []).map(mapJobFromApi);
};

export const getProjectIndexes = async (projectId: string): Promise<ProjectIndex[]> => {
    const response = await fetch(`${API_BASE_URL}/api/indexes/${projectId}/`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await handleResponse<{ indexes: any[] }>(response);
    return (data.indexes || []).map(mapIndexFromApi);
};

// --- Document/Job Management ---

export const uploadPdf = async (projectId: string, formData: FormData): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/documents/${projectId}/upload`, {
        method: 'POST',
        body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload PDF');
    return handleResponse<any>(response);
};

export const scrapeUrl = async (data: { projectId: string; url: string }): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/documents/scrap-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: data.projectId, url: data.url }),
    });
    if (!response.ok) throw new Error('Failed to scrape URL');
    return handleResponse<any>(response);
};

export const addManualContent = async (data: { projectId: string; title: string; content: string }): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/documents/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: data.projectId, title: data.title, content: data.content }),
    });
    if (!response.ok) throw new Error('Failed to add manual content');
    return handleResponse<any>(response);
};

export const getJobContent = async (jobId: string): Promise<{ content: string }> => {
    const response = await fetch(`${API_BASE_URL}/api/documents/jobs/${jobId}/content`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await handleResponse<{ content: string }>(response);
    return { content: data.content };
};

export const deleteJob = async (jobId: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/documents/jobs/${jobId}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete job');
    return handleResponse<any>(response);
};

// --- Index Management ---

export const createIndex = async (data: { projectId: string; name: string; description: string, job_ids: string[] }): Promise<ProjectIndex> => {
    const { projectId, ...bodyData } = data;
    const response = await fetch(`${API_BASE_URL}/api/indexes/${projectId}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
    });
    if (!response.ok) throw new Error('Failed to create index');
    return handleResponse<ProjectIndex>(response);
};

export const syncIndex = async (data: { indexId: string; embedding_model: string; chunk_ratio: number; overlap_ratio: number; }): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/indexes/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            index_id: data.indexId,
            embedding_model: data.embedding_model,
            chunk_ratio: data.chunk_ratio,
            overlap_ratio: data.overlap_ratio
        }),
    });
    if (!response.ok) throw new Error('Failed to start sync');
    return handleResponse<any>(response);
};

export const queryIndex = async (data: { indexId: string; query: string; top_k?: number }): Promise<SearchResult[]> => {
    const response = await fetch(`${API_BASE_URL}/api/indexes/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index_id: data.indexId, query: data.query, top_k: data.top_k || 5 }),
    });
    if (!response.ok) throw new Error('Failed to query index');
    const responseData = await handleResponse<{ results: SearchResult[] }>(response);
    return responseData.results || [];
};

export const deleteIndex = async (indexId: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/indexes/${indexId}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete index');
    return handleResponse<any>(response);
};