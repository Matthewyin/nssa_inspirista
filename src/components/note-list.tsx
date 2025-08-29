'use client';

import { useState } from 'react';
import { type Note } from '@/lib/types';
import { NoteCard } from './note-card';
import { BatchNoteCard } from './batch-note-card';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Archive, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface NoteListProps {
  initialNotes: Note[];
  onNotesChange?: () => void;
}

export function NoteList({ initialNotes, onNotesChange }: NoteListProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [batchMode, setBatchMode] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNotes(new Set(initialNotes.map(note => note.id)));
    } else {
      setSelectedNotes(new Set());
    }
  };

  const handleSelectNote = (noteId: string, checked: boolean) => {
    const newSelected = new Set(selectedNotes);
    if (checked) {
      newSelected.add(noteId);
    } else {
      newSelected.delete(noteId);
    }
    setSelectedNotes(newSelected);
  };

  const handleBatchDelete = async () => {
    if (selectedNotes.size === 0) return;

    try {
      const batch = writeBatch(db);
      selectedNotes.forEach(noteId => {
        const noteRef = doc(db, 'notes', noteId);
        batch.delete(noteRef);
      });

      await batch.commit();

      toast({
        title: t('noteList.batch.deleted.title'),
        description: t('noteList.batch.deleted.description', { count: selectedNotes.size }),
      });

      setSelectedNotes(new Set());
      setBatchMode(false);
      onNotesChange?.();
    } catch (error) {
      console.error('Error deleting notes:', error);
      toast({
        title: t('noteList.batch.error.title'),
        description: t('noteList.batch.error.description'),
        variant: 'destructive',
      });
    }
  };

  const exitBatchMode = () => {
    setBatchMode(false);
    setSelectedNotes(new Set());
  };

  return (
    <div className="flex flex-col h-full">
      {initialNotes.length > 0 ? (
        <>
          {/* Batch Mode Controls */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant={batchMode ? "default" : "outline"}
                onClick={() => setBatchMode(!batchMode)}
              >
                {batchMode ? t('noteList.batch.exit') : t('noteList.batch.select')}
              </Button>

              {batchMode && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedNotes.size === initialNotes.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm text-muted-foreground">
                    {t('noteList.batch.selectAll')} ({selectedNotes.size}/{initialNotes.length})
                  </span>
                </div>
              )}
            </div>

            {batchMode && selectedNotes.size > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBatchDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('noteList.batch.delete')} ({selectedNotes.size})
                </Button>
              </div>
            )}
          </div>

          {/* Notes Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {initialNotes.map((note) => (
              batchMode ? (
                <BatchNoteCard
                  key={note.id}
                  note={note}
                  selected={selectedNotes.has(note.id)}
                  onSelect={(checked) => handleSelectNote(note.id, checked)}
                />
              ) : (
                <NoteCard key={note.id} note={note} />
              )
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm mt-8">
          <div className="flex flex-col items-center gap-2 text-center p-8">
            <h3 className="text-2xl font-bold tracking-tight">{t('noteList.empty.title')}</h3>
            <p className="text-sm text-muted-foreground">{t('noteList.empty.description')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
