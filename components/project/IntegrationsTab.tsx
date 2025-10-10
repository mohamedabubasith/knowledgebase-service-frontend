import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProjectIndexes } from '../../services/api';
import { ProjectIndex } from '../../types';
import { Spinner, Card, Button, useNotification, CopyIcon, CheckIcon } from '../ui';

const API_BASE_URL = 'https://abubasith86-knowledgebase-service.hf.space';
const QUERY_ENDPOINT = `${API_BASE_URL}/api/indexes/query`;

const CodeSnippet: React.FC<{ code: string }> = ({ code }) => {
    const { addNotification } = useNotification();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        addNotification('Copied to clipboard!', 'success');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-[#1a1d21] rounded-md p-4 relative font-mono text-sm border border-[#3a3f47]">
            <pre className="whitespace-pre-wrap text-slate-300 overflow-x-auto">
                <code>{code}</code>
            </pre>
            <Button
                variant="secondary"
                iconOnly
                onClick={handleCopy}
                className="absolute top-2 right-2"
                aria-label="Copy code"
            >
                {copied ? <CheckIcon /> : <CopyIcon />}
            </Button>
        </div>
    );
};


export const IntegrationsTab: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const [selectedIndexId, setSelectedIndexId] = useState<string>('');

    const { data: indexes, isLoading } = useQuery<ProjectIndex[], Error>({
        queryKey: ['indexes', projectId],
        queryFn: () => getProjectIndexes(projectId!),
        enabled: !!projectId,
    });

    const syncedIndexes = useMemo(() => {
        return (indexes || []).filter(index => index.status === 'synced');
    }, [indexes]);

    const selectedIndex = useMemo(() => {
        return syncedIndexes.find(index => index.id === selectedIndexId);
    }, [syncedIndexes, selectedIndexId]);

    const curlSnippet = `curl -X POST "${QUERY_ENDPOINT}" \\
-H "Content-Type: application/json" \\
-d '{
  "index_id": "${selectedIndex?.id || '<YOUR_INDEX_ID>'}",
  "query": "Your question here",
  "top_k": 5
}'`;

    const jsSnippet = `fetch('${QUERY_ENDPOINT}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    index_id: '${selectedIndex?.id || '<YOUR_INDEX_ID>'}',
    query: 'Your question here',
    top_k: 5
  }),
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`;


    if (isLoading) {
        return <div className="flex justify-center py-12"><Spinner /></div>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <h2 className="text-2xl font-bold text-slate-100">Integrations & API Access</h2>
                <p className="mt-2 text-slate-400">
                    Use your synced indexes in external applications by querying the API endpoint.
                    Select a synced index below to get started.
                </p>
            </Card>

            {syncedIndexes.length === 0 ? (
                <Card>
                    <div className="text-center text-slate-500 py-8">
                        <h3 className="text-lg font-semibold">No Synced Indexes Found</h3>
                        <p className="mt-2">You must create and successfully sync an index before you can use the API.</p>
                    </div>
                </Card>
            ) : (
                <Card>
                    <div className="max-w-md">
                        <label htmlFor="index-select" className="block text-sm font-medium text-slate-300 mb-2">
                            Select a Synced Index
                        </label>
                        <select
                            id="index-select"
                            value={selectedIndexId}
                            onChange={(e) => setSelectedIndexId(e.target.value)}
                            className="block w-full px-3 py-2 bg-[#1a1d21] border border-[#3a3f47] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#76b900] focus:border-transparent text-slate-200"
                        >
                            <option value="" disabled>-- Choose an index --</option>
                            {syncedIndexes.map(index => (
                                <option key={index.id} value={index.id}>
                                    {index.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </Card>
            )}

            {selectedIndex && (
                 <Card>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-200">API Endpoint</h3>
                            <p className="text-sm text-slate-400">Method: <span className="font-semibold text-slate-300 px-2 py-0.5 bg-blue-900/50 rounded">POST</span></p>
                            <div className="mt-2">
                                <CodeSnippet code={QUERY_ENDPOINT} />
                            </div>
                        </div>

                         <div>
                            <h3 className="text-lg font-semibold text-slate-200">Request Body (JSON)</h3>
                            <CodeSnippet code={JSON.stringify({
                                index_id: selectedIndex.id,
                                query: "Your question here",
                                top_k: 5
                            }, null, 2)} />
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-semibold text-slate-200">cURL Example</h3>
                            <CodeSnippet code={curlSnippet} />
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-slate-200">JavaScript (fetch) Example</h3>
                            <CodeSnippet code={jsSnippet} />
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};
