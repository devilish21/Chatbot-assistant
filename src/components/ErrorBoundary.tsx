import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    isTerminalMode?: boolean;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            const isTerminal = this.props.isTerminalMode;

            return (
                <div className={`p-6 rounded-lg border ${isTerminal ? 'bg-red-900/20 border-red-500 text-red-500 font-mono' : 'bg-red-50 border-red-200 text-red-600 font-sans'}`}>
                    <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        System Component Error
                    </h2>
                    <p className="text-sm opacity-90 mb-4">
                        A critical error occurred while rendering this component.
                    </p>
                    <div className="bg-black/10 p-2 rounded text-xs font-mono overflow-auto max-h-32 whitespace-pre-wrap">
                        {this.state.error?.message}
                    </div>
                    <button
                        onClick={() => this.setState({ hasError: false })}
                        className={`mt-4 px-4 py-2 rounded text-xs font-bold uppercase transition-colors ${isTerminal ? 'bg-red-500 text-black hover:bg-red-400' : 'bg-red-600 text-white hover:bg-red-700'}`}
                    >
                        Retry Component
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
