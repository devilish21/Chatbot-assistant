import React, { useEffect, useState, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { StatCard } from './admin/StatCard';
import { LogExplorer } from './admin/LogExplorer';
import { FeedbackInbox } from './admin/FeedbackInbox';
import { SecurityEvents } from './admin/SecurityEvents';

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
    // UI State
    const [activeTab, setActiveTab] = useState<'mission' | 'quality' | 'security' | 'logs' | 'feedback'>('mission');
    const [showAlertSettings, setShowAlertSettings] = useState(false);

    // Filter State
    const [timeRange, setTimeRange] = useState<'1H' | '6H' | '24H' | '7D' | 'Custom'>('24H');
    const [customStart, setCustomStart] = useState<number | null>(null);
    const [customEnd, setCustomEnd] = useState<number | null>(null);

    // Log Explorer State
    const [logFilter, setLogFilter] = useState('ALL');
    const [logSearch, setLogSearch] = useState('');
    const [logLevel, setLogLevel] = useState('ALL');

    // Data State
    const [golden, setGolden] = useState<GoldenSignals | null>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [feedback, setFeedback] = useState<any[]>([]);
    const [securityEvents, setSecurityEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Alert Config
    const [alertConfig, setAlertConfig] = useState({
        latency: 1000,
        errorRate: 0.05,
        successRate: 0.95
    });

    // Trend Data Visualization (Mock/Simulated for visual pop)
    const [trendData, setTrendData] = useState<any[]>([]);



    // Optimized Fetching: Only fetch what is needed for the active tab
    const fetchSignals = useCallback(async (isBackground = false) => {
        if (!isBackground) setLoading(true);
        setError(null);

        const now = Date.now();
        let start = now - 3600000;
        let end = now;

        if (timeRange === 'Custom' && customStart && customEnd) {
            start = customStart;
            end = customEnd;
        } else {
            const map: any = { '1H': 3600000, '6H': 21600000, '24H': 86400000, '7D': 604800000 };
            start = now - (map[timeRange] || 3600000);
        }

        const params = `?start=${start}&end=${end}`;

        try {
            const promises = [];

            // Always fetch Golden Signals (Mission Control) as base
            promises.push(fetch(`/api/admin/stats/golden${params}`).then(r => r.json()).then(setGolden));

            // Fetch Real Trend Data for Mission Control Chart
            if (activeTab === 'mission') {
                promises.push(
                    fetch(`/api/admin/metrics/llm`) // currently returns last 100
                        .then(r => r.json())
                        .then(data => {
                            if (Array.isArray(data)) {
                                // Process for Chart: Sort ascending by time
                                const sorted = [...data].sort((a, b) => Number(a.timestamp) - Number(b.timestamp));
                                const trends = sorted.map(item => ({
                                    time: new Date(Number(item.timestamp)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                    latency: Number(item.duration_ms || 0)
                                }));
                                setTrendData(trends);
                            }
                        })
                );
            }

            // Targeted Fetching
            if (activeTab === 'logs') {
                promises.push(
                    fetch(`/api/admin/logs${params}`)
                        .then(r => r.json())
                        .then(data => {
                            if (Array.isArray(data)) setLogs(data);
                            else console.warn("Invalid Logs API response:", data);
                        })
                );
            }
            if (activeTab === 'security') {
                promises.push(
                    fetch(`/api/admin/security/events${params}`)
                        .then(r => r.json())
                        .then(data => {
                            if (Array.isArray(data)) setSecurityEvents(data);
                            else console.warn("Invalid Security API response:", data);
                        })
                );
            }
            if (activeTab === 'feedback') {
                promises.push(
                    fetch(`/api/admin/feedback`)
                        .then(r => r.json())
                        .then(data => {
                            if (Array.isArray(data)) setFeedback(data);
                            else console.warn("Invalid Feedback API response:", data);
                        })
                );
            }

            await Promise.all(promises);
        } catch (e) {
            console.error("Fetch error", e);
            if (!isBackground) setError("Connection offline or backend unreachable.");
        } finally {
            if (!isBackground) setLoading(false);
        }
    }, [activeTab, timeRange, customStart, customEnd]);

    // Polling Effect
    useEffect(() => {
        fetchSignals();
        const interval = setInterval(() => fetchSignals(true), 5000);
        return () => clearInterval(interval);
    }, [fetchSignals]);

    // Data Export Logic
    const exportData = () => {
        const data = activeTab === 'logs' ? logs : (activeTab === 'feedback' ? feedback : golden ? [golden] : []);
        const filename = `report-${activeTab}-${new Date().toISOString()}.json`;
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // Theme consts
    const themeColor = isTerminalMode ? '#22c55e' : '#8b5cf6';
    const containerClasses = embedded
        ? `h-full w-full flex flex-col ${isTerminalMode ? 'text-green-500' : 'text-slate-800'}`
        : `fixed inset-0 z-50 flex flex-col ${isTerminalMode ? 'bg-black text-green-500' : 'bg-slate-50 text-slate-800'}`;

    return (
        <div className={containerClasses + " font-sans"}>
            {/* Header */}
            <div className={`px-6 h-14 flex items-center justify-between border-b shrink-0 ${isTerminalMode ? 'border-green-500/20 bg-black/40' : 'border-slate-200 bg-white/80'}`}>
                <div className="flex items-center gap-4">
                    {!embedded && (
                        <div className="flex items-center gap-2 mr-4">
                            <div className={`w-2 h-2 rounded-full animate-pulse ${isTerminalMode ? 'bg-green-500' : 'bg-stc-purple'}`}></div>
                            <h1 className="font-bold text-sm tracking-widest uppercase">Mission Control</h1>
                        </div>
                    )}

                    {/* Tab Navigation */}
                    <div className="flex gap-1 p-0.5 rounded-lg border border-opacity-10 bg-opacity-5">
                        {['mission', 'quality', 'security', 'logs', 'feedback'].map(tab => (
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

                    {/* Actions */}
                    <div className="flex items-center">
                        <button onClick={exportData} className="ml-2 p-1.5 rounded hover:bg-black/5" title="Export Data">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        </button>
                        <button onClick={() => setShowAlertSettings(!showAlertSettings)} className="ml-2 p-1.5 rounded hover:bg-black/5" title="Alert Settings">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                        </button>
                    </div>

                    {/* Alert Settings Modal */}
                    {showAlertSettings && (
                        <div className={`absolute top-12 right-6 z-50 p-4 rounded-lg shadow-xl border w-64 ${isTerminalMode ? 'border-green-500 bg-black' : 'border-slate-200 bg-white'}`}>
                            <h4 className="font-bold text-xs uppercase mb-3 opacity-80">Alert Thresholds</h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] font-bold block mb-1">Max Latency (ms)</label>
                                    <input type="number" value={alertConfig.latency} onChange={e => setAlertConfig({ ...alertConfig, latency: parseInt(e.target.value) })} className={`w-full p-1 text-xs border rounded ${isTerminalMode ? 'bg-black border-green-500 text-green-500' : ''}`} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold block mb-1">Min Success Rate (%)</label>
                                    <input type="number" step="0.01" value={alertConfig.successRate} onChange={e => setAlertConfig({ ...alertConfig, successRate: parseFloat(e.target.value) })} className={`w-full p-1 text-xs border rounded ${isTerminalMode ? 'bg-black border-green-500 text-green-500' : ''}`} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Time Controls */}
                <div className="flex items-center gap-3">
                    <div className={`flex items-center rounded-md border text-[10px] font-bold overflow-hidden ${isTerminalMode ? 'border-green-500/30' : 'border-slate-200'}`}>
                        {['1H', '6H', '24H', '7D'].map(range => (
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
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">

                {activeTab === 'mission' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
                        {error && (
                            <div className={`p-3 rounded-lg border flex items-center gap-3 ${isTerminalMode ? 'bg-red-900/20 border-red-500/50 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                <span className="text-xs font-bold">{error}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                isTerminalMode={isTerminalMode}
                                title="Active Users"
                                value={golden?.users?.dau || '--'}
                                sub={`${golden?.users?.sessions || '--'} Sessions`}
                                trend="up"
                                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
                            />
                            <StatCard
                                isTerminalMode={isTerminalMode}
                                title="Avg Latency"
                                value={`${Number(golden?.llm?.avg_latency || 0).toFixed(0)} ms`}
                                sub={`TTFT: ${Number(golden?.llm?.avg_ttft || 0).toFixed(0)}ms`}
                                trend={(golden?.llm?.avg_latency || 0) > 800 ? 'up' : 'down'}
                                alert={(golden?.llm?.avg_latency || 0) > alertConfig.latency}
                                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
                            />
                            <StatCard
                                isTerminalMode={isTerminalMode}
                                title="Success Rate"
                                value={`${(Number(golden?.llm?.success_rate || 0) * 100).toFixed(1)}%`}
                                sub={`${golden?.llm?.total_requests || 0} Requests`}
                                trend={(golden?.llm?.success_rate || 0) > 0.95 ? 'up' : 'down'}
                                alert={(golden?.llm?.success_rate || 1) < alertConfig.successRate}
                                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>}
                            />
                            <StatCard
                                isTerminalMode={isTerminalMode}
                                title="Est. Cost"
                                value={`$${Number(golden?.cost?.total_usd || 0).toFixed(2)}`}
                                sub={`$${golden?.cost?.cost_per_user || 0}/user`}
                                trend="up"
                                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>}
                            />
                        </div>

                        {/* Secondary Metrics Grid (Restored) */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            <StatCard
                                isTerminalMode={isTerminalMode}
                                title="Tool Health"
                                value={`${(Number(golden?.tools?.success_rate || 0) * 100).toFixed(1)}%`}
                                sub={`${(Number(golden?.tools?.timeout_rate || 0) * 100).toFixed(1)}% Timeouts`}
                                trend={(golden?.tools?.success_rate || 0) > 0.9 ? 'up' : 'down'}
                                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>}
                            />
                            <StatCard
                                isTerminalMode={isTerminalMode}
                                title="Engagement"
                                value={golden?.users?.avg_prompts_per_session || '0.0'}
                                sub={`${(Number(golden?.users?.returning_user_rate || 0) * 100).toFixed(0)}% Retention`}
                                trend="up"
                                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
                            />
                            <StatCard
                                isTerminalMode={isTerminalMode}
                                title="System Defects"
                                value={(golden?.systemErrors?.ERROR || 0).toString()}
                                sub={`${golden?.systemErrors?.WARN || 0} Warnings`}
                                trend={(golden?.systemErrors?.ERROR || 0) === 0 ? 'up' : 'down'}
                                alert={(golden?.systemErrors?.ERROR || 0) > 0}
                                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>}
                            />
                        </div>

                        {/* Charts Area */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[320px]">
                            {/* Primary Chart */}
                            <div className={`col-span-2 rounded-lg border p-3 flex flex-col ${isTerminalMode ? 'border-green-500/20 bg-black/40' : 'bg-white border-slate-200'}`}>
                                <h3 className="text-[10px] font-bold uppercase mb-2 opacity-60 flex justify-between">
                                    <span>System Responsiveness ({timeRange})</span>
                                    <span className="opacity-100 text-green-500">Live</span>
                                </h3>
                                <div className="flex-1 min-h-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={trendData}>
                                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.05} vertical={false} />
                                            <XAxis dataKey="time" strokeOpacity={0.3} fontSize={9} tickLine={false} axisLine={false} minTickGap={40} />
                                            <YAxis strokeOpacity={0.3} fontSize={9} tickLine={false} axisLine={false} width={30} />
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
                                            <Area type="monotone" dataKey="latency" stroke={themeColor} strokeWidth={2} fillOpacity={0.2} fill={themeColor} isAnimationActive={true} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Secondary Stats */}
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
                        </div>
                    </div>
                )}

                {activeTab === 'quality' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <StatCard
                                isTerminalMode={isTerminalMode}
                                title="Response Groundedness"
                                value={`${(Number(golden?.quality?.grounded_rate || 0) * 100).toFixed(1)}%`}
                                sub="Tool-verified facts"
                                trend="up"
                                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>}
                            />
                            <StatCard
                                isTerminalMode={isTerminalMode}
                                title="User Satisfaction"
                                value={`${(Number(golden?.quality?.satisfaction_score || 0) * 100).toFixed(0)}%`}
                                sub="Positive Feedback Rate"
                                trend="up"
                                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>}
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <SecurityEvents isTerminalMode={isTerminalMode} golden={golden} securityEvents={securityEvents} />
                )}

                {activeTab === 'logs' && (
                    <LogExplorer
                        logs={logs}
                        isTerminalMode={isTerminalMode}
                        logFilter={logFilter}
                        setLogFilter={setLogFilter}
                        logSearch={logSearch}
                        setLogSearch={setLogSearch}
                        logLevel={logLevel}
                        setLogLevel={setLogLevel}
                    />
                )}

                {activeTab === 'feedback' && (
                    <FeedbackInbox feedback={feedback} isTerminalMode={isTerminalMode} />
                )}
            </div>
        </div>
    );
};
