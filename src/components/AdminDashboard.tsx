
import React, { useEffect, useState, useRef } from 'react';
import { metricsService, SystemMetrics, LLMRequestMetric, ToolUsageMetric } from '../services/metricsService';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { ArrowLeft, Activity, Database, AlertCircle, CheckCircle, Smartphone, Download, Upload, X, Clock, Lock, Shield } from 'lucide-react';
import clsx from 'clsx';

interface AdminDashboardProps {
    onClose: () => void;
}

type ActivityItem = (LLMRequestMetric | ToolUsageMetric) & { type: 'LLM' | 'TOOL', name: string };

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const auth = sessionStorage.getItem('admin_authenticated');
        if (auth === 'true') setIsAuthenticated(true);
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin === 'admin') { // Default PIN
            sessionStorage.setItem('admin_authenticated', 'true');
            setIsAuthenticated(true);
        } else {
            setError('Invalid PIN');
            setPin('');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col h-screen bg-gray-900 items-center justify-center p-4">
                <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 max-w-sm w-full">
                    <div className="flex justify-center mb-6">
                        <div className="p-3 bg-blue-900/30 rounded-full">
                            <Shield className="w-8 h-8 text-blue-400" />
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-center text-gray-100 mb-2">Admin Access</h2>
                    <p className="text-center text-gray-400 text-sm mb-6">Enter PIN to access system metrics</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            value={pin}
                            onChange={e => setPin(e.target.value)}
                            placeholder="Enter PIN"
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-center text-white tracking-widest focus:ring-2 focus:ring-blue-500 outline-none"
                            autoFocus
                        />
                        {error && <p className="text-red-400 text-xs text-center">{error}</p>}

                        <div className="flex gap-2 mt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm text-white font-medium transition-colors"
                            >
                                Unlock
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // Dashboard Content
    return <DashboardContent onClose={onClose} />;
};

const DashboardContent: React.FC<AdminDashboardProps> = ({ onClose }) => {
    const [metrics, setMetrics] = useState<SystemMetrics>(metricsService.getMetrics());
    const [selectedItem, setSelectedItem] = useState<ActivityItem | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setMetrics(metricsService.getMetrics());
        }, 2000); // Live update every 2s
        return () => clearInterval(interval);
    }, []);

    // --- Actions ---
    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(metrics, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `mcp_metrics_${new Date().toISOString()}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileObj = event.target.files && event.target.files[0];
        if (!fileObj) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                const success = metricsService.importMetrics(json);
                if (success) {
                    setMetrics(metricsService.getMetrics());
                    alert('Metrics imported successfully!');
                } else {
                    alert('Invalid metrics file.');
                }
            } catch (err) {
                console.error(err);
                alert('Failed to parse file.');
            }
        };
        reader.readAsText(fileObj);
        event.target.value = ''; // Reset
    };

    // --- Stats Calculation ---
    const totalRequests = metrics.llmRequests.length;
    const successfulRequests = metrics.llmRequests.filter(m => m.success).length;
    const failedRequests = metrics.llmRequests.filter(m => !m.success).length;
    const successRate = totalRequests > 0 ? Math.round((successfulRequests / totalRequests) * 100) : 0;

    const totalToolCalls = metrics.toolUsage.length;
    const successfulTools = metrics.toolUsage.filter(t => t.success).length;

    // --- Chart Data ---
    const pieData = [
        { name: 'Success', value: successfulRequests, color: '#22c55e' },
        { name: 'Failed', value: failedRequests, color: '#ef4444' }
    ];

    const toolCounts = metrics.toolUsage.reduce((acc, curr) => {
        acc[curr.toolName] = (acc[curr.toolName] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const barData = Object.entries(toolCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    // Latency Data (Last 20 requests)
    const latencyData = metrics.llmRequests
        .filter(r => r.durationMs !== undefined)
        .slice(-20)
        .map(req => ({
            time: new Date(req.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            duration: req.durationMs || 0,
            success: req.success
        }));

    // Activity Stream
    const activityStream: ActivityItem[] = [
        ...metrics.llmRequests.map(r => ({ ...r, type: 'LLM' as const, name: r.model })),
        ...metrics.toolUsage.map(t => ({ ...t, type: 'TOOL' as const, name: t.toolName }))
    ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 50);

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-gray-100 overflow-hidden relative font-sans">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".json"
            />

            {/* Header */}
            <div className="border-b border-gray-800 bg-gray-900/50 flex-shrink-0 z-10 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                                Advanced System Metrics
                            </h1>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={handleImportClick}
                                className="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 transition-colors"
                            >
                                <Upload className="w-3.5 h-3.5" />
                                <span>Import</span>
                            </button>
                            <button
                                onClick={handleExport}
                                className="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium text-blue-300 hover:text-blue-100 bg-blue-900/20 hover:bg-blue-900/40 rounded border border-blue-800/50 transition-colors"
                            >
                                <Download className="w-3.5 h-3.5" />
                                <span>Export</span>
                            </button>
                            <div className="h-4 w-px bg-gray-700 mx-2" />
                            <button
                                onClick={() => {
                                    if (confirm('Are you sure you want to clear all metrics? This cannot be undone.')) {
                                        metricsService.clearMetrics();
                                        setMetrics(metricsService.getMetrics());
                                    }
                                }}
                                className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 border border-red-900/50 hover:bg-red-900/20 rounded transition-colors"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <KpiCard
                            title="Total LLM Requests"
                            value={totalRequests}
                            icon={<Activity className="w-5 h-5 text-blue-400" />}
                        />
                        <KpiCard
                            title="Success Rate"
                            value={`${successRate}%`}
                            subValue={`${failedRequests} Failures`}
                            icon={successRate > 90 ? <CheckCircle className="w-5 h-5 text-green-400" /> : <AlertCircle className="w-5 h-5 text-yellow-400" />}
                        />
                        <KpiCard
                            title="Total Tool Calls"
                            value={totalToolCalls}
                            icon={<Database className="w-5 h-5 text-purple-400" />}
                        />
                        <KpiCard
                            title="Tool Success Rate"
                            value={totalToolCalls > 0 ? `${Math.round((successfulTools / totalToolCalls) * 100)}%` : 'N/A'}
                            icon={<Smartphone className="w-5 h-5 text-indigo-400" />}
                        />
                    </div>

                    {/* Charts Row 1: Pie & Bar */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 shadow-lg backdrop-blur-sm">
                            <h3 className="text-lg font-medium text-gray-200 mb-6">Request Health</h3>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                                            itemStyle={{ color: '#f3f4f6' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 shadow-lg backdrop-blur-sm">
                            <h3 className="text-lg font-medium text-gray-200 mb-6">Top Tools</h3>
                            <div className="h-64 w-full">
                                {barData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={barData} layout="vertical">
                                            <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                                            <YAxis dataKey="name" type="category" width={150} stroke="#9ca3af" fontSize={12} tick={{ fill: '#9ca3af' }} />
                                            <RechartsTooltip
                                                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                                            />
                                            <Bar dataKey="count" fill="#818cf8" radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500 text-sm">No usage data</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Charts Row 2: Latency Line Chart (NEW) */}
                    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 shadow-lg backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-medium text-gray-200">LLM Latency Trend (Last 20 Requests)</h3>
                            <Clock className="w-5 h-5 text-gray-500" />
                        </div>
                        <div className="h-64 w-full">
                            {latencyData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={latencyData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
                                        <YAxis stroke="#9ca3af" fontSize={12} unit="ms" />
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                                        />
                                        <Line type="monotone" dataKey="duration" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500 text-sm">No latency data available</div>
                            )}
                        </div>
                    </div>

                    {/* Recent Activity Table */}
                    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden shadow-lg backdrop-blur-sm">
                        <div className="px-6 py-4 border-b border-gray-700/50">
                            <h3 className="text-lg font-medium text-gray-200">Detailed Activity Log</h3>
                            <p className="text-xs text-gray-500 mt-1">Click on any row to view full details.</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700/50">
                                <thead className="bg-gray-900/30">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700/50">
                                    {activityStream.map((item) => (
                                        <tr
                                            key={item.id}
                                            onClick={() => setSelectedItem(item)}
                                            className="hover:bg-gray-700/30 transition-colors cursor-pointer group"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={clsx(
                                                    "px-2 py-1 rounded-full text-xs font-bold border",
                                                    item.type === 'LLM'
                                                        ? "bg-blue-900/20 text-blue-400 border-blue-900/50"
                                                        : "bg-purple-900/20 text-purple-400 border-purple-900/50"
                                                )}>
                                                    {item.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                                                {item.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {item.success ? (
                                                    <span className="flex items-center text-green-400 text-xs font-medium bg-green-900/10 px-2 py-0.5 rounded-full w-fit">
                                                        <CheckCircle className="w-3 h-3 mr-1.5" />
                                                        Success
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center text-red-400 text-xs font-medium bg-red-900/10 px-2 py-0.5 rounded-full w-fit">
                                                        <AlertCircle className="w-3 h-3 mr-1.5" />
                                                        Failed
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(item.timestamp).toLocaleTimeString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {activityStream.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500 text-sm">
                                                No activity recorded yet in this session.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Drill-down Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedItem(null)}>
                    <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                            <div>
                                <h3 className="text-lg font-bold text-gray-100 flex items-center gap-2">
                                    {selectedItem.type === 'LLM' ? <Activity className="w-5 h-5 text-blue-400" /> : <Database className="w-5 h-5 text-purple-400" />}
                                    Transaction Details
                                </h3>
                                <p className="text-xs text-gray-500 font-mono mt-1">{selectedItem.id}</p>
                            </div>
                            <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-gray-800/50 rounded border border-gray-700/50">
                                    <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Timestamp</span>
                                    <div className="text-sm text-gray-200 mt-1">{new Date(selectedItem.timestamp).toLocaleString()}</div>
                                </div>
                                <div className="p-3 bg-gray-800/50 rounded border border-gray-700/50">
                                    <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Status</span>
                                    <div className={`text-sm mt-1 font-bold ${selectedItem.success ? 'text-green-400' : 'text-red-400'}`}>
                                        {selectedItem.success ? 'SUCCESS' : 'FAILED'}
                                    </div>
                                </div>
                                <div className="p-3 bg-gray-800/50 rounded border border-gray-700/50">
                                    <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Type</span>
                                    <div className="text-sm text-gray-200 mt-1">{selectedItem.type}</div>
                                </div>
                                <div className="p-3 bg-gray-800/50 rounded border border-gray-700/50">
                                    <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Name</span>
                                    <div className="text-sm text-gray-200 mt-1 font-mono">{selectedItem.name}</div>
                                </div>
                            </div>

                            {selectedItem.error && (
                                <div>
                                    <h4 className="text-sm font-bold text-red-400 mb-2">Error Log</h4>
                                    <div className="bg-red-900/10 border border-red-900/30 rounded p-3 text-red-300 text-xs font-mono whitespace-pre-wrap">
                                        {selectedItem.error}
                                    </div>
                                </div>
                            )}

                            {/* Additional Data based on type */}
                            {selectedItem.type === 'LLM' && (selectedItem as LLMRequestMetric).durationMs && (
                                <div className="p-3 bg-gray-800/50 rounded border border-gray-700/50">
                                    <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Duration</span>
                                    <div className="text-sm text-gray-200 mt-1">{(selectedItem as LLMRequestMetric).durationMs} ms</div>
                                </div>
                            )}

                            {selectedItem.type === 'TOOL' && (selectedItem as ToolUsageMetric).args && (
                                <div>
                                    <h4 className="text-sm font-bold text-gray-400 mb-2">Arguments</h4>
                                    <pre className="bg-black/30 border border-gray-800 rounded p-3 text-gray-300 text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                                        {JSON.stringify((selectedItem as ToolUsageMetric).args, null, 2)}
                                    </pre>
                                </div>
                            )}

                        </div>
                        <div className="p-4 border-t border-gray-800 bg-gray-900/50 flex justify-end">
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm rounded transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const KpiCard: React.FC<{ title: string; value: string | number; subValue?: string; icon: React.ReactNode }> = ({ title, value, subValue, icon }) => (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm hover:bg-gray-800/70 transition-colors relative group overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />

        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-gray-400">{title}</p>
                <p className="mt-2 text-3xl font-bold text-gray-100">{value}</p>
                {subValue && (
                    <p className="mt-1 text-sm text-gray-500 flex items-center">
                        {subValue}
                    </p>
                )}
            </div>
            <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700/30">
                {icon}
            </div>
        </div>
    </div>
);
