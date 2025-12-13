
import React, { useState, useRef, useEffect } from 'react';
import { ChatSession } from '../types';

interface SessionSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  isTerminalMode: boolean;
}

export const SessionSidebar: React.FC<SessionSidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  isTerminalMode
}) => {
  // Renaming State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Deleting State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const containerClass = isTerminalMode
    ? "border-r border-green-500/50 bg-black/80"
    : "border-r border-gray-200 bg-stc-white/80 backdrop-blur-xl";

  const headerClass = isTerminalMode
    ? "border-b border-green-500/50 bg-green-900/10 text-green-500"
    : "border-b border-gray-200 bg-stc-purple/5 text-stc-purple";

  const footerClass = isTerminalMode
    ? "border-t border-green-500/50 bg-black"
    : "border-t border-gray-200 bg-stc-light";

  // Focus input when editing starts
  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingId]);

  const startEditing = (e: React.MouseEvent, session: ChatSession) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const saveEdit = () => {
    if (editingId) {
      if (editTitle.trim()) {
        onRenameSession(editingId, editTitle.trim());
      }
      setEditingId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const promptDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
  };

  const confirmDelete = () => {
    if (deletingId) {
      onDeleteSession(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <div className={`hidden md:flex w-80 flex-col h-full relative z-20 transition-all duration-300 ${containerClass}`}>

      {/* Deletion Confirmation Dialog (Overlay) */}
      {deletingId && (
        <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className={`w-full p-4 border rounded-lg shadow-2xl ${isTerminalMode ? 'bg-black border-green-500 text-green-500' : 'bg-white border-stc-coral text-stc-purple'}`}>
            <div className="flex items-center gap-2 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isTerminalMode ? "text-green-500" : "text-stc-coral"}><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
              <span className="font-bold text-xs uppercase tracking-wider">Confirm Delete?</span>
            </div>
            <p className="text-[10px] opacity-80 mb-4">
              This action cannot be undone. The chat history will be lost permanently.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeletingId(null)}
                className={`flex-1 py-1.5 text-[10px] font-bold rounded border ${isTerminalMode
                    ? 'border-green-500 text-green-500 hover:bg-green-900/30'
                    : 'border-gray-300 text-gray-500 hover:bg-gray-100'
                  }`}
              >
                CANCEL
              </button>
              <button
                onClick={confirmDelete}
                className={`flex-1 py-1.5 text-[10px] font-bold rounded ${isTerminalMode ? 'bg-red-900 text-white hover:bg-red-800' : 'bg-stc-coral text-white hover:bg-stc-coral-hover'}`}
              >
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Decoration */}
      <div className={`h-14 flex items-center px-4 ${headerClass}`}>
        <span className="text-[10px] font-bold uppercase tracking-widest">
          {isTerminalMode ? 'SESSION_LOG' : 'Chat History'}
        </span>
        <div className="ml-auto flex space-x-1">
          <span className={`w-1 h-1 rounded-full animate-pulse ${isTerminalMode ? 'bg-green-500' : 'bg-stc-purple'}`}></span>
          <span className={`w-1 h-1 rounded-full animate-pulse delay-75 ${isTerminalMode ? 'bg-green-500' : 'bg-stc-purple'}`}></span>
        </div>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        {sessions.map((session) => {
          const isActive = session.id === activeSessionId;
          const isEditing = editingId === session.id;

          let itemClass = "";

          if (isTerminalMode) {
            itemClass = isActive
              ? "bg-green-900/30 border-green-500 text-green-400"
              : "bg-transparent border-green-900/30 text-green-700 hover:border-green-500 hover:text-green-500";
          } else {
            itemClass = isActive
              ? "bg-stc-purple/10 border-stc-purple/50 text-stc-purple"
              : "bg-transparent border-transparent text-gray-500 hover:bg-white hover:shadow-sm";
          }

          return (
            <div
              key={session.id}
              onClick={() => !isEditing && onSelectSession(session.id)}
              className={`
                w-full text-left group relative p-3 border transition-all duration-200 rounded-md cursor-pointer
                ${itemClass}
              `}
            >
              {isActive && isTerminalMode && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-green-500 shadow-[0_0_10px_#22c55e]"></div>
              )}

              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-mono opacity-60">
                  {new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>

                {/* Hover Actions */}
                {!isEditing && (
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => startEditing(e, session)}
                      className={`p-1 rounded hover:text-white ${isTerminalMode ? 'hover:bg-green-700' : 'hover:bg-stc-purple text-stc-purple hover:text-white'}`}
                      title="Rename"
                      aria-label={`Rename session ${session.title}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
                    </button>
                    <button
                      onClick={(e) => promptDelete(e, session.id)}
                      className={`p-1 rounded hover:text-white ${isTerminalMode ? 'hover:bg-red-900 text-red-400' : 'hover:bg-stc-coral text-stc-coral hover:text-white'}`}
                      title="Delete"
                      aria-label={`Delete session ${session.title}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                    </button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={saveEdit}
                  onKeyDown={handleKeyDown}
                  onClick={(e) => e.stopPropagation()}
                  className={`
                        w-full bg-transparent border-b text-[11px] font-medium font-mono focus:outline-none px-0 py-0
                        ${isTerminalMode
                      ? 'border-green-500 text-green-500 selection:bg-green-900'
                      : 'border-stc-purple text-stc-purple selection:bg-stc-purple/20'}
                    `}
                />
              ) : (
                <p className="text-[11px] font-medium truncate font-mono" title={session.title}>
                  {session.title}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className={`p-3 ${footerClass}`}>
        <button
          onClick={onNewSession}
          className={`
                w-full flex items-center justify-center gap-2 px-3 py-2 text-[11px] font-bold uppercase tracking-wider border transition-all group rounded
                ${isTerminalMode
              ? 'border-green-500 text-green-500 hover:text-black hover:bg-green-500'
              : 'border-gray-300 text-gray-600 hover:text-stc-purple hover:border-stc-purple bg-white'}
            `}
          aria-label="Create new chat session"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isTerminalMode ? "group-hover:stroke-black" : ""}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          {isTerminalMode ? 'INIT_NEW_THREAD' : 'New Chat'}
        </button>
      </div>
    </div>
  );
};
