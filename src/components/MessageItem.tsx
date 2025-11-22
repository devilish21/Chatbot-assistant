
import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../types';
import { CodeBlock } from './CodeBlock';

interface MessageItemProps {
  message: Message;
  isStreaming?: boolean;
  isTerminalMode: boolean;
  onEdit?: (messageId: string, newContent: string) => void;
}

export const MessageItem = React.memo(({ message, isStreaming, isTerminalMode, onEdit }: MessageItemProps) => {
  const isUser = message.role === 'user';
  const [isCopied, setIsCopied] = useState(false);
  
  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const editInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
      if (isEditing && editInputRef.current) {
          editInputRef.current.focus();
          // Auto-resize height
          editInputRef.current.style.height = 'auto';
          editInputRef.current.style.height = editInputRef.current.scrollHeight + 'px';
      }
  }, [isEditing]);

  const handleCopy = () => {
    if (!message.content) return;
    navigator.clipboard.writeText(message.content).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleSaveEdit = () => {
      if (onEdit && editContent.trim() !== message.content) {
          onEdit(message.id, editContent.trim());
      }
      setIsEditing(false);
  };

  const handleCancelEdit = () => {
      setEditContent(message.content);
      setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSaveEdit();
      } else if (e.key === 'Escape') {
          handleCancelEdit();
      }
  };

  // Basic custom Markdown parser
  const renderContent = (text: string) => {
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
    <div key={key} className={`inline-flex items-center gap-2 px-2 py-1 mx-1 rounded border align-middle select-none cursor-pointer transition-all hover:scale-105 ${
        isTerminalMode 
            ? 'bg-green-900/40 border-green-500/50 text-green-400 hover:bg-green-900/60' 
            : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
    }`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M11.5 10L5.1 16.4C4.3 17.2 4.3 18.5 5.1 19.3C5.9 20.1 7.2 20.1 8 19.3L14.4 12.9V10H11.5Z"/><path d="M11.5 2L5.1 8.4C4.3 9.2 4.3 10.5 5.1 11.3C5.9 12.1 7.2 12.1 8 11.3L14.4 4.9V2H11.5Z"/></svg>
        <span className="font-bold text-[10px]">{ticketId}</span>
        <span className="text-[8px] opacity-70 border-l pl-1 border-current">IN_PROGRESS</span>
    </div>
  );

  const parseInlineFormatting = (text: string) => {
    const elements: (string | React.ReactElement)[] = [];
    const ticketRegex = /([A-Z]{2,6}-\d{1,5})/g;
    const ticketParts = text.split(ticketRegex);

    ticketParts.forEach((part, tIdx) => {
        if (part.match(/^[A-Z]{2,6}-\d{1,5}$/)) {
            elements.push(renderJiraTicket(part, `ticket-${tIdx}`));
            return;
        }
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
                            {isUser && !isEditing && onEdit && (
                                <button 
                                    onClick={() => setIsEditing(true)} 
                                    className="opacity-0 group-hover:opacity-100 text-[9px] font-mono text-green-700 hover:text-green-500 uppercase tracking-wider transition-opacity"
                                >
                                    EDIT_CMD
                                </button>
                            )}
                            {!isUser && (
                                <button onClick={handleCopy} className="flex items-center gap-1 text-[9px] font-mono text-green-700 hover:text-green-500 transition-colors uppercase tracking-wider group/btn">
                                    {isCopied ? <span>COPIED</span> : <span>COPY_RAW</span>}
                                </button>
                            )}
                            <span className="text-[9px] font-mono text-green-800">
                                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                        </div>
                    </div>
                    
                    {isEditing ? (
                        <div className="space-y-2 animate-in fade-in">
                            <textarea 
                                ref={editInputRef}
                                value={editContent} 
                                onChange={(e) => setEditContent(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full bg-black border border-green-500/50 text-green-400 p-2 text-sm font-mono outline-none resize-none overflow-hidden"
                            />
                            <div className="flex gap-2 justify-end">
                                <button onClick={handleCancelEdit} className="text-[10px] px-2 py-1 border border-green-900 text-green-700 hover:border-green-500 hover:text-green-500">CANCEL</button>
                                <button onClick={handleSaveEdit} className="text-[10px] px-2 py-1 bg-green-900/20 border border-green-500 text-green-500 hover:bg-green-500 hover:text-black font-bold">SAVE & RESTART</button>
                            </div>
                        </div>
                    ) : (
                        <div className={`text-sm leading-relaxed text-green-400 ${message.isError ? 'text-red-500' : ''}`}>
                            {renderContent(message.content)}
                            {isStreaming && <span className="inline-block w-2 h-4 ml-1 align-middle cursor-blink bg-green-500"></span>}
                        </div>
                    )}
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
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
                    
                    {/* Edit Button for User */}
                    {isUser && !isEditing && onEdit && (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity hover:text-stc-coral" 
                            title="Edit & Regenerate"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                        </button>
                    )}

                    {!isUser && (
                         <button onClick={handleCopy} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stc-purple hover:text-stc-coral"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                         </button>
                    )}
                </div>

                <div className={`
                    px-5 py-3.5 shadow-xl text-sm leading-relaxed max-w-full w-full
                    ${isUser 
                        ? 'bg-stc-purple text-white rounded-2xl rounded-tr-sm' 
                        : 'bg-white border border-gray-100 text-gray-700 rounded-2xl rounded-tl-sm'}
                    ${message.isError ? 'border-stc-coral bg-red-50' : ''}
                `}>
                    {isEditing ? (
                        <div className="space-y-2 animate-in fade-in">
                            <textarea 
                                ref={editInputRef}
                                value={editContent} 
                                onChange={(e) => setEditContent(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full bg-white/10 border border-white/20 text-white p-2 text-sm rounded outline-none resize-none overflow-hidden placeholder-white/50"
                            />
                            <div className="flex gap-2 justify-end">
                                <button onClick={handleCancelEdit} className="text-[10px] px-2 py-1 rounded hover:bg-white/10">Cancel</button>
                                <button onClick={handleSaveEdit} className="text-[10px] px-3 py-1 bg-white text-stc-purple font-bold rounded shadow-sm hover:bg-stc-light">Save & Regenerate</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {renderContent(message.content)}
                            {isStreaming && (
                                <span className="inline-flex ml-1 translate-y-0.5">
                                    <span className="w-1 h-1 bg-current rounded-full animate-bounce"></span>
                                    <span className="w-1 h-1 bg-current rounded-full animate-bounce delay-100"></span>
                                    <span className="w-1 h-1 bg-current rounded-full animate-bounce delay-200"></span>
                                </span>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
}, (prevProps, nextProps) => {
    return (
        prevProps.message.content === nextProps.message.content &&
        prevProps.isStreaming === nextProps.isStreaming &&
        prevProps.message.isError === nextProps.message.isError &&
        prevProps.isTerminalMode === nextProps.isTerminalMode
    );
});
