'use server';

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Initialize Genkit with the Google AI plugin.
// The API key is sourced from environment variables, which is the standard
// and secure way to handle secrets on the server.
// For App Hosting, you should set GEMINI_API_KEY in your backend's secret manager.
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
  enableTracingAndMetrics: true,
});
