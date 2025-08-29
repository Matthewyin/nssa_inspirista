'use client';

import { type Note } from '@/lib/types';
import { NoteCard } from './note-card';
import { useLanguage } from '@/hooks/use-language';
import { Button } from './ui/button';
import Link from 'next/link';

export function NoteList({ initialNotes }: { initialNotes: Note[] }) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col h-full">
      {initialNotes.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {initialNotes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm mt-8">
          <div className="flex flex-col items-center gap-2 text-center p-8">
            <h3 className="text-2xl font-bold tracking-tight">{t('noteList.empty.title')}</h3>
            <p className="text-sm text-muted-foreground">{t('noteList.empty.description')}</p>
            <Button className="mt-4" asChild>
              <Link href="/notes/new">{t('noteList.empty.createButton')}</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
