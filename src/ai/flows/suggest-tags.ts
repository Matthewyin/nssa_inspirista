'use server';

/**
 * @fileOverview This file contains the Genkit flow for suggesting tags for notes based on their content.
 *
 * It supports multiple AI providers and models.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
// import {deepseek} from 'genkitx-deepseek';
import {z} from 'genkit';
import {AiProvider, GeminiModel, SuggestTagsInputSchema, SuggestTagsOutputSchema, SuggestTagsInput, SuggestTagsOutput} from '@/lib/types';
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

const suggestTagsFlow = ai.defineFlow(
    {
        name: 'suggestTagsFlow',
        inputSchema: SuggestTagsInputSchema,
        outputSchema: SuggestTagsOutputSchema,
    },
    async (input) => {
        const { apiKey, aiConfig, noteContent } = input;
        const model = getModel(aiConfig.provider, aiConfig.model, apiKey);

        const { output } = await ai.generate({
            prompt: `Suggest 3-5 relevant tags for the following note content. The tags should reflect the main topics, themes, and keywords present in the note.

Note Content:
${noteContent}`,
            model,
            output: { schema: SuggestTagsOutputSchema },
        });
        return output!;
    }
);


export async function suggestTags(input: SuggestTagsInput): Promise<SuggestTagsOutput> {
  return suggestTagsFlow(input);
}
