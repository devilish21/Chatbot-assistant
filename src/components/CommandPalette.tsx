
import React, { useState, useEffect, useRef } from 'react';
import { CommandPaletteAction } from '../types';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    isTerminalMode: boolean;
    actions: CommandPaletteAction[];
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ onClose, isTerminalMode, actions }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    // Handle Ctrl+K / Cmd+K to toggle
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsVisible(prev => !prev);
                setSearch('');
                setSelectedIndex(0);
            }
            if (e.key === 'Escape' && isVisible) {
                setIsVisible(false);
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isVisible, onClose]);

    // Auto-focus input when opened
    useEffect(() => {
        if (isVisible && inputRef.current) {
            // Small timeout to ensure render is complete
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isVisible]);

    const filteredActions = actions.filter(action => 
        action.title.toLowerCase().includes(search.toLowerCase())
    );

    const handleExecute = (action: CommandPaletteAction) => {
        action.action();
        setIsVisible(false);
        onClose();
    };

    useEffect(() => {
        setSelectedIndex(0);
    }, [search]);

    const handleNavigation = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % filteredActions.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredActions[selectedIndex]) {
                handleExecute(filteredActions[selectedIndex]);
            }
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsVisible(false)}>
            <div 
                className={`w-full max-w-xl rounded-xl shadow-2xl overflow-hidden border transform transition-all scale-100 ${
                    isTerminalMode 
                        ? 'bg-black border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.2)]' 
                        : 'bg-white border-stc-purple shadow-2xl'
                }`}
                onClick={e => e.stopPropagation()}
            >
                <div className={`flex items-center px-4 py-3 border-b ${isTerminalMode ? 'border-green-500/50' : 'border-stc-purple/10'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isTerminalMode ? "text-green-500" : "text-stc-purple"}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    <input 
                        ref={inputRef}
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={handleNavigation}
                        placeholder="Type a command or search..."
                        className={`flex-1 bg-transparent border-none focus:ring-0 text-sm ml-3 placeholder-opacity-50 outline-none ${
                            isTerminalMode ? 'text-white placeholder-green-700' : 'text-stc-purple placeholder-stc-purple'
                        }`}
                    />
                    <div className="flex gap-2">
                        <span className={`text-[10px] font-mono border px-1.5 py-0.5 rounded ${isTerminalMode ? 'border-green-500 text-green-500' : 'border-stc-purple/20 text-stc-purple'}`}>↑↓</span>
                        <span className={`text-[10px] font-mono border px-1.5 py-0.5 rounded ${isTerminalMode ? 'border-green-500 text-green-500' : 'border-stc-purple/20 text-stc-purple'}`}>ESC</span>
                    </div>
                </div>
                
                <div className="max-h-[300px] overflow-y-auto p-2">
                    {filteredActions.length === 0 ? (
                        <div className={`p-8 text-center text-sm opacity-50 ${isTerminalMode ? 'text-green-500' : 'text-stc-purple'}`}>
                            No results found.
                        </div>
                    ) : (
                        filteredActions.map((action, index) => (
                            <button
                                key={action.id}
                                onClick={() => handleExecute(action)}
                                onMouseEnter={() => setSelectedIndex(index)}
                                className={`w-full text-left flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                    index === selectedIndex 
                                        ? (isTerminalMode ? 'bg-green-500 text-black' : 'bg-stc-purple text-white')
                                        : (isTerminalMode ? 'text-green-500 hover:bg-green-900/30' : 'text-stc-purple hover:bg-stc-light')
                                }`}
                            >
                                <span className="font-medium">{action.title}</span>
                                {action.shortcut && (
                                    <div className="flex gap-1">
                                        {action.shortcut.map(k => (
                                            <kbd key={k} className={`text-[10px] px-1.5 rounded border font-mono ${
                                                index === selectedIndex 
                                                    ? 'border-white/30 bg-white/10' 
                                                    : (isTerminalMode ? 'border-green-500 bg-black' : 'border-gray-200 bg-gray-50')
                                            }`}>{k}</kbd>
                                        ))}
                                    </div>
                                )}
                            </button>
                        ))
                    )}
                </div>
                <div className={`px-3 py-1.5 text-[10px] text-right opacity-50 border-t ${isTerminalMode ? 'border-green-500/50 bg-black' : 'bg-gray-50 border-gray-100'}`}>
                    DevOps Command Palette
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
