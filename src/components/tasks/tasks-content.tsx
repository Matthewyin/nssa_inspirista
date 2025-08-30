'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTasks } from '@/hooks/use-tasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus,
  Sparkles,
  LayoutGrid,
  List,
  Filter,
  Search,
  Calendar,
  Target
} from 'lucide-react';
import { TaskBoard } from './task-board';
import { TaskList } from './task-list';
import { TaskFilters } from './task-filters';
import { TaskStats } from './task-stats';
import { EmptyTasks } from './empty-tasks';
import type { TaskFilters as TaskFiltersType } from '@/lib/types/tasks';

export function TasksContent() {
  const searchParams = useSearchParams();
  const [view, setView] = useState<'board' | 'list'>('board');
  const [filters, setFilters] = useState<TaskFiltersType>({});
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);

  // 获取任务数据
  const { tasks, loading, error } = useTasks(filters);

  // 处理URL筛选参数
  const urlFilter = searchParams.get('filter');
  const urlView = searchParams.get('view');

  // 根据URL参数设置初始筛选
  useState(() => {
    if (urlFilter === 'today') {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      setFilters({
        dueDateRange: {
          start: startOfDay,
          end: endOfDay
        }
      });
    } else if (urlFilter === 'week') {
      const today = new Date();
      const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
      const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 7);
      setFilters({
        dueDateRange: {
          start: startOfWeek,
          end: endOfWeek
        }
      });
    }

    if (urlView === 'list') {
      setView('list');
    }
  });

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

      {/* 筛选和视图切换 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <TaskFilters filters={filters} onFiltersChange={setFilters} />
        
        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={(value) => setView(value as 'board' | 'list')}>
            <TabsList>
              <TabsTrigger value="board" className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                看板
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                列表
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* 任务内容 */}
      {loading ? (
        <TasksContentSkeleton />
      ) : tasks.length === 0 ? (
        <EmptyTasks 
          onCreateTask={() => setCreateDialogOpen(true)}
          onAIGenerate={() => setAiDialogOpen(true)}
        />
      ) : (
        <div className="space-y-6">
          {view === 'board' ? (
            <TaskBoard tasks={tasks} />
          ) : (
            <TaskList tasks={tasks} />
          )}
        </div>
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
