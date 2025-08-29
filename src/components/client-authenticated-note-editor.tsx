'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { NoteEditor } from '@/components/note-editor';
import { type Note } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ClientAuthenticatedNoteEditorProps {
  noteId: string;
}

export function ClientAuthenticatedNoteEditor({ noteId }: ClientAuthenticatedNoteEditorProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [noteLoading, setNoteLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user && noteId) {
      // Fetch note when user is authenticated
      const fetchNote = async () => {
        try {
          setNoteLoading(true);
          const noteRef = doc(db, 'notes', noteId);
          const noteSnap = await getDoc(noteRef);
          
          if (noteSnap.exists()) {
            const data = noteSnap.data();
            // Check if the note belongs to the current user
            if (data.uid === user.uid) {
              const noteData: Note = {
                id: noteSnap.id,
                uid: data.uid,
                title: data.title,
                content: data.content,
                tags: data.tags || [],
                category: data.category,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
              };
              setNote(noteData);
            } else {
              // Note doesn't belong to user
              setNotFound(true);
            }
          } else {
            // Note doesn't exist
            setNotFound(true);
          }
        } catch (error) {
          console.error('Error fetching note:', error);
          setNotFound(true);
        } finally {
          setNoteLoading(false);
        }
      };

      fetchNote();
    }
  }, [user, loading, router, noteId]);

  if (loading || noteLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl font-bold mb-4">Note Not Found</h1>
        <p className="text-muted-foreground mb-4">The note you're looking for doesn't exist or you don't have permission to view it.</p>
        <button 
          onClick={() => router.back()} 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Go Back
        </button>
      </div>
    );
  }

  return <NoteEditor note={note} />;
}
