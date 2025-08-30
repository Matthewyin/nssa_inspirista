'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useTaskStats } from '@/hooks/use-tasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CheckSquare, 
  Lightbulb,
  List,
  ArrowRight,
  Plus,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ProjectStats {
  notes: {
    total: number;
    recent: number; // 最近7天创建的
  };
  checklists: {
    total: number;
    completed: number;
  };
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
  };
}

export function ProjectOverviewCards() {
  const { user } = useAuth();
  const { stats: taskStats, loading: taskStatsLoading } = useTaskStats();
  const [projectStats, setProjectStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);

  // 获取笔记和清单统计
  useEffect(() => {
    if (!user) {
      setProjectStats(null);
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        // 获取笔记统计
        const notesQuery = query(
          collection(db, 'notes'),
          where('uid', '==', user.uid)
        );

        const unsubscribeNotes = onSnapshot(notesQuery, (snapshot) => {
          const notes = snapshot.docs.map(doc => doc.data());
          const now = new Date();
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          
          const recentNotes = notes.filter(note => {
            const createdAt = note.createdAt?.toDate();
            return createdAt && createdAt >= sevenDaysAgo;
          });

          // 更新统计数据
          setProjectStats(prev => ({
            ...prev!,
            notes: {
              total: notes.length,
              recent: recentNotes.length
            }
          }));
        });

        // 获取清单统计 (假设清单数据结构)
        // 注意：这里需要根据实际的清单数据结构调整
        const checklistsQuery = query(
          collection(db, 'checklists'),
          where('userId', '==', user.uid)
        );

        const unsubscribeChecklists = onSnapshot(checklistsQuery, (snapshot) => {
          const checklists = snapshot.docs.map(doc => doc.data());
          const completedChecklists = checklists.filter(checklist => checklist.completed === true);

          setProjectStats(prev => ({
            ...prev!,
            checklists: {
              total: checklists.length,
              completed: completedChecklists.length
            }
          }));
        }, (error) => {
          // 如果清单集合不存在或没有权限，设置默认值
          console.warn('无法获取清单数据:', error);
          setProjectStats(prev => ({
            ...prev!,
            checklists: {
              total: 0,
              completed: 0
            }
          }));
        });

        // 初始化统计数据
        setProjectStats({
          notes: { total: 0, recent: 0 },
          checklists: { total: 0, completed: 0 },
          tasks: { total: 0, completed: 0, inProgress: 0, overdue: 0 }
        });

        setLoading(false);

        return () => {
          unsubscribeNotes();
          unsubscribeChecklists();
        };
      } catch (error) {
        console.error('获取项目统计失败:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  // 更新任务统计
  useEffect(() => {
    if (taskStats && projectStats) {
      setProjectStats(prev => ({
        ...prev!,
        tasks: {
          total: taskStats.totalTasks,
          completed: taskStats.completedTasks,
          inProgress: taskStats.inProgressTasks,
          overdue: taskStats.overdueTasks
        }
      }));
    }
  }, [taskStats, projectStats]);

  if (loading || taskStatsLoading) {
    return <ProjectOverviewCardsSkeleton />;
  }

  if (!projectStats) {
    return <EmptyProjectOverview />;
  }

  const cards = [
    {
      title: '灵感笔记',
      icon: Lightbulb,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      total: projectStats.notes.total,
      subtitle: `${projectStats.notes.recent} 条最近创建`,
      href: '/notes',
      actionText: '查看笔记'
    },
    {
      title: '核对清单',
      icon: List,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      total: projectStats.checklists.total,
      subtitle: `${projectStats.checklists.completed} 条已完成`,
      href: '/checklist',
      actionText: '查看清单'
    },
    {
      title: '任务管理',
      icon: CheckSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      total: projectStats.tasks.total,
      subtitle: `${projectStats.tasks.completed} 个已完成`,
      href: '/tasks',
      actionText: '查看任务',
      badge: projectStats.tasks.overdue > 0 ? `${projectStats.tasks.overdue} 逾期` : undefined,
      badgeVariant: 'destructive' as const
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <Card 
          key={index} 
          className={cn(
            "transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer border-2",
            card.borderColor
          )}
        >
          <Link href={card.href}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={cn("p-3 rounded-lg", card.bgColor)}>
                <card.icon className={cn("h-6 w-6", card.color)} />
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <div className={cn("text-3xl font-bold", card.color)}>
                  {card.total}
                </div>
                {card.badge && (
                  <Badge variant={card.badgeVariant} className="text-xs">
                    {card.badge}
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                {card.subtitle}
              </p>
              
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" className="p-0 h-auto text-sm">
                  {card.actionText}
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
                
                <Button variant="outline" size="sm">
                  <Plus className="h-3 w-3 mr-1" />
                  新建
                </Button>
              </div>
            </CardContent>
          </Link>
        </Card>
      ))}
    </div>
  );
}

// 空状态组件
function EmptyProjectOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        { title: '灵感笔记', icon: Lightbulb, href: '/notes', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
        { title: '核对清单', icon: List, href: '/checklist', color: 'text-green-600', bgColor: 'bg-green-50' },
        { title: '任务管理', icon: CheckSquare, href: '/tasks', color: 'text-blue-600', bgColor: 'bg-blue-50' }
      ].map((card, index) => (
        <Card key={index} className="transition-all duration-200 hover:shadow-md">
          <Link href={card.href}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={cn("p-3 rounded-lg", card.bgColor)}>
                <card.icon className={cn("h-6 w-6", card.color)} />
              </div>
            </CardHeader>
            
            <CardContent>
              <div className={cn("text-3xl font-bold mb-3", card.color)}>
                0
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                开始创建您的第一个{card.title}
              </p>
              <Button variant="outline" size="sm" className="w-full">
                <Plus className="h-3 w-3 mr-1" />
                立即开始
              </Button>
            </CardContent>
          </Link>
        </Card>
      ))}
    </div>
  );
}

// 加载骨架屏
function ProjectOverviewCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-12 w-12 rounded-lg" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-9 w-16 mb-3" />
            <Skeleton className="h-4 w-32 mb-4" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
