
import React, { useState, useEffect, useRef } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { SessionSidebar } from './components/SessionSidebar';
import { Footer } from './components/Footer';
import CommandPalette from './components/CommandPalette';
import { UserManual } from './components/UserManual';
import { ToastContainer } from './components/Toast';
import { PromptLibrary } from './components/PromptLibrary';
import { AdminPanel } from './components/AdminPanel';
import { AppConfig, ChatSession, Toast, Snippet } from './types';
import { DEFAULT_CONFIG } from './constants';

const STORAGE_KEY = 'devops_chatbot_sessions';
const SNIPPETS_KEY = 'devops_chatbot_snippets';
const CONFIG_KEY = 'devops_chatbot_config';

const App: React.FC = () => {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isTerminalMode, setIsTerminalMode] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  
  // Session Management
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  
  // UI Visibility States
  const [showManual, setShowManual] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showPromptLibrary, setShowPromptLibrary] = useState(false);

  // Advanced Features State
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [snippets, setSnippets] = useState<Snippet[]>([]);

  // Matrix Rain Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 1. Load Data (Config, Sessions, Snippets) on Mount
  useEffect(() => {
    // A. Load LocalStorage Config (User Preferences / Admin Overrides)
    const savedConfig = localStorage.getItem(CONFIG_KEY);
    if (savedConfig) {
        try {
            // We merge saved config with DEFAULT_CONFIG to ensure new keys in constants.ts are picked up
            setConfig(prev => ({...prev, ...JSON.parse(savedConfig)}));
        } catch(e) { console.error("Config parse error", e); }
    }

    // B. Load Sessions (Non-blocking parsing)
    // We use a timeout to allow the initial UI to paint before parsing potentially large JSON
    setTimeout(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setSessions(parsed);
              setActiveSessionId(parsed[0].id);
            } else {
                createNewSession(false);
            }
          } catch (e) {
            console.error("Failed to parse sessions", e);
            createNewSession(false);
          }
        } else {
            createNewSession(false);
        }
        setIsLoaded(true);
    }, 10);

    // C. Load Snippets
    const savedSnippets = localStorage.getItem(SNIPPETS_KEY);
    if (savedSnippets) {
        try {
            setSnippets(JSON.parse(savedSnippets));
        } catch (e) { console.error("Failed to parse snippets", e); }
    }
  }, []);

  // 2. Persistence Effects
  useEffect(() => {
    if (isLoaded && sessions.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }
  }, [sessions, isLoaded]);

  useEffect(() => {
      localStorage.setItem(SNIPPETS_KEY, JSON.stringify(snippets));
  }, [snippets]);

  useEffect(() => {
      // We still save to local storage so edits persist for the Admin user immediately
      localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  }, [config]);

  // 3. Matrix Rain Animation Effect (Only if enabled in config)
  useEffect(() => {
    // If Visual Effects are disabled, do not run the canvas loop
    if (config.enableVisualEffects === false) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set explicit dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = '01ABCDEFSTC'; 
    const fontSize = 14;
    const columns = Math.ceil(canvas.width / fontSize);
    const drops: number[] = new Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = isTerminalMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(249, 247, 252, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = isTerminalMode ? '#22c55e' : '#4F008C'; 
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);

    const handleResize = () => {
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    };
    window.addEventListener('resize', handleResize);

    return () => {
        clearInterval(interval);
        window.removeEventListener('resize', handleResize);
    };
  }, [isTerminalMode, config.enableVisualEffects]);

  const createNewSession = (shouldToast = true) => {
    const welcomeMsg = config.welcomeMessage || DEFAULT_CONFIG.welcomeMessage;
    
    const newSession: ChatSession = {
        id: Date.now().toString(),
        title: 'New Session',
        timestamp: Date.now(),
        messages: [
            {
                id: 'welcome',
                role: 'model',
                content: welcomeMsg,
                timestamp: Date.now()
            }
        ],
        suggestions: [] 
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    if (shouldToast && isLoaded) addToast('New session created', 'info'); 
  };

  const handleUpdateSession = (updates: Partial<ChatSession>) => {
    setSessions(prev => prev.map(session => {
        if (session.id === activeSessionId) {
            const updatedSession = { ...session, ...updates };
            if (session.title === 'New Session') {
                const firstUserMsg = updatedSession.messages.find(m => m.role === 'user');
                if (firstUserMsg) {
                    updatedSession.title = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '');
                }
            }
            return updatedSession;
        }
        return session;
    }));
  };

  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, title: newTitle } : s));
  };

  const handleDeleteSession = (id: string) => {
    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);
    
    if (newSessions.length === 0) {
        createNewSession();
    } else if (activeSessionId === id) {
        setActiveSessionId(newSessions[0].id);
    }
    addToast('Session deleted', 'info');
  };

  const addToast = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
      const id = Date.now().toString();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
      }, 3000);
  };

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const tokenUsage = activeSession ? Math.ceil(JSON.stringify(activeSession.messages).length / 4) : 0;

  const themeClasses = isTerminalMode 
    ? "bg-black text-green-500 font-mono selection:bg-green-900 selection:text-green-100" 
    : "bg-stc-light text-stc-purple font-sans selection:bg-stc-coral selection:text-white";

  const headerClasses = isTerminalMode
    ? "border-b border-green-500/50 bg-black/90"
    : "border-b border-stc-purple/10 bg-stc-white/80";

  // Loading State (Initial)
  if (!activeSession && !isLoaded) return <div className={`h-screen w-full ${isTerminalMode ? 'bg-black' : 'bg-stc-light'}`}></div>;

  return (
    <div className={`relative flex h-screen w-full overflow-hidden transition-colors duration-300 ${themeClasses}`}>
      
      {config.enableVisualEffects !== false && (
          <canvas id="matrix-canvas" ref={canvasRef} className="absolute inset-0 z-0"></canvas>
      )}

      {config.enableVisualEffects !== false && (
          <div className={`scanlines pointer-events-none fixed inset-0 z-[100] opacity-20 transition-opacity duration-500 ${isTerminalMode ? 'block' : 'hidden'}`}></div>
      )}
      
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className={`absolute inset-0 bg-grid transition-opacity duration-500 ${isTerminalMode ? 'opacity-10' : 'opacity-5'}`}></div>
        <div className={`absolute inset-0 bg-gradient-to-b via-transparent opacity-60 ${isTerminalMode ? 'from-black/80 to-black/80' : 'from-stc-purple-deep/10 to-stc-purple-deep/10'}`}></div>
      </div>

      <main className="flex-1 flex flex-col relative min-w-0 z-10 backdrop-blur-[2px]">
        
        <ToastContainer toasts={toasts} isTerminalMode={isTerminalMode} />

        {/* GLOBAL SYSTEM ALERT BANNER */}
        {config.systemAlert && (
            <div className={`w-full px-4 py-2 flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-wider animate-in slide-in-from-top z-50 ${
                isTerminalMode 
                    ? 'bg-red-900/80 text-white border-b border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]' 
                    : 'bg-yellow-400 text-stc-purple-dark border-b border-yellow-500'
            }`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <span>{config.systemAlert}</span>
            </div>
        )}

        <CommandPalette 
            isOpen={false} 
            onClose={() => {}}
            isTerminalMode={isTerminalMode}
            actions={[
                { id: 'new', title: 'New Session', shortcut: ['N'], action: () => createNewSession(true) },
                { id: 'zen', title: 'Toggle Zen Mode', shortcut: ['Z'], action: () => setIsZenMode(!isZenMode) },
                { id: 'toggle', title: 'Toggle Terminal Mode', shortcut: ['T'], action: () => setIsTerminalMode(!isTerminalMode) },
                { id: 'manual', title: 'Open User Manual', shortcut: ['?'], action: () => setShowManual(true) },
                { id: 'admin', title: 'Admin Console', action: () => setShowAdmin(true) },
                { id: 'snippets', title: 'Open Prompt Library', shortcut: ['P'], action: () => setShowPromptLibrary(true) },
                ...sessions.map(s => ({ 
                    id: s.id, 
                    title: `Switch to: ${s.title}`, 
                    action: () => setActiveSessionId(s.id) 
                }))
            ]}
        />

        <UserManual 
            isOpen={showManual} 
            onClose={() => setShowManual(false)} 
            isTerminalMode={isTerminalMode} 
        />
        <PromptLibrary 
            isOpen={showPromptLibrary}
            onClose={() => setShowPromptLibrary(false)}
            isTerminalMode={isTerminalMode}
            snippets={snippets}
            setSnippets={setSnippets}
            onSelect={(content) => {
                navigator.clipboard.writeText(content);
                addToast('Snippet copied to clipboard', 'success');
                setShowPromptLibrary(false);
            }}
        />
        
        <AdminPanel 
            isOpen={showAdmin}
            onClose={() => setShowAdmin(false)}
            config={config}
            onSaveConfig={(newConfig) => setConfig(newConfig)}
            isTerminalMode={isTerminalMode}
            addToast={addToast}
        />

        <header className={`h-14 flex items-center px-6 justify-between backdrop-blur-md z-20 transition-colors duration-300 flex-shrink-0 ${headerClasses}`}>
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-7 h-7 rounded transition-colors ${isTerminalMode ? 'bg-black border border-green-500 text-green-500' : 'bg-stc-purple text-white'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4 4 4"/><path d="m14.5 4-5 16"/></svg>
            </div>
            <h1 className={`font-bold text-base tracking-widest flex items-center gap-2 ${isTerminalMode ? 'text-green-500 terminal-glow' : 'text-stc-purple'}`}>
              {config.botName.toUpperCase().split(' ')[0]}<span className={isTerminalMode ? "text-green-400 font-light" : "text-stc-coral font-light"}>{config.botName.toUpperCase().split(' ').slice(1).join(' ')}</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
             <button 
                onClick={() => setIsZenMode(!isZenMode)}
                className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded border transition-all ${isTerminalMode ? 'border-green-500 text-green-500 hover:bg-green-900/30' : 'border-stc-purple/20 text-stc-purple hover:bg-stc-purple hover:text-white'} ${isZenMode ? 'bg-green-500/20' : ''}`}
                title="Toggle Zen Mode"
             >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>
                <span className="text-[10px] font-bold uppercase tracking-wider">Zen Mode</span>
             </button>

             <button 
                onClick={() => setShowManual(true)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded border transition-all ${isTerminalMode ? 'border-green-500 text-green-500 hover:bg-green-900/30' : 'border-stc-purple/20 text-stc-purple hover:bg-stc-purple hover:text-white'}`}
                title="User Manual"
             >
                <span className="font-bold text-xs">?</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">Manual</span>
             </button>

             <button
                onClick={() => setIsTerminalMode(!isTerminalMode)}
                className={`
                  flex items-center gap-2 px-3 py-1 text-[10px] font-bold rounded-full border transition-all
                  ${isTerminalMode 
                    ? 'border-green-500 text-green-500 bg-black hover:text-black hover:bg-green-500' 
                    : 'border-stc-purple/20 text-stc-purple hover:bg-stc-purple hover:text-white bg-white'}
                `}
             >
                {isTerminalMode ? (
                   <>
                     <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
                     <span>TERM_MODE</span>
                   </>
                ) : (
                   <>
                     <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                     <span>GUI_MODE</span>
                   </>
                )}
             </button>

            <div className={`flex items-center gap-2 px-2 py-0.5 text-[10px] border rounded transition-colors ${isTerminalMode ? 'border-green-500 text-green-500' : 'border-stc-purple/20 text-stc-purple'}`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isTerminalMode ? 'bg-green-500' : 'bg-stc-purple'}`}></span>
              ONLINE
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden relative z-10">
            {!isZenMode && (
                <SessionSidebar 
                    sessions={sessions}
                    activeSessionId={activeSessionId}
                    onSelectSession={setActiveSessionId}
                    onNewSession={() => createNewSession(true)}
                    onDeleteSession={handleDeleteSession}
                    onRenameSession={handleRenameSession}
                    isTerminalMode={isTerminalMode}
                />
            )}

            {activeSession && (
                <ChatInterface 
                    key={activeSession.id} 
                    config={config} 
                    messages={activeSession.messages}
                    suggestions={activeSession.suggestions}
                    onSessionUpdate={handleUpdateSession}
                    isTerminalMode={isTerminalMode}
                    isZenMode={isZenMode}
                    onOpenPromptLibrary={() => setShowPromptLibrary(true)}
                    onOpenAdmin={() => setShowAdmin(true)}
                    addToast={addToast}
                    onToggleSuggestions={() => setConfig(prev => ({ ...prev, enableSuggestions: !prev.enableSuggestions }))}
                />
            )}
        </div>

        <Footer 
            isTerminalMode={isTerminalMode} 
            tokenUsage={tokenUsage} 
            contextWindowSize={config.contextWindowSize || DEFAULT_CONFIG.contextWindowSize} 
            enableVisualEffects={config.enableVisualEffects}
        />
      </main>
    </div>
  );
};

export default App;
