import React, { useEffect, useState } from 'react';
import { metricsService, SystemMetrics } from '../services/metricsService';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { ArrowLeft, Activity, Database, AlertCircle, CheckCircle, Smartphone } from 'lucide-react';
import clsx from 'clsx';

interface AdminDashboardProps {
    onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
    const [metrics, setMetrics] = useState<SystemMetrics>(metricsService.getMetrics());

    useEffect(() => {
        const interval = setInterval(() => {
            setMetrics(metricsService.getMetrics());
        }, 2000); // Live update every 2s
        return () => clearInterval(interval);
    }, []);

    // Calculate Stats
    const totalRequests = metrics.llmRequests.length;
    const successfulRequests = metrics.llmRequests.filter(m => m.success).length;
    const failedRequests = metrics.llmRequests.filter(m => !m.success).length;
    const successRate = totalRequests > 0 ? Math.round((successfulRequests / totalRequests) * 100) : 0;

    const totalToolCalls = metrics.toolUsage.length;
    const successfulTools = metrics.toolUsage.filter(t => t.success).length;

    // Pie Chart Data
    const pieData = [
        { name: 'Success', value: successfulRequests, color: '#22c55e' }, // green-500
        { name: 'Failed', value: failedRequests, color: '#ef4444' }     // red-500
    ];

    // Bar Chart Data (Top 5 Tools)
    const toolCounts = metrics.toolUsage.reduce((acc, curr) => {
        acc[curr.toolName] = (acc[curr.toolName] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const barData = Object.entries(toolCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-gray-100 overflow-y-auto">
            {/* Header */}
            <div className="border-b border-gray-800 bg-gray-900/50 sticky top-0 z-10 backdrop-blur-md">
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
                                System Admin & Metrics
                            </h1>
                        </div>
                        <button
                            onClick={() => {
                                if (confirm('Are you sure you want to clear all metrics?')) {
                                    metricsService.clearMetrics();
                                    setMetrics(metricsService.getMetrics());
                                }
                            }}
                            className="px-3 py-1 text-xs text-red-400 hover:text-red-300 border border-red-900/50 hover:bg-red-900/20 rounded"
                        >
                            Reset Metrics
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">

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

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* LLM Requests Pie */}
                    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 shadow-lg backdrop-blur-sm">
                        <h3 className="text-lg font-medium text-gray-200 mb-6">LLM Request Health</h3>
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

                    {/* Tool Count Bar */}
                    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 shadow-lg backdrop-blur-sm">
                        <h3 className="text-lg font-medium text-gray-200 mb-6">Top Used Tools</h3>
                        <div className="h-64 w-full">
                            {barData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={barData} layout="vertical">
                                        <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                                        <YAxis dataKey="name" type="category" width={150} stroke="#9ca3af" fontSize={12} />
                                        <RechartsTooltip
                                            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                                        />
                                        <Bar dataKey="count" fill="#818cf8" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                                    No tools used yet
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Activity Table */}
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden shadow-lg backdrop-blur-sm">
                    <div className="px-6 py-4 border-b border-gray-700/50">
                        <h3 className="text-lg font-medium text-gray-200">Recent Activity</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700/50">
                            <thead className="bg-gray-900/30">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name / Model</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700/50">
                                {// Interleave tools and LLM reqs for "stream" view, simplified here just showing last 10 LLM reqs? 
                                    // Let's mix them.
                                }
                                {[...metrics.llmRequests.map(r => ({ ...r, type: 'LLM' })), ...metrics.toolUsage.map(t => ({ ...t, type: 'TOOL', model: t.toolName }))]
                                    .sort((a, b) => b.timestamp - a.timestamp)
                                    .slice(0, 10)
                                    .map((item, idx) => (
                                        <tr key={item.id} className="hover:bg-gray-700/20 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={clsx(
                                                    "px-2 py-1 rounded-full text-xs font-medium",
                                                    item.type === 'LLM' ? "bg-blue-900/30 text-blue-400" : "bg-purple-900/30 text-purple-400"
                                                )}>
                                                    {item.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                {item.model}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {item.success ? (
                                                    <span className="flex items-center text-green-400">
                                                        <CheckCircle className="w-4 h-4 mr-1.5" />
                                                        Success
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center text-red-400" title={item.error}>
                                                        <AlertCircle className="w-4 h-4 mr-1.5" />
                                                        Failed
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(item.timestamp).toLocaleTimeString()}
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
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
