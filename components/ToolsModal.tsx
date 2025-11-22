import React, { useState } from 'react';
import yaml from 'js-yaml';

interface ToolsModalProps {
    isOpen: boolean;
    onClose: () => void;
    isTerminalMode: boolean;
    addToast: (msg: string, type: 'info'|'success'|'error') => void;
}

export const ToolsModal: React.FC<ToolsModalProps> = ({ isOpen, onClose, isTerminalMode, addToast }) => {
    const [activeTool, setActiveTool] = useState<'yaml' | 'json' | 'base64'>('yaml');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [isValid, setIsValid] = useState<boolean | null>(null);

    if (!isOpen) return null;

    const handleYamlValidate = () => {
        try {
            const parsed = yaml.load(input);
            if (parsed && typeof parsed === 'object') {
                setOutput(JSON.stringify(parsed, null, 2));
                setIsValid(true);
                addToast('Valid YAML Configuration', 'success');
            } else {
                throw new Error('Invalid YAML structure (Result is not an object)');
            }
        } catch (e: any) {
            setOutput(`YAML Syntax Error:\n${e.message}`);
            setIsValid(false);
            addToast('Invalid YAML', 'error');
        }
    };

    const handleJsonFormat = () => {
        try {
            const parsed = JSON.parse(input);
            setOutput(JSON.stringify(parsed, null, 2));
            setIsValid(true);
            addToast('Valid JSON Format', 'success');
        } catch (e: any) {
            setOutput(`JSON Syntax Error:\n${e.message}`);
            setIsValid(false);
            addToast('Invalid JSON', 'error');
        }
    };

    const handleBase64Encode = () => {
        try {
            setOutput(btoa(input));
            setIsValid(true);
            addToast('Encoded Successfully', 'success');
        } catch (e: any) {
            setOutput(`Error: ${e.message}`);
            setIsValid(false);
        }
    };

    const handleBase64Decode = () => {
        try {
            setOutput(atob(input));
            setIsValid(true);
            addToast('Decoded Successfully', 'success');
        } catch (e: any) {
            setOutput(`Error: ${e.message}`);
            setIsValid(false);
            addToast('Invalid Base64 String', 'error');
        }
    };

    const containerClass = isTerminalMode 
        ? "bg-black border border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.15)] text-green-500 font-mono" 
        : "bg-white border border-stc-purple/20 shadow-2xl text-stc-purple font-sans";

    const btnClass = isTerminalMode
        ? "px-3 py-1.5 border border-green-500 hover:bg-green-500 hover:text-black transition-colors text-xs uppercase font-bold"
        : "px-3 py-1.5 bg-stc-purple text-white hover:bg-stc-coral rounded shadow text-xs font-bold transition-colors";

    const tabClass = (tab: string) => `flex-1 py-3 text-xs font-bold uppercase tracking-wider ${
        activeTool === tab 
            ? (isTerminalMode ? 'bg-green-900/20 text-green-400' : 'bg-stc-purple/5 text-stc-purple border-b-2 border-stc-coral') 
            : 'opacity-60 hover:opacity-100'
    }`;

    const textAreaClass = isTerminalMode
        ? "w-full h-48 bg-black border border-green-500/50 p-2 text-green-400 text-xs font-mono focus:border-green-500 outline-none resize-none"
        : "w-full h-48 bg-gray-50 border border-gray-200 p-2 text-gray-700 text-xs font-mono focus:border-stc-purple outline-none resize-none rounded";

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div 
                className={`w-full max-w-3xl flex flex-col rounded-xl overflow-hidden relative ${containerClass}`}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`flex items-center justify-between px-6 py-4 border-b ${isTerminalMode ? 'border-green-500/50 bg-green-900/10' : 'border-stc-purple/10 bg-stc-light'}`}>
                    <h2 className="text-lg font-bold tracking-wider uppercase flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                        DevOps Utilities Suite
                    </h2>
                    <button onClick={onClose} className="hover:opacity-70">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className={`flex border-b ${isTerminalMode ? 'border-green-500/30' : 'border-stc-purple/10'}`}>
                    <button onClick={() => { setActiveTool('yaml'); setInput(''); setOutput(''); setIsValid(null); }} className={tabClass('yaml')}>YAML Validator</button>
                    <button onClick={() => { setActiveTool('json'); setInput(''); setOutput(''); setIsValid(null); }} className={tabClass('json')}>JSON Formatter</button>
                    <button onClick={() => { setActiveTool('base64'); setInput(''); setOutput(''); setIsValid(null); }} className={tabClass('base64')}>Base64</button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <div className="flex gap-4 h-full">
                        <div className="flex-1 space-y-2">
                            <div className="flex justify-between">
                                <label className="text-xs font-bold uppercase opacity-70">
                                    Input ({activeTool.toUpperCase()})
                                </label>
                                <button onClick={() => {setInput(''); setOutput(''); setIsValid(null);}} className="text-[10px] underline opacity-50 hover:opacity-100">Clear</button>
                            </div>
                            <textarea 
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                className={textAreaClass}
                                placeholder={activeTool === 'yaml' ? 'Paste K8s manifest or Docker Compose...' : activeTool === 'json' ? 'Paste JSON object...' : 'Paste text to encode/decode...'}
                            />
                        </div>
                        
                        <div className="flex flex-col justify-center gap-3 min-w-[100px]">
                            {activeTool === 'yaml' && (
                                <button onClick={handleYamlValidate} className={btnClass}>Validate &rarr;</button>
                            )}
                            {activeTool === 'json' && (
                                <button onClick={handleJsonFormat} className={btnClass}>Format &rarr;</button>
                            )}
                            {activeTool === 'base64' && (
                                <>
                                    <button onClick={handleBase64Encode} className={btnClass}>Encode &rarr;</button>
                                    <button onClick={handleBase64Decode} className={btnClass}>Decode &rarr;</button>
                                </>
                            )}
                        </div>

                        <div className="flex-1 space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold uppercase opacity-70">
                                    Output / Result
                                    {isValid === true && <span className="ml-2 text-green-500 animate-pulse">● Valid</span>}
                                    {isValid === false && <span className="ml-2 text-red-500 animate-pulse">● Invalid</span>}
                                </label>
                                <button 
                                    onClick={() => {navigator.clipboard.writeText(output); addToast('Copied to clipboard', 'info')}} 
                                    className="text-[10px] underline opacity-50 hover:opacity-100"
                                >
                                    Copy Result
                                </button>
                            </div>
                            <textarea 
                                readOnly
                                value={output}
                                className={`${textAreaClass} ${isValid === false ? (isTerminalMode ? 'border-red-900 text-red-400' : 'border-red-200 text-red-600 bg-red-50') : ''}`}
                                placeholder="Validation status or converted text will appear here..."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};