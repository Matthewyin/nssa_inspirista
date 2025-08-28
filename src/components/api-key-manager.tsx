'use client';

import {useState, useEffect, useTransition} from 'react';
import {useLocalStorage} from '@/hooks/use-local-storage';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {useToast} from '@/hooks/use-toast';
import {KeyRound, Info, Eye, EyeOff, Loader2, BrainCircuit, CheckCircle, XCircle} from 'lucide-react';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import Link from 'next/link';
import {useLanguage} from '@/hooks/use-language';
import {refineNote} from '@/ai/flows/refine-note';

export function ApiKeyManager() {
  const {t, isClient} = useLanguage();
  const [geminiApiKey, setGeminiApiKey] = useLocalStorage<string | null>('gemini-api-key', null);
  const [keyInput, setKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const {toast} = useToast();
  const [isChecking, startCheckingTransition] = useTransition();

  useEffect(() => {
    if (geminiApiKey) {
      setKeyInput(geminiApiKey);
    }
  }, [geminiApiKey]);

  const handleSave = () => {
    setGeminiApiKey(keyInput);
    toast({
      title: 'Gemini API Key Saved',
      description: `Your Gemini API key has been saved locally in your browser. Ensure it's also set as a secret on the server for AI features to work.`,
    });
  };
  
  const handleValidate = () => {
    if (!keyInput) {
      toast({
        variant: 'destructive',
        title: 'API Key is empty',
        description: `Please enter a Gemini API key to validate.`,
      });
      return;
    }
    
    toast({
        title: 'Validation Note',
        description: 'AI features run on the server. Please ensure your API key is set as a secret in your Firebase App Hosting backend settings for it to be validated and used.',
    });

  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="w-6 h-6" />
            <span>API Key Management</span>
          </CardTitle>
          <CardDescription>
            To use AI features, you must configure your Google Gemini API key as a secret in your Firebase App Hosting backend. You can also save it here for local reference.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="gemini-api-key" className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5" />
                Google Gemini API Key
              </Label>
              <div className="relative">
                <Input
                  id="gemini-api-key"
                  type={showKey ? 'text' : 'password'}
                  value={keyInput}
                  onChange={e => setKeyInput(e.target.value)}
                  placeholder="Enter your Google Gemini API key"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 h-full px-3"
                  onClick={() => setShowKey(prev => !prev)}
                  aria-label={showKey ? 'Hide API key' : 'Show API key'}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={handleSave}>Save Key Locally</Button>
              <Button variant="outline" onClick={handleValidate} disabled={isChecking}>
                Check Server Configuration
              </Button>
            </div>
          </CardContent>
      </Card>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>{t('apiKeyInput.alert.title')}</AlertTitle>
        <AlertDescription>
          You can get a free Gemini API key from Google AI Studio. You must add this key as a secret named `GEMINI_API_KEY` in your App Hosting backend settings.
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <Button variant="link" asChild className="p-0 h-auto align-baseline">
                <Link href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                  Get your Gemini key here.
                </Link>
              </Button>
            </li>
          </ul>
          <p className="text-xs mt-2 text-muted-foreground">{t('apiKeyInput.alert.footer')}</p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
