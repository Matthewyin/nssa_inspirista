
'use client';

import {useState, useEffect} from 'react';
import {useLocalStorage} from '@/hooks/use-local-storage';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {useToast} from '@/hooks/use-toast';
import {KeyRound, Info, Eye, EyeOff, Loader2, ShieldCheck, Trash2} from 'lucide-react';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import Link from 'next/link';
import {useLanguage} from '@/hooks/use-language';
import {Separator} from './ui/separator';
import { validateApiKey } from '@/app/actions';
import type { ValidateApiKeyInput } from '@/lib/types';

export function ApiKeyManager() {
  const {t, isClient} = useLanguage();
  const [geminiApiKey, setGeminiApiKey] = useLocalStorage<string | null>('gemini-api-key', null);
  const [deepseekApiKey, setDeepseekApiKey] = useLocalStorage<string | null>('deepseek-api-key', null);

  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const [deepseekKeyInput, setDeepseekKeyInput] = useState('');

  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showDeepseekKey, setShowDeepseekKey] = useState(false);

  // 为每个API Key创建独立的loading状态
  const [isGeminiSaving, setIsGeminiSaving] = useState(false);
  const [isGeminiValidating, setIsGeminiValidating] = useState(false);
  const [isDeepseekSaving, setIsDeepseekSaving] = useState(false);
  const [isDeepseekValidating, setIsDeepseekValidating] = useState(false);

  const {toast} = useToast();

  useEffect(() => {
    if (geminiApiKey) {
      setGeminiKeyInput(geminiApiKey);
    }
  }, [geminiApiKey]);

  useEffect(() => {
    if (deepseekApiKey) {
      setDeepseekKeyInput(deepseekApiKey);
    }
  }, [deepseekApiKey]);

  const handleValidate = async () => {
    if (!geminiKeyInput.trim()) {
        toast({
            variant: "destructive",
            title: t('apiKeyInput.toast.empty.title'),
            description: t('apiKeyInput.toast.empty.description'),
        })
        return;
    }

    setIsGeminiValidating(true);
    try {
        const result = await validateApiKey({ provider: 'gemini', apiKey: geminiKeyInput });
        if (result.isValid) {
            toast({
              title: t('apiKeyInput.toast.validation.success_title'),
              description: t('apiKeyInput.toast.validation.success_description'),
            });
        } else {
            toast({
                variant: 'destructive',
                title: t('apiKeyInput.toast.validation.title'),
                description: result.error || t('apiKeyInput.toast.validation.description'),
            })
        }
    } finally {
        setIsGeminiValidating(false);
    }
  }

  const handleSaveGemini = async () => {
    if (!geminiKeyInput.trim()) {
        toast({
            variant: "destructive",
            title: t('apiKeyInput.toast.empty.title'),
            description: t('apiKeyInput.toast.empty.description'),
        })
        return;
    }

    setIsGeminiSaving(true);
    try {
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
    } finally {
        setIsGeminiSaving(false);
    }
  };

  const handleDeleteGemini = () => {
    setGeminiApiKey(null);
    setGeminiKeyInput('');
    toast({
        title: t('apiKeyInput.toast.deleted.title'),
        description: t('apiKeyInput.toast.deleted.description'),
    });
  };

  const handleSaveDeepSeek = async () => {
    if (!deepseekKeyInput.trim()) {
        toast({
            variant: "destructive",
            title: t('apiKeyInput.toast.empty.title'),
            description: t('apiKeyInput.toast.empty.description'),
        })
        return;
    }

    setIsDeepseekSaving(true);
    try {
        const result = await validateApiKey({ provider: 'deepseek', apiKey: deepseekKeyInput });
        if (result.isValid) {
            setDeepseekApiKey(deepseekKeyInput);
            toast({
              title: t('apiKeyInput.toast.title'),
              description: t('apiKeyInput.toast.deepseek'),
            });
        } else {
            toast({
                variant: 'destructive',
                title: t('apiKeyInput.toast.validation.title'),
                description: result.error || t('apiKeyInput.toast.validation.description'),
            })
        }
    } finally {
        setIsDeepseekSaving(false);
    }
  };

  const handleValidateDeepSeek = async () => {
    if (!deepseekKeyInput.trim()) {
        toast({
            variant: "destructive",
            title: t('apiKeyInput.toast.empty.title'),
            description: t('apiKeyInput.toast.empty.description'),
        })
        return;
    }

    setIsDeepseekValidating(true);
    try {
        const result = await validateApiKey({ provider: 'deepseek', apiKey: deepseekKeyInput });
        if (result.isValid) {
            toast({
              title: t('apiKeyInput.toast.validation.success_title'),
              description: t('apiKeyInput.toast.validation.success_description'),
            });
        } else {
            toast({
                variant: 'destructive',
                title: t('apiKeyInput.toast.validation.title'),
                description: result.error || t('apiKeyInput.toast.validation.description'),
            })
        }
    } finally {
        setIsDeepseekValidating(false);
    }
  };

  const handleDeleteDeepSeek = () => {
    setDeepseekApiKey(null);
    setDeepseekKeyInput('');
    toast({
        title: t('apiKeyInput.toast.deleted.title'),
        description: t('apiKeyInput.toast.deleted.description'),
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
            <div className="flex flex-wrap gap-2">
                <Button onClick={handleSaveGemini} disabled={isGeminiSaving || isGeminiValidating}>
                    {isGeminiSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('apiKeyInput.saveButton')}
                </Button>
                <Button onClick={handleValidate} variant="outline" disabled={isGeminiSaving || isGeminiValidating}>
                    {isGeminiValidating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <ShieldCheck className="mr-2 h-4 w-4" />
                    )}
                    {t('apiKeyInput.validateButton')}
                </Button>
                {geminiApiKey && (
                  <Button onClick={handleDeleteGemini} variant="destructive" disabled={isGeminiSaving || isGeminiValidating}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t('apiKeyInput.deleteButton')}
                  </Button>
                )}
            </div>
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

          <Separator />

          {/* DeepSeek Key */}
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
            <div className="flex flex-wrap gap-2">
                <Button onClick={handleSaveDeepSeek} disabled={isDeepseekSaving || isDeepseekValidating}>
                    {isDeepseekSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('apiKeyInput.saveButton')}
                </Button>
                <Button onClick={handleValidateDeepSeek} variant="outline" disabled={isDeepseekSaving || isDeepseekValidating}>
                    {isDeepseekValidating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <ShieldCheck className="mr-2 h-4 w-4" />
                    )}
                    {t('apiKeyInput.validateButton')}
                </Button>
                {deepseekApiKey && (
                  <Button onClick={handleDeleteDeepSeek} variant="destructive" disabled={isDeepseekSaving || isDeepseekValidating}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t('apiKeyInput.deleteButton')}
                  </Button>
                )}
            </div>
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
