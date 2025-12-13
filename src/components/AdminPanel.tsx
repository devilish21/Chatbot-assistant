import React, { useState, useEffect } from 'react';
import { AppConfig } from '../types';
import { AdminPortal } from './AdminPortal';

interface AdminPanelProps {
    isOpen: boolean; // Kept for types but unused for conditional rendering in full-page mode usually
    onClose: () => void;
    config: AppConfig;
    onSaveConfig: (newConfig: AppConfig) => void;
    isTerminalMode: boolean;
    addToast: (msg: string, type: 'info' | 'success' | 'error') => void;
    onOpenMetrics: () => void;
    isAuthenticated?: boolean;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
    isOpen, onClose, config, onSaveConfig, isTerminalMode, addToast, onOpenMetrics
}) => {
    // Settings State
    const [localConfig, setLocalConfig] = useState<AppConfig>(config);
    const [activeTab, setActiveTab] = useState<'general' | 'api' | 'system' | 'metrics'>('general');
    const [alertDraft, setAlertDraft] = useState(config.systemAlert || '');

    // Sync local state with global config
    useEffect(() => {
        setLocalConfig(config);
        setAlertDraft(config.systemAlert || '');
    }, [config]);

    const handleSave = () => {
        onSaveConfig(localConfig);
        addToast('System Configuration Updated', 'success');
    };

    const handlePublishAlert = () => {
        setLocalConfig(prev => ({ ...prev, systemAlert: alertDraft }));
        addToast('Alert Prepared. Click Save to Publish.', 'info');
    };

    const handleClearAlert = () => {
        setAlertDraft('');
        setLocalConfig(prev => ({ ...prev, systemAlert: null }));
        addToast('Alert Cleared. Click Save to Update.', 'info');
    };

    const themeClasses = isTerminalMode
        ? "bg-black text-green-500 font-mono"
        : "bg-stc-light text-stc-purple font-sans";

    const inputClass = isTerminalMode
        ? "bg-black border border-green-500 text-green-500 placeholder-green-800 focus:outline-none focus:shadow-[0_0_10px_rgba(34,197,94,0.4)]"
        : "bg-white border border-stc-purple/20 text-stc-purple focus:outline-none focus:border-stc-purple shadow-sm";

    const cardClass = isTerminalMode
        ? "bg-black border border-green-500/50 p-6 rounded-lg"
        : "bg-white border border-stc-purple/10 shadow-lg p-6 rounded-xl";

    return (
        <div className={`min-h-screen w-full flex flex-col ${themeClasses}`}>
            {/* Top Bar */}
            <header className={`h-16 flex items-center justify-between px-6 border-b flex-shrink-0 ${isTerminalMode ? 'border-green-500/30 bg-black' : 'border-stc-purple/10 bg-white/50 backdrop-blur'}`}>
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded flex items-center justify-center border ${isTerminalMode ? 'border-green-500 bg-green-500/10' : 'border-stc-purple/20 bg-stc-purple/5'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                    </div>
                    <span className="font-bold tracking-wider uppercase text-lg">Admin Console</span>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={onClose}
                        className={`text-xs font-bold uppercase px-4 py-2 rounded-lg transition-all ${isTerminalMode ? 'bg-red-900/20 text-red-500 hover:bg-red-900/40' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                    >
                        Exit & Logout
                    </button>
                </div>
            </header>

            {/* Main Layout */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className={`w-64 flex flex-col border-r ${isTerminalMode ? 'border-green-500/30 bg-black' : 'border-stc-purple/10 bg-white/30'}`}>
                    <nav className="p-4 space-y-2">
                        {[
                            { id: 'general', label: 'General Settings', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg> },
                            { id: 'api', label: 'LLM Configuration', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z" /><path d="M12 2a10 10 0 0 1 10 10h-10z" /><path d="m12 12 4.09-4.09L12 2" /></svg> },
                            { id: 'system', label: 'System Broadcasts', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg> },
                            { id: 'metrics', label: 'System Metrics', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" /></svg> },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-wide transition-all ${activeTab === tab.id
                                    ? (isTerminalMode ? 'bg-green-500 text-black shadow-lg shadow-green-500/20' : 'bg-stc-purple text-white shadow-lg')
                                    : (isTerminalMode ? 'text-green-700 hover:bg-green-900/30' : 'text-stc-purple/60 hover:bg-white/60')
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                <main className={`flex-1 overflow-y-auto ${activeTab === 'metrics' ? 'p-4' : 'p-8'}`}>
                    <div className={`${activeTab === 'metrics' ? 'w-full h-full' : 'max-w-4xl mx-auto'} space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300`}>
                        {activeTab === 'general' && (
                            <div className={cardClass}>
                                <h3 className="text-xl font-bold mb-6 border-b pb-4 opacity-80">General Interface Settings</h3>

                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h4 className="font-bold text-sm">Visual Effects</h4>
                                            <p className="text-xs opacity-60">Enable Matrix rain and scanlines</p>
                                        </div>
                                        <button
                                            onClick={() => setLocalConfig({ ...localConfig, enableVisualEffects: !localConfig.enableVisualEffects })}
                                            className={`
                                            relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none 
                                            ${localConfig.enableVisualEffects !== false
                                                    ? (isTerminalMode ? 'bg-green-500' : 'bg-stc-coral')
                                                    : (isTerminalMode ? 'bg-green-900/30' : 'bg-gray-300')}
                                        `}
                                        >
                                            <span className={`
                                            absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300
                                            ${localConfig.enableVisualEffects !== false ? 'translate-x-6' : 'translate-x-0'}
                                        `}></span>
                                        </button>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase mb-2">Bot Name</label>
                                        <input
                                            type="text"
                                            value={localConfig.botName}
                                            onChange={e => setLocalConfig({ ...localConfig, botName: e.target.value })}
                                            className={`w-full p-3 rounded-lg ${inputClass}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase mb-2">Welcome Message</label>
                                        <textarea
                                            value={localConfig.welcomeMessage}
                                            onChange={e => setLocalConfig({ ...localConfig, welcomeMessage: e.target.value })}
                                            rows={3}
                                            className={`w-full p-3 rounded-lg resize-none ${inputClass}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'api' && (
                            <div className={cardClass}>
                                <h3 className="text-xl font-bold mb-6 border-b pb-4 opacity-80">Language Model Configuration</h3>

                                <div className="space-y-8">
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="text-xs font-bold uppercase">Context Window Size</label>
                                            <span className="text-xs font-mono opacity-70">Current: {localConfig.contextWindowSize || 1000000} tokens</span>
                                        </div>
                                        <select
                                            value={localConfig.contextWindowSize || 1000000}
                                            onChange={e => setLocalConfig({ ...localConfig, contextWindowSize: Number(e.target.value) })}
                                            className={`w-full p-3 rounded-lg appearance-none ${inputClass}`}
                                        >
                                            <option value={8192}>8K (Local/Edge)</option>
                                            <option value={32768}>32K (Standard)</option>
                                            <option value={128000}>128K (High)</option>
                                            <option value={1000000}>1M (Gemini Flash)</option>
                                            <option value={2000000}>2M (Gemini Pro)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="text-xs font-bold uppercase">Max Output Tokens</label>
                                            <span className="text-xs font-mono opacity-70">{localConfig.maxOutputTokens || 8192}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="1024"
                                            max="32768"
                                            step="1024"
                                            value={localConfig.maxOutputTokens || 8192}
                                            onChange={e => setLocalConfig({ ...localConfig, maxOutputTokens: Number(e.target.value) })}
                                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="text-xs font-bold uppercase">Temperature (Creativity)</label>
                                            <span className="text-xs font-mono opacity-70">{localConfig.temperature}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={localConfig.temperature}
                                            onChange={e => setLocalConfig({ ...localConfig, temperature: Number(e.target.value) })}
                                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'system' && (
                            <div className={cardClass}>
                                <h3 className="text-xl font-bold mb-6 border-b pb-4 opacity-80">System Broadcasts</h3>

                                <div className={`p-6 rounded-lg border mb-4 ${isTerminalMode ? 'border-red-900/50 bg-red-900/10' : 'bg-yellow-50 border-yellow-200'}`}>
                                    <div className="flex items-center gap-2 mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isTerminalMode ? "text-red-500" : "text-yellow-600"}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                                        <span className="font-bold text-sm uppercase">Active Alert Banner</span>
                                    </div>
                                    <textarea
                                        value={alertDraft}
                                        onChange={e => setAlertDraft(e.target.value)}
                                        placeholder="Enter downtime notice or system alert message..."
                                        rows={4}
                                        className={`w-full p-3 rounded-lg resize-none mb-4 ${inputClass}`}
                                    />
                                    <div className="flex justify-end gap-3">
                                        <button
                                            onClick={handleClearAlert}
                                            className={`px-4 py-2 text-xs font-bold uppercase rounded-lg transition-colors ${isTerminalMode ? 'bg-red-900/30 text-red-500 hover:bg-red-900/50' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                                        >
                                            Clear Alert
                                        </button>
                                        <button
                                            onClick={handlePublishAlert}
                                            className={`px-4 py-2 text-xs font-bold uppercase rounded-lg transition-colors ${isTerminalMode ? 'bg-green-500 text-black hover:bg-green-400' : 'bg-stc-purple text-white hover:bg-stc-coral'}`}
                                        >
                                            Stage Alert
                                        </button>
                                    </div>
                                </div>
                                <p className="text-xs opacity-60 italic">
                                    Changes staged here will apply after clicking the main "Save Changes" button below.
                                </p>
                            </div>
                        )}

                        {activeTab === 'metrics' && (
                            <div className="h-full">
                                <AdminPortal
                                    onClose={() => { }}
                                    isTerminalMode={isTerminalMode}
                                    embedded={true}
                                />
                            </div>
                        )}

                        {/* Global Save Action - Hidden on Metrics Tab */}
                        {activeTab !== 'metrics' && (
                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleSave}
                                    className={`px-8 py-3 text-sm font-bold uppercase rounded-xl shadow-xl transition-transform transform hover:scale-105 active:scale-95 ${isTerminalMode
                                        ? 'bg-green-500 text-black shadow-green-500/20'
                                        : 'bg-stc-purple text-white hover:bg-stc-coral'
                                        }`}
                                >
                                    Save System Configuration
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};
