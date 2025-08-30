'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus,
  CheckSquare,
  Lightbulb,
  List,
  Sparkles,
  Calendar,
  Target,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function QuickActions() {
  const quickActions = [
    {
      title: '创建任务',
      description: '添加新的任务计划',
      icon: CheckSquare,
      href: '/tasks?action=create',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      borderColor: 'border-blue-200'
    },
    {
      title: 'AI 任务规划',
      description: '智能生成任务计划',
      icon: Sparkles,
      href: '/tasks?action=ai-generate',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
      borderColor: 'border-purple-200',
      featured: true
    },
    {
      title: '记录灵感',
      description: '捕捉创意想法',
      icon: Lightbulb,
      href: '/notes/new',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 hover:bg-yellow-100',
      borderColor: 'border-yellow-200'
    },
    {
      title: '新建清单',
      description: '创建行为核对清单',
      icon: List,
      href: '/checklist?action=create',
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100',
      borderColor: 'border-green-200'
    }
  ];

  const timeBasedActions = [
    {
      title: '今日计划',
      description: '查看今天的任务',
      icon: Calendar,
      href: '/tasks?filter=today',
      color: 'text-orange-600'
    },
    {
      title: '本周目标',
      description: '管理周目标',
      icon: Target,
      href: '/tasks?filter=week',
      color: 'text-indigo-600'
    },
    {
      title: '时间跟踪',
      description: '记录工作时间',
      icon: Clock,
      href: '/tasks?view=time-tracking',
      color: 'text-teal-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* 主要快速操作 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plus className="h-5 w-5" />
            快速操作
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className={cn(
                "w-full justify-start h-auto p-4 border transition-all duration-200",
                action.bgColor,
                action.borderColor,
                action.featured && "ring-2 ring-purple-200 shadow-sm"
              )}
              asChild
            >
              <Link href={action.href}>
                <div className="flex items-center gap-3 w-full">
                  <div className={cn(
                    "p-2 rounded-lg bg-white/80",
                    action.featured && "bg-white shadow-sm"
                  )}>
                    <action.icon className={cn("h-5 w-5", action.color)} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">
                      {action.title}
                      {action.featured && (
                        <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                          AI
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {action.description}
                    </div>
                  </div>
                </div>
              </Link>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* 时间相关操作 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5" />
            时间管理
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {timeBasedActions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start h-auto p-3 hover:bg-muted/50"
              asChild
            >
              <Link href={action.href}>
                <div className="flex items-center gap-3 w-full">
                  <action.icon className={cn("h-4 w-4", action.color)} />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {action.description}
                    </div>
                  </div>
                </div>
              </Link>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* 统计快览 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">本周进展</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">任务完成</span>
              <span className="font-medium">8/12</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">工作时间</span>
              <span className="font-medium">24h</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">效率评分</span>
              <span className="font-medium text-green-600">85%</span>
            </div>
            
            <Button variant="outline" size="sm" className="w-full mt-4" asChild>
              <Link href="/tasks?view=analytics">
                查看详细统计
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
