
import React, { useState } from 'react';
import { X, Search, Terminal, Book, Cpu, Shield, Activity, GitBranch, Database, Zap, Layout, MessageSquare } from 'lucide-react';

interface UserManualProps {
    isOpen: boolean;
    onClose: () => void;
    isTerminalMode: boolean;
    onSelectDemo?: (cmd: string) => void;
}

export const UserManual: React.FC<UserManualProps> = ({ isOpen, onClose, isTerminalMode, onSelectDemo }) => {
    const [activeSection, setActiveSection] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');

    if (!isOpen) return null;

    const themeColors = isTerminalMode ? {
        bg: 'bg-black/95',
        border: 'border-green-500/50',
        text: 'text-green-400',
        heading: 'text-green-500',
        accent: 'bg-green-500',
        accentText: 'text-black',
        hover: 'hover:bg-green-900/30',
        active: 'bg-green-900/50 border-green-500',
        glow: 'shadow-[0_0_30px_rgba(34,197,94,0.2)]'
    } : {
        bg: 'bg-white/90',
        border: 'border-stc-purple/20',
        text: 'text-stc-purple',
        heading: 'text-stc-purple-deep',
        accent: 'bg-stc-purple',
        accentText: 'text-white',
        hover: 'hover:bg-stc-purple/10',
        active: 'bg-stc-purple/10 border-stc-purple',
        glow: 'shadow-2xl'
    };

    const sections = [
        { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
        { id: 'chat-features', label: 'Chat Features', icon: <MessageSquare className="w-4 h-4" /> },
        { id: 'interface', label: 'Interface & Tools', icon: <Layout className="w-4 h-4" /> },
        { id: 'devops-suite', label: 'DevOps Suite', icon: <Cpu className="w-4 h-4" /> },
        { id: 'mission-control', label: 'Mission Control', icon: <Activity className="w-4 h-4" /> },
        { id: 'workflows', label: 'Agentic Flows', icon: <Zap className="w-4 h-4" /> },
        { id: 'commands', label: 'Commands', icon: <Terminal className="w-4 h-4" /> },
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'overview':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="prose max-w-none">
                            <h2 className={`text-3xl font-bold mb-4 ${themeColors.heading}`}>DevOps Omni-Assistant</h2>
                            <p className={`${themeColors.text} opacity-80 text-lg leading-relaxed`}>
                                Welcome to your <strong>Privacy-First</strong> local DevOps copilot. This system bridges the gap between local LLM intelligence (Ollama) and your real-world infrastructure.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                <div className={`p-6 rounded-xl border ${themeColors.border} ${isTerminalMode ? 'bg-black' : 'bg-white shadow-lg'}`}>
                                    <div className={`mb-4 p-3 rounded-lg w-fit ${isTerminalMode ? 'bg-green-900/20 text-green-500' : 'bg-blue-100 text-blue-600'}`}>
                                        <Database className="w-6 h-6" />
                                    </div>
                                    <h3 className={`text-xl font-bold mb-2 ${themeColors.heading}`}>Local Intelligence</h3>
                                    <p className={`${themeColors.text} opacity-70 text-sm`}>
                                        Powered by <strong>qwen3:8b</strong>. No data leaves your machine. Your code and logs stay private.
                                    </p>
                                </div>

                                <div className={`p-6 rounded-xl border ${themeColors.border} ${isTerminalMode ? 'bg-black' : 'bg-white shadow-lg'}`}>
                                    <div className={`mb-4 p-3 rounded-lg w-fit ${isTerminalMode ? 'bg-green-900/20 text-green-500' : 'bg-purple-100 text-purple-600'}`}>
                                        <GitBranch className="w-6 h-6" />
                                    </div>
                                    <h3 className={`text-xl font-bold mb-2 ${themeColors.heading}`}>MCP Integration</h3>
                                    <p className={`${themeColors.text} opacity-70 text-sm`}>
                                        Directly interacts with Jenkins, Jira, SonarQube, and other tools via the <strong>Model Context Protocol</strong>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );



            case 'chat-features':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                        <h2 className={`text-2xl font-bold ${themeColors.heading}`}>Chat Capabilities</h2>

                        {/* Session Management */}
                        <div className={`p-6 rounded-xl border ${themeColors.border} ${isTerminalMode ? 'bg-black' : 'bg-white shadow-sm'}`}>
                            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${themeColors.heading}`}>
                                <Database className="w-5 h-5" /> Session Management
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <h4 className={`font-bold text-sm ${themeColors.text}`}>Create & Switch</h4>
                                    <ul className={`text-xs opacity-70 space-y-1 list-disc pl-4 ${themeColors.text}`}>
                                        <li><strong>New Chat:</strong> Click the "New Chat" button in the sidebar or use the command palette (`Ctrl+K` then `N`).</li>
                                        <li><strong>Switch:</strong> Click any session in the sidebar sidebar to jump between threads.</li>
                                    </ul>
                                </div>
                                <div className="space-y-2">
                                    <h4 className={`font-bold text-sm ${themeColors.text}`}>Organize (Hover Actions)</h4>
                                    <ul className={`text-xs opacity-70 space-y-1 list-disc pl-4 ${themeColors.text}`}>
                                        <li><strong>Rename:</strong> Hover over a session and click the <span className="font-mono">[Edit]</span> icon to rename it.</li>
                                        <li><strong>Delete:</strong> Hover and click <span className="font-mono">[Trash]</span> to permanently remove a thread.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Message Actions */}
                        <div className={`p-6 rounded-xl border ${themeColors.border} ${isTerminalMode ? 'bg-black' : 'bg-white shadow-sm'}`}>
                            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${themeColors.heading}`}>
                                <MessageSquare className="w-5 h-5" /> Message Actions
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <h4 className={`font-bold text-sm ${themeColors.text}`}>Edit & Regenerate</h4>
                                    <p className={`text-xs opacity-70 ${themeColors.text}`}>
                                        Hover over any of your messages and click the <span className="font-mono">[Pencil]</span> icon. Modifying a message will <strong>truncate</strong> the conversation to that point and regenerate the response.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className={`font-bold text-sm ${themeColors.text}`}>Copy Output</h4>
                                    <p className={`text-xs opacity-70 ${themeColors.text}`}>
                                        Click the <span className="font-mono">[Copy]</span> icon on any AI response to copy the full markdown content to your clipboard.
                                    </p>
                                </div>
                            </div>
                        </div>



                        {/* Power Tools */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className={`p-6 rounded-xl border ${themeColors.border} ${isTerminalMode ? 'bg-black' : 'bg-white shadow-sm'}`}>
                                <div className="mb-3"><Book className={`w-6 h-6 ${themeColors.heading}`} /></div>
                                <h4 className={`font-bold mb-2 ${themeColors.heading}`}>Prompt Library</h4>
                                <p className={`text-xs opacity-70 ${themeColors.text}`}>
                                    Access a library of pre-saved prompts and snippets. Save commonly used commands or queries for quick access.
                                </p>
                            </div>

                            <div className={`p-6 rounded-xl border ${themeColors.border} ${isTerminalMode ? 'bg-black' : 'bg-white shadow-sm'}`}>
                                <div className="mb-3"><Search className={`w-6 h-6 ${themeColors.heading}`} /></div>
                                <h4 className={`font-bold mb-2 ${themeColors.heading}`}>Next Actions</h4>
                                <p className={`text-xs opacity-70 ${themeColors.text}`}>
                                    The "Suggestion Rail" at the bottom provides AI-generated follow-up questions to help dive deeper into a topic.
                                </p>
                            </div>
                        </div>
                    </div>
                );
            case 'interface':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                        <h2 className={`text-2xl font-bold ${themeColors.heading}`}>Smart Interface</h2>

                        <div className={`p-6 rounded-xl border ${themeColors.border} ${isTerminalMode ? 'bg-green-900/10' : 'bg-blue-50/50'}`}>
                            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${themeColors.heading}`}>
                                <Zap className="w-5 h-5" /> Smart Tool Activation
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${isTerminalMode ? 'bg-green-500 text-black' : 'bg-stc-purple text-white'}`}>1</div>
                                    <div>
                                        <h4 className={`font-bold ${themeColors.text}`}>Default: Safe Mode</h4>
                                        <p className={`${themeColors.text} opacity-70 text-sm mt-1`}>Tools start <strong>OFF</strong>. Visual indicators show the active status.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${isTerminalMode ? 'bg-green-500 text-black' : 'bg-stc-purple text-white'}`}>2</div>
                                    <div>
                                        <h4 className={`font-bold ${themeColors.text}`}>One-Click Enable</h4>
                                        <p className={`${themeColors.text} opacity-70 text-sm mt-1`}>
                                            Select a category (e.g., <strong>Jenkins</strong>) from the menu. The system <strong>automatically enables</strong> the Master Switch and displays a visual chip (e.g., <code>[JENKINS x]</code>) in your input bar.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modes */}
                        <div className={`p-6 rounded-xl border ${themeColors.border} ${isTerminalMode ? 'bg-black' : 'bg-white shadow-sm'}`}>
                            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${themeColors.heading}`}>
                                <Layout className="w-5 h-5" /> UI Experience Modes
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 p-1 rounded ${isTerminalMode ? 'bg-green-900/30' : 'bg-stc-purple/10'}`}>
                                        <div className="w-4 h-4 rounded-full border border-current"></div>
                                    </div>
                                    <div>
                                        <h4 className={`font-bold text-sm ${themeColors.text}`}>Zen Mode</h4>
                                        <p className={`text-xs opacity-70 ${themeColors.text}`}>
                                            Toggle via the header button or <code>Ctrl+K Z</code>. Hides the sidebar and maximizes the chat area for deep focus.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 p-1 rounded ${isTerminalMode ? 'bg-green-900/30' : 'bg-stc-purple/10'}`}>
                                        <Terminal className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className={`font-bold text-sm ${themeColors.text}`}>Terminal vs. GUI</h4>
                                        <p className={`text-xs opacity-70 ${themeColors.text}`}>
                                            Switch between the hacker-style <strong>Terminal Mode</strong> (Green/Black) and the modern <strong>GUI Mode</strong> (Purple/White/Glass) using the header toggle.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'mission-control':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                        <h2 className={`text-2xl font-bold ${themeColors.heading}`}>Mission Control Center</h2>
                        <p className={`${themeColors.text} opacity-80`}>
                            A comprehensive dashboard for monitoring your chatbot's health, analyzing logs, and reviewing user feedback. Access it via the <code>/admin</code> command or the header icon.
                        </p>

                        <div className="grid grid-cols-1 gap-6">
                            {/* Log Explorer */}
                            <div className={`p-6 rounded-xl border ${themeColors.border} ${isTerminalMode ? 'bg-black' : 'bg-white shadow-sm'}`}>
                                <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${themeColors.heading}`}>
                                    <Terminal className="w-5 h-5" /> Advanced Log Explorer
                                </h3>
                                <p className={`text-sm opacity-70 mb-4 ${themeColors.text}`}>
                                    Debug issues in real-time with powerful filtering tools.
                                </p>
                                <ul className={`grid grid-cols-1 md:grid-cols-3 gap-4 text-xs ${themeColors.text}`}>
                                    <li className={`p-3 rounded border ${themeColors.border} bg-opacity-50`}>
                                        <div className="font-bold mb-1">Search</div>
                                        Filter logs by message content or metadata.
                                    </li>
                                    <li className={`p-3 rounded border ${themeColors.border} bg-opacity-50`}>
                                        <div className="font-bold mb-1">Service Filter</div>
                                        Isolate logs from specific components (Frontend, MCP, etc).
                                    </li>
                                    <li className={`p-3 rounded border ${themeColors.border} bg-opacity-50`}>
                                        <div className="font-bold mb-1">Severity Toggles</div>
                                        Quickly toggle INFO, WARN, and ERROR log visibility.
                                    </li>
                                </ul>
                            </div>

                            {/* Feedback & Alerts */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className={`p-6 rounded-xl border ${themeColors.border} ${isTerminalMode ? 'bg-black' : 'bg-white shadow-sm'}`}>
                                    <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${themeColors.heading}`}>
                                        <MessageSquare className="w-5 h-5" /> Feedback Inbox
                                    </h3>
                                    <p className={`text-sm opacity-70 ${themeColors.text}`}>
                                        A dedicated tab to review user satisfaction.
                                    </p>
                                    <ul className={`mt-4 space-y-2 text-xs list-disc pl-4 opacity-70 ${themeColors.text}`}>
                                        <li>View Thumbs Up/Down ratings.</li>
                                        <li>Read qualitative user comments.</li>
                                        <li>Correlate feedback with Message IDs.</li>
                                    </ul>
                                </div>

                                <div className={`p-6 rounded-xl border ${themeColors.border} ${isTerminalMode ? 'bg-black' : 'bg-white shadow-sm'}`}>
                                    <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${themeColors.heading}`}>
                                        <Activity className="w-5 h-5" /> Visual Alerting
                                    </h3>
                                    <p className={`text-sm opacity-70 ${themeColors.text}`}>
                                        Set your own performance thresholds.
                                    </p>
                                    <ul className={`mt-4 space-y-2 text-xs list-disc pl-4 opacity-70 ${themeColors.text}`}>
                                        <li>Configure Max Latency (ms) and Min Success Rate (%) via the Gear icon.</li>
                                        <li><strong>Visual Alarm:</strong> Metric cards pulse RED when thresholds are breached.</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Export */}
                            <div className={`p-4 rounded-xl border ${themeColors.border} flex items-center justify-between ${isTerminalMode ? 'bg-green-900/10' : 'bg-blue-50/50'}`}>
                                <div>
                                    <h4 className={`font-bold ${themeColors.text}`}>Data Export</h4>
                                    <p className={`text-xs opacity-70 ${themeColors.text} mt-1`}>
                                        Download your current view (Logs, Feedback, or Metrics) as a JSON report.
                                    </p>
                                </div>
                                <div className={`p-2 rounded-lg ${isTerminalMode ? 'bg-green-500 text-black' : 'bg-stc-purple text-white'}`}>
                                    <Database className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'workflows':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="flex justify-between items-center">
                            <h2 className={`text-2xl font-bold ${themeColors.heading}`}>Agentic Workflows</h2>
                            <span className={`text-xs px-2 py-1 rounded border ${themeColors.border} ${themeColors.text} opacity-70`}>Phase 2 Active</span>
                        </div>

                        <div className="grid gap-6">
                            {[
                                {
                                    title: "Smart Build Failure Analysis",
                                    desc: "Diagnoses Jenkins build failures, checks Bitbucket for recent code changes, and searches Jira for related tickets.",
                                    cmd: "Analyze the last failed build for job 'backend-service' and create a Jira ticket."
                                },
                                {
                                    title: "Dependency Security Scan",
                                    desc: "Scans repos for vulnerable libraries (e.g., 'lodash'), checks SonarQube quality gates, and suggests upgrades.",
                                    cmd: "Scan 'frontend-app' for 'lodash' usage and check if version 4.17.21 satisfies security rules."
                                },
                                {
                                    title: "Auto-Remediation",
                                    desc: "Identifies critical bugs in SonarQube and automatically generates code patches.",
                                    cmd: "Check SonarQube for critical bugs in 'payment-service' and suggest fixes."
                                }
                            ].map((flow, idx) => (
                                <div key={idx} className={`p-6 rounded-xl border ${themeColors.border} ${isTerminalMode ? 'bg-gray-900/30' : 'bg-white shadow-sm hover:shadow-md'} transition-all`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className={`text-lg font-bold ${themeColors.heading}`}>{flow.title}</h3>
                                        <button
                                            onClick={() => onSelectDemo?.(flow.cmd)}
                                            className={`
                                                px-3 py-1.5 text-xs font-bold rounded uppercase tracking-wider transition-all
                                                ${isTerminalMode
                                                    ? 'bg-green-900 text-green-400 border border-green-500 hover:bg-green-500 hover:text-black'
                                                    : 'bg-stc-purple text-white hover:bg-stc-coral shadow-lg hover:shadow-xl'}
                                            `}
                                        >
                                            Try It
                                        </button>
                                    </div>
                                    <p className={`${themeColors.text} opacity-70 text-sm`}>{flow.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            default:
                // Default fallback to "devops-suite" or others if selected
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                        <h2 className={`text-2xl font-bold ${themeColors.heading}`}>
                            {sections.find(s => s.id === activeSection)?.label}
                        </h2>
                        {activeSection === 'devops-suite' && (
                            <div className="space-y-8">
                                <p className={`${themeColors.text} opacity-70 mb-4`}>
                                    The following tools are integrated via the Model Context Protocol (MCP). The AI can perform these specific actions when you ask.
                                </p>
                                {[
                                    {
                                        name: 'Jenkins',
                                        desc: 'CI/CD Pipelines & Build Status',
                                        icon: <Activity className="w-5 h-5" />,
                                        tools: [
                                            { id: 'list_jobs', desc: 'List all jobs with status' },
                                            { id: 'build_job', desc: 'Trigger a build for a specific job' },
                                            { id: 'get_build_status', desc: 'Get success/failure status of a build' }
                                        ]
                                    },
                                    {
                                        name: 'Jira',
                                        desc: 'Issue Tracking & Project Management',
                                        icon: <Database className="w-5 h-5" />,
                                        tools: [
                                            { id: 'get_project_details', desc: 'Get details of the DevOps project' },
                                            { id: 'get_issue', desc: 'Get details of a specific issue' },
                                            { id: 'summarize_issue', desc: 'Get AI-generated issue summary' },
                                            { id: 'get_issue_comments', desc: 'Read issue comments' }
                                        ]
                                    },
                                    {
                                        name: 'SonarQube',
                                        desc: 'Code Quality & Security Gates',
                                        icon: <Shield className="w-5 h-5" />,
                                        tools: [
                                            { id: 'get_project_overview', desc: 'Get metrics and dashboard URL' },
                                            { id: 'get_quality_gate', desc: 'Check Quality Gate status' },
                                            { id: 'search_code_smells', desc: 'Find code smells in a project' },
                                            { id: 'search_vulnerabilities', desc: 'Find security vulnerabilities' }
                                        ]
                                    },
                                    {
                                        name: 'Bitbucket',
                                        desc: 'Source Control & PRs',
                                        icon: <GitBranch className="w-5 h-5" />,
                                        tools: [
                                            { id: 'list_repos', desc: 'List repositories in a project' },
                                            { id: 'get_pull_requests', desc: 'List open/merged pull requests' },
                                            { id: 'get_file_content', desc: 'Read file content (read-only)' }
                                        ]
                                    },
                                    {
                                        name: 'Nexus',
                                        desc: 'Artifact Management',
                                        icon: <Database className="w-5 h-5" />,
                                        tools: [
                                            { id: 'list_repos', desc: 'List all repositories' },
                                            { id: 'search_artifacts', desc: 'Search for artifacts by query' },
                                            { id: 'get_component', desc: 'Get component details' }
                                        ]
                                    },
                                    {
                                        name: 'Elasticsearch',
                                        desc: 'Log Aggregation & Search',
                                        icon: <Search className="w-5 h-5" />,
                                        tools: [
                                            { id: 'get_cluster_health', desc: 'Check cluster health status' },
                                            { id: 'list_indices', desc: 'List available indices' },
                                            { id: 'search_logs', desc: 'Search logs (Lucene syntax)' }
                                        ]
                                    },
                                    {
                                        name: 'Grafana',
                                        desc: 'Observability Dashboards',
                                        icon: <Activity className="w-5 h-5" />,
                                        tools: [
                                            { id: 'search_dashboards', desc: 'Search for dashboards' },
                                            { id: 'get_dashboard', desc: 'Get dashboard details by UID' },
                                            { id: 'list_datasources', desc: 'List available data sources' }
                                        ]
                                    }
                                ].map(tool => (
                                    <div key={tool.name} className={`rounded-xl border ${themeColors.border} overflow-hidden ${isTerminalMode ? 'bg-gray-900/30' : 'bg-white shadow-sm'}`}>
                                        <div className={`p-4 border-b ${themeColors.border} flex items-center justify-between bg-opacity-50`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${isTerminalMode ? 'bg-green-900/30 text-green-400' : 'bg-stc-purple/10 text-stc-purple'}`}>
                                                    {tool.icon}
                                                </div>
                                                <div>
                                                    <h3 className={`font-bold ${themeColors.heading}`}>{tool.name}</h3>
                                                    <p className={`text-xs opacity-60 ${themeColors.text}`}>{tool.desc}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {tool.tools.map(t => (
                                                <div key={t.id} className="flex items-start gap-2 text-sm">
                                                    <code className={`px-1.5 py-0.5 rounded text-xs font-mono whitespace-nowrap ${isTerminalMode ? 'bg-black border border-green-900/50 text-green-400' : 'bg-gray-100 text-stc-purple-deep'}`}>
                                                        {t.id}
                                                    </code>
                                                    <span className={`text-xs opacity-70 ${themeColors.text}`}>{t.desc}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {activeSection === 'commands' && (
                            <div className={`rounded-xl border border-separate overflow-hidden ${themeColors.border}`}>
                                <table className="w-full text-left text-sm">
                                    <thead className={`${isTerminalMode ? 'bg-green-900/20' : 'bg-stc-purple/5'}`}>
                                        <tr>
                                            <th className={`p-4 font-bold ${themeColors.text}`}>Command</th>
                                            <th className={`p-4 font-bold ${themeColors.text}`}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700/50">
                                        {[
                                            ['/reset', 'Clear context & start fresh'],
                                            ['/logs', 'Load log file analysis prompt'],
                                            ['/audit', 'Security & Best Practice audit'],
                                            ['/docker', 'Generate Dockerfiles'],
                                            ['/k8s', 'Generate Kubernetes manifests'],
                                            ['/help', 'Open this manual']
                                        ].map(([cmd, desc]) => (
                                            <tr key={cmd} className="hover:bg-black/5 transition-colors">
                                                <td className={`p-4 font-mono font-bold ${themeColors.text}`}>{cmd}</td>
                                                <td className={`p-4 opacity-70 ${themeColors.text}`}>{desc}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300 bg-black/40">
            <div className={`
                flex w-full max-w-5xl h-[85vh] rounded-2xl overflow-hidden transition-all duration-300
                ${themeColors.bg} ${themeColors.border} border
                ${themeColors.glow}
            `}>
                {/* Sidebar */}
                <div className={`w-72 border-r ${themeColors.border} flex flex-col backdrop-blur-xl bg-opacity-50`}>
                    <div className={`p-8 border-b ${themeColors.border}`}>
                        <h1 className={`text-2xl font-bold tracking-tight ${themeColors.heading}`}>
                            MANUAL<span className="opacity-40">.md</span>
                        </h1>
                        <p className={`text-xs mt-2 uppercase tracking-widest font-bold opacity-50 ${themeColors.text}`}>
                            System Documentation
                        </p>
                    </div>

                    <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                        {sections.map(section => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`
                                    w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200
                                    ${activeSection === section.id ? themeColors.active : `${themeColors.text} opacity-60 ${themeColors.hover}`}
                                `}
                            >
                                {section.icon}
                                {section.label}
                            </button>
                        ))}
                    </nav>

                    <div className={`p-6 border-t ${themeColors.border}`}>
                        <div className={`text-xs font-mono opacity-40 ${themeColors.text} text-center`}>
                            v2.6.0-STABLE
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col relative bg-opacity-50 backdrop-blur-xl">
                    <button
                        onClick={onClose}
                        className={`absolute right-6 top-6 p-2 rounded-full transition-all duration-200 opacity-60 hover:opacity-100 ${themeColors.hover} ${themeColors.text}`}
                    >
                        <X className="w-6 h-6" />
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
