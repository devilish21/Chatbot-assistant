import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    sub?: string;
    trend?: 'up' | 'down' | 'neutral';
    icon: React.ReactNode;
    alert?: boolean;
    isTerminalMode: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, sub, trend, icon, alert, isTerminalMode }) => (
    <div className={`p-3 rounded-lg border backdrop-blur-md relative overflow-hidden group transition-all hover:scale-[1.01] ${alert
        ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)] animate-pulse'
        : (isTerminalMode ? 'bg-green-900/10 border-green-500/20 hover:border-green-500/40' : 'bg-white/60 border-indigo-50 hover:border-indigo-200 hover:shadow-md')
        }`}>
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
