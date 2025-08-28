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
import {z} from 'genkit';

const RefineNoteInputSchema = z.object({
  noteContent: z.string().describe('The content of the note to be refined.'),
});
export type RefineNoteInput = z.infer<typeof RefineNoteInputSchema>;

const RefineNoteOutputSchema = z.object({
  refinedNote: z
    .string()
    .describe('The refined note content, organized, summarized, and categorized.'),
});
export type RefineNoteOutput = z.infer<typeof RefineNoteOutputSchema>;

export async function refineNote(input: RefineNoteInput): Promise<RefineNoteOutput> {
  return refineNoteFlow(input);
}

const refineNotePrompt = ai.definePrompt({
  name: 'refineNotePrompt',
  input: {schema: RefineNoteInputSchema},
  output: {schema: RefineNoteOutputSchema},
  prompt: `You are an AI assistant designed to refine notes.
Please organize, summarize, and categorize the following note content to improve its clarity and structure.

Note Content:
{{{noteContent}}}`,
});

const refineNoteFlow = ai.defineFlow(
  {
    name: 'refineNoteFlow',
    inputSchema: RefineNoteInputSchema,
    outputSchema: RefineNoteOutputSchema,
  },
  async input => {
    const {output} = await refineNotePrompt(input);
    return output!;
  }
);
