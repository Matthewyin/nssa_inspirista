import { ReminderForm } from '@/components/reminders/reminder-form';

export default function NewReminderPage() {
  return (
    <div className="container mx-auto max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">创建提醒</h1>
          <p className="text-muted-foreground">
            设置定时提醒，支持企业微信、钉钉等多种平台
          </p>
        </div>

        <ReminderForm />
      </div>
    </div>
  );
}
