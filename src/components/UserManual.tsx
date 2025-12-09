
import React, { useState } from 'react';
import { X, Search, Terminal, Book, Cpu, Shield, Activity, GitBranch, Database, FileText } from 'lucide-react';

interface UserManualProps {
    isOpen: boolean;
    onClose: () => void;
    isTerminalMode: boolean;
}

export const UserManual: React.FC<UserManualProps> = ({ isOpen, onClose, isTerminalMode }) => {
    const [activeSection, setActiveSection] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');

    if (!isOpen) return null;

    const sections = [
        { id: 'overview', label: 'System Overview', icon: <Activity className="w-4 h-4" /> },
        { id: 'interface', label: 'Interface & Modes', icon: <Terminal className="w-4 h-4" /> },
        { id: 'devops-suite', label: 'DevOps Suite (MCP)', icon: <Cpu className="w-4 h-4" /> },
        { id: 'admin', label: 'Admin & Security', icon: <Shield className="w-4 h-4" /> },
        { id: 'commands', label: 'Command Reference', icon: <Book className="w-4 h-4" /> },
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'overview':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="prose prose-invert max-w-none">
                            <h2 className="text-2xl font-bold text-gray-100 mb-4">DevOps Omni-Assistant</h2>
                            <p className="text-gray-300 leading-relaxed">
                                Welcome to the most advanced local DevOps assistant. This system integrates a local Large Language Model (LLM) with a suite of real-world DevOps tools via the Model Context Protocol (MCP).
                            </p>

                            <div className="my-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                                    <h3 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                                        <Database className="w-4 h-4" /> Local Intelligence
                                    </h3>
                                    <p className="text-sm text-gray-400">Powered by Ollama running locally. No data leaves your network.</p>
                                </div>
                                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                                    <h3 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                                        <GitBranch className="w-4 h-4" /> Tool Integration
                                    </h3>
                                    <p className="text-sm text-gray-400">Directly interacts with Jenkins, Jira, SonarQube, and more.</p>
                                </div>
                            </div>

                            <h3 className="text-xl font-semibold text-gray-200 mt-8 mb-4">Core Capabilities</h3>
                            <ul className="list-disc list-inside text-gray-300 space-y-2">
                                <li><strong>Start Builds:</strong> Trigger Jenkins pipelines purely via natural language.</li>
                                <li><strong>Analyze Code:</strong> Fetch SonarQube metrics and get AI-driven improvements.</li>
                                <li><strong>Manage Tickets:</strong> Create, summarize, and update Jira issues.</li>
                                <li><strong>Search Logs:</strong> Query Elasticsearch for error patterns.</li>
                                <li><strong>Visualize Data:</strong> Fetch Grafana dashboard states.</li>
                            </ul>
                        </div>
                    </div>
                );
            case 'interface':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-2xl font-bold text-gray-100">Interface & Modes</h2>

                        <div className="space-y-8">
                            <section>
                                <h3 className="text-lg font-semibold text-purple-400 mb-3">GUI vs. Terminal Mode</h3>
                                <p className="text-gray-300 mb-4">
                                    Toggle between two distinct visual experiences using the <code className="bg-black/30 px-1.5 py-0.5 rounded text-xs border border-gray-700">TERM_MODE</code> button.
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-black border border-green-900/50 rounded-lg">
                                        <div className="text-green-500 font-mono text-xs mb-2">$ ./terminal_mode</div>
                                        <p className="text-gray-400 text-sm">Hacker-style aesthetic with scanlines, monospace fonts, and high-contrast green text. Optimized for engineering flows.</p>
                                    </div>
                                    <div className="p-4 bg-white/5 border border-purple-500/20 rounded-lg">
                                        <div className="text-purple-300 font-sans text-xs mb-2">GUI Mode</div>
                                        <p className="text-gray-400 text-sm">Modern, clean glassmorphism design. Soft gradients and polished UI elements for executive presentations.</p>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-lg font-semibold text-blue-400 mb-3">Command Palette</h3>
                                <p className="text-gray-300 mb-2">
                                    Press <kbd className="bg-gray-800 px-2 py-1 rounded text-xs border border-gray-700 shadow-sm">Cmd+K</kbd> or <kbd className="bg-gray-800 px-2 py-1 rounded text-xs border border-gray-700 shadow-sm">Ctrl+K</kbd> to open the Omni-Bar.
                                </p>
                                <ul className="text-sm text-gray-400 space-y-1 ml-4 list-disc">
                                    <li>Quickly switch sessions</li>
                                    <li>Toggle modes</li>
                                    <li>Access Admin Console</li>
                                    <li>Open documentation</li>
                                </ul>
                            </section>
                        </div>
                    </div>
                );
            case 'devops-suite':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-2xl font-bold text-gray-100">DevOps Suite (MCP)</h2>
                        <div className="p-4 bg-yellow-900/20 border border-yellow-700/30 rounded-lg mb-6">
                            <p className="text-sm text-yellow-200">
                                <strong>Note:</strong> All tool actions are read-only by default unless configured otherwise. The AI will ask for confirmation before sensitive actions.
                            </p>
                        </div>

                        <div className="grid gap-6">
                            {[
                                { name: 'Jenkins', color: 'text-red-400', desc: 'List jobs, get build status, trigger parameterized builds.' },
                                { name: 'Jira', color: 'text-blue-400', desc: 'Get issue details, summarize tickets, find assignees.' },
                                { name: 'SonarQube', color: 'text-cyan-400', desc: 'Retrieve project analysis, quality gates, and code smells.' },
                                { name: 'Nexus', color: 'text-green-400', desc: 'Search artifacts, list repositories, check versions.' },
                                { name: 'Bitbucket', color: 'text-blue-500', desc: 'List repositories, pull requests, and browse source files.' },
                                { name: 'Elasticsearch', color: 'text-yellow-400', desc: 'Query logs, check cluster health, analyze error rates.' },
                                { name: 'Grafana', color: 'text-orange-400', desc: 'List dashboards, check alert states.' }
                            ].map(tool => (
                                <div key={tool.name} className="flex gap-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                                    <div className={`mt-1 font-bold ${tool.color}`}>{tool.name}</div>
                                    <div className="text-gray-400 text-sm">{tool.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'admin':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-2xl font-bold text-gray-100">Admin & Security</h2>

                        <div className="space-y-6">
                            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                                <h3 className="text-lg font-semibold text-white mb-4">Admin Dashboard</h3>
                                <p className="text-gray-300 mb-4">
                                    Access the centralized dashboard to view system health, LLM performance, and tool usage statistics.
                                </p>
                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
                                    <div>
                                        <span className="block text-gray-500 text-xs uppercase tracking-wider mb-1">Access</span>
                                        Command Palette -&gt; Admin Console
                                    </div>
                                    <div>
                                        <span className="block text-gray-500 text-xs uppercase tracking-wider mb-1">Security</span>
                                        PIN Protected
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                                <h3 className="text-lg font-semibold text-white mb-4">Default Credentials</h3>
                                <div className="flex items-center gap-3 p-3 bg-black/30 rounded font-mono text-sm">
                                    <span className="text-gray-500">PIN:</span>
                                    <span className="text-green-400">admin</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return <div className="text-gray-400">Select a section to view details.</div>;
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`
                flex w-full max-w-5xl h-[80vh] bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden
                ${isTerminalMode ? 'shadow-[0_0_50px_rgba(34,197,94,0.1)] border-green-900/50' : 'shadow-[0_0_50px_rgba(124,58,237,0.1)]'}
            `}>
                {/* Sidebar */}
                <div className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col">
                    <div className="p-6 border-b border-gray-800">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            Documentation
                        </h1>
                        <div className="mt-4 relative">
                            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-300 focus:ring-2 focus:ring-blue-900/50 outline-none transition-all placeholder:text-gray-600"
                            />
                        </div>
                    </div>

                    <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                        {sections.map(section => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`
                                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                                    ${activeSection === section.id
                                        ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20'
                                        : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}
                                `}
                            >
                                {section.icon}
                                {section.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col bg-gray-900 relative">
                    <button
                        onClick={onClose}
                        className="absolute right-6 top-6 p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors z-10"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                        <div className="max-w-3xl mx-auto">
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
