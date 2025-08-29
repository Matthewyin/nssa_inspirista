import { Checklist } from '@/components/checklist';
import { getNotesFlow } from '@/ai/flows/notes';
import { auth } from '@/lib/firebase-server';
import { redirect } from 'next/navigation';

export default async function ChecklistPage() {
  const user = await auth.currentUser;

  if (!user) {
    redirect('/login');
  }

  const checklistNotes = await getNotesFlow({ uid: user.uid, category: 'checklist' });
  
  return <Checklist initialNotes={checklistNotes} />;
}
