import { Checklist } from '@/components/checklist';
import { getNotesFlow } from '@/ai/flows/notes';
import { auth } from '@/lib/firebase-server';
import { redirect } from 'next/navigation';
import { User } from 'firebase-admin/auth';

export default async function ChecklistPage() {
  let user: User | null = null;
  try {
    user = await auth.currentUser;
  } catch (e) {
    console.log(e);
  }

  if (!user) {
    redirect('/login');
  }

  const checklistNotes = await getNotesFlow({ uid: user.uid, category: 'checklist' });
  
  return <Checklist initialNotes={checklistNotes} />;
}
