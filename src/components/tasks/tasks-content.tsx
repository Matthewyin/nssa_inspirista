'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTasks } from '@/hooks/use-tasks';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
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
import type { TaskFilters as TaskFiltersType } from '@/lib/types/tasks';

export function TasksContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const [view, setView] = useState<'board' | 'list'>('board');
  const [filters, setFilters] = useState<TaskFiltersType>({});

  // Get task data
  const { tasks, loading, error } = useTasks(filters);

  // Handle URL filter parameters
  const urlFilter = searchParams.get('filter');
  const urlView = searchParams.get('view');

  // Set initial filters based on URL parameters
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
        <div className="text-red-500 mb-4">{t('tasks.error')}</div>
        <Button onClick={() => window.location.reload()}>{t('tasks.retry')}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('tasks.title')}</h1>
        <p className="text-muted-foreground">
          {t('tasks.description')}
        </p>
      </div>

      {/* Task Statistics */}
      <TaskStats />

      {/* Filters and View Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <TaskFilters filters={filters} onFiltersChange={setFilters} />

        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={(value) => setView(value as 'board' | 'list')}>
            <TabsList>
              <TabsTrigger value="board" className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                {t('tasks.views.board')}
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                {t('tasks.views.list')}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Task Content */}
      {loading ? (
        <TasksContentSkeleton />
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

// Loading skeleton
function TasksContentSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats cards skeleton */}
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

      {/* Board skeleton */}
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
