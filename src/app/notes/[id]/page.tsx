import { NoteEditor } from '@/components/note-editor';
import { getNoteFlow } from '@/ai/flows/notes';
import { auth } from '@/lib/firebase-server';
import { redirect } from 'next/navigation';
import { User } from 'firebase-admin/auth';

export default async function EditNotePage({ params }: { params: { id: string } }) {
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
  
  const note = await getNoteFlow({ id: params.id, uid: user.uid });
  
  if (!note) {
    // Maybe show a "Not Found" page instead
    redirect('/');
  }

  return <NoteEditor note={note} />;
}
