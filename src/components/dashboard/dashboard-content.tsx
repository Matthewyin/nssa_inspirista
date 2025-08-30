'use client';

import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckSquare,
  Lightbulb,
  List,
  Calendar,
  Plus,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { ProjectOverviewCards } from './project-overview-cards';
import { RecentActivities } from './recent-activities';

export function DashboardContent() {
  const { user, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();

  // 如果用户未登录，显示登录提示
  if (authLoading) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="mb-6">
          <CheckSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">欢迎使用 Inspirista</h2>
          <p className="text-muted-foreground max-w-md">
            请先登录以查看您的仪表板和管理您的任务、灵感和清单。
          </p>
        </div>
        <Button asChild>
          <Link href="/login">立即登录</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 欢迎信息 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('titles.dashboard')}
          </h1>
          <p className="text-muted-foreground">
            {t('dashboard.welcome')} {user.displayName || user.email}！
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date().toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            })}
          </Badge>
        </div>
      </div>

      {/* Project Overview Cards */}
      <ProjectOverviewCards />

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <RecentActivities />
        </div>
      </div>
    </div>
  );
}

// 加载骨架屏
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* 标题骨架 */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-6 w-32" />
      </div>

      {/* 概览卡片骨架 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* 主要内容骨架 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 最近活动骨架 */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
