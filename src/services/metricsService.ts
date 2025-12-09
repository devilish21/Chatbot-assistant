
import { LLMRequestMetric, ToolUsageMetric, SystemMetrics } from '../types';

const STORAGE_KEY = 'devops_chatbot_metrics';

const DEFAULT_METRICS: SystemMetrics = {
    llmRequests: [],
    toolUsage: []
};

// Export these for use in other files
export type { LLMRequestMetric, ToolUsageMetric, SystemMetrics };

class MetricsService {
    private metrics: SystemMetrics;

    constructor() {
        this.metrics = this.loadMetrics();
    }

    private loadMetrics(): SystemMetrics {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return DEFAULT_METRICS;
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error("Failed to parse metrics", e);
            return DEFAULT_METRICS;
        }
    }

    private saveMetrics() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.metrics));
    }

    public getMetrics(): SystemMetrics {
        return this.metrics;
    }

    public clearMetrics() {
        this.metrics = { llmRequests: [], toolUsage: [] };
        this.saveMetrics();
    }

    public trackLLMRequest(metric: Omit<LLMRequestMetric, 'id' | 'timestamp'>) {
        const newMetric: LLMRequestMetric = {
            ...metric,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            timestamp: Date.now()
        };
        this.metrics.llmRequests.push(newMetric);

        // Keep only last 1000 requests to prevent storage overflow
        if (this.metrics.llmRequests.length > 1000) {
            this.metrics.llmRequests = this.metrics.llmRequests.slice(-1000);
        }

        this.saveMetrics();
    }

    public trackToolUsage(metric: Omit<ToolUsageMetric, 'id' | 'timestamp'>) {
        const newMetric: ToolUsageMetric = {
            ...metric,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            timestamp: Date.now()
        };
        this.metrics.toolUsage.push(newMetric);

        // Keep only last 1000 tool usages
        if (this.metrics.toolUsage.length > 1000) {
            this.metrics.toolUsage = this.metrics.toolUsage.slice(-1000);
        }

        this.saveMetrics();
    }

    public importMetrics(data: any): boolean {
        // Basic validation
        if (data && Array.isArray(data.llmRequests) && Array.isArray(data.toolUsage)) {
            this.metrics = data;
            this.saveMetrics();
            return true;
        }
        return false;
    }
}

export const metricsService = new MetricsService();
