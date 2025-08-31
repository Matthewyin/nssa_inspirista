'use client';

import { useState } from 'react';
import { useAITaskGenerator } from '@/hooks/use-tasks';
import { useLanguage } from '@/hooks/use-language';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  Clock,
  Target,
  Calendar,
  RefreshCw,
  MapPin,
  Flag
} from 'lucide-react';
import type { TaskPlan } from '@/lib/types/tasks';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface AITaskGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AITaskGeneratorDialog({ open, onOpenChange }: AITaskGeneratorDialogProps) {
  const { isGenerating, generateTaskPlan, createAITask } = useAITaskGenerator();
  const { t } = useLanguage();
  const [step, setStep] = useState<'input' | 'preview' | 'created'>('input');
  const [prompt, setPrompt] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState<TaskPlan | null>(null);

  // 示例提示词（包含时间范围）
  const examplePrompts = [
    '3天内学会OSPF路由协议',
    '7天内完成React项目开发',
    '14天内准备期末考试',
    '5天内学会Python基础',
    '10天内完成毕业论文初稿',
    '21天内养成健身习惯'
  ];

  // 重置对话框状态
  const resetDialog = () => {
    setStep('input');
    setPrompt('');
    setGeneratedPlan(null);
  };

  // 生成任务计划
  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    const plan = await generateTaskPlan(prompt.trim());
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
      <DialogContent
        className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {step === 'input' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                {t('tasks.ai.title')}
              </DialogTitle>
              <DialogDescription>
                {t('tasks.ai.description')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* 目标描述 */}
              <div className="space-y-2">
                <Label htmlFor="prompt">{t('tasks.ai.fields.goal')} *</Label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={t('tasks.ai.fields.goalPlaceholder')}
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* 示例提示词 */}
              <div className="space-y-2">
                <Label>{t('tasks.ai.fields.quickSelect')}</Label>
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

              {/* AI智能提示 */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">{t('tasks.ai.smartTip.title')}</h4>
                    <p className="text-sm text-blue-700">{t('tasks.ai.smartTip.description')}</p>
                  </div>
                </div>
              </div>

              {/* AI提示 */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-purple-900 mb-1">{t('tasks.ai.tip.title')}</h4>
                    <p className="text-sm text-purple-700">
                      {t('tasks.ai.tip.description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                {t('tasks.ai.buttons.cancel')}
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('tasks.ai.buttons.generating')}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {t('tasks.ai.buttons.generate')}
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
                {t('tasks.ai.preview.title')}
              </DialogTitle>
              <DialogDescription>
                {t('tasks.ai.preview.description')}
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
                      <span>{t('tasks.ai.preview.timeframe')}: {generatedPlan.timeframeDays} {t('tasks.ai.preview.days')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-green-600" />
                      <span>{t('tasks.ai.preview.milestones')}: {generatedPlan.milestones.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      <span>{t('tasks.ai.preview.aiGenerated')}</span>
                    </div>
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

              {/* 里程碑列表 */}
              {generatedPlan.milestones.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Flag className="h-5 w-5 text-green-600" />
                      {t('tasks.ai.preview.milestones')} ({generatedPlan.milestones.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {generatedPlan.milestones.map((milestone, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{milestone.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{format(milestone.targetDate, 'MM/dd', { locale: zhCN })}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{milestone.dayRange}</span>
                              </div>
                            </div>
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
                {t('tasks.ai.buttons.regenerate')}
              </Button>
              <Button onClick={handleCreateTask}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {t('tasks.ai.buttons.createTask')}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'created' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                {t('tasks.ai.success.title')}
              </DialogTitle>
            </DialogHeader>

            <div className="text-center py-8">
              <div className="mb-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h3 className="text-lg font-medium mb-2">{t('tasks.ai.success.subtitle')}</h3>
              <p className="text-muted-foreground">
                {t('tasks.ai.success.description')}
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
