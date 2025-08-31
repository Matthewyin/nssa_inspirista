'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Target,
  Sparkles,
  ArrowRight,
  BookOpen,
  Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';

// 加载骨架屏组件
export function TaskCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="animate-pulse">
          <CardContent className="p-4">
            <div className="space-y-3">
              {/* 标题和状态 */}
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 w-16 bg-gray-200 rounded"></div>
              </div>
              
              {/* 里程碑进度 */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
              </div>
              
              {/* 时间信息 */}
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// 里程碑列表骨架屏
export function MilestoneListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="animate-pulse">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 bg-gray-200 rounded-full flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-5 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="flex gap-4">
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// 加载指示器
interface LoadingIndicatorProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingIndicator({ 
  message = '加载中...', 
  size = 'md',
  className 
}: LoadingIndicatorProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin", sizeClasses[size])} />
      <span className="text-muted-foreground">{message}</span>
    </div>
  );
}

// 空状态组件
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  className?: string;
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  className 
}: EmptyStateProps) {
  return (
    <div className={cn("text-center py-12", className)}>
      <div className="mb-4">
        {icon || <Target className="h-12 w-12 text-muted-foreground mx-auto" />}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="flex items-center gap-2">
          {action.icon}
          {action.label}
        </Button>
      )}
    </div>
  );
}

// 任务空状态
export function TasksEmptyState({ onCreateTask }: { onCreateTask: () => void }) {
  return (
    <EmptyState
      icon={<Target className="h-12 w-12 text-blue-500 mx-auto" />}
      title="还没有任务"
      description="创建您的第一个任务，开始高效的项目管理之旅。使用AI助手可以快速生成任务计划和里程碑。"
      action={{
        label: "创建任务",
        onClick: onCreateTask,
        icon: <Plus className="h-4 w-4" />
      }}
    />
  );
}

// 里程碑空状态
export function MilestonesEmptyState({ onAddMilestone }: { onAddMilestone: () => void }) {
  return (
    <EmptyState
      icon={<Target className="h-12 w-12 text-green-500 mx-auto" />}
      title="暂无里程碑"
      description="添加里程碑来跟踪任务进度和重要节点。里程碑帮助您将大任务分解为可管理的小目标。"
      action={{
        label: "添加里程碑",
        onClick: onAddMilestone,
        icon: <Plus className="h-4 w-4" />
      }}
    />
  );
}

// 搜索空状态
export function SearchEmptyState({ 
  searchTerm, 
  onClearSearch 
}: { 
  searchTerm: string; 
  onClearSearch: () => void; 
}) {
  return (
    <EmptyState
      icon={<AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto" />}
      title="没有找到匹配结果"
      description={`没有找到包含"${searchTerm}"的任务或里程碑。请尝试其他关键词或清除搜索条件。`}
      action={{
        label: "清除搜索",
        onClick: onClearSearch,
        icon: <ArrowRight className="h-4 w-4" />
      }}
    />
  );
}

// 用户引导组件
interface UserGuideProps {
  steps: Array<{
    title: string;
    description: string;
    icon?: React.ReactNode;
    action?: {
      label: string;
      onClick: () => void;
    };
  }>;
  currentStep?: number;
  onComplete?: () => void;
  className?: string;
}

export function UserGuide({ 
  steps, 
  currentStep = 0, 
  onComplete, 
  className 
}: UserGuideProps) {
  return (
    <Card className={cn("bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200", className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-blue-800">快速入门指南</h3>
          <Badge variant="outline" className="text-xs">
            {currentStep + 1}/{steps.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={index}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg transition-all",
              index === currentStep ? "bg-white border border-blue-200 shadow-sm" : "opacity-60",
              index < currentStep && "opacity-40"
            )}
          >
            <div className={cn(
              "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
              index < currentStep ? "bg-green-100 text-green-600" :
              index === currentStep ? "bg-blue-100 text-blue-600" :
              "bg-gray-100 text-gray-400"
            )}>
              {index < currentStep ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                step.icon || <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            
            <div className="flex-1">
              <h4 className="font-medium text-sm mb-1">{step.title}</h4>
              <p className="text-xs text-muted-foreground mb-2">{step.description}</p>
              
              {index === currentStep && step.action && (
                <Button
                  onClick={step.action.onClick}
                  size="sm"
                  className="text-xs"
                >
                  {step.action.label}
                </Button>
              )}
            </div>
          </div>
        ))}
        
        {currentStep === steps.length - 1 && onComplete && (
          <div className="text-center pt-2">
            <Button onClick={onComplete} variant="outline" size="sm">
              完成引导
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// AI功能介绍组件
export function AIFeatureIntro({ onTryAI }: { onTryAI: () => void }) {
  return (
    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-100 rounded-full">
            <Sparkles className="h-6 w-6 text-purple-600" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-purple-800 mb-2">
              🚀 体验AI智能任务规划
            </h3>
            <p className="text-purple-700 text-sm mb-4">
              只需描述您的目标，AI助手将自动为您生成详细的任务计划和里程碑，
              让项目管理变得更加智能和高效。
            </p>
            
            <div className="flex items-center gap-4">
              <Button
                onClick={onTryAI}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="sm"
              >
                <Sparkles className="h-4 w-4 mr-1" />
                立即体验
              </Button>
              
              <div className="flex items-center gap-2 text-xs text-purple-600">
                <BookOpen className="h-3 w-3" />
                <span>查看使用指南</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 成功状态组件
export function SuccessState({ 
  title, 
  description, 
  action 
}: { 
  title: string; 
  description: string; 
  action?: { label: string; onClick: () => void; } 
}) {
  return (
    <div className="text-center py-8">
      <div className="mb-4">
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
      </div>
      <h3 className="text-lg font-semibold text-green-800 mb-2">{title}</h3>
      <p className="text-green-700 mb-6 max-w-md mx-auto">{description}</p>
      {action && (
        <Button onClick={action.onClick} variant="outline">
          {action.label}
        </Button>
      )}
    </div>
  );
}
