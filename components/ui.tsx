// FIX: Corrected the React import to include necessary hooks and types.
import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Notification, NotificationType } from '../types';

// --- Icon Components ---
export const Icon: React.FC<{ path: string; className?: string }> = ({ path, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${className}`}>
        <path fillRule="evenodd" d={path} clipRule="evenodd" />
    </svg>
);
export const PlusIcon = () => <Icon path="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />;
export const SearchIcon = () => <Icon path="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" />;
export const SyncIcon: React.FC<{ spinning: boolean }> = ({ spinning }) => (
    <Icon path="M10 2a8 8 0 105.657 13.657l-1.414-1.414A6 6 0 1110 4V2z" className={spinning ? 'animate-spin' : ''} />
);
export const TrashIcon = () => <Icon path="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" />;
export const ViewIcon = () => <Icon path="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />;
export const DocumentIcon: React.FC<{ className?: string }> = ({ className }) => <Icon path="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm0 2h6v12H7V4z" className={className} />;
export const WebIcon = () => <Icon path="M10 2a8 8 0 100 16 8 8 0 000-16zM6.44 3.473a.75.75 0 011.113-.023L10 5.44l2.448-1.99a.75.75 0 011.09 1.135l-3 2.455a.75.75 0 01-1.09 0l-3-2.455a.75.75 0 01-.022-1.112zM3.05 8.25a.75.75 0 01.75-.75h12.5a.75.75 0 010 1.5H3.8a.75.75 0 01-.75-.75zm.5 4a.75.75 0 01.75-.75h11.5a.75.75 0 010 1.5H4.3a.75.75 0 01-.75-.75z" />;
export const ManualIcon = () => <Icon path="M13.586 3.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0l-1.5-1.5a2 2 0 012.828-2.828l1.5 1.5 3-3zM4.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L9 10.586l-2.293-2.293z"/>;
export const CalendarIcon: React.FC<{ className?: string }> = ({ className }) => <Icon path="M6 8v2h2V8H6zm3 0v2h2V8H9zm3 0v2h2V8h-2zM4 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H4zm12 1H4v2h12V4z" className={className} />;
export const ChunksIcon: React.FC<{ className?: string }> = ({ className }) => <Icon path="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 5a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V9zm0 5a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" className={className} />;
export const FileTextIcon = () => <Icon path="M9 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-3-3A1 1 0 0011.586 5H7zm2 8a1 1 0 11-2 0 1 1 0 012 0zm-2-4a1 1 0 011-1h2a1 1 0 110 2H8a1 1 0 01-1-1z" />;
export const DatabaseIcon = () => <Icon path="M3 12v3c0 1.657 4.03 3 9 3s9-1.343 9-3v-3c0 1.657-4.03 3-9 3s-9-1.343-9-3zM3 7v3c0 1.657 4.03 3 9 3s9-1.343 9-3V7c0 1.657-4.03 3-9 3S3 8.657 3 7zm9-5c-4.97 0-9 1.343-9 3s4.03 3 9 3 9-1.343 9-3-4.03-3-9-3z" />;
export const BrowserIcon = () => <Icon path="M3 4a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V4zm2-1h10a1 1 0 011 1v2H4V4a1 1 0 011-1zm-1 4h12v9a1 1 0 01-1 1H5a1 1 0 01-1-1V7zm4 2a1 1 0 100 2h4a1 1 0 100-2H8z" />;
export const CopyIcon = () => <Icon path="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H9zm6 2H9v8h6V4zM4 6a2 2 0 012-2h2v2H6v8H4V6z" />;
export const CheckIcon: React.FC<{ className?: string }> = ({ className }) => <Icon path="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" className={className} />;
export const EditIcon = () => <Icon path="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828zM5 14v-7a2 2 0 012-2h3.586l-2 2H7v7h7v-2.586l2-2V14a2 2 0 01-2 2H7a2 2 0 01-2-2z" />;
export const MenuIcon = () => <Icon path="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />;
export const XIcon = () => <Icon path="M6.293 6.293a1 1 0 011.414 0L10 8.586l2.293-2.293a1 1 0 111.414 1.414L11.414 10l2.293 2.293a1 1 0 01-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 10 6.293 7.707a1 1 0 010-1.414z" />;
export const XCircleIcon: React.FC<{ className?: string }> = ({ className }) => <Icon path="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" className={className} />;
export const FolderIcon = () => <Icon path="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />;
export const CpuChipIcon = () => <Icon path="M11 2a1 1 0 011 1v1h1a1 1 0 011 1v1h1a1 1 0 011 1v2a1 1 0 01-1 1h-1v1a1 1 0 01-1 1h-1v1a1 1 0 01-1 1H9a1 1 0 01-1-1v-1H7a1 1 0 01-1-1v-1H5a1 1 0 01-1-1V7a1 1 0 011-1h1V5a1 1 0 011-1h1V3a1 1 0 011-1h2zM9 8a1 1 0 100-2 1 1 0 000 2z" />;
export const PuzzlePieceIcon = () => <Icon path="M18 10a1 1 0 01-1 1h-1v1a1 1 0 01-2 0v-1a1 1 0 00-1-1H9v-2h2a1 1 0 001-1V7a1 1 0 012 0v1h1a1 1 0 011 1v1zM4 4a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 2v2H4V6h2zM4 12a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H4zm2 2v2H4v-2h2zm8-10a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V6a2 2 0 00-2-2h-2zm2 2v2h-2V6h2z" />;
export const ChevronUpDownIcon = () => <Icon path="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" />;


// --- Notification System ---
interface NotificationContextType { addNotification: (message: string, type: NotificationType) => void; }
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const addNotification = (message: string, type: NotificationType) => {
        setNotifications(prev => [...prev, { id: Date.now(), message, type }]);
    };
    const removeNotification = (id: number) => { setNotifications(prev => prev.filter(n => n.id !== id)); };

    return (
        <NotificationContext.Provider value={{ addNotification }}>
            {children}
            <ToastContainer notifications={notifications} removeNotification={removeNotification} />
        </NotificationContext.Provider>
    );
};
export const useNotification = () => { const context = useContext(NotificationContext); if (!context) throw new Error('useNotification must be used within a NotificationProvider'); return context; };

// --- Toast Components ---
const toastColors: Record<NotificationType, string> = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
};

const Toast: React.FC<{ notification: Notification; onDismiss: (id: number) => void }> = ({ notification, onDismiss }) => {
    useEffect(() => { const timer = setTimeout(() => onDismiss(notification.id), 5000); return () => clearTimeout(timer); }, [notification.id, onDismiss]);
    return (
        <div className={`flex items-center justify-between p-4 mb-4 text-white rounded-lg shadow-2xl ${toastColors[notification.type]} animate-fade-in-down`}>
            <span>{notification.message}</span>
            <button onClick={() => onDismiss(notification.id)} className="ml-4 font-bold opacity-70 hover:opacity-100">&times;</button>
        </div>
    );
};
const ToastContainer: React.FC<{ notifications: Notification[]; removeNotification: (id: number) => void }> = ({ notifications, removeNotification }) => (
    <div className="fixed top-5 right-5 z-50 w-full max-w-sm">{notifications.map(n => <Toast key={n.id} notification={n} onDismiss={removeNotification} />)}</div>
);

// --- Re-themed UI Components ---

export const Spinner: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`animate-spin rounded-full h-5 w-5 border-b-2 border-slate-200 ${className}`}></div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger', iconOnly?: boolean }> = ({ children, className, variant = 'primary', iconOnly = false, ...props }) => {
    const baseClasses = "inline-flex items-center justify-center font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#181a1d] disabled:opacity-50 disabled:cursor-not-allowed";
    const sizeClasses = iconOnly ? "p-2 rounded-md" : "px-4 py-2 rounded-md";
    const variantClasses = {
        primary: 'bg-[#76b900] text-black hover:bg-[#82cc00] focus:ring-[#76b900]',
        secondary: 'bg-[#3a3f47] text-slate-200 hover:bg-[#4a5058] focus:ring-slate-400',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
    };
    return (<button className={`${baseClasses} ${sizeClasses} ${variantClasses[variant]} ${className}`} {...props}>{children}</button>);
};

export const Card: React.FC<{ children: ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`bg-[#2a2f35]/60 rounded-lg border border-[#3a3f47] p-6 ${className}`}>{children}</div>
);

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-40 flex justify-center items-center backdrop-blur-sm" onClick={onClose}>
            <div className="bg-[#2a2f35] border border-[#3a3f47] rounded-lg shadow-xl p-6 w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-100">{title}</h2>
                    <button onClick={onClose} className="text-2xl font-light text-slate-400 hover:text-white">&times;</button>
                </div>
                {children}
            </div>
        </div>
    );
};

export const Badge: React.FC<{ children: ReactNode; color: 'blue' | 'green' | 'yellow' | 'red' | 'gray' }> = ({ children, color }) => {
    const colorClasses = {
        blue: 'bg-blue-900/50 text-blue-300 border-blue-700/50',
        green: 'bg-green-900/50 text-green-300 border-green-700/50',
        yellow: 'bg-yellow-900/50 text-yellow-300 border-yellow-700/50',
        red: 'bg-red-900/50 text-red-300 border-red-700/50',
        gray: 'bg-slate-700/50 text-slate-300 border-slate-600/50'
    };
    return (<div className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${colorClasses[color]}`}>{children}</div>);
};

const formElementClasses = "block w-full px-3 py-2 bg-[#1a1d21] border border-[#3a3f47] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#76b900] focus:border-transparent text-slate-200";

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => (
    <input className={`${formElementClasses} ${className}`} {...props} />
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className, ...props }) => (
    <textarea className={`${formElementClasses} ${className}`} {...props} />
);

export const NavigationTabs: React.FC<{ tabs: { name: string, to: string }[] }> = ({ tabs }) => (
    <div className="border-b border-[#3a3f47]">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map(tab => (
                <NavLink key={tab.name} to={tab.to} end className={({ isActive }) =>
                    `${isActive ? 'border-[#76b900] text-[#76b900]' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'} whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm transition-colors`
                }>{tab.name}</NavLink>
            ))}
        </nav>
    </div>
);

export const ConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    children: ReactNode;
    confirmText?: string;
    isConfirming?: boolean;
}> = ({ isOpen, onClose, onConfirm, title, children, confirmText = 'Delete', isConfirming = false }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div>
                <div className="text-slate-400 mb-6">{children}</div>
                <div className="flex justify-end space-x-3">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isConfirming}>
                        Cancel
                    </Button>
                    <Button type="button" variant="danger" onClick={onConfirm} disabled={isConfirming}>
                        {isConfirming ? (
                            <span className="inline-flex items-center">
                                <Spinner />
                                <span className="ml-2">Deleting...</span>
                            </span>
                        ) : confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};