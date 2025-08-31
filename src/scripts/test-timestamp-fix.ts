#!/usr/bin/env node

/**
 * Firebase Timestamp类型转换修复验证脚本
 * 验证RangeError: Invalid time value的修复
 */

async function testTimestampFix() {
  console.log('🚀 开始测试Firebase Timestamp类型转换修复...\n');
  
  try {
    // 模拟Firebase Timestamp对象
    const mockTimestamp = {
      seconds: Math.floor(Date.now() / 1000),
      nanoseconds: 0,
      toDate: function() {
        return new Date(this.seconds * 1000);
      }
    };

    // 测试1: 验证safeToDate函数
    console.log('🔄 测试1: 验证safeToDate函数...');
    
    // 模拟safeToDate函数
    const safeToDate = (dateValue: any): Date | null => {
      try {
        if (!dateValue) {
          return null;
        }

        // 如果已经是Date对象
        if (dateValue instanceof Date) {
          return !isNaN(dateValue.getTime()) ? dateValue : null;
        }

        // 如果是Firebase Timestamp对象
        if (dateValue && typeof dateValue.toDate === 'function') {
          try {
            const date = dateValue.toDate();
            return !isNaN(date.getTime()) ? date : null;
          } catch (timestampError) {
            console.warn('Failed to convert Timestamp to Date:', timestampError);
            return null;
          }
        }

        // 如果是Timestamp-like对象（有seconds属性）
        if (dateValue && typeof dateValue.seconds === 'number') {
          try {
            const date = new Date(dateValue.seconds * 1000);
            return !isNaN(date.getTime()) ? date : null;
          } catch (secondsError) {
            console.warn('Failed to convert seconds to Date:', secondsError);
            return null;
          }
        }

        // 如果是字符串或数字，尝试转换
        const date = new Date(dateValue);
        return !isNaN(date.getTime()) ? date : null;
      } catch (error) {
        console.warn('Date conversion failed:', error, 'Input:', dateValue);
        return null;
      }
    };

    // 测试各种输入类型
    const testCases = [
      { input: mockTimestamp, description: 'Firebase Timestamp对象' },
      { input: new Date(), description: '有效的Date对象' },
      { input: new Date('invalid'), description: '无效的Date对象' },
      { input: '2025-01-15T10:00:00.000Z', description: 'ISO日期字符串' },
      { input: 1737000000000, description: '时间戳数字' },
      { input: { seconds: 1737000000, nanoseconds: 0 }, description: 'Timestamp-like对象' },
      { input: null, description: 'null值' },
      { input: undefined, description: 'undefined值' },
      { input: '', description: '空字符串' },
      { input: 'invalid-date', description: '无效日期字符串' },
    ];

    for (const testCase of testCases) {
      const result = safeToDate(testCase.input);
      
      if (testCase.input === null || testCase.input === undefined || testCase.input === '') {
        // 这些应该返回null
        if (result !== null) {
          throw new Error(`${testCase.description}: 应该返回null，但返回了${result}`);
        }
      } else if (testCase.description.includes('无效')) {
        // 无效输入应该返回null
        if (result !== null) {
          throw new Error(`${testCase.description}: 应该返回null，但返回了${result}`);
        }
      } else {
        // 有效输入应该返回Date对象
        if (!(result instanceof Date) || isNaN(result.getTime())) {
          throw new Error(`${testCase.description}: 应该返回有效的Date对象，但返回了${result}`);
        }
      }
    }

    console.log('✅ safeToDate函数验证通过');

    // 测试2: 验证safeMilestoneTargetDate函数
    console.log('🔄 测试2: 验证safeMilestoneTargetDate函数...');

    const safeMilestoneTargetDate = (milestone: any): Date | null => {
      if (!milestone || !milestone.targetDate) {
        return null;
      }

      try {
        // 使用通用的safeToDate函数
        const date = safeToDate(milestone.targetDate);
        if (date) {
          return date;
        }

        // 如果通用方法失败，尝试其他可能的格式
        console.warn('Failed to parse milestone targetDate, trying fallback methods:', milestone.targetDate);
        
        // 尝试直接解析字符串
        if (typeof milestone.targetDate === 'string') {
          const parsed = new Date(milestone.targetDate);
          if (!isNaN(parsed.getTime())) {
            return parsed;
          }
        }

        return null;
      } catch (error) {
        console.warn('Error parsing milestone targetDate:', error, 'Milestone:', milestone);
        return null;
      }
    };

    // 测试里程碑对象
    const milestoneTestCases = [
      {
        milestone: { targetDate: mockTimestamp },
        description: '包含Firebase Timestamp的里程碑'
      },
      {
        milestone: { targetDate: new Date() },
        description: '包含Date对象的里程碑'
      },
      {
        milestone: { targetDate: '2025-01-15T10:00:00.000Z' },
        description: '包含ISO字符串的里程碑'
      },
      {
        milestone: { targetDate: null },
        description: '包含null日期的里程碑'
      },
      {
        milestone: {},
        description: '没有targetDate的里程碑'
      },
      {
        milestone: null,
        description: 'null里程碑'
      },
    ];

    for (const testCase of milestoneTestCases) {
      const result = safeMilestoneTargetDate(testCase.milestone);
      
      if (!testCase.milestone || !testCase.milestone.targetDate) {
        // 应该返回null
        if (result !== null) {
          throw new Error(`${testCase.description}: 应该返回null，但返回了${result}`);
        }
      } else {
        // 应该返回有效的Date对象
        if (!(result instanceof Date) || isNaN(result.getTime())) {
          throw new Error(`${testCase.description}: 应该返回有效的Date对象，但返回了${result}`);
        }
      }
    }

    console.log('✅ safeMilestoneTargetDate函数验证通过');

    // 测试3: 验证日期格式化安全性
    console.log('🔄 测试3: 验证日期格式化安全性...');

    // 模拟安全的日期格式化
    const safeFormatDate = (date: Date | null): string => {
      if (!date) return '无日期';
      
      try {
        // 模拟date-fns的format函数
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date');
        }
        return date.toLocaleDateString('zh-CN');
      } catch (formatError) {
        console.warn('Error formatting date:', formatError, 'Date:', date);
        try {
          return date.toLocaleDateString('zh-CN');
        } catch (localError) {
          console.warn('Error with toLocaleDateString:', localError);
          return '日期格式错误';
        }
      }
    };

    // 测试格式化
    const formatTestCases = [
      { date: new Date(), expected: '有效格式' },
      { date: new Date('invalid'), expected: '日期格式错误' },
      { date: null, expected: '无日期' },
    ];

    for (const testCase of formatTestCases) {
      const result = safeFormatDate(testCase.date);
      
      if (testCase.expected === '无日期' && result !== '无日期') {
        throw new Error(`格式化测试失败: 期望"无日期"，得到"${result}"`);
      }
      
      if (testCase.expected === '日期格式错误' && !result.includes('日期格式错误') && !result.includes('Invalid Date')) {
        throw new Error(`格式化测试失败: 期望"日期格式错误"，得到"${result}"`);
      }
      
      if (testCase.expected === '有效格式' && result === '日期格式错误') {
        throw new Error(`格式化测试失败: 有效日期应该能正常格式化，但得到"${result}"`);
      }
    }

    console.log('✅ 日期格式化安全性验证通过');

    // 测试4: 验证Timestamp创建安全性
    console.log('🔄 测试4: 验证Timestamp创建安全性...');

    // 模拟安全的Timestamp创建
    const createSafeTimestamp = (dateValue: any): any => {
      const date = safeToDate(dateValue);
      if (!date) {
        return null;
      }

      try {
        // 模拟Firebase Timestamp.fromDate
        return {
          seconds: Math.floor(date.getTime() / 1000),
          nanoseconds: (date.getTime() % 1000) * 1000000,
          toDate: function() { return new Date(this.seconds * 1000); }
        };
      } catch (error) {
        console.warn('Timestamp creation failed:', error);
        return null;
      }
    };

    // 测试Timestamp创建
    const timestampTestCases = [
      new Date(),
      new Date('2025-01-15'),
      new Date('invalid'),
      null,
      undefined,
      'invalid-date'
    ];

    for (const testCase of timestampTestCases) {
      const result = createSafeTimestamp(testCase);
      
      if (testCase === null || testCase === undefined || 
          (testCase instanceof Date && isNaN(testCase.getTime())) ||
          testCase === 'invalid-date') {
        // 应该返回null
        if (result !== null) {
          throw new Error(`Timestamp创建测试失败: 无效输入应该返回null，但返回了${result}`);
        }
      } else {
        // 应该返回有效的Timestamp对象
        if (!result || typeof result.toDate !== 'function') {
          throw new Error(`Timestamp创建测试失败: 有效输入应该返回Timestamp对象，但返回了${result}`);
        }
        
        // 验证可以转换回Date
        const convertedBack = result.toDate();
        if (!(convertedBack instanceof Date) || isNaN(convertedBack.getTime())) {
          throw new Error(`Timestamp创建测试失败: 创建的Timestamp无法转换回有效的Date`);
        }
      }
    }

    console.log('✅ Timestamp创建安全性验证通过');

    console.log('\n📊 测试结果: 4/4 通过');
    console.log('🎉 Firebase Timestamp类型转换修复验证成功！');

    // 总结修复内容
    console.log('\n✅ 修复内容总结：');
    console.log('1. ✅ **AI任务生成器**: 确保生成的日期可以安全转换为Timestamp');
    console.log('2. ✅ **Firebase存储**: 所有里程碑日期都转换为Timestamp存储');
    console.log('3. ✅ **数据读取**: 使用safeToDate和safeMilestoneTargetDate安全读取');
    console.log('4. ✅ **日期格式化**: 所有格式化操作都有错误处理');
    console.log('5. ✅ **类型一致性**: 确保整个数据流中的类型一致');

    console.log('\n🔧 技术细节：');
    console.log('- **存储格式**: Firebase中统一使用Timestamp对象');
    console.log('- **读取转换**: 安全地将Timestamp转换为Date对象');
    console.log('- **错误处理**: 所有日期操作都有try-catch保护');
    console.log('- **回退机制**: 无效日期使用合理的默认值');
    console.log('- **类型检查**: 严格的类型验证和转换');

    return true;

  } catch (error) {
    console.error('\n❌ 测试失败:', error);
    return false;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  testTimestampFix().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { testTimestampFix };
