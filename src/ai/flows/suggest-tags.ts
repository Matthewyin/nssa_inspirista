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
import {AiProvider, GeminiModel} from '@/lib/types';
import {Model} from 'genkit/model';

const SuggestTagsInputSchema = z.object({
  noteContent: z.string().describe('The content of the note for which tags are to be suggested.'),
  aiConfig: z.object({
    provider: z.enum(['gemini']), //, 'deepseek']),
    model: z.string(),
  }),
  apiKey: z.string().describe('The user-provided API key for the selected provider.'),
});
export type SuggestTagsInput = z.infer<typeof SuggestTagsInputSchema>;


const SuggestTagsOutputSchema = z.object({
  tags: z.array(z.string()).describe('An array of suggested tags for the note content.'),
});
export type SuggestTagsOutput = z.infer<typeof SuggestTagsOutputSchema>;

function getModel(provider: AiProvider, modelName: string, apiKey: string): Model<any, any> {
    if (provider === 'gemini') {
      return googleAI(modelName as GeminiModel, {apiKey});
    }
    // if (provider === 'deepseek') {
    //   return deepseek(modelName as DeepSeekModel, {apiKey});
    // }
    throw new Error(`Unsupported AI provider: ${provider}`);
  }

export async function suggestTags(input: SuggestTagsInput): Promise<SuggestTagsOutput> {
  const {apiKey, aiConfig, noteContent} = input;
  const model = getModel(aiConfig.provider, aiConfig.model, apiKey);

  const prompt = ai.definePrompt(
    {
      name: `suggestTagsPrompt_${aiConfig.provider}_${aiConfig.model}`,
      input: {schema: z.object({noteContent: z.string()})},
      output: {schema: SuggestTagsOutputSchema},
      prompt: `Suggest 3-5 relevant tags for the following note content. The tags should reflect the main topics, themes, and keywords present in the note.

Note Content:
{{{noteContent}}}`,
      model,
    },
    async (promptInput) => {
      const {output} = await ai.generate({
        prompt: promptInput,
        model: model,
        output: {schema: SuggestTagsOutputSchema},
      });
      return output;
    }
  );

  const {output} = await prompt({noteContent});
  return output!;
}
