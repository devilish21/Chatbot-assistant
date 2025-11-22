
import { GoogleGenAI, Content, GenerateContentResponse } from "@google/genai";
import { AppConfig, Message } from "../types";

export const validateEndpoint = (_url: string): boolean => {
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

export async function* streamChatCompletion(messages: Message[], config: AppConfig) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const lastMessage = messages[messages.length - 1];
  const history = formatHistory(messages.slice(0, -1));

  if (!lastMessage || lastMessage.role !== 'user') {
    throw new Error("Invalid message sequence: Last message must be from user.");
  }

  try {
    // Logic to prevent empty response when maxTokens is small (e.g. 1024)
    const maxTokens = config.maxOutputTokens;
    
    // If tokens are restricted below 2048, we disable thinking completely.
    // 'Thinking' consumes tokens before output; on small budgets, this starves the output.
    const shouldDisableThinking = maxTokens && maxTokens < 2048;

    let systemInstruction = config.systemInstruction;
    
    // Inject strict instructions if a token limit is active to prevent abrupt cutoffs
    if (maxTokens) {
        systemInstruction += `\n\n[SYSTEM NOTICE]: You have a STRICT output limit of ${maxTokens} tokens. You MUST prioritize your answer and Code blocks. Be extremely concise. Do not waste tokens on pleasantries. If you are generating code, ensure it is complete or break it down if it's too large.`;
    }

    const chat = ai.chats.create({
      model: config.model,
      history: history,
      config: {
        temperature: config.temperature,
        systemInstruction: systemInstruction,
        maxOutputTokens: maxTokens,
        thinkingConfig: shouldDisableThinking ? { thinkingBudget: 0 } : undefined
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
