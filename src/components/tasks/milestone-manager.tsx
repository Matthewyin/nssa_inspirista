'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Flag,
  Plus,
  Edit,
  Trash2,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Circle,
  GripVertical,
  AlertTriangle,
  Save,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { Milestone } from '@/lib/types/tasks';

interface MilestoneManagerProps {
  milestones: Milestone[];
  onMilestoneAdd?: (milestone: Omit<Milestone, 'id' | 'isCompleted'>) => void;
  onMilestoneUpdate?: (milestoneId: string, updates: Partial<Milestone>) => void;
  onMilestoneDelete?: (milestoneId: string) => void;
  onMilestoneToggle?: (milestoneId: string, isCompleted: boolean) => void;
  readonly?: boolean;
  className?: string;
}

export function MilestoneManager({
  milestones,
  onMilestoneAdd,
  onMilestoneUpdate,
  onMilestoneDelete,
  onMilestoneToggle,
  readonly = false,
  className
}: MilestoneManagerProps) {
  const [editingMilestone, setEditingMilestone] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  
  // 新里程碑表单状态
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    targetDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    dayRange: ''
  });

  // 编辑里程碑表单状态
  const [editForm, setEditForm] = useState<Partial<Milestone>>({});

  // 计算统计信息
  const completedCount = milestones.filter(m => m.isCompleted).length;
  const totalCount = milestones.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // 重置新里程碑表单
  const resetNewMilestoneForm = () => {
    setNewMilestone({
      title: '',
      description: '',
      targetDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      dayRange: ''
    });
  };

  // 处理添加里程碑
  const handleAddMilestone = () => {
    if (!newMilestone.title.trim()) return;

    const milestone: Omit<Milestone, 'id' | 'isCompleted'> = {
      title: newMilestone.title.trim(),
      description: newMilestone.description.trim(),
      targetDate: newMilestone.targetDate,
      dayRange: newMilestone.dayRange || `第${milestones.length + 1}天`
    };

    onMilestoneAdd?.(milestone);
    resetNewMilestoneForm();
    setShowAddDialog(false);
  };

  // 开始编辑里程碑
  const startEditMilestone = (milestone: Milestone) => {
    setEditForm({
      title: milestone.title,
      description: milestone.description,
      targetDate: milestone.targetDate,
      dayRange: milestone.dayRange
    });
    setEditingMilestone(milestone.id);
  };

  // 保存编辑
  const saveEditMilestone = () => {
    if (!editingMilestone || !editForm.title?.trim()) return;

    onMilestoneUpdate?.(editingMilestone, {
      title: editForm.title.trim(),
      description: editForm.description?.trim(),
      targetDate: editForm.targetDate,
      dayRange: editForm.dayRange
    });

    setEditingMilestone(null);
    setEditForm({});
  };

  // 取消编辑
  const cancelEditMilestone = () => {
    setEditingMilestone(null);
    setEditForm({});
  };

  // 处理删除里程碑
  const handleDeleteMilestone = (milestoneId: string) => {
    onMilestoneDelete?.(milestoneId);
    setShowDeleteDialog(null);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* 头部统计 */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Flag className="h-5 w-5" />
              里程碑管理
              <Badge variant="outline">
                {completedCount}/{totalCount}
              </Badge>
            </CardTitle>
            
            {!readonly && (
              <Button
                onClick={() => setShowAddDialog(true)}
                size="sm"
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                添加里程碑
              </Button>
            )}
          </div>
          
          {/* 进度信息 */}
          {totalCount > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>完成进度</span>
                <span className="font-medium">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* 里程碑列表 */}
      {milestones.length > 0 ? (
        <div className="space-y-3">
          {milestones.map((milestone, index) => {
            const isEditing = editingMilestone === milestone.id;
            const isOverdue = !milestone.isCompleted && 
              milestone.targetDate && 
              milestone.targetDate < new Date();
            
            const daysUntilDue = milestone.targetDate ? 
              Math.ceil((milestone.targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 
              null;

            return (
              <Card 
                key={milestone.id}
                className={cn(
                  "transition-all duration-200",
                  milestone.isCompleted && "bg-green-50 border-green-200",
                  isOverdue && "bg-red-50 border-red-200",
                  isEditing && "ring-2 ring-blue-500"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* 拖拽手柄 */}
                    {!readonly && (
                      <div className="flex flex-col items-center gap-1 pt-1">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                        <Badge variant="outline" className="text-xs">
                          {index + 1}
                        </Badge>
                      </div>
                    )}

                    {/* 完成状态 */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 flex-shrink-0 mt-1"
                      onClick={() => onMilestoneToggle?.(milestone.id, !milestone.isCompleted)}
                      disabled={readonly || !onMilestoneToggle}
                    >
                      {milestone.isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                      )}
                    </Button>

                    {/* 里程碑内容 */}
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        /* 编辑模式 */
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs">标题</Label>
                            <Input
                              value={editForm.title || ''}
                              onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <Label className="text-xs">描述</Label>
                            <Textarea
                              value={editForm.description || ''}
                              onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                              className="mt-1 min-h-[60px]"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">目标日期</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal mt-1"
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {editForm.targetDate ? (
                                      format(editForm.targetDate, "PPP", { locale: zhCN })
                                    ) : (
                                      <span>选择日期</span>
                                    )}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={editForm.targetDate}
                                    onSelect={(date) => date && setEditForm(prev => ({ ...prev, targetDate: date }))}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                            
                            <div>
                              <Label className="text-xs">天数范围</Label>
                              <Input
                                value={editForm.dayRange || ''}
                                onChange={(e) => setEditForm(prev => ({ ...prev, dayRange: e.target.value }))}
                                placeholder="如：第1天"
                                className="mt-1"
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={saveEditMilestone}
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <Save className="h-3 w-3" />
                              保存
                            </Button>
                            <Button
                              onClick={cancelEditMilestone}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <X className="h-3 w-3" />
                              取消
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* 显示模式 */
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className={cn(
                              "font-medium",
                              milestone.isCompleted && "line-through text-muted-foreground"
                            )}>
                              {milestone.title}
                            </h4>
                            
                            {!readonly && (
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => startEditMilestone(milestone)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowDeleteDialog(milestone.id)}
                                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                          
                          {milestone.description && (
                            <p className={cn(
                              "text-sm text-muted-foreground mb-2",
                              milestone.isCompleted && "line-through"
                            )}>
                              {milestone.description}
                            </p>
                          )}
                          
                          {/* 时间信息 */}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {milestone.targetDate && (
                              <div className={cn(
                                "flex items-center gap-1",
                                isOverdue && "text-red-600"
                              )}>
                                <CalendarIcon className="h-3 w-3" />
                                <span>
                                  {format(milestone.targetDate, 'MM/dd', { locale: zhCN })}
                                </span>
                                {isOverdue && <AlertTriangle className="h-3 w-3" />}
                                {daysUntilDue !== null && daysUntilDue >= 0 && !milestone.isCompleted && (
                                  <span>
                                    ({daysUntilDue === 0 ? '今天' : 
                                      daysUntilDue === 1 ? '明天' : 
                                      `${daysUntilDue}天后`})
                                  </span>
                                )}
                              </div>
                            )}
                            
                            {milestone.dayRange && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{milestone.dayRange}</span>
                              </div>
                            )}
                            
                            {milestone.isCompleted && milestone.completedDate && (
                              <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle2 className="h-3 w-3" />
                                <span>
                                  {format(milestone.completedDate, 'MM/dd HH:mm', { locale: zhCN })}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* 空状态 */
        <Card>
          <CardContent className="p-8 text-center">
            <Flag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-lg mb-2">暂无里程碑</h3>
            <p className="text-muted-foreground mb-4">
              添加里程碑来跟踪任务进度和重要节点
            </p>
            {!readonly && (
              <Button
                onClick={() => setShowAddDialog(true)}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                添加第一个里程碑
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* 添加里程碑对话框 */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加新里程碑</DialogTitle>
            <DialogDescription>
              为任务添加一个新的里程碑节点
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>标题</Label>
              <Input
                value={newMilestone.title}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
                placeholder="里程碑标题"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label>描述</Label>
              <Textarea
                value={newMilestone.description}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
                placeholder="里程碑描述"
                className="mt-1"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>目标日期</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal mt-1"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(newMilestone.targetDate, "PPP", { locale: zhCN })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newMilestone.targetDate}
                      onSelect={(date) => date && setNewMilestone(prev => ({ ...prev, targetDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label>天数范围</Label>
                <Input
                  value={newMilestone.dayRange}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, dayRange: e.target.value }))}
                  placeholder={`第${milestones.length + 1}天`}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDialog(false);
                resetNewMilestoneForm();
              }}
            >
              取消
            </Button>
            <Button
              onClick={handleAddMilestone}
              disabled={!newMilestone.title.trim()}
            >
              添加里程碑
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除这个里程碑吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(null)}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => showDeleteDialog && handleDeleteMilestone(showDeleteDialog)}
            >
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
