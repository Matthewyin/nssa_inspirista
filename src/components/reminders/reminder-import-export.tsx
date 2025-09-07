'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { 
  Download, 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Copy,
  FileDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WebhookReminder, ReminderExportData } from '@/lib/types/reminders';
import { createReminder } from '@/lib/firebase/reminders';
import { WebhookReminderSchema } from '@/lib/types/reminders';

interface ReminderImportExportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reminders: WebhookReminder[];
}

export function ReminderImportExport({
  open,
  onOpenChange,
  reminders
}: ReminderImportExportProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [importData, setImportData] = useState('');
  const [importing, setImporting] = useState(false);
  const [validationResults, setValidationResults] = useState<{
    valid: ReminderExportData[];
    invalid: Array<{ data: any; error: string; index: number }>;
  } | null>(null);

  // 导出提醒数据
  const handleExport = () => {
    const exportData: ReminderExportData[] = reminders.map(reminder => ({
      name: reminder.name,
      platform: reminder.platform,
      webhookUrl: reminder.webhookUrl,
      messageContent: reminder.messageContent,
      timeSlots: reminder.timeSlots.map(slot => ({
        time: slot.time,
        isActive: slot.isActive,
        description: slot.description,
      })),
      days: reminder.days,
      isActive: reminder.isActive,
      platformConfig: reminder.platformConfig,
    }));

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `reminders-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: '导出成功',
      description: `已导出 ${reminders.length} 个提醒`,
    });
  };

  // 复制导出数据到剪贴板
  const handleCopyExport = () => {
    const exportData: ReminderExportData[] = reminders.map(reminder => ({
      name: reminder.name,
      platform: reminder.platform,
      webhookUrl: reminder.webhookUrl,
      messageContent: reminder.messageContent,
      timeSlots: reminder.timeSlots.map(slot => ({
        time: slot.time,
        isActive: slot.isActive,
        description: slot.description,
      })),
      days: reminder.days,
      isActive: reminder.isActive,
      platformConfig: reminder.platformConfig,
    }));

    const jsonString = JSON.stringify(exportData, null, 2);
    navigator.clipboard.writeText(jsonString);
    
    toast({
      title: '已复制',
      description: '导出数据已复制到剪贴板',
    });
  };

  // 从文件导入
  const handleFileImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportData(content);
      validateImportData(content);
    };
    reader.readAsText(file);
  };

  // 验证导入数据
  const validateImportData = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      
      if (!Array.isArray(data)) {
        throw new Error('导入数据必须是数组格式');
      }

      const valid: ReminderExportData[] = [];
      const invalid: Array<{ data: any; error: string; index: number }> = [];

      data.forEach((item, index) => {
        try {
          // 验证基本结构
          const validatedItem = WebhookReminderSchema.parse({
            ...item,
            timeSlots: item.timeSlots?.map((slot: any) => ({
              ...slot,
              id: `temp_${Date.now()}_${Math.random()}` // 临时ID
            })) || []
          });
          
          valid.push(item);
        } catch (error) {
          invalid.push({
            data: item,
            error: error instanceof Error ? error.message : '验证失败',
            index
          });
        }
      });

      setValidationResults({ valid, invalid });
    } catch (error) {
      setValidationResults({
        valid: [],
        invalid: [{
          data: null,
          error: error instanceof Error ? error.message : 'JSON格式错误',
          index: 0
        }]
      });
    }
  };

  // 执行导入
  const handleImport = async () => {
    if (!user || !validationResults?.valid.length) return;

    setImporting(true);
    try {
      let successCount = 0;
      let failCount = 0;

      for (const reminderData of validationResults.valid) {
        try {
          await createReminder(user.uid, {
            ...reminderData,
            timeSlots: reminderData.timeSlots.map(slot => ({
              time: slot.time,
              isActive: slot.isActive,
              description: slot.description,
            }))
          });
          successCount++;
        } catch (error) {
          failCount++;
          console.error('Failed to import reminder:', error);
        }
      }

      toast({
        title: '导入完成',
        description: `成功导入 ${successCount} 个提醒${failCount > 0 ? `，失败 ${failCount} 个` : ''}`,
        variant: failCount > 0 ? 'destructive' : 'default',
      });

      if (successCount > 0) {
        onOpenChange(false);
        setImportData('');
        setValidationResults(null);
      }
    } catch (error) {
      toast({
        title: '导入失败',
        description: '导入过程中发生错误',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>导入/导出提醒</DialogTitle>
          <DialogDescription>
            导出现有提醒或从JSON文件导入提醒配置
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">导出</TabsTrigger>
            <TabsTrigger value="import">导入</TabsTrigger>
          </TabsList>

          {/* 导出标签页 */}
          <TabsContent value="export" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">导出提醒</h3>
                  <p className="text-sm text-muted-foreground">
                    将当前的 {reminders.length} 个提醒导出为JSON文件
                  </p>
                </div>
                <Badge variant="outline">
                  {reminders.length} 个提醒
                </Badge>
              </div>

              {reminders.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>暂无提醒</AlertTitle>
                  <AlertDescription>
                    您还没有创建任何提醒，无法导出。
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button onClick={handleExport} className="flex-1">
                      <FileDown className="h-4 w-4 mr-2" />
                      下载JSON文件
                    </Button>
                    <Button variant="outline" onClick={handleCopyExport}>
                      <Copy className="h-4 w-4 mr-2" />
                      复制到剪贴板
                    </Button>
                  </div>

                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertTitle>导出说明</AlertTitle>
                    <AlertDescription className="space-y-1">
                      <p>• 导出的JSON文件包含所有提醒的配置信息</p>
                      <p>• 不包含执行历史和统计数据</p>
                      <p>• 可以在其他设备或账户中导入使用</p>
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          </TabsContent>

          {/* 导入标签页 */}
          <TabsContent value="import" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">导入提醒</h3>
                <p className="text-sm text-muted-foreground">
                  从JSON文件或文本导入提醒配置
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleFileImport}>
                    <Upload className="h-4 w-4 mr-2" />
                    选择文件
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                <div className="space-y-2">
                  <Label>或粘贴JSON数据</Label>
                  <Textarea
                    placeholder="粘贴导出的JSON数据..."
                    value={importData}
                    onChange={(e) => {
                      setImportData(e.target.value);
                      if (e.target.value.trim()) {
                        validateImportData(e.target.value);
                      } else {
                        setValidationResults(null);
                      }
                    }}
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>

                {/* 验证结果 */}
                {validationResults && (
                  <div className="space-y-3">
                    {validationResults.valid.length > 0 && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>验证通过</AlertTitle>
                        <AlertDescription>
                          找到 {validationResults.valid.length} 个有效的提醒配置
                        </AlertDescription>
                      </Alert>
                    )}

                    {validationResults.invalid.length > 0 && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>验证失败</AlertTitle>
                        <AlertDescription>
                          {validationResults.invalid.length} 个配置存在错误：
                          <ul className="mt-2 space-y-1">
                            {validationResults.invalid.slice(0, 3).map((item, index) => (
                              <li key={index} className="text-xs">
                                第 {item.index + 1} 项: {item.error}
                              </li>
                            ))}
                            {validationResults.invalid.length > 3 && (
                              <li className="text-xs">
                                还有 {validationResults.invalid.length - 3} 个错误...
                              </li>
                            )}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}

                    {validationResults.valid.length > 0 && (
                      <Button
                        onClick={handleImport}
                        disabled={importing}
                        className="w-full"
                      >
                        {importing ? '导入中...' : `导入 ${validationResults.valid.length} 个提醒`}
                      </Button>
                    )}
                  </div>
                )}

                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertTitle>导入说明</AlertTitle>
                  <AlertDescription className="space-y-1">
                    <p>• 支持导入JSON格式的提醒配置</p>
                    <p>• 导入的提醒将添加到现有提醒中，不会覆盖</p>
                    <p>• 请确保Webhook URL的有效性</p>
                    <p>• 导入前会自动验证数据格式</p>
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
