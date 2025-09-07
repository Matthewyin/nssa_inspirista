import type { WebhookPlatform, PlatformConfig } from '@/lib/types/reminders';

// 抽象的webhook适配器接口
export interface WebhookAdapter {
  platform: WebhookPlatform;
  formatMessage(content: string, config?: any): any;
  validateUrl(url: string): boolean;
  getDefaultConfig(): any;
  getMessagePreview(content: string, config?: any): string;
}

// 企业微信适配器
export class WeChatWorkAdapter implements WebhookAdapter {
  platform: WebhookPlatform = 'wechat_work';
  
  formatMessage(content: string, config?: PlatformConfig['wechat']) {
    const msgtype = config?.msgtype || 'text';
    const mentionAll = config?.mentionAll !== false; // 默认@所有人
    
    if (msgtype === 'markdown') {
      return {
        msgtype: 'markdown',
        markdown: {
          content: mentionAll ? `<@all>\n${content}` : content
        }
      };
    }
    
    // 默认文本消息
    return {
      msgtype: 'text',
      text: {
        content: mentionAll ? `@所有人 \n${content}` : content,
        mentioned_list: mentionAll ? ['@all'] : []
      }
    };
  }
  
  validateUrl(url: string): boolean {
    return url.includes('qyapi.weixin.qq.com') && url.includes('webhook/send');
  }
  
  getDefaultConfig() {
    return { msgtype: 'text', mentionAll: true };
  }
  
  getMessagePreview(content: string, config?: PlatformConfig['wechat']): string {
    const mentionAll = config?.mentionAll !== false;
    return mentionAll ? `@所有人 \n${content}` : content;
  }
}

// 钉钉适配器
export class DingTalkAdapter implements WebhookAdapter {
  platform: WebhookPlatform = 'dingtalk';
  
  formatMessage(content: string, config?: PlatformConfig['dingtalk']) {
    const msgtype = config?.msgtype || 'text';
    const isAtAll = config?.isAtAll !== false; // 默认@所有人
    
    if (msgtype === 'markdown') {
      return {
        msgtype: 'markdown',
        markdown: {
          title: '提醒消息',
          text: content
        },
        at: {
          isAtAll
        }
      };
    }
    
    // 默认文本消息
    return {
      msgtype: 'text',
      text: {
        content: content
      },
      at: {
        isAtAll
      }
    };
  }
  
  validateUrl(url: string): boolean {
    return url.includes('oapi.dingtalk.com') && url.includes('robot/send');
  }
  
  getDefaultConfig() {
    return { msgtype: 'text', isAtAll: true };
  }
  
  getMessagePreview(content: string, config?: PlatformConfig['dingtalk']): string {
    const isAtAll = config?.isAtAll !== false;
    return isAtAll ? `@所有人\n${content}` : content;
  }
}

// 飞书适配器
export class FeishuAdapter implements WebhookAdapter {
  platform: WebhookPlatform = 'feishu';
  
  formatMessage(content: string, config?: PlatformConfig['feishu']) {
    const msg_type = config?.msg_type || 'text';
    
    if (msg_type === 'rich_text') {
      return {
        msg_type: 'rich_text',
        content: {
          rich_text: [
            {
              tag: 'text',
              text: content,
              un_escape: true
            }
          ]
        }
      };
    }
    
    // 默认文本消息
    return {
      msg_type: 'text',
      content: {
        text: content
      }
    };
  }
  
  validateUrl(url: string): boolean {
    return url.includes('open.feishu.cn') && url.includes('webhook');
  }
  
  getDefaultConfig() {
    return { msg_type: 'text' };
  }
  
  getMessagePreview(content: string, config?: PlatformConfig['feishu']): string {
    return content; // 飞书不支持@所有人的特殊语法
  }
}

// Slack适配器
export class SlackAdapter implements WebhookAdapter {
  platform: WebhookPlatform = 'slack';
  
  formatMessage(content: string, config?: any) {
    return {
      text: content,
      username: 'Reminder Bot',
      icon_emoji: ':bell:'
    };
  }
  
  validateUrl(url: string): boolean {
    return url.includes('hooks.slack.com');
  }
  
  getDefaultConfig() {
    return {};
  }
  
  getMessagePreview(content: string, config?: any): string {
    return content;
  }
}

// 自定义适配器
export class CustomAdapter implements WebhookAdapter {
  platform: WebhookPlatform = 'custom';
  
  formatMessage(content: string, config?: PlatformConfig['custom']) {
    const template = config?.bodyTemplate || '{"message": "{{content}}"}';
    
    // 简单的模板变量替换
    return JSON.parse(template.replace('{{content}}', content));
  }
  
  validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
  
  getDefaultConfig() {
    return {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      bodyTemplate: '{"message": "{{content}}"}'
    };
  }
  
  getMessagePreview(content: string, config?: PlatformConfig['custom']): string {
    const template = config?.bodyTemplate || '{"message": "{{content}}"}';
    return template.replace('{{content}}', content);
  }
}

// 适配器工厂
export class WebhookAdapterFactory {
  private static adapters: Map<WebhookPlatform, WebhookAdapter> = new Map([
    ['wechat_work', new WeChatWorkAdapter()],
    ['dingtalk', new DingTalkAdapter()],
    ['feishu', new FeishuAdapter()],
    ['slack', new SlackAdapter()],
    ['custom', new CustomAdapter()],
  ]);
  
  static getAdapter(platform: WebhookPlatform): WebhookAdapter {
    const adapter = this.adapters.get(platform);
    if (!adapter) {
      throw new Error(`Unsupported platform: ${platform}`);
    }
    return adapter;
  }
  
  static getSupportedPlatforms(): WebhookPlatform[] {
    return Array.from(this.adapters.keys());
  }
  
  static validateWebhookUrl(platform: WebhookPlatform, url: string): boolean {
    const adapter = this.getAdapter(platform);
    return adapter.validateUrl(url);
  }
  
  static getMessagePreview(platform: WebhookPlatform, content: string, config?: any): string {
    const adapter = this.getAdapter(platform);
    return adapter.getMessagePreview(content, config);
  }
  
  static formatMessage(platform: WebhookPlatform, content: string, config?: any): any {
    const adapter = this.getAdapter(platform);
    return adapter.formatMessage(content, config);
  }
  
  static getDefaultConfig(platform: WebhookPlatform): any {
    const adapter = this.getAdapter(platform);
    return adapter.getDefaultConfig();
  }
}

// 工具函数：自动检测平台类型
export function detectPlatformFromUrl(url: string): WebhookPlatform | null {
  const platforms = WebhookAdapterFactory.getSupportedPlatforms();
  
  for (const platform of platforms) {
    if (platform === 'custom') continue; // 跳过自定义类型
    
    const adapter = WebhookAdapterFactory.getAdapter(platform);
    if (adapter.validateUrl(url)) {
      return platform;
    }
  }
  
  return null; // 如果都不匹配，返回null，用户需要手动选择
}

// 工具函数：测试webhook连接
export async function testWebhookConnection(
  platform: WebhookPlatform,
  url: string,
  config?: any
): Promise<{ success: boolean; message: string; status?: number }> {
  try {
    const adapter = WebhookAdapterFactory.getAdapter(platform);
    const testMessage = adapter.formatMessage('这是一条测试消息', config);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config?.custom?.headers || {})
      },
      body: JSON.stringify(testMessage)
    });
    
    if (response.ok) {
      return {
        success: true,
        message: '连接测试成功',
        status: response.status
      };
    } else {
      return {
        success: false,
        message: `连接测试失败: ${response.statusText}`,
        status: response.status
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `连接测试失败: ${error instanceof Error ? error.message : '未知错误'}`
    };
  }
}
