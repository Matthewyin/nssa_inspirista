import { NoteList } from '@/components/note-list';
import { getNotesFlow } from '@/ai/flows/notes';
import { auth } from '@/lib/firebase-server';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const user = await auth.currentUser;

  if (!user) {
    redirect('/login');
  }

  const inspirationNotes = await getNotesFlow({ uid: user.uid, category: 'inspiration' });

  return <NoteList initialNotes={inspirationNotes} />;
}
