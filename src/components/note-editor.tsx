'use client';

import {useState, useEffect, useTransition} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {
  type Note,
  type AiConfig,
  type AiProvider,
  type AiModel,
  type RefineNoteInput,
  type SuggestTagsInput,
} from '@/lib/types';
import { refineNote, suggestTags } from '@/app/actions';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {useLanguage} from '@/hooks/use-language';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';
import {Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {useToast} from '@/hooks/use-toast';
import {X, Wand2, Tags, Trash2, Download, Loader2, ArrowLeft, Lightbulb, ListChecks} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';
import {ToggleGroup, ToggleGroupItem} from '@/components/ui/toggle-group';
import {useLocalStorage} from '@/hooks/use-local-storage';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Separator} from './ui/separator';
import { useAuth } from '@/hooks/use-auth';

const AI_PROVIDERS: {
  value: AiProvider;
  label: string;
  models: AiModel[];
}[] = [
  {
    value: 'gemini',
    label: 'Google Gemini',
    models: ['gemini-2.5-flash', 'gemini-2.5-pro'],
  },
  {
    value: 'deepseek',
    label: 'DeepSeek',
    models: ['deepseek-chat', 'deepseek-coder'],
  },
];

export function NoteEditor({note}: {note?: Note}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {toast} = useToast();
  const {t} = useLanguage();
  const { user } = useAuth();
  
  const [geminiApiKey] = useLocalStorage<string | null>('gemini-api-key', null);
  const [deepseekApiKey] = useLocalStorage<string | null>('deepseek-api-key', null);
  const [aiConfig, setAiConfig] = useLocalStorage<AiConfig>('ai-config', {
    provider: 'gemini',
    model: 'gemini-2.5-flash',
  });

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'inspiration' | 'checklist'>('inspiration');
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isAiLoading, startAiTransition] = useTransition();

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setCurrentTags(note.tags);
      setCategory(note.category || 'inspiration');
    } else {
      // 处理URL参数预设分类
      const categoryParam = searchParams.get('category');
      if (categoryParam === 'checklist') {
        setCategory('checklist');
      }
    }
  }, [note, searchParams]);

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/,/g, '');
      if (newTag && !currentTags.includes(newTag)) {
        setCurrentTags([...currentTags, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setCurrentTags(currentTags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!user) {
      toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to save." });
      return;
    }
    if (!title.trim() || !content.trim()) {
      toast({
        variant: 'destructive',
        title: t('noteEditor.toast.empty.title'),
        description: t('noteEditor.toast.empty.description'),
      });
      return;
    }

    setIsSaving(true);
    const now = Date.now();
    const redirectPath = category === 'checklist' ? '/checklist' : '/';

    try {
      if (note) {
        // Update existing note
        const noteRef = doc(db, 'notes', note.id);
        await updateDoc(noteRef, {
          title,
          content,
          tags: currentTags,
          category,
          updatedAt: serverTimestamp(),
        });
        toast({title: t('noteEditor.toast.updated.title'), description: t('noteEditor.toast.updated.description')});
      } else {
        // Create new note
        const notesRef = collection(db, 'notes');
        const noteData: any = {
          uid: user.uid,
          title,
          content,
          tags: currentTags,
          category,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        // Add default values for checklist items
        if (category === 'checklist') {
          noteData.sortOrder = Date.now(); // Use timestamp as default sort order
        }

        await addDoc(notesRef, noteData);
        toast({title: t('noteEditor.toast.created.title'), description: t('noteEditor.toast.created.description')});
      }
      router.push(redirectPath);
      router.refresh(); // Refresh server components on the target page
    } catch (error) {
        console.error("Failed to save note:", error);
        toast({ variant: 'destructive', title: "Save failed", description: "Could not save the note. Please try again." });
    } finally {
        setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (note && user) {
        setIsDeleting(true);
        const redirectPath = note.category === 'checklist' ? '/checklist' : '/';
        try {
            const noteRef = doc(db, 'notes', note.id);
            await deleteDoc(noteRef);
            toast({title: t('noteEditor.toast.deleted.title'), description: t('noteEditor.toast.deleted.description')});
            router.push(redirectPath);
            router.refresh();
        } catch(error) {
            console.error("Failed to delete note:", error);
            toast({ variant: 'destructive', title: "Delete failed", description: "Could not delete the note. Please try again." });
        } finally {
            setIsDeleting(false);
        }
    }
  };

  const handleExport = () => {
    const markdownContent = `# ${title}\n\nCategory: ${category}\n\n${content}\n\nTags: ${currentTags.join(', ')}`;
    const blob = new Blob([markdownContent], {type: 'text/markdown;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/ /g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const checkApiKey = (provider: AiProvider) => {
    const key = provider === 'gemini' ? geminiApiKey :
                provider === 'deepseek' ? deepseekApiKey : null;
    if (!key) {
      toast({
        variant: 'destructive',
        title: t('noteEditor.toast.apiKey.title'),
        description: t('noteEditor.toast.apiKey.description'),
      });
      return false;
    }
    return true;
  };

  const getApiKey = (provider: AiProvider) => {
    return provider === 'gemini' ? geminiApiKey :
           provider === 'deepseek' ? deepseekApiKey : null;
  };

  const handleAiAction = async (action: 'refine' | 'suggestTags') => {
    if (!checkApiKey(aiConfig.provider) || !content.trim()) return;

    startAiTransition(async () => {
      try {
        const apiKey = getApiKey(aiConfig.provider);
        if (action === 'refine') {
          const result = await refineNote({noteContent: content, aiConfig, apiKey: apiKey!});
          setContent(result.refinedNote);
          toast({
            title: t('noteEditor.toast.noteRefined.title'),
            description: t('noteEditor.toast.noteRefined.description'),
          });
        } else if (action === 'suggestTags') {
          const result = await suggestTags({noteContent: content, aiConfig, apiKey: apiKey!});
          const newTags = result.tags.filter(tag => !currentTags.includes(tag));
          setCurrentTags(prev => [...prev, ...newTags]);
          toast({
            title: t('noteEditor.toast.tagsSuggested.title'),
            description: t('noteEditor.toast.tagsSuggested.description'),
          });
        }
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: t('noteEditor.toast.aiError.title'),
          description: action === 'refine' ? t('noteEditor.toast.aiError.refine') : t('noteEditor.toast.aiError.tags'),
        });
      }
    });
  };

  const handleProviderChange = (provider: AiProvider) => {
    const newModel = AI_PROVIDERS.find(p => p.value === provider)!.models[0];
    setAiConfig({provider, model: newModel});
  };

  const handleModelChange = (model: AiModel) => {
    setAiConfig(prev => ({...prev, model}));
  };
  
  if (!user) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4">Authenticating...</p>
      </div>
    );
  }

  const backPath = note?.category === 'checklist' ? '/checklist' : (category === 'checklist' ? '/checklist' : '/');
  const availableModels = AI_PROVIDERS.find(p => p.value === aiConfig.provider)?.models || [];

  return (
    <div className="space-y-4">
      <Button variant="outline" asChild>
        <Link href={backPath}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('noteEditor.backButton')}
        </Link>
      </Button>
      <Card className="w-full">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="category" className="text-base">
              {t('noteEditor.category.label')}
            </Label>
            <ToggleGroup
              type="single"
              value={category}
              onValueChange={value => {
                if (value) setCategory(value as 'inspiration' | 'checklist');
              }}
              className="justify-start"
            >
              <ToggleGroupItem value="inspiration" aria-label={t('categories.inspiration')}>
                <Lightbulb className="mr-2 h-4 w-4" />
                {t('categories.inspiration')}
              </ToggleGroupItem>
              <ToggleGroupItem value="checklist" aria-label={t('categories.checklist')}>
                <ListChecks className="mr-2 h-4 w-4" />
                {t('categories.checklist')}
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base">
              {t('noteEditor.title.label')}
            </Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={t('noteEditor.title.placeholder')}
              className="text-lg h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content" className="text-base">
              {t('noteEditor.content.label')}
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={t('noteEditor.content.placeholder')}
              rows={12}
              className="text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-base">
              {t('noteEditor.tags.label')}
            </Label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder={t('noteEditor.tags.placeholder')}
                className="flex-grow"
              />
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" onClick={() => handleAiAction('suggestTags')} disabled={isAiLoading || !content.trim()} className="flex-1">
                  {isAiLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Tags className="mr-2 h-4 w-4" />
                  )}
                  {t('noteEditor.tags.suggestButton')}
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {currentTags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="rounded-full hover:bg-muted-foreground/20 p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>

        <Separator />

        <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-secondary/50 p-4 rounded-b-lg">
          <div className="flex flex-col sm:flex-row flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* AI Tools */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Label className="hidden sm:inline-block">{t('noteEditor.aiTools.provider')}:</Label>
              <Select value={aiConfig.provider} onValueChange={(value) => handleProviderChange(value as AiProvider)}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder={t('noteEditor.aiTools.provider')} />
                </SelectTrigger>
                <SelectContent>
                  {AI_PROVIDERS.map(p => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Label className="hidden sm:inline-block">{t('noteEditor.aiTools.model')}:</Label>
              <Select value={aiConfig.model} onValueChange={(value) => handleModelChange(value as AiModel)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={t('noteEditor.aiTools.model')} />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map(m => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => handleAiAction('refine')} variant="outline" disabled={isAiLoading || !content.trim()} className="w-full sm:w-auto">
              {isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              {t('noteEditor.refineButton')}
            </Button>
            <Button onClick={handleExport} variant="outline" disabled={!title || !content} className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              {t('noteEditor.exportButton')}
            </Button>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {note && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full" disabled={isDeleting}>
                    {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('noteEditor.deleteButton')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('noteEditor.deleteDialog.title')}</AlertDialogTitle>
                    <AlertDialogDescription>{t('noteEditor.deleteDialog.description')}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('noteEditor.deleteDialog.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                      {t('noteEditor.deleteDialog.continue')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button onClick={handleSave} className="w-full" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('noteEditor.saveButton')}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
