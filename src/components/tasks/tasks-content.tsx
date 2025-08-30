'use client';

import { useState } from 'react';
import { useTasks } from '@/hooks/use-tasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Sparkles
} from 'lucide-react';
import { TaskBoard } from './task-board';
import { TaskStats } from './task-stats';
import { EmptyTasks } from './empty-tasks';

export function TasksContent() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);

  // 获取任务数据（不使用筛选）
  const { tasks, loading, error } = useTasks();

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">加载任务时出错</div>
        <Button onClick={() => window.location.reload()}>重试</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">任务管理</h1>
          <p className="text-muted-foreground">
            管理您的短期任务和目标
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            创建任务
          </Button>
          <Button 
            onClick={() => setAiDialogOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            AI 生成
          </Button>
        </div>
      </div>

      {/* 任务统计 */}
      <TaskStats />

      {/* 任务内容 */}
      {loading ? (
        <TasksContentSkeleton />
      ) : tasks.length === 0 ? (
        <EmptyTasks
          onCreateTask={() => setCreateDialogOpen(true)}
          onAIGenerate={() => setAiDialogOpen(true)}
        />
      ) : (
        <TaskBoard tasks={tasks} />
      )}
    </div>
  );
}

// 加载骨架屏
function TasksContentSkeleton() {
  return (
    <div className="space-y-6">
      {/* 统计卡片骨架 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded animate-pulse mb-2" />
              <div className="h-3 w-24 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 看板骨架 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, columnIndex) => (
          <div key={columnIndex} className="space-y-4">
            <div className="h-6 w-24 bg-muted rounded animate-pulse" />
            {Array.from({ length: 3 }).map((_, taskIndex) => (
              <Card key={taskIndex}>
                <CardContent className="p-4 space-y-3">
                  <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-full bg-muted rounded animate-pulse" />
                  <div className="flex justify-between">
                    <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-12 bg-muted rounded animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
