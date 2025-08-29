'use server';

/**
 * @fileOverview This file contains the Genkit flow for suggesting tags for notes based on their content.
 *
 * It supports multiple AI providers and models.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {SuggestTagsInput, SuggestTagsOutput, SuggestTagsOutputSchema} from '@/lib/types';


export async function suggestTags(input: SuggestTagsInput): Promise<SuggestTagsOutput> {
    const { apiKey, aiConfig, noteContent } = input;
    const model = googleAI(aiConfig.model, {apiKey});

    const { output } = await ai.generate({
        prompt: `Suggest 3-5 relevant tags for the following note content. The tags should reflect the main topics, themes, and keywords present in the note.

Note Content:
${noteContent}`,
        model,
        output: { schema: SuggestTagsOutputSchema },
    });
    return output!;
}
