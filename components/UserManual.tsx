
import React, { useState, useEffect } from 'react';

interface UserManualProps {
  isOpen: boolean;
  onClose: () => void;
  isTerminalMode: boolean;
}

export const UserManual: React.FC<UserManualProps> = ({ isOpen, onClose, isTerminalMode }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'commands' | 'modes'>('overview');

  if (!isOpen) return null;

  const containerClass = isTerminalMode 
    ? "bg-black border border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.2)] text-green-500 font-mono" 
    : "bg-white border border-stc-purple/20 shadow-2xl text-stc-purple font-sans";

  const tabClass = (tab: string) => {
    const isActive = activeTab === tab;
    if (isTerminalMode) {
        return `px-4 py-2 text-xs font-bold border-b-2 transition-colors ${isActive ? 'border-green-500 text-green-400 bg-green-900/20' : 'border-transparent text-green-700 hover:text-green-500'}`;
    }
    return `px-4 py-2 text-xs font-bold border-b-2 transition-colors ${isActive ? 'border-stc-coral text-stc-purple bg-stc-purple/5' : 'border-transparent text-gray-400 hover:text-stc-purple'}`;
  };

  // --- INTERACTIVE DEMO COMPONENTS ---

  const AutoFixDemo = () => {
      const [state, setState] = useState<'idle' | 'error' | 'fixing' | 'fixed'>('idle');
      
      useEffect(() => {
          if (state === 'error') setTimeout(() => setState('fixing'), 1500);
          if (state === 'fixing') setTimeout(() => setState('fixed'), 1500);
      }, [state]);

      return (
          <div className={`mt-3 border rounded p-2 text-[10px] font-mono ${isTerminalMode ? 'bg-black border-green-500/30' : 'bg-slate-900 text-slate-300'}`}>
              <div className="flex justify-between border-b border-white/10 pb-1 mb-2">
                  <span>script.py</span>
                  <button 
                    onClick={() => setState('error')} 
                    disabled={state !== 'idle' && state !== 'fixed'}
                    className={`px-2 rounded ${state === 'idle' || state === 'fixed' ? 'bg-green-600 text-white' : 'bg-gray-600 opacity-50'}`}
                  >
                      {state === 'idle' || state === 'fixed' ? 'Run Script' : 'Running...'}
                  </button>
              </div>
              
              {state === 'idle' && <div className="text-gray-400">print(10 / 0) # Mistake</div>}
              
              {state === 'error' && (
                  <div className="animate-in fade-in">
                      <div className="text-red-400">ZeroDivisionError: division by zero</div>
                      <div className="text-yellow-400 mt-1">⚠ Agent detected error...</div>
                  </div>
              )}
              
              {state === 'fixing' && (
                   <div className="animate-in fade-in">
                       <div className="text-blue-400">&gt; Analyzing stack trace...</div>
                       <div className="text-blue-400">&gt; Rewriting code...</div>
                   </div>
              )}

              {state === 'fixed' && (
                  <div className="animate-in fade-in">
                       <div className="text-green-400">print(10 / 1) # Auto-Fixed</div>
                       <div className="text-green-400">&gt; Output: 10.0</div>
                  </div>
              )}
          </div>
      );
  };

  const DiffDemo = () => {
      const [mode, setMode] = useState<'raw' | 'diff'>('diff');
      return (
          <div className="mt-3">
              <div className="flex gap-2 mb-2">
                  <button onClick={() => setMode('raw')} className={`text-[9px] px-2 py-0.5 rounded border ${mode === 'raw' ? 'bg-current text-black' : 'opacity-50'}`}>Raw</button>
                  <button onClick={() => setMode('diff')} className={`text-[9px] px-2 py-0.5 rounded border ${mode === 'diff' ? 'bg-current text-black' : 'opacity-50'}`}>Visual Diff</button>
              </div>
              <div className={`border rounded p-2 text-[10px] font-mono h-20 overflow-hidden ${isTerminalMode ? 'bg-black border-green-500/30' : 'bg-slate-900 text-slate-300'}`}>
                  {mode === 'raw' ? (
                      <div className="opacity-70">
                          Old: server_port: 80<br/>
                          New: server_port: 8080
                      </div>
                  ) : (
                      <div className="grid grid-cols-2 gap-2">
                          <div className="bg-red-900/30 text-red-300 p-1">server_port: 80</div>
                          <div className="bg-green-900/30 text-green-300 p-1">server_port: 8080</div>
                      </div>
                  )}
              </div>
          </div>
      );
  };

  const SchemaDemo = () => {
      const [isStrict, setIsStrict] = useState(false);
      return (
          <div className="mt-3">
             <div className="flex items-center gap-2 mb-2">
                 <label className="text-[10px] font-bold uppercase">Strict Mode:</label>
                 <button 
                    onClick={() => setIsStrict(!isStrict)}
                    className={`w-8 h-4 rounded-full relative transition-colors ${isStrict ? 'bg-green-500' : 'bg-gray-600'}`}
                 >
                     <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${isStrict ? 'translate-x-4' : ''}`}></div>
                 </button>
             </div>
             <div className={`border rounded p-2 text-[10px] font-mono h-24 overflow-y-auto ${isTerminalMode ? 'bg-black border-green-500/30' : 'bg-slate-900 text-slate-300'}`}>
                 {!isStrict ? (
                     <div className="opacity-70 whitespace-pre-wrap">
                         Here is the data you asked for. It looks like this:<br/>
                         name: "Prod", status: "Active"<br/>
                         I hope that helps!
                     </div>
                 ) : (
                     <div className="text-green-400 whitespace-pre-wrap">
                         {`{
  "environment": "Prod",
  "status": "Active",
  "uptime": 99.9
}`}
                     </div>
                 )}
             </div>
          </div>
      );
  };

  const CoTDemo = () => {
      const [isOpen, setIsOpen] = useState(false);
      return (
          <div className="mt-3">
              <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`border rounded p-2 cursor-pointer select-none ${isTerminalMode ? 'border-green-500/30 bg-green-900/10' : 'border-gray-300 bg-gray-50'}`}
              >
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase opacity-70">
                      <span>{isOpen ? '▼' : '▶'}</span>
                      <span>Thinking Process</span>
                  </div>
                  {isOpen && (
                      <div className={`mt-2 pl-4 border-l-2 text-[10px] font-mono ${isTerminalMode ? 'border-green-500/50 text-green-400' : 'border-stc-purple/30 text-gray-600'}`}>
                          &gt; Detecting user intent: "Refactor"<br/>
                          &gt; Analyzing current context...<br/>
                          &gt; Identifying variables...<br/>
                          &gt; Generating optimization strategy...
                      </div>
                  )}
              </div>
              <div className="mt-2 text-[11px] pl-2 opacity-80">
                  Here is the optimized solution based on my analysis...
              </div>
          </div>
      );
  };

  const InteractiveFeature = ({ title, description, Demo }: { title: string, description: string, Demo: React.FC }) => (
    <div className={`p-4 rounded-lg border flex flex-col gap-2 ${isTerminalMode ? 'border-green-500/50 bg-black' : 'border-stc-purple/20 bg-stc-light'}`}>
        <h3 className="font-bold text-sm uppercase tracking-wider">{title}</h3>
        <p className="text-xs opacity-70 leading-relaxed min-h-[40px]">{description}</p>
        <Demo />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className={`w-full max-w-4xl h-[80vh] flex flex-col rounded-xl overflow-hidden relative ${containerClass}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isTerminalMode ? 'border-green-500/50 bg-green-900/10' : 'border-stc-purple/10 bg-stc-light'}`}>
            <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
                <h2 className="text-lg font-bold tracking-wider">DEVOPS CHATBOT MANUAL v3.2</h2>
            </div>
            <button onClick={onClose} className="hover:opacity-70 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        </div>

        {/* Tabs */}
        <div className={`flex px-6 border-b ${isTerminalMode ? 'border-green-500/30' : 'border-stc-purple/10'}`}>
            <button onClick={() => setActiveTab('overview')} className={tabClass('overview')}>OVERVIEW</button>
            <button onClick={() => setActiveTab('features')} className={tabClass('features')}>INTERACTIVE FEATURES</button>
            <button onClick={() => setActiveTab('commands')} className={tabClass('commands')}>COMMANDS</button>
            <button onClick={() => setActiveTab('modes')} className={tabClass('modes')}>VISUAL MODES</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            
            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="text-center space-y-4 max-w-2xl mx-auto">
                        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center border-2 ${isTerminalMode ? 'border-green-500 bg-black text-green-500' : 'border-stc-purple bg-stc-purple text-white'}`}>
                             <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
                        </div>
                        <h1 className="text-2xl font-bold">DevOps Omni-Assistant</h1>
                        <p className="opacity-80 leading-relaxed">
                            An advanced interface bridging conversational AI with technical execution. 
                            Designed for SREs and Platform Engineers to debug infrastructure, 
                            visualize architecture, and run Python scripts directly in the browser.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                         <div className={`p-4 rounded border ${isTerminalMode ? 'border-green-500/30 bg-green-900/10' : 'border-stc-purple/10 bg-stc-light'}`}>
                            <h3 className="font-bold mb-2 text-sm flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                                Agentic Execution
                            </h3>
                            <p className="text-xs opacity-70">Runs Python locally via Wasm. Automatically detects execution errors and self-corrects the code in real-time.</p>
                        </div>
                        <div className={`p-4 rounded border ${isTerminalMode ? 'border-green-500/30 bg-green-900/10' : 'border-stc-purple/10 bg-stc-light'}`}>
                            <h3 className="font-bold mb-2 text-sm flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/></svg>
                                Interactive Visuals
                            </h3>
                            <p className="text-xs opacity-70">Render clickable Mermaid.js diagrams. Interact with nodes to dive deeper into architecture details.</p>
                        </div>
                        <div className={`p-4 rounded border ${isTerminalMode ? 'border-green-500/30 bg-green-900/10' : 'border-stc-purple/10 bg-stc-light'}`}>
                            <h3 className="font-bold mb-2 text-sm flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                                Log Intelligence
                            </h3>
                            <p className="text-xs opacity-70">Drag & drop log files. The system parses context and uses Chain-of-Thought reasoning to find root causes.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: FEATURES (INTERACTIVE) */}
            {activeTab === 'features' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-300">
                    
                    <InteractiveFeature 
                        title="Agentic Auto-Fix Loop" 
                        description="The AI detects execution errors in Python scripts and automatically rewrites the code to fix them."
                        Demo={AutoFixDemo}
                    />

                    <InteractiveFeature 
                        title="Strict Schema Enforcement" 
                        description="Forces the model to output machine-readable JSON instead of conversational text. Crucial for automation."
                        Demo={SchemaDemo}
                    />

                    <InteractiveFeature 
                        title="Visual Diff Engine" 
                        description="Automatically renders side-by-side comparisons for code refactoring requests."
                        Demo={DiffDemo}
                    />

                    <InteractiveFeature 
                        title="Chain of Thought (CoT)" 
                        description="Reveals the internal logic and reasoning steps before the final answer is generated."
                        Demo={CoTDemo}
                    />
                </div>
            )}

            {/* TAB: COMMANDS */}
            {activeTab === 'commands' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                    
                    {/* Keyboard Shortcuts Table */}
                    <div>
                        <h3 className={`text-sm font-bold border-b pb-2 mb-3 ${isTerminalMode ? 'border-green-500 text-green-500' : 'border-stc-purple text-stc-purple'}`}>Keyboard Shortcuts</h3>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="flex justify-between p-2 border rounded border-opacity-20">
                                <span>Command Palette</span>
                                <kbd className="font-mono opacity-70 bg-white/10 px-1 rounded">Ctrl + K</kbd>
                            </div>
                            <div className="flex justify-between p-2 border rounded border-opacity-20">
                                <span>Focus Input</span>
                                <kbd className="font-mono opacity-70 bg-white/10 px-1 rounded">Ctrl + /</kbd>
                            </div>
                            <div className="flex justify-between p-2 border rounded border-opacity-20">
                                <span>Edit Last Message</span>
                                <kbd className="font-mono opacity-70 bg-white/10 px-1 rounded">Arrow Up</kbd>
                            </div>
                            <div className="flex justify-between p-2 border rounded border-opacity-20">
                                <span>Toggle Terminal Mode</span>
                                <kbd className="font-mono opacity-70 bg-white/10 px-1 rounded">Alt + T</kbd>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm opacity-80 mt-6">
                        Type <code className={`px-1.5 py-0.5 rounded font-bold ${isTerminalMode ? 'bg-green-900 text-green-400' : 'bg-stc-purple text-white'}`}>/</code> in the input box to access quick templates.
                    </p>

                    <div className="grid gap-4">
                        {[
                            { cmd: '/diff', desc: 'Visual Diff', detail: 'Compare original vs modified code side-by-side. Uses Strict JSON Mode.' },
                            { cmd: '/admin', desc: 'System Administration', detail: 'Login to configure token limits, context size, and API Keys.' },
                            { cmd: '/audit', desc: 'Security Audit', detail: 'Paste code to get a structured vulnerability breakdown. Uses Strict JSON Mode.' },
                            { cmd: '/docker', desc: 'Generate Dockerfile', detail: 'Creates production-ready, multi-stage Dockerfiles.' },
                            { cmd: '/k8s', desc: 'Kubernetes Manifests', detail: 'Generates Deployment, Service, and Ingress YAMLs.' },
                            { cmd: '/ci', desc: 'Pipeline Generation', detail: 'Scaffolds GitHub Actions or Jenkinsfiles.' },
                            { cmd: '/regex', desc: 'Regex Helper', detail: 'Explains or generates complex regular expressions.' },
                        ].map((item, i) => (
                            <div key={i} className={`flex items-center p-3 rounded border ${isTerminalMode ? 'border-green-500/30 hover:bg-green-900/20' : 'border-stc-purple/10 hover:bg-stc-light'}`}>
                                <div className={`w-24 font-mono font-bold ${isTerminalMode ? 'text-green-400' : 'text-stc-coral'}`}>{item.cmd}</div>
                                <div className="flex-1">
                                    <div className="font-bold text-sm">{item.desc}</div>
                                    <div className="text-xs opacity-60">{item.detail}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB: MODES */}
            {activeTab === 'modes' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="space-y-4">
                        <h3 className={`text-lg font-bold border-b pb-2 ${isTerminalMode ? 'border-green-500' : 'border-stc-purple'}`}>GUI Mode (STC Brand)</h3>
                        <p className="text-sm opacity-80">Designed for modern corporate environments. High readability, friendly aesthetics.</p>
                        <div className="p-4 bg-stc-light border border-stc-purple/20 rounded-lg space-y-2">
                            <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-full bg-stc-purple"></div>
                                <div className="flex-1 bg-white rounded-lg p-2 shadow-sm text-stc-purple text-xs">
                                    Hello! I'm your DevOps Assistant.
                                </div>
                            </div>
                        </div>
                        <ul className="text-xs space-y-1 opacity-70 list-disc list-inside">
                            <li>Sans-serif typography</li>
                            <li>Light mode optimized</li>
                            <li>Corporate Color Palette</li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h3 className={`text-lg font-bold border-b pb-2 ${isTerminalMode ? 'border-green-500' : 'border-stc-purple'}`}>Terminal Mode</h3>
                        <p className="text-sm opacity-80">Designed for power users and retro-enthusiasts. High contrast, low distraction.</p>
                        <div className="p-4 bg-black border border-green-500 rounded-lg space-y-2 font-mono">
                            <div className="flex gap-2">
                                <div className="text-green-500 text-xs">{'>'} SYS_CORE</div>
                            </div>
                            <div className="text-green-400 text-xs pl-4">
                                System Online. Ready for input...<span className="animate-pulse">_</span>
                            </div>
                        </div>
                         <ul className="text-xs space-y-1 opacity-70 list-disc list-inside">
                            <li>Monospace typography</li>
                            <li>CRT Scanline effects (Optional)</li>
                            <li>Matrix Rain background (Optional)</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
    