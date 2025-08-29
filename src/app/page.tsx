import { NoteList } from '@/components/note-list';
import { getNotes } from '@/app/actions';
import { auth } from '@/lib/firebase-server';
import { redirect } from 'next/navigation';
import { User } from 'firebase-admin/auth';

export default async function HomePage() {
  if (!auth) {
    redirect('/login');
  }

  let user: User | null = null;
  try {
    user = await auth.currentUser;
  } catch (e) {
    console.log(e);
  }

  if (!user) {
    redirect('/login');
  }

  const inspirationNotes = await getNotes({ uid: user.uid, category: 'inspiration' });

  return <NoteList initialNotes={inspirationNotes} />;
}
