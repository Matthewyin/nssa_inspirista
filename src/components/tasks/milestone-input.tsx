'use client';

import { useState } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CalendarIcon,
  Plus,
  X,
  Flag,
  GripVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { Milestone } from '@/lib/types/tasks';

interface MilestoneInputProps {
  milestones: Omit<Milestone, 'id' | 'isCompleted'>[];
  onChange: (milestones: Omit<Milestone, 'id' | 'isCompleted'>[]) => void;
  className?: string;
}

export function MilestoneInput({ milestones, onChange, className }: MilestoneInputProps) {
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    targetDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 默认明天
    dayRange: ''
  });
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // 添加里程碑
  const addMilestone = () => {
    if (!newMilestone.title.trim()) return;

    const milestone: Omit<Milestone, 'id' | 'isCompleted'> = {
      title: newMilestone.title.trim(),
      description: newMilestone.description.trim(),
      targetDate: newMilestone.targetDate,
      dayRange: newMilestone.dayRange || `第${milestones.length + 1}天`
    };

    onChange([...milestones, milestone]);
    
    // 重置表单
    setNewMilestone({
      title: '',
      description: '',
      targetDate: new Date(Date.now() + (milestones.length + 2) * 24 * 60 * 60 * 1000),
      dayRange: ''
    });
  };

  // 删除里程碑
  const removeMilestone = (index: number) => {
    const updated = milestones.filter((_, i) => i !== index);
    onChange(updated);
  };

  // 更新里程碑
  const updateMilestone = (index: number, field: keyof Omit<Milestone, 'id' | 'isCompleted'>, value: any) => {
    const updated = milestones.map((milestone, i) => 
      i === index ? { ...milestone, [field]: value } : milestone
    );
    onChange(updated);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* 现有里程碑列表 */}
      {milestones.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Flag className="h-4 w-4" />
            里程碑列表 ({milestones.length})
          </Label>
          
          {milestones.map((milestone, index) => (
            <Card key={index} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    里程碑 {index + 1}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMilestone(index)}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">标题</Label>
                  <Input
                    value={milestone.title}
                    onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                    placeholder="里程碑标题"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label className="text-xs">描述</Label>
                  <Textarea
                    value={milestone.description}
                    onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                    placeholder="里程碑描述"
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
                          className={cn(
                            "w-full justify-start text-left font-normal mt-1",
                            !milestone.targetDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {milestone.targetDate ? (
                            format(milestone.targetDate, "PPP", { locale: zhCN })
                          ) : (
                            <span>选择日期</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={milestone.targetDate}
                          onSelect={(date) => date && updateMilestone(index, 'targetDate', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <Label className="text-xs">天数范围</Label>
                    <Input
                      value={milestone.dayRange}
                      onChange={(e) => updateMilestone(index, 'dayRange', e.target.value)}
                      placeholder="如：第1天"
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 添加新里程碑 */}
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Plus className="h-4 w-4" />
            添加里程碑
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">标题</Label>
            <Input
              value={newMilestone.title}
              onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
              placeholder="里程碑标题"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label className="text-xs">描述</Label>
            <Textarea
              value={newMilestone.description}
              onChange={(e) => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
              placeholder="里程碑描述"
              className="mt-1 min-h-[60px]"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">目标日期</Label>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
                      !newMilestone.targetDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newMilestone.targetDate ? (
                      format(newMilestone.targetDate, "PPP", { locale: zhCN })
                    ) : (
                      <span>选择日期</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newMilestone.targetDate}
                    onSelect={(date) => {
                      if (date) {
                        setNewMilestone(prev => ({ ...prev, targetDate: date }));
                        setDatePickerOpen(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label className="text-xs">天数范围</Label>
              <Input
                value={newMilestone.dayRange}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, dayRange: e.target.value }))}
                placeholder={`第${milestones.length + 1}天`}
                className="mt-1"
              />
            </div>
          </div>
          
          <Button 
            onClick={addMilestone}
            disabled={!newMilestone.title.trim()}
            className="w-full"
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            添加里程碑
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
