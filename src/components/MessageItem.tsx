
import React, { useState } from 'react';
import { Message } from '../types';
import { CodeBlock } from './CodeBlock';
import { FeedbackButtons } from './FeedbackButtons';

interface MessageItemProps {
    message: Message;
    isStreaming?: boolean;
    isTerminalMode: boolean;
    onEdit?: (id: string, newContent: string) => void;
}

export const MessageItem = React.memo(({ message, isStreaming, isTerminalMode, onEdit }: MessageItemProps) => {
    const isUser = message.role === 'user';
    const [isCopied, setIsCopied] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content);

    const handleCopy = () => {
        if (!message.content) return;
        const textToCopy = message.content;

        // Robust Copy
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            }).catch(err => console.error("Clipboard write failed", err));
        } else {
            const textArea = document.createElement("textarea");
            textArea.value = textToCopy;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            } catch (err) {
                console.error('Fallback copy failed', err);
            }
            document.body.removeChild(textArea);
        }
    };

    const handleSaveEdit = () => {
        if (editContent.trim() !== message.content && onEdit) {
            onEdit(message.id, editContent);
        }
        setIsEditing(false);
    };

    const renderThinking = (text: string) => {
        const parts = [];
        let remainingText = text;

        const processRegex = (regex: RegExp, isTag: boolean) => {
            let match;
            // Reset regex lastIndex just in case
            regex.lastIndex = 0;

            // We use a simple split/match approach to avoid infinite loops with global regex state complexities
            // But standard loop is fine if careful.

            // Let's actually use a unified splitter approach. 
            // We'll search for the first occurrence of ANY pattern.
        };

        // Unified parsing loop
        // We look for either <think>...</think> OR Thinking... ...done thinking.
        let currentIndex = 0;

        while (currentIndex < text.length) {
            // Find next start tag
            const tagStart = text.indexOf('<think>', currentIndex);
            const textStart = text.indexOf('Thinking...', currentIndex);

            let matchType = null; // 'tag' or 'text'
            let matchIndex = -1;

            if (tagStart !== -1 && (textStart === -1 || tagStart < textStart)) {
                matchType = 'tag';
                matchIndex = tagStart;
            } else if (textStart !== -1) {
                matchType = 'text';
                matchIndex = textStart;
            }

            if (matchIndex === -1) {
                // No more thinking blocks
                if (currentIndex < text.length) {
                    parts.push(renderContent(text.substring(currentIndex)));
                }
                break;
            }

            // Push plain text before the match
            if (matchIndex > currentIndex) {
                parts.push(renderContent(text.substring(currentIndex, matchIndex)));
            }

            // Find end of this block
            if (matchType === 'tag') {
                const tagEnd = text.indexOf('</think>', matchIndex);
                if (tagEnd !== -1) {
                    const content = text.substring(matchIndex + 7, tagEnd);
                    parts.push(renderThinkingBlock(content, matchIndex));
                    currentIndex = tagEnd + 8; // skip </think>
                } else {
                    // Unclosed tag (Streaming)
                    const content = text.substring(matchIndex + 7);
                    parts.push(renderThinkingStream(content, matchIndex));
                    currentIndex = text.length; // Consumed rest
                }
            } else { // text
                // Check if it really matches the pattern start "Thinking..."
                // We look for "...done thinking."
                // Note: The user said "...done thinking." 
                // We should be careful about nested or false positives, but simpler is better here.
                const textEnd = text.indexOf('...done thinking.', matchIndex);
                if (textEnd !== -1) {
                    const content = text.substring(matchIndex + 11, textEnd); // 11 is length of "Thinking..."
                    parts.push(renderThinkingBlock(content, matchIndex));
                    currentIndex = textEnd + 17; // 17 is "...done thinking." length
                } else {
                    // Unclosed text stream?
                    // Only treat as unclosed if we are at the very end or it looks like a stream
                    // For safety, if we don't find the end, we might just treat it as text if it's not streaming mode
                    // But if isStreaming, we treat as Thinking stream
                    if (isStreaming) {
                        const content = text.substring(matchIndex + 11);
                        parts.push(renderThinkingStream(content, matchIndex));
                        currentIndex = text.length;
                    } else {
                        // Not streaming, and no end marker -> probably just plain text "Thinking..."
                        parts.push(renderContent(text.substring(matchIndex, matchIndex + 11)));
                        currentIndex = matchIndex + 11;
                    }
                }
            }
        }

        return parts.length > 0 ? parts : renderContent(text);
    };

    const renderThinkingBlock = (content: string, keyVal: number) => (
        <details key={`think-${keyVal}`} className="my-2 group rounded-lg bg-gray-50 border border-gray-100 open:border-stc-purple/10">
            <summary className="list-none px-3 py-2 cursor-pointer text-[10px] font-bold uppercase text-gray-500 hover:text-stc-purple transition-colors flex items-center gap-2 select-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-open:rotate-90"><path d="m9 18 6-6-6-6" /></svg>
                Thinking Process
            </summary>
            <div className="px-4 pb-3 pt-0 text-xs text-gray-600 font-mono whitespace-pre-wrap border-t border-dashed border-gray-200 mt-1 pt-2">
                {content.trim()}
            </div>
        </details>
    );

    const renderThinkingStream = (content: string, keyVal: number) => (
        <div key={`thinking-stream-${keyVal}`} className="my-2 border-l-2 border-stc-purple/30 pl-4 py-1 animate-pulse">
            <div className="text-[10px] font-bold uppercase text-stc-purple/50 mb-1 flex items-center gap-2">
                <span className="w-2 h-2 bg-stc-purple/50 rounded-full animate-bounce"></span>
                Thinking...
            </div>
            <div className="text-xs text-gray-500 italic font-mono opacity-80 whitespace-pre-wrap">
                {content}
            </div>
        </div>
    );

    // Basic custom Markdown parser (Wrapped for Thinking usage)
    const renderContent = (text: string) => {
        // Determine if we should parse thinking tags
        // We only parse them if we are NOT already inside the renderThinking recursion
        // To avoid infinite loops, renderThinking calls 'renderMarkdownChunks' instead of 'renderContent'
        return renderMarkdownChunks(text);
    };

    const renderMarkdownChunks = (text: string) => {
        const parts = [];
        const codeBlockRegex = /```(\w+)?\s*([\s\S]*?)```/g;
        let lastIndex = 0;
        let match;

        while ((match = codeBlockRegex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parts.push(
                    <span key={`text-${lastIndex}`} className="whitespace-pre-wrap animate-in fade-in duration-300">
                        {parseInlineFormatting(text.substring(lastIndex, match.index))}
                    </span>
                );
            }
            parts.push(
                <CodeBlock
                    key={`code-${match.index}`}
                    language={match[1] || ''}
                    code={match[2]}
                />
            );
            lastIndex = match.index + match[0].length;
        }

        if (lastIndex < text.length) {
            parts.push(
                <span key={`text-${lastIndex}`} className="whitespace-pre-wrap animate-in fade-in duration-300">
                    {parseInlineFormatting(text.substring(lastIndex))}
                </span>
            );
        }
        return parts;
    };

    // Helper to render Jira Ticket Card
    const renderJiraTicket = (ticketId: string, key: string) => (
        <div key={key} className={`inline-flex items-center gap-2 px-2 py-1 mx-1 rounded border align-middle select-none cursor-pointer transition-all hover:scale-105 ${isTerminalMode
            ? 'bg-green-900/40 border-green-500/50 text-green-400 hover:bg-green-900/60'
            : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
            }`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M11.5 10L5.1 16.4C4.3 17.2 4.3 18.5 5.1 19.3C5.9 20.1 7.2 20.1 8 19.3L14.4 12.9V10H11.5Z" /><path d="M11.5 2L5.1 8.4C4.3 9.2 4.3 10.5 5.1 11.3C5.9 12.1 7.2 12.1 8 11.3L14.4 4.9V2H11.5Z" /></svg>
            <span className="font-bold text-[10px]">{ticketId}</span>
            <span className="text-[8px] opacity-70 border-l pl-1 border-current">IN_PROGRESS</span>
        </div>
    );

    const parseInlineFormatting = (text: string) => {
        const elements: (string | React.ReactElement)[] = [];

        // First, split by Jira ticket pattern (e.g., PROJ-123, OPS-456)
        // Matches 2-6 uppercase letters, hyphen, 1-5 digits
        const ticketRegex = /([A-Z]{2,6}-\d{1,5})/g;
        const ticketParts = text.split(ticketRegex);

        ticketParts.forEach((part, tIdx) => {
            // Check if this part is a ticket ID
            if (part.match(/^[A-Z]{2,6}-\d{1,5}$/)) {
                elements.push(renderJiraTicket(part, `ticket-${tIdx}`));
                return;
            }

            // Process Markdown inline code `code`
            const inlineParts = part.split(/`([^`]+)`/g);
            inlineParts.forEach((inlinePart, i) => {
                if (i % 2 === 1) {
                    elements.push(
                        <code key={`code-${tIdx}-${i}`} className={`
                        px-1 py-0.5 rounded text-xs font-mono border
                        ${isTerminalMode
                                ? 'bg-green-900/30 text-green-400 border-green-500/50 rounded-none'
                                : 'bg-stc-purple/10 text-stc-purple border-stc-purple/20'}
                    `}>
                            {inlinePart}
                        </code>
                    );
                } else {
                    // Process Bold **text**
                    const boldParts = inlinePart.split(/\*\*(.*?)\*\*/g);
                    boldParts.forEach((subPart, j) => {
                        if (j % 2 === 1) {
                            elements.push(<strong key={`bold-${tIdx}-${i}-${j}`} className={isTerminalMode ? "text-green-400 font-bold" : "text-stc-purple font-bold"}>{subPart}</strong>);
                        } else {
                            elements.push(subPart);
                        }
                    });
                }
            });
        });

        return elements;
    };

    // Terminal Mode Style (Hacker Green)
    if (isTerminalMode) {
        return (
            <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4 group`}>
                <div className={`
            max-w-4xl w-full relative p-3 border-l-2 font-mono
            ${isUser
                        ? 'border-green-500 bg-green-900/10'
                        : 'border-green-700 bg-transparent'}
          `}>
                    <div className="flex gap-3">
                        <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center bg-black border ${isUser ? 'border-green-500 text-green-500' : 'border-green-700 text-green-700'}`}>
                            {isUser ? <span className="text-[10px] font-bold">&gt;_</span> : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>
                            )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className={`text-xs font-bold tracking-wide uppercase ${isUser ? 'text-green-500' : 'text-green-700'}`}>{isUser ? 'USR_SHELL' : 'SYS_CORE'}</span>
                                <div className="flex items-center gap-3">
                                    {!isUser && (
                                        <button onClick={handleCopy} className="flex items-center gap-1 text-[9px] font-mono text-green-700 hover:text-green-500 transition-colors uppercase tracking-wider group/btn">
                                            {isCopied ? <span>COPIED</span> : <span>COPY_RAW</span>}
                                        </button>
                                    )}
                                    <span className="text-[9px] font-mono text-green-800">
                                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </span>
                                </div>
                                {!isUser && !isStreaming && (
                                    <FeedbackButtons messageId={message.id} isTerminalMode={isTerminalMode} />
                                )}
                            </div>
                        </div>
                        <div className={`text-sm leading-relaxed text-green-400 ${message.isError ? 'text-red-500' : ''}`}>
                            {renderThinking(message.content)}
                            {isStreaming && <span className="inline-block w-2 h-4 ml-1 align-middle cursor-blink bg-green-500"></span>}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // GUI Mode Style (Corporate STC)
    return (
        <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6 group px-2`}>
            <div className={`flex gap-4 max-w-3xl w-full ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>

                {/* Avatar */}
                <div className={`
                flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center shadow-lg border
                ${isUser
                        ? 'bg-stc-purple border-stc-purple text-white'
                        : 'bg-white border-stc-purple/20 text-stc-purple'}
            `}>
                    {isUser ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    ) : (
                        // Futuristic Robot Icon
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg>
                    )}
                </div>

                {/* Bubble */}
                <div className={`
                flex-1 min-w-0 flex flex-col 
                ${isUser ? 'items-end' : 'items-start'}
            `}>
                    <div className="flex items-center gap-2 mb-1 px-1 opacity-60">
                        <span className={`text-[10px] font-semibold tracking-wide uppercase ${isUser ? 'text-stc-purple' : 'text-gray-500'}`}>
                            {isUser ? 'You' : 'DevOps Assistant'}
                        </span>
                        <span className="text-[10px] text-gray-400">
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>

                        {!isUser && !isStreaming && (
                            <div className="ml-2">
                                <FeedbackButtons messageId={message.id} isTerminalMode={isTerminalMode} />
                            </div>
                        )}

                        {!isUser && (
                            <button onClick={handleCopy} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stc-purple hover:text-stc-coral"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            </button>
                        )}
                        {/* EDIT BUTTON FOR USER */}
                        {isUser && !isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-stc-purple hover:text-stc-coral"
                                title="Edit Message"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
                            </button>
                        )}
                    </div>

                    {isEditing ? (
                        <div className="w-full bg-white border border-stc-purple/30 rounded-lg p-2 shadow-lg animate-in fade-in zoom-in-95 duration-200">
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full text-sm p-2 bg-stc-light/50 rounded focus:outline-none focus:ring-1 focus:ring-stc-purple resize-none min-h-[60px]"
                                autoFocus
                            />
                            <div className="flex justify-end gap-2 mt-2">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    className="px-3 py-1 text-xs bg-stc-purple text-white rounded hover:bg-stc-coral transition-colors"
                                >
                                    Save & Regenerate
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className={`
                        px-5 py-3.5 shadow-xl text-sm leading-relaxed max-w-full
                        ${isUser
                                ? 'bg-stc-purple text-white rounded-2xl rounded-tr-sm'
                                : 'bg-white border border-gray-100 text-gray-700 rounded-2xl rounded-tl-sm'}
                        ${message.isError ? 'border-stc-coral bg-red-50' : ''}
                    `}>
                            {renderThinking(message.content)}
                            {isStreaming && (
                                <span className="inline-flex ml-1 translate-y-0.5">
                                    <span className="w-1 h-1 bg-current rounded-full animate-bounce"></span>
                                    <span className="w-1 h-1 bg-current rounded-full animate-bounce delay-100"></span>
                                    <span className="w-1 h-1 bg-current rounded-full animate-bounce delay-200"></span>
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});
