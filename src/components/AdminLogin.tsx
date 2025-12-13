import React, { useState } from 'react';

interface AdminLoginProps {
    onLogin: () => void;
    isTerminalMode: boolean;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, isTerminalMode }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple hardcoded check for MVP - in production this should be env var or backend auth
        if (password === 'admin123' || password === 'devops') {
            onLogin();
        } else {
            setError('Access Denied: Invalid Credentials');
            setPassword('');
        }
    };

    const themeClasses = isTerminalMode
        ? "bg-black text-green-500 font-mono"
        : "bg-stc-light text-stc-purple font-sans";

    const inputClasses = isTerminalMode
        ? "bg-black border-green-500 text-green-500 focus:ring-green-500/50"
        : "bg-white border-stc-purple/20 text-stc-purple focus:ring-stc-coral/50";

    return (
        <div className={`min-h-screen w-full flex items-center justify-center p-4 ${themeClasses}`}>
            <div className={`w-full max-w-md p-8 rounded-xl border shadow-2xl ${isTerminalMode ? 'border-green-500 bg-black' : 'border-stc-purple/10 bg-white/80 backdrop-blur'}`}>
                <div className="text-center mb-8">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center border-2 ${isTerminalMode ? 'border-green-500 bg-green-900/20' : 'border-stc-purple/20 bg-stc-purple/5'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Admin System</h1>
                    <p className="text-sm opacity-60 mt-2">Restricted Access Area</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
                            Authentication Key
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full px-4 py-3 rounded-lg border outline-none focus:ring-2 transition-all ${inputClasses}`}
                            placeholder={isTerminalMode ? "Enter password..." : "••••••••"}
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className={`text-xs font-bold p-3 rounded border ${isTerminalMode ? 'text-red-500 border-red-500/50 bg-red-900/10' : 'text-red-600 border-red-200 bg-red-50'}`}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className={`w-full py-3 rounded-lg font-bold uppercase tracking-wider transition-all transform active:scale-95 ${isTerminalMode
                            ? 'bg-green-600/20 text-green-500 border border-green-500 hover:bg-green-500 hover:text-black'
                            : 'bg-stc-purple text-white hover:bg-stc-coral shadow-lg hover:shadow-xl'}`}
                    >
                        Authenticate
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <a href="/" className={`text-xs hover:underline opacity-60 hover:opacity-100 transition-opacity ${isTerminalMode ? 'text-green-500' : 'text-stc-purple'}`}>
                        ← Return to Chat Interface
                    </a>
                </div>
            </div>
        </div>
    );
};
