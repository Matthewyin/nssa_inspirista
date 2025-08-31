'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Circle,
  MoreHorizontal,
  ArrowUpDown,
  Filter,
  Sparkles
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { Task, TaskStatus } from '@/lib/types/tasks';

interface TaskListProps {
  tasks: Task[];
  onMilestoneToggle?: (taskId: string, milestoneId: string, isCompleted: boolean) => void;
}

type SortField = 'title' | 'dueDate' | 'priority' | 'status' | 'progress' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export function TaskList({ tasks, onMilestoneToggle }: TaskListProps) {
  const { t } = useLanguage();
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  // Sort tasks
  const sortedTasks = [...tasks].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    // Special handling for date types
    if (sortField === 'dueDate' || sortField === 'createdAt') {
      aValue = aValue.toDate().getTime();
      bValue = bValue.toDate().getTime();
    }

    // Special handling for priority
    if (sortField === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      aValue = priorityOrder[aValue];
      bValue = priorityOrder[bValue];
    }

    // Special handling for status
    if (sortField === 'status') {
      const statusOrder = { todo: 1, in_progress: 2, completed: 3, cancelled: 4 };
      aValue = statusOrder[aValue];
      bValue = statusOrder[bValue];
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // 处理任务选择
  const handleTaskSelect = (taskId: string, checked: boolean) => {
    if (checked) {
      setSelectedTasks([...selectedTasks, taskId]);
    } else {
      setSelectedTasks(selectedTasks.filter(id => id !== taskId));
    }
  };

  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(tasks.map(task => task.id));
    } else {
      setSelectedTasks([]);
    }
  };

  // Get status display
  const getStatusDisplay = (status: TaskStatus) => {
    const statusConfig = {
      todo: { label: t('tasks.status.todo'), color: 'bg-gray-100 text-gray-800', icon: Circle },
      in_progress: { label: t('tasks.status.in_progress'), color: 'bg-blue-100 text-blue-800', icon: Clock },
      completed: { label: t('tasks.status.completed'), color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
      cancelled: { label: t('tasks.status.cancelled'), color: 'bg-red-100 text-red-800', icon: Circle }
    };
    return statusConfig[status];
  };

  // Get priority display
  const getPriorityDisplay = (priority: Task['priority']) => {
    const priorityConfig = {
      high: { label: 'High', color: 'text-red-600', dotColor: 'bg-red-500' },
      medium: { label: 'Medium', color: 'text-yellow-600', dotColor: 'bg-yellow-500' },
      low: { label: 'Low', color: 'text-green-600', dotColor: 'bg-green-500' }
    };
    return priorityConfig[priority];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {t('tasks.list.title')}
            <Badge variant="outline">{tasks.length} {t('tasks.list.tasksCount')}</Badge>
          </CardTitle>
          
          {selectedTasks.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {t('tasks.list.selected', { count: selectedTasks.length })}
              </span>
              <Button variant="outline" size="sm">
                {t('tasks.list.batchActions')}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedTasks.length === tasks.length && tasks.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-medium"
                    onClick={() => handleSort('title')}
                  >
                    {t('tasks.list.taskTitle')}
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>

                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-medium"
                    onClick={() => handleSort('status')}
                  >
                    {t('tasks.list.status')}
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-medium"
                    onClick={() => handleSort('priority')}
                  >
                    {t('tasks.list.priority')}
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-medium"
                    onClick={() => handleSort('dueDate')}
                  >
                    {t('tasks.list.dueDate')}
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-medium"
                    onClick={() => handleSort('progress')}
                  >
                    {t('tasks.list.progress')}
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {sortedTasks.map((task) => {
                const statusDisplay = getStatusDisplay(task.status);
                const priorityDisplay = getPriorityDisplay(task.priority);
                const isOverdue = task.status !== 'completed' && task.dueDate.toDate() < new Date();
                const daysUntilDue = Math.ceil((task.dueDate.toDate().getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

                return (
                  <TableRow 
                    key={task.id}
                    className={cn(
                      "hover:bg-muted/50",
                      task.status === 'completed' && "opacity-60",
                      isOverdue && "bg-red-50"
                    )}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedTasks.includes(task.id)}
                        onCheckedChange={(checked) => handleTaskSelect(task.id, checked as boolean)}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "font-medium",
                            task.status === 'completed' && "line-through text-muted-foreground"
                          )}>
                            {task.title}
                          </span>
                          {task.isAIGenerated && (
                            <Badge variant="outline" className="text-xs px-1.5 py-0.5 border-purple-200 text-purple-600">
                              <Sparkles className="h-3 w-3 mr-1" />
                              AI
                            </Badge>
                          )}
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="secondary" className={statusDisplay.color}>
                        <statusDisplay.icon className="h-3 w-3 mr-1" />
                        {statusDisplay.label}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={cn("h-2 w-2 rounded-full", priorityDisplay.dotColor)} />
                        <span className={cn("text-sm", priorityDisplay.color)}>
                          {priorityDisplay.label}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className={cn(
                        "flex items-center gap-1 text-sm",
                        isOverdue && "text-red-600",
                        daysUntilDue <= 1 && !isOverdue && "text-orange-600"
                      )}>
                        <Calendar className="h-3 w-3" />
                        <span>
                          {isOverdue ? '已逾期' : 
                           daysUntilDue === 0 ? '今天' :
                           daysUntilDue === 1 ? '明天' :
                           task.dueDate.toDate().toLocaleDateString()}
                        </span>
                        {isOverdue && <AlertTriangle className="h-3 w-3" />}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{task.progress}%</span>
                        </div>
                        <Progress value={task.progress} className="h-1.5 w-20" />
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
