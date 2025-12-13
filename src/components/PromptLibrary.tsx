
import React, { useState } from 'react';
import { Snippet } from '../types';

interface PromptLibraryProps {
    isOpen: boolean;
    onClose: () => void;
    isTerminalMode: boolean;
    snippets: Snippet[];
    setSnippets: React.Dispatch<React.SetStateAction<Snippet[]>>;
    onSelect: (content: string, category?: string) => void;
}

export const PromptLibrary: React.FC<PromptLibraryProps> = ({
    isOpen, onClose, isTerminalMode, snippets, setSnippets, onSelect
}) => {
    const [view, setView] = useState<'list' | 'add'>('list');
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');

    if (!isOpen) return null;

    const handleSave = () => {
        if (!newTitle.trim() || !newContent.trim()) return;
        const newSnippet: Snippet = {
            id: Date.now().toString(),
            title: newTitle.trim(),
            content: newContent.trim()
        };
        setSnippets(prev => [...prev, newSnippet]);
        setNewTitle('');
        setNewContent('');
        setView('list');
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSnippets(prev => prev.filter(s => s.id !== id));
    };

    const containerClass = isTerminalMode
        ? "bg-black border border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.15)] text-green-500 font-mono"
        : "bg-white border border-stc-purple/20 shadow-2xl text-stc-purple font-sans";

    return (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div
                className={`w-full max-w-2xl h-[600px] flex flex-col rounded-xl overflow-hidden relative ${containerClass}`}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`flex items-center justify-between px-6 py-4 border-b ${isTerminalMode ? 'border-green-500/50 bg-green-900/10' : 'border-stc-purple/10 bg-stc-light'}`}>
                    <h2 className="text-lg font-bold tracking-wider uppercase">Prompt Library</h2>
                    <button onClick={onClose} className="hover:opacity-70 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col p-6">
                    {view === 'list' ? (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <p className="text-sm opacity-70">Saved snippets for quick access.</p>
                                <button
                                    onClick={() => setView('add')}
                                    className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wide transition-colors ${isTerminalMode
                                        ? 'bg-green-500 text-black hover:bg-green-400'
                                        : 'bg-stc-purple text-white hover:bg-stc-coral'
                                        }`}
                                >
                                    + New Snippet
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                                {snippets.length === 0 ? (
                                    <div className={`text-center py-12 border-2 border-dashed rounded-lg opacity-50 ${isTerminalMode ? 'border-green-900' : 'border-gray-200'}`}>
                                        <p className="text-sm">No snippets saved yet.</p>
                                    </div>
                                ) : (
                                    snippets.map(snippet => (
                                        <div
                                            key={snippet.id}
                                            onClick={() => onSelect(snippet.content, snippet.category)}
                                            className={`p-4 rounded border cursor-pointer group transition-all ${isTerminalMode
                                                ? 'border-green-500/30 hover:border-green-500 hover:bg-green-900/20'
                                                : 'border-stc-purple/10 hover:border-stc-purple/40 hover:bg-stc-light'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-sm">{snippet.title}</h3>
                                                <button
                                                    onClick={(e) => handleDelete(snippet.id, e)}
                                                    className={`p-1 rounded hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100 ${isTerminalMode ? 'text-red-500' : 'text-red-400'}`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                                                </button>
                                            </div>
                                            <pre className={`text-[10px] p-2 rounded overflow-hidden h-16 opacity-70 ${isTerminalMode ? 'bg-black' : 'bg-gray-50'}`}>
                                                {snippet.content}
                                            </pre>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col h-full space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase mb-1 opacity-70">Title</label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    placeholder="e.g. K8s Audit Template"
                                    className={`w-full p-2 rounded bg-transparent border outline-none ${isTerminalMode
                                        ? 'border-green-500 text-green-500 placeholder-green-800'
                                        : 'border-stc-purple/30 text-stc-purple placeholder-stc-purple/30'
                                        }`}
                                />
                            </div>
                            <div className="flex-1 flex flex-col">
                                <label className="block text-xs font-bold uppercase mb-1 opacity-70">Prompt Content</label>
                                <textarea
                                    value={newContent}
                                    onChange={e => setNewContent(e.target.value)}
                                    placeholder="Enter the full prompt text here..."
                                    className={`flex-1 w-full p-2 rounded bg-transparent border outline-none resize-none font-mono text-xs ${isTerminalMode
                                        ? 'border-green-500 text-green-500 placeholder-green-800'
                                        : 'border-stc-purple/30 text-stc-purple placeholder-stc-purple/30'
                                        }`}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    onClick={() => setView('list')}
                                    className={`px-4 py-2 text-xs font-bold uppercase rounded ${isTerminalMode ? 'hover:bg-green-900/30' : 'hover:bg-gray-100'
                                        }`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={!newTitle || !newContent}
                                    className={`px-6 py-2 text-xs font-bold uppercase rounded transition-colors ${isTerminalMode
                                        ? 'bg-green-500 text-black hover:bg-green-400 disabled:opacity-50'
                                        : 'bg-stc-purple text-white hover:bg-stc-coral disabled:opacity-50'
                                        }`}
                                >
                                    Save Snippet
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
