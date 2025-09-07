'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Bell,
  Plus,
  Download,
  Upload,
  Search,
  Filter,
  MoreHorizontal,
  Activity,
  Clock,
  Calendar,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getUserReminders, getReminderStats } from '@/lib/firebase/reminders';
import type { WebhookReminder, ReminderStats } from '@/lib/types/reminders';
import { ReminderCard } from './reminder-card';
import { ReminderImportExport } from './reminder-import-export';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function RemindersContent() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [reminders, setReminders] = useState<WebhookReminder[]>([]);
  const [stats, setStats] = useState<ReminderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showImportExport, setShowImportExport] = useState(false);

  // 加载提醒数据
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const unsubscribe = getUserReminders(user.uid, (fetchedReminders) => {
      setReminders(fetchedReminders);
      setLoading(false);
    });

    // 加载统计信息
    getReminderStats(user.uid).then(setStats);

    return unsubscribe;
  }, [user]);

  // 过滤提醒
  const filteredReminders = reminders.filter(reminder => {
    const matchesSearch = reminder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         reminder.messageContent.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && reminder.isActive) ||
                         (filterStatus === 'inactive' && !reminder.isActive);
    
    return matchesSearch && matchesFilter;
  });

  if (authLoading || loading) {
    return <RemindersContentSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">欢迎使用提醒功能</h2>
        <p className="text-muted-foreground max-w-md">
          请先登录以管理您的提醒设置。
        </p>
        <Button asChild className="mt-4">
          <Link href="/login">立即登录</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-8 w-8" />
            提醒管理
          </h1>
          <p className="text-muted-foreground">
            管理您的定时提醒，支持企业微信、钉钉等多种平台
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowImportExport(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            导入/导出
          </Button>
          
          <Button asChild>
            <Link href="/reminders/new">
              <Plus className="h-4 w-4 mr-2" />
              创建提醒
            </Link>
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总提醒数</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.active} 个活跃
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">今日执行</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayExecutions}</div>
              <p className="text-xs text-muted-foreground">
                总计 {stats.totalExecutions} 次
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">下次执行</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {stats.nextExecution ? (
                <>
                  <div className="text-2xl font-bold">
                    {stats.nextExecution.time.toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {stats.nextExecution.reminderName}
                  </p>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">暂无计划</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">活跃状态</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.active}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.inactive} 个已禁用
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 搜索和过滤 */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索提醒..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              {filterStatus === 'all' ? '全部' : 
               filterStatus === 'active' ? '活跃' : '已禁用'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterStatus('all')}>
              全部提醒
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('active')}>
              活跃提醒
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('inactive')}>
              已禁用提醒
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 提醒列表 */}
      {filteredReminders.length === 0 ? (
        <EmptyReminders searchQuery={searchQuery} filterStatus={filterStatus} />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredReminders.map((reminder) => (
            <ReminderCard key={reminder.id} reminder={reminder} />
          ))}
        </div>
      )}

      {/* 导入导出对话框 */}
      {showImportExport && (
        <ReminderImportExport
          open={showImportExport}
          onOpenChange={setShowImportExport}
          reminders={reminders}
        />
      )}
    </div>
  );
}

// 空状态组件
function EmptyReminders({ 
  searchQuery, 
  filterStatus 
}: { 
  searchQuery: string; 
  filterStatus: string; 
}) {
  if (searchQuery || filterStatus !== 'all') {
    return (
      <div className="text-center py-12">
        <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">未找到匹配的提醒</h3>
        <p className="text-muted-foreground">
          尝试调整搜索条件或过滤器
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">还没有提醒</h3>
      <p className="text-muted-foreground mb-4">
        创建您的第一个提醒，开始自动化通知
      </p>
      <Button asChild>
        <Link href="/reminders/new">
          <Plus className="h-4 w-4 mr-2" />
          创建提醒
        </Link>
      </Button>
    </div>
  );
}

// 加载骨架屏
function RemindersContentSkeleton() {
  return (
    <div className="space-y-6">
      {/* 标题骨架 */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* 统计卡片骨架 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 搜索栏骨架 */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-10 w-24" />
      </div>

      {/* 列表骨架 */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-20" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
