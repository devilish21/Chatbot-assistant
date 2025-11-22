
export interface AppConfig {
  // Architecture Settings
  provider: 'google' | 'ollama' | 'webllm';
  
  // Google Settings
  apiKey?: string;
  
  // Ollama (Local) Settings
  ollamaEndpoint: string;
  ollamaModel: string;

  // Shared Settings
  model: string; // Used for Google model name
  temperature: number;
  systemInstruction: string;
  enableSuggestions: boolean;
  enableLogAnalysis?: boolean; // New Feature Toggle
  enableVisualEffects?: boolean;
  maxOutputTokens?: number;
  contextWindowSize?: number;
  botName: string;
  welcomeMessage: string;
  systemAlert?: string | null;
  agentMode?: boolean;
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
  THINKING = 'thinking', 
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