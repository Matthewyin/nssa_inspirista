import { NoteEditor } from '@/components/note-editor';

export default function EditNotePage({ params }: { params: { id: string } }) {
  return <NoteEditor noteId={params.id} />;
}
