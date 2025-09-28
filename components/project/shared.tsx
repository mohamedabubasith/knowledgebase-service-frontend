import React from 'react';
import { Badge, Spinner } from '../ui';
import { ProjectJob, ProjectIndex } from '../../types';


export const JobStatusBadge: React.FC<{ status: ProjectJob['status'] }> = ({ status }) => {
    const isProcessing = status === 'parsing' || status === 'processing';
    const statusMap: Record<ProjectJob['status'], { text: string; color: 'green' | 'yellow' | 'red' | 'blue' }> = {
        completed: { text: 'Completed', color: 'green' },
        parsing: { text: 'Parsing', color: 'yellow' },
        processing: { text: 'Processing', color: 'blue' },
        failed: { text: 'Failed', color: 'red' },
    };
    const { text, color } = statusMap[status] || { text: status, color: 'gray' as 'green' };
    return (
        <Badge color={color}>
            <span className="flex items-center gap-1.5">
                {isProcessing && <Spinner className="!h-3 !w-3 border-slate-300" />}
                {text}
            </span>
        </Badge>
    );
};

export const IndexStatusBadge: React.FC<{ status: ProjectIndex['status'] }> = ({ status }) => {
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