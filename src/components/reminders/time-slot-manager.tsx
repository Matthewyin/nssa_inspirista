'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimeSlot {
  time: string;
  isActive: boolean;
  description?: string;
}

interface TimeSlotManagerProps {
  timeSlots: TimeSlot[];
  onChange: (timeSlots: TimeSlot[]) => void;
  maxSlots?: number;
}

export function TimeSlotManager({ 
  timeSlots, 
  onChange, 
  maxSlots = 3 
}: TimeSlotManagerProps) {
  
  const addTimeSlot = () => {
    if (timeSlots.length >= maxSlots) return;
    
    const newSlot: TimeSlot = {
      time: '09:00',
      isActive: true,
      description: ''
    };
    
    onChange([...timeSlots, newSlot]);
  };
  
  const updateTimeSlot = (index: number, updates: Partial<TimeSlot>) => {
    const updatedSlots = timeSlots.map((slot, i) => 
      i === index ? { ...slot, ...updates } : slot
    );
    onChange(updatedSlots);
  };
  
  const removeTimeSlot = (index: number) => {
    if (timeSlots.length <= 1) return; // 至少保留一个时间点
    onChange(timeSlots.filter((_, i) => i !== index));
  };

  const activeCount = timeSlots.filter(slot => slot.isActive).length;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">
          提醒时间点 (最多{maxSlots}个)
        </Label>
        <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {activeCount}/{timeSlots.length} 个活跃
        </Badge>
      </div>
      
      <div className="space-y-3">
        {timeSlots.map((slot, index) => (
          <div 
            key={index}
            className={cn(
              "flex items-center gap-3 p-4 border rounded-lg transition-all",
              slot.isActive ? "border-primary/20 bg-primary/5" : "border-border bg-muted/30"
            )}
          >
            {/* 启用状态 */}
            <Checkbox
              checked={slot.isActive}
              onCheckedChange={(checked) => 
                updateTimeSlot(index, { isActive: checked as boolean })
              }
              className="flex-shrink-0"
            />
            
            {/* 时间输入 */}
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">时间</Label>
              <Input
                type="time"
                value={slot.time}
                onChange={(e) => updateTimeSlot(index, { time: e.target.value })}
                className="w-32"
                disabled={!slot.isActive}
              />
            </div>
            
            {/* 描述输入 */}
            <div className="flex flex-col gap-1 flex-1">
              <Label className="text-xs text-muted-foreground">
                描述 (可选)
              </Label>
              <Input
                placeholder={`时间点${index + 1}描述，如"上午提醒"`}
                value={slot.description || ''}
                onChange={(e) => updateTimeSlot(index, { description: e.target.value })}
                disabled={!slot.isActive}
                className={cn(
                  "transition-all",
                  !slot.isActive && "bg-muted text-muted-foreground"
                )}
              />
            </div>
            
            {/* 删除按钮 */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeTimeSlot(index)}
              disabled={timeSlots.length <= 1}
              className="flex-shrink-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      
      {/* 添加时间点按钮 */}
      {timeSlots.length < maxSlots && (
        <Button
          type="button"
          variant="outline"
          onClick={addTimeSlot}
          className="w-full border-dashed"
        >
          <Plus className="h-4 w-4 mr-2" />
          添加时间点 (剩余: {maxSlots - timeSlots.length}个)
        </Button>
      )}
      
      {/* 提示信息 */}
      <div className="text-sm text-muted-foreground space-y-1">
        <p>• 每个提醒最多可设置 {maxSlots} 个不同的时间点</p>
        <p>• 可以单独启用或禁用每个时间点</p>
        <p>• 所有时间点共享相同的消息内容和执行日期</p>
        {timeSlots.length > 1 && (
          <p>• 当前设置了 {timeSlots.length} 个时间点，其中 {activeCount} 个处于活跃状态</p>
        )}
      </div>
      
      {/* 时间点预览 */}
      {timeSlots.length > 0 && (
        <div className="p-3 bg-muted/50 rounded-lg">
          <Label className="text-sm font-medium mb-2 block">时间点预览</Label>
          <div className="flex flex-wrap gap-2">
            {timeSlots.map((slot, index) => (
              <Badge
                key={index}
                variant={slot.isActive ? "default" : "secondary"}
                className="flex items-center gap-1"
              >
                <Clock className="h-3 w-3" />
                {slot.time}
                {slot.description && (
                  <span className="opacity-75">({slot.description})</span>
                )}
                {slot.isActive ? ' ✓' : ' ✗'}
              </Badge>
            ))}
          </div>
          
          {activeCount === 0 && (
            <p className="text-sm text-amber-600 mt-2">
              ⚠️ 当前没有活跃的时间点，提醒将不会执行
            </p>
          )}
        </div>
      )}
    </div>
  );
}
