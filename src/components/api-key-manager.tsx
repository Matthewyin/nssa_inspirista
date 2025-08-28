'use client';

import {useState, useEffect, useTransition} from 'react';
import {useLocalStorage} from '@/hooks/use-local-storage';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {useToast} from '@/hooks/use-toast';
import {KeyRound, Info, Eye, EyeOff} from 'lucide-react';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import Link from 'next/link';
import {useLanguage} from '@/hooks/use-language';

export function ApiKeyManager() {
  const {t, isClient} = useLanguage();
  const [geminiApiKey, setGeminiApiKey] = useLocalStorage<string | null>('gemini-api-key', null);
  const [keyInput, setKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const {toast} = useToast();

  useEffect(() => {
    if (geminiApiKey) {
      setKeyInput(geminiApiKey);
    }
  }, [geminiApiKey]);

  const handleSave = () => {
    setGeminiApiKey(keyInput);
    toast({
      title: t('apiKeyInput.toast.title'),
      description: t('apiKeyInput.toast.description'),
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
            <span>{t('apiKeyInput.title')}</span>
          </CardTitle>
          <CardDescription>{t('apiKeyInput.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="gemini-api-key">{t('apiKeyInput.label')}</Label>
            <div className="relative">
              <Input
                id="gemini-api-key"
                type={showKey ? 'text' : 'password'}
                value={keyInput}
                onChange={e => setKeyInput(e.target.value)}
                placeholder={t('apiKeyInput.placeholder')}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute inset-y-0 right-0 h-full px-3"
                onClick={() => setShowKey(prev => !prev)}
                aria-label={showKey ? t('apiKeyInput.aria.hide') : t('apiKeyInput.aria.show')}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <Button onClick={handleSave}>{t('apiKeyInput.saveButton')}</Button>
        </CardContent>
      </Card>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>{t('apiKeyInput.alert.title')}</AlertTitle>
        <AlertDescription>
          {t('apiKeyInput.alert.description')}
          <Button variant="link" asChild className="p-0 h-auto align-baseline ml-1">
            <Link href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
              {t('apiKeyInput.alert.link')}
            </Link>
          </Button>
          <p className="text-xs mt-2 text-muted-foreground">{t('apiKeyInput.alert.footer')}</p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
