
import React, { useState } from 'react';
import { Message } from '../types';

interface SuggestionRailProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  isLoading: boolean;
  isTerminalMode: boolean;
  messages?: Message[];
  onToggleSuggestions: () => void;
  suggestionsEnabled: boolean;
}

interface Instance {
  id: string;
  name: string;
  url: string;
}

interface ServiceTool {
  id: string;
  name: string;
  icon: React.ReactNode;
  instances: Instance[];
}

const SERVICE_DATA: ServiceTool[] = [
    { 
        id: 'jenkins', 
        name: 'Jenkins', 
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                 <path d="M12 0.5C10.5 0.5 9.2 1.2 8.5 2.2C7.8 1.2 6.5 0.5 5 0.5C2.8 0.5 1 2.3 1 4.5C1 6.2 2.1 7.7 3.6 8.2C3.5 8.4 3.5 8.7 3.5 9C3.5 13.7 7.3 17.5 12 17.5C16.7 17.5 20.5 13.7 20.5 9C20.5 8.7 20.5 8.4 20.4 8.2C21.9 7.7 23 6.2 23 4.5C23 2.3 21.2 0.5 19 0.5C17.5 0.5 16.2 1.2 15.5 2.2C14.8 1.2 13.5 0.5 12 0.5ZM12 20C7.6 20 4 23.6 4 23.6H20C20 23.6 16.4 20 12 20Z" transform="translate(0, -2) scale(1)" />
                 <path d="M12 13C10.9 13 10 12.1 10 11H14C14 12.1 13.1 13 12 13Z" className="opacity-70"/>
            </svg>
        ),
        instances: [
            { id: 'j1', name: 'Jenkins Master', url: 'http://jenkins-master:8080' },
            { id: 'j2', name: 'Jenkins Agents Prod', url: 'http://jenkins-agent:8080' },
            { id: 'j3', name: 'Jenkins QA', url: 'http://jenkins-qa:8080' }
        ]
    },
    { 
        id: 'nexus', 
        name: 'Nexus', 
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                 <path d="M12 2L2.5 7.5V16.5L12 22L21.5 16.5V7.5L12 2ZM12 4.3L18.5 8V14.8L12 18.5L5.5 14.8V8L12 4.3Z" />
                 <path d="M12 22V12" className="opacity-50"/>
                 <path d="M2.5 7.5L12 12L21.5 7.5" className="opacity-50"/>
            </svg>
        ),
        instances: [
            { id: 'n1', name: 'Nexus Docker Registry', url: 'http://nexus-docker:8081' },
            { id: 'n2', name: 'Nexus Maven Mirror', url: 'http://nexus-maven:8081' },
            { id: 'n3', name: 'Nexus NPM Proxy', url: 'http://nexus-npm:8081' }
        ]
    },
    { 
        id: 'sonar', 
        name: 'SonarQube', 
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                 <path d="M12 2C17.5 2 22 6.5 22 12C22 17.5 17.5 22 12 22C6.5 22 2 17.5 2 12C2 6.5 6.5 2 12 2ZM12 4C7.6 4 4 7.6 4 12C4 16.4 7.6 20 12 20C16.4 20 20 16.4 20 12C20 7.6 16.4 4 12 4Z" className="opacity-50"/>
                 <path d="M12 6C15.3 6 18 8.7 18 12C18 15.3 15.3 18 12 18C8.7 18 6 15.3 6 12C6 8.7 8.7 6 12 6ZM12 8C9.8 8 8 9.8 8 12C8 14.2 9.8 16 12 16C14.2 16 16 14.2 16 12C16 9.8 14.2 8 12 8Z"/>
                 <path d="M16.5 7.5L15 9L17 11H13V13H17L15 15L16.5 16.5L21 12L16.5 7.5Z" />
            </svg>
        ),
        instances: [
            { id: 's1', name: 'Sonar Enterprise', url: 'http://sonar-ent:9000' },
            { id: 's2', name: 'Sonar Community', url: 'http://sonar-oss:9000' }
        ]
    },
    { 
        id: 'bitbucket', 
        name: 'Bitbucket', 
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                 <path d="M2.6 2H21.4L18.2 17.1C17.9 18.7 16.5 20 14.8 20H9.2C7.5 20 6.1 18.7 5.8 17.1L2.6 2ZM14.5 13L12 8L9.5 13H14.5Z" />
            </svg>
        ),
        instances: [
            { id: 'b1', name: 'Bitbucket Server', url: 'https://bitbucket.org' }
        ]
    },
    { 
        id: 'jira', 
        name: 'Jira', 
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                 <path d="M11.5 10L5.1 16.4C4.3 17.2 4.3 18.5 5.1 19.3C5.9 20.1 7.2 20.1 8 19.3L14.4 12.9V10H11.5Z"/>
                 <path d="M11.5 2L5.1 8.4C4.3 9.2 4.3 10.5 5.1 11.3C5.9 12.1 7.2 12.1 8 11.3L14.4 4.9V2H11.5Z"/>
                 <path d="M20.6 10L14.2 16.4C13.4 17.2 13.4 18.5 14.2 19.3C15 20.1 16.3 20.1 17.1 19.3L23.5 12.9V10H20.6Z"/>
            </svg>
        ),
        instances: [
            { id: 'ji1', name: 'Jira Cloud', url: 'https://jira.atlassian.com' }
        ]
    },
    { 
        id: 'confluence', 
        name: 'Confluence', 
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                 <path d="M5.5 19L10.5 10H17.5L12.5 19H5.5ZM10.5 10L15.5 1H22.5L17.5 10H10.5Z"/>
            </svg>
        ),
        instances: [
            { id: 'cl1', name: 'Confluence Cloud', url: 'https://confluence.atlassian.com' }
        ]
    },
];

export const SuggestionRail: React.FC<SuggestionRailProps> = ({ 
    suggestions, 
    onSelect, 
    isLoading, 
    isTerminalMode, 
    messages,
    onToggleSuggestions,
    suggestionsEnabled
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  
  const containerClass = isTerminalMode
    ? "border-l border-green-500/50 bg-black/80"
    : "border-l border-gray-200 bg-stc-white/80 backdrop-blur-xl";
    
  const titleClass = isTerminalMode ? "text-green-500" : "text-stc-purple";

  const activeService = SERVICE_DATA.find(s => s.id === selectedServiceId);

  const handleExport = () => {
    if (!messages || messages.length === 0) return;
    const text = messages.map(m => `[${new Date(m.timestamp).toISOString()}] ${m.role.toUpperCase()}: \n${m.content}\n`).join('\n-------------------\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devops-chat-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`hidden md:flex w-80 flex-col h-full relative z-20 transition-all duration-300 ${containerClass}`}>
      
      {/* Top Section: Internal Tools */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar relative">
        <div className={`flex items-center justify-between mb-2 ${titleClass}`}>
            {activeService ? (
                <button 
                    onClick={() => setSelectedServiceId(null)}
                    className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest hover:underline ${isTerminalMode ? 'hover:text-green-400' : 'hover:text-stc-coral'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    BACK_TO_TOOLS
                </button>
            ) : (
                <>
                    <h2 className="text-[10px] font-bold uppercase tracking-widest">Infrastructure</h2>
                    <button onClick={handleExport} className="flex items-center gap-1.5 hover:text-green-400 transition-colors group" title="Export Log">
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-70 group-hover:opacity-100">Export Chat</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    </button>
                </>
            )}
        </div>

        <div className="space-y-2">
            {!activeService ? (
                /* Top Level: Service List (Icons Only) */
                <div className="grid grid-cols-2 gap-2">
                    {SERVICE_DATA.map((service) => (
                        <button
                            key={service.id}
                            onClick={() => setSelectedServiceId(service.id)}
                            className={`
                                flex flex-col items-center justify-center p-4 border transition-all duration-300 group relative overflow-hidden
                                ${isTerminalMode 
                                    ? 'bg-black border-green-500/50 hover:border-green-400 hover:bg-green-900/20 text-green-500' 
                                    : 'bg-white border-gray-200 hover:border-stc-purple hover:text-stc-purple text-gray-600 rounded-lg shadow-sm'}
                            `}
                        >
                            <div className="mb-2 opacity-80 group-hover:scale-110 group-hover:text-current transition-all duration-300">
                                {service.icon}
                            </div>
                            <span className={`text-xs font-bold tracking-wide ${isTerminalMode ? 'font-mono' : 'font-sans'}`}>
                                {service.name}
                            </span>
                            <span className={`text-[9px] mt-1 opacity-50 ${isTerminalMode ? 'font-mono' : ''}`}>
                                {service.instances.length} Instances
                            </span>
                        </button>
                    ))}
                </div>
            ) : (
                /* Detail Level: Instance List (Simple Links) */
                <div className="space-y-2 animate-in slide-in-from-right-4 duration-300">
                     <div className="flex items-center gap-3 mb-4 opacity-80 pb-2 border-b border-slate-800/50">
                        <div className={`${isTerminalMode ? 'text-green-500' : 'text-stc-purple'}`}>
                            {activeService.icon}
                        </div>
                        <span className={`text-sm font-bold ${isTerminalMode ? 'text-green-500' : 'text-stc-purple'}`}>{activeService.name} Nodes</span>
                     </div>

                    {activeService.instances.map((inst) => (
                        <a 
                            key={inst.id}
                            href={inst.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`
                                flex items-center justify-between p-3 border transition-all duration-300 group
                                ${isTerminalMode 
                                    ? 'bg-black border-green-500/50 hover:border-green-400 text-green-500 hover:bg-green-900/20' 
                                    : 'bg-white border-gray-200 hover:border-stc-purple text-gray-600 hover:text-stc-purple rounded-lg shadow-sm'}
                            `}
                        >
                            <span className={`text-xs font-bold tracking-wide ${isTerminalMode ? 'font-mono' : 'font-sans'}`}>
                                {inst.name}
                            </span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 group-hover:opacity-100 transition-opacity"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        </a>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* Bottom Section: Suggestions */}
      <div className={`p-5 space-y-3 mb-2 relative z-10 border-t ${isTerminalMode ? 'border-green-500/50' : 'border-gray-200'}`}>
        <div className={`flex items-center justify-between mb-1 ${titleClass}`}>
            <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                <h2 className="text-[10px] font-bold uppercase tracking-widest">Next Actions</h2>
            </div>
            
            {/* Suggestions Toggle */}
            <div className="flex items-center gap-2">
                 {!isLoading && suggestions.length > 0 && suggestionsEnabled && (
                    <span className={`text-[9px] animate-pulse mr-2 ${isTerminalMode ? 'text-green-400' : 'text-stc-purple/50'}`}>● UPDATED</span>
                )}
                <button 
                    onClick={onToggleSuggestions}
                    className={`
                        relative w-8 h-4 rounded-full transition-colors duration-300 focus:outline-none
                        ${suggestionsEnabled 
                            ? (isTerminalMode ? 'bg-green-500' : 'bg-stc-coral') 
                            : (isTerminalMode ? 'bg-green-900/30' : 'bg-gray-300')}
                    `}
                    title={suggestionsEnabled ? "Disable Suggestions (Save Load)" : "Enable Suggestions"}
                >
                    <span className={`
                        absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform duration-300
                        ${suggestionsEnabled ? 'translate-x-4' : 'translate-x-0'}
                    `}></span>
                </button>
            </div>
        </div>

        {!suggestionsEnabled ? (
            <div className={`text-[10px] italic text-center py-3 border border-dashed opacity-60 ${isTerminalMode ? 'text-green-500 border-green-500/30' : 'text-gray-400 border-gray-300'}`}>
                Suggestions disabled.
            </div>
        ) : isLoading ? (
           <div className="space-y-2 opacity-50">
             <div className={`h-8 border animate-pulse flex items-center px-2 ${isTerminalMode ? 'border-green-500 bg-green-900/10' : 'border-gray-200 bg-gray-100'}`}>
                <span className={`text-[9px] ${isTerminalMode ? 'text-green-500' : 'text-gray-400'}`}>SCANNING_CONTEXT...</span>
             </div>
             <div className={`h-8 border animate-pulse ${isTerminalMode ? 'border-green-500 bg-green-900/10' : 'border-gray-200 bg-gray-100'}`} style={{animationDelay: '100ms'}}></div>
             <div className={`h-8 border animate-pulse ${isTerminalMode ? 'border-green-500 bg-green-900/10' : 'border-gray-200 bg-gray-100'}`} style={{animationDelay: '200ms'}}></div>
           </div>
        ) : (
          <div className="space-y-1.5">
            {suggestions.length > 0 ? suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSelect(suggestion)}
                className={`
                    w-full text-left group relative p-2.5 border transition-all duration-200 
                    ${isTerminalMode 
                        ? 'bg-black border-green-500 text-green-500 hover:border-green-400 hover:text-green-400 hover:shadow-[0_0_10px_rgba(34,197,94,0.2)]' 
                        : 'bg-white border-gray-200 text-gray-600 hover:border-stc-purple hover:bg-stc-purple hover:text-white rounded-md shadow-sm'}
                    active:scale-[0.98]
                `}
              >
                <p className="text-[11px] font-medium leading-relaxed line-clamp-3">
                  <span className="mr-1.5 opacity-50 text-[9px]">{index + 1}</span>
                  {suggestion}
                </p>
              </button>
            )) : (
                <div className={`text-[10px] italic text-center py-3 border border-dashed ${isTerminalMode ? 'text-green-500 border-green-500/30' : 'text-gray-400 border-gray-300'}`}>
                    // No actions detected
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
