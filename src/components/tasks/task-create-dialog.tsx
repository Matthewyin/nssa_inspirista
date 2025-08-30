'use client';

import { useState } from 'react';
import { useTasks } from '@/hooks/use-tasks';
import { useLanguage } from '@/hooks/use-language';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarIcon,
  Clock,
  Plus,
  X,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { TaskPriority, TaskCategory } from '@/lib/types/tasks';

interface TaskCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskCreateDialog({ open, onOpenChange }: TaskCreateDialogProps) {
  const { createTask } = useTasks();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  
  // 表单状态
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    category: 'personal' as TaskCategory,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 默认7天后
    estimatedHours: '',
    tags: [] as string[]
  });
  
  const [newTag, setNewTag] = useState('');
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // 重置表单
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      category: 'personal',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      estimatedHours: '',
      tags: []
    });
    setNewTag('');
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      return;
    }

    setLoading(true);
    try {
      await createTask({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        priority: formData.priority,
        category: formData.category,
        dueDate: new Date(formData.dueDate),
        estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined,
        tags: formData.tags,
        status: 'todo',
        progress: 0,
        timeSpent: 0,
        isAIGenerated: false,
        subtasks: []
      });
      
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setLoading(false);
    }
  };

  // 添加标签
  const addTag = () => {
    const tag = newTag.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setNewTag('');
    }
  };

  // 删除标签
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // 处理键盘事件
  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{t('tasks.create.title')}</DialogTitle>
          <DialogDescription>
            {t('tasks.create.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 任务标题 */}
          <div className="space-y-2">
            <Label htmlFor="title">{t('tasks.create.fields.title')} *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder={t('tasks.create.fields.titlePlaceholder')}
              required
            />
          </div>

          {/* 任务描述 */}
          <div className="space-y-2">
            <Label htmlFor="description">{t('tasks.create.fields.description')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={t('tasks.create.fields.descriptionPlaceholder')}
              rows={3}
            />
          </div>

          {/* 优先级和分类 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('tasks.create.fields.priority')}</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as TaskPriority }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">{t('tasks.priority.high')}</SelectItem>
                  <SelectItem value="medium">{t('tasks.priority.medium')}</SelectItem>
                  <SelectItem value="low">{t('tasks.priority.low')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('tasks.create.fields.category')}</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as TaskCategory }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="work">{t('tasks.category.work')}</SelectItem>
                  <SelectItem value="study">{t('tasks.category.study')}</SelectItem>
                  <SelectItem value="personal">{t('tasks.category.personal')}</SelectItem>
                  <SelectItem value="health">{t('tasks.category.health')}</SelectItem>
                  <SelectItem value="other">{t('tasks.category.other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 截止日期和预估时间 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('tasks.create.fields.dueDate')}</Label>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dueDate ? (
                      format(formData.dueDate, "PPP", { locale: zhCN })
                    ) : (
                      t('tasks.create.fields.selectDate')
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate}
                    onSelect={(date) => {
                      if (date) {
                        setFormData(prev => ({ ...prev, dueDate: date }));
                        setDatePickerOpen(false);
                      }
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedHours">{t('tasks.create.fields.estimatedHours')}</Label>
              <div className="relative">
                <Input
                  id="estimatedHours"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: e.target.value }))}
                  placeholder="8"
                />
                <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* 标签 */}
          <div className="space-y-2">
            <Label>{t('tasks.create.fields.tags')}</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  placeholder={t('tasks.create.fields.tagsPlaceholder')}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTag}
                  disabled={!newTag.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1"
                        onClick={() => removeTag(tag)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {t('tasks.create.buttons.cancel')}
            </Button>
            <Button type="submit" disabled={loading || !formData.title.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('tasks.create.buttons.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
