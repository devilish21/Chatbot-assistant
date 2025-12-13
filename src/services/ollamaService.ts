
import { AppConfig, Message } from "../types";
import { mcpService, Tool } from "./mcpService";
import { metricsService } from "./metricsService";

export const validateEndpoint = async (url: string): Promise<boolean> => {
    try {
        const response = await fetch(`${url}/api/tags`);
        return response.ok;
    } catch (error) {
        return false;
    }
};

interface OllamaMessage {
    role: string;
    content: string;
    tool_calls?: {
        function: {
            name: string;
            arguments: any;
        }
    }[];
}


let activeController: AbortController | null = null;

export const cancelGeneration = () => {
    if (activeController) {
        activeController.abort();
        activeController = null;
    }
};

export async function* streamChatCompletion(messages: Message[], config: AppConfig) {
    const endpoint = config.endpoint || 'http://localhost:11434';
    const url = `${endpoint}/api/chat`;

    // Cancel previous request if exists
    if (activeController) {
        activeController.abort();
    }
    activeController = new AbortController();
    const signal = activeController.signal;

    signal.addEventListener('abort', () => {
        metricsService.trackLLMRequest({
            model: config.model || 'llama3',
            success: false,
            error: 'ABANDONED_BY_USER',
            durationMs: 0
        });
    });

    // Map internal tools to Ollama format
    // CRITICAL FIX: Only fetch and send tools if the Master Tool Switch (toolSafety) is ON.
    let ollamaTools: any[] = [];
    if (config.toolSafety) {
        const mcpTools = await mcpService.getTools(config.activeCategories);
        ollamaTools = mcpTools.map(tool => ({
            type: 'function',
            function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.inputSchema
            }
        }));
    }

    // Prepare initial messages
    let conversationHistory: OllamaMessage[] = messages
        .filter(m => m.role === 'user' || m.role === 'model' || m.role === 'system')
        .map(m => ({
            role: m.role === 'model' ? 'assistant' : m.role,
            content: m.content
        }));

    if (config.systemInstruction) {
        if (!conversationHistory.some(m => m.role === 'system')) {
            conversationHistory.unshift({ role: 'system', content: config.systemInstruction });
        }
    }

    const maxTurns = 5; // Prevent infinite loops
    let turn = 0;

    while (turn < maxTurns) {
        turn++;
        let currentResponseContent = "";
        let toolCalls: any[] = [];
        const startTime = Date.now();

        try {
            const body = {
                model: config.model || 'llama3',
                messages: conversationHistory,
                stream: true, // We still stream to show progress/thinking
                options: {
                    temperature: config.temperature,
                    num_predict: config.maxOutputTokens
                },
                tools: ollamaTools.length > 0 ? ollamaTools : undefined
            };

            const payloadString = JSON.stringify(body);
            console.log(`[OllamaService] Request Payload Size: ${payloadString.length} bytes`);
            console.log(`[OllamaService] Sending request to: ${url}`);

            let response;
            try {
                response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: payloadString,
                    signal: signal
                });
            } catch (netErr: any) {
                if (netErr.name === 'AbortError') {
                    throw new Error('ABANDONED_BY_USER');
                }
                console.error("[OllamaService] Network Fetch Failed:", netErr);
                // Check for common causes
                if (netErr.name === 'TypeError' && netErr.message === 'Failed to fetch') {
                    console.error("[OllamaService] Potential causes: CORS, Offline, Server Unreachable, or Connection Reset by Peer (Nginx limit).");
                }
                throw new Error(`Network Connection Failed: ${netErr.message} (See Console for details)`);
            }

            console.log(`[OllamaService] Response Status: ${response.status} ${response.statusText}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[OllamaService] Server Error Body: ${errorText}`);
                throw new Error(`Ollama API Error (${response.status}): ${response.statusText} - ${errorText.substring(0, 100)}...`);
            }

            if (!response.body) throw new Error("No response body received");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let isThinking = false;

            const streamStartTime = Date.now();
            let ttft = 0;

            console.log("[OllamaService] Stream started...");

            // LOG USER REQUEST (For Admin Portal Logs)
            const userPrompt = conversationHistory[conversationHistory.length - 1]?.content || 'unknown';
            metricsService.logEvent('INFO', 'User Sent Message', {
                prompt: userPrompt.substring(0, 200) + (userPrompt.length > 200 ? '...' : ''),
                model: config.model
            });

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    console.log("[OllamaService] Stream complete.");
                    if (isThinking) yield '</think>';
                    break;
                }

                // Calculate TTFT on first chunk
                if (ttft === 0) {
                    ttft = Date.now() - streamStartTime;
                }

                // ... rest of stream logic
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const json = JSON.parse(line);

                        // Accumulate tool calls if present (Ollama usually sends them at the end or in a distinct message)
                        if (json.message && json.message.tool_calls) {
                            json.message.tool_calls.forEach((tc: any) => {
                                toolCalls.push(tc);
                            });
                        }

                        // Handle 'thinking' - SUPPRESSED BY USER REQUEST
                        if (json.message && json.message.thinking) {
                            // if (!isThinking) {
                            //     yield '<think>';
                            //     isThinking = true;
                            // }
                            // yield json.message.thinking;
                            // We strictly ignore thinking chunks now.
                        }

                        // Standard content
                        if (json.message && json.message.content) {
                            if (isThinking) {
                                // yield '</think>'; 
                                isThinking = false;
                            }
                            const content = json.message.content;
                            currentResponseContent += content;
                            yield content;
                        }

                        if (json.done && isThinking) {
                            // yield '</think>';
                            isThinking = false;
                        }

                    } catch (e) {
                        console.warn("Error parsing chunk", e);
                    }
                }
            }

            // ... tool execution logic ...
            if (toolCalls.length > 0) {
                // Add the assistant's message with tool calls to history
                conversationHistory.push({
                    role: 'assistant',
                    content: currentResponseContent, // Might be empty if it only called tools
                    tool_calls: toolCalls
                });

                // Execute tools
                for (const toolCall of toolCalls) {
                    const functionName = toolCall.function.name;
                    const functionArgs = toolCall.function.arguments;

                    try {
                        console.log(`[OllamaService] Executing Tool: ${functionName}`);
                        const toolStartTime = Date.now();
                        const result = await mcpService.callTool(functionName, functionArgs);
                        const toolDuration = Date.now() - toolStartTime;

                        metricsService.trackToolUsage({
                            toolName: functionName,
                            service: 'unknown',
                            success: true,
                            args: functionArgs,
                            durationMs: toolDuration
                        });

                        // Add result to history
                        conversationHistory.push({
                            role: 'tool',
                            content: JSON.stringify(result)
                        });
                    } catch (err: any) {
                        console.error(`[OllamaService] Tool Error (${functionName}):`, err);
                        metricsService.trackToolUsage({
                            toolName: functionName,
                            service: 'unknown',
                            success: false,
                            args: functionArgs,
                            error: err.message
                        });

                        conversationHistory.push({
                            role: 'tool',
                            content: `Error executing tool: ${err.message}`
                        });
                    }
                }
                // Loop continues to next turn to generate response based on tool results
            } else {
                // No tools called, we are done
                metricsService.trackLLMRequest({
                    model: config.model || 'llama3',
                    success: true,
                    durationMs: Date.now() - startTime,
                    ttftMs: ttft
                });
                activeController = null;
                return;
            }

            // Also track success if tools were called
            metricsService.trackLLMRequest({
                model: config.model || 'llama3',
                success: true,
                durationMs: Date.now() - startTime,
                ttftMs: ttft
            });

        } catch (error: any) {
            if (error.message === 'ABANDONED_BY_USER') {
                activeController = null;
                return; // Stop generator
            }

            console.error("Ollama Service Error:", error);

            metricsService.trackLLMRequest({
                model: config.model || 'llama3',
                success: false,
                error: error.message,
                durationMs: Date.now() - startTime
            });

            if (error.message.includes('Failed to fetch') || error.message.includes('ECONNREFUSED')) {
                throw new Error("Could not connect to Ollama. Make sure 'ollama serve' is running.");
            }
            throw error;
        }
    }
    activeController = null;
}

export async function generateFollowUpQuestions(messages: Message[], config: AppConfig): Promise<string[]> {
    const endpoint = config.endpoint || 'http://localhost:11434';
    const url = `${endpoint}/api/chat`;

    // Minimal history for suggestions
    const recentmessages = messages.slice(-4).map(m => ({
        role: m.role === 'model' ? 'assistant' : m.role,
        content: m.content
    }));

    const prompt = "Suggestions Goal: Provide 3 short, actionable DevOps commands or questions based on the context.\nConstraints:\n- Output ONLY 3 lines of plain text.\n- NO numbering (1., 2.).\n- NO markdown (no bold, no code blocks).\n- NO introductory text ('Here are...').\n- NO thinking or reasoning blocks.\n\nExample Output:\nRun docker ps\nExplain the syntax\nCheck logs";

    recentmessages.push({ role: 'user', content: prompt });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: config.model,
                messages: recentmessages,
                stream: false,
                options: { temperature: 0.2 }
            })
        });

        if (!response.ok) return [];

        const data = await response.json();
        let text = data.message?.content || "";

        // Strip <think> tags if present
        text = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

        return text
            .split(/\r?\n/)
            .map((s: string) => s
                .trim()
                .replace(/^[\d-]+\.\s*/, '')
                .replace(/^[*-]\s*/, '')
                .replace(/^"|"$/g, '')
                .replace(/^`+|`+$/g, '')
            )
            .filter((s: string) => s.length > 2 && s.length < 80)
            .slice(0, 3);

    } catch (error) {
        console.warn("Failed to generate suggestions", error);
        return [];
    }
}
