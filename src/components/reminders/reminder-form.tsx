'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, TestTube, ArrowLeft, Eye } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { 
  WebhookReminderFormData, 
  TimeSlot, 
  WebhookPlatform,
  CreateReminderInput 
} from '@/lib/types/reminders';
import { 
  WebhookReminderSchema, 
  SUPPORTED_PLATFORMS, 
  WEEKDAYS, 
  MAX_TIME_SLOTS 
} from '@/lib/types/reminders';
import { 
  createReminder, 
  updateReminder, 
  getReminder 
} from '@/lib/firebase/reminders';
import { 
  WebhookAdapterFactory, 
  detectPlatformFromUrl, 
  testWebhookConnection 
} from '@/lib/adapters/webhook-adapters';
import { TimeSlotManager } from './time-slot-manager';
import { PlatformSelector } from './platform-selector';

interface ReminderFormProps {
  reminderId?: string;
}

export function ReminderForm({ reminderId }: ReminderFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [loading, setLoading] = useState(!!reminderId);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [messagePreview, setMessagePreview] = useState('');

  const form = useForm<WebhookReminderFormData>({
    resolver: zodResolver(WebhookReminderSchema),
    defaultValues: {
      name: '',
      platform: 'wechat_work',
      webhookUrl: '',
      messageContent: '',
      timeSlots: [
        {
          time: '09:00',
          isActive: true,
          description: ''
        }
      ],
      days: ['1', '2', '3', '4', '5'], // 默认工作日
      isActive: true,
      platformConfig: {
        wechat: {
          msgtype: 'text',
          mentionAll: true
        }
      }
    },
  });

  const watchedPlatform = form.watch('platform');
  const watchedUrl = form.watch('webhookUrl');
  const watchedMessage = form.watch('messageContent');
  const watchedPlatformConfig = form.watch('platformConfig');

  // 加载现有提醒数据
  useEffect(() => {
    if (!reminderId || !user) return;

    const loadReminder = async () => {
      try {
        const reminder = await getReminder(reminderId);
        if (!reminder) {
          toast({
            title: '提醒不存在',
            description: '找不到指定的提醒',
            variant: 'destructive',
          });
          router.push('/reminders');
          return;
        }

        if (reminder.userId !== user.uid) {
          toast({
            title: '无权限',
            description: '您没有权限编辑此提醒',
            variant: 'destructive',
          });
          router.push('/reminders');
          return;
        }

        // 填充表单数据
        form.reset({
          name: reminder.name,
          platform: reminder.platform,
          webhookUrl: reminder.webhookUrl,
          messageContent: reminder.messageContent,
          timeSlots: reminder.timeSlots.map(slot => ({
            time: slot.time,
            isActive: slot.isActive,
            description: slot.description || ''
          })),
          days: reminder.days,
          isActive: reminder.isActive,
          platformConfig: reminder.platformConfig,
        });
      } catch (error) {
        toast({
          title: '加载失败',
          description: '加载提醒数据失败',
          variant: 'destructive',
        });
        router.push('/reminders');
      } finally {
        setLoading(false);
      }
    };

    loadReminder();
  }, [reminderId, user, form, toast, router]);

  // 自动检测平台类型
  useEffect(() => {
    if (watchedUrl && !reminderId) { // 只在创建时自动检测
      const detectedPlatform = detectPlatformFromUrl(watchedUrl);
      if (detectedPlatform && detectedPlatform !== watchedPlatform) {
        form.setValue('platform', detectedPlatform);
        
        // 设置默认配置
        const defaultConfig = WebhookAdapterFactory.getDefaultConfig(detectedPlatform);
        form.setValue('platformConfig', {
          [detectedPlatform]: defaultConfig
        });
      }
    }
  }, [watchedUrl, watchedPlatform, form, reminderId]);

  // 更新消息预览
  useEffect(() => {
    if (watchedMessage && watchedPlatform) {
      try {
        const preview = WebhookAdapterFactory.getMessagePreview(
          watchedPlatform,
          watchedMessage,
          watchedPlatformConfig?.[watchedPlatform]
        );
        setMessagePreview(preview);
      } catch (error) {
        setMessagePreview(watchedMessage);
      }
    }
  }, [watchedMessage, watchedPlatform, watchedPlatformConfig]);

  // 测试webhook连接
  const handleTestConnection = async () => {
    const url = form.getValues('webhookUrl');
    const platform = form.getValues('platform');
    const config = form.getValues('platformConfig');

    if (!url) {
      toast({
        title: '请输入Webhook URL',
        variant: 'destructive',
      });
      return;
    }

    setTesting(true);
    try {
      const result = await testWebhookConnection(platform, url, config);
      
      toast({
        title: result.success ? '连接测试成功' : '连接测试失败',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
    } catch (error) {
      toast({
        title: '测试失败',
        description: '网络错误，请检查URL是否正确',
        variant: 'destructive',
      });
    } finally {
      setTesting(false);
    }
  };

  // 提交表单
  const onSubmit = async (data: WebhookReminderFormData) => {
    if (!user) return;

    setSaving(true);
    try {
      // 转换时间点数据
      const timeSlots = data.timeSlots.map(slot => ({
        time: slot.time,
        isActive: slot.isActive,
        description: slot.description || undefined,
      }));

      const reminderInput: CreateReminderInput = {
        ...data,
        timeSlots,
      };

      if (reminderId) {
        await updateReminder(reminderId, { ...reminderInput, id: reminderId });
        toast({
          title: '更新成功',
          description: '提醒已更新',
        });
      } else {
        await createReminder(user.uid, reminderInput);
        toast({
          title: '创建成功',
          description: '提醒已创建',
        });
      }

      router.push('/reminders');
    } catch (error) {
      toast({
        title: reminderId ? '更新失败' : '创建失败',
        description: '操作失败，请重试',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <ReminderFormSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* 返回按钮 */}
      <Button variant="ghost" asChild>
        <Link href="/reminders">
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回提醒列表
        </Link>
      </Button>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>提醒名称</FormLabel>
                    <FormControl>
                      <Input placeholder="输入提醒名称" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>平台类型</FormLabel>
                    <FormControl>
                      <PlatformSelector
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="webhookUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Webhook URL</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="输入Webhook地址" 
                          {...field} 
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleTestConnection}
                          disabled={testing || !field.value}
                        >
                          <TestTube className="h-4 w-4 mr-2" />
                          {testing ? '测试中...' : '测试连接'}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* 消息内容 */}
          <Card>
            <CardHeader>
              <CardTitle>消息内容</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="messageContent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>消息内容</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="输入要发送的消息内容"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      💡 企业微信消息将自动添加"@所有人"前缀
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 消息预览 */}
              {messagePreview && (
                <div>
                  <Label className="text-sm font-medium">消息预览</Label>
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    <pre className="text-sm whitespace-pre-wrap">
                      {messagePreview}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 调度设置 */}
          <Card>
            <CardHeader>
              <CardTitle>调度设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 时间点管理 */}
              <FormField
                control={form.control}
                name="timeSlots"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>提醒时间</FormLabel>
                    <FormControl>
                      <TimeSlotManager
                        timeSlots={field.value}
                        onChange={field.onChange}
                        maxSlots={MAX_TIME_SLOTS}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 执行日期 */}
              <FormField
                control={form.control}
                name="days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>执行日期</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-7 gap-2">
                        {WEEKDAYS.map((day) => (
                          <div key={day.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`day-${day.value}`}
                              checked={field.value.includes(day.value)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...field.value, day.value]);
                                } else {
                                  field.onChange(
                                    field.value.filter((d) => d !== day.value)
                                  );
                                }
                              }}
                            />
                            <Label
                              htmlFor={`day-${day.value}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {day.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 启用状态 */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">启用提醒</FormLabel>
                      <FormDescription>
                        启用后提醒将按照设定的时间自动执行
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/reminders">取消</Link>
            </Button>
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? '保存中...' : reminderId ? '更新提醒' : '创建提醒'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

// 加载骨架屏
function ReminderFormSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-32" />
      
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
      
      <div className="flex justify-end gap-4">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}
