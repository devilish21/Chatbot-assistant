
import { GoogleGenAI, Content, GenerateContentResponse, Schema } from "@google/genai";
import { AppConfig, Message } from "../types";

export const validateEndpoint = (url: string): boolean => {
  return true;
};

const formatHistory = (messages: Message[]): Content[] => {
  return messages
    .filter(m => m.role === 'user' || m.role === 'model')
    .map(m => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));
};

const getAIClient = (config: AppConfig) => {
    const apiKey = config.apiKey || process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API Key missing. Please configure it in Admin Panel.");
    }
    return new GoogleGenAI({ apiKey });
};

// Added 'schema' parameter to support Grammar-Constrained Sampling
export async function* streamChatCompletion(
    messages: Message[], 
    config: AppConfig, 
    schema?: Schema
) {
  const ai = getAIClient(config);

  const lastMessage = messages[messages.length - 1];
  const history = formatHistory(messages.slice(0, -1));

  if (!lastMessage || lastMessage.role !== 'user') {
    throw new Error("Invalid message sequence: Last message must be from user.");
  }

  try {
    const maxTokens = config.maxOutputTokens;
    
    // Logic: If schema is provided, we MUST be in strict JSON mode.
    // Thinking is generally incompatible with strict JSON schema enforcement in some versions,
    // but allowed in Gemini 2.5 if configured correctly. For safety, we disable thinking if schema is present
    // to ensure the output is PURE JSON.
    const isConstrainedMode = !!schema;
    const shouldDisableThinking = (maxTokens && maxTokens < 2048) || isConstrainedMode;

    let systemInstruction = config.systemInstruction;
    
    if (maxTokens) {
        systemInstruction += `\n\n[SYSTEM NOTICE]: You have a STRICT output limit of ${maxTokens} tokens.`;
    }
    
    if (isConstrainedMode) {
        systemInstruction += `\n\n[CONSTRAINT]: You are operating in STRICT JSON mode. You must output valid JSON matching the provided schema. Do not include markdown backticks or explanations outside the JSON.`;
    }

    const chat = ai.chats.create({
      model: config.model,
      history: history,
      config: {
        temperature: isConstrainedMode ? 0.1 : config.temperature, // Lower temp for strict tasks
        systemInstruction: systemInstruction,
        maxOutputTokens: maxTokens,
        thinkingConfig: shouldDisableThinking ? { thinkingBudget: 0 } : undefined,
        responseMimeType: isConstrainedMode ? 'application/json' : 'text/plain',
        responseSchema: schema
      }
    });

    const result = await chat.sendMessageStream({
      message: lastMessage.content
    });

    for await (const chunk of result) {
      const chunkText = chunk.text;
      if (typeof chunkText === 'string' && chunkText.length > 0) {
        yield chunkText;
      }
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate response from Gemini.");
  }
}

export async function generateFollowUpQuestions(messages: Message[], config: AppConfig): Promise<string[]> {
  const ai = getAIClient(config);
  const recentHistory = messages.slice(-4);
  const history = formatHistory(recentHistory);

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: config.model,
      contents: [
        ...history,
        {
          role: 'user',
          parts: [{ text: "Based on the previous technical response, suggest exactly 3 short, actionable follow-up commands or questions. Return them as plain text lines. Do not use markdown, bolding, or numbering. Do not add introductory text. Example output format:\nRun docker ps\nExplain the syntax\nCheck logs" }]
        }
      ],
      config: {
        temperature: 0.4, 
      }
    });

    const text = response.text;
    if (!text) return [];

    return text
      .split(/\r?\n/) 
      .map(s => s
        .trim()
        .replace(/^[\d-]+\.\s*/, '') 
        .replace(/^[*-]\s*/, '') 
        .replace(/^"|"$/g, '') 
      ) 
      .filter(s => s.length > 2 && s.length < 60) 
      .slice(0, 3);

  } catch (error) {
    console.error("Failed to generate suggestions:", error);
    return [];
  }
}
