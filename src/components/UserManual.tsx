
import React, { useState } from 'react';

interface UserManualProps {
    isOpen: boolean;
    onClose: () => void;
    isTerminalMode: boolean;
}

type Section = 'intro' | 'interface' | 'devops' | 'dashboard' | 'commands' | 'faq';

export const UserManual: React.FC<UserManualProps> = ({ isOpen, onClose, isTerminalMode }) => {
    const [activeSection, setActiveSection] = useState<Section>('intro');

    if (!isOpen) return null;

    const containerClass = isTerminalMode
        ? "bg-black border border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.2)] text-green-500 font-mono"
        : "bg-white border border-stc-purple/20 shadow-2xl text-stc-purple font-sans";

    const navItemClass = (section: Section) => {
        const isActive = activeSection === section;
        if (isTerminalMode) {
            return `w-full text-left px-4 py-3 text-xs font-bold transition-all border-l-2 ${isActive
                    ? 'border-green-500 bg-green-900/30 text-green-400'
                    : 'border-transparent text-green-700 hover:text-green-500 hover:bg-green-900/10'
                }`;
        }
        return `w-full text-left px-4 py-3 text-xs font-bold transition-all border-l-2 ${isActive
                ? 'border-stc-coral bg-stc-purple/5 text-stc-purple'
                : 'border-transparent text-gray-400 hover:text-stc-purple hover:bg-stc-purple/5'
            }`;
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'intro':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center space-y-4 max-w-lg mx-auto pt-10">
                            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center border-2 ${isTerminalMode ? 'border-green-500 bg-black text-green-500' : 'border-stc-purple bg-stc-purple text-white'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4" /><path d="M3.34 19a10 10 0 1 1 17.32 0" /></svg>
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight">DevOps Omni-Assistant</h1>
                            <p className="opacity-80 leading-relaxed text-sm">
                                Platform V2.5 • System Active
                            </p>
                        </div>

                        <div className="prose prose-sm max-w-none opacity-90">
                            <p className="leading-relaxed">
                                Welcome to the ultimate DevOps enabling tool. This assistant is designed to bridge the gap between
                                natural language intent and complex infrastructure execution. It combines a production-grade
                                LLM (Ollama/Qwen) with direct access to your internal toolchain via the Model Context Protocol (MCP).
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                                <div className={`p-4 rounded border ${isTerminalMode ? 'border-green-500/30 bg-green-900/10' : 'border-stc-purple/10 bg-stc-light'}`}>
                                    <h3 className="font-bold mb-2">Security First</h3>
                                    <p className="text-xs opacity-70">All actions are sandboxed. Read-only by default until explicitly authorized. Audit logs are persisted locally.</p>
                                </div>
                                <div className={`p-4 rounded border ${isTerminalMode ? 'border-green-500/30 bg-green-900/10' : 'border-stc-purple/10 bg-stc-light'}`}>
                                    <h3 className="font-bold mb-2">Context Aware</h3>
                                    <p className="text-xs opacity-70">The system understands your infrastructure topology, logs, and config files to provide relevant answers.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'interface':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h2 className="text-2xl font-bold mb-6">Interface Tour</h2>
                            <div className="space-y-6">
                                {[
                                    { title: '1. The Chat Stream', desc: 'The central communication hub. Supports markdown rendering, syntax highlighting for code, and streaming responses.' },
                                    { title: '2. Left Rail (Session History)', desc: 'Archives your past conversations. Rename sessions for clarity or delete them to maintain hygiene. Data is stored in LocalStorage.' },
                                    { title: '3. Right Rail (Infrastructure)', desc: 'A live view of your connected DevOps services. It dynamically renders active nodes and provides deep-links to their web UIs.' },
                                    { title: '4. Command Palette (Cmd+K)', desc: 'The power-user tool. Quickly jump to features, run utility commands, or toggle UI modes without leaving the keyboard.' },
                                    { title: '5. Admin Dashboard', desc: 'Real-time metrics visualization. access via Command Palette (`D`) to see tool usage and LLM health.' },
                                ].map((item, i) => (
                                    <div key={i} className={`flex gap-4 p-4 rounded-lg border ${isTerminalMode ? 'border-green-500/20 bg-green-900/5' : 'border-stc-purple/5 bg-gray-50'}`}>
                                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${isTerminalMode ? 'bg-green-500 text-black' : 'bg-stc-purple text-white'}`}>
                                            {i + 1}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm">{item.title}</h3>
                                            <p className="text-xs opacity-70 mt-1 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'devops':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-2xl font-bold mb-2">DevOps Suite Integration</h2>
                        <p className="opacity-70 text-sm mb-6">
                            The assistant is connected to 7 core DevOps services via the Model Context Protocol (MCP).
                            It can query these services in real-time to fetch status, logs, and configurations.
                        </p>

                        <div className="grid gap-3">
                            {[
                                { name: 'Jenkins', icon: 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z', url: 'http://localhost:3897', caps: 'Build Status, Job Logs, Pipeline Configs' },
                                { name: 'Jira', icon: 'M11.5 10L5.1 16.4 8 19.3 14.4 12.9V10h-2.9zm0-8L5.1 8.4 8 11.3 14.4 4.9V2h-2.9zm9.1 8L14.2 16.4 17.1 19.3 23.5 12.9V10h-2.9z', url: 'http://localhost:3898', caps: 'Issue Search, Project Summaries, Ticket Status' },
                                { name: 'SonarQube', icon: 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.4-1.4 3.6 3.6 7.6-7.6L19 8l-9 9z', url: 'http://localhost:3899', caps: 'Code Quality Gates, Vulnerability Metrics' },
                                { name: 'Nexus', icon: 'M12 2L2.5 7.5v9L12 22l9.5-5.5v-9L12 2zm0 2.3l6.5 3.7v7.6L12 19.3l-6.5-3.7V8L12 4.3z', url: 'http://localhost:3900', caps: 'Artifact Search, Repository Listing' },
                                { name: 'Bitbucket', icon: 'M2.6 2h18.8l-3.2 15.1c-.3 1.6-1.7 2.9-3.4 2.9H9.2c-1.7 0-3.1-1.3-3.4-2.9L2.6 2zm11.9 11L12 8l-2.5 5h5z', url: 'http://localhost:3901', caps: 'Repo Browsing, PR Analysis, File Content' },
                                { name: 'Elasticsearch', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-1.07 3.97-2.9 5.4z', url: 'http://localhost:3902', caps: 'Log Search, Cluster Health, Index Patterns' },
                                { name: 'Grafana', icon: 'M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm-1 14h-2v-5h2v5zm4 0h-2v-3h2v3zm4 0h-2v-7h2v7z', url: 'http://localhost:3903', caps: 'Dashboard Listing, DataSource Status' },
                            ].map((tool, i) => (
                                <div key={i} className={`flex items-center p-3 rounded border ${isTerminalMode ? 'border-green-500/30 hover:bg-green-900/10' : 'border-stc-purple/10 hover:bg-stc-light'} transition-colors`}>
                                    <div className={`p-2 rounded-lg mr-4 ${isTerminalMode ? 'bg-green-900/30 text-green-400' : 'bg-stc-purple/10 text-stc-purple'}`}>
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d={tool.icon} /></svg>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-sm">{tool.name}</h3>
                                            <span className={`text-[10px] font-mono opacity-50 ${isTerminalMode ? 'text-green-500' : 'text-gray-500'}`}>{tool.url}</span>
                                        </div>
                                        <p className="text-xs opacity-70 mt-1">{tool.caps}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'dashboard':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
                        <div className={`p-6 rounded-lg border flex flex-col items-center text-center space-y-4 ${isTerminalMode ? 'border-green-500 bg-black' : 'border-stc-purple bg-stc-purple text-white'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><line x1="3" x2="21" y1="9" y2="9" /><line x1="9" x2="9" y1="21" y2="9" /></svg>
                            <div>
                                <h3 className="text-lg font-bold">Comprehensive System Metrics</h3>
                                <p className="opacity-80 text-sm mt-1 max-w-sm mx-auto">Monitor LLM performance, tool execution success rates, and real-time usage stats.</p>
                            </div>
                            <div className="flex gap-2 text-xs font-mono mt-2">
                                <div className={`px-2 py-1 rounded border ${isTerminalMode ? 'border-green-400' : 'border-white/40 bg-white/10'}`}>Cmd + K</div>
                                <div className={`px-2 py-1 rounded border ${isTerminalMode ? 'border-green-400' : 'border-white/40 bg-white/10'}`}>D</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-bold border-b pb-2 opacity-80">Dashboard Features</h3>
                            <ul className="grid grid-cols-1 gap-3">
                                <li className="flex items-start gap-2 text-sm opacity-80">
                                    <span className="text-green-500 font-bold">✓</span>
                                    <div><strong className="block">KPI Cards</strong> Total Requests, Success Rate, Active Tools.</div>
                                </li>
                                <li className="flex items-start gap-2 text-sm opacity-80">
                                    <span className="text-green-500 font-bold">✓</span>
                                    <div><strong className="block">LLM Health Index</strong> Pie chart visualization of AI response codes (200 OK vs Errors).</div>
                                </li>
                                <li className="flex items-start gap-2 text-sm opacity-80">
                                    <span className="text-green-500 font-bold">✓</span>
                                    <div><strong className="block">Tool Popularity</strong> Bar charts showing which DevOps tools are used most frequently.</div>
                                </li>
                                <li className="flex items-start gap-2 text-sm opacity-80">
                                    <span className="text-green-500 font-bold">✓</span>
                                    <div><strong className="block">Activity Timeline</strong> Chronological log of all system actions.</div>
                                </li>
                            </ul>
                        </div>
                    </div>
                );

            case 'commands':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-2xl font-bold mb-6">Command Reference</h2>
                        <div className="grid gap-2">
                            {[
                                { cmd: '/admin', desc: 'Admin Console', detail: 'Configure token limits & context' },
                                { cmd: '/audit', desc: 'Security Audit', detail: 'Analyze code for vulnerabilities' },
                                { cmd: '/docker', desc: 'Dockerize', detail: 'Generate Dockerfiles for app' },
                                { cmd: '/k8s', desc: 'Kubernetes', detail: 'Generate K8s manifests' },
                                { cmd: '/ci', desc: 'CI Pipelines', detail: 'Create Jenkins/GitHub workflows' },
                                { cmd: '/regex', desc: 'Regexer', detail: 'Generate/Explain RegEx' },
                                { cmd: '/explain', desc: 'Explain Code', detail: 'Human-readable code summary' },
                                { cmd: '/tools', desc: 'List Tools', detail: 'Show available MCP tools' },
                            ].map((item, i) => (
                                <div key={i} className={`flex items-center justify-between p-3 rounded border ${isTerminalMode ? 'border-green-500/30' : 'border-stc-purple/10'}`}>
                                    <div className="flex items-center gap-4">
                                        <code className={`px-2 py-1 rounded text-xs font-bold ${isTerminalMode ? 'bg-green-900/30 text-green-400' : 'bg-stc-purple text-white'}`}>{item.cmd}</code>
                                        <div>
                                            <div className="font-bold text-sm">{item.desc}</div>
                                            <div className="text-xs opacity-60">{item.detail}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div
                className={`w-full max-w-5xl h-[85vh] flex rounded-2xl overflow-hidden relative ${containerClass}`}
                onClick={e => e.stopPropagation()}
            >
                {/* Sidebar */}
                <div className={`w-64 flex-shrink-0 flex flex-col border-r ${isTerminalMode ? 'border-green-500/30 bg-green-900/5' : 'border-stc-purple/10 bg-stc-light'}`}>
                    <div className="p-6 border-b border-inherit">
                        <h2 className="text-sm font-bold tracking-widest uppercase opacity-70">Documentation</h2>
                    </div>
                    <div className="flex-1 py-4 space-y-1">
                        <button onClick={() => setActiveSection('intro')} className={navItemClass('intro')}>INTRODUCTION</button>
                        <button onClick={() => setActiveSection('interface')} className={navItemClass('interface')}>INTERFACE TOUR</button>
                        <button onClick={() => setActiveSection('devops')} className={navItemClass('devops')}>DEVOPS SUITE</button>
                        <button onClick={() => setActiveSection('dashboard')} className={navItemClass('dashboard')}>ADMIN DASHBOARD</button>
                        <button onClick={() => setActiveSection('commands')} className={navItemClass('commands')}>COMMAND REFERENCE</button>
                    </div>
                    <div className="p-4 border-t border-inherit opacity-50 text-[10px] text-center">
                        User Manual v2.5<br />Build 2025.12.09
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col relative bg-opacity-50">
                    <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 hover:opacity-70 transition-opacity rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>

                    <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};
