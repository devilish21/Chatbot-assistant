import React from 'react';

interface LogExplorerProps {
    logs: any[];
    isTerminalMode: boolean;
    logFilter: string;
    setLogFilter: (val: string) => void;
    logSearch: string;
    setLogSearch: (val: string) => void;
    logLevel: string;
    setLogLevel: (val: string) => void;
}

export const LogExplorer: React.FC<LogExplorerProps> = ({
    logs, isTerminalMode, logFilter, setLogFilter, logSearch, setLogSearch, logLevel, setLogLevel
}) => {
    // Memoize filter logic to optimize performance for large datasets
    const filteredLogs = React.useMemo(() => {
        return logs.filter(log => {
            const matchesService = logFilter === 'ALL' || log.service === logFilter;
            const matchesLevel = logLevel === 'ALL' || log.level === logLevel;
            const matchesSearch = !logSearch ||
                log.message.toLowerCase().includes(logSearch.toLowerCase()) ||
                JSON.stringify(log.metadata).toLowerCase().includes(logSearch.toLowerCase());
            return matchesService && matchesLevel && matchesSearch;
        });
    }, [logs, logFilter, logLevel, logSearch]);

    const [expandedLogs, setExpandedLogs] = React.useState<Set<string>>(new Set());

    const toggleExpand = (id: string) => {
        const newSet = new Set(expandedLogs);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setExpandedLogs(newSet);
    };

    return (
        <div className={`border rounded-xl p-4 font-mono text-xs overflow-hidden h-[600px] flex flex-col ${isTerminalMode ? 'border-green-500/30' : 'border-slate-200'}`}>
            {/* Advanced Log Explorer Toolbar */}
            <div className="flex flex-col gap-3 mb-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wider opacity-80">Log Explorer</h3>
                    <span className="text-[10px] opacity-50">{filteredLogs.length} Events Loaded</span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Search Bar */}
                    <div className={`flex items-center px-2 py-1.5 rounded border flex-1 min-w-[200px] ${isTerminalMode ? 'border-green-500/30 bg-black' : 'border-slate-200 bg-white'}`}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2 opacity-50"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        <input
                            type="text"
                            value={logSearch}
                            placeholder="Search message or metadata..."
                            className="bg-transparent border-none outline-none w-full text-xs"
                            onChange={(e) => setLogSearch(e.target.value)}
                        />
                    </div>

                    {/* Service Filter */}
                    <select
                        value={logFilter}
                        onChange={(e) => setLogFilter(e.target.value)}
                        className={`px-2 py-1.5 rounded border bg-transparent text-xs ${isTerminalMode ? 'border-green-500/30 text-green-500' : 'border-slate-200 text-slate-700'}`}
                    >
                        <option value="ALL">All Services</option>
                        <option value="api-gateway">api-gateway</option>
                        <option value="frontend">frontend</option>
                        <option value="mcp-server">mcp-server</option>
                    </select>

                    {/* Severity Toggle */}
                    <div className={`flex rounded border overflow-hidden ${isTerminalMode ? 'border-green-500/30' : 'border-slate-200'}`}>
                        {['INFO', 'WARN', 'ERROR'].map(lvl => (
                            <button
                                key={lvl}
                                onClick={() => setLogLevel(logLevel === lvl ? 'ALL' : lvl)}
                                className={`px-3 py-1.5 text-[10px] font-bold transition-colors ${logLevel === lvl
                                    ? (lvl === 'ERROR' ? 'bg-red-500 text-white' : lvl === 'WARN' ? 'bg-yellow-500 text-black' : 'bg-blue-500 text-white')
                                    : (isTerminalMode ? 'hover:bg-green-900/20' : 'hover:bg-slate-50')
                                    }`}
                            >
                                {lvl}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Filter Logic */}
            <div className="overflow-auto flex-1 custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className={`border-b opacity-50 sticky top-0 z-10 shadow-sm ${isTerminalMode ? 'bg-black' : 'bg-white'}`}>
                        <tr>
                            <th className="p-2 w-8"></th>
                            <th className="p-2 w-32">Time</th>
                            <th className="p-2 w-20">Level</th>
                            <th className="p-2 w-24">Service</th>
                            <th className="p-2">Message</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.map((log: any) => (
                            <React.Fragment key={log.id}>
                                <tr
                                    className={`border-b border-opacity-10 cursor-pointer transition-colors ${expandedLogs.has(log.id) ? 'bg-white/5' : 'hover:bg-white/5'}`}
                                    onClick={() => toggleExpand(log.id)}
                                >
                                    <td className="p-2 text-center opacity-50">
                                        <svg
                                            width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                            className={`transform transition-transform ${expandedLogs.has(log.id) ? 'rotate-90' : ''}`}
                                        >
                                            <path d="M9 18l6-6-6-6" />
                                        </svg>
                                    </td>
                                    <td className="p-2 opacity-60 whitespace-nowrap text-[10px]">{new Date(log.timestamp).toLocaleString()}</td>
                                    <td className="p-2">
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${log.level === 'ERROR' ? 'bg-red-500/20 text-red-500' :
                                            log.level === 'WARN' ? 'bg-yellow-500/20 text-yellow-500' :
                                                'bg-blue-500/10 text-blue-500'
                                            }`}>
                                            {log.level}
                                        </span>
                                    </td>
                                    <td className="p-2 opacity-80">{log.service}</td>
                                    <td className="p-2 truncate max-w-[400px]" title={log.message}>{log.message}</td>
                                </tr>
                                {expandedLogs.has(log.id) && (
                                    <tr className="bg-black/20">
                                        <td colSpan={5} className="p-4">
                                            <div className="text-[10px] font-mono opacity-80">
                                                <div className="mb-2 font-bold uppercase tracking-wider opacity-60">Metadata Details</div>
                                                <pre className={`p-3 rounded overflow-x-auto ${isTerminalMode ? 'bg-green-900/10' : 'bg-slate-100'}`}>
                                                    {log.metadata
                                                        ? JSON.stringify(log.metadata, null, 2)
                                                        : <span className="italic opacity-50">No additional metadata available</span>}
                                                </pre>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
