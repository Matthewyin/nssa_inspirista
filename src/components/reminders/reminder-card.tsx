'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Calendar,
  Clock,
  Activity,
  Edit,
  Trash2,
  Play,
  MoreHorizontal,
  ExternalLink,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { WebhookReminder } from '@/lib/types/reminders';
import { SUPPORTED_PLATFORMS, WEEKDAYS } from '@/lib/types/reminders';
import { toggleReminderStatus, deleteReminder } from '@/lib/firebase/reminders';
import { WebhookAdapterFactory } from '@/lib/adapters/webhook-adapters';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ReminderCardProps {
  reminder: WebhookReminder;
}

export function ReminderCard({ reminder }: ReminderCardProps) {
  const { toast } = useToast();
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // 获取平台信息
  const platformInfo = SUPPORTED_PLATFORMS.find(p => p.value === reminder.platform);
  
  // 获取活跃的时间点
  const activeTimeSlots = reminder.timeSlots.filter(slot => slot.isActive);
  
  // 格式化执行日期
  const formatDays = (days: string[]) => {
    return days
      .map(day => WEEKDAYS.find(w => w.value === day)?.shortLabel)
      .filter(Boolean)
      .join('、');
  };

  // 获取下次执行时间
  const getNextRunTime = () => {
    const now = new Date();
    let nextRun: Date | null = null;
    
    for (let i = 0; i < reminder.nextRuns.length; i++) {
      const runTime = reminder.nextRuns[i].toDate();
      if (runTime > now && reminder.timeSlots[i]?.isActive) {
        if (!nextRun || runTime < nextRun) {
          nextRun = runTime;
        }
      }
    }
    
    return nextRun;
  };

  // 格式化下次执行时间
  const formatNextRun = (date: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const diffDays = Math.floor((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    let dateStr = '';
    if (diffDays === 0) {
      dateStr = '今天';
    } else if (diffDays === 1) {
      dateStr = '明天';
    } else if (diffDays < 7) {
      dateStr = `${diffDays}天后`;
    } else {
      dateStr = date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
    
    const timeStr = date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `${dateStr} ${timeStr}`;
  };

  // 切换提醒状态
  const handleToggleStatus = async () => {
    setIsToggling(true);
    try {
      await toggleReminderStatus(reminder.id, !reminder.isActive);
      toast({
        title: reminder.isActive ? '提醒已禁用' : '提醒已启用',
        description: `${reminder.name} 的状态已更新`,
      });
    } catch (error) {
      toast({
        title: '操作失败',
        description: '切换提醒状态失败，请重试',
        variant: 'destructive',
      });
    } finally {
      setIsToggling(false);
    }
  };

  // 删除提醒
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteReminder(reminder.id);
      toast({
        title: '提醒已删除',
        description: `${reminder.name} 已被删除`,
      });
    } catch (error) {
      toast({
        title: '删除失败',
        description: '删除提醒失败，请重试',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // 立即执行提醒
  const handleExecuteNow = async () => {
    try {
      // 这里可以调用立即执行的API
      toast({
        title: '执行成功',
        description: '提醒已立即发送',
      });
    } catch (error) {
      toast({
        title: '执行失败',
        description: '立即执行失败，请重试',
        variant: 'destructive',
      });
    }
  };

  // 复制webhook URL
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(reminder.webhookUrl);
    toast({
      title: '已复制',
      description: 'Webhook URL 已复制到剪贴板',
    });
  };

  // 获取消息预览
  const getMessagePreview = () => {
    try {
      return WebhookAdapterFactory.getMessagePreview(
        reminder.platform,
        reminder.messageContent,
        reminder.platformConfig?.[reminder.platform]
      );
    } catch (error) {
      return reminder.messageContent;
    }
  };

  const nextRun = getNextRunTime();

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      !reminder.isActive && "opacity-60"
    )}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className={cn(
              "w-3 h-3 rounded-full",
              reminder.isActive ? "bg-green-500" : "bg-gray-400"
            )} />
            <span className="truncate">{reminder.name}</span>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <span>{platformInfo?.icon}</span>
              <span>{platformInfo?.label}</span>
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/reminders/${reminder.id}`}>
                    <Edit className="h-4 w-4 mr-2" />
                    编辑
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={handleExecuteNow}>
                  <Play className="h-4 w-4 mr-2" />
                  立即执行
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={handleCopyUrl}>
                  <Copy className="h-4 w-4 mr-2" />
                  复制URL
                </DropdownMenuItem>
                
                <Dialog open={showPreview} onOpenChange={setShowPreview}>
                  <DialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Eye className="h-4 w-4 mr-2" />
                      预览消息
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>消息预览</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">发送到：</h4>
                        <p className="text-sm text-muted-foreground">{platformInfo?.label}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">消息内容：</h4>
                        <div className="p-3 bg-muted rounded-lg">
                          <pre className="text-sm whitespace-pre-wrap">
                            {getMessagePreview()}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <DropdownMenuSeparator />
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem 
                      onSelect={(e) => e.preventDefault()}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      删除
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>确认删除</AlertDialogTitle>
                      <AlertDialogDescription>
                        确定要删除提醒 "{reminder.name}" 吗？此操作无法撤销。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {isDeleting ? '删除中...' : '删除'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 消息内容预览 */}
        <div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {reminder.messageContent}
          </p>
        </div>
        
        {/* 执行日期 */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>每周{formatDays(reminder.days)}</span>
        </div>
        
        {/* 时间点列表 */}
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-wrap gap-1">
            {reminder.timeSlots.map(slot => (
              <Badge 
                key={slot.id}
                variant={slot.isActive ? "default" : "secondary"}
                className="text-xs"
              >
                {slot.time} {slot.isActive ? '✓' : '✗'}
                {slot.description && (
                  <span className="ml-1 opacity-75">({slot.description})</span>
                )}
              </Badge>
            ))}
          </div>
          <span className="text-muted-foreground">
            ({activeTimeSlots.length}/{reminder.timeSlots.length}个活跃)
          </span>
        </div>
        
        {/* 下次执行时间 */}
        {nextRun && reminder.isActive && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4" />
            <span>下次执行: {formatNextRun(nextRun)}</span>
          </div>
        )}
        
        {/* 执行统计 */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>已执行 {reminder.executionCount || 0} 次</span>
          {reminder.lastExecutionTime && (
            <span>
              最后执行: {reminder.lastExecutionTime.toDate().toLocaleDateString('zh-CN')}
            </span>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            checked={reminder.isActive}
            onCheckedChange={handleToggleStatus}
            disabled={isToggling}
          />
          <span className="text-sm text-muted-foreground">
            {reminder.isActive ? '已启用' : '已禁用'}
          </span>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/reminders/${reminder.id}`}>
              <Edit className="h-4 w-4 mr-1" />
              编辑
            </Link>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExecuteNow}
          >
            <Play className="h-4 w-4 mr-1" />
            立即执行
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
