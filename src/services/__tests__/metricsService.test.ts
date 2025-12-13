import { metricsService, LLMRequestMetric } from '../metricsService';

global.fetch = vi.fn();

describe('metricsService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        metricsService.clearMetrics();
    });

    it('tracks LLM request and syncs to backend', async () => {
        const metric: Omit<LLMRequestMetric, 'id' | 'timestamp'> = {
            model: 'llama3',
            success: true,
            durationMs: 100,
            inputTokens: 10,
            outputTokens: 20
        };

        await metricsService.trackLLMRequest(metric);

        // Check internal state
        const stored = metricsService.getMetrics();
        expect(stored.llmRequests).toHaveLength(1);
        expect(stored.llmRequests[0].model).toBe('llama3');

        // Check backend call
        expect(fetch).toHaveBeenCalledWith('/api/metrics/llm', expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('llama3')
        }));
    });

    it('enforces ring buffer limit (max 50)', async () => {
        // Fill with 55 items
        for (let i = 0; i < 55; i++) {
            await metricsService.trackLLMRequest({
                model: `model-${i}`,
                success: true,
                durationMs: 10
            });
        }

        const stored = metricsService.getMetrics();
        expect(stored.llmRequests).toHaveLength(50);
        // Correct slicing check: should contain the last 50
        expect(stored.llmRequests[49].model).toBe('model-54');
    });

    it('tracks tool usage properly', async () => {
        await metricsService.trackToolUsage({
            toolName: 'test-tool',
            service: 'test-service',
            success: true,
            args: {}
        });

        const stored = metricsService.getMetrics();
        expect(stored.toolUsage).toHaveLength(1);
        expect(stored.toolUsage[0].toolName).toBe('test-tool');

        expect(fetch).toHaveBeenCalledWith('/api/metrics/tool', expect.anything());
    });

    it('tracks session start', async () => {
        await metricsService.trackSessionStart(500, 'TestAgent');
        expect(fetch).toHaveBeenCalledWith('/api/metrics/session', expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('TestAgent')
        }));
    });
});
