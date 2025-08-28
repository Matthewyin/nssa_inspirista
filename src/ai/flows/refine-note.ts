'use server';
/**
 * @fileOverview This file defines a Genkit flow for refining notes using AI.
 *
 * The flow organizes, summarizes, and categorizes notes to improve clarity and structure.
 *
 * @exports refineNote - An async function that takes RefineNoteInput and returns RefineNoteOutput.
 * @exports RefineNoteInput - The input type for the refineNote function.
 * @exports RefineNoteOutput - The return type for the refineNote function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const RefineNoteInputSchema = z.object({
  noteContent: z.string().describe('The content of the note to be refined.'),
  apiKey: z.string().describe('The user-provided Google Gemini API key.'),
});
export type RefineNoteInput = z.infer<typeof RefineNoteInputSchema>;

const RefineNoteOutputSchema = z.object({
  refinedNote: z
    .string()
    .describe('The refined note content, organized, summarized, and categorized.'),
});
export type RefineNoteOutput = z.infer<typeof RefineNoteOutputSchema>;

export async function refineNote(input: RefineNoteInput): Promise<RefineNoteOutput> {
  const {apiKey, ...promptInput} = input;

  const prompt = ai.definePrompt(
    {
      name: 'refineNotePrompt',
      input: {schema: RefineNoteInputSchema.omit({apiKey: true})},
      output: {schema: RefineNoteOutputSchema},
      prompt: `You are an AI assistant designed to refine notes.
Please organize, summarize, and categorize the following note content to improve its clarity and structure.

Note Content:
{{{noteContent}}}`,
      model: googleAI({apiKey}),
    },
    async input => {
      const {output} = await ai.generate({
        prompt: input,
        model: googleAI({apiKey}),
        output: {schema: RefineNoteOutputSchema},
      });
      return output;
    }
  );

  const {output} = await prompt(promptInput);
  return output!;
}
