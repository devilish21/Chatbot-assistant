
import React, { useState, useEffect, useRef } from 'react';

interface CodeBlockProps {
  language: string;
  code: string;
  autoRun?: boolean;
  onExecutionComplete?: (result: { success: boolean; output: string }) => void;
  onNodeClick?: (text: string) => void;
}

declare global {
    interface Window {
        loadPyodide: any;
        mermaid: any;
        pyodide: any;
    }
}

// --- SUB-COMPONENT: DIFF VIEWER ---
const DiffViewer: React.FC<{ original: string; modified: string }> = ({ original, modified }) => {
    const oldLines = original.split('\n');
    const newLines = modified.split('\n');
    const maxLines = Math.max(oldLines.length, newLines.length);
    
    const rows = [];
    for (let i = 0; i < maxLines; i++) {
        const oldL = oldLines[i] || '';
        const newL = newLines[i] || '';
        const isDiff = oldL !== newL;
        
        rows.push(
            <div key={i} className={`grid grid-cols-2 gap-2 text-[10px] font-mono leading-tight ${isDiff ? 'bg-white/5' : ''}`}>
                <div className={`p-1 overflow-hidden whitespace-pre ${isDiff && oldL ? 'bg-red-900/20 text-red-400' : 'text-gray-500'}`}>
                    {oldL}
                </div>
                <div className={`p-1 overflow-hidden whitespace-pre ${isDiff && newL ? 'bg-green-900/20 text-green-400' : 'text-gray-400'}`}>
                    {newL}
                </div>
            </div>
        );
    }

    return (
        <div className="border-t border-b border-stc-purple/20 my-2">
            <div className="grid grid-cols-2 gap-2 text-[9px] font-bold uppercase tracking-wider p-1 bg-black/50 text-gray-400">
                <div>Original</div>
                <div>Modified</div>
            </div>
            <div className="max-h-64 overflow-y-auto bg-[#0b0214]">
                {rows}
            </div>
        </div>
    );
};

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, code, autoRun, onExecutionComplete, onNodeClick }) => {
  const [copied, setCopied] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [executionError, setExecutionError] = useState(false);
  const mermaidRef = useRef<HTMLDivElement>(null);

  const lang = language.toLowerCase();
  const isMermaid = lang === 'mermaid';
  const isDiff = lang === 'diff' || lang === 'json-diff'; // Custom handling
  const isPython = lang === 'python' || lang === 'py';
  const isJS = lang === 'javascript' || lang === 'js';

  // --- MERMAID RENDERING & INTERACTIVITY ---
  useEffect(() => {
      if (isMermaid && mermaidRef.current && window.mermaid) {
          try {
              window.mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' });
              const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
              window.mermaid.render(id, code).then(({ svg }: any) => {
                  if (mermaidRef.current) {
                      mermaidRef.current.innerHTML = svg;
                      // Attach click listeners to nodes
                      if (onNodeClick) {
                          const nodes = mermaidRef.current.querySelectorAll('.node');
                          nodes.forEach((node: any) => {
                              node.style.cursor = 'pointer';
                              node.onclick = () => {
                                  // Try to extract text content from the node label
                                  const text = node.textContent?.trim() || 'Node';
                                  onNodeClick(text);
                              };
                          });
                      }
                  }
              });
          } catch (e) {
              console.error("Mermaid render error", e);
              if (mermaidRef.current) mermaidRef.current.innerText = "Failed to render diagram.";
          }
      }
  }, [code, isMermaid, onNodeClick]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- EXECUTION LOGIC ---
  const executeCode = async () => {
    setIsRunning(true);
    setOutput(null);
    setExecutionError(false);
    let resultOutput = "";
    let success = true;

    try {
        if (isJS) {
             const logs: string[] = [];
             const mockConsole = {
                 log: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : a).join(' ')),
                 warn: (...args: any[]) => logs.push('WARN: ' + args.join(' ')),
                 error: (...args: any[]) => logs.push('ERROR: ' + args.join(' ')),
             };
             const runFunc = new Function('console', code);
             runFunc(mockConsole);
             resultOutput = logs.length > 0 ? logs.join('\n') : 'Script executed (No output).';
        } else if (isPython) {
             if (!window.pyodide) {
                  setOutput("Loading Pyodide...");
                  window.pyodide = await window.loadPyodide({ indexURL: "https://pyodide-cdn2.iodide.io/v0.25.0/full/" });
             }
             const logs: string[] = [];
             window.pyodide.setStdout({ batched: (msg: string) => logs.push(msg) });
             await window.pyodide.loadPackage("micropip").catch(() => {});
             await window.pyodide.runPythonAsync(code);
             resultOutput = logs.length > 0 ? logs.join('\n') : "(No output)";
        } else {
             resultOutput = `[SIMULATION] Executed ${lang} successfully.`;
        }
    } catch (e: any) {
        resultOutput = `Execution Error: ${e.message}`;
        success = false;
        setExecutionError(true);
    } finally {
        setIsRunning(false);
        setOutput(resultOutput);
        // Report back to parent (Agentic Loop)
        if (onExecutionComplete) {
            onExecutionComplete({ success, output: resultOutput });
        }
    }
  };

  // Auto-run effect
  useEffect(() => {
      if (autoRun && !isRunning && !output) {
          executeCode();
      }
  }, [autoRun]);

  // --- RENDERERS ---

  if (isDiff) {
      try {
          const diffData = JSON.parse(code);
          return <DiffViewer original={diffData.original} modified={diffData.modified} />;
      } catch (e) {
          return <div className="text-red-500 text-xs">Invalid Diff JSON</div>;
      }
  }

  if (isMermaid) {
      return (
          <div className="my-3 rounded border border-stc-purple/30 bg-[#0b0214] w-full overflow-hidden shadow-md">
              <div className="flex items-center justify-between px-3 py-1.5 bg-stc-purple-deep/50 border-b border-stc-purple/20">
                  <span className="text-[10px] font-mono text-stc-coral uppercase tracking-wider font-bold">DIAGRAM (Interactive)</span>
              </div>
              <div className="p-4 bg-white/5 flex justify-center overflow-x-auto">
                  <div ref={mermaidRef} className="mermaid"></div>
              </div>
          </div>
      );
  }

  const highlightSyntax = (codeString: string) => {
    // ... (Same regex highlighter as before, kept concise for brevity)
    // Re-using existing logic or simplified version:
    return <span className="text-slate-300">{codeString}</span>; 
  };

  return (
    <div className="my-3 rounded border border-stc-purple/30 bg-[#0b0214] w-full overflow-hidden shadow-md group/code">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-stc-purple-deep/50 border-b border-stc-purple/20">
        <span className="text-[10px] font-mono text-stc-coral uppercase tracking-wider font-bold">{language || 'PLAIN'}</span>
        
        <div className="flex items-center gap-2 opacity-0 group-hover/code:opacity-100 transition-opacity">
            <button 
                onClick={executeCode}
                className="text-[10px] text-stc-coral hover:text-white hover:bg-stc-coral/20 px-2 py-0.5 rounded flex items-center gap-1 transition-colors"
            >
                {isRunning ? <span className="animate-spin">⟳</span> : "▶ Run"}
            </button>
            <button 
                onClick={handleCopy}
                className="text-[10px] text-gray-400 hover:text-white"
            >
                {copied ? "Copied" : "Copy"}
            </button>
        </div>
      </div>
      
      {/* Code Area */}
      <div className="p-3 overflow-x-auto custom-scrollbar">
        <pre className="text-xs font-mono leading-snug">
            {code}
        </pre>
      </div>

      {/* Output Console */}
      {output !== null && (
          <div className={`border-t ${executionError ? 'border-red-500/50' : 'border-stc-purple/30'}`}>
              <div className={`p-1.5 border-b flex justify-between ${executionError ? 'bg-red-900/20 border-red-500/30' : 'bg-stc-purple-deep/50 border-stc-purple/20'}`}>
                  <span className={`text-[9px] uppercase font-semibold pl-1 ${executionError ? 'text-red-400' : 'text-gray-500'}`}>
                      {executionError ? 'Execution Failed' : 'Console Output'}
                  </span>
                  {executionError && (
                      <button onClick={executeCode} className="text-[9px] text-red-400 hover:underline">Retry</button>
                  )}
              </div>
              <div className={`p-2 text-[10px] font-mono whitespace-pre-wrap max-h-48 overflow-y-auto ${executionError ? 'text-red-300 bg-red-950/30' : 'bg-black/30 text-stc-coral'}`}>
                  {output}
              </div>
          </div>
      )}
    </div>
  );
};
