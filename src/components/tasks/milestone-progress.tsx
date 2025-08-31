'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Flag,
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { Milestone } from '@/lib/types/tasks';

interface MilestoneProgressProps {
  milestones: Milestone[];
  onMilestoneToggle?: (milestoneId: string, isCompleted: boolean) => void;
  className?: string;
  compact?: boolean;
}

export function MilestoneProgress({ 
  milestones, 
  onMilestoneToggle, 
  className,
  compact = false 
}: MilestoneProgressProps) {
  const [isExpanded, setIsExpanded] = useState(!compact);

  // 计算进度
  const completedCount = milestones.filter(m => m.isCompleted).length;
  const totalCount = milestones.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // 获取下一个未完成的里程碑
  const nextMilestone = milestones.find(m => !m.isCompleted);

  // 计算状态
  const isAllCompleted = completedCount === totalCount && totalCount > 0;
  const hasStarted = completedCount > 0;

  if (milestones.length === 0) {
    return null;
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className={cn("pb-3", compact && "pb-2")}>
        <div className="flex items-center justify-between">
          <CardTitle className={cn("text-sm flex items-center gap-2", compact && "text-xs")}>
            <Flag className={cn("h-4 w-4", compact && "h-3 w-3")} />
            里程碑进度
            <Badge variant="outline" className="text-xs">
              {completedCount}/{totalCount}
            </Badge>
          </CardTitle>
          
          {compact && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>

        {/* 总体进度条 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>总体进度</span>
            <span className="font-medium">{progressPercentage}%</span>
          </div>
          <Progress 
            value={progressPercentage} 
            className={cn("h-2", compact && "h-1.5")}
          />
          
          {/* 状态指示 */}
          <div className="flex items-center gap-2 text-xs">
            {isAllCompleted ? (
              <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                全部完成
              </Badge>
            ) : hasStarted ? (
              <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">
                <Target className="h-3 w-3 mr-1" />
                进行中
              </Badge>
            ) : (
              <Badge variant="outline">
                <Circle className="h-3 w-3 mr-1" />
                未开始
              </Badge>
            )}
            
            {nextMilestone && (
              <span className="text-muted-foreground">
                下一个：{nextMilestone.title}
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      {/* 里程碑详细列表 */}
      {isExpanded && (
        <CardContent className={cn("pt-0", compact && "px-3 pb-3")}>
          <div className="space-y-3">
            {milestones.map((milestone, index) => {
              const isOverdue = !milestone.isCompleted && 
                milestone.targetDate && 
                milestone.targetDate < new Date();
              
              const daysUntilDue = milestone.targetDate ? 
                Math.ceil((milestone.targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 
                null;

              return (
                <div
                  key={milestone.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                    milestone.isCompleted && "bg-green-50 border-green-200",
                    isOverdue && "bg-red-50 border-red-200",
                    !milestone.isCompleted && !isOverdue && "bg-gray-50 border-gray-200"
                  )}
                >
                  {/* 状态图标 */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 flex-shrink-0"
                    onClick={() => onMilestoneToggle?.(milestone.id, !milestone.isCompleted)}
                    disabled={!onMilestoneToggle}
                  >
                    {milestone.isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    )}
                  </Button>

                  {/* 里程碑内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className={cn(
                          "font-medium text-sm",
                          milestone.isCompleted && "line-through text-muted-foreground"
                        )}>
                          {milestone.title}
                        </h4>
                        
                        {milestone.description && (
                          <p className={cn(
                            "text-xs text-muted-foreground mt-1",
                            milestone.isCompleted && "line-through"
                          )}>
                            {milestone.description}
                          </p>
                        )}
                      </div>

                      {/* 里程碑序号 */}
                      <Badge variant="outline" className="text-xs">
                        {index + 1}
                      </Badge>
                    </div>

                    {/* 时间信息 */}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      {/* 目标日期 */}
                      {milestone.targetDate && (
                        <div className={cn(
                          "flex items-center gap-1",
                          isOverdue && "text-red-600"
                        )}>
                          <Calendar className="h-3 w-3" />
                          <span>
                            {format(milestone.targetDate, 'MM/dd', { locale: zhCN })}
                          </span>
                          {isOverdue && <span>(逾期)</span>}
                          {daysUntilDue !== null && daysUntilDue >= 0 && !milestone.isCompleted && (
                            <span>
                              ({daysUntilDue === 0 ? '今天' : 
                                daysUntilDue === 1 ? '明天' : 
                                `${daysUntilDue}天后`})
                            </span>
                          )}
                        </div>
                      )}

                      {/* 天数范围 */}
                      {milestone.dayRange && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{milestone.dayRange}</span>
                        </div>
                      )}

                      {/* 完成时间 */}
                      {milestone.isCompleted && milestone.completedDate && (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>
                            {format(milestone.completedDate, 'MM/dd HH:mm', { locale: zhCN })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 总结信息 */}
          {isAllCompleted && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle2 className="h-4 w-4" />
                <span className="font-medium text-sm">恭喜！所有里程碑已完成</span>
              </div>
              <p className="text-xs text-green-700 mt-1">
                您已成功完成了所有设定的里程碑，任务目标达成！
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
