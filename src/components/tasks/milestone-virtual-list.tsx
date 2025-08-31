'use client';

import { useMemo, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { Milestone } from '@/lib/types/tasks';

interface MilestoneVirtualListProps {
  milestones: Milestone[];
  onMilestoneToggle?: (milestoneId: string, isCompleted: boolean) => void;
  onMilestoneEdit?: (milestone: Milestone) => void;
  className?: string;
  maxHeight?: number;
}

type SortField = 'title' | 'targetDate' | 'status';
type SortOrder = 'asc' | 'desc';
type FilterStatus = 'all' | 'completed' | 'pending' | 'overdue';

export function MilestoneVirtualList({
  milestones,
  onMilestoneToggle,
  onMilestoneEdit,
  className,
  maxHeight = 400
}: MilestoneVirtualListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('targetDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  // 优化的过滤和排序逻辑
  const filteredAndSortedMilestones = useMemo(() => {
    let filtered = milestones;

    // 搜索过滤
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(milestone =>
        milestone.title.toLowerCase().includes(searchLower) ||
        milestone.description?.toLowerCase().includes(searchLower)
      );
    }

    // 状态过滤
    if (filterStatus !== 'all') {
      const now = new Date();
      filtered = filtered.filter(milestone => {
        switch (filterStatus) {
          case 'completed':
            return milestone.isCompleted;
          case 'pending':
            return !milestone.isCompleted && milestone.targetDate >= now;
          case 'overdue':
            return !milestone.isCompleted && milestone.targetDate < now;
          default:
            return true;
        }
      });
    }

    // 排序
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'targetDate':
          comparison = a.targetDate.getTime() - b.targetDate.getTime();
          break;
        case 'status':
          comparison = Number(a.isCompleted) - Number(b.isCompleted);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [milestones, searchTerm, sortField, sortOrder, filterStatus]);

  // 优化的切换处理
  const handleMilestoneToggle = useCallback((milestoneId: string, isCompleted: boolean) => {
    onMilestoneToggle?.(milestoneId, isCompleted);
  }, [onMilestoneToggle]);

  // 优化的编辑处理
  const handleMilestoneEdit = useCallback((milestone: Milestone) => {
    onMilestoneEdit?.(milestone);
  }, [onMilestoneEdit]);

  // 排序切换
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // 获取状态统计
  const statusStats = useMemo(() => {
    const now = new Date();
    return {
      total: milestones.length,
      completed: milestones.filter(m => m.isCompleted).length,
      pending: milestones.filter(m => !m.isCompleted && m.targetDate >= now).length,
      overdue: milestones.filter(m => !m.isCompleted && m.targetDate < now).length
    };
  }, [milestones]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* 搜索和过滤控件 */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* 搜索框 */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索里程碑..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* 状态过滤 */}
        <div className="flex gap-2">
          {[
            { key: 'all', label: '全部', count: statusStats.total },
            { key: 'pending', label: '待完成', count: statusStats.pending },
            { key: 'completed', label: '已完成', count: statusStats.completed },
            { key: 'overdue', label: '已逾期', count: statusStats.overdue }
          ].map(({ key, label, count }) => (
            <Button
              key={key}
              variant={filterStatus === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus(key as FilterStatus)}
              className="flex items-center gap-1"
            >
              {label}
              <Badge variant="secondary" className="text-xs">
                {count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* 排序控件 */}
      <div className="flex gap-2">
        {[
          { key: 'targetDate', label: '按日期' },
          { key: 'title', label: '按标题' },
          { key: 'status', label: '按状态' }
        ].map(({ key, label }) => (
          <Button
            key={key}
            variant={sortField === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSort(key as SortField)}
            className="flex items-center gap-1"
          >
            {label}
            {sortField === key && (
              sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
            )}
          </Button>
        ))}
      </div>

      {/* 里程碑列表 */}
      <div 
        className="space-y-2 overflow-y-auto"
        style={{ maxHeight: `${maxHeight}px` }}
      >
        {filteredAndSortedMilestones.length > 0 ? (
          filteredAndSortedMilestones.map((milestone) => {
            const now = new Date();
            const isOverdue = !milestone.isCompleted && milestone.targetDate < now;
            const daysUntilDue = Math.ceil((milestone.targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            return (
              <Card
                key={milestone.id}
                className={cn(
                  "transition-all duration-200 hover:shadow-sm",
                  milestone.isCompleted && "bg-green-50 border-green-200",
                  isOverdue && "bg-red-50 border-red-200"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* 状态切换按钮 */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 flex-shrink-0 mt-1"
                      onClick={() => handleMilestoneToggle(milestone.id, !milestone.isCompleted)}
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
                          <h4 
                            className={cn(
                              "font-medium text-sm cursor-pointer hover:text-primary",
                              milestone.isCompleted && "line-through text-muted-foreground"
                            )}
                            onClick={() => handleMilestoneEdit(milestone)}
                          >
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

                        {/* 状态标签 */}
                        <div className="flex items-center gap-2">
                          {milestone.isCompleted && (
                            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 text-xs">
                              已完成
                            </Badge>
                          )}
                          {isOverdue && (
                            <Badge variant="destructive" className="text-xs">
                              逾期
                            </Badge>
                          )}
                          {!milestone.isCompleted && daysUntilDue === 0 && (
                            <Badge variant="default" className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
                              今天
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* 时间信息 */}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <div className={cn(
                          "flex items-center gap-1",
                          isOverdue && "text-red-600"
                        )}>
                          <Calendar className="h-3 w-3" />
                          <span>
                            {format(milestone.targetDate, 'MM/dd', { locale: zhCN })}
                          </span>
                        </div>

                        {milestone.dayRange && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{milestone.dayRange}</span>
                          </div>
                        )}

                        {/* 时间状态 */}
                        <div className={cn(
                          isOverdue && "text-red-600",
                          daysUntilDue === 0 && "text-orange-600"
                        )}>
                          {milestone.isCompleted ? (
                            milestone.completedDate && (
                              <span>
                                {format(milestone.completedDate, 'MM/dd HH:mm', { locale: zhCN })} 完成
                              </span>
                            )
                          ) : isOverdue ? (
                            <span>逾期 {Math.abs(daysUntilDue)} 天</span>
                          ) : daysUntilDue === 0 ? (
                            <span>今天截止</span>
                          ) : daysUntilDue === 1 ? (
                            <span>明天截止</span>
                          ) : daysUntilDue > 0 ? (
                            <span>还有 {daysUntilDue} 天</span>
                          ) : (
                            <span>{Math.abs(daysUntilDue)} 天前</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm || filterStatus !== 'all' ? (
              <div>
                <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>没有找到匹配的里程碑</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                  }}
                  className="mt-2"
                >
                  清除筛选
                </Button>
              </div>
            ) : (
              <div>
                <Circle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>暂无里程碑</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 性能信息（开发模式） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-muted-foreground border-t pt-2">
          显示 {filteredAndSortedMilestones.length} / {milestones.length} 个里程碑
        </div>
      )}
    </div>
  );
}
