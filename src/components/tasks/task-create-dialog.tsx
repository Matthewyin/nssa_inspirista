'use client';

import { useState } from 'react';
import { useTasks, useAITaskGenerator } from '@/hooks/use-tasks';
import { useLocalStorage } from '@/hooks/use-local-storage';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sparkles,
  Loader2,
  Wand2,
  CheckCircle2,
  Info
} from 'lucide-react';
import type { TaskCreateInput, TaskPlan } from '@/lib/types/tasks';
import type { AiProvider, AiModel, AiConfig } from '@/lib/types';

interface TaskCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// AI提供商配置
const AI_PROVIDERS: {
  value: AiProvider;
  label: string;
  models: AiModel[];
}[] = [
  {
    value: 'gemini',
    label: 'Google Gemini',
    models: ['gemini-2.5-flash', 'gemini-2.5-pro'],
  },
  {
    value: 'deepseek',
    label: 'DeepSeek',
    models: ['deepseek-chat', 'deepseek-coder'],
  },
];

export function TaskCreateDialog({ open, onOpenChange }: TaskCreateDialogProps) {
  const { createTask } = useTasks();
  const { isGenerating, generateTaskPlan, createAITask } = useAITaskGenerator();
  const [loading, setLoading] = useState(false);

  // AI配置状态
  const [geminiApiKey] = useLocalStorage<string | null>('gemini-api-key', null);
  const [deepseekApiKey] = useLocalStorage<string | null>('deepseek-api-key', null);
  const [aiConfig, setAiConfig] = useLocalStorage<AiConfig>('ai-config', {
    provider: 'gemini',
    model: 'gemini-2.5-flash',
  });

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
    if (!canUseAI()) return;

    const apiKey = getCurrentApiKey();
    if (!apiKey) {
      // TODO: 显示需要配置API密钥的提示
      return;
    }

    // 保存原始描述
    setOriginalDescription(formData.description);
    setIsAIMode(true);

    try {
      // 使用真正的AI生成
      const plan = await generateTaskPlan(formData.description.trim(), aiConfig, apiKey);
      if (plan) {
        setGeneratedPlan(plan);
        // 将AI生成的内容替换到描述框中
        setFormData(prev => ({
          ...prev,
          description: plan.description
        }));
      }
    } catch (error) {
      console.error('AI生成失败:', error);
      // TODO: 显示错误提示
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

          {/* AI配置选择 */}
          <div className="space-y-3 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <Label className="text-sm font-medium text-purple-800">AI助手配置</Label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* AI提供商选择 */}
              <div className="space-y-1">
                <Label className="text-xs text-purple-700">AI提供商</Label>
                <Select
                  value={aiConfig.provider}
                  onValueChange={(value: AiProvider) => {
                    const newProvider = value;
                    const defaultModel = AI_PROVIDERS.find(p => p.value === newProvider)?.models[0] || 'gemini-2.5-flash';
                    setAiConfig({ provider: newProvider, model: defaultModel });
                  }}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_PROVIDERS.map((provider) => (
                      <SelectItem key={provider.value} value={provider.value}>
                        {provider.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* AI模型选择 */}
              <div className="space-y-1">
                <Label className="text-xs text-purple-700">模型</Label>
                <Select
                  value={aiConfig.model}
                  onValueChange={(value: AiModel) => {
                    setAiConfig(prev => ({ ...prev, model: value }));
                  }}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_PROVIDERS.find(p => p.value === aiConfig.provider)?.models.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* API密钥状态 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                {getCurrentApiKey() ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    <span className="text-green-700">API密钥已配置</span>
                  </>
                ) : (
                  <>
                    <Info className="h-3 w-3 text-orange-600" />
                    <span className="text-orange-700">需要配置API密钥</span>
                  </>
                )}
              </div>

              {!getCurrentApiKey() && (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs text-purple-600 hover:text-purple-700"
                  onClick={() => window.open('/settings', '_blank')}
                >
                  前往设置
                </Button>
              )}
            </div>
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
                      使用 {aiConfig.provider === 'gemini' ? 'Gemini' : 'DeepSeek'} 生成
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
