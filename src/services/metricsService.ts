import { Tool } from './mcpService';

const STORAGE_KEY = 'devops_chatbot_metrics';

export interface LLMRequestMetric {
    id: string;
    timestamp: number;
    model: string;
    tokens?: number;
    success: boolean;
    durationMs?: number;
    error?: string;
}

export interface ToolUsageMetric {
    id: string;
    timestamp: number;
    toolName: string;
    service?: string; // e.g., 'jira', 'jenkins'
    success: boolean;
    args?: any;
    error?: string;
}

export interface SystemMetrics {
    llmRequests: LLMRequestMetric[];
    toolUsage: ToolUsageMetric[];
}

const DEFAULT_METRICS: SystemMetrics = {
    llmRequests: [],
    toolUsage: []
};

export const metricsService = {
    getMetrics: (): SystemMetrics => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : DEFAULT_METRICS;
        } catch (e) {
            console.error('Failed to load metrics', e);
            return DEFAULT_METRICS;
        }
    },

    saveMetrics: (metrics: SystemMetrics) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(metrics));
        } catch (e) {
            console.error('Failed to save metrics', e);
        }
    },

    trackLLMRequest: (metric: Omit<LLMRequestMetric, 'id' | 'timestamp'>) => {
        const current = metricsService.getMetrics();
        const newMetric: LLMRequestMetric = {
            ...metric,
            id: crypto.randomUUID(),
            timestamp: Date.now()
        };

        // Keep last 1000 requests
        const updatedRequests = [newMetric, ...current.llmRequests].slice(0, 1000);

        metricsService.saveMetrics({
            ...current,
            llmRequests: updatedRequests
        });
    },

    trackToolUsage: (metric: Omit<ToolUsageMetric, 'id' | 'timestamp'>) => {
        const current = metricsService.getMetrics();
        const newMetric: ToolUsageMetric = {
            ...metric,
            id: crypto.randomUUID(),
            timestamp: Date.now()
        };

        // Keep last 1000 tool usages
        const updatedTools = [newMetric, ...current.toolUsage].slice(0, 1000);

        metricsService.saveMetrics({
            ...current,
            toolUsage: updatedTools
        });
    },

    clearMetrics: () => {
        localStorage.removeItem(STORAGE_KEY);
    },

    importMetrics: (data: any) => {
        try {
            // Basic validation
            if (data && Array.isArray(data.llmRequests) && Array.isArray(data.toolUsage)) {
                metricsService.saveMetrics(data as SystemMetrics);
                return true;
            }
            return false;
        } catch (e) {
            console.error('Failed to import metrics', e);
            return false;
        }
    }
};
