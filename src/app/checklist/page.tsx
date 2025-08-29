import { Checklist } from '@/components/checklist';
import { getNotes } from '@/app/actions';
import { auth } from '@/lib/firebase-server';
import { redirect } from 'next/navigation';
import { User } from 'firebase-admin/auth';

export default async function ChecklistPage() {
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

  const checklistNotes = await getNotes({ uid: user.uid, category: 'checklist' });
  
  return <Checklist initialNotes={checklistNotes} />;
}
