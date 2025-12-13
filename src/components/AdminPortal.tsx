
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
    const [timeRange, setTimeRange] = useState<'1H' | '6H' | '24H' | '7D' | 'Custom'>('24H');
    const [golden, setGolden] = useState<GoldenSignals | null>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [securityEvents, setSecurityEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Dynamic Trend Data State
    const [trendData, setTrendData] = useState<any[]>([]);

    // Generate simulated data points based on time range
    const generateDataPoint = (prev: any, index: number, range: string) => {
        const time = new Date();
        // Adjust timestamp back based on index and range granularity
        let timeOffset = 0;
        if (range === '1H') timeOffset = index * 2 * 60 * 1000; // 2 min intervals
        else if (range === '6H') timeOffset = index * 10 * 60 * 1000;
        else if (range === '24H') timeOffset = index * 30 * 60 * 1000;
        else if (range === '7D') timeOffset = index * 4 * 60 * 60 * 1000;

        time.setTime(time.getTime() - (20 * (range === '1H' ? 120000 : range === '6H' ? 600000 : range === '24H' ? 1800000 : 14400000)) + timeOffset);

        const timeStr = range === '7D'
            ? time.toLocaleDateString([], { month: 'numeric', day: 'numeric', hour: '2-digit' })
            : time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' });

        const baseLatency = 400;
        const baseTTFT = 120;
        const baseUsers = 15;

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

    // Initialize & Update Data
    useEffect(() => {
        const initialData = [];
        for (let i = 0; i < 20; i++) {
            initialData.push(generateDataPoint({}, i, timeRange));
        }
        setTrendData(initialData);

        // Only auto-update if range is short (1H), otherwise static snapshot for logic simplicity in mock
        if (timeRange === '1H') {
            const interval = setInterval(() => {
                setTrendData(prev => {
                    const next = generateDataPoint({}, 20, '1H'); // Generate "next" point relative to now
                    next.time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
                    return [...prev.slice(1), next];
                });
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [timeRange]);

    const [error, setError] = useState<string | null>(null);
    const [customStart, setCustomStart] = useState<number | null>(null);
    const [customEnd, setCustomEnd] = useState<number | null>(null);

    const fetchSignals = async (isBackground = false) => {
        if (!isBackground) setLoading(true);
        if (!isBackground) setError(null);

        // Calculate Time Window
        const now = Date.now();
        let start = now - 3600000; // Default 1H
        let end = now;

        if (timeRange === 'Custom') {
            if (!customStart || !customEnd) {
                // Determine sensible default if not set yet, or wait for user?
                // For now, let's keep previous logic if incomplete, or just default to 24h
                if (!isBackground) setLoading(false);
                return; // Wait for user input
            }
            start = customStart;
            end = customEnd;
        } else {
            const map: any = { '1H': 3600000, '6H': 21600000, '24H': 86400000, '7D': 604800000 };
            start = now - (map[timeRange] || 3600000);
        }

        try {
            try {
                const params = `?start=${start}&end=${end}`;
                const [statsRes, logRes, secRes] = await Promise.all([
                    fetch(`/api/admin/stats/golden${params}`),
                    fetch(`/api/admin/logs${params}`),
                    fetch(`/api/admin/security/events${params}`)
                ]);

                if (statsRes.ok) {
                    const data = await statsRes.json();
                    setGolden(data);
                    setError(null);
                } else {
                    setGolden(null);
                    if (statsRes.status === 404) setError("Metrics endpoint not found (404)");
                    else if (statsRes.status === 500) setError("Internal Server Error (500)");
                    else setError(`Failed to load metrics: ${statsRes.statusText}`);
                }

                if (logRes.ok) setLogs(await logRes.json());
                if (secRes.ok) setSecurityEvents(await secRes.json());
            } catch (e: any) {
                setGolden(null);
                console.error(e);
                setError("Connection refused. Backend may be offline.");
            }
        } catch (e) {
            console.error("Failed to fetch signals", e);
        } finally {
            if (!isBackground) setLoading(false);
        }
    };

    useEffect(() => {
        fetchSignals();
        const interval = setInterval(() => fetchSignals(true), 5000);
        return () => clearInterval(interval);
    }, [timeRange, customStart, customEnd]);

    const themeColor = isTerminalMode ? '#22c55e' : '#8b5cf6';

    // Reusable Stat Card - Redesigned for Density & Small Icons
    const StatCard = ({ title, value, sub, trend, icon }: any) => (
        <div className={`p-3 rounded-lg border backdrop-blur-md relative overflow-hidden group transition-all hover:scale-[1.01] ${isTerminalMode ? 'bg-green-900/10 border-green-500/20 hover:border-green-500/40' : 'bg-white/60 border-indigo-50 hover:border-indigo-200 hover:shadow-md'}`}>
            <div className="flex justify-between items-start mb-1">
                <h3 className="text-[10px] font-bold uppercase tracking-wider opacity-60 truncate pr-2">
                    {title}
                </h3>
                <div className={`p-1 rounded-md opacity-70 group-hover:opacity-100 transition-opacity ${isTerminalMode ? 'text-green-500 bg-green-500/10' : 'text-indigo-500 bg-indigo-50'}`}>
                    {/* Clone element to force small size if it's a raw SVG, or render as is if responsive */}
                    {React.cloneElement(icon as React.ReactElement, { width: 16, height: 16, className: 'w-4 h-4' })}
                </div>
            </div>

            <div className="flex items-baseline gap-2 mt-1">
                <div className="text-2xl font-bold font-mono tracking-tight leading-none">{value}</div>
                {sub && (
                    <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 ${trend === 'up'
                        ? (isTerminalMode ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600')
                        : trend === 'down'
                            ? (isTerminalMode ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600')
                            : 'opacity-50'}`}>
                        {trend === 'up' && '▲'}
                        {trend === 'down' && '▼'}
                        <span className="truncate max-w-[80px]">{sub}</span>
                    </div>
                )}
            </div>
        </div>
    );

    const containerClasses = embedded
        ? `h-full w-full flex flex-col ${isTerminalMode ? 'text-green-500' : 'text-slate-800'}`
        : `fixed inset-0 z-50 flex flex-col ${isTerminalMode ? 'bg-black text-green-500' : 'bg-slate-50 text-slate-800'}`;

    return (
        <div className={containerClasses + " font-sans"}>

            {/* Header / Top Bar */}
            <div className={`px-6 h-14 flex items-center justify-between border-b shrink-0 ${isTerminalMode ? 'border-green-500/20 bg-black/40' : 'border-slate-200 bg-white/80'}`}>

                {/* Left: Branding or Tabs */}
                <div className="flex items-center gap-4">
                    {!embedded && (
                        <div className="flex items-center gap-2 mr-4">
                            <div className={`w-2 h-2 rounded-full animate-pulse ${isTerminalMode ? 'bg-green-500' : 'bg-stc-purple'}`}></div>
                            <h1 className="font-bold text-sm tracking-widest uppercase">Mission Control</h1>
                        </div>
                    )}

                    <div className="flex gap-1 p-0.5 rounded-lg border border-opacity-10 bg-opacity-5">
                        {['mission', 'quality', 'security', 'logs'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${activeTab === tab
                                    ? (isTerminalMode ? 'bg-green-500 text-black shadow-sm' : 'bg-stc-purple text-white shadow-sm')
                                    : 'opacity-50 hover:opacity-100'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Controls & Time Filter */}
                <div className="flex items-center gap-3">
                    {/* Time Range Selector */}
                    <div className="flex items-center gap-2">
                        {timeRange === 'Custom' && (
                            <div className="flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
                                <input
                                    type="datetime-local"
                                    className={`text-[10px] p-1 rounded border ${isTerminalMode ? 'bg-black border-green-500/30 text-green-500' : 'bg-white border-slate-200'}`}
                                    onChange={(e) => setCustomStart(new Date(e.target.value).getTime())}
                                />
                                <span className="text-[10px] opacity-50">-</span>
                                <input
                                    type="datetime-local"
                                    className={`text-[10px] p-1 rounded border ${isTerminalMode ? 'bg-black border-green-500/30 text-green-500' : 'bg-white border-slate-200'}`}
                                    onChange={(e) => setCustomEnd(new Date(e.target.value).getTime())}
                                />
                            </div>
                        )}
                        <div className={`flex items-center rounded-md border text-[10px] font-bold overflow-hidden ${isTerminalMode ? 'border-green-500/30' : 'border-slate-200'}`}>
                            {['1H', '6H', '24H', '7D', 'Custom'].map(range => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range as any)}
                                    className={`px-3 py-1.5 transition-colors ${timeRange === range
                                        ? (isTerminalMode ? 'bg-green-500/20 text-green-400' : 'bg-indigo-50 text-indigo-600')
                                        : (isTerminalMode ? 'hover:bg-green-900/20 text-green-700' : 'hover:bg-slate-50 text-slate-400')}`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>

                    {!embedded && (
                        <button onClick={onClose} className="p-1.5 hover:bg-red-500/10 rounded-full transition-colors opacity-60 hover:opacity-100">
                            <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Dashboard Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">

                {activeTab === 'mission' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">

                        {/* Error / Status Banner */}
                        {error && (
                            <div className={`p-3 rounded-lg border flex items-center gap-3 ${isTerminalMode ? 'bg-red-900/20 border-red-500/50 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                <span className="text-xs font-bold">{error}</span>
                            </div>
                        )}

                        {!error && !golden && (
                            <div className={`p-3 rounded-lg border flex items-center gap-3 ${isTerminalMode ? 'bg-yellow-900/20 border-yellow-500/50 text-yellow-500' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                                <span className="text-xs font-bold">No active data streams available. Waiting for traffic...</span>
                            </div>
                        )}

                        {/* Dense Golden Signals Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                title="Active Users"
                                value={golden?.users?.dau || '--'}
                                sub={`${golden?.users?.sessions || '--'} Sessions`}
                                trend="up"
                                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
                            />
                            <StatCard
                                title="Avg Latency"
                                value={`${Math.round(golden?.llm?.avg_latency || 0)}ms`}
                                sub={`TTFT: ${Math.round(golden?.llm?.avg_ttft || 0)}ms`}
                                trend={(golden?.llm?.avg_latency || 999) < 500 ? 'up' : 'down'}
                                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>}
                            />
                            <StatCard
                                title="Success Rate"
                                value={`${((golden?.llm?.success_rate || 0) * 100).toFixed(1)}%`}
                                sub={`${golden?.llm?.total_requests || '--'} Reqs`}
                                trend="up"
                                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>}
                            />
                            <StatCard
                                title="Est. Cost"
                                value={`$${(golden?.cost?.total_usd || 0).toFixed(2)}`}
                                sub={`$${golden?.cost?.cost_per_user || 0}/user`}
                                trend="up"
                                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>}
                            />
                            <StatCard
                                title="Input Tokens"
                                value={golden?.cost?.input_tokens?.toLocaleString() || '0'}
                                sub="Total Processed"
                                trend="up"
                                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>}
                            />

                            {/* Second Row - Restored Metrics */}
                            <StatCard
                                title="Engagement"
                                value={golden?.users?.avg_prompts_per_session || '--'}
                                sub="Prompts/Session"
                                trend="up"
                                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>}
                            />
                            <StatCard
                                title="Retention"
                                value={`${(Number(golden?.users?.returning_user_rate || 0) * 100).toFixed(0)}%`}
                                sub="Returning Users"
                                trend="up"
                                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>}
                            />
                            <StatCard
                                title="UI Performance"
                                value={`${golden?.users?.avg_ui_load_time || 0}ms`}
                                sub="Load Time"
                                trend="down"
                                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
                            />
                            <StatCard
                                title="MCP Tools"
                                value={`${((golden?.tools?.success_rate || 0) * 100).toFixed(0)}%`}
                                sub={`Avg Latency: ${golden?.tools?.avg_tool_latency || 0}ms`}
                                trend="up"
                                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>}
                            />
                        </div>

                        {/* Main Interaction Area: Charts & Activity */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[320px]">

                            {/* Primary Chart: Latency Trend */}
                            <div className={`col-span-2 rounded-lg border p-3 flex flex-col ${isTerminalMode ? 'border-green-500/20 bg-black/40' : 'bg-white border-slate-200'}`}>
                                <h3 className="text-[10px] font-bold uppercase mb-2 opacity-60 flex justify-between">
                                    <span>System Responsiveness ({timeRange})</span>
                                    <span className="opacity-100 text-green-500">Live</span>
                                </h3>
                                <div className="flex-1 min-h-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={trendData}>
                                            <defs>
                                                <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={themeColor} stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor={themeColor} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.05} vertical={false} />
                                            <XAxis
                                                dataKey="time"
                                                strokeOpacity={0.3}
                                                fontSize={9}
                                                tickLine={false}
                                                axisLine={false}
                                                minTickGap={40}
                                            />
                                            <YAxis
                                                strokeOpacity={0.3}
                                                fontSize={9}
                                                tickLine={false}
                                                axisLine={false}
                                                width={30}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: isTerminalMode ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)',
                                                    borderColor: isTerminalMode ? '#333' : '#eee',
                                                    fontSize: '11px',
                                                    borderRadius: '6px',
                                                    padding: '8px'
                                                }}
                                                itemStyle={{ padding: 0 }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="latency"
                                                stroke={themeColor}
                                                strokeWidth={2}
                                                fillOpacity={1}
                                                fill="url(#colorLatency)"
                                                isAnimationActive={true}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Secondary Column: Adoption & Health */}
                            <div className="space-y-3 flex flex-col">
                                {/* Tool Adoption List - Compact */}
                                <div className={`flex-1 rounded-lg border p-3 overflow-hidden flex flex-col ${isTerminalMode ? 'border-green-500/20 bg-black/40' : 'bg-white border-slate-200'}`}>
                                    <h3 className="text-[10px] font-bold uppercase mb-3 opacity-60">Top Tools</h3>
                                    <div className="space-y-2 overflow-y-auto pr-1 custom-scrollbar">
                                        {golden?.toolAdoption?.map((t: any, idx: number) => (
                                            <div key={t.tool_name} className="flex items-center justify-between group">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] w-4 h-4 rounded text-center leading-4 font-bold ${isTerminalMode ? 'bg-green-900/40 text-green-400' : 'bg-indigo-50 text-indigo-600'}`}>{idx + 1}</span>
                                                    <span className="text-xs font-mono opacity-80">{t.tool_name}</span>
                                                </div>
                                                <div className="text-xs font-bold">{t.unique_users}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Health Status - Compact */}
                                <div className={`h-24 rounded-lg border p-3 flex flex-col justify-center gap-2 ${isTerminalMode ? 'border-red-900/30 bg-red-900/5' : 'bg-red-50/50 border-red-100'}`}>
                                    <div className="flex items-center gap-2 text-red-500">
                                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                        <span className="text-xs font-bold uppercase">System Health</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div className="text-xl font-bold font-mono">{golden?.systemErrors?.ERROR || 0}</div>
                                        <div className="text-[10px] opacity-60">Critical Errors</div>
                                    </div>
                                    <div className="w-full bg-red-500/20 h-1 rounded-full">
                                        <div className="bg-red-500 h-1 rounded-full" style={{ width: '15%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {/* Quality Tab */}
                {activeTab === 'quality' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <StatCard
                                title="Response Groundedness"
                                value={`${(Number(golden?.quality?.grounded_rate || 0) * 100).toFixed(1)}%`}
                                sub="Tool-verified facts"
                                trend={Number(golden?.quality?.grounded_rate || 0) > 0.8 ? 'up' : 'down'}
                                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>}
                            />
                            <StatCard
                                title="User Satisfaction"
                                value={`${(Number(golden?.quality?.satisfaction_score || 0) * 100).toFixed(0)}%`}
                                sub="Positive Feedback Rate"
                                trend={Number(golden?.quality?.satisfaction_score || 0) > 0.8 ? 'up' : 'down'}
                                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>}
                            />
                            <StatCard
                                title="Completion Success"
                                value={`${(Number(golden?.llm?.success_rate || 0) * 100).toFixed(1)}%`}
                                sub="Error-free responses"
                                trend="up"
                                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>}
                            />
                        </div>

                        <div className={`p-6 rounded-lg border ${isTerminalMode ? 'border-green-500/20 bg-green-900/5' : 'border-slate-200 bg-slate-50'} text-center opacity-70`}>
                            <h3 className="font-bold uppercase mb-2 text-xs">Hallucination Analysis</h3>
                            <p className="text-sm font-mono">Detailed semantic analysis and fact-checking module coming in Phase 5.</p>
                        </div>
                    </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <StatCard
                                title="Total Incidents"
                                value={golden?.security?.incidents || '0'}
                                sub="All-time Security Events"
                                trend={Number(golden?.security?.incidents) === 0 ? 'up' : 'down'}
                                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>}
                            />
                            <StatCard
                                title="Policy Violations"
                                value="0"
                                sub="RBAC / Tool Policy"
                                trend="up"
                                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>}
                            />
                        </div>

                        <div className={`border rounded-lg p-4 font-mono text-xs overflow-auto h-[400px] ${isTerminalMode ? 'border-green-500/30' : 'border-slate-200'}`}>
                            <h3 className="text-[10px] font-bold uppercase mb-4 opacity-70">Security Event Log</h3>
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
                        {/* Logs Content - Re-using logic... */}
                        {/* Simplified for brevity in this refactor, keeping structure */}
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
                                        <th className="p-2">Message</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs
                                        .filter(log => logFilter === 'ALL' || log.service === logFilter)
                                        .map((log: any) => (
                                            <tr key={log.id} className="border-b border-opacity-10 hover:bg-white/5">
                                                <td className="p-2 opacity-60 whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString()}</td>
                                                <td className={`p-2 font-bold ${log.level === 'ERROR' ? 'text-red-500' : 'text-blue-500'}`}>{log.level}</td>
                                                <td className="p-2 opacity-80">{log.service}</td>
                                                <td className="p-2 truncate max-w-[300px]">{log.message}</td>
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
