import { z } from 'zod';

// Note Schema
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


// AI Provider Schemas
export type AiProvider = 'gemini';
export type GeminiModel = 'gemini-1.5-flash' | 'gemini-1.5-pro';
export type AiModel = GeminiModel;

export interface AiConfig {
  provider: AiProvider;
  model: AiModel;
}

// Genkit Flow Schemas

// Notes Flow Schemas
export const GetNotesInputSchema = z.object({
  uid: z.string(),
  category: z.string().optional(),
});
export type GetNotesInput = z.infer<typeof GetNotesInputSchema>;
export const GetNotesOutputSchema = z.array(NoteSchema);
export type GetNotesOutput = z.infer<typeof GetNotesOutputSchema>;

export const GetNoteInputSchema = z.object({
  id: z.string(),
  uid: z.string(),
});
export type GetNoteInput = z.infer<typeof GetNoteInputSchema>;
export const GetNoteOutputSchema = NoteSchema.optional();
export type GetNoteOutput = z.infer<typeof GetNoteOutputSchema>;

export const CreateNoteInputSchema = NoteSchema.omit({id: true});
export type CreateNoteInput = z.infer<typeof CreateNoteInputSchema>;
export const CreateNoteOutputSchema = z.string();
export type CreateNoteOutput = z.infer<typeof CreateNoteOutputSchema>;

export const UpdateNoteInputSchema = z.object({
  id: z.string(),
  uid: z.string(),
  data: NoteSchema.partial(),
});
export type UpdateNoteInput = z.infer<typeof UpdateNoteInputSchema>;
export const UpdateNoteOutputSchema = z.void();
export type UpdateNoteOutput = z.infer<typeof UpdateNoteOutputSchema>;

export const DeleteNoteInputSchema = z.object({
  id: z.string(),
  uid: z.string(),
});
export type DeleteNoteInput = z.infer<typeof DeleteNoteInputSchema>;
export const DeleteNoteOutputSchema = z.void();
export type DeleteNoteOutput = z.infer<typeof DeleteNoteOutputSchema>;


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
