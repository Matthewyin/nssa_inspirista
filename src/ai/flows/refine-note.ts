'use server';

/**
 * @fileOverview This file defines a Genkit flow for refining notes using AI.
 *
 * It supports multiple AI providers and models to organize, summarize, and categorize notes.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
// import {deepseek} from 'genkitx-deepseek';
import {z} from 'genkit';
import {AiProvider, GeminiModel, RefineNoteInputSchema, RefineNoteOutputSchema, RefineNoteInput, RefineNoteOutput} from '@/lib/types';
import {Model} from 'genkit/model';


function getModel(provider: AiProvider, modelName: string, apiKey: string): Model<any, any> {
  if (provider === 'gemini') {
    return googleAI(modelName as GeminiModel, {apiKey});
  }
  // if (provider === 'deepseek') {
  //   return deepseek(modelName as DeepSeekModel, {apiKey});
  // }
  throw new Error(`Unsupported AI provider: ${provider}`);
}

const refineNoteFlow = ai.defineFlow(
  {
    name: 'refineNoteFlow',
    inputSchema: RefineNoteInputSchema,
    outputSchema: RefineNoteOutputSchema,
  },
  async (input) => {
    const { apiKey, aiConfig, noteContent } = input;
    const model = getModel(aiConfig.provider, aiConfig.model, apiKey);

    const { output } = await ai.generate({
        prompt: `You are an AI assistant designed to refine notes.
Please organize, summarize, and categorize the following note content to improve its clarity and structure.

Note Content:
${noteContent}`,
        model,
        output: { schema: RefineNoteOutputSchema },
    });
    return output!;
  }
);


export async function refineNote(input: RefineNoteInput): Promise<RefineNoteOutput> {
  return refineNoteFlow(input);
}
