import { ClientAuthenticatedChecklist } from '@/components/client-authenticated-checklist';

export default function ChecklistPage() {
  // Use client-side authentication for both development and production
  // This ensures consistent behavior and avoids server/client auth conflicts
  return <ClientAuthenticatedChecklist />;
}
