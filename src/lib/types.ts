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

// Schema for refineNote flow
export const RefineNoteInputSchema = z.object({
  noteContent: z.string().describe('The content of the note to be refined.'),
  aiConfig: z.object({
    provider: z.enum(['gemini']),
    model: z.string(),
  }),
  apiKey: z.string().describe('The user-provided API key for the selected provider.'),
});
export type RefineNoteInput = z.infer<typeof RefineNoteInputSchema>;

export const RefineNoteOutputSchema = z.object({
  refinedNote: z.string().describe('The refined note content, organized, summarized, and categorized.'),
});
export type RefineNoteOutput = z.infer<typeof RefineNoteOutputSchema>;

// Schema for suggestTags flow
export const SuggestTagsInputSchema = z.object({
    noteContent: z.string().describe('The content of the note for which tags are to be suggested.'),
    aiConfig: z.object({
      provider: z.enum(['gemini']),
      model: z.string(),
    }),
    apiKey: z.string().describe('The user-provided API key for the selected provider.'),
  });
export type SuggestTagsInput = z.infer<typeof SuggestTagsInputSchema>;
  
  
export const SuggestTagsOutputSchema = z.object({
    tags: z.array(z.string()).describe('An array of suggested tags for the note content.'),
});
export type SuggestTagsOutput = z.infer<typeof SuggestTagsOutputSchema>;

// Schema for validateApiKey flow
export const ValidateApiKeyInputSchema = z.object({
    provider: z.enum(['gemini']),
    apiKey: z.string().describe('The API key to validate.'),
  });
export type ValidateApiKeyInput = z.infer<typeof ValidateApiKeyInputSchema>;
  
export const ValidateApiKeyOutputSchema = z.object({
    isValid: z.boolean(),
    error: z.string().optional(),
});
export type ValidateApiKeyOutput = z.infer<typeof ValidateApiKeyOutputSchema>;
