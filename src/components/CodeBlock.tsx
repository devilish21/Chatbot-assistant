
import React, { useState } from 'react';

interface CodeBlockProps {
  language: string;
  code: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        // Fallback
        const textArea = document.createElement("textarea");
        textArea.value = code;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Fallback copy failed', err);
        }
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const handleRun = () => {
    setIsRunning(true);
    setOutput(null);

    setTimeout(() => {
      const lang = language.toLowerCase();
      let result = '';

      try {
        if (lang === 'javascript' || lang === 'js') {
          const logs: string[] = [];
          const mockConsole = {
            log: (...args: any[]) => logs.push(args.join(' ')),
            warn: (...args: any[]) => logs.push('WARN: ' + args.join(' ')),
            error: (...args: any[]) => logs.push('ERROR: ' + args.join(' ')),
          };
          const runFunc = new Function('console', code);
          runFunc(mockConsole);
          result = logs.length > 0 ? logs.join('\n') : 'Script executed successfully (No output).';
        } else if (lang === 'python' || lang === 'py') {
          result = `[SIMULATION] Python Interpreter v3.10\nRunning script...\n\n> Execution completed.\n(Actual execution requires backend sandbox)`;
        } else if (lang === 'bash' || lang === 'sh') {
          result = `[SIMULATION] user@devops-term:~$ ./${Date.now()}.sh\n> Applying configuration...\n> Done.`;
        } else {
          result = `[SIMULATION] Executing ${lang} snippet...\n> Validating syntax... OK\n> Execution simulation complete.`;
        }
      } catch (err: any) {
        result = `Error: ${err.message}`;
      }

      setOutput(result);
      setIsRunning(false);
    }, 800);
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
              <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
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
        <div className="border-t border-stc-purple/30">
          <div className="bg-stc-purple-deep/50 p-1.5 border-b border-stc-purple/20">
            <span className="text-[9px] uppercase text-gray-500 font-semibold pl-1">Console Output</span>
          </div>
          <div className="p-2 bg-black/30 text-[10px] font-mono text-stc-coral whitespace-pre-wrap animate-in fade-in slide-in-from-top-2 duration-300">
            {output}
          </div>
        </div>
      )}
    </div>
  );
};
