import { ClientAuthenticatedNoteEditor } from '@/components/client-authenticated-note-editor';

export default function EditNotePage({ params }: { params: { id: string } }) {
  return <ClientAuthenticatedNoteEditor noteId={params.id} />;
}
