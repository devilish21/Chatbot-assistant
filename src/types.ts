

export interface AppConfig {
  endpoint: string;
  model: string;
  temperature: number;
  systemInstruction: string;
  enableSuggestions: boolean;
  enableVisualEffects: boolean;
  toolSafety: boolean;
  activeCategories?: string[];
  snippetVersion?: number;
  // Admin Settings
  maxOutputTokens?: number;
  contextWindowSize?: number;
  botName: string;
  welcomeMessage: string;
  systemAlert?: string | null;
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
  isError?: boolean;
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
}

export interface Category {
  id: string;
  count: number;
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
  category?: string;
}

export interface LLMRequestMetric {
  id: string;
  timestamp: number;
  model: string;
  success: boolean;
  durationMs?: number;
  error?: string;
  inputTokens?: number;
  outputTokens?: number;
}

export interface ToolUsageMetric {
  id: string;
  timestamp: number;
  toolName: string;
  service: string;
  success: boolean;
  args?: any;
  error?: string;
}

export interface SystemMetrics {
  llmRequests: LLMRequestMetric[];
  toolUsage: ToolUsageMetric[];
}

export type ToastType = 'info' | 'success' | 'error';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}