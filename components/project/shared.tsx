import React from 'react';
import { Badge, Spinner, CheckIcon, XCircleIcon } from '../ui';
import { ProjectJob, ProjectIndex } from '../../types';


export const JobStatusBadge: React.FC<{ status: ProjectJob['status'] }> = ({ status }) => {
    const statusConfig = {
        completed: { text: 'Completed', color: 'green' as const, icon: <CheckIcon className="w-3.5 h-3.5" /> },
        parsing: { text: 'Parsing', color: 'yellow' as const, icon: <Spinner className="!h-3 !w-3 border-slate-300" /> },
        processing: { text: 'Processing', color: 'blue' as const, icon: <Spinner className="!h-3 !w-3 border-slate-300" /> },
        failed: { text: 'Failed', color: 'red' as const, icon: <XCircleIcon className="w-3.5 h-3.5" /> },
    };

    const config = statusConfig[status];
    
    if (!config) {
        return <Badge color="gray">{status}</Badge>;
    }
    
    return (
        <Badge color={config.color}>
            {config.icon}
            {config.text}
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