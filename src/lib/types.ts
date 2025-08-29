export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  category: 'inspiration' | 'checklist';
}

// This interface is no longer used as checklist items are now managed as Notes.
export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export type AiProvider = 'gemini' | 'deepseek';

export type GeminiModel = 'gemini-1.5-pro' | 'gemini-1.5-flash';
export type DeepSeekModel = 'deepseek-chat' | 'deepseek-coder';

export type AiModel = GeminiModel | DeepSeekModel;

export interface AiConfig {
  provider: AiProvider;
  model: AiModel;
}
