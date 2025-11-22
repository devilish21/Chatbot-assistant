
import React, { useState, useEffect, useRef } from 'react';

interface CodeBlockProps {
  language: string;
  code: string;
}

declare global {
    interface Window {
        loadPyodide: any;
        mermaid: any;
        pyodide: any;
    }
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [executionError, setExecutionError] = useState(false);
  const mermaidRef = useRef<HTMLDivElement>(null);

  const lang = language.toLowerCase();
  const isMermaid = lang === 'mermaid';
  const isPython = lang === 'python' || lang === 'py';
  const isJS = lang === 'javascript' || lang === 'js';

  useEffect(() => {
      if (isMermaid && mermaidRef.current && window.mermaid) {
          try {
              window.mermaid.initialize({ startOnLoad: false, theme: 'dark' });
              const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
              window.mermaid.render(id, code).then(({ svg }: any) => {
                  if (mermaidRef.current) mermaidRef.current.innerHTML = svg;
              });
          } catch (e) {
              console.error("Mermaid render error", e);
              if (mermaidRef.current) mermaidRef.current.innerText = "Failed to render diagram.";
          }
      }
  }, [code, isMermaid]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runPython = async () => {
      try {
          if (!window.pyodide) {
              setOutput("Loading Python Engine (Pyodide)... this may take a moment...");
              // Explicitly set indexURL to official CDN to ensure files are found
              window.pyodide = await window.loadPyodide({
                  indexURL: "https://pyodide-cdn2.iodide.io/v0.25.0/full/"
              });
          }
          
          const logs: string[] = [];
          window.pyodide.setStdout({ batched: (msg: string) => logs.push(msg) });
          
          // Load micropip safely
          try {
            await window.pyodide.loadPackage("micropip");
          } catch (e) {
            console.warn("Failed to load micropip. Some features may be missing.", e);
          }

          await window.pyodide.runPythonAsync(code);
          const result = logs.length > 0 ? logs.join('\n') : "(No output)";
          
          setOutput(result);
          setExecutionError(false);
      } catch (err: any) {
          setOutput(`Python Error:\n${err.message}`);
          setExecutionError(true);
      }
  };

  const runJS = () => {
      const logs: string[] = [];
      const mockConsole = {
          log: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : a).join(' ')),
          warn: (...args: any[]) => logs.push('WARN: ' + args.join(' ')),
          error: (...args: any[]) => logs.push('ERROR: ' + args.join(' ')),
      };
      
      try {
        const runFunc = new Function('console', code);
        runFunc(mockConsole);
        setOutput(logs.length > 0 ? logs.join('\n') : 'Script executed successfully (No output).');
        setExecutionError(false);
      } catch (err: any) {
        setOutput(`Runtime Error: ${err.message}`);
        setExecutionError(true);
      }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput(null);
    setExecutionError(false);

    // Small timeout to allow UI update
    setTimeout(async () => {
      try {
        if (isJS) {
            runJS();
        } else if (isPython) {
            await runPython();
        } else if (lang === 'bash' || lang === 'sh') {
             setOutput(`[SIMULATION] user@devops-term:~$ ./${Date.now()}.sh\n> Applying configuration...\n> Done.`);
        } else {
             setOutput(`[SIMULATION] Executing ${lang} snippet...\n> Validating syntax... OK\n> Execution simulation complete.`);
        }
      } catch (e: any) {
          setOutput(`Execution Failed: ${e.message}`);
          setExecutionError(true);
      } finally {
          setIsRunning(false);
      }
    }, 100);
  };

  // Simple Regex-based Syntax Highlighting
  const highlightSyntax = (codeString: string) => {
    const tokens = [
        { regex: /"(?:[^"\\]|\\.)*"/g, color: 'text-yellow-300' },
        { regex: /'(?:[^'\\]|\\.)*'/g, color: 'text-yellow-300' },
        { regex: /\b(function|return|var|let|const|if|else|for|while|import|from|class|def|print|echo|sudo|apt|npm|docker|kubectl)\b/g, color: 'text-stc-coral font-bold' },
        { regex: /\b(true|false|null|undefined)\b/g, color: 'text-stc-purple-light' },
        { regex: /\b\d+\b/g, color: 'text-blue-400' },
        { regex: /#.*$/gm, color: 'text-gray-500 italic' },
        { regex: /\/\/.*$/gm, color: 'text-gray-500 italic' },
    ];

    let parts: { text: string, color?: string }[] = [{ text: codeString }];

    tokens.forEach(token => {
        const newParts: { text: string, color?: string }[] = [];
        parts.forEach(part => {
            if (part.color) {
                newParts.push(part);
                return;
            }
            
            let remaining = part.text;
            token.regex.lastIndex = 0;
            
            let match;
            const split = remaining.split(token.regex);
            const matches = remaining.match(token.regex);
            
            if (!matches) {
                newParts.push(part);
                return;
            }

            for (let i = 0; i < split.length; i++) {
                if (split[i]) newParts.push({ text: split[i] });
                if (matches[i]) newParts.push({ text: matches[i], color: token.color });
            }
        });
        parts = newParts;
    });

    return parts.map((part, i) => (
        <span key={i} className={part.color || 'text-slate-200'}>{part.text}</span>
    ));
  };

  if (isMermaid) {
      return (
          <div className="my-3 rounded border border-stc-purple/30 bg-[#0b0214] w-full overflow-hidden shadow-md">
              <div className="flex items-center justify-between px-3 py-1.5 bg-stc-purple-deep/50 border-b border-stc-purple/20">
                  <span className="text-[10px] font-mono text-stc-coral uppercase tracking-wider font-bold">DIAGRAM</span>
              </div>
              <div className="p-4 bg-white/5 flex justify-center">
                  <div ref={mermaidRef} className="mermaid"></div>
              </div>
          </div>
      );
  }

  return (
    <div className="my-3 rounded border border-stc-purple/30 bg-[#0b0214] w-full overflow-hidden shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-stc-purple-deep/50 border-b border-stc-purple/20">
        <span className="text-[10px] font-mono text-stc-coral uppercase tracking-wider font-bold">{language || 'PLAIN'}</span>
        
        <div className="flex items-center gap-2">
            <button 
                onClick={handleRun}
                className="text-[10px] text-stc-coral hover:text-white hover:bg-stc-coral/20 px-2 py-0.5 rounded flex items-center gap-1 transition-colors"
            >
                {isRunning ? (
                    <span className="animate-spin">⟳</span>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                )}
                Run
            </button>
            <button 
            onClick={handleCopy}
            className="text-[10px] text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
            >
            {copied ? (
                <span className="text-stc-coral">Copied</span>
            ) : (
                <span>Copy</span>
            )}
            </button>
        </div>
      </div>
      
      {/* Code Area */}
      <div className="p-3 overflow-x-auto overflow-y-hidden">
        <pre className="text-xs font-mono leading-snug">
          <code>{highlightSyntax(code)}</code>
        </pre>
      </div>

      {/* Output Console */}
      {output !== null && (
          <div className={`border-t ${executionError ? 'border-red-500/50' : 'border-stc-purple/30'}`}>
              <div className={`p-1.5 border-b ${executionError ? 'bg-red-900/20 border-red-500/30' : 'bg-stc-purple-deep/50 border-stc-purple/20'}`}>
                  <span className={`text-[9px] uppercase font-semibold pl-1 ${executionError ? 'text-red-400' : 'text-gray-500'}`}>
                      {executionError ? 'Execution Error' : 'Console Output'}
                  </span>
              </div>
              <div className={`p-2 text-[10px] font-mono whitespace-pre-wrap animate-in fade-in slide-in-from-top-2 duration-300 max-h-48 overflow-y-auto ${executionError ? 'text-red-300 bg-red-950/30' : 'bg-black/30 text-stc-coral'}`}>
                  {output}
              </div>
          </div>
      )}
    </div>
  );
};
