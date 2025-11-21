
import React, { useState, useRef, useEffect } from 'react';
import { AppConfig } from '../types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSaveConfig: (newConfig: AppConfig) => void;
  isTerminalMode: boolean;
  addToast: (msg: string, type: 'info' | 'success' | 'error') => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
    isOpen, onClose, config, onSaveConfig, isTerminalMode, addToast 
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Settings State
  const [localConfig, setLocalConfig] = useState<AppConfig>(config);
  const [activeTab, setActiveTab] = useState<'general' | 'api' | 'system'>('general');
  const [alertDraft, setAlertDraft] = useState(config.systemAlert || '');
  
  // Sync local state with global config when panel opens or config changes
  useEffect(() => {
    if (isOpen) {
        setLocalConfig(config);
        setAlertDraft(config.systemAlert || '');
    }
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // MOCK AUTHENTICATION
    if (username === 'admin' && password === 'admin123') {
        setIsAuthenticated(true);
        addToast('Admin Access Granted', 'success');
    } else {
        addToast('Invalid Credentials', 'error');
    }
  };

  const handleSave = () => {
      onSaveConfig(localConfig);
      addToast('System Configuration Updated', 'success');
      onClose();
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

  const containerClass = isTerminalMode 
    ? "bg-black border border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.15)] text-green-500 font-mono" 
    : "bg-white border border-stc-purple/20 shadow-2xl text-stc-purple font-sans";

  const inputClass = isTerminalMode
    ? "bg-black border border-green-500 text-green-500 placeholder-green-800 focus:outline-none focus:shadow-[0_0_10px_rgba(34,197,94,0.4)]"
    : "bg-stc-light border border-stc-purple/20 text-stc-purple focus:outline-none focus:border-stc-purple";

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className={`w-full max-w-2xl rounded-xl overflow-hidden relative flex flex-col ${containerClass} ${isAuthenticated ? 'h-[600px]' : 'h-auto'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isTerminalMode ? 'border-green-500/50 bg-green-900/10' : 'border-stc-purple/10 bg-stc-light'}`}>
            <h2 className="text-lg font-bold tracking-wider uppercase flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                ADMINISTRATION CONSOLE
            </h2>
            <button onClick={onClose} className="hover:opacity-70 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        </div>

        {!isAuthenticated ? (
            /* LOGIN SCREEN */
            <form onSubmit={handleLogin} className="p-8 flex flex-col gap-6">
                <div className="text-center space-y-2 mb-4">
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center border-2 mb-4 ${isTerminalMode ? 'border-red-500 text-red-500' : 'border-stc-purple text-stc-purple'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <h3 className="text-xl font-bold">Restricted Access</h3>
                    <p className="opacity-70 text-sm">Please verify your credentials to proceed.</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase mb-1 opacity-70">Username</label>
                        <input 
                            type="text" 
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className={`w-full p-3 rounded ${inputClass}`}
                            placeholder="Enter username"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase mb-1 opacity-70">Password</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className={`w-full p-3 rounded ${inputClass}`}
                            placeholder="Enter password"
                        />
                    </div>
                </div>

                <button 
                    type="submit"
                    className={`w-full py-3 font-bold uppercase tracking-wider rounded transition-all mt-2 ${
                        isTerminalMode 
                            ? 'bg-green-500 text-black hover:bg-green-400 hover:shadow-[0_0_15px_rgba(34,197,94,0.5)]' 
                            : 'bg-stc-purple text-white hover:bg-stc-coral shadow-lg'
                    }`}
                >
                    Authenticate
                </button>
            </form>
        ) : (
            /* DASHBOARD SCREEN */
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Tabs */}
                <div className={`w-48 border-r flex flex-col ${isTerminalMode ? 'border-green-500/30 bg-green-900/5' : 'border-stc-purple/10 bg-stc-light'}`}>
                    {[
                        { id: 'general', label: 'General Settings', icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
                        { id: 'api', label: 'LLM Configuration', icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 2a10 10 0 0 1 10 10h-10z"/><path d="m12 12 4.09-4.09L12 2"/></svg> },
                        { id: 'system', label: 'System Alerts', icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-3 px-4 py-4 text-xs font-bold uppercase tracking-wide text-left transition-colors ${
                                activeTab === tab.id 
                                    ? (isTerminalMode ? 'bg-green-500 text-black' : 'bg-stc-purple text-white')
                                    : (isTerminalMode ? 'text-green-700 hover:bg-green-900/20' : 'text-stc-purple/60 hover:bg-white')
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 p-8 overflow-y-auto">
                    {activeTab === 'general' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
                            <div className="flex justify-between items-center border-b pb-2 mb-4">
                                <h3 className="text-sm font-bold uppercase opacity-70">Interface Settings</h3>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold uppercase opacity-80">Enable Visual Effects</span>
                                    <button 
                                        onClick={() => setLocalConfig({...localConfig, enableVisualEffects: !localConfig.enableVisualEffects})}
                                        className={`
                                            relative w-8 h-4 rounded-full transition-colors duration-300 focus:outline-none
                                            ${localConfig.enableVisualEffects !== false 
                                                ? (isTerminalMode ? 'bg-green-500' : 'bg-stc-coral') 
                                                : (isTerminalMode ? 'bg-green-900/30' : 'bg-gray-300')}
                                        `}
                                    >
                                        <span className={`
                                            absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform duration-300
                                            ${localConfig.enableVisualEffects !== false ? 'translate-x-4' : 'translate-x-0'}
                                        `}></span>
                                    </button>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold uppercase mb-2">Bot Name</label>
                                <input 
                                    type="text" 
                                    value={localConfig.botName}
                                    onChange={e => setLocalConfig({...localConfig, botName: e.target.value})}
                                    className={`w-full p-2 rounded text-sm ${inputClass}`}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase mb-2">Welcome Message</label>
                                <textarea 
                                    value={localConfig.welcomeMessage}
                                    onChange={e => setLocalConfig({...localConfig, welcomeMessage: e.target.value})}
                                    rows={4}
                                    className={`w-full p-2 rounded text-sm resize-none ${inputClass}`}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'api' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
                             <h3 className="text-sm font-bold uppercase border-b pb-2 opacity-70">Model Configuration</h3>
                             
                             <div>
                                <label className="block text-xs font-bold uppercase mb-2">Context Window Size</label>
                                <p className="text-[10px] opacity-70 mb-2">Total token capacity for history and inputs. Visualized in footer.</p>
                                <div className="flex items-center gap-4">
                                    <select
                                        value={localConfig.contextWindowSize || 1000000}
                                        onChange={e => setLocalConfig({...localConfig, contextWindowSize: Number(e.target.value)})}
                                        className={`flex-1 p-2 rounded text-xs ${inputClass}`}
                                    >
                                        <option value={8192}>8K (Local/Edge)</option>
                                        <option value={32768}>32K (Standard)</option>
                                        <option value={128000}>128K (High)</option>
                                        <option value={1000000}>1M (Gemini Flash)</option>
                                        <option value={2000000}>2M (Gemini Pro)</option>
                                        {/* Add option if config has a custom value not in the list */}
                                        {![8192, 32768, 128000, 1000000, 2000000].includes(localConfig.contextWindowSize || 0) && (
                                            <option value={localConfig.contextWindowSize}>{localConfig.contextWindowSize} (Custom)</option>
                                        )}
                                    </select>
                                </div>
                             </div>

                             <div>
                                <label className="block text-xs font-bold uppercase mb-2">Max Output Tokens</label>
                                <p className="text-[10px] opacity-70 mb-2">Controls the maximum length of the model's response. Higher values allow detailed code generation.</p>
                                <div className="flex items-center gap-4">
                                    <input 
                                        type="range" 
                                        min="1024" 
                                        max="32768" 
                                        step="1024"
                                        value={localConfig.maxOutputTokens || 8192}
                                        onChange={e => setLocalConfig({...localConfig, maxOutputTokens: Number(e.target.value)})}
                                        className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <span className={`font-mono font-bold ${isTerminalMode ? 'text-green-400' : 'text-stc-coral'}`}>
                                        {localConfig.maxOutputTokens || 8192}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase mb-2">Temperature (Creativity)</label>
                                <div className="flex items-center gap-4">
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="1" 
                                        step="0.1"
                                        value={localConfig.temperature}
                                        onChange={e => setLocalConfig({...localConfig, temperature: Number(e.target.value)})}
                                        className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <span className={`font-mono font-bold ${isTerminalMode ? 'text-green-400' : 'text-stc-coral'}`}>
                                        {localConfig.temperature}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'system' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
                             <h3 className="text-sm font-bold uppercase border-b pb-2 opacity-70">System Broadcast</h3>
                             
                             <div className={`p-4 rounded border ${isTerminalMode ? 'border-green-900 bg-green-900/10' : 'bg-yellow-50 border-yellow-200'}`}>
                                 <div className="flex items-center gap-2 mb-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isTerminalMode ? "text-red-500" : "text-yellow-600"}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                                    <span className="font-bold text-xs uppercase">Active Alert Banner</span>
                                 </div>
                                 <textarea 
                                    value={alertDraft}
                                    onChange={e => setAlertDraft(e.target.value)}
                                    placeholder="Enter downtime notice or system alert message..."
                                    rows={3}
                                    className={`w-full p-2 rounded text-sm resize-none ${inputClass}`}
                                 />
                                 <div className="flex justify-end gap-2 mt-2">
                                     <button 
                                        onClick={handleClearAlert}
                                        className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded transition-colors ${isTerminalMode ? 'bg-red-900/30 text-red-500 hover:bg-red-900/50' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                                     >
                                        Clear
                                     </button>
                                     <button 
                                        onClick={handlePublishAlert}
                                        className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded transition-colors ${isTerminalMode ? 'bg-green-500 text-black hover:bg-green-400' : 'bg-stc-purple text-white hover:bg-stc-coral'}`}
                                     >
                                        Stage Alert
                                     </button>
                                 </div>
                             </div>
                             
                             <p className="text-[10px] opacity-60">
                                 Note: "Stage Alert" updates the local configuration. Click "Save Changes" below to publish immediately to the main interface.
                             </p>
                        </div>
                    )}

                    {/* Footer Action */}
                    <div className="mt-10 pt-6 border-t border-opacity-20 flex justify-end">
                        <button 
                            onClick={handleSave}
                            className={`px-6 py-2 text-xs font-bold uppercase rounded transition-colors ${
                                isTerminalMode 
                                    ? 'bg-green-500 text-black hover:bg-green-400' 
                                    : 'bg-stc-purple text-white hover:bg-stc-coral'
                            }`}
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
