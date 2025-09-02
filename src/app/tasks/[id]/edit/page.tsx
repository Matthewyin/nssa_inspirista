'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-tasks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { TaskEditForm } from '@/components/tasks/task-edit-form';
import type { Task } from '@/lib/types/tasks';

export default function TaskEditPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { getTask, updateTask } = useTasks();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 获取任务数据
  useEffect(() => {
    const fetchTask = async () => {
      if (!params.id || typeof params.id !== 'string') return;

      try {
        const taskData = await getTask(params.id);
        if (taskData) {
          setTask(taskData);
        }
      } catch (error) {
        console.error('获取任务失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [params.id, getTask]);

  // 处理保存
  const handleSave = async (taskData: Partial<Task>) => {
    if (!task) return;

    setSaving(true);
    try {
      await updateTask(task.id, taskData);
      router.push(`/tasks/${task.id}`);
    } catch (error) {
      console.error('更新任务失败:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  // 处理取消
  const handleCancel = () => {
    router.push(`/tasks/${task.id}`);
  };



  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">加载中...</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">任务不存在</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 头部导航 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/tasks/${task.id}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
          <div>
            <h1 className="text-2xl font-bold">编辑任务</h1>
            <p className="text-muted-foreground">{task.title}</p>
          </div>
        </div>
      </div>

      {/* 编辑表单 */}
      <Card>
        <CardHeader>
          <CardTitle>任务信息</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskEditForm
            task={task}
            onSave={handleSave}
            onCancel={handleCancel}
            loading={saving}
          />
        </CardContent>
      </Card>
    </div>
  );
}
