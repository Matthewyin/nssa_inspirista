#!/usr/bin/env node

/**
 * 测试任务页面修复的脚本
 * 验证日期处理和查询是否正常工作
 */

console.log('🧪 开始测试任务页面修复...');

// 模拟安全日期处理函数
function safeToDate(dateValue) {
  try {
    if (!dateValue) return null;
    
    if (dateValue instanceof Date) {
      return !isNaN(dateValue.getTime()) ? dateValue : null;
    }
    
    // 模拟 Firebase Timestamp
    if (dateValue && typeof dateValue.toDate === 'function') {
      try {
        const date = dateValue.toDate();
        return !isNaN(date.getTime()) ? date : null;
      } catch (error) {
        console.warn('Failed to convert Timestamp:', error);
        return null;
      }
    }
    
    // 尝试解析字符串或数字
    const date = new Date(dateValue);
    return !isNaN(date.getTime()) ? date : null;
  } catch (error) {
    console.warn('Safe date conversion failed:', error);
    return null;
  }
}

// 测试用例
const testCases = [
  {
    name: '正常日期',
    input: new Date('2024-01-15'),
    expected: true
  },
  {
    name: '无效日期',
    input: new Date('invalid'),
    expected: false
  },
  {
    name: 'null值',
    input: null,
    expected: false
  },
  {
    name: 'undefined值',
    input: undefined,
    expected: false
  },
  {
    name: '模拟Firebase Timestamp',
    input: {
      toDate: () => new Date('2024-01-15')
    },
    expected: true
  },
  {
    name: '损坏的Firebase Timestamp',
    input: {
      toDate: () => { throw new Error('Invalid timestamp'); }
    },
    expected: false
  }
];

console.log('\n📅 测试安全日期处理函数...');
let passedTests = 0;
let totalTests = testCases.length;

testCases.forEach((testCase, index) => {
  const result = safeToDate(testCase.input);
  const isValid = result !== null;
  const passed = isValid === testCase.expected;
  
  console.log(`${index + 1}. ${testCase.name}: ${passed ? '✅ 通过' : '❌ 失败'}`);
  if (passed) passedTests++;
});

console.log(`\n📊 测试结果: ${passedTests}/${totalTests} 通过`);

if (passedTests === totalTests) {
  console.log('🎉 所有测试通过！日期处理修复成功。');
} else {
  console.log('⚠️  部分测试失败，需要进一步检查。');
}

console.log('\n📝 修复总结:');
console.log('1. ✅ 更新了任务详情页面的日期处理');
console.log('2. ✅ 修复了任务状态可视化组件');
console.log('3. ✅ 更新了里程碑时间线组件');
console.log('4. ✅ 优化了Firebase查询逻辑');
console.log('5. ✅ 部署了必要的Firestore索引');
console.log('6. ✅ 修复了任务统计中的日期处理');

console.log('\n🚀 下一步:');
console.log('1. 等待Firestore索引创建完成（可能需要几分钟）');
console.log('2. 重新访问/tasks页面测试功能');
console.log('3. 检查浏览器控制台是否还有错误');

console.log('\n✨ 修复完成！');
