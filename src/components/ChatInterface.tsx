
import React, { useState, useRef, useEffect } from 'react';
import { streamChatCompletion, generateFollowUpQuestions } from '../services/ollamaService';
import { AppConfig, Message, ChatStatus, ChatSession, SlashCommand } from '../types';
import { MessageItem } from './MessageItem';
import { SuggestionRail } from './SuggestionRail';
import { SLASH_COMMANDS } from '../constants';

interface ChatInterfaceProps {
    config: AppConfig;
    messages: Message[];
    suggestions: string[];
    onSessionUpdate: (updates: Partial<ChatSession>) => void;
    isTerminalMode: boolean;
    isZenMode: boolean;
    onOpenPromptLibrary: () => void;
    onOpenAdmin: () => void;
    addToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
    onToggleSuggestions: () => void;
    forcedInput?: string;
    onInputCleared?: () => void;
    availableCategories?: string[];
    onToggleCategory?: (cat: string) => void;
    onToggleMaster?: () => void;
}

const DEFAULT_QUESTIONS = [
    { title: "Optimization", query: "How do I optimize a Dockerfile?" },
    { title: "Architecture", query: "Explain Kubernetes Pod lifecycle" },
    { title: "Troubleshooting", query: "Debug a CI/CD pipeline failure" }
];

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
    config,
    messages,
    suggestions,
    onSessionUpdate,
    isTerminalMode,
    isZenMode,
    onOpenPromptLibrary,
    onOpenAdmin,
    addToast,
    onToggleSuggestions,
    forcedInput,
    onInputCleared,
    availableCategories,
    onToggleCategory,
    onToggleMaster
}) => {
    const [input, setInput] = useState('');
    const [status, setStatus] = useState<ChatStatus>(ChatStatus.IDLE);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const [showSlashMenu, setShowSlashMenu] = useState(false);
    const [slashFilter, setSlashFilter] = useState('');

    const scrollRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

    // Track scroll position to determine if we should auto-scroll
    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        // If user is within 50px of the bottom, enable auto-scroll
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
        setShouldAutoScroll(isNearBottom);
    };

    // Scroll to bottom when messages change, but ONLY if shouldAutoScroll is true
    useEffect(() => {
        if (shouldAutoScroll) {
            const behavior = status === ChatStatus.STREAMING ? "auto" : "smooth";
            messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
        }
    }, [messages, status, shouldAutoScroll]);

    // Auto-resize textarea based on content
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [input]);

    useEffect(() => {
        if (forcedInput) {
            setInput(forcedInput);
            if (textareaRef.current) textareaRef.current.focus();
            if (onInputCleared) onInputCleared();
        }
    }, [forcedInput, onInputCleared]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            if (file.type.startsWith('text/') || file.name.endsWith('.log') || file.name.endsWith('.json') || file.name.endsWith('.yaml') || file.name.endsWith('.yml')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const content = event.target?.result;
                    if (typeof content === 'string') {
                        const logPrompt = `Analyze the following log file content for errors, anomalies, and root causes:\n\n[FILE: ${file.name}]\n\`\`\`\n${content.slice(0, 15000)}\n\`\`\`\n${content.length > 15000 ? '(Truncated...)' : ''}`;
                        setInput(logPrompt);
                        addToast("Log file loaded into input", "success");
                        textareaRef.current?.focus();
                    }
                };
                reader.readAsText(file);
            } else {
                addToast("Please drop a text/log file.", "error");
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setInput(val);

        if (val === '/') {
            setShowSlashMenu(true);
            setSlashFilter('');
        } else if (val.startsWith('/')) {
            const cmd = val.split(' ')[0];
            if (SLASH_COMMANDS.some(sc => sc.key.startsWith(cmd))) {
                setShowSlashMenu(true);
                setSlashFilter(cmd);
            } else {
                setShowSlashMenu(false);
            }
        } else {
            setShowSlashMenu(false);
        }
    };

    useEffect(() => {
        const lastMsg = messages[messages.length - 1];
        if (status === ChatStatus.IDLE && lastMsg?.role === 'model' && !lastMsg.isError && lastMsg.content) {
            if (messages.length === 1 && lastMsg.id === 'welcome') return;

            if (!config.enableSuggestions) return;

            setLoadingSuggestions(true);
            generateFollowUpQuestions(messages, config)
                .then(qs => {
                    if (qs && qs.length > 0) {
                        onSessionUpdate({ suggestions: qs });
                    }
                })
                .catch(e => console.error("Suggestion Error:", e))
                .finally(() => setLoadingSuggestions(false));
        }
    }, [status, messages, config]);


    const handleSendMessage = async (textOverride?: string, customHistory?: Message[]) => {
        const textToSend = textOverride || input;
        if (!textToSend.trim() || status === ChatStatus.STREAMING) return;

        // --- NEW: Slash Command Tool Activation Logic ---
        // Check if the input starts with '/' and matches a known category (case-insensitive)
        if (textToSend.startsWith('/')) {
            const potentialCommand = textToSend.split(' ')[0].substring(1).toLowerCase();
            if (availableCategories?.includes(potentialCommand)) {
                // If it's a valid category, enable it if not already enabled
                const currentCats = config.activeCategories || [];
                if (!currentCats.includes(potentialCommand)) {
                    // Update state via callback
                    if (onToggleCategory) {
                        onToggleCategory(potentialCommand);
                        addToast(`Activated '${potentialCommand}' tools`, "success");
                    }
                }
                // Ensure Master Switch is ON
                if (!config.toolSafety && onToggleMaster) {
                    onToggleMaster();
                    addToast("Master Tool Switch Enabled", "success");
                }
            }
        }
        // ------------------------------------------------

        if (textToSend.trim() === '/admin') {
            setInput('');
            setShowSlashMenu(false);
            onOpenAdmin();
            return;
        }

        // Enforce Context Window Limit STRICTLY
        // We simulate the exact JSON structure the App uses to calculate tokens
        const tempUserMsgForCalc = {
            id: Date.now().toString(),
            role: 'user',
            content: textToSend.trim(),
            timestamp: Date.now(),
        };

        const historyToUse = customHistory || messages;
        const potentialNewHistory = [...historyToUse, tempUserMsgForCalc];
        const approximateTokens = Math.ceil(JSON.stringify(potentialNewHistory).length / 4);
        const limit = config.contextWindowSize || 1000000;

        if (approximateTokens > limit) {
            addToast(`Context Window Exceeded (${approximateTokens} / ${limit} tokens). Please start a new session.`, "error");
            return;
        }

        setShowSlashMenu(false);

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: textToSend.trim(),
            timestamp: Date.now(),
        };

        const newMessages = [...historyToUse, userMessage];
        onSessionUpdate({
            messages: newMessages,
            suggestions: []
        });

        setInput('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
        setStatus(ChatStatus.STREAMING);

        const responseId = (Date.now() + 1).toString();
        const modelPlaceholder: Message = {
            id: responseId,
            role: 'model',
            content: '',
            timestamp: Date.now(),
        };

        let currentMessagesWithModel = [...newMessages, modelPlaceholder];
        onSessionUpdate({ messages: currentMessagesWithModel });

        try {
            let fullText = '';
            const stream = streamChatCompletion(newMessages, config);

            for await (const chunk of stream) {
                fullText += chunk;
                currentMessagesWithModel = currentMessagesWithModel.map(msg =>
                    msg.id === responseId ? { ...msg, content: fullText } : msg
                );
                onSessionUpdate({ messages: currentMessagesWithModel });
            }
            setStatus(ChatStatus.IDLE);
        } catch (error: any) {
            console.error("Chat Error:", error);
            onSessionUpdate({
                messages: currentMessagesWithModel.map(msg =>
                    msg.id === responseId
                        ? { ...msg, content: `**Error**: ${error.message}`, isError: true }
                        : msg
                )
            });
            setStatus(ChatStatus.ERROR);
            addToast("Failed to generate response", "error");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (showSlashMenu) {
                const filtered = SLASH_COMMANDS.filter(c => c.key.startsWith(slashFilter));
                if (filtered.length > 0) {
                    handleSlashCommand(filtered[0]);
                    return;
                }
            }
            handleSendMessage();
        }
        if (e.key === 'Escape') {
            setShowSlashMenu(false);
        }
    };

    const handleSlashCommand = (cmd: SlashCommand) => {
        setInput(cmd.prompt + ' ');
        setShowSlashMenu(false);
        textareaRef.current?.focus();
    };

    const handleQuestionClick = (question: string) => {
        handleSendMessage(question);
    };

    const handleEditMessage = React.useCallback((id: string, newContent: string) => {
        const msgIndex = messages.findIndex(m => m.id === id);
        if (msgIndex === -1) return;

        // Truncate history up to the edited message
        // Keep everything BEFORE this message
        const truncatedHistory = messages.slice(0, msgIndex);

        // Directly trigger send with the new content and the explicit history base
        // This avoids any state closure issues or race conditions
        handleSendMessage(newContent, truncatedHistory);
    }, [messages, handleSendMessage]);



    const filteredCommands = SLASH_COMMANDS.filter(cmd => cmd.key.startsWith(slashFilter));

    const isInitialState = messages.length === 1 && messages[0].id === 'welcome';

    return (
        <div
            className="flex h-full w-full overflow-hidden relative"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {isDragging && (
                <div className="absolute inset-0 z-50 bg-stc-purple/90 flex flex-col items-center justify-center text-white backdrop-blur-sm animate-in fade-in">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-4 animate-bounce"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></svg>
                    <h2 className="text-2xl font-bold">Drop Log File to Analyze</h2>
                    <p className="text-white/70 mt-2">Supports .log, .txt, .json, .yaml</p>
                </div>
            )}

            <div className="flex-1 flex flex-col relative min-w-0">
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto px-4 md:px-6 pt-6 space-y-6 scroll-smooth custom-scrollbar flex flex-col"
                >
                    <div className={`mx-auto w-full h-full flex flex-col ${isZenMode ? 'max-w-4xl' : 'max-w-6xl'}`}>
                        {messages.map((msg, index) => (
                            <MessageItem
                                key={msg.id}
                                message={msg}
                                isStreaming={status === ChatStatus.STREAMING && index === messages.length - 1 && msg.role === 'model'}
                                isTerminalMode={isTerminalMode}
                                onEdit={handleEditMessage}
                            />
                        ))}

                        {isInitialState && (
                            <div className="flex-1 flex flex-col justify-end items-center mb-2 animate-in fade-in duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
                                    {DEFAULT_QUESTIONS.map((q, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleQuestionClick(q.query)}
                                            className={`
                                            flex flex-col p-6 rounded-xl border transition-all group text-left
                                            ${isTerminalMode
                                                    ? 'border-green-500/30 bg-black hover:bg-green-900/20 hover:border-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)]'
                                                    : 'border-stc-purple/10 bg-white hover:bg-stc-light hover:border-stc-purple/30 shadow-sm hover:shadow-md'}
                                        `}
                                        >
                                            <span className={`text-xs font-bold uppercase mb-2 ${isTerminalMode ? 'text-green-500' : 'text-stc-coral'}`}>
                                                {q.title}
                                            </span>
                                            <span className={`text-sm font-medium ${isTerminalMode ? 'text-green-400' : 'text-stc-purple'}`}>
                                                "{q.query}"
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* SPACER: Increased to ensure content is pushed well above the input bar */}
                        <div className="h-72 flex-shrink-0" />
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                <div className={`absolute bottom-0 left-0 right-0 pt-4 pb-4 px-4 md:px-6 z-30 ${isTerminalMode ? 'bg-gradient-to-t from-black via-black to-transparent' : 'bg-gradient-to-t from-stc-light via-stc-light to-transparent'}`}>
                    <div className={`mx-auto relative space-y-2 ${isZenMode ? 'max-w-4xl' : 'max-w-6xl'}`}>

                        {showSlashMenu && filteredCommands.length > 0 && (
                            <div className={`absolute bottom-full mb-2 w-full max-w-md rounded-lg border shadow-2xl overflow-hidden ${isTerminalMode ? 'bg-black border-green-500' : 'bg-white border-stc-purple/20'
                                }`}>
                                <div className={`text-[10px] font-bold px-3 py-2 uppercase tracking-wider border-b ${isTerminalMode ? 'bg-green-900/30 text-green-500 border-green-500' : 'bg-stc-purple text-white border-stc-purple'
                                    }`}>
                                    Available Commands
                                </div>
                                {filteredCommands.map(cmd => (
                                    <button
                                        key={cmd.key}
                                        onClick={() => handleSlashCommand(cmd)}
                                        className={`w-full text-left px-4 py-2 flex items-center gap-3 transition-colors ${isTerminalMode
                                            ? 'hover:bg-green-900/30 text-green-400'
                                            : 'hover:bg-stc-light text-stc-purple'
                                            }`}
                                    >
                                        <span className={`font-mono font-bold ${isTerminalMode ? 'text-green-500' : 'text-stc-purple'}`}>{cmd.key}</span>
                                        <span className="text-xs opacity-70">{cmd.description}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className={`
                        relative flex items-end gap-2 p-2 transition-all duration-300 border 
                        ${isTerminalMode
                                ? 'bg-black border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)] focus-within:shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                                : 'bg-white border-stc-purple/20 rounded-xl shadow-xl focus-within:border-stc-coral focus-within:ring-1 focus-within:ring-stc-coral/20'}
                    `}>
                            {/* NEW: Tool Control Area */}
                            <div className="relative group/tools">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        // Just a visual toggle for now, popover is hover-based
                                    }}
                                    className={`
                                    flex items-center justify-center h-7 w-7 rounded transition-colors
                                    ${config.toolSafety
                                            ? (isTerminalMode ? 'bg-green-900/30 text-green-500' : 'bg-stc-purple/10 text-stc-purple')
                                            : (isTerminalMode ? 'text-gray-600' : 'text-gray-400 hover:bg-gray-100')}
                                `}
                                    title="Tool Settings"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                                </button>

                                {/* Tool Settings Popover */}
                                <div className={`
                                    absolute bottom-full left-0 mb-3 w-48 rounded-lg border shadow-xl p-3 z-50
                                    invisible opacity-0 group-hover/tools:visible group-hover/tools:opacity-100 transition-all duration-200
                                    ${isTerminalMode ? 'bg-black border-green-500' : 'bg-white border-stc-purple/20'}
                                `}>
                                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-current opacity-50">
                                        <span className="text-[10px] uppercase font-bold tracking-wider">Active Tools</span>
                                        <button
                                            onClick={onToggleMaster}
                                            className={`text-[10px] font-bold ${config.toolSafety ? 'text-green-500' : 'text-gray-400'}`}
                                        >
                                            {config.toolSafety ? 'ON' : 'OFF'}
                                        </button>
                                    </div>

                                    {/* Always show categories, but they auto-enable the switch */}
                                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
                                        {availableCategories?.map(cat => (
                                            <label key={cat} className={`
                                                    cursor-pointer text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all duration-200 select-none
                                                    ${config.activeCategories?.includes(cat)
                                                    ? (isTerminalMode
                                                        ? 'bg-green-500 text-black border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]'
                                                        : 'bg-stc-purple text-white border-stc-purple shadow-md transform scale-105')
                                                    : (isTerminalMode
                                                        ? 'bg-black text-green-700 border-green-900 hover:border-green-500 hover:text-green-500'
                                                        : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-stc-purple/30 hover:text-stc-purple')}
                                                `}>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={config.activeCategories?.includes(cat) || false}
                                                    onChange={() => {
                                                        const isEnabling = !config.activeCategories?.includes(cat);
                                                        if (onToggleCategory) onToggleCategory(cat);

                                                        if (isEnabling && textareaRef.current) {
                                                            textareaRef.current.focus();
                                                        }
                                                    }}
                                                />
                                                <span className="capitalize">{cat}</span>
                                            </label>
                                        ))}
                                        {(!availableCategories || availableCategories.length === 0) && (
                                            <div className="w-full text-[10px] italic opacity-50 text-center py-2">No categories found</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className={`w-px h-6 self-center mx-1 ${isTerminalMode ? 'bg-green-900' : 'bg-gray-200'}`}></div>

                            <button
                                onClick={onOpenPromptLibrary}
                                className={`flex-shrink-0 h-7 w-7 flex items-center justify-center rounded hover:bg-opacity-10 transition-colors ${isTerminalMode ? 'text-green-500 hover:bg-green-500' : 'text-stc-purple hover:bg-stc-purple'}`}
                                title="Prompt Library"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
                            </button>

                            {/* Active Tool Chip in Input Area */}
                            {config.activeCategories && config.activeCategories.length > 0 && (
                                <div className="flex items-center gap-1 self-center">
                                    {config.activeCategories.map(cat => (
                                        <div key={cat} className={`
                                            flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider select-none
                                            ${isTerminalMode ? 'bg-green-900/50 text-green-400 border border-green-500/50' : 'bg-stc-purple text-white'}
                                        `}>
                                            <span>{cat}</span>
                                            <button
                                                onClick={() => onToggleCategory && onToggleCategory(cat)}
                                                className="hover:text-red-400 transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                placeholder={isTerminalMode ? ">_ Input command (Try / for tools)" : "Ask DevOps Assistant (Type / for commands)..."}
                                rows={1}
                                className={`
                                flex-1 max-h-64 bg-transparent border-none focus:ring-0 resize-none py-1.5 leading-relaxed scrollbar-hide text-xs
                                ${isTerminalMode
                                        ? 'text-green-400 placeholder-green-800 font-mono'
                                        : 'text-stc-purple placeholder-stc-purple/40 font-sans'}
                            `}
                                disabled={status === ChatStatus.STREAMING}
                            />

                            <button
                                onClick={() => handleSendMessage()}
                                disabled={!input.trim() || status === ChatStatus.STREAMING}
                                className={`
                                h-8 w-8 flex items-center justify-center transition-all duration-200
                                ${isTerminalMode
                                        ? (status === ChatStatus.STREAMING ? 'bg-green-900 text-green-700 cursor-not-allowed' : !input.trim() ? 'bg-green-900/30 text-green-800' : 'bg-green-500 text-black hover:bg-green-400 rounded-sm')
                                        : (status === ChatStatus.STREAMING ? 'bg-stc-purple/50 text-white' : !input.trim() ? 'bg-gray-200 text-gray-400' : 'bg-stc-purple text-white hover:bg-stc-coral shadow-lg rounded-lg')
                                    }
                            `}
                            >
                                {status === ChatStatus.STREAMING ? (
                                    <div className="w-2 h-2 bg-current rounded-sm animate-pulse" />
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {!isZenMode && (
                <SuggestionRail
                    suggestions={suggestions}
                    onSelect={(s) => handleSendMessage(s)}
                    isLoading={loadingSuggestions}
                    isTerminalMode={isTerminalMode}
                    messages={messages}
                    onToggleSuggestions={onToggleSuggestions}
                    suggestionsEnabled={config.enableSuggestions}
                    onRetry={() => {
                        if (!config.enableSuggestions) return;
                        setLoadingSuggestions(true);
                        generateFollowUpQuestions(messages, config)
                            .then(qs => {
                                if (qs && qs.length > 0) {
                                    onSessionUpdate({ suggestions: qs });
                                } else {
                                    addToast("No new actions suggested.", "info");
                                }
                            })
                            .catch(e => console.error(e))
                            .finally(() => setLoadingSuggestions(false));
                    }}
                />
            )}
        </div>
    );
};
