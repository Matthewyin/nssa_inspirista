'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';
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
  const { t } = useLanguage();

  const quickStartActions = [
    {
      title: t('tasks.empty.createFirst'),
      description: t('tasks.empty.createFirstDesc'),
      icon: Plus,
      action: onCreateTask,
      variant: 'default' as const,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: t('tasks.empty.aiGenerate'),
      description: t('tasks.empty.aiGenerateDesc'),
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
      title: t('tasks.empty.examples.learning.title'),
      description: t('tasks.empty.examples.learning.desc'),
      icon: Target,
      color: 'text-green-600'
    },
    {
      title: t('tasks.empty.examples.work.title'),
      description: t('tasks.empty.examples.work.desc'),
      icon: CheckSquare,
      color: 'text-blue-600'
    },
    {
      title: t('tasks.empty.examples.personal.title'),
      description: t('tasks.empty.examples.personal.desc'),
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
            {t('tasks.empty.title')}
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {t('tasks.empty.description')}
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
            {t('tasks.empty.suggestions')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t('tasks.empty.suggestionsDesc')}
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

        
      </div>
    </div>
  );
}
