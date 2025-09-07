'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SUPPORTED_PLATFORMS } from '@/lib/types/reminders';
import type { WebhookPlatform } from '@/lib/types/reminders';

interface PlatformSelectorProps {
  value: WebhookPlatform;
  onChange: (platform: WebhookPlatform) => void;
  disabled?: boolean;
}

export function PlatformSelector({ 
  value, 
  onChange, 
  disabled = false 
}: PlatformSelectorProps) {
  const selectedPlatform = SUPPORTED_PLATFORMS.find(p => p.value === value);

  return (
    <div className="space-y-3">
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder="选择平台">
            {selectedPlatform && (
              <div className="flex items-center gap-2">
                <span>{selectedPlatform.icon}</span>
                <span>{selectedPlatform.label}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_PLATFORMS.map(platform => (
            <SelectItem key={platform.value} value={platform.value}>
              <div className="flex items-center gap-3 w-full">
                <span className="text-lg">{platform.icon}</span>
                <div className="flex flex-col items-start">
                  <span className="font-medium">{platform.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {platform.description}
                  </span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* 平台说明 */}
      {selectedPlatform && (
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{selectedPlatform.icon}</span>
            <span className="font-medium">{selectedPlatform.label}</span>
            <Badge variant="outline" className="text-xs">
              {selectedPlatform.value}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            {selectedPlatform.description}
          </p>
          
          {/* 平台特定说明 */}
          {selectedPlatform.value === 'wechat_work' && (
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• 支持文本和Markdown格式消息</p>
              <p>• 自动添加"@所有人"提及</p>
              <p>• URL格式：https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx</p>
            </div>
          )}
          
          {selectedPlatform.value === 'dingtalk' && (
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• 支持文本和Markdown格式消息</p>
              <p>• 支持@所有人功能</p>
              <p>• URL格式：https://oapi.dingtalk.com/robot/send?access_token=xxx</p>
            </div>
          )}
          
          {selectedPlatform.value === 'feishu' && (
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• 支持文本和富文本消息</p>
              <p>• URL格式：https://open.feishu.cn/open-apis/bot/v2/hook/xxx</p>
            </div>
          )}
          
          {selectedPlatform.value === 'slack' && (
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• 支持文本消息和附件</p>
              <p>• URL格式：https://hooks.slack.com/services/xxx/xxx/xxx</p>
            </div>
          )}
          
          {selectedPlatform.value === 'custom' && (
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• 支持自定义HTTP请求</p>
              <p>• 可配置请求方法、头部和消息模板</p>
              <p>• 适用于任何支持Webhook的服务</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
