'use server';

/**
 * @fileOverview This file contains the Genkit flow for suggesting tags for notes based on their content.
 *
 * - `suggestTags`: A function that takes note content as input and returns suggested tags.
 * - `SuggestTagsInput`: The input type for the `suggestTags` function, which is the note content.
 * - `SuggestTagsOutput`: The output type for the `suggestTags` function, which is an array of suggested tags.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the suggestTags function
const SuggestTagsInputSchema = z.object({
  noteContent: z.string().describe('The content of the note for which tags are to be suggested.'),
});

// Define the output schema for the suggestTags function
const SuggestTagsOutputSchema = z.object({
  tags: z.array(z.string()).describe('An array of suggested tags for the note content.'),
});

export type SuggestTagsInput = z.infer<typeof SuggestTagsInputSchema>;
export type SuggestTagsOutput = z.infer<typeof SuggestTagsOutputSchema>;

// Exported function to suggest tags for a note
export async function suggestTags(input: SuggestTagsInput): Promise<SuggestTagsOutput> {
  return suggestTagsFlow(input);
}

const suggestTagsPrompt = ai.definePrompt({
  name: 'suggestTagsPrompt',
  input: {schema: SuggestTagsInputSchema},
  output: {schema: SuggestTagsOutputSchema},
  prompt: `Suggest 3-5 relevant tags for the following note content. The tags should reflect the main topics, themes, and keywords present in the note.

Note Content:
{{{noteContent}}}`,
});

const suggestTagsFlow = ai.defineFlow(
  {
    name: 'suggestTagsFlow',
    inputSchema: SuggestTagsInputSchema,
    outputSchema: SuggestTagsOutputSchema,
  },
  async input => {
    const {output} = await suggestTagsPrompt(input);
    return output!;
  }
);
