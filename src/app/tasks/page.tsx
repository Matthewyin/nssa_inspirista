'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { TasksContent } from '@/components/tasks/tasks-content';
import { TaskCreateDialog } from '@/components/tasks/task-create-dialog';
import { AITaskGeneratorDialog } from '@/components/tasks/ai-task-generator-dialog';
import { Button } from '@/components/ui/button';
import { CheckSquare } from 'lucide-react';
import Link from 'next/link';

export default function TasksPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);

  // 清除URL参数的函数
  const clearUrlParams = () => {
    router.replace('/tasks', { scroll: false });
  };

  // 处理创建对话框关闭
  const handleCreateDialogClose = (open: boolean) => {
    setCreateDialogOpen(open);
    if (!open) {
      clearUrlParams();
    }
  };

  // 处理AI对话框关闭
  const handleAiDialogClose = (open: boolean) => {
    setAiDialogOpen(open);
    if (!open) {
      clearUrlParams();
    }
  };

  // 处理URL参数触发的操作
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'create') {
      setCreateDialogOpen(true);
    } else if (action === 'ai-generate') {
      setAiDialogOpen(true);
    }
  }, [searchParams]);

  // 如果用户未登录，显示登录提示
  if (authLoading) {
    return <TasksPageSkeleton />;
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="mb-6">
            <CheckSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">{t('tasks.loginRequired.title')}</h2>
            <p className="text-muted-foreground max-w-md">
              {t('tasks.loginRequired.description')}
            </p>
          </div>
          <Button asChild>
            <Link href="/login">{t('tasks.loginRequired.loginButton')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <TasksContent />
      
      {/* 创建任务对话框 */}
      <TaskCreateDialog
        open={createDialogOpen}
        onOpenChange={handleCreateDialogClose}
      />

      {/* AI任务生成对话框 */}
      <AITaskGeneratorDialog
        open={aiDialogOpen}
        onOpenChange={handleAiDialogClose}
      />
    </div>
  );
}

// 加载骨架屏
function TasksPageSkeleton() {
  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* 标题和操作按钮骨架 */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-32 bg-muted rounded animate-pulse" />
            <div className="h-4 w-48 bg-muted rounded animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-muted rounded animate-pulse" />
            <div className="h-10 w-32 bg-muted rounded animate-pulse" />
          </div>
        </div>

        {/* 筛选器骨架 */}
        <div className="flex gap-4">
          <div className="h-10 w-32 bg-muted rounded animate-pulse" />
          <div className="h-10 w-32 bg-muted rounded animate-pulse" />
          <div className="h-10 w-32 bg-muted rounded animate-pulse" />
        </div>

        {/* 任务列表骨架 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, columnIndex) => (
            <div key={columnIndex} className="space-y-4">
              <div className="h-6 w-24 bg-muted rounded animate-pulse" />
              {Array.from({ length: 4 }).map((_, taskIndex) => (
                <div key={taskIndex} className="p-4 border rounded-lg space-y-3">
                  <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-full bg-muted rounded animate-pulse" />
                  <div className="flex justify-between">
                    <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-12 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
