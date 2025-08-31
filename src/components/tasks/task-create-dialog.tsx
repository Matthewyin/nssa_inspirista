'use client';

import { useState } from 'react';
import { useTasks, useAITaskGenerator } from '@/hooks/use-tasks';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Sparkles,
  Loader2,
  Wand2,
  CheckCircle2,
  Info
} from 'lucide-react';
import type { TaskCreateInput, TaskPlan } from '@/lib/types/tasks';

interface TaskCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskCreateDialog({ open, onOpenChange }: TaskCreateDialogProps) {
  const { createTask } = useTasks();
  const { isGenerating, generateTaskPlan, createAITask } = useAITaskGenerator();
  const [loading, setLoading] = useState(false);

  // 表单状态 - 简化为只有标题和描述
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });

  // AI生成状态
  const [isAIMode, setIsAIMode] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<TaskPlan | null>(null);
  const [originalDescription, setOriginalDescription] = useState('');

  // 重置表单
  const resetForm = () => {
    setFormData({
      title: '',
      description: ''
    });
    setIsAIMode(false);
    setGeneratedPlan(null);
    setOriginalDescription('');
  };

  // AI生成任务计划
  const handleAIGenerate = async () => {
    if (!formData.description.trim()) return;

    // 保存原始描述
    setOriginalDescription(formData.description);
    setIsAIMode(true);

    const plan = await generateTaskPlan(formData.description.trim());
    if (plan) {
      setGeneratedPlan(plan);
      // 将AI生成的内容替换到描述框中
      setFormData(prev => ({
        ...prev,
        description: plan.description
      }));
    }
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      return;
    }

    setLoading(true);
    try {
      if (generatedPlan) {
        // 创建AI生成的任务
        await createAITask(generatedPlan);
      } else {
        // 创建普通任务
        const taskInput: TaskCreateInput = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          isAIGenerated: false
        };
        await createTask(taskInput);
      }

      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setLoading(false);
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



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>创建一个新的任务来管理您的目标和计划</DialogTitle>
          <DialogDescription>
            只需填写标题和描述，可以使用AI生成详细的任务计划
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 任务标题 */}
          <div className="space-y-2">
            <Label htmlFor="title">任务标题 *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="输入任务标题..."
              required
            />
          </div>

          {/* 任务描述 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">任务描述</Label>
              {!isAIMode && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAIGenerate}
                  disabled={!formData.description.trim() || isGenerating}
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
                      AI生成计划
                    </>
                  )}
                </Button>
              )}
            </div>

            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="详细描述任务内容和要求...&#10;&#10;💡 提示：包含时间范围可获得更好的AI规划效果&#10;例如：&quot;3天内学会OSPF路由协议&quot;、&quot;7天内完成React项目开发&quot;"
              rows={6}
              className="resize-none"
            />

            {/* AI生成状态提示 */}
            {isAIMode && generatedPlan && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  AI已生成任务计划！内容已更新到描述框中，您可以继续编辑。
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={handleRestoreOriginal}
                    className="p-0 h-auto ml-2 text-green-600 hover:text-green-700"
                  >
                    恢复原始内容
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* 输入格式提示 */}
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>💡 获得更好AI规划效果的技巧：</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• 包含时间范围：如"3天内学会OSPF"、"7天内完成项目"</li>
                <li>• 具体描述目标：说明您想要达到的具体效果</li>
                <li>• 如果不指定天数，AI将默认制定7天计划</li>
              </ul>
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              disabled={loading}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.title.trim() || !formData.description.trim()}
              className={generatedPlan ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" : ""}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {generatedPlan ? (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  创建AI任务
                </>
              ) : (
                "创建任务"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
