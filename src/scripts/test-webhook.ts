#!/usr/bin/env tsx

/**
 * 测试webhook发送功能
 * 
 * 用法:
 * npx tsx src/scripts/test-webhook.ts
 */

import { WebhookAdapterFactory } from '../lib/adapters/webhook-adapters';

async function testWebhookSending() {
  try {
    console.log('开始测试webhook发送...');
    
    // 测试企业微信格式
    const adapter = WebhookAdapterFactory.getAdapter('wechat_work');
    const message = adapter.formatMessage('这是一条测试消息', {
      msgtype: 'text',
      mentionAll: true
    });
    
    console.log('企业微信消息格式:');
    console.log(JSON.stringify(message, null, 2));
    
    // 测试发送到httpbin（用于测试）
    const testUrl = 'https://httpbin.org/post';
    
    console.log(`\n发送测试消息到: ${testUrl}`);
    
    const response = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Inspirista-Reminder-Bot/1.0'
      },
      body: JSON.stringify(message)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('\n✅ 发送成功！');
      console.log('响应状态:', response.status);
      console.log('服务器收到的数据:');
      console.log(JSON.stringify(result.json, null, 2));
    } else {
      console.log('\n❌ 发送失败');
      console.log('响应状态:', response.status);
      console.log('错误信息:', await response.text());
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

async function testAllPlatforms() {
  const platforms = ['wechat_work', 'dingtalk', 'feishu', 'slack'] as const;
  
  console.log('测试所有平台的消息格式...\n');
  
  for (const platform of platforms) {
    try {
      const adapter = WebhookAdapterFactory.getAdapter(platform);
      const message = adapter.formatMessage('这是一条测试消息');
      
      console.log(`${platform} 消息格式:`);
      console.log(JSON.stringify(message, null, 2));
      console.log('---');
    } catch (error) {
      console.error(`${platform} 测试失败:`, error);
    }
  }
}

async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'send':
      await testWebhookSending();
      break;
    case 'formats':
      await testAllPlatforms();
      break;
    default:
      console.log('用法:');
      console.log('  npx tsx src/scripts/test-webhook.ts send      # 测试发送webhook');
      console.log('  npx tsx src/scripts/test-webhook.ts formats   # 测试所有平台格式');
      break;
  }
}

main().catch(console.error);
