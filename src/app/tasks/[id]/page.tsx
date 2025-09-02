'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-tasks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Clock,
  User,
  Tag,
  FileText,
  Target,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { safeToDate, safeFormatDate } from '@/lib/utils/date-utils';
import { TaskDetailView } from '@/components/tasks/task-detail-view';
import { MilestoneManager } from '@/components/tasks/milestone-manager';
import { MilestoneTimeline } from '@/components/tasks/milestone-timeline';
import { TaskStatusVisualization } from '@/components/tasks/task-status-visualization';
import type { Task, Milestone } from '@/lib/types/tasks';

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const {
    updateTaskStatus,
    updateMilestoneStatus,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    deleteTask,
    batchUpdateMilestoneStatus,
    batchDeleteMilestones
  } = useTasks();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'timeline'>('overview');

  const taskId = params.id as string;

  // 监听任务数据变化
  useEffect(() => {
    if (!user || !taskId) return;

    const taskRef = doc(db, 'tasks', taskId);
    const unsubscribe = onSnapshot(
      taskRef,
      (doc) => {
        if (doc.exists()) {
          const taskData = doc.data() as Task;
          // 验证任务属于当前用户
          if (taskData.userId === user.uid) {
            setTask({ ...taskData, id: doc.id });
          } else {
            setError('无权访问此任务');
          }
        } else {
          setError('任务不存在');
        }
        setLoading(false);
      },
      (error) => {
        console.error('获取任务详情失败:', error);
        setError('获取任务详情失败');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, taskId]);

  // 处理任务状态变更
  const handleStatusChange = async (status: Task['status']) => {
    if (!task) return;
    try {
      await updateTaskStatus(task.id, status);
    } catch (error) {
      console.error('更新任务状态失败:', error);
    }
  };

  // 处理里程碑切换
  const handleMilestoneToggle = async (milestoneId: string, isCompleted: boolean) => {
    if (!task) return;
    try {
      await updateMilestoneStatus(task.id, milestoneId, isCompleted);
    } catch (error) {
      console.error('更新里程碑状态失败:', error);
    }
  };

  // 处理添加里程碑
  const handleAddMilestone = async (milestone: Omit<Milestone, 'id' | 'isCompleted'>) => {
    if (!task) return;
    try {
      await addMilestone(task.id, milestone);
    } catch (error) {
      console.error('添加里程碑失败:', error);
    }
  };

  // 处理更新里程碑
  const handleUpdateMilestone = async (milestoneId: string, updates: Partial<Milestone>) => {
    if (!task) return;
    try {
      await updateMilestone(task.id, milestoneId, updates);
    } catch (error) {
      console.error('更新里程碑失败:', error);
    }
  };

  // 处理删除里程碑
  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!task) return;
    try {
      await deleteMilestone(task.id, milestoneId);
    } catch (error) {
      console.error('删除里程碑失败:', error);
    }
  };

  // 处理删除任务
  const handleDeleteTask = async () => {
    if (!task) return;

    const confirmed = window.confirm('确定要删除这个任务吗？此操作无法撤销。');
    if (!confirmed) return;

    try {
      await deleteTask(task.id);
      router.push('/tasks');
    } catch (error) {
      console.error('删除任务失败:', error);
      alert('删除任务失败，请重试。');
    }
  };

  // 处理批量操作
  const handleBatchMilestoneToggle = async (milestoneIds: string[], isCompleted: boolean) => {
    if (!task) return;
    try {
      await batchUpdateMilestoneStatus(task.id, milestoneIds, isCompleted);
    } catch (error) {
      console.error('批量更新里程碑失败:', error);
    }
  };

  const handleBatchMilestoneDelete = async (milestoneIds: string[]) => {
    if (!task) return;
    try {
      await batchDeleteMilestones(task.id, milestoneIds);
    } catch (error) {
      console.error('批量删除里程碑失败:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">加载任务详情...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || '任务不存在'}</p>
            <Button onClick={() => router.push('/tasks')}>
              返回任务列表
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* 头部导航 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/tasks')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{task.title}</h1>
            <p className="text-muted-foreground">
              创建于 {safeFormatDate(safeToDate(task.createdAt), 'yyyy年MM月dd日') || '无效日期'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/tasks/${task.id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-1" />
            编辑
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteTask()}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            删除
          </Button>
        </div>
      </div>

      {/* 标签页导航 */}
      <div className="flex items-center gap-1 mb-6 border-b">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('overview')}
          className="rounded-b-none"
        >
          <TrendingUp className="h-4 w-4 mr-1" />
          概览
        </Button>
        <Button
          variant={activeTab === 'milestones' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('milestones')}
          className="rounded-b-none"
        >
          <Target className="h-4 w-4 mr-1" />
          里程碑管理
        </Button>
        <Button
          variant={activeTab === 'timeline' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('timeline')}
          className="rounded-b-none"
        >
          <Calendar className="h-4 w-4 mr-1" />
          时间线
        </Button>
      </div>

      {/* 内容区域 */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧：任务详情 */}
            <div className="lg:col-span-2">
              <TaskDetailView
                task={task}
                onStatusChange={handleStatusChange}
                onMilestoneToggle={handleMilestoneToggle}
              />
            </div>
            
            {/* 右侧：状态可视化 */}
            <div>
              <TaskStatusVisualization task={task} />
            </div>
          </div>
        )}

        {activeTab === 'milestones' && (
          <MilestoneManager
            milestones={task.milestones || []}
            onMilestoneAdd={handleAddMilestone}
            onMilestoneUpdate={handleUpdateMilestone}
            onMilestoneDelete={handleDeleteMilestone}
            onMilestoneToggle={handleMilestoneToggle}
          />
        )}

        {activeTab === 'timeline' && (
          <MilestoneTimeline
            milestones={task.milestones || []}
            onMilestoneToggle={handleMilestoneToggle}
          />
        )}
      </div>
    </div>
  );
}
