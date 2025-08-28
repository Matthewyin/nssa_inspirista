'use server';

/**
 * @fileOverview This file contains the Genkit flow for suggesting tags for notes based on their content.
 *
 * - `suggestTags`: A function that takes note content as input and returns suggested tags.
 * - `SuggestTagsInput`: The input type for the `suggestTags` function, which is the note content.
 * - `SuggestTagsOutput`: The output type for the `suggestTags` function, which is an array of suggested tags.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const SuggestTagsInputSchema = z.object({
  noteContent: z.string().describe('The content of the note for which tags are to be suggested.'),
  apiKey: z.string().describe('The user-provided Google Gemini API key.'),
});

const SuggestTagsOutputSchema = z.object({
  tags: z.array(z.string()).describe('An array of suggested tags for the note content.'),
});

export type SuggestTagsInput = z.infer<typeof SuggestTagsInputSchema>;
export type SuggestTagsOutput = z.infer<typeof SuggestTagsOutputSchema>;

export async function suggestTags(input: SuggestTagsInput): Promise<SuggestTagsOutput> {
  const {apiKey, ...promptInput} = input;

  const prompt = ai.definePrompt(
    {
      name: 'suggestTagsPrompt',
      input: {schema: SuggestTagsInputSchema.omit({apiKey: true})},
      output: {schema: SuggestTagsOutputSchema},
      prompt: `Suggest 3-5 relevant tags for the following note content. The tags should reflect the main topics, themes, and keywords present in the note.

Note Content:
{{{noteContent}}}`,
      model: googleAI({apiKey}),
    },
    async input => {
      const {output} = await ai.generate({
        prompt: input,
        model: googleAI({apiKey}),
        output: {schema: SuggestTagsOutputSchema},
      });
      return output;
    }
  );

  const {output} = await prompt(promptInput);
  return output!;
}
