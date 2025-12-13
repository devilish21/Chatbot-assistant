
import { LLMRequestMetric, ToolUsageMetric, SystemMetrics } from '../types';



const DEFAULT_METRICS: SystemMetrics = {
    llmRequests: [],
    toolUsage: []
};

// Export these for use in other files
export type { LLMRequestMetric, ToolUsageMetric, SystemMetrics };

// Session Management (Transient)
const SESSION_ID = Date.now().toString(36) + Math.random().toString(36).substr(2);

class MetricsService {
    private metrics: SystemMetrics;

    constructor() {
        // Initialize with empty in-memory metrics only
        this.metrics = {
            llmRequests: [],
            toolUsage: []
        };
    }

    public getMetrics(): SystemMetrics {
        return this.metrics;
    }

    public getSessionId(): string {
        return SESSION_ID;
    }

    public clearMetrics() {
        this.metrics = { llmRequests: [], toolUsage: [] };
    }

    public async logEvent(level: string, message: string, metadata: any = {}) {
        try {
            await fetch('/api/logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ level, message, service: 'frontend', metadata })
            });
        } catch (e) {
            console.error('Failed to send log', e);
        }
    }

    public async trackLLMRequest(metric: Omit<LLMRequestMetric, 'id' | 'timestamp'> & { ttftMs?: number }) {
        const newMetric: LLMRequestMetric = {
            ...metric,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            timestamp: Date.now()
        };

        this.metrics.llmRequests.push(newMetric);

        if (this.metrics.llmRequests.length > 50) {
            this.metrics.llmRequests = this.metrics.llmRequests.slice(-50);
        }

        try {
            await fetch('/api/metrics/llm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newMetric, sessionId: SESSION_ID, ttftMs: (metric as any).ttftMs })
            });

            // LOG DETAILED TIMING (User Request: "capture time consumed")
            // This mirrors the browser network timing tab (TTFB vs Download Content)
            const ttft = (metric as any).ttftMs || 0;
            const total = metric.durationMs || 0;
            const downloadTime = total - ttft;

            await this.logEvent('INFO', `LLM Response Generated: ${(total / 1000).toFixed(2)}s`, {
                model: metric.model,
                ttft_ms: ttft, // "Waiting for server response"
                download_ms: downloadTime, // "Content Download"
                total_ms: total,
                tokens: (metric.outputTokens || 0) + (metric.inputTokens || 0)
            });

        } catch (e) {
            console.error("Failed to sync LLM metric to backend", e);
        }
    }

    public async trackToolUsage(metric: Omit<ToolUsageMetric, 'id' | 'timestamp'> & { durationMs?: number }) {
        const newMetric: ToolUsageMetric = {
            ...metric,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            timestamp: Date.now()
        };

        this.metrics.toolUsage.push(newMetric);

        if (this.metrics.toolUsage.length > 50) {
            this.metrics.toolUsage = this.metrics.toolUsage.slice(-50);
        }

        try {
            await fetch('/api/metrics/tool', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newMetric, sessionId: SESSION_ID, durationMs: (metric as any).durationMs })
            });
        } catch (e) {
            console.error("Failed to sync Tool metric to backend", e);
        }
    }

    public async trackFeedback(messageId: string, rating: number, comment?: string) {
        try {
            await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messageId, rating, comment, sessionId: SESSION_ID })
            });
        } catch (e) {
            console.error("Failed to send feedback", e);
        }
    }

    public async trackSessionStart(loadTime: number, userAgent: string) {
        try {
            await fetch('/api/metrics/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: SESSION_ID,
                    userId: 'anonymous_' + SESSION_ID.substr(0, 8), // Mock User ID for now
                    startTime: Date.now(),
                    platform: navigator.platform,
                    userAgent: userAgent,
                    loadTime: loadTime
                })
            });
        } catch (e) {
            console.error("Failed to track session", e);
        }
    }

    public importMetrics(data: any): boolean {
        // Basic validation
        if (data && Array.isArray(data.llmRequests) && Array.isArray(data.toolUsage)) {
            this.metrics = data;
            return true;
        }
        return false;
    }
}

export const metricsService = new MetricsService();
