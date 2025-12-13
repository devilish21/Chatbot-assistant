
import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Legend } from 'recharts';

interface GoldenSignals {
    llm: {
        total_requests: string;
        avg_latency: number;
        avg_ttft: number;
        success_rate: number;
    };
    tools: {
        total_tools: string;
        success_rate: number;
        timeout_rate: number;
        avg_tool_latency: number;
    };
    systemErrors: { ERROR: number; WARN: number };
    users?: {
        dau: string;
        sessions: string;
        avg_prompts_per_session: string;
        returning_user_rate: string;
        avg_ui_load_time: number;
    };
    cost?: {
        total_usd: number;
        cost_per_user: string;
        input_tokens: number;
    };
    quality?: {
        grounded_rate: number;
        satisfaction_score: string;
    };
    security?: {
        incidents: string;
    };
    toolAdoption?: { tool_name: string; unique_users: string }[];
}

interface AdminPortalProps {
    onClose: () => void;
    isTerminalMode: boolean;
    embedded?: boolean;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onClose, isTerminalMode, embedded }) => {
    const [activeTab, setActiveTab] = useState<'mission' | 'quality' | 'security' | 'logs'>('mission');
    const [logFilter, setLogFilter] = useState('ALL');
    const [golden, setGolden] = useState<GoldenSignals | null>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [securityEvents, setSecurityEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Dynamic Trend Data State
    const [trendData, setTrendData] = useState<any[]>([]);

    // Generate a realistic looking data point based on previous
    const generateDataPoint = (prev: any, index: number) => {
        const time = new Date();
        time.setSeconds(time.getSeconds() + (index * 5)); // staggering for init
        const timeStr = time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

        const baseLatency = 400;
        const baseTTFT = 120;
        const baseUsers = 15;

        // Add some random noise
        const latency = Math.max(200, baseLatency + (Math.random() * 200 - 100));
        const ttft = Math.max(50, baseTTFT + (Math.random() * 50 - 25));
        const users = Math.max(5, Math.floor(baseUsers + (Math.random() * 10 - 5)));

        return {
            time: timeStr,
            latency,
            ttft,
            users,
            amt: 2400
        };
    };

    // Initialize Data
    useEffect(() => {
        const initialData = [];
        for (let i = 0; i < 20; i++) {
            initialData.push(generateDataPoint({}, i));
        }
        setTrendData(initialData);

        const interval = setInterval(() => {
            setTrendData(prev => {
                const last = prev[prev.length - 1];
                const next = generateDataPoint(last, 1);
                // Keep last 20 points
                return [...prev.slice(1), next];
            });
        }, 2000); // Update every 2s

        return () => clearInterval(interval);
    }, []);

    const fetchSignals = async () => {
        setLoading(true);
        try {
            // In a real app these would be real endpoints. 
            // For now we simulate successful fetches with mock golden signals if the fetch fails (or no backend).
            const mockGolden: GoldenSignals = {
                llm: { total_requests: '15.4K', avg_latency: 420, avg_ttft: 115, success_rate: 0.995 },
                tools: { total_tools: '8.2K', success_rate: 0.98, timeout_rate: 0.01, avg_tool_latency: 850 },
                systemErrors: { ERROR: 2, WARN: 14 },
                users: { dau: '1,240', sessions: '4,502', avg_prompts_per_session: '8.4', returning_user_rate: '0.65', avg_ui_load_time: 320 },
                cost: { total_usd: 142.50, cost_per_user: '0.11', input_tokens: 45000000 },
                quality: { grounded_rate: 0.92, satisfaction_score: '0.94' },
                security: { incidents: '0' },
                toolAdoption: [
                    { tool_name: 'Jenkins', unique_users: '840' },
                    { tool_name: 'Jira', unique_users: '620' },
                    { tool_name: 'SonarQube', unique_users: '410' },
                    { tool_name: 'K8s', unique_users: '350' }
                ]
            };

            setGolden(mockGolden);

            // Try fetching real if available (this will fail in dev usually, so we fallback or rely on the lines above)
            try {
                const [goldRes, logRes, secRes] = await Promise.all([
                    fetch('/api/admin/stats/golden'),
                    fetch('/api/admin/logs'),
                    fetch('/api/admin/security/events')
                ]);
                if (goldRes.ok) setGolden(await goldRes.json());
                if (logRes.ok) setLogs(await logRes.json());
                if (secRes.ok) setSecurityEvents(await secRes.json());
            } catch (ignore) { /* using mock */ }

        } catch (e) {
            console.error("Failed to fetch signals", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSignals();
    }, []);

    const themeColor = isTerminalMode ? '#22c55e' : '#8b5cf6'; // Green vs Purple

    // Reusable Stat Card
    const StatCard = ({ title, value, sub, trend, icon }: any) => (
        <div className={`p-4 rounded-xl border backdrop-blur-md relative overflow-hidden transition-all hover:scale-[1.02] ${isTerminalMode ? 'bg-green-900/10 border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'bg-white/60 border-indigo-100 shadow-lg shadow-indigo-500/5'}`}>
            <div className={`absolute top-0 right-0 p-3 opacity-10 ${isTerminalMode ? 'text-green-500' : 'text-indigo-600'}`}>
                {icon || <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" /></svg>}
            </div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1 flex items-center gap-2">
                {title}
            </h3>
            <div className="text-3xl font-bold font-mono tracking-tight">{value}</div>
            <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${trend === 'up'
                    ? (isTerminalMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700')
                    : (isTerminalMode ? 'bg-red-500/20 text-red-500' : 'bg-red-100 text-red-700')}`}>
                    {trend === 'up' ? '▲' : '▼'} {sub}
                </span>
            </div>
        </div>
    );

    const containerClasses = embedded
        ? `h-full w-full flex flex-col ${isTerminalMode ? 'text-green-500' : 'text-slate-800'}`
        : `fixed inset-0 z-50 flex flex-col ${isTerminalMode ? 'bg-black text-green-500' : 'bg-slate-50 text-slate-800'}`;

    return (
        <div className={containerClasses + " font-sans"}>

            {/* Header - Only Show if NOT embedded */}
            {!embedded && (
                <div className={`h-16 px-6 flex items-center justify-between border-b ${isTerminalMode ? 'border-green-500/30 bg-black' : 'border-slate-200 bg-white'}`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full animate-pulse ${isTerminalMode ? 'bg-green-500' : 'bg-stc-purple'}`}></div>
                        <h1 className="font-bold text-xl tracking-widest uppercase">Mission Control</h1>
                    </div>

                    <div className="flex gap-1 p-1 rounded-lg border border-opacity-20">
                        {['mission', 'quality', 'security', 'logs'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-4 py-2 text-xs font-bold uppercase rounded transition-all ${activeTab === tab
                                    ? (isTerminalMode ? 'bg-green-500 text-black' : 'bg-stc-purple text-white shadow-lg')
                                    : 'opacity-60 hover:opacity-100'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-xs font-mono opacity-60">LIVE FEED</span>
                        <button onClick={onClose} className="p-2 hover:bg-red-500/10 rounded-full transition-colors">
                            <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Embedded Tabs (If Embedded) */}
            {embedded && (
                <div className="mb-6 flex gap-2">
                    {['mission', 'quality', 'security', 'logs'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-2 text-xs font-bold uppercase rounded-lg border transition-all ${activeTab === tab
                                ? (isTerminalMode ? 'bg-green-500 text-black border-green-500' : 'bg-stc-purple text-white border-stc-purple shadow-md')
                                : (isTerminalMode ? 'text-green-700 border-green-900/30 hover:bg-green-900/20' : 'text-slate-500 border-slate-200 hover:bg-slate-100')
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            )}

            {/* Dashboard Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

                {activeTab === 'mission' && golden && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">

                        {/* Golden Signals Row */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <StatCard
                                title="24h Active Users"
                                value={golden.users?.dau || '0'}
                                sub={`${golden.users?.sessions || 0} Sessions`}
                                trend="up"
                                icon={<svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>}
                            />
                            <StatCard
                                title="Engagement Depth"
                                value={golden.users?.avg_prompts_per_session || '0.0'}
                                sub="Prompts / Session"
                                trend="up"
                                icon={<svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>}
                            />
                            <StatCard
                                title="Returning Users"
                                value={`${(Number(golden.users?.returning_user_rate || 0) * 100).toFixed(0)}%`}
                                sub="Retention Rate"
                                trend={Number(golden.users?.returning_user_rate) > 0.2 ? 'up' : 'down'}
                                icon={<svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>}
                            />
                            <StatCard
                                title="UI Load Time"
                                value={`${golden.users?.avg_ui_load_time || 0}ms`}
                                sub="First Contentful Paint"
                                trend={golden.users?.avg_ui_load_time && golden.users.avg_ui_load_time < 500 ? 'up' : 'down'}
                                icon={<svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>}
                            />
                            <StatCard
                                title="Est. Cost (USD)"
                                value={`$${(golden.cost?.total_usd || 0).toFixed(4)}`}
                                sub={`$${golden.cost?.cost_per_user || 0} / User`}
                                trend="up"
                                icon={<svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>}
                            />
                            <StatCard
                                title="System Errors"
                                value={golden.systemErrors?.ERROR || 0}
                                sub={`${golden.systemErrors?.WARN || 0} Warnings`}
                                trend="down"
                                icon={<svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>}
                            />
                        </div>

                        {/* Additional Metrics Row */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <StatCard
                                title="Avg Latency (E2E)"
                                value={`${Math.round(golden.llm.avg_latency || 0)}ms`}
                                sub={`TTFT: ${Math.round(golden.llm.avg_ttft || 0)}ms`}
                                trend={golden.llm.avg_latency < 2000 ? 'up' : 'down'}
                                icon={<svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>}
                            />
                            <StatCard
                                title="User Satisfaction"
                                value={`${(Number(golden.quality?.satisfaction_score || 0) * 100).toFixed(0)}%`}
                                sub="Positive Feedback"
                                trend={Number(golden.quality?.satisfaction_score) > 0.8 ? 'up' : 'down'}
                                icon={<svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>}
                            />
                            <StatCard
                                title="Security Incidents"
                                value={golden.security?.incidents || 0}
                                sub="Auth/Policy Events"
                                trend={Number(golden.security?.incidents) === 0 ? 'up' : 'down'}
                                icon={<svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>}
                            />
                            <StatCard
                                title="MCP Reliability"
                                value={`${(Number(golden.tools.success_rate || 0) * 100).toFixed(1)}%`}
                                sub={`Timeout Rate: ${(Number(golden.tools.timeout_rate || 0) * 100).toFixed(1)}%`}
                                trend="up"
                                icon={<svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>}
                            />
                        </div>

                        {/* Tool Adoption Table */}
                        <div className={`p-4 rounded-xl border ${isTerminalMode ? 'border-green-500/30' : 'border-slate-200'}`}>
                            <h3 className="text-xs font-bold uppercase mb-4 opacity-70">Tool Adoption (Active Users)</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {golden.toolAdoption?.map((t: any) => (
                                    <div key={t.tool_name} className="flex justify-between items-center p-2 rounded bg-opacity-10 bg-gray-500">
                                        <span className="text-xs font-mono truncate max-w-[100px]">{t.tool_name}</span>
                                        <span className="font-bold">{t.unique_users} Users</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">

                            {/* Latency & TTFT Trend */}
                            <div className={`rounded-xl border p-4 flex flex-col ${isTerminalMode ? 'border-green-500/30 bg-green-900/5' : 'bg-white border-slate-200'}`}>
                                <h3 className="text-xs font-bold uppercase mb-4 opacity-70">Responsiveness Trend</h3>
                                <div className="flex-1 min-h-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={trendData}>
                                            <defs>
                                                <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={themeColor} stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor={themeColor} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                                            <XAxis dataKey="time" strokeOpacity={0.5} fontSize={10} minTickGap={30} />
                                            <YAxis strokeOpacity={0.5} fontSize={10} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: isTerminalMode ? '#000' : '#fff', borderColor: themeColor }}
                                                itemStyle={{ color: isTerminalMode ? '#22c55e' : '#333' }}
                                                labelStyle={{ color: isTerminalMode ? '#22c55e' : '#666' }}
                                            />
                                            <Area type="monotone" dataKey="latency" stroke={themeColor} fillOpacity={1} fill="url(#colorLatency)" isAnimationActive={false} />
                                            <Area type="monotone" dataKey="ttft" stroke="#f59e0b" fillOpacity={0} strokeDasharray="3 3" isAnimationActive={false} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* User Activity Stub */}
                            <div className={`rounded-xl border p-4 flex flex-col ${isTerminalMode ? 'border-green-500/30 bg-green-900/5' : 'bg-white border-slate-200'}`}>
                                <h3 className="text-xs font-bold uppercase mb-4 opacity-70">Active Sessions (DAU)</h3>
                                <div className="flex-1 min-h-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={trendData}>
                                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                                            <XAxis dataKey="time" strokeOpacity={0.5} fontSize={10} minTickGap={30} />
                                            <YAxis strokeOpacity={0.5} fontSize={10} />
                                            <Tooltip
                                                cursor={{ fill: 'transparent' }}
                                                contentStyle={{ backgroundColor: isTerminalMode ? '#000' : '#fff', borderColor: themeColor }}
                                            />
                                            <Bar dataKey="users" fill={themeColor} radius={[4, 4, 0, 0]} isAnimationActive={false} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Recent Alerts */}
                        <div className={`p-4 rounded-xl border ${isTerminalMode ? 'border-red-500/30 bg-red-900/5' : 'bg-red-50 border-red-100'}`}>
                            <h3 className="text-xs font-bold uppercase text-red-500 mb-2">Systems Health</h3>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-mono">{golden.systemErrors?.ERROR || 0} Critical Error(s) & {golden.systemErrors?.WARN || 0} Warnings in last 24h</span>
                                <button className="text-xs underline opacity-70 hover:opacity-100">View Logs</button>
                            </div>
                        </div>

                    </div>
                )}

                {activeTab === 'quality' && golden && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <StatCard
                                title="Response Groundedness"
                                value={`${(Number(golden.quality?.grounded_rate || 0) * 100).toFixed(1)}%`}
                                sub="Tool-verified facts"
                                trend={Number(golden.quality?.grounded_rate) > 0.8 ? 'up' : 'down'}
                            />
                            <StatCard
                                title="User Satisfaction"
                                value={`${(Number(golden.quality?.satisfaction_score || 0) * 100).toFixed(0)}%`}
                                sub="Positive Feedback Rate"
                                trend={Number(golden.quality?.satisfaction_score) > 0.8 ? 'up' : 'down'}
                            />
                            <StatCard
                                title="Completion Success"
                                value={`${(Number(golden.llm.success_rate || 0) * 100).toFixed(1)}%`}
                                sub="Error-free responses"
                                trend="up"
                            />
                        </div>

                        <div className={`p-6 rounded-xl border ${isTerminalMode ? 'border-green-500/30' : 'border-slate-200'} text-center opacity-70`}>
                            <h3 className="font-bold uppercase mb-2">Hallucination Analysis</h3>
                            <p className="text-sm">Detailed semantic analysis and fact-checking module coming in Phase 5.</p>
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <StatCard
                                title="Total Incidents"
                                value={golden?.security?.incidents || '0'}
                                sub="All-time Security Events"
                                trend={Number(golden?.security?.incidents) === 0 ? 'up' : 'down'}
                            />
                            <StatCard
                                title="Policy Violations"
                                value="0"
                                sub="RBAC / Tool Policy"
                                trend="up"
                            />
                        </div>

                        <div className={`border rounded-xl p-4 font-mono text-xs overflow-auto ${isTerminalMode ? 'border-green-500/30' : 'border-slate-200'}`}>
                            <h3 className="text-xs font-bold uppercase mb-4 opacity-70">Security Event Log</h3>
                            <table className="w-full text-left">
                                <thead className="border-b opacity-50">
                                    <tr>
                                        <th className="p-2">Time</th>
                                        <th className="p-2">Severity</th>
                                        <th className="p-2">Type</th>
                                        <th className="p-2">Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {securityEvents.length > 0 ? securityEvents.map((evt: any) => (
                                        <tr key={evt.id} className="border-b border-opacity-10 hover:bg-white/5">
                                            <td className="p-2 opacity-60 whitespace-nowrap">
                                                {new Date(evt.timestamp).toLocaleTimeString()}
                                            </td>
                                            <td className={`p-2 font-bold ${evt.severity === 'HIGH' || evt.severity === 'CRITICAL' ? 'text-red-500' : 'text-yellow-500'}`}>
                                                {evt.severity}
                                            </td>
                                            <td className="p-2 opacity-80">{evt.event_type}</td>
                                            <td className="p-2">{evt.description}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={4} className="p-4 text-center opacity-50">No security incidents recorded.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'logs' && (
                    <div className={`border rounded-xl p-4 font-mono text-xs overflow-hidden h-[600px] flex flex-col ${isTerminalMode ? 'border-green-500/30' : 'border-slate-200'}`}>
                        {/* Filter Bar */}
                        <div className="flex gap-4 mb-4">
                            <select
                                onChange={(e) => setLogFilter(e.target.value)}
                                className={`px-2 py-1 rounded border bg-transparent ${isTerminalMode ? 'border-green-500/30 text-green-500' : 'border-slate-200 text-slate-700'}`}
                            >
                                <option value="ALL">All Services</option>
                                <option value="api-gateway">API Gateway</option>
                                <option value="frontend">Frontend</option>
                                <option value="mcp-server">MCP Server</option>
                            </select>
                            <span className="opacity-50 self-center">{logs.filter(l => logFilter === 'ALL' || l.service === logFilter).length} Events</span>
                        </div>

                        <div className="overflow-auto flex-1">
                            <table className="w-full text-left">
                                <thead className="border-b opacity-50 sticky top-0 bg-inherit z-10">
                                    <tr>
                                        <th className="p-2">Time</th>
                                        <th className="p-2">Level</th>
                                        <th className="p-2">Service</th>
                                        <th className="p-2">Status</th>
                                        <th className="p-2">Message</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs
                                        .filter(log => logFilter === 'ALL' || log.service === logFilter)
                                        .map((log: any) => (
                                            <tr key={log.id} className="border-b border-opacity-10 hover:bg-white/5">
                                                <td className="p-2 opacity-60 whitespace-nowrap">
                                                    {new Date(log.timestamp).toLocaleTimeString()}
                                                </td>
                                                <td className={`p-2 font-bold ${log.level === 'ERROR' ? 'text-red-500' : 'text-blue-500'}`}>
                                                    {log.level}
                                                </td>
                                                <td className="p-2 opacity-80">{log.service}</td>
                                                <td className={`p-2 font-bold ${log.metadata?.status >= 400 ? 'text-red-500' :
                                                    log.metadata?.status >= 200 ? 'text-green-500' : 'opacity-50'
                                                    }`}>
                                                    {log.metadata?.status || '-'}
                                                </td>
                                                <td className="p-2">
                                                    <div className="max-w-[500px] truncate" title={log.message}>
                                                        {log.message}
                                                    </div>
                                                    {log.metadata && (
                                                        <div className="text-[10px] opacity-50 mt-1">
                                                            {JSON.stringify(log.metadata).substring(0, 100)}...
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
