'use client';

import {ApiKeyManager} from '@/components/api-key-manager';

export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <ApiKeyManager />
    </div>
  );
}
