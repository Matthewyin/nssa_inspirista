/**
 * 测试脚本：验证修改后的Gemini API key验证功能
 */

// 模拟validateApiKey函数的核心逻辑
async function testGeminiValidation(apiKey) {
  try {
    console.log('🔄 测试Gemini API key验证...');
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Hello'
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 10,
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API key验证成功');
      console.log('📝 响应数据:', JSON.stringify(data, null, 2));
      return { isValid: true };
    } else {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      console.log('❌ API key验证失败');
      console.log('🔍 错误信息:', errorMessage);
      return { isValid: false, error: errorMessage };
    }
  } catch (error) {
    console.log('💥 验证过程出错:', error.message);
    return { isValid: false, error: error.message };
  }
}

// 如果直接运行此脚本
if (typeof process !== 'undefined' && process.argv) {
  const apiKey = process.argv[2];
  if (!apiKey) {
    console.log('❗ 请提供API key作为参数');
    console.log('用法: node test-api-validation.js YOUR_API_KEY');
    process.exit(1);
  }
  
  testGeminiValidation(apiKey).then(result => {
    console.log('🎯 最终结果:', result);
  });
}

module.exports = { testGeminiValidation };
