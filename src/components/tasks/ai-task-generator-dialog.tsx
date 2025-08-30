'use client';

import { useState } from 'react';
import { useAITaskGenerator } from '@/hooks/use-tasks';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles,
  Loader2,
  CheckCircle2,
  Clock,
  Target,
  Calendar,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TaskPlan } from '@/lib/types/tasks';

interface AITaskGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AITaskGeneratorDialog({ open, onOpenChange }: AITaskGeneratorDialogProps) {
  const { isGenerating, generateTaskPlan, createAITask } = useAITaskGenerator();
  const [step, setStep] = useState<'input' | 'preview' | 'created'>('input');
  const [prompt, setPrompt] = useState('');
  const [timeframe, setTimeframe] = useState(7);
  const [generatedPlan, setGeneratedPlan] = useState<TaskPlan | null>(null);

  // 示例提示词
  const examplePrompts = [
    '准备英语四级考试',
    '学习React框架开发',
    '完成毕业论文写作',
    '制定健身减肥计划',
    '准备求职面试',
    '学习Python编程'
  ];

  // 重置对话框状态
  const resetDialog = () => {
    setStep('input');
    setPrompt('');
    setTimeframe(7);
    setGeneratedPlan(null);
  };

  // 生成任务计划
  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    const plan = await generateTaskPlan(prompt.trim(), timeframe);
    if (plan) {
      setGeneratedPlan(plan);
      setStep('preview');
    }
  };

  // 创建任务
  const handleCreateTask = async () => {
    if (!generatedPlan) return;

    const taskId = await createAITask(generatedPlan);
    if (taskId) {
      setStep('created');
      setTimeout(() => {
        resetDialog();
        onOpenChange(false);
      }, 2000);
    }
  };

  // 重新生成
  const handleRegenerate = () => {
    setStep('input');
    setGeneratedPlan(null);
  };

  // 关闭对话框
  const handleClose = () => {
    resetDialog();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        {step === 'input' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                AI 任务规划助手
              </DialogTitle>
              <DialogDescription>
                描述您的目标，AI将为您生成详细的任务计划和时间安排
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* 目标描述 */}
              <div className="space-y-2">
                <Label htmlFor="prompt">描述您的目标 *</Label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="例如：准备英语四级考试、学习React框架、完成毕业论文..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* 示例提示词 */}
              <div className="space-y-2">
                <Label>快速选择</Label>
                <div className="flex flex-wrap gap-2">
                  {examplePrompts.map((example, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setPrompt(example)}
                      className="text-xs"
                    >
                      {example}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 时间范围 */}
              <div className="space-y-4">
                <Label>时间范围（天）</Label>
                <div className="space-y-2">
                  <Slider
                    value={[timeframe]}
                    onValueChange={(value) => setTimeframe(value[0])}
                    min={3}
                    max={30}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>3天</span>
                    <span className="font-medium text-foreground">{timeframe} 天</span>
                    <span>30天</span>
                  </div>
                </div>
              </div>

              {/* AI提示 */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-purple-900 mb-1">AI 智能建议</h4>
                    <p className="text-sm text-purple-700">
                      为了获得更好的规划效果，请尽量详细描述您的目标。
                      AI会根据您的描述生成具体的任务分解、时间安排和优先级建议。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                取消
              </Button>
              <Button 
                onClick={handleGenerate} 
                disabled={!prompt.trim() || isGenerating}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    AI正在生成...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    生成任务计划
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'preview' && generatedPlan && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                AI 生成的任务计划
              </DialogTitle>
              <DialogDescription>
                请查看AI为您生成的任务计划，确认后即可创建
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* 任务概览 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{generatedPlan.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{generatedPlan.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>截止：{generatedPlan.dueDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span>预估：{generatedPlan.estimatedHours}小时</span>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {generatedPlan.priority}优先级
                    </Badge>
                    <Badge variant="secondary" className="capitalize">
                      {generatedPlan.category}
                    </Badge>
                  </div>

                  {generatedPlan.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {generatedPlan.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 子任务列表 */}
              {generatedPlan.subtasks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      子任务分解 ({generatedPlan.subtasks.length}个)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {generatedPlan.subtasks.map((subtask, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{subtask.title}</h4>
                            {subtask.estimatedMinutes && (
                              <p className="text-sm text-muted-foreground">
                                预估时间：{subtask.estimatedMinutes}分钟
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleRegenerate}>
                <RefreshCw className="mr-2 h-4 w-4" />
                重新生成
              </Button>
              <Button onClick={handleCreateTask}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                创建任务
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'created' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                任务创建成功！
              </DialogTitle>
            </DialogHeader>

            <div className="text-center py-8">
              <div className="mb-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h3 className="text-lg font-medium mb-2">AI任务已创建</h3>
              <p className="text-muted-foreground">
                您的任务计划已成功创建，现在可以开始执行了！
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
