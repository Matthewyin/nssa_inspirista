'use client';

import { useState, useEffect } from 'react';
import { useTasks, useAITaskGenerator } from '@/hooks/use-tasks';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task, TaskStatus, TaskPriority, TaskPlan, AiConfig } from '@/lib/types/tasks';

interface TaskEditFormProps {
  task?: Task | null;
  onSave: (taskData: Partial<Task>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function TaskEditForm({ task, onSave, onCancel, loading = false }: TaskEditFormProps) {
  const { updateTask } = useTasks();
  const { generateTaskPlan } = useAITaskGenerator();
  const { toast } = useToast();
  
  // AI配置状态
  const [geminiApiKey] = useLocalStorage<string | null>('gemini-api-key', null);
  const [deepseekApiKey] = useLocalStorage<string | null>('deepseek-api-key', null);
  const [aiConfig] = useLocalStorage<AiConfig>('ai-config', {
    provider: 'gemini',
    model: 'gemini-2.5-flash',
  });

  // 表单状态
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo' as TaskStatus,
    priority: 'medium' as TaskPriority,
    category: 'personal',
    estimatedHours: 0,
    tags: [] as string[],
  });

  // AI 相关状态
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAIMode, setIsAIMode] = useState(false);
  const [originalDescription, setOriginalDescription] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState<TaskPlan | null>(null);
  const [newTag, setNewTag] = useState('');

  // 初始化表单数据（只在组件首次加载时执行）
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        category: task.category || 'personal',
        estimatedHours: task.estimatedHours || 0,
        tags: task.tags || [],
      });
      // 重置AI状态
      setIsAIMode(false);
      setOriginalDescription('');
      setGeneratedPlan(null);
    }
  }, [task?.id]); // 只在任务ID变化时重新初始化

  // 获取当前可用的API密钥
  const getCurrentApiKey = (): string | null => {
    if (aiConfig.provider === 'gemini') {
      return geminiApiKey;
    } else if (aiConfig.provider === 'deepseek') {
      return deepseekApiKey;
    }
    return null;
  };

  // 检查是否可以使用AI
  const canUseAI = (): boolean => {
    const apiKey = getCurrentApiKey();
    return !!apiKey && !!formData.description.trim();
  };

  // AI生成任务计划
  const handleAIGenerate = async () => {
    if (!canUseAI()) {
      const apiKey = getCurrentApiKey();
      if (!apiKey) {
        toast({
          variant: 'destructive',
          title: 'API密钥未配置',
          description: '请先在设置页面配置AI服务的API密钥',
        });
        return;
      }
      
      if (!formData.description.trim()) {
        toast({
          variant: 'destructive',
          title: '任务描述为空',
          description: '请先输入任务描述，然后再使用AI优化',
        });
        return;
      }
      return;
    }

    const apiKey = getCurrentApiKey();
    if (!apiKey) return;

    setOriginalDescription(formData.description);
    setIsGenerating(true);

    toast({
      title: 'AI优化中',
      description: `正在使用 ${aiConfig.provider === 'gemini' ? 'Gemini' : 'DeepSeek'} 优化任务描述...`,
    });

    try {
      const plan = await generateTaskPlan(formData.description.trim(), aiConfig, apiKey);
      if (plan) {
        setGeneratedPlan(plan);
        setFormData(prev => ({
          ...prev,
          description: plan.description,
          tags: [...new Set([...prev.tags, ...plan.tags])] // 合并标签，去重
        }));
        setIsAIMode(true);
        
        toast({
          title: 'AI优化成功',
          description: '任务描述已通过AI优化，您可以继续编辑或恢复原始内容',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'AI优化失败',
          description: 'AI生成失败，请检查网络连接或稍后重试',
        });
      }
    } catch (error) {
      console.error('AI生成失败:', error);
      toast({
        variant: 'destructive',
        title: 'AI优化失败',
        description: error instanceof Error ? error.message : 'AI优化过程中出现错误，请稍后重试',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // 恢复原始描述
  const handleRestoreOriginal = () => {
    setFormData(prev => ({
      ...prev,
      description: originalDescription
    }));
    setIsAIMode(false);
    setGeneratedPlan(null);
  };

  // 添加标签
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  // 删除标签
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast({
        variant: 'destructive',
        title: '标题不能为空',
        description: '请输入任务标题',
      });
      return;
    }

    try {
      // 只发送实际需要更新的字段，避免发送不必要的字段
      const updateData: Partial<Task> = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
      };

      // 只在有值时添加可选字段
      if (formData.priority) {
        updateData.priority = formData.priority;
      }

      if (formData.category && formData.category.trim()) {
        updateData.category = formData.category.trim();
      }

      if (formData.estimatedHours && formData.estimatedHours > 0) {
        updateData.estimatedHours = formData.estimatedHours;
      }

      if (formData.tags && formData.tags.length > 0) {
        updateData.tags = formData.tags;
      }

      // 如果使用了AI优化并且有生成的计划，包含里程碑信息
      if (generatedPlan) {
        updateData.milestones = generatedPlan.milestones;
        updateData.isAIGenerated = true;
        if (originalDescription) {
          updateData.aiPrompt = originalDescription;
        }
      }

      // 调试：打印要发送的数据
      console.log('📤 TaskEditForm 准备发送的更新数据:', updateData);
      console.log('📋 原始表单数据:', formData);

      await onSave(updateData);
      toast({
        title: '保存成功',
        description: generatedPlan ? '任务已成功更新，包含AI生成的里程碑' : '任务已成功更新',
      });
    } catch (error) {
      console.error('保存任务失败:', error);
      toast({
        variant: 'destructive',
        title: '保存失败',
        description: '保存任务时出现错误，请稍后重试',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 任务标题 */}
      <div>
        <Label htmlFor="title">任务标题 *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="输入任务标题"
          className="mt-1"
          required
        />
      </div>

      {/* 任务描述 */}
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="description">任务描述</Label>
          {!isAIMode && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAIGenerate}
              disabled={!canUseAI() || isGenerating}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  AI生成中...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  使用 {aiConfig.provider === 'gemini' ? 'Gemini' : 'DeepSeek'} 优化
                </>
              )}
            </Button>
          )}
        </div>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="输入任务描述"
          rows={4}
          className="mt-1"
        />
        
        {/* AI模式提示 */}
        {isAIMode && (
          <div className="mt-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
                <Badge variant="outline" className="border-purple-200 text-purple-600">
                  AI优化
                </Badge>
                <span>任务描述已通过AI优化</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRestoreOriginal}
                className="text-purple-600 hover:text-purple-700"
              >
                恢复原始
              </Button>
            </div>
          </div>
        )}
        
        {/* API密钥状态提示 */}
        {!getCurrentApiKey() && (
          <div className="mt-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-orange-700 dark:text-orange-300">
                <Badge variant="outline" className="border-orange-200 text-orange-600">
                  需要配置
                </Badge>
                <span>需要配置 {aiConfig.provider === 'gemini' ? 'Gemini' : 'DeepSeek'} API密钥才能使用AI功能</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => window.open('/settings', '_blank')}
                className="text-orange-600 hover:text-orange-700"
              >
                前往设置
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 状态、优先级、预估时长 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="status">状态</Label>
          <Select value={formData.status} onValueChange={(value: TaskStatus) => setFormData(prev => ({ ...prev, status: value }))}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">待办</SelectItem>
              <SelectItem value="in_progress">进行中</SelectItem>
              <SelectItem value="completed">已完成</SelectItem>
              <SelectItem value="cancelled">已取消</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="priority">优先级</Label>
          <Select value={formData.priority} onValueChange={(value: TaskPriority) => setFormData(prev => ({ ...prev, priority: value }))}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">低</SelectItem>
              <SelectItem value="medium">中</SelectItem>
              <SelectItem value="high">高</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="estimatedHours">预估时长 (小时)</Label>
          <Input
            id="estimatedHours"
            type="number"
            min="0"
            step="0.5"
            value={formData.estimatedHours}
            onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 0 }))}
            className="mt-1"
          />
        </div>
      </div>

      {/* 分类 */}
      <div>
        <Label htmlFor="category">分类</Label>
        <Input
          id="category"
          value={formData.category}
          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
          placeholder="输入任务分类"
          className="mt-1"
        />
      </div>

      {/* 标签 */}
      <div>
        <Label>标签</Label>
        <div className="mt-1 space-y-2">
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="添加标签..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button type="button" variant="outline" onClick={addTag}>
              添加
            </Button>
          </div>
          
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => removeTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? '保存中...' : '保存更改'}
        </Button>
      </div>
    </form>
  );
}
