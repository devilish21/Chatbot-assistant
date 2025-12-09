
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

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div
                className={`w-full max-w-4xl h-[80vh] flex flex-col rounded-xl overflow-hidden relative ${containerClass}`}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`flex items-center justify-between px-6 py-4 border-b ${isTerminalMode ? 'border-green-500/50 bg-green-900/10' : 'border-stc-purple/10 bg-stc-light'}`}>
                    <div className="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>
                        <h2 className="text-lg font-bold tracking-wider">DEVOPS CHATBOT MANUAL v2.5</h2>
                    </div>
                    <button onClick={onClose} className="hover:opacity-70 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
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
                                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4" /><path d="M3.34 19a10 10 0 1 1 17.32 0" /></svg>
                                </div>
                                <h1 className="text-2xl font-bold">DevOps Omni-Assistant</h1>
                                <p className="opacity-80 leading-relaxed">
                                    An advanced interface bridging conversational AI with technical execution.
                                    Designed for SREs and Platform Engineers to debug infrastructure,
                                    audit security, and generate code with high precision.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                                <div className={`p-4 rounded border ${isTerminalMode ? 'border-green-500/30 bg-green-900/10' : 'border-stc-purple/10 bg-stc-light'}`}>
                                    <h3 className="font-bold mb-2 text-sm flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                                        Admin Control
                                    </h3>
                                    <p className="text-xs opacity-70">Secure configuration hub to manage token limits, context windows, and system personas via the <code>/admin</code> command.</p>
                                </div>
                                <div className={`p-4 rounded border ${isTerminalMode ? 'border-green-500/30 bg-green-900/10' : 'border-stc-purple/10 bg-stc-light'}`}>
                                    <h3 className="font-bold mb-2 text-sm flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
                                        Prompt Library
                                    </h3>
                                    <p className="text-xs opacity-70">Save, organize, and instantly inject complex engineering prompts or reusable code snippets.</p>
                                </div>
                                <div className={`p-4 rounded border ${isTerminalMode ? 'border-green-500/30 bg-green-900/10' : 'border-stc-purple/10 bg-stc-light'}`}>
                                    <h3 className="font-bold mb-2 text-sm flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></svg>
                                        Log Analysis
                                    </h3>
                                    <p className="text-xs opacity-70">Drag & drop .log, .json, or .yaml files directly into the chat for instant root cause analysis.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: FEATURES */}
                    {activeTab === 'features' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-300">

                            {/* Admin Console */}
                            <div className={`p-5 rounded-lg border flex flex-col gap-3 ${isTerminalMode ? 'border-green-500/50 bg-black' : 'border-stc-purple/20 bg-stc-light'}`}>
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-sm">Admin Console</h3>
                                    <kbd className={`px-1.5 py-0.5 rounded text-[10px] border ${isTerminalMode ? 'border-green-500' : 'border-stc-purple/30'}`}>/admin</kbd>
                                </div>
                                <p className="text-xs opacity-70 leading-relaxed">
                                    A restricted area to fine-tune the LLM. Adjust the <strong>Max Output Tokens</strong> (response length) and <strong>Context Window Size</strong> (memory capacity) to optimize for performance or depth.
                                </p>
                            </div>

                            {/* Prompt Library */}
                            <div className={`p-5 rounded-lg border flex flex-col gap-3 ${isTerminalMode ? 'border-green-500/50 bg-black' : 'border-stc-purple/20 bg-stc-light'}`}>
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-sm">Snippet Repository</h3>
                                    <div className={`w-5 h-5 flex items-center justify-center rounded border ${isTerminalMode ? 'border-green-500' : 'border-stc-purple/30'}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /></svg>
                                    </div>
                                </div>
                                <p className="text-xs opacity-70 leading-relaxed">
                                    Access the library via the Book icon. Save frequently used prompt templates or code blocks. Inject them into the chat with a single click.
                                </p>
                            </div>

                            {/* Internal Tools */}
                            <div className={`p-5 rounded-lg border flex flex-col gap-3 ${isTerminalMode ? 'border-green-500/50 bg-black' : 'border-stc-purple/20 bg-stc-light'}`}>
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-sm">Infrastructure Hub</h3>
                                    <span className="text-[10px] font-mono opacity-50">RIGHT_RAIL</span>
                                </div>
                                <p className="text-xs opacity-70 leading-relaxed">
                                    Navigate internal services (Jenkins, Jira, SonarQube, Nexus, Bitbucket, ELK, Grafana) via the right sidebar. Expand services to see specific instances and URLs.
                                </p>
                            </div>

                            {/* Admin Dashboard */}
                            <div className={`p-5 rounded-lg border flex flex-col gap-3 ${isTerminalMode ? 'border-green-500/50 bg-black' : 'border-stc-purple/20 bg-stc-light'}`}>
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-sm">System Dashboard</h3>
                                    <div className="flex gap-2">
                                        <kbd className={`px-1.5 py-0.5 rounded text-[10px] border ${isTerminalMode ? 'border-green-500' : 'border-stc-purple/30'}`}>Cmd+K</kbd>
                                        <kbd className={`px-1.5 py-0.5 rounded text-[10px] border ${isTerminalMode ? 'border-green-500' : 'border-stc-purple/30'}`}>D</kbd>
                                    </div>
                                </div>
                                <p className="text-xs opacity-70 leading-relaxed">
                                    View real-time system metrics, LLM request success rates, and tool usage statistics. Features interactive charts and activity logs.
                                </p>
                            </div>

                            {/* Zen Mode */}
                            <div className={`p-5 rounded-lg border flex flex-col gap-3 ${isTerminalMode ? 'border-green-500/50 bg-black' : 'border-stc-purple/20 bg-stc-light'}`}>
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-sm">Zen Mode</h3>
                                    <span className="text-[10px] font-mono opacity-50">HEADER_BTN</span>
                                </div>
                                <p className="text-xs opacity-70 leading-relaxed">
                                    Toggle "Zen Mode" in the header to collapse all sidebars and focus purely on the chat interface and code generation.
                                </p>
                            </div>

                            {/* Session Management */}
                            <div className={`p-5 rounded-lg border flex flex-col gap-3 ${isTerminalMode ? 'border-green-500/50 bg-black' : 'border-stc-purple/20 bg-stc-light'}`}>
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-sm">Session History</h3>
                                    <span className="text-[10px] font-mono opacity-50">LEFT_RAIL</span>
                                </div>
                                <p className="text-xs opacity-70 leading-relaxed">
                                    Rename sessions by hovering and clicking the Pencil icon. Delete old logs with the Trash icon. History is persisted locally.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* TAB: COMMANDS */}
                    {activeTab === 'commands' && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                            <p className="text-sm opacity-80">
                                Type <code className={`px-1.5 py-0.5 rounded font-bold ${isTerminalMode ? 'bg-green-900 text-green-400' : 'bg-stc-purple text-white'}`}>/</code> in the input box to access quick templates.
                            </p>

                            <div className="grid gap-4">
                                {[
                                    { cmd: '/admin', desc: 'System Administration', detail: 'Login to configure token limits, context size, and system prompts.' },
                                    { cmd: '/audit', desc: 'Security Audit', detail: 'Past code snippets to get a breakdown of vulnerabilities.' },
                                    { cmd: '/docker', desc: 'Generate Dockerfile', detail: 'Creates production-ready, multi-stage Dockerfiles.' },
                                    { cmd: '/k8s', desc: 'Kubernetes Manifests', detail: 'Generates Deployment, Service, and Ingress YAMLs.' },
                                    { cmd: '/ci', desc: 'Pipeline Generation', detail: 'Scaffolds GitHub Actions or Jenkinsfiles.' },
                                    { cmd: '/regex', desc: 'Regex Helper', detail: 'Explains or generates complex regular expressions.' },
                                    { cmd: '/explain', desc: 'Code Explanation', detail: 'Breaks down complex logs or code into simple terms.' },
                                    { cmd: '/regex', desc: 'Regex Helper', detail: 'Explains or generates complex regular expressions.' },
                                    { cmd: '/explain', desc: 'Code Explanation', detail: 'Breaks down complex logs or code into simple terms.' },
                                    { cmd: '/tools', desc: 'List MCP Tools', detail: 'Displays all available DevOps tools from connected servers.' },
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
                                    <li>CRT Scanline effects</li>
                                    <li>Matrix Rain background</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
