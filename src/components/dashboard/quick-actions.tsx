'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Lightbulb,
  List,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function QuickActions() {
  const quickActions = [
    {
      title: '记录灵感',
      description: '捕捉创意想法和笔记',
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
                action.borderColor
              )}
              asChild
            >
              <Link href={action.href}>
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 rounded-lg bg-white/80">
                    <action.icon className={cn("h-5 w-5", action.color)} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">
                      {action.title}
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



      {/* 项目设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">项目设置</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              管理您的个人项目设置和偏好
            </p>

            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/settings">
                <Settings className="h-4 w-4 mr-2" />
                打开设置
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
