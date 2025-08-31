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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  Sparkles, 
  Loader2, 
  Wand2, 
  CheckCircle2,
  Info,
  FileText,
  Lightbulb
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
  
  // 表单状态
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  
  // AI生成状态
  const [isAIMode, setIsAIMode] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<TaskPlan | null>(null);
  const [originalDescription, setOriginalDescription] = useState('');
  
  // 选项卡状态
  const [activeTab, setActiveTab] = useState('basic');

  // 重置表单
  const resetForm = () => {
    setFormData({ title: '', description: '' });
    setIsAIMode(false);
    setGeneratedPlan(null);
    setOriginalDescription('');
    setActiveTab('basic');
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
    if (!apiKey) return;

    setOriginalDescription(formData.description);
    setIsAIMode(true);

    try {
      const plan = await generateTaskPlan(formData.description.trim(), aiConfig, apiKey);
      if (plan) {
        setGeneratedPlan(plan);
        setFormData(prev => ({
          ...prev,
          description: plan.description
        }));
      }
    } catch (error) {
      console.error('AI生成失败:', error);
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

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) return;

    setLoading(true);
    try {
      const taskData: TaskCreateInput = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        tags: generatedPlan?.tags || [],
        isAIGenerated: !!generatedPlan,
        aiPrompt: isAIMode ? originalDescription : undefined,
        milestones: generatedPlan?.milestones || undefined,
      };

      if (generatedPlan) {
        await createAITask(generatedPlan);
      } else {
        await createTask(taskData);
      }

      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('创建任务失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-background border-border">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Wand2 className="w-5 h-5 text-primary" />
            创建新任务
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            创建一个新的任务。您可以手动填写，也可以使用AI生成任务计划。
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted">
            <TabsTrigger 
              value="basic" 
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground"
            >
              <FileText className="w-4 h-4" />
              基础信息
            </TabsTrigger>
            <TabsTrigger 
              value="advanced" 
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground"
            >
              <Lightbulb className="w-4 h-4" />
              AI助手
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="basic" className="space-y-6 mt-0">
              {/* 任务标题 */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-foreground">任务标题 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="输入任务标题..."
                  required
                  className="bg-background border-input text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* 任务描述 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description" className="text-foreground">任务描述</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('advanced')}
                    className="text-xs bg-background border-input text-foreground hover:bg-accent"
                  >
                    <Sparkles className="mr-1 h-3 w-3" />
                    使用AI生成
                  </Button>
                </div>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="详细描述任务内容和要求..."
                  rows={4}
                  className="bg-background border-input text-foreground placeholder:text-muted-foreground"
                />
                <div className="text-xs text-muted-foreground">
                  💡 提示：包含时间范围（如"3天内"、"7天内"）可获得更好的AI规划效果
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6 mt-0">
              {/* AI配置选择 */}
              <div className="space-y-3 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <Label className="text-sm font-medium text-purple-800 dark:text-purple-200">AI助手配置</Label>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {/* AI提供商选择 */}
                  <div className="space-y-1">
                    <Label className="text-xs text-purple-700 dark:text-purple-300">AI提供商</Label>
                    <Select
                      value={aiConfig.provider}
                      onValueChange={(value: AiProvider) => {
                        const newProvider = value;
                        const defaultModel = AI_PROVIDERS.find(p => p.value === newProvider)?.models[0] || 'gemini-2.5-flash';
                        setAiConfig({ provider: newProvider, model: defaultModel });
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs bg-background border-input">
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
                    <Label className="text-xs text-purple-700 dark:text-purple-300">模型</Label>
                    <Select
                      value={aiConfig.model}
                      onValueChange={(value: AiModel) => {
                        setAiConfig(prev => ({ ...prev, model: value }));
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs bg-background border-input">
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
                        <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
                        <span className="text-green-700 dark:text-green-300">API密钥已配置</span>
                      </>
                    ) : (
                      <>
                        <Info className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                        <span className="text-orange-700 dark:text-orange-300">需要配置API密钥</span>
                      </>
                    )}
                  </div>
                  
                  {!getCurrentApiKey() && (
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                      onClick={() => window.open('/settings', '_blank')}
                    >
                      前往设置
                    </Button>
                  )}
                </div>
              </div>

              {/* AI生成任务描述 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="ai-description" className="text-foreground">AI生成任务描述</Label>
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
                  id="ai-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="详细描述任务内容和要求...&#10;&#10;💡 提示：包含时间范围可获得更好的AI规划效果&#10;例如：&quot;3天内学会OSPF路由协议&quot;、&quot;7天内完成React项目开发&quot;"
                  rows={6}
                  className="resize-none bg-background border-input text-foreground placeholder:text-muted-foreground"
                />

                {/* AI生成状态提示 */}
                {isAIMode && generatedPlan && (
                  <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      AI已生成任务计划！内容已更新到描述框中，您可以继续编辑。
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={handleRestoreOriginal}
                        className="p-0 h-auto ml-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                      >
                        恢复原始内容
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* 输入格式提示 */}
              <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  <strong>💡 获得更好AI规划效果的技巧：</strong>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• 包含时间范围：如"3天内学会OSPF"、"7天内完成项目"</li>
                    <li>• 具体描述目标：说明您想要达到的具体效果</li>
                    <li>• 如果不指定天数，AI将默认制定7天计划</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="border-t border-border pt-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
            className="bg-background border-input text-foreground hover:bg-accent"
          >
            取消
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !formData.title.trim() || !formData.description.trim()}
            className={generatedPlan ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" : "bg-primary text-primary-foreground hover:bg-primary/90"}
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
      </DialogContent>
    </Dialog>
  );
}
