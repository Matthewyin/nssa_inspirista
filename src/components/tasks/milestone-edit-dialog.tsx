'use client';

import { useState, useEffect } from 'react';
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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Save,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { Milestone } from '@/lib/types/tasks';

interface MilestoneEditDialogProps {
  milestone: Milestone | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (milestoneId: string, updates: Partial<Milestone>) => void;
  onDelete?: (milestoneId: string) => void;
}

export function MilestoneEditDialog({
  milestone,
  open,
  onOpenChange,
  onSave,
  onDelete
}: MilestoneEditDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetDate: new Date(),
    dayRange: '',
    isCompleted: false
  });
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 当里程碑变化时更新表单数据
  useEffect(() => {
    if (milestone) {
      setFormData({
        title: milestone.title,
        description: milestone.description || '',
        targetDate: milestone.targetDate,
        dayRange: milestone.dayRange || '',
        isCompleted: milestone.isCompleted
      });
    }
  }, [milestone]);

  // 重置表单
  const resetForm = () => {
    if (milestone) {
      setFormData({
        title: milestone.title,
        description: milestone.description || '',
        targetDate: milestone.targetDate,
        dayRange: milestone.dayRange || '',
        isCompleted: milestone.isCompleted
      });
    }
    setShowDeleteConfirm(false);
  };

  // 处理保存
  const handleSave = () => {
    if (!milestone || !formData.title.trim()) return;

    const updates: Partial<Milestone> = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      targetDate: formData.targetDate,
      dayRange: formData.dayRange.trim(),
      isCompleted: formData.isCompleted
    };

    // 如果状态改变，更新完成时间
    if (formData.isCompleted !== milestone.isCompleted) {
      if (formData.isCompleted) {
        updates.completedDate = new Date();
      } else {
        updates.completedDate = undefined;
      }
    }

    onSave(milestone.id, updates);
    onOpenChange(false);
  };

  // 处理删除
  const handleDelete = () => {
    if (!milestone) return;
    onDelete?.(milestone.id);
    onOpenChange(false);
    setShowDeleteConfirm(false);
  };

  // 计算时间状态（使用安全的日期处理）
  const now = new Date();
  let targetDate: Date;
  let isOverdue = false;
  let daysUntilDue = 0;

  try {
    if (formData.targetDate instanceof Date) {
      targetDate = isNaN(formData.targetDate.getTime()) ? new Date() : formData.targetDate;
    } else {
      const convertedDate = new Date(formData.targetDate);
      targetDate = isNaN(convertedDate.getTime()) ? new Date() : convertedDate;
    }

    isOverdue = !formData.isCompleted && targetDate < now;
    daysUntilDue = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  } catch (error) {
    console.warn('Error calculating milestone time status:', error);
    targetDate = new Date();
    isOverdue = false;
    daysUntilDue = 0;
  }

  if (!milestone) return null;

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetForm();
    }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            编辑里程碑
            {formData.isCompleted && (
              <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                已完成
              </Badge>
            )}
            {isOverdue && (
              <Badge variant="destructive">
                <AlertTriangle className="h-3 w-3 mr-1" />
                已逾期
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            修改里程碑的详细信息和状态
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 基本信息 */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">标题 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="里程碑标题"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="里程碑描述"
                className="mt-1 min-h-[80px]"
              />
            </div>
          </div>

          {/* 时间设置 */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              时间设置
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>目标日期</Label>
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !formData.targetDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.targetDate ? (
                        format(formData.targetDate, "PPP", { locale: zhCN })
                      ) : (
                        <span>选择日期</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.targetDate}
                      onSelect={(date) => {
                        if (date) {
                          setFormData(prev => ({ ...prev, targetDate: date }));
                          setDatePickerOpen(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                {/* 时间状态提示 */}
                <div className="mt-1 text-xs">
                  {isOverdue ? (
                    <span className="text-red-600">
                      逾期 {Math.abs(daysUntilDue)} 天
                    </span>
                  ) : daysUntilDue === 0 ? (
                    <span className="text-orange-600">今天截止</span>
                  ) : daysUntilDue === 1 ? (
                    <span className="text-orange-600">明天截止</span>
                  ) : daysUntilDue > 0 ? (
                    <span className="text-muted-foreground">还有 {daysUntilDue} 天</span>
                  ) : (
                    <span className="text-muted-foreground">{Math.abs(daysUntilDue)} 天前</span>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="dayRange">天数范围</Label>
                <Input
                  id="dayRange"
                  value={formData.dayRange}
                  onChange={(e) => setFormData(prev => ({ ...prev, dayRange: e.target.value }))}
                  placeholder="如：第1天、第1-3天"
                  className="mt-1"
                />
                <div className="mt-1 text-xs text-muted-foreground">
                  用于标识里程碑在整个任务中的时间位置
                </div>
              </div>
            </div>
          </div>

          {/* 状态设置 */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              状态设置
            </h4>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="font-medium">完成状态</div>
                <div className="text-sm text-muted-foreground">
                  标记此里程碑为已完成
                </div>
              </div>
              <Switch
                checked={formData.isCompleted}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isCompleted: checked }))}
              />
            </div>

            {/* 完成时间显示 */}
            {milestone.isCompleted && milestone.completedDate && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">完成时间</span>
                </div>
                <div className="text-sm text-green-700 mt-1">
                  {format(milestone.completedDate, 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
                </div>
              </div>
            )}
          </div>

          {/* 删除确认 */}
          {showDeleteConfirm && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 mb-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">确认删除</span>
              </div>
              <div className="text-sm text-red-700 mb-3">
                确定要删除这个里程碑吗？此操作无法撤销。
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                >
                  确认删除
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  取消
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div>
            {onDelete && !showDeleteConfirm && (
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-600 hover:text-red-700"
              >
                删除里程碑
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4 mr-1" />
              取消
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.title.trim()}
            >
              <Save className="h-4 w-4 mr-1" />
              保存更改
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
