'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckSquare,
  Plus,
  Sparkles,
  Target,
  Calendar,
  Lightbulb
} from 'lucide-react';

interface EmptyTasksProps {
  onCreateTask: () => void;
  onAIGenerate: () => void;
}

export function EmptyTasks({ onCreateTask, onAIGenerate }: EmptyTasksProps) {
  const quickStartActions = [
    {
      title: '创建第一个任务',
      description: '手动创建一个简单的任务开始',
      icon: Plus,
      action: onCreateTask,
      variant: 'default' as const,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'AI 智能生成',
      description: '让AI帮你规划任务计划',
      icon: Sparkles,
      action: onAIGenerate,
      variant: 'secondary' as const,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      featured: true
    }
  ];

  const examples = [
    {
      title: '学习新技能',
      description: '比如学习React、准备考试、练习英语',
      icon: Target,
      color: 'text-green-600'
    },
    {
      title: '工作项目',
      description: '完成项目功能、代码审查、文档编写',
      icon: CheckSquare,
      color: 'text-blue-600'
    },
    {
      title: '个人目标',
      description: '健身计划、阅读书籍、整理房间',
      icon: Calendar,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* 主要图标和标题 */}
      <div className="text-center mb-8">
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
            <CheckSquare className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            开始您的任务管理之旅
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            创建您的第一个任务，或让AI帮您智能规划。
            专注于3-30天的短期目标，让每一天都更有成效。
          </p>
        </div>

        {/* 快速开始按钮 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          {quickStartActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              size="lg"
              onClick={action.action}
              className={action.featured ? 
                "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white" : 
                ""
              }
            >
              <action.icon className="h-5 w-5 mr-2" />
              {action.title}
            </Button>
          ))}
        </div>
      </div>

      {/* 示例和建议 */}
      <div className="w-full max-w-4xl">
        <div className="text-center mb-6">
          <h3 className="text-lg font-medium text-foreground mb-2">
            任务管理建议
          </h3>
          <p className="text-sm text-muted-foreground">
            以下是一些常见的任务类型，帮助您快速开始
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {examples.map((example, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                    <example.icon className={`h-6 w-6 ${example.color}`} />
                  </div>
                </div>
                <h4 className="font-medium text-foreground mb-2">
                  {example.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {example.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 功能亮点 */}
        <div className="bg-muted/50 rounded-lg p-6">
          <div className="text-center mb-4">
            <Lightbulb className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
            <h4 className="font-medium text-foreground">功能亮点</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span>AI智能任务规划和分解</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>可视化看板和列表视图</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <span>进度跟踪和时间管理</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                <span>优先级和分类管理</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span>截止日期提醒和逾期警告</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-teal-500 rounded-full" />
                <span>子任务分解和里程碑</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
