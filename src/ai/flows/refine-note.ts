'use server';

/**
 * @fileOverview This file defines a Genkit flow for refining notes using AI.
 *
 * It supports multiple AI providers and models to organize, summarize, and categorize notes.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {deepseek} from 'genkitx-deepseek';
import {z} from 'genkit';
import {AiConfig, AiProvider, GeminiModel, DeepSeekModel} from '@/lib/types';
import {Model} from 'genkit/model';

const RefineNoteInputSchema = z.object({
  noteContent: z.string().describe('The content of the note to be refined.'),
  aiConfig: z.object({
    provider: z.enum(['gemini', 'deepseek']),
    model: z.string(),
  }),
  apiKey: z.string().describe('The user-provided API key for the selected provider.'),
});
export type RefineNoteInput = z.infer<typeof RefineNoteInputSchema>;

const RefineNoteOutputSchema = z.object({
  refinedNote: z.string().describe('The refined note content, organized, summarized, and categorized.'),
});
export type RefineNoteOutput = z.infer<typeof RefineNoteOutputSchema>;

function getModel(provider: AiProvider, modelName: string, apiKey: string): Model<any, any> {
  if (provider === 'gemini') {
    return googleAI(modelName as GeminiModel, {apiKey});
  }
  if (provider === 'deepseek') {
    return deepseek(modelName as DeepSeekModel, {apiKey});
  }
  throw new Error(`Unsupported AI provider: ${provider}`);
}

export async function refineNote(input: RefineNoteInput): Promise<RefineNoteOutput> {
  const {apiKey, aiConfig, noteContent} = input;
  const model = getModel(aiConfig.provider, aiConfig.model, apiKey);

  const prompt = ai.definePrompt(
    {
      name: `refineNotePrompt_${aiConfig.provider}_${aiConfig.model}`,
      input: {schema: z.object({noteContent: z.string()})},
      output: {schema: RefineNoteOutputSchema},
      prompt: `You are an AI assistant designed to refine notes.
Please organize, summarize, and categorize the following note content to improve its clarity and structure.

Note Content:
{{{noteContent}}}`,
      model,
    },
    async (promptInput) => {
      const {output} = await ai.generate({
        prompt: promptInput,
        model: model,
        output: {schema: RefineNoteOutputSchema},
      });
      return output;
    }
  );

  const {output} = await prompt({noteContent});
  return output!;
}
