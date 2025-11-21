

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
  const [latency, setLatency] = useState(24);
  const [memory, setMemory] = useState(42);
  const [bootTime, setBootTime] = useState<string>('--');

  // Calculate Real Page Load Time
  useEffect(() => {
    const calculateBootTime = () => {
        if (window.performance) {
            // Use Navigation Timing API Level 2
            const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            if (navEntry && navEntry.loadEventEnd > 0) {
                const duration = Math.round(navEntry.loadEventEnd - navEntry.startTime);
                setBootTime(`${duration}ms`);
            } else {
                // Fallback: Check again in a moment if loadEventEnd is not yet set
                setTimeout(calculateBootTime, 500);
            }
        }
    };

    if (document.readyState === 'complete') {
        calculateBootTime();
    } else {
        window.addEventListener('load', calculateBootTime);
        return () => window.removeEventListener('load', calculateBootTime);
    }
  }, []);

  // Simulate varying telemetry
  useEffect(() => {
    if (!enableVisualEffects) return;

    const interval = setInterval(() => {
        setLatency(prev => Math.max(10, Math.min(150, prev + (Math.random() * 20 - 10))));
        setMemory(prev => Math.max(20, Math.min(80, prev + (Math.random() * 5 - 2.5))));
    }, 2000);
    return () => clearInterval(interval);
  }, [enableVisualEffects]);

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
        {/* Stats Columns */}
        <div className={`h-full flex items-center px-3 border-r ${dividerClass} min-w-[100px] justify-center`}>
            <span className="opacity-70 mr-2">LATENCY</span>
            <span className={highlightClass}>{Math.round(latency)}ms</span>
        </div>

        <div className={`h-full flex items-center px-3 border-r ${dividerClass} min-w-[100px] justify-center`}>
            <span className="opacity-70 mr-2">MEMORY</span>
            <span className={highlightClass}>{Math.round(memory)}%</span>
        </div>
        
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

        <div className={`h-full hidden md:flex items-center px-3 border-r ${dividerClass} min-w-[100px] justify-center`}>
            <span className="opacity-70 mr-2">BOOT TIME</span>
            <span className={highlightClass}>{bootTime}</span>
        </div>

        {/* Scrolling Log Ticker */}
        <div className="flex-1 overflow-hidden relative h-full flex items-center mask-linear-fade bg-opacity-10 pl-4">
             <div className={`${enableVisualEffects ? 'animate-ticker' : ''} whitespace-nowrap flex gap-8 opacity-70 hover:opacity-100 transition-opacity`}>
                {SYSTEM_LOGS.map((log, i) => (
                    <span key={i} className="inline-flex items-center gap-2">
                        <span className="opacity-50">::</span>
                        {log}
                    </span>
                ))}
                {enableVisualEffects && SYSTEM_LOGS.map((log, i) => (
                    <span key={`dup-${i}`} className="inline-flex items-center gap-2">
                        <span className="opacity-50">::</span>
                        {log}
                    </span>
                ))}
             </div>
        </div>

        {/* Right Info Column */}
        <div className={`h-full flex items-center px-4 border-l ${dividerClass} bg-opacity-10`}>
            <span className="opacity-50 mr-2">v2.5.0</span>
            <span className={`font-bold ${isTerminalMode ? 'text-green-500' : 'text-stc-purple'}`}>CORE</span>
        </div>
    </footer>
  );
};