#!/usr/bin/env tsx

/**
 * 测试API路由
 * 
 * 用法:
 * npx tsx src/scripts/test-api.ts
 */

async function testReminderExecutionAPI() {
  try {
    console.log('测试提醒执行API...');
    
    // 测试定时执行API
    console.log('\n1. 测试定时执行API (POST /api/reminders/execute)');
    
    const executeResponse = await fetch('http://localhost:9002/api/reminders/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('响应状态:', executeResponse.status);
    
    if (executeResponse.ok) {
      const result = await executeResponse.json();
      console.log('✅ API调用成功');
      console.log('响应数据:', JSON.stringify(result, null, 2));
    } else {
      const error = await executeResponse.text();
      console.log('❌ API调用失败');
      console.log('错误信息:', error);
    }
    
    // 测试手动执行API
    console.log('\n2. 测试手动执行API (PUT /api/reminders/execute)');
    
    const manualResponse = await fetch('http://localhost:9002/api/reminders/execute', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reminderId: 'test-reminder-id'
      })
    });
    
    console.log('响应状态:', manualResponse.status);
    
    if (manualResponse.ok) {
      const result = await manualResponse.json();
      console.log('✅ API调用成功');
      console.log('响应数据:', JSON.stringify(result, null, 2));
    } else {
      const error = await manualResponse.text();
      console.log('❌ API调用失败');
      console.log('错误信息:', error);
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

async function testHealthCheck() {
  try {
    console.log('测试应用健康状态...');
    
    const response = await fetch('http://localhost:9002/api/health', {
      method: 'GET'
    });
    
    console.log('健康检查状态:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ 应用运行正常');
      console.log('健康状态:', JSON.stringify(result, null, 2));
    } else {
      console.log('❌ 应用可能有问题');
    }
    
  } catch (error) {
    console.error('健康检查失败:', error);
    console.log('❌ 应用未运行或网络错误');
  }
}

async function main() {
  console.log('🧪 开始API测试...\n');
  
  // 先检查应用是否运行
  await testHealthCheck();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 测试提醒API
  await testReminderExecutionAPI();
  
  console.log('\n🎉 测试完成！');
}

main().catch(console.error);
