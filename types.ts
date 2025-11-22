
export interface AppConfig {
  endpoint: string;
  model: string; 
  temperature: number;
  systemInstruction: string;
  enableSuggestions: boolean;
  enableVisualEffects?: boolean;
  // Admin Settings
  apiKey?: string;
  maxOutputTokens?: number;
  contextWindowSize?: number;
  botName: string;
  welcomeMessage: string;
  systemAlert?: string | null;
  // Agentic Features
  agentMode?: boolean; // Enable Auto-fix loops
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
  isError?: boolean;
  // Context Branching
  versions?: { content: string, timestamp: number }[];
  currentVersionIndex?: number;
  // Thought Process (Chain of Thought)
  thoughts?: string; 
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  suggestions: string[];
  timestamp: number;
}

export enum ChatStatus {
  IDLE = 'idle',
  STREAMING = 'streaming',
  ERROR = 'error',
  THINKING = 'thinking', // New status for UI feedback
}

export interface SlashCommand {
  key: string;
  label: string;
  description: string;
  prompt: string;
}

export interface CommandPaletteAction {
    id: string;
    title: string;
    shortcut?: string[];
    action: () => void;
}

export interface Snippet {
    id: string;
    title: string;
    content: string;
}

export type ToastType = 'info' | 'success' | 'error';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
}
