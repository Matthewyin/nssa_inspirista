import { NoteList } from '@/components/note-list';
import { getNotes } from '@/app/actions';
import { auth } from '@/lib/firebase-server';
import { redirect } from 'next/navigation';
import { User } from 'firebase-admin/auth';

export default async function HomePage() {
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

    // If user is authenticated on the server, fetch notes
    const inspirationNotes = await getNotes({ uid: user.uid, category: 'inspiration' });
    return <NoteList initialNotes={inspirationNotes} />;
  }

  // In local dev when auth is not available, render the component and let client handle auth.
  // The NoteList component will show a loading state or an empty state managed by the client-side auth context.
  return <NoteList initialNotes={[]} />;
}
