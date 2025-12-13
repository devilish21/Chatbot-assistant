

import React, { useState, useEffect } from 'react';

interface FooterProps {
    isTerminalMode: boolean;
    tokenUsage?: number; // Approximate token usage
    contextWindowSize?: number;
    enableVisualEffects?: boolean;
}

const SYSTEM_LOGS = [
    "System check: All systems operational",
    "Kubernetes Cluster: k8s-prod-us-east-1 [HEALTHY]",
    "Docker Daemon: v24.0.5 [RUNNING]",
    "Jenkins Build #4092: SUCCESS",
    "Auth Service: Token rotation scheduled in 5m",
    "Database: PostgreSQL connection pool active (45/100)",
    "Security Scan: No critical vulnerabilities found",
    "Load Balancer: Traffic normal (12k rps)",
    "Agent-007: Connected via WebSocket",
    "Memory Usage: Optimization routine completed",
];

export const Footer: React.FC<FooterProps> = ({ isTerminalMode, tokenUsage = 0, contextWindowSize = 8192, enableVisualEffects = true }) => {


    const themeClass = isTerminalMode
        ? "bg-black border-green-500/50 text-green-500"
        : "bg-stc-white border-gray-200 text-stc-purple";

    const highlightClass = isTerminalMode ? "text-green-400 font-bold" : "text-stc-coral font-bold";
    const dividerClass = isTerminalMode ? "border-green-500/30" : "border-stc-purple/10";

    // Calculate token meter percentage based on dynamic context window
    const tokenPercent = Math.min(100, (tokenUsage / contextWindowSize) * 100);
    const tokenColor = tokenPercent > 80 ? 'bg-red-500' : tokenPercent > 50 ? 'bg-yellow-500' : (isTerminalMode ? 'bg-green-500' : 'bg-stc-purple');

    // Format Context Window Size (e.g., 1000000 -> 1M, 32768 -> 32K)
    const formatSize = (size: number) => {
        if (size >= 1000000) return (size / 1000000) + 'M';
        if (size >= 1000) return Math.round(size / 1024) + 'K';
        return size;
    };

    return (
        <footer className={`h-8 border-t flex items-center text-[10px] font-mono select-none overflow-hidden relative z-30 ${themeClass}`}>

            {/* Token Usage Meter */}
            <div className={`h-full flex items-center px-3 border-r ${dividerClass} min-w-[200px] gap-2`}>
                <span className="opacity-70">CTX_WINDOW ({formatSize(contextWindowSize)})</span>
                <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${isTerminalMode ? 'bg-green-900/30' : 'bg-gray-200'}`}>
                    <div
                        className={`h-full transition-all duration-500 ${tokenColor}`}
                        style={{ width: `${tokenPercent}%` }}
                    />
                </div>
                <span className={highlightClass}>{tokenUsage}t</span>
            </div>

            <div className="flex-1" />

            {/* Right Info Column */}
            <div className={`h-full flex items-center px-4 border-l ${dividerClass} bg-opacity-10`}>
                <span className="opacity-50 mr-2">v2.5.0</span>
                <span className={`font-bold ${isTerminalMode ? 'text-green-500' : 'text-stc-purple'}`}>CORE</span>
            </div>
        </footer>
    );
};