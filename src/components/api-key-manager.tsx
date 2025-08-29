'use client';

import {useState, useEffect, useTransition} from 'react';
import {useLocalStorage} from '@/hooks/use-local-storage';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {useToast} from '@/hooks/use-toast';
import {KeyRound, Info, Eye, EyeOff, Loader2} from 'lucide-react';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import Link from 'next/link';
import {useLanguage} from '@/hooks/use-language';
import {Separator} from './ui/separator';
import { validateApiKey } from '@/ai/flows/validate-api-key';
import type { ValidateApiKeyInput } from '@/lib/types';

export function ApiKeyManager() {
  const {t, isClient} = useLanguage();
  const [geminiApiKey, setGeminiApiKey] = useLocalStorage<string | null>('gemini-api-key', null);
  // const [deepseekApiKey, setDeepseekApiKey] = useLocalStorage<string | null>('deepseek-api-key', null);

  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  // const [deepseekKeyInput, setDeepseekKeyInput] = useState('');

  const [showGeminiKey, setShowGeminiKey] = useState(false);
  // const [showDeepseekKey, setShowDeepseekKey] = useState(false);
  const [isVerifying, startVerificationTransition] = useTransition();

  const {toast} = useToast();

  useEffect(() => {
    if (geminiApiKey) {
      setGeminiKeyInput(geminiApiKey);
    }
    // if (deepseekApiKey) {
    //   setDeepseekKeyInput(deepseekApiKey);
    // }
  }, [geminiApiKey]); //, deepseekApiKey]);

  const handleSaveGemini = () => {
    if (!geminiKeyInput.trim()) {
        toast({
            variant: "destructive",
            title: t('apiKeyInput.toast.empty.title'),
            description: t('apiKeyInput.toast.empty.description'),
        })
        return;
    }

    startVerificationTransition(async () => {
        const result = await validateApiKey({ provider: 'gemini', apiKey: geminiKeyInput });
        if (result.isValid) {
            setGeminiApiKey(geminiKeyInput);
            toast({
              title: t('apiKeyInput.toast.title'),
              description: t('apiKeyInput.toast.gemini'),
            });
        } else {
            toast({
                variant: 'destructive',
                title: t('apiKeyInput.toast.validation.title'),
                description: t('apiKeyInput.toast.validation.description'),
            })
        }
    })
  };

  // const handleSaveDeepseek = () => {
  //   setDeepseekApiKey(deepseekKeyInput);
  //   toast({
  //     title: t('apiKeyInput.toast.title'),
  //     description: t('apiKeyInput.toast.deepseek'),
  //   });
  // };

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
          {/* Gemini Key */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gemini-api-key">{t('apiKeyInput.gemini.label')}</Label>
              <div className="relative">
                <Input
                  id="gemini-api-key"
                  type={showGeminiKey ? 'text' : 'password'}
                  value={geminiKeyInput}
                  onChange={e => setGeminiKeyInput(e.target.value)}
                  placeholder={t('apiKeyInput.gemini.placeholder')}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 h-full px-3"
                  onClick={() => setShowGeminiKey(prev => !prev)}
                  aria-label={showGeminiKey ? t('apiKeyInput.aria.hide') : t('apiKeyInput.aria.show')}
                >
                  {showGeminiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button onClick={handleSaveGemini} disabled={isVerifying}>
                {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('apiKeyInput.saveButton')}
            </Button>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>{t('apiKeyInput.gemini.alert.title')}</AlertTitle>
              <AlertDescription>
                {t('apiKeyInput.gemini.alert.description')}
                <Button variant="link" asChild className="p-0 h-auto align-baseline ml-1">
                  <Link href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                    {t('apiKeyInput.gemini.alert.link')}
                  </Link>
                </Button>
              </AlertDescription>
            </Alert>
          </div>

          {/* <Separator /> */}

          {/* DeepSeek Key */}
          {/*
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deepseek-api-key">{t('apiKeyInput.deepseek.label')}</Label>
              <div className="relative">
                <Input
                  id="deepseek-api-key"
                  type={showDeepseekKey ? 'text' : 'password'}
                  value={deepseekKeyInput}
                  onChange={e => setDeepseekKeyInput(e.target.value)}
                  placeholder={t('apiKeyInput.deepseek.placeholder')}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 h-full px-3"
                  onClick={() => setShowDeepseekKey(prev => !prev)}
                  aria-label={showDeepseekKey ? t('apiKeyInput.aria.hide') : t('apiKeyInput.aria.show')}
                >
                  {showDeepseekKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button onClick={handleSaveDeepseek}>{t('apiKeyInput.saveButton')}</Button>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>{t('apiKeyInput.deepseek.alert.title')}</AlertTitle>
              <AlertDescription>
                {t('apiKeyInput.deepseek.alert.description')}
                <Button variant="link" asChild className="p-0 h-auto align-baseline ml-1">
                  <Link href="https://platform.deepseek.com/api_keys" target="_blank" rel="noopener noreferrer">
                    {t('apiKeyInput.deepseek.alert.link')}
                  </Link>
                </Button>
              </AlertDescription>
            </Alert>
          </div>
          */}
        </CardContent>
      </Card>
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>{t('apiKeyInput.alert.footerTitle')}</AlertTitle>
        <AlertDescription>{t('apiKeyInput.alert.footer')}</AlertDescription>
      </Alert>
    </div>
  );
}
