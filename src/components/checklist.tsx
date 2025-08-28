'use client';

import { useSyncedStore } from '@/hooks/use-local-storage';
import type { Note } from '@/lib/types';
import { NoteCard } from './note-card';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function Checklist() {
  const [notes] = useSyncedStore<Note[]>('notes', []);
  const { t, isClient } = useLanguage();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
        router.push('/login');
    }
  }, [user, loading, router]);


  if (!isClient || loading || !user) {
    return null;
  }

  const checklistNotes = notes
    .filter(note => note.category === 'checklist')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <div className="flex flex-col h-full">
      {checklistNotes.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {checklistNotes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm mt-8">
          <div className="flex flex-col items-center gap-2 text-center p-8">
          </div>
        </div>
      )}
    </div>
  );
}
