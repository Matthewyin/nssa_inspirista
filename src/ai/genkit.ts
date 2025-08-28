'use server';

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Initialize Genkit without any default plugins.
// AI providers and models will be configured dynamically within each flow
// based on the user-provided API key.
export const ai = genkit({
  enableTracingAndMetrics: true,
});
