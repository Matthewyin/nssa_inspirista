'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  AlertTriangle,
  Flag,
  GitBranch
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { Milestone } from '@/lib/types/tasks';

interface MilestoneTimelineProps {
  milestones: Milestone[];
  onMilestoneToggle?: (milestoneId: string, isCompleted: boolean) => void;
  className?: string;
  compact?: boolean;
}

export function MilestoneTimeline({ 
  milestones, 
  onMilestoneToggle, 
  className,
  compact = false 
}: MilestoneTimelineProps) {
  // 按目标日期排序里程碑
  const sortedMilestones = [...milestones].sort((a, b) => 
    a.targetDate.getTime() - b.targetDate.getTime()
  );

  // 计算统计信息
  const completedCount = milestones.filter(m => m.isCompleted).length;
  const totalCount = milestones.length;
  const now = new Date();

  if (milestones.length === 0) {
    return null;
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className={cn("pb-4", compact && "pb-2")}>
        <CardTitle className={cn("text-lg flex items-center gap-2", compact && "text-base")}>
          <GitBranch className={cn("h-5 w-5", compact && "h-4 w-4")} />
          里程碑时间线
          <Badge variant="outline" className="text-xs">
            {completedCount}/{totalCount}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className={cn("", compact && "px-3 pb-3")}>
        <div className="relative">
          {/* 时间线主线 */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
          
          <div className="space-y-6">
            {sortedMilestones.map((milestone, index) => {
              const isOverdue = !milestone.isCompleted && milestone.targetDate < now;
              const daysFromNow = differenceInDays(milestone.targetDate, now);
              const isToday = daysFromNow === 0;
              const isTomorrow = daysFromNow === 1;
              const isYesterday = daysFromNow === -1;
              
              // 计算与前一个里程碑的时间间隔
              const prevMilestone = index > 0 ? sortedMilestones[index - 1] : null;
              const daysSincePrev = prevMilestone ? 
                differenceInDays(milestone.targetDate, prevMilestone.targetDate) : 0;

              return (
                <div key={milestone.id} className="relative flex items-start gap-4">
                  {/* 时间线节点 */}
                  <div className="relative z-10 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-12 w-12 p-0 rounded-full border-2 bg-white"
                      onClick={() => onMilestoneToggle?.(milestone.id, !milestone.isCompleted)}
                      disabled={!onMilestoneToggle}
                    >
                      {milestone.isCompleted ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      ) : isOverdue ? (
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                      ) : (
                        <Circle className="h-6 w-6 text-muted-foreground hover:text-primary" />
                      )}
                    </Button>
                    
                    {/* 里程碑序号 */}
                    <div className="absolute -top-1 -right-1">
                      <Badge 
                        variant={milestone.isCompleted ? "default" : "outline"} 
                        className="h-5 w-5 p-0 text-xs rounded-full flex items-center justify-center"
                      >
                        {index + 1}
                      </Badge>
                    </div>
                  </div>

                  {/* 里程碑内容 */}
                  <div className="flex-1 min-w-0 pb-6">
                    <div className={cn(
                      "p-4 rounded-lg border transition-colors",
                      milestone.isCompleted && "bg-green-50 border-green-200",
                      isOverdue && "bg-red-50 border-red-200",
                      !milestone.isCompleted && !isOverdue && "bg-gray-50 border-gray-200"
                    )}>
                      {/* 里程碑标题和状态 */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className={cn(
                          "font-medium",
                          milestone.isCompleted && "line-through text-muted-foreground"
                        )}>
                          {milestone.title}
                        </h4>
                        
                        <div className="flex items-center gap-2">
                          {milestone.isCompleted && (
                            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                              已完成
                            </Badge>
                          )}
                          {isOverdue && (
                            <Badge variant="destructive">
                              已逾期
                            </Badge>
                          )}
                          {isToday && !milestone.isCompleted && (
                            <Badge variant="default" className="bg-orange-100 text-orange-800 border-orange-200">
                              今天
                            </Badge>
                          )}
                          {isTomorrow && !milestone.isCompleted && (
                            <Badge variant="outline">
                              明天
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* 里程碑描述 */}
                      {milestone.description && (
                        <p className={cn(
                          "text-sm text-muted-foreground mb-3",
                          milestone.isCompleted && "line-through"
                        )}>
                          {milestone.description}
                        </p>
                      )}
                      
                      {/* 时间信息 */}
                      <div className="flex items-center gap-4 text-xs">
                        {/* 目标日期 */}
                        <div className={cn(
                          "flex items-center gap-1",
                          isOverdue && "text-red-600"
                        )}>
                          <Calendar className="h-3 w-3" />
                          <span>
                            {format(milestone.targetDate, 'MM月dd日', { locale: zhCN })}
                          </span>
                          <span className="text-muted-foreground">
                            ({format(milestone.targetDate, 'EEEE', { locale: zhCN })})
                          </span>
                        </div>
                        
                        {/* 天数范围 */}
                        {milestone.dayRange && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{milestone.dayRange}</span>
                          </div>
                        )}
                        
                        {/* 距离现在的时间 */}
                        <div className={cn(
                          "flex items-center gap-1",
                          isOverdue && "text-red-600",
                          isToday && "text-orange-600",
                          milestone.isCompleted && "text-green-600"
                        )}>
                          {milestone.isCompleted ? (
                            milestone.completedDate && (
                              <>
                                <CheckCircle2 className="h-3 w-3" />
                                <span>
                                  {format(milestone.completedDate, 'MM/dd HH:mm', { locale: zhCN })} 完成
                                </span>
                              </>
                            )
                          ) : isOverdue ? (
                            <>
                              <AlertTriangle className="h-3 w-3" />
                              <span>逾期 {Math.abs(daysFromNow)} 天</span>
                            </>
                          ) : isToday ? (
                            <span className="font-medium">今天截止</span>
                          ) : isTomorrow ? (
                            <span>明天截止</span>
                          ) : isYesterday ? (
                            <span>昨天截止</span>
                          ) : daysFromNow > 0 ? (
                            <span>还有 {daysFromNow} 天</span>
                          ) : (
                            <span>{Math.abs(daysFromNow)} 天前</span>
                          )}
                        </div>
                      </div>
                      
                      {/* 时间间隔提示 */}
                      {prevMilestone && daysSincePrev > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="text-xs text-muted-foreground">
                            距离上一个里程碑：{daysSincePrev} 天
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* 时间线结束标记 */}
          <div className="relative flex items-center gap-4 mt-4">
            <div className="relative z-10 flex-shrink-0">
              <div className="h-8 w-8 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center">
                <Flag className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              任务完成
            </div>
          </div>
        </div>
        
        {/* 统计信息 */}
        {!compact && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-green-600">{completedCount}</div>
                <div className="text-xs text-muted-foreground">已完成</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-blue-600">{totalCount - completedCount}</div>
                <div className="text-xs text-muted-foreground">待完成</div>
              </div>
              <div>
                <div className="text-lg font-semibold">
                  {Math.round((completedCount / totalCount) * 100)}%
                </div>
                <div className="text-xs text-muted-foreground">完成率</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
