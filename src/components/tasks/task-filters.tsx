'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { 
  Filter,
  X,
  Calendar as CalendarIcon,
  Clock,
  Target,
  Tag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TaskFilters as TaskFiltersType, TaskStatus, TaskPriority, TaskCategory } from '@/lib/types/tasks';

interface TaskFiltersProps {
  filters: TaskFiltersType;
  onFiltersChange: (filters: TaskFiltersType) => void;
}

export function TaskFilters({ filters, onFiltersChange }: TaskFiltersProps) {
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // 状态选项
  const statusOptions = [
    { value: 'todo', label: '待办' },
    { value: 'in_progress', label: '进行中' },
    { value: 'completed', label: '已完成' },
    { value: 'cancelled', label: '已取消' }
  ];

  // 优先级选项
  const priorityOptions = [
    { value: 'high', label: '高优先级' },
    { value: 'medium', label: '中优先级' },
    { value: 'low', label: '低优先级' }
  ];

  // 分类选项
  const categoryOptions = [
    { value: 'work', label: '工作' },
    { value: 'study', label: '学习' },
    { value: 'personal', label: '个人' },
    { value: 'health', label: '健康' },
    { value: 'other', label: '其他' }
  ];

  // 快速日期筛选
  const quickDateFilters = [
    {
      label: '今天',
      getValue: () => {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        return { start: startOfDay, end: endOfDay };
      }
    },
    {
      label: '本周',
      getValue: () => {
        const today = new Date();
        const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
        const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 7);
        return { start: startOfWeek, end: endOfWeek };
      }
    },
    {
      label: '本月',
      getValue: () => {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return { start: startOfMonth, end: endOfMonth };
      }
    },
    {
      label: '逾期',
      getValue: () => {
        const today = new Date();
        const pastDate = new Date(2020, 0, 1); // 很久以前的日期
        return { start: pastDate, end: today };
      }
    }
  ];

  // 更新筛选器
  const updateFilter = (key: keyof TaskFiltersType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  // 清除筛选器
  const clearFilter = (key: keyof TaskFiltersType) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  // 清除所有筛选器
  const clearAllFilters = () => {
    onFiltersChange({});
  };

  // 计算活跃筛选器数量
  const activeFiltersCount = Object.keys(filters).length;

  return (
    <div className="space-y-4">
      {/* 筛选器控件 */}
      <div className="flex flex-wrap items-center gap-3">
        {/* 状态筛选 */}
        <Select
          value={filters.status || ''}
          onValueChange={(value) => updateFilter('status', value as TaskStatus)}
        >
          <SelectTrigger className="w-32">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <SelectValue placeholder="状态" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 优先级筛选 */}
        <Select
          value={filters.priority || ''}
          onValueChange={(value) => updateFilter('priority', value as TaskPriority)}
        >
          <SelectTrigger className="w-32">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <SelectValue placeholder="优先级" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {priorityOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 分类筛选 */}
        <Select
          value={filters.category || ''}
          onValueChange={(value) => updateFilter('category', value as TaskCategory)}
        >
          <SelectTrigger className="w-32">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <SelectValue placeholder="分类" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 日期筛选 */}
        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-32">
              <CalendarIcon className="h-4 w-4 mr-2" />
              {filters.dueDateRange ? '已筛选' : '日期'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">快速筛选</h4>
                <div className="grid grid-cols-2 gap-2">
                  {quickDateFilters.map((filter) => (
                    <Button
                      key={filter.label}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        updateFilter('dueDateRange', filter.getValue());
                        setDatePickerOpen(false);
                      }}
                    >
                      {filter.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">自定义日期</h4>
                <Calendar
                  mode="range"
                  selected={filters.dueDateRange ? {
                    from: filters.dueDateRange.start,
                    to: filters.dueDateRange.end
                  } : undefined}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      updateFilter('dueDateRange', {
                        start: range.from,
                        end: range.to
                      });
                      setDatePickerOpen(false);
                    }
                  }}
                  numberOfMonths={2}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* 清除所有筛选器 */}
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            清除筛选 ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* 活跃筛选器标签 */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">筛选条件:</span>
          
          {filters.status && (
            <Badge variant="secondary" className="flex items-center gap-1">
              状态: {statusOptions.find(opt => opt.value === filters.status)?.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => clearFilter('status')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filters.priority && (
            <Badge variant="secondary" className="flex items-center gap-1">
              优先级: {priorityOptions.find(opt => opt.value === filters.priority)?.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => clearFilter('priority')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filters.category && (
            <Badge variant="secondary" className="flex items-center gap-1">
              分类: {categoryOptions.find(opt => opt.value === filters.category)?.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => clearFilter('category')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filters.dueDateRange && (
            <Badge variant="secondary" className="flex items-center gap-1">
              日期: {filters.dueDateRange.start.toLocaleDateString()} - {filters.dueDateRange.end.toLocaleDateString()}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => clearFilter('dueDateRange')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
