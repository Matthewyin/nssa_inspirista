'use client';

import {useState, useEffect, useTransition} from 'react';
import {useRouter} from 'next/navigation';
import {useSyncedStore} from '@/hooks/use-local-storage';
import {type Note} from '@/lib/types';
import {refineNote} from '@/ai/flows/refine-note';
import {suggestTags} from '@/ai/flows/suggest-tags';
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

export function NoteEditor({noteId}: {noteId?: string}) {
  const router = useRouter();
  const {toast} = useToast();
  const {t} = useLanguage();
  const [notes, setNotes] = useSyncedStore<Note[]>('notes', []);
  const [geminiApiKey] = useLocalStorage<string | null>('gemini-api-key', null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'inspiration' | 'checklist'>('inspiration');
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAiLoading, startAiTransition] = useTransition();

  useEffect(() => {
    if (noteId) {
      const noteToEdit = notes.find(note => note.id === noteId);
      if (noteToEdit) {
        setTitle(noteToEdit.title);
        setContent(noteToEdit.content);
        setCurrentTags(noteToEdit.tags);
        setCategory(noteToEdit.category || 'inspiration');
      } else {
        if (notes.length > 0) {
          toast({
            variant: 'destructive',
            title: t('noteEditor.toast.notFound.title'),
            description: t('noteEditor.toast.notFound.description'),
          });
          router.push('/');
        }
      }
    }
    setIsLoaded(true);
  }, [noteId, notes, router, toast, t]);

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

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      toast({
        variant: 'destructive',
        title: t('noteEditor.toast.empty.title'),
        description: t('noteEditor.toast.empty.description'),
      });
      return;
    }

    const now = new Date().toISOString();
    if (noteId) {
      const updatedNotes = notes.map(note =>
        note.id === noteId ? {...note, title, content, tags: currentTags, category, updatedAt: now} : note
      );
      setNotes(updatedNotes);
      toast({title: t('noteEditor.toast.updated.title'), description: t('noteEditor.toast.updated.description')});
    } else {
      const newNote: Note = {
        id: new Date().getTime().toString(),
        title,
        content,
        tags: currentTags,
        category,
        createdAt: now,
        updatedAt: now,
      };
      setNotes([...notes, newNote]);
      toast({title: t('noteEditor.toast.created.title'), description: t('noteEditor.toast.created.description')});
    }

    const redirectPath = category === 'checklist' ? '/checklist' : '/';
    router.push(redirectPath);
    router.refresh();
  };

  const handleDelete = () => {
    if (noteId) {
      const noteToDelete = notes.find(note => note.id === noteId);
      const redirectPath = noteToDelete?.category === 'checklist' ? '/checklist' : '/';
      const updatedNotes = notes.filter(note => note.id !== noteId);
      setNotes(updatedNotes);
      toast({title: t('noteEditor.toast.deleted.title'), description: t('noteEditor.toast.deleted.description')});
      router.push(redirectPath);
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

  const checkApiKey = () => {
    if (!geminiApiKey) {
      toast({
        variant: 'destructive',
        title: 'API Key Required',
        description: `Please set your Gemini API key in Settings to use AI features.`,
      });
      return false;
    }
    return true;
  };

  const handleSuggestTags = async () => {
    if (!checkApiKey() || !content.trim()) return;

    startAiTransition(async () => {
      try {
        const result = await suggestTags({
          noteContent: content,
        });
        const newTags = result.tags.filter(tag => !currentTags.includes(tag));
        setCurrentTags(prev => [...prev, ...newTags]);
        toast({
          title: t('noteEditor.toast.tagsSuggested.title'),
          description: t('noteEditor.toast.tagsSuggested.description'),
        });
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: t('noteEditor.toast.aiError.title'),
          description: t('noteEditor.toast.aiError.tags'),
        });
      }
    });
  };

  const handleRefineNote = async () => {
    if (!checkApiKey() || !content.trim()) return;

    startAiTransition(async () => {
      try {
        const result = await refineNote({
          noteContent: content,
        });
        setContent(result.refinedNote);
        toast({
          title: t('noteEditor.toast.noteRefined.title'),
          description: t('noteEditor.toast.noteRefined.description'),
        });
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: t('noteEditor.toast.aiError.title'),
          description: t('noteEditor.toast.aiError.refine'),
        });
      }
    });
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const backPath = category === 'checklist' ? '/checklist' : '/';

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
            <div className="flex items-center gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder={t('noteEditor.tags.placeholder')}
              />
              <Button variant="outline" onClick={handleSuggestTags} disabled={isAiLoading || !content.trim()}>
                {isAiLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Tags className="mr-2 h-4 w-4" />
                )}
                {t('noteEditor.tags.suggestButton')}
              </Button>
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
        <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-secondary/50 p-4 rounded-b-lg">
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={handleRefineNote} variant="outline" disabled={isAiLoading || !content.trim()}>
              {isAiLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              {t('noteEditor.refineButton')}
            </Button>
            <Button onClick={handleExport} variant="outline" disabled={!title || !content}>
              <Download className="mr-2 h-4 w-4" />
              {t('noteEditor.exportButton')}
            </Button>
          </div>
          <div className="flex gap-2">
            {noteId && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
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
            <Button onClick={handleSave}>{t('noteEditor.saveButton')}</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
