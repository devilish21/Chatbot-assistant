import React from 'react';
import { StatCard } from './StatCard';

interface SecurityEventsProps {
    isTerminalMode: boolean;
    golden: any;
    securityEvents: any[];
}

export const SecurityEvents: React.FC<SecurityEventsProps> = ({ isTerminalMode, golden, securityEvents }) => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatCard
                    isTerminalMode={isTerminalMode}
                    title="Total Incidents"
                    value={golden?.security?.incidents || '0'}
                    sub="All-time Security Events"
                    trend={Number(golden?.security?.incidents) === 0 ? 'up' : 'down'}
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>}
                />
                <StatCard
                    isTerminalMode={isTerminalMode}
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
    );
};
