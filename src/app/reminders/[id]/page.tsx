import { ReminderForm } from '@/components/reminders/reminder-form';

interface EditReminderPageProps {
  params: {
    id: string;
  };
}

export default function EditReminderPage({ params }: EditReminderPageProps) {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">编辑提醒</h1>
          <p className="text-muted-foreground">
            修改提醒设置和调度时间
          </p>
        </div>
        
        <ReminderForm reminderId={params.id} />
      </div>
    </div>
  );
}
