'use server';

/**
 * @fileOverview This file defines a Genkit flow for validating an AI provider's API key.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';
import {AiProvider, GeminiModel} from '@/lib/types';

const ValidateApiKeyInputSchema = z.object({
  provider: z.enum(['gemini']),
  apiKey: z.string().describe('The API key to validate.'),
});
export type ValidateApiKeyInput = z.infer<typeof ValidateApiKeyInputSchema>;

const ValidateApiKeyOutputSchema = z.object({
  isValid: z.boolean(),
  error: z.string().optional(),
});
export type ValidateApiKeyOutput = z.infer<typeof ValidateApiKeyOutputSchema>;

export async function validateApiKey(input: ValidateApiKeyInput): Promise<ValidateApiKeyOutput> {
  const {provider, apiKey} = input;
  
  try {
    if (provider === 'gemini') {
      const model = googleAI('gemini-1.5-flash', {apiKey});
      const {output} = await ai.generate({
        model,
        prompt: 'test',
        output: {schema: z.string()},
      });
      // Simple check if output exists and is a string
      if (typeof output === 'string') {
        return {isValid: true};
      }
    }
    return {isValid: false, error: 'Unknown error occurred.'};
  } catch (e: any) {
    console.error(`API key validation failed for ${provider}:`, e);
    return {isValid: false, error: e.message || 'Validation failed.'};
  }
}
