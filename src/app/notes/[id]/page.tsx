import { NoteEditor } from '@/components/note-editor';
import { getNote } from '@/app/actions';
import { auth } from '@/lib/firebase-server';
import { redirect } from 'next/navigation';
import { User } from 'firebase-admin/auth';

export default async function EditNotePage({ params }: { params: { id: string } }) {
  // This check is only for server-side authentication in a deployed environment
  if (auth) {
    let user: User | null = null;
    try {
      user = await auth.currentUser;
    } catch (e) {
      console.log(e);
    }
    
    if (!user) {
      redirect('/login');
    }
    
    const note = await getNote({ id: params.id, uid: user.uid });
    
    if (!note) {
      // Maybe show a "Not Found" page instead
      redirect('/');
    }
  
    return <NoteEditor note={note} />;
  }

  // In local dev, we can't fetch the note on the server.
  // The client-side NoteEditor component will need to handle fetching the note data.
  // For now, we can pass the ID and let the component fetch. A more robust solution
  // would be to have a client-side fetcher in the component itself.
  // This page will be primarily client-rendered in local dev.
  // Note: The `NoteEditor` will need to be adapted to fetch its own data if `note` is not provided.
  // Let's check `note-editor.tsx` - it seems to handle `note` being undefined, so this should work.
  return <NoteEditor />;
}
