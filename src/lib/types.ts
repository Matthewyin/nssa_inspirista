import { z } from 'zod';

export const NoteSchema = z.object({
  id: z.string(),
  uid: z.string(),
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()),
  createdAt: z.number(),
  updatedAt: z.number(),
  category: z.enum(['inspiration', 'checklist']),
});

export type Note = z.infer<typeof NoteSchema>;

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export type AiProvider = 'gemini';

export type GeminiModel = 'gemini-1.5-flash' | 'gemini-1.5-pro';

export type AiModel = GeminiModel;

export interface AiConfig {
  provider: AiProvider;
  model: AiModel;
}
