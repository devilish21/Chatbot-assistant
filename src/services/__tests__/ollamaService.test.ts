import { streamChatCompletion, validateEndpoint, cancelGeneration } from '../ollamaService';
import { AppConfig, Message } from '../../types';
import { metricsService } from '../metricsService';
import { mcpService } from '../mcpService';

// Mock dependencies
vi.mock('../metricsService', () => ({
    metricsService: {
        trackLLMRequest: vi.fn(),
        logEvent: vi.fn(),
        trackToolUsage: vi.fn()
    }
}));

vi.mock('../mcpService', () => ({
    mcpService: {
        getTools: vi.fn().mockResolvedValue([]),
        callTool: vi.fn().mockResolvedValue({ result: 'tool-result' })
    }
}));

global.fetch = vi.fn();

describe('ollamaService', () => {
    const defaultConfig: AppConfig = {
        model: 'llama3',
        endpoint: 'http://localhost:11434',
        systemInstruction: 'You are a bot',
        temperature: 0.7,
        maxOutputTokens: 1000,
        activeCategories: [],
        toolSafety: false,
        enableSuggestions: true,
        enableVisualEffects: true,
        botName: 'Test Bot',
        welcomeMessage: 'Hello',
        systemAlert: null
    };

    const messages: Message[] = [
        { id: '1', role: 'user', content: 'Hello', timestamp: Date.now() }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('validates endpoint successfully', async () => {
        (fetch as any).mockResolvedValueOnce({ ok: true });
        const isValid = await validateEndpoint('http://localhost:11434');
        expect(isValid).toBe(true);
        expect(fetch).toHaveBeenCalledWith('http://localhost:11434/api/tags');
    });

    it('fails validation on network error', async () => {
        (fetch as any).mockRejectedValueOnce(new Error('Network error'));
        const isValid = await validateEndpoint('http://bad-url');
        expect(isValid).toBe(false);
    });

    it('streams chat completion successfully', async () => {
        // Mock streaming response
        const mockStream = new ReadableStream({
            start(controller) {
                const chunks = [
                    JSON.stringify({ message: { content: 'Hello' } }),
                    JSON.stringify({ message: { content: ' World' }, done: true })
                ];
                controller.enqueue(new TextEncoder().encode(chunks[0] + '\n'));
                controller.enqueue(new TextEncoder().encode(chunks[1] + '\n'));
                controller.close();
            }
        });

        (fetch as any).mockResolvedValueOnce({
            ok: true,
            status: 200,
            statusText: 'OK',
            body: mockStream
        });

        const generator = streamChatCompletion(messages, defaultConfig);
        const parts = [];
        for await (const part of generator) {
            parts.push(part);
        }

        expect(parts.join('')).toBe('Hello World');
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('handles network error nicely', async () => {
        (fetch as any).mockRejectedValueOnce(new Error('Failed to fetch'));

        const generator = streamChatCompletion(messages, defaultConfig);
        await expect(async () => {
            for await (const part of generator) {
                // consume
            }
        }).rejects.toThrow("Could not connect to Ollama. Make sure 'ollama serve' is running.");
    });

    it('handles cancellation', async () => {
        // Setup a stream that never ends locally to simulate ongoing request, 
        // but strict testing of cancellation usually involves checking abort signal.
        // We can spy on fetch and check if signal was passed.

        const mockStream = new ReadableStream({
            start() { } // Keep open
        });

        (fetch as any).mockResolvedValue({
            ok: true,
            status: 200,
            body: mockStream
        });

        const generator = streamChatCompletion(messages, defaultConfig);
        // Start consumption
        generator.next();

        cancelGeneration();

        // In real usage, the fetch would abort. 
        // We can verify calls to metrics for abandonment if we mock the signal listener? 
        // Hard to test generic AbortSignal in jsdom without more setup, 
        // but we can verify fetch was called with a signal.

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/chat'),
            expect.objectContaining({
                signal: expect.any(Object) // AbortSignal
            })
        );
    });
});
