'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Checklist } from '@/components/checklist';
import { type Note } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function ClientAuthenticatedChecklist() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);

  // 处理URL参数触发的操作
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'create' && user) {
      // 跳转到创建新清单页面
      router.push('/notes/new?category=checklist');
    }
  }, [searchParams, user, router]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      // Fetch notes using client-side Firebase
      const fetchNotes = async () => {
        try {
          setNotesLoading(true);
          const notesRef = collection(db, 'notes');
          const q = query(
            notesRef,
            where('uid', '==', user.uid),
            where('category', '==', 'checklist'),
            orderBy('sortOrder', 'asc'),
            orderBy('createdAt', 'desc')
          );

          const querySnapshot = await getDocs(q);
          const fetchedNotes: Note[] = [];

          querySnapshot.forEach((doc) => {
            const data = doc.data();
            fetchedNotes.push({
              id: doc.id,
              uid: data.uid,
              title: data.title,
              content: data.content,
              tags: data.tags || [],
              category: data.category,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
            });
          });

          setNotes(fetchedNotes);
        } catch (error) {
          console.error('Error fetching notes:', error);
          setNotes([]);
        } finally {
          setNotesLoading(false);
        }
      };

      fetchNotes();
    }
  }, [user, loading, router]);

  if (loading || notesLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  const handleNotesChange = () => {
    // Only refetch notes when explicitly needed (e.g., after delete operations)
    // For sort operations, we rely on local state updates
    if (user) {
      const fetchNotes = async () => {
        try {
          const notesRef = collection(db, 'notes');
          const q = query(
            notesRef,
            where('uid', '==', user.uid),
            where('category', '==', 'checklist'),
            orderBy('sortOrder', 'asc'),
            orderBy('createdAt', 'desc')
          );

          const querySnapshot = await getDocs(q);
          const fetchedNotes: Note[] = [];

          querySnapshot.forEach((doc) => {
            const data = doc.data();
            fetchedNotes.push({
              id: doc.id,
              uid: data.uid,
              title: data.title,
              content: data.content,
              tags: data.tags || [],
              category: data.category,
              // 行为核对清单不需要完成状态
              sortOrder: data.sortOrder,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
            });
          });

          setNotes(fetchedNotes);
        } catch (error) {
          console.error('Error refetching notes:', error);
        }
      };

      fetchNotes();
    }
  };

  return <Checklist initialNotes={notes} onNotesChange={handleNotesChange} />;
}
