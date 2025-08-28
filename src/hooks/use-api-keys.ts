'use client';

import {useLocalStorage} from './use-local-storage';

// This file is being kept for now to avoid breaking imports, 
// but it is deprecated and will be removed.
// The `gemini-api-key` is now managed directly in components that need it.

export type ApiKeySettings = {
  apiKey: string | null;
  model: string | null;
};

export type ApiKeys = {
  gemini: ApiKeySettings;
};

const defaultApiKeys: ApiKeys = {
  gemini: {
    apiKey: null,
    model: 'gemini-1.5-flash',
  },
};

export const useApiKeys = () => {
  const [apiKeys, setApiKeys] = useLocalStorage<ApiKeys>('api-keys-v1-deprecated', defaultApiKeys);
  return [apiKeys, setApiKeys] as const;
};
