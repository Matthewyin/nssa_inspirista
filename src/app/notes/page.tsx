import { ClientAuthenticatedNoteList } from '@/components/client-authenticated-note-list';

export default function NotesPage() {
  // Use client-side authentication for both development and production
  // This ensures consistent behavior and avoids server/client auth conflicts
  return (
    <div className="container mx-auto p-6">
      <ClientAuthenticatedNoteList />
    </div>
  );
}
