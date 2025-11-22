
import { GoogleGenAI, Schema } from "@google/genai";
import { AppConfig, Message } from "../types";

// --- INTERFACE DEFINITION ---
interface LLMProvider {
    streamChat(messages: Message[], config: AppConfig, schema?: Schema): AsyncGenerator<string>;
    generateSuggestions(messages: Message[], config: AppConfig): Promise<string[]>;
}

// --- HELPERS ---
const formatHistory = (messages: Message[]) => {
  return messages
    .filter(m => m.role === 'user' || m.role === 'model')
    .map(m => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));
};

// --- 1. GOOGLE PROVIDER (Gemini) ---
class GoogleProvider implements LLMProvider {
    private getClient(config: AppConfig) {
        const apiKey = config.apiKey || process.env.API_KEY;
        if (!apiKey) {
            throw new Error("API Key missing. Please configure it in Admin Panel.");
        }
        return new GoogleGenAI({ apiKey });
    }

    async *streamChat(messages: Message[], config: AppConfig, schema?: Schema) {
        const ai = this.getClient(config);
        const lastMessage = messages[messages.length - 1];
        const history = formatHistory(messages.slice(0, -1));

        const isConstrainedMode = !!schema;
        const shouldDisableThinking = (config.maxOutputTokens && config.maxOutputTokens < 2048) || isConstrainedMode;
        
        let systemInstruction = config.systemInstruction;
        if (config.maxOutputTokens) systemInstruction += `\n\n[SYSTEM NOTICE]: Limit output to ${config.maxOutputTokens} tokens.`;
        if (isConstrainedMode) systemInstruction += `\n\n[CONSTRAINT]: STRICT JSON mode.`;

        const chat = ai.chats.create({
            model: config.model,
            history: history,
            config: {
                temperature: isConstrainedMode ? 0.1 : config.temperature,
                systemInstruction: systemInstruction,
                maxOutputTokens: config.maxOutputTokens,
                thinkingConfig: shouldDisableThinking ? { thinkingBudget: 0 } : undefined,
                responseMimeType: isConstrainedMode ? 'application/json' : 'text/plain',
                responseSchema: schema
            }
        });

        const result = await chat.sendMessageStream({ message: lastMessage.content });

        for await (const chunk of result) {
            const chunkText = chunk.text;
            if (typeof chunkText === 'string' && chunkText.length > 0) {
                yield chunkText;
            }
        }
    }

    async generateSuggestions(messages: Message[], config: AppConfig): Promise<string[]> {
        const ai = this.getClient(config);
        const recentHistory = formatHistory(messages.slice(-4));

        try {
            const response = await ai.models.generateContent({
                model: config.model,
                contents: [...recentHistory, { role: 'user', parts: [{ text: "Suggest 3 short, actionable follow-up commands (max 5 words each). No bullets." }] }],
                config: { temperature: 0.4 }
            });
            const text = response.text || "";
            return text.split(/\r?\n/).map(s => s.trim().replace(/^[\d-]+\.\s*/, '')).filter(s => s.length > 2).slice(0, 3);
        } catch (e) {
            return [];
        }
    }
}

// --- 2. OLLAMA PROVIDER (Localhost) ---
class OllamaProvider implements LLMProvider {
    async *streamChat(messages: Message[], config: AppConfig, schema?: Schema) {
        const endpoint = `${config.ollamaEndpoint.replace(/\/$/, '')}/api/chat`;
        
        // Convert format for Ollama
        const ollamaMessages = [
            { role: 'system', content: config.systemInstruction },
            ...messages.filter(m => m.role === 'user' || m.role === 'model').map(m => ({
                role: m.role === 'model' ? 'assistant' : 'user',
                content: m.content
            }))
        ];

        let format = undefined;
        if (schema) format = 'json';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: config.ollamaModel,
                    messages: ollamaMessages,
                    stream: true,
                    format: format,
                    options: {
                        temperature: config.temperature,
                        num_predict: config.maxOutputTokens
                    }
                })
            });

            if (!response.ok) throw new Error(`Ollama Error: ${response.statusText}`);
            if (!response.body) throw new Error("No response body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Keep incomplete line

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const json = JSON.parse(line);
                        if (json.message && json.message.content) {
                            yield json.message.content;
                        }
                        if (json.done) return;
                    } catch (e) {
                        console.warn("Ollama JSON parse error", e);
                    }
                }
            }
        } catch (error: any) {
            console.error("Ollama Connection Failed. Is it running?", error);
            throw new Error(`Ollama Connection Failed. Ensure 'ollama serve' is running and OLLAMA_ORIGINS="*" is set. Details: ${error.message}`);
        }
    }

    async generateSuggestions(messages: Message[], config: AppConfig): Promise<string[]> {
        // Simplified fetch for non-streaming suggestion
        return ["Run diagnostics", "Check logs", "Explain code"]; 
    }
}

// --- 3. WEBLLM PROVIDER (Browser Wasm - Placeholder) ---
class WebLLMProvider implements LLMProvider {
    async *streamChat(messages: Message[]) {
        yield "Initializing WebLLM Engine in Browser...";
        await new Promise(r => setTimeout(r, 1000));
        yield "\n[System]: WebLLM provider is currently a placeholder in this architecture.";
        yield "\n[System]: To use local inference today, please switch to 'Ollama' in settings.";
    }
    async generateSuggestions() { return []; }
}

// --- FACTORY ---
const getProvider = (config: AppConfig): LLMProvider => {
    switch (config.provider) {
        case 'ollama': return new OllamaProvider();
        case 'webllm': return new WebLLMProvider();
        case 'google':
        default: return new GoogleProvider();
    }
};

// --- PUBLIC EXPORTS (Facade) ---
export async function* streamChatCompletion(
    messages: Message[], 
    config: AppConfig, 
    schema?: Schema
) {
    const provider = getProvider(config);
    yield* provider.streamChat(messages, config, schema);
}

export async function generateFollowUpQuestions(messages: Message[], config: AppConfig): Promise<string[]> {
    const provider = getProvider(config);
    return provider.generateSuggestions(messages, config);
}

export const validateEndpoint = (url: string) => true;
