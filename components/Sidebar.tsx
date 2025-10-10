import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, NavLink, useParams } from 'react-router-dom';
import { getProject } from '../services/api';
import { Button, XIcon, FolderIcon, CpuChipIcon, PuzzlePieceIcon, ChevronUpDownIcon } from './ui';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
    const { projectId } = useParams<{ projectId: string }>();

    const { data: project } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => getProject(projectId!),
        enabled: !!projectId,
    });

    const navLinks = [
        { name: 'Documents', to: `/projects/${projectId}/documents`, icon: <FolderIcon /> },
        { name: 'Indexes', to: `/projects/${projectId}/indexes`, icon: <CpuChipIcon /> },
        { name: 'Integrations', to: `/projects/${projectId}/integrations`, icon: <PuzzlePieceIcon /> },
    ];

    const content = (
        <div className="flex flex-col h-full bg-[#1f2328] text-slate-300">
            {/* Header */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-[#3a3f47] flex-shrink-0">
                 <Link to="/" className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-[#76b900] rounded-md flex items-center justify-center text-black font-extrabold text-lg">K</span>
                    <h1 className="text-lg font-bold text-slate-100 whitespace-nowrap">Knowledge AI</h1>
                </Link>
                <Button variant="secondary" iconOnly onClick={() => setIsOpen(false)} className="md:hidden" aria-label="Close sidebar">
                    <XIcon />
                </Button>
            </div>

            {/* Main Navigation Area */}
            <div className="flex flex-col flex-grow overflow-y-auto">
                <div className="p-4">
                    <Link
                        to="/"
                        className="flex items-center justify-between w-full p-2 text-sm font-semibold text-left bg-[#2a2f35] rounded-md hover:bg-[#3a3f47] transition-colors"
                        aria-label="Back to all projects"
                    >
                         <div className="flex items-center gap-3 truncate">
                            <span className="flex-shrink-0 w-6 h-6 rounded-md bg-slate-600 flex items-center justify-center font-bold text-xs">
                                {project?.name?.charAt(0) || ''}
                            </span>
                            <span className="truncate">{project ? project.name : 'Loading project...'}</span>
                        </div>
                        <ChevronUpDownIcon />
                    </Link>
                </div>
                
                {/* Links */}
                <nav className="flex-1 px-4 pb-4 space-y-4">
                    <div>
                         <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Manage</h3>
                         <div className="mt-2 space-y-1">
                             {navLinks.map(link => (
                                <NavLink
                                    key={link.name}
                                    to={link.to}
                                    onClick={() => setIsOpen(false)}
                                    className={({ isActive }) =>
                                        `group flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                            isActive
                                                ? 'bg-slate-700/50 text-white'
                                                : 'text-slate-400 hover:bg-[#3a3f47] hover:text-white'
                                        }`
                                    }
                                >
                                    {link.icon}
                                    <span>{link.name}</span>
                                </NavLink>
                            ))}
                        </div>
                    </div>
                </nav>
            </div>
        </div>
    );

    return (
        <>
            <div className={`fixed inset-0 bg-black/60 z-30 md:hidden ${isOpen ? 'block' : 'hidden'}`} onClick={() => setIsOpen(false)}></div>
            <aside className={`fixed top-0 left-0 w-64 h-full z-40 transform transition-transform md:relative md:translate-x-0 border-r border-[#3a3f47] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {content}
            </aside>
        </>
    );
};

export default Sidebar;