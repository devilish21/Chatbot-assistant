
import React from 'react';
import { Toast } from '../types';

interface ToastContainerProps {
  toasts: Toast[];
  isTerminalMode: boolean;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, isTerminalMode }) => {
  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            min-w-[250px] max-w-sm p-3 rounded shadow-xl border flex items-center gap-3 animate-in slide-in-from-right-10 fade-in duration-300 pointer-events-auto
            ${isTerminalMode 
                ? 'bg-black border-green-500 text-green-500 font-mono shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
                : 'bg-white border-stc-purple/10 text-stc-purple font-sans shadow-lg'}
          `}
        >
          <div className={`
            flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full
            ${toast.type === 'error' 
                ? (isTerminalMode ? 'bg-red-500/20 text-red-500' : 'bg-red-100 text-red-600') 
                : toast.type === 'success' 
                    ? (isTerminalMode ? 'bg-green-500/20 text-green-500' : 'bg-green-100 text-green-600')
                    : (isTerminalMode ? 'bg-green-500/20 text-green-500' : 'bg-stc-purple/10 text-stc-purple')
            }
          `}>
             {toast.type === 'success' && <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
             {toast.type === 'error' && <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
             {toast.type === 'info' && <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>}
          </div>
          <div className="text-xs font-medium">{toast.message}</div>
        </div>
      ))}
    </div>
  );
};
