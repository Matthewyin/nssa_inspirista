'use server';

/**
 * @fileOverview This file defines a Genkit flow for validating an AI provider's API key.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';
import {ValidateApiKeyInputSchema, ValidateApiKeyOutputSchema, ValidateApiKeyInput, ValidateApiKeyOutput} from '@/lib/types';

const validateApiKeyFlow = ai.defineFlow(
    {
        name: 'validateApiKeyFlow',
        inputSchema: ValidateApiKeyInputSchema,
        outputSchema: ValidateApiKeyOutputSchema,
    },
    async ({provider, apiKey}) => {
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
);

export async function validateApiKey(input: ValidateApiKeyInput): Promise<ValidateApiKeyOutput> {
    return validateApiKeyFlow(input);
}
