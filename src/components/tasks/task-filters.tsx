'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';
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
  const { t } = useLanguage();
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Status options
  const statusOptions = [
    { value: 'todo', label: t('tasks.status.todo') },
    { value: 'in_progress', label: t('tasks.status.in_progress') },
    { value: 'completed', label: t('tasks.status.completed') },
    { value: 'cancelled', label: t('tasks.status.cancelled') }
  ];

  // Priority options
  const priorityOptions = [
    { value: 'high', label: t('tasks.priority.high') },
    { value: 'medium', label: t('tasks.priority.medium') },
    { value: 'low', label: t('tasks.priority.low') }
  ];

  // Category options
  const categoryOptions = [
    { value: 'work', label: t('tasks.category.work') },
    { value: 'study', label: t('tasks.category.study') },
    { value: 'personal', label: t('tasks.category.personal') },
    { value: 'health', label: t('tasks.category.health') },
    { value: 'other', label: t('tasks.category.other') }
  ];

  // Quick date filters
  const quickDateFilters = [
    {
      label: t('tasks.dateFilters.today'),
      getValue: () => {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        return { start: startOfDay, end: endOfDay };
      }
    },
    {
      label: t('tasks.dateFilters.thisWeek'),
      getValue: () => {
        const today = new Date();
        const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
        const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 7);
        return { start: startOfWeek, end: endOfWeek };
      }
    },
    {
      label: t('tasks.dateFilters.thisMonth'),
      getValue: () => {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return { start: startOfMonth, end: endOfMonth };
      }
    },
    {
      label: t('tasks.dateFilters.overdue'),
      getValue: () => {
        const today = new Date();
        const pastDate = new Date(2020, 0, 1); // Long ago date
        return { start: pastDate, end: today };
      }
    }
  ];

  // Update filter
  const updateFilter = (key: keyof TaskFiltersType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  // Clear filter
  const clearFilter = (key: keyof TaskFiltersType) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  // Clear all filters
  const clearAllFilters = () => {
    onFiltersChange({});
  };

  // Calculate active filters count
  const activeFiltersCount = Object.keys(filters).length;

  return (
    <div className="space-y-4">
      {/* Filter controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status filter */}
        <Select
          value={filters.status || ''}
          onValueChange={(value) => updateFilter('status', value as TaskStatus)}
        >
          <SelectTrigger className="w-32">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <SelectValue placeholder={t('tasks.filters.status')} />
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

        {/* Priority filter */}
        <Select
          value={filters.priority || ''}
          onValueChange={(value) => updateFilter('priority', value as TaskPriority)}
        >
          <SelectTrigger className="w-32">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <SelectValue placeholder={t('tasks.filters.priority')} />
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

        {/* Category filter */}
        <Select
          value={filters.category || ''}
          onValueChange={(value) => updateFilter('category', value as TaskCategory)}
        >
          <SelectTrigger className="w-32">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <SelectValue placeholder={t('tasks.filters.category')} />
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

        {/* Date filter */}
        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-32">
              <CalendarIcon className="h-4 w-4 mr-2" />
              {filters.dueDateRange ? t('tasks.filters.filtered') : t('tasks.filters.date')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">{t('tasks.filters.quickFilter')}</h4>
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
                <h4 className="font-medium text-sm">{t('tasks.filters.customDate')}</h4>
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

        {/* Clear all filters */}
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            {t('tasks.filters.clearFilters')} ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Active filter tags */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">{t('tasks.filters.filterConditions')}:</span>
          
          {filters.status && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {t('tasks.filters.status')}: {statusOptions.find(opt => opt.value === filters.status)?.label}
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
              {t('tasks.filters.priority')}: {priorityOptions.find(opt => opt.value === filters.priority)?.label}
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
              {t('tasks.filters.category')}: {categoryOptions.find(opt => opt.value === filters.category)?.label}
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
              {t('tasks.filters.date')}: {filters.dueDateRange.start.toLocaleDateString()} - {filters.dueDateRange.end.toLocaleDateString()}
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
