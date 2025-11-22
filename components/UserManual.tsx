
import React, { useState, useEffect } from 'react';

interface UserManualProps {
  isOpen: boolean;
  onClose: () => void;
  isTerminalMode: boolean;
}

export const UserManual: React.FC<UserManualProps> = ({ isOpen, onClose, isTerminalMode }) => {
  const [activeTab, setActiveTab] = useState<'core' | 'intelligence' | 'visuals' | 'tools'>('core');

  if (!isOpen) return null;

  // --- STYLES ---
  const containerClass = isTerminalMode 
    ? "bg-black border border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.15)] text-green-500 font-mono" 
    : "bg-white border border-stc-purple/20 shadow-2xl text-stc-purple font-sans";

  const tabClass = (tab: string) => {
    const isActive = activeTab === tab;
    if (isTerminalMode) {
        return `flex-1 py-3 text-xs font-bold border-b-2 transition-colors uppercase tracking-wider ${isActive ? 'border-green-500 text-green-400 bg-green-900/20' : 'border-transparent text-green-700 hover:text-green-500'}`;
    }
    return `flex-1 py-3 text-xs font-bold border-b-2 transition-colors uppercase tracking-wider ${isActive ? 'border-stc-coral text-stc-purple bg-stc-purple/5' : 'border-transparent text-gray-400 hover:text-stc-purple'}`;
  };

  // --- INTERACTIVE DEMOS ---

  const AutoFixDemo = () => {
      const [state, setState] = useState<'idle' | 'error' | 'fixing' | 'fixed'>('idle');
      
      useEffect(() => {
          if (state === 'error') setTimeout(() => setState('fixing'), 1500);
          if (state === 'fixing') setTimeout(() => setState('fixed'), 1500);
      }, [state]);

      return (
          <div className={`mt-3 border rounded p-3 text-[10px] font-mono ${isTerminalMode ? 'bg-black border-green-500/30' : 'bg-slate-900 text-slate-300'}`}>
              <div className="flex justify-between border-b border-white/10 pb-2 mb-2 items-center">
                  <span className="opacity-70">deploy_script.py (Sandboxed)</span>
                  <button 
                    onClick={() => setState('error')} 
                    disabled={state !== 'idle' && state !== 'fixed'}
                    className={`px-3 py-1 rounded font-bold transition-all ${state === 'idle' || state === 'fixed' ? 'bg-green-600 text-white hover:bg-green-500' : 'bg-gray-600 opacity-50'}`}
                  >
                      {state === 'idle' || state === 'fixed' ? '▶ Run Script' : 'Running...'}
                  </button>
              </div>
              
              <div className="space-y-1 min-h-[60px]">
                  {state === 'idle' && <div className="text-gray-400">print(10 / 0) # Intentional Error</div>}
                  
                  {state === 'error' && (
                      <div className="animate-in fade-in">
                          <div className="text-red-400">Traceback (most recent call last):</div>
                          <div className="text-red-400">ZeroDivisionError: division by zero</div>
                          <div className="text-yellow-400 mt-2 font-bold">⚠ AGENT ALERT: Execution Failed.</div>
                          <div className="text-yellow-400"> Feeding error back to LLM for correction...</div>
                      </div>
                  )}
                  
                  {state === 'fixing' && (
                       <div className="animate-in fade-in">
                           <div className="text-blue-400">&gt; Reading stack trace...</div>
                           <div className="text-blue-400">&gt; Identifying root cause...</div>
                           <div className="text-blue-400">&gt; Rewriting code block...</div>
                       </div>
                  )}

                  {state === 'fixed' && (
                      <div className="animate-in fade-in">
                           <div className="text-green-400"># Auto-Correction Applied:</div>
                           <div className="text-green-400">print(10 / 1) # Safe Division</div>
                           <div className="text-green-400 mt-2">&gt; Output: 10.0</div>
                           <div className="text-green-500 font-bold mt-1">✔ SELF-HEALING COMPLETE</div>
                      </div>
                  )}
              </div>
          </div>
      );
  };

  const DiffDemo = () => {
      const [mode, setMode] = useState<'raw' | 'diff'>('diff');
      return (
          <div className="mt-3">
              <div className="flex gap-2 mb-2 justify-end">
                  <button onClick={() => setMode('raw')} className={`text-[9px] px-2 py-0.5 rounded border ${mode === 'raw' ? 'bg-gray-700 text-white' : 'opacity-50'}`}>Raw Text</button>
                  <button onClick={() => setMode('diff')} className={`text-[9px] px-2 py-0.5 rounded border ${mode === 'diff' ? 'bg-gray-700 text-white' : 'opacity-50'}`}>Visual Diff</button>
              </div>
              <div className={`border rounded p-2 text-[10px] font-mono h-24 overflow-hidden ${isTerminalMode ? 'bg-black border-green-500/30' : 'bg-slate-900 text-slate-300'}`}>
                  {mode === 'raw' ? (
                      <div className="opacity-70 p-2">
                          original: "replicas: 3"<br/>
                          modified: "replicas: 5"<br/>
                          (Hard to read in large files)
                      </div>
                  ) : (
                      <div className="grid grid-cols-2 gap-px bg-gray-700 h-full">
                          <div className="bg-slate-900 p-2">
                              <div className="text-gray-500 text-[8px] mb-1 uppercase">Original</div>
                              <div className="bg-red-900/30 text-red-300 px-1">replicas: 3</div>
                          </div>
                          <div className="bg-slate-900 p-2">
                              <div className="text-gray-500 text-[8px] mb-1 uppercase">Modified</div>
                              <div className="bg-green-900/30 text-green-300 px-1">replicas: 5</div>
                          </div>
                      </div>
                  )}
              </div>
          </div>
      );
  };

  const CoTDemo = () => {
      const [isOpen, setIsOpen] = useState(false);
      return (
          <div className="mt-3 select-none">
              <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`border rounded p-2 cursor-pointer transition-colors ${isTerminalMode ? 'border-green-500/30 bg-green-900/10 hover:bg-green-900/30' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
              >
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase opacity-80">
                      <span className="transition-transform duration-200" style={{transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)'}}>▶</span>
                      <span>Internal Monologue (Chain of Thought)</span>
                  </div>
                  {isOpen && (
                      <div className={`mt-2 pl-3 border-l-2 text-[10px] font-mono animate-in slide-in-from-top-2 ${isTerminalMode ? 'border-green-500/50 text-green-400' : 'border-stc-purple/30 text-gray-600'}`}>
                          <span className="opacity-50">1.</span> Analyzing user request: "Optimize Dockerfile"<br/>
                          <span className="opacity-50">2.</span> Checking best practices: Multi-stage builds, cache layering.<br/>
                          <span className="opacity-50">3.</span> Detecting security risks: Running as root.<br/>
                          <span className="opacity-50">4.</span> Formulating response...
                      </div>
                  )}
              </div>
              <div className="mt-2 text-[11px] pl-2 opacity-80 italic">
                  "Here is the optimized Dockerfile based on my analysis..."
              </div>
          </div>
      );
  };

  const LogDemo = () => {
      const [status, setStatus] = useState<'idle'|'analyzing'>('idle');
      return (
        <div 
            className={`mt-3 border-2 border-dashed rounded-lg h-24 flex flex-col items-center justify-center cursor-pointer transition-all ${status === 'idle' ? (isTerminalMode ? 'border-green-500/30 hover:border-green-500' : 'border-gray-300 hover:border-stc-purple') : 'border-transparent bg-opacity-10 bg-blue-500'}`}
            onMouseEnter={() => setStatus('analyzing')}
            onMouseLeave={() => setStatus('idle')}
        >
            {status === 'idle' ? (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2 opacity-50"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                    <span className="text-[10px] font-bold uppercase opacity-70">Drag & Drop Log File</span>
                </>
            ) : (
                <div className="text-center animate-pulse">
                    <div className="text-xs font-bold text-blue-400 mb-1">READING CONTEXT...</div>
                    <div className="text-[9px] opacity-70 font-mono">Parsing 15,000 lines...</div>
                </div>
            )}
        </div>
      );
  };

  const PersonaDemo = () => {
      const [mode, setMode] = useState<'gui'|'term'>('gui');
      return (
          <div className="mt-3">
              <div className="flex rounded overflow-hidden border border-opacity-20 mb-2">
                  <button onClick={() => setMode('gui')} className={`flex-1 py-1 text-[9px] font-bold ${mode === 'gui' ? 'bg-stc-purple text-white' : 'bg-gray-200 text-gray-500'}`}>GUI MODE</button>
                  <button onClick={() => setMode('term')} className={`flex-1 py-1 text-[9px] font-bold ${mode === 'term' ? 'bg-black text-green-500' : 'bg-gray-200 text-gray-500'}`}>TERMINAL MODE</button>
              </div>
              <div className={`p-3 rounded border h-20 text-[10px] transition-all duration-300 flex items-center ${
                  mode === 'gui' 
                    ? 'bg-white border-stc-purple/20 text-stc-purple font-sans shadow-sm' 
                    : 'bg-black border-green-500 text-green-500 font-mono shadow-[0_0_10px_rgba(34,197,94,0.2)]'
              }`}>
                  {mode === 'gui' ? (
                      <div className="flex gap-2 items-center">
                          <div className="w-6 h-6 rounded-full bg-stc-purple flex items-center justify-center text-white text-[8px]">AI</div>
                          <div className="bg-stc-light px-2 py-1 rounded-lg">Hello! How can I help?</div>
                      </div>
                  ) : (
                      <div>
                          <span className="mr-2">&gt; SYS_CORE:</span>
                          <span className="animate-pulse">System Online_</span>
                      </div>
                  )}
              </div>
          </div>
      );
  }

  const BranchingDemo = () => (
      <div className={`mt-3 p-3 rounded border relative overflow-hidden ${isTerminalMode ? 'bg-black border-green-500/30' : 'bg-slate-50 border-gray-200'}`}>
          <div className="flex flex-col gap-4 relative z-10">
               <div className={`p-1.5 rounded w-fit text-[9px] ${isTerminalMode ? 'bg-green-900/30 text-green-400' : 'bg-white border shadow-sm'}`}>1. User: Fix this code</div>
               <div className={`p-1.5 rounded w-fit text-[9px] self-end ${isTerminalMode ? 'bg-green-900/30 text-green-400' : 'bg-white border shadow-sm'}`}>2. AI: Here is v1...</div>
               <div className="flex items-center gap-2">
                   <div className={`p-1.5 rounded w-fit text-[9px] border-2 border-dashed ${isTerminalMode ? 'border-green-500 text-green-500' : 'border-stc-coral text-stc-purple'}`}>3. User (Edit): Actually, use Python.</div>
                   <span className="text-[9px] font-bold uppercase opacity-50">&larr; Context Branch Created</span>
               </div>
               <div className={`p-1.5 rounded w-fit text-[9px] self-end opacity-50 ${isTerminalMode ? 'bg-green-900/30' : 'bg-white border'}`}>4. AI: Here is Python v2...</div>
          </div>
          {/* Connecting lines simulation */}
          <div className={`absolute left-4 top-4 bottom-4 w-0.5 ${isTerminalMode ? 'bg-green-500/20' : 'bg-gray-300'}`}></div>
      </div>
  );

  const FeatureCard = ({ title, desc, children }: { title: string, desc: string, children?: React.ReactNode }) => (
    <div className={`p-4 rounded-lg border flex flex-col h-full ${isTerminalMode ? 'border-green-500/40 bg-green-900/5 hover:bg-green-900/10' : 'border-stc-purple/10 bg-white hover:shadow-md'} transition-all`}>
        <h3 className={`text-xs font-bold uppercase tracking-widest mb-2 ${isTerminalMode ? 'text-green-400' : 'text-stc-coral'}`}>{title}</h3>
        <p className="text-[11px] opacity-70 leading-relaxed mb-auto">{desc}</p>
        {children}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className={`w-full max-w-5xl h-[85vh] flex flex-col rounded-xl overflow-hidden relative ${containerClass}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isTerminalMode ? 'border-green-500/50 bg-green-900/10' : 'border-stc-purple/10 bg-stc-light'}`}>
            <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded ${isTerminalMode ? 'bg-green-500 text-black' : 'bg-stc-purple text-white'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                </div>
                <div>
                    <h2 className="text-lg font-bold tracking-wider uppercase">DevOps Assistant v2.5</h2>
                    <p className="text-[10px] opacity-60 font-bold">User Operation Manual & Feature Reference</p>
                </div>
            </div>
            <button onClick={onClose} className="hover:opacity-70 transition-opacity p-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        </div>

        {/* Navigation */}
        <div className={`flex px-6 gap-6 border-b ${isTerminalMode ? 'border-green-500/30' : 'border-stc-purple/10'}`}>
            <button onClick={() => setActiveTab('core')} className={tabClass('core')}>1. Core Concepts</button>
            <button onClick={() => setActiveTab('intelligence')} className={tabClass('intelligence')}>2. Agentic Intelligence</button>
            <button onClick={() => setActiveTab('visuals')} className={tabClass('visuals')}>3. Visuals & Diffs</button>
            <button onClick={() => setActiveTab('tools')} className={tabClass('tools')}>4. Power Tools</button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            
            {/* --- CORE CONCEPTS --- */}
            {activeTab === 'core' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-300">
                    <FeatureCard 
                        title="Dual Persona Modes" 
                        desc="Switch between a polished 'GUI Mode' for presentations/management and a raw 'Terminal Mode' for high-focus engineering work. Affects fonts, colors, and animations."
                    >
                        <PersonaDemo />
                    </FeatureCard>

                    <FeatureCard 
                        title="Context Branching" 
                        desc="Never lose a train of thought. Edit ANY previous message (User or AI) to fork the conversation from that exact point. Useful for testing 'What If' scenarios."
                    >
                        <BranchingDemo />
                    </FeatureCard>

                    <FeatureCard 
                        title="Zen Mode" 
                        desc="Remove all distractions. Hides the sidebar, header, and footer, leaving only the code and the chat. Toggle via Command Palette or top-right button."
                    >
                        <div className={`mt-3 h-12 border-2 border-dashed rounded flex items-center justify-center opacity-50 text-[10px] font-bold uppercase ${isTerminalMode ? 'border-green-500' : 'border-stc-purple'}`}>
                            [ Sidebar Hidden ]
                        </div>
                    </FeatureCard>

                    <FeatureCard 
                        title="Chat Export" 
                        desc="Download your entire session history as a formatted .txt log file. Useful for post-mortems, documentation, or sharing with team members."
                    >
                        <div className="mt-3 flex items-center gap-2 opacity-70">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            <span className="text-[10px] font-mono">devops-chat-2023-10-27.txt</span>
                        </div>
                    </FeatureCard>
                </div>
            )}

            {/* --- INTELLIGENCE --- */}
            {activeTab === 'intelligence' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-300">
                     <FeatureCard 
                        title="Agentic Code Execution" 
                        desc="Sandboxed Python (Pyodide) runs directly in your browser. If execution fails, the Agent captures the error and SELF-CORRECTS the code automatically."
                    >
                        <AutoFixDemo />
                    </FeatureCard>

                    <FeatureCard 
                        title="Chain of Thought (CoT)" 
                        desc="See the AI's brain at work. The model streams its internal monologue inside collapsible tags, revealing how it analyzed the problem before answering."
                    >
                        <CoTDemo />
                    </FeatureCard>

                    <FeatureCard 
                        title="Strict Schema Enforcement" 
                        desc="For automation tasks, force the AI to output 100% valid JSON instead of chatty text. Crucial for generating config files or structured audits."
                    >
                        <div className={`mt-3 p-2 rounded text-[10px] font-mono whitespace-pre ${isTerminalMode ? 'bg-green-900/20 text-green-400' : 'bg-slate-800 text-blue-300'}`}>
                            {`{
  "status": "verified",
  "confidence": 0.98
} // Guaranteed JSON`}
                        </div>
                    </FeatureCard>

                    <FeatureCard 
                        title="Log Analysis Engine" 
                        desc="Drag and drop .log, .json, or .yaml files. The system injects file content into the context window for root-cause analysis and pattern detection."
                    >
                        <LogDemo />
                    </FeatureCard>
                </div>
            )}

            {/* --- VISUALS --- */}
            {activeTab === 'visuals' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-300">
                    <FeatureCard 
                        title="Visual Diff Engine" 
                        desc="When refactoring code, don't just read the changes. See a side-by-side Red/Green 'Git Style' diff to verify modifications instantly."
                    >
                        <DiffDemo />
                    </FeatureCard>

                    <FeatureCard 
                        title="Interactive Diagrams" 
                        desc="Mermaid.js diagrams are rendered interactively. Click on nodes (e.g., a 'Database' node) to inject context about that specific component into your next prompt."
                    >
                         <div className={`mt-3 border rounded p-2 flex justify-center ${isTerminalMode ? 'bg-black border-green-500/30' : 'bg-white border-gray-200'}`}>
                             <div className="flex items-center gap-2">
                                 <div className="px-2 py-1 rounded border text-[9px] font-bold cursor-pointer hover:scale-105 transition-transform">Client</div>
                                 <div className="w-4 border-t border-current"></div>
                                 <div className="px-2 py-1 rounded border text-[9px] font-bold cursor-pointer hover:scale-105 transition-transform bg-opacity-10 bg-blue-500">Load Balancer</div>
                                 <div className="w-4 border-t border-current"></div>
                                 <div className="px-2 py-1 rounded border text-[9px] font-bold cursor-pointer hover:scale-105 transition-transform">Server</div>
                             </div>
                         </div>
                    </FeatureCard>
                    
                    <FeatureCard 
                        title="Toast Notifications" 
                        desc="Non-intrusive system alerts keep you informed about background processes, errors, and successful operations without blocking your workflow."
                    >
                        <div className={`mt-3 p-2 rounded shadow-lg flex items-center gap-2 text-[10px] w-fit ${isTerminalMode ? 'bg-black border border-green-500 text-green-500' : 'bg-white border text-stc-purple'}`}>
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            System Update Complete
                        </div>
                    </FeatureCard>
                </div>
            )}

            {/* --- TOOLS --- */}
            {activeTab === 'tools' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FeatureCard 
                            title="Command Palette (Ctrl+K)" 
                            desc="A power-user menu to access every feature in the app without leaving the keyboard. Switch sessions, toggle modes, or run scripts."
                        >
                             <div className="mt-3 flex gap-2">
                                 <kbd className={`px-2 py-1 rounded text-[10px] font-mono border ${isTerminalMode ? 'border-green-500 bg-green-900/20' : 'bg-gray-100 border-gray-200'}`}>Ctrl</kbd>
                                 <span>+</span>
                                 <kbd className={`px-2 py-1 rounded text-[10px] font-mono border ${isTerminalMode ? 'border-green-500 bg-green-900/20' : 'bg-gray-100 border-gray-200'}`}>K</kbd>
                             </div>
                        </FeatureCard>

                        <FeatureCard 
                            title="Utility Suite" 
                            desc="Built-in offline tools available via the 'Tools' button. Includes a YAML Validator, JSON Formatter, and Base64 Encoder/Decoder."
                        >
                            <div className="mt-3 flex gap-2 text-[9px] font-bold uppercase">
                                <span className="px-2 py-1 rounded border opacity-70">YAML</span>
                                <span className="px-2 py-1 rounded border opacity-70">JSON</span>
                                <span className="px-2 py-1 rounded border opacity-70">B64</span>
                            </div>
                        </FeatureCard>
                     </div>

                     <div className={`p-4 rounded-lg border ${isTerminalMode ? 'border-green-500/40 bg-green-900/5' : 'border-stc-purple/10 bg-white'}`}>
                        <h3 className="font-bold text-sm uppercase tracking-widest mb-4">Prompt Library & Slash Commands</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { cmd: '/audit', desc: 'Security review of code' },
                                { cmd: '/diff', desc: 'Generate code refactor' },
                                { cmd: '/docker', desc: 'Create Dockerfiles' },
                                { cmd: '/k8s', desc: 'K8s Manifests' },
                                { cmd: '/regex', desc: 'Regex Generator' },
                                { cmd: '/ci', desc: 'Pipeline Templates' }
                            ].map(c => (
                                <div key={c.cmd} className={`flex items-center justify-between p-2 rounded border ${isTerminalMode ? 'border-green-500/20 hover:bg-green-900/20' : 'border-gray-100 hover:bg-stc-light'}`}>
                                    <code className="font-mono font-bold text-xs">{c.cmd}</code>
                                    <span className="text-[10px] opacity-70">{c.desc}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] mt-4 opacity-60">
                            * You can also save your own frequently used prompts to the <strong>Prompt Library</strong> for one-click insertion.
                        </p>
                     </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
