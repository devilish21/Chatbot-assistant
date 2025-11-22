
import React, { useState } from 'react';

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

  const FeatureCard = ({ title, icon, description, usage }: { title: string, icon: React.ReactNode, description: string, usage: string }) => (
    <div className={`p-5 rounded-lg border flex flex-col gap-3 ${isTerminalMode ? 'border-green-500/50 bg-black' : 'border-stc-purple/20 bg-stc-light'}`}>
        <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm">{title}</h3>
            <div className={`w-6 h-6 flex items-center justify-center rounded border ${isTerminalMode ? 'border-green-500' : 'border-stc-purple/30'}`}>
                {icon}
            </div>
        </div>
        <p className="text-xs opacity-70 leading-relaxed">
            {description}
        </p>
        <div className={`mt-2 pt-3 border-t text-[10px] ${isTerminalMode ? 'border-green-500/30' : 'border-stc-purple/10'}`}>
            <span className="font-bold uppercase opacity-50 mr-2">How to use:</span>
            <span className="opacity-90">{usage}</span>
        </div>
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
                <h2 className="text-lg font-bold tracking-wider">DEVOPS CHATBOT MANUAL v3.1</h2>
            </div>
            <button onClick={onClose} className="hover:opacity-70 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        </div>

        {/* Tabs */}
        <div className={`flex px-6 border-b ${isTerminalMode ? 'border-green-500/30' : 'border-stc-purple/10'}`}>
            <button onClick={() => setActiveTab('overview')} className={tabClass('overview')}>OVERVIEW</button>
            <button onClick={() => setActiveTab('features')} className={tabClass('features')}>SYSTEM FEATURES</button>
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

            {/* TAB: FEATURES */}
            {activeTab === 'features' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-300">
                    
                    <FeatureCard 
                        title="Agentic Auto-Fix Loop" 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>}
                        description="Self-healing execution environment. If a Python script fails, the agent automatically analyzes the error, rewrites the code, and re-runs it without user intervention."
                        usage="Ask for a calculation or data processing task. If the initial code fails, watch the bot auto-correct."
                    />

                    <FeatureCard 
                        title="Visual Diff Engine" 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12h6"/><path d="M12 3v18"/><path d="M3 6h18"/><path d="M3 18h18"/></svg>}
                        description="Side-by-side code comparison. Visualizes infrastructure changes (Red/Green diffs) to validate refactors before applying them."
                        usage="Use the '/diff' command or ask the bot to 'Refactor this code'. The output will show a split view."
                    />

                    <FeatureCard 
                        title="Cognitive Reasoning (CoT)" 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 2a10 10 0 0 1 10 10h-10z"/><path d="m12 12 4.09-4.09L12 2"/></svg>}
                        description="Transparent reasoning process. Expand the 'Thinking Process' accordion to see how the AI deconstructed complex DevOps problems."
                        usage="Ask a complex logical question. Click 'Thinking Process' to reveal the internal step-by-step logic."
                    />

                    <FeatureCard 
                        title="Interactive Architecture" 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>}
                        description="Automatically renders Mermaid.js diagrams. Click on diagram nodes to automatically inject that component name into the chat for follow-up."
                        usage="Ask for a diagram (e.g., 'Draw a flow for OAuth'). Click a node like 'AuthService' to ask about it."
                    />

                    <FeatureCard 
                        title="Python Sandbox" 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>}
                        description="Execute Python code securely in your browser using WebAssembly (Pyodide). Perfect for math, JSON parsing, or testing logic."
                        usage="Ask the bot to write a Python script. Click 'Run' on the code block."
                    />

                    <FeatureCard 
                        title="Prompt Library" 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/></svg>}
                        description="Save frequently used templates or complex queries. Inject them into the chat with a single click."
                        usage="Click the Book icon inside the input bar. Use '+ New Snippet' to save current text."
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
                            { cmd: '/diff', desc: 'Visual Diff', detail: 'Compare original vs modified code side-by-side.' },
                            { cmd: '/admin', desc: 'System Administration', detail: 'Login to configure token limits, context size, and API Keys.' },
                            { cmd: '/audit', desc: 'Security Audit', detail: 'Paste code snippets to get a breakdown of vulnerabilities.' },
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
