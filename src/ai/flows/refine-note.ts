'use server';

/**
 * @fileOverview This file defines a Genkit flow for refining notes using AI.
 *
 * It supports multiple AI providers and models to organize, summarize, and categorize notes.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {RefineNoteInputSchema, RefineNoteOutputSchema, RefineNoteInput, RefineNoteOutput} from '@/lib/types';


export async function refineNote(input: RefineNoteInput): Promise<RefineNoteOutput> {
  const refineNoteFlow = ai.defineFlow(
    {
      name: 'refineNoteFlow',
      inputSchema: RefineNoteInputSchema,
      outputSchema: RefineNoteOutputSchema,
    },
    async (input) => {
      const { apiKey, aiConfig, noteContent } = input;
      const model = googleAI(aiConfig.model, {apiKey});

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
  return refineNoteFlow(input);
}
