import type { TaskPlan, TaskOptimization, Task, AITaskResponse } from '@/lib/types/tasks';
import type { AiConfig } from '@/lib/types';
import { validateApiKey } from '@/app/actions';

export class AITaskGenerator {

  // 基于目标生成任务计划
  async generateTaskPlan(prompt: string, aiConfig?: AiConfig, apiKey?: string, timeframe?: number): Promise<TaskPlan> {
    // 从用户输入中提取时间范围
    const extractedTimeframe = this.extractTimeframe(prompt, timeframe);

    const systemPrompt = `你是一个专业的短期任务规划助手。用户会提供一个学习或工作目标，请帮助制定具体的里程碑计划。

输入格式识别：
- 如果用户输入包含"X天内"，使用X作为总天数
- 如果没有明确天数，默认使用7天
- 目标应该是具体、可衡量的

输出要求：
1. 总分结构描述（1句话，15字内）
2. 里程碑列表（每个里程碑1-2句话，20字左右）
3. 2个相关标签

严格按照以下格式返回，不要包含任何其他文字：
总体规划：[一句话描述整体计划]

里程碑计划：
里程碑1（第1-X天）：[具体要完成的内容]
里程碑2（第X-Y天）：[具体要完成的内容]
里程碑3（第Y-Z天）：[具体要完成的内容]

推荐标签：#标签1 #标签2`;

    const userPrompt = `目标：${prompt}\n时间范围：${extractedTimeframe}天\n\n请生成详细的任务计划。`;

    try {
      console.log('开始生成AI任务计划...');
      const result = await this.callAI(systemPrompt, userPrompt, aiConfig, apiKey);

      if (!result || result.trim().length === 0) {
        console.warn('AI返回空响应，使用默认计划');
        return this.generateDefaultTaskPlan(prompt, extractedTimeframe);
      }

      console.log('解析AI响应...');
      const parsedResponse = this.parseAIResponse(result);

      console.log('转换为任务计划...');
      const taskPlan = this.convertToTaskPlan(parsedResponse, prompt, extractedTimeframe);

      console.log('AI任务计划生成成功');
      return taskPlan;
    } catch (error) {
      console.error('AI任务生成失败:', error);

      // 根据错误类型提供不同的处理
      if (error instanceof Error) {
        if (error.message.includes('API密钥')) {
          console.warn('未配置API密钥，使用默认计划');
          return this.generateDefaultTaskPlan(prompt, extractedTimeframe);
        } else if (error.message.includes('网络') || error.message.includes('连接')) {
          console.warn('网络连接失败，使用默认计划');
          return this.generateDefaultTaskPlan(prompt, extractedTimeframe);
        } else if (error.message.includes('响应格式')) {
          console.warn('AI响应格式错误，使用默认计划');
          return this.generateDefaultTaskPlan(prompt, extractedTimeframe);
        }
      }

      // 默认错误处理：返回默认计划而不是抛出错误
      console.warn('AI生成失败，使用默认计划');
      return this.generateDefaultTaskPlan(prompt, extractedTimeframe);
    }
  }

  // 从用户输入中提取时间范围
  private extractTimeframe(prompt: string, defaultTimeframe?: number): number {
    // 匹配"X天内"的模式
    const timeframeMatch = prompt.match(/(\d+)天内/);
    if (timeframeMatch) {
      const days = parseInt(timeframeMatch[1]);
      // 限制在3-30天范围内
      return Math.min(Math.max(days, 3), 30);
    }

    return defaultTimeframe || 7;
  }

  // 解析AI响应文本（增强版本，支持更灵活的格式）
  private parseAIResponse(response: string): AITaskResponse {
    try {
      console.log('原始AI响应:', response);

      // 清理响应文本
      const cleanResponse = response.trim();

      // 提取总体规划
      const summaryMatch = cleanResponse.match(/总体规划[：:]\s*(.+)/);
      const summary = summaryMatch ? summaryMatch[1].trim() : '';

      // 提取里程碑 - 支持更灵活的格式
      const milestones: AITaskResponse['milestones'] = [];

      // 尝试匹配里程碑计划部分
      const milestonesSection = cleanResponse.match(/里程碑计划[：:]([\s\S]*?)(?:推荐标签|$)/);

      if (milestonesSection) {
        const milestoneText = milestonesSection[1].trim();
        const milestoneLines = milestoneText.split('\n').filter(line => line.trim());

        for (const line of milestoneLines) {
          // 支持多种里程碑格式
          const patterns = [
            /里程碑\s*(\d+)\s*[（(]\s*(.+?)\s*[）)]\s*[：:]\s*(.+)/,
            /(\d+)\s*[.、]\s*[（(]\s*(.+?)\s*[）)]\s*[：:]\s*(.+)/,
            /里程碑\s*(\d+)\s*[：:]\s*(.+)/
          ];

          for (const pattern of patterns) {
            const match = line.match(pattern);
            if (match) {
              let dayRange, description;

              if (match.length === 4) {
                // 格式：里程碑1（第1天）：描述
                dayRange = match[2].trim();
                description = match[3].trim();
              } else if (match.length === 3) {
                // 格式：里程碑1：描述
                dayRange = `第${match[1]}天`;
                description = match[2].trim();
              }

              if (description) {
                milestones.push({
                  title: description.length > 20 ? description.substring(0, 20) + '...' : description,
                  description: description,
                  dayRange: dayRange || `第${milestones.length + 1}天`
                });
                break;
              }
            }
          }
        }
      }

      // 如果没有解析到里程碑，尝试从整个响应中提取
      if (milestones.length === 0) {
        console.warn('未能解析到里程碑，尝试备用方法');
        const lines = cleanResponse.split('\n').filter(line => line.trim());

        for (let i = 0; i < lines.length && milestones.length < 5; i++) {
          const line = lines[i].trim();
          if (line.length > 10 && line.length < 100 &&
              (line.includes('学习') || line.includes('完成') || line.includes('掌握') ||
               line.includes('实践') || line.includes('练习'))) {
            milestones.push({
              title: line.length > 20 ? line.substring(0, 20) + '...' : line,
              description: line,
              dayRange: `第${milestones.length + 1}天`
            });
          }
        }
      }

      // 提取标签
      const tags: string[] = [];
      const tagsMatch = cleanResponse.match(/推荐标签[：:]\s*(.+)/);

      if (tagsMatch) {
        const tagString = tagsMatch[1].trim();
        // 支持多种标签格式：#标签、标签、#标签1 #标签2
        const tagPatterns = [
          /#([^#\s，,]+)/g,
          /([^\s，,#]+)/g
        ];

        for (const pattern of tagPatterns) {
          const matches = tagString.match(pattern);
          if (matches) {
            tags.push(...matches.map(tag => tag.replace('#', '').trim()).filter(tag => tag.length > 0));
            break;
          }
        }
      }

      // 验证解析结果
      const result: AITaskResponse = {
        summary: summary || '完成指定目标',
        milestones: milestones.length > 0 ? milestones.slice(0, 5) : [], // 最多5个里程碑
        tags: tags.length > 0 ? tags.slice(0, 2) : ['学习', '目标'] // 确保至少有2个标签
      };

      console.log('解析结果:', result);
      return result;

    } catch (error) {
      console.error('解析AI响应失败:', error);
      throw new Error('AI响应格式不正确');
    }
  }

  // 将AI响应转换为TaskPlan
  private convertToTaskPlan(aiResponse: AITaskResponse, originalPrompt: string, timeframeDays: number): TaskPlan {
    try {
      // 验证AI响应的完整性
      if (!aiResponse.summary || !aiResponse.milestones || aiResponse.milestones.length === 0) {
        console.warn('AI响应不完整，使用默认计划');
        return this.generateDefaultTaskPlan(originalPrompt, timeframeDays);
      }

      // 生成格式化的描述
      const description = this.formatTaskDescription(aiResponse);

      // 转换里程碑，计算目标日期（基于任务创建日期）
      const taskCreationDate = new Date(); // 任务创建的当天
      const milestones = aiResponse.milestones.map((milestone, index) => {
        const targetDate = this.calculateMilestoneDate(milestone.dayRange, timeframeDays, taskCreationDate);

        return {
          title: milestone.title || `里程碑 ${index + 1}`,
          description: milestone.description || milestone.title || `完成第 ${index + 1} 个阶段`,
          targetDate,
          dayRange: milestone.dayRange || `第${index + 1}天`
        };
      });

      // 确保至少有2个标签
      const tags = aiResponse.tags && aiResponse.tags.length > 0
        ? aiResponse.tags.slice(0, 2)
        : ['学习', '目标'];

      return {
        title: this.generateTaskTitle(originalPrompt, timeframeDays),
        description,
        tags,
        milestones,
        originalPrompt,
        timeframeDays
      };
    } catch (error) {
      console.error('转换TaskPlan失败:', error);
      return this.generateDefaultTaskPlan(originalPrompt, timeframeDays);
    }
  }

  // 格式化任务描述
  private formatTaskDescription(aiResponse: AITaskResponse): string {
    let description = `总体规划：${aiResponse.summary}\n\n里程碑计划：\n`;

    aiResponse.milestones.forEach((milestone, index) => {
      description += `里程碑${index + 1}（${milestone.dayRange}）：${milestone.description}\n`;
    });

    if (aiResponse.tags.length > 0) {
      description += `\n推荐标签：${aiResponse.tags.map(tag => `#${tag}`).join(' ')}`;
    }

    return description;
  }

  // 生成任务标题
  private generateTaskTitle(originalPrompt: string, timeframeDays: number): string {
    // 如果原始提示词已经包含时间范围，直接使用
    if (originalPrompt.includes('天内')) {
      return originalPrompt;
    }

    // 否则添加时间范围
    return `${timeframeDays}天内${originalPrompt}`;
  }

  // 计算里程碑目标日期（基于任务创建日期）
  private calculateMilestoneDate(dayRange: string, totalDays: number, baseDate?: Date): Date {
    // 使用传入的基准日期，如果没有则使用今天
    const startDate = baseDate || new Date();

    // 确保startDate是有效的日期
    if (isNaN(startDate.getTime())) {
      console.warn('Invalid base date provided, using current date');
      const fallbackDate = new Date();
      return this.calculateMilestoneDate(dayRange, totalDays, fallbackDate);
    }

    // 解析天数范围，如"第1-2天"、"第3天"
    const rangeMatch = dayRange.match(/第(\d+)(?:-(\d+))?天/);
    if (rangeMatch) {
      const endDay = rangeMatch[2] ? parseInt(rangeMatch[2]) : parseInt(rangeMatch[1]);

      // 验证解析的天数是否有效
      if (isNaN(endDay) || endDay < 1 || endDay > 365) {
        console.warn(`Invalid day range: ${dayRange}, using default`);
        const targetDate = new Date(startDate);
        targetDate.setDate(startDate.getDate() + Math.ceil(totalDays / 2));
        return targetDate;
      }

      const targetDate = new Date(startDate);
      targetDate.setDate(startDate.getDate() + endDay);

      // 验证计算后的日期是否有效
      if (isNaN(targetDate.getTime())) {
        console.warn(`Invalid calculated date for day ${endDay}, using fallback`);
        const fallbackDate = new Date(startDate.getTime() + endDay * 24 * 60 * 60 * 1000);
        return fallbackDate;
      }

      return targetDate;
    }

    // 默认情况：平均分配
    const defaultDays = Math.ceil(totalDays / 2);
    const targetDate = new Date(startDate);
    targetDate.setDate(startDate.getDate() + defaultDays);

    // 验证默认计算的日期是否有效
    if (isNaN(targetDate.getTime())) {
      console.warn('Invalid default calculated date, using timestamp method');
      const fallbackDate = new Date(startDate.getTime() + defaultDays * 24 * 60 * 60 * 1000);
      return fallbackDate;
    }

    return targetDate;
  }

  // 优化现有任务
  async optimizeTask(task: Task): Promise<TaskOptimization> {
    const systemPrompt = `你是一个任务优化专家。请分析用户的任务并提供优化建议。

请严格按照以下JSON格式返回：
{
  "improvements": ["改进建议1", "改进建议2"],
  "timeManagementTips": ["时间管理建议1", "时间管理建议2"],
  "subtaskSuggestions": ["子任务建议1", "子任务建议2"],
  "riskWarnings": ["风险提醒1", "风险提醒2"]
}`;

    const userPrompt = `请帮助优化这个任务：
标题：${task.title}
描述：${task.description || '无描述'}
截止日期：${task.dueDate.toDate().toLocaleDateString()}
当前进度：${task.progress}%
已花费时间：${Math.round(task.timeSpent / 60)}小时
优先级：${task.priority}
分类：${task.category}

请提供具体的优化建议。`;

    try {
      const result = await this.callAI(systemPrompt, userPrompt);
      return this.parseOptimization(result);
    } catch (error) {
      console.error('任务优化失败:', error);
      throw new Error('任务优化失败，请稍后重试');
    }
  }

  // 生成任务建议
  async generateTaskSuggestions(category: TaskCategory, userGoals?: string[]): Promise<string[]> {
    const systemPrompt = `你是一个任务建议专家。根据用户的分类和目标，生成5-10个具体的任务建议。

请严格按照以下JSON格式返回：
{
  "suggestions": ["任务建议1", "任务建议2", "任务建议3"]
}`;

    const userPrompt = `分类：${category}
${userGoals ? `用户目标：${userGoals.join(', ')}` : ''}

请为这个分类生成一些实用的任务建议，每个建议要具体、可执行。`;

    try {
      const result = await this.callAI(systemPrompt, userPrompt);
      const parsed = JSON.parse(result);
      return parsed.suggestions || [];
    } catch (error) {
      console.error('任务建议生成失败:', error);
      return [];
    }
  }

  // 调用AI服务（增强版本，支持重试和更好的错误处理）
  private async callAI(systemPrompt: string, userPrompt: string, aiConfig?: AiConfig, apiKey?: string): Promise<string> {
    const maxRetries = 2;
    const retryDelay = 1000; // 1秒

    // 如果指定了AI配置，使用指定的配置
    if (aiConfig && apiKey) {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`尝试使用${aiConfig.provider} API (${aiConfig.model}) (第${attempt}次)`);

          let response: string;
          if (aiConfig.provider === 'gemini') {
            response = await this.callGeminiAPI(apiKey, systemPrompt, userPrompt, aiConfig.model);
          } else if (aiConfig.provider === 'deepseek') {
            response = await this.callDeepSeekAPI(apiKey, systemPrompt, userPrompt, aiConfig.model);
          } else {
            throw new Error(`不支持的AI提供商: ${aiConfig.provider}`);
          }

          if (response && response.trim().length > 0) {
            console.log(`${aiConfig.provider} API调用成功`);
            return response;
          } else {
            throw new Error(`${aiConfig.provider}返回空响应`);
          }
        } catch (error) {
          console.warn(`${aiConfig.provider} API调用失败 (第${attempt}次):`, error);
          if (attempt < maxRetries) {
            console.log(`等待${retryDelay}ms后重试...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        }
      }
      throw new Error(`${aiConfig.provider} API调用失败，请检查API密钥和网络连接`);
    }

    // 回退到原有的逻辑（尝试所有可用的API）
    // 尝试使用Gemini
    const geminiKey = localStorage.getItem('gemini-api-key');
    if (geminiKey) {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`尝试使用Gemini API (第${attempt}次)`);
          const response = await this.callGeminiAPI(geminiKey, systemPrompt, userPrompt);

          if (response && response.trim().length > 0) {
            console.log('Gemini API调用成功');
            return response;
          } else {
            throw new Error('Gemini返回空响应');
          }
        } catch (error) {
          console.warn(`Gemini API调用失败 (第${attempt}次):`, error);

          if (attempt < maxRetries) {
            console.log(`等待${retryDelay}ms后重试...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        }
      }
    }

    // 尝试使用DeepSeek
    const deepseekKey = localStorage.getItem('deepseek-api-key');
    if (deepseekKey) {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`尝试使用DeepSeek API (第${attempt}次)`);
          const response = await this.callDeepSeekAPI(deepseekKey, systemPrompt, userPrompt);

          if (response && response.trim().length > 0) {
            console.log('DeepSeek API调用成功');
            return response;
          } else {
            throw new Error('DeepSeek返回空响应');
          }
        } catch (error) {
          console.warn(`DeepSeek API调用失败 (第${attempt}次):`, error);

          if (attempt < maxRetries) {
            console.log(`等待${retryDelay}ms后重试...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        }
      }
    }

    // 如果没有配置API密钥，提供更详细的错误信息
    if (!geminiKey && !deepseekKey) {
      throw new Error('未配置AI服务API密钥。请在设置中配置Gemini或DeepSeek API密钥。');
    }

    throw new Error('所有AI服务调用失败，请检查网络连接和API密钥配置');
  }

  // 生成默认任务计划（当AI解析失败时使用）
  private generateDefaultTaskPlan(originalPrompt: string, timeframeDays: number): TaskPlan {
    const title = this.generateTaskTitle(originalPrompt, timeframeDays);
    const description = `总体规划：完成"${originalPrompt}"的相关任务

里程碑计划：
里程碑1（第1天）：分析需求和制定计划
里程碑2（第${Math.ceil(timeframeDays/2)}天）：执行主要任务
里程碑3（第${timeframeDays}天）：检查结果和总结

推荐标签：#学习 #目标`;

    // 使用任务创建日期作为基准
    const taskCreationDate = new Date();
    const milestones = [
      {
        title: '分析需求和制定计划',
        description: '明确目标要求，制定详细执行计划',
        targetDate: this.calculateMilestoneDate('第1天', timeframeDays, taskCreationDate),
        dayRange: '第1天'
      },
      {
        title: '执行主要任务',
        description: '按计划执行核心任务内容',
        targetDate: this.calculateMilestoneDate(`第${Math.ceil(timeframeDays/2)}天`, timeframeDays, taskCreationDate),
        dayRange: `第${Math.ceil(timeframeDays/2)}天`
      },
      {
        title: '检查结果和总结',
        description: '验证完成情况，总结经验教训',
        targetDate: this.calculateMilestoneDate(`第${timeframeDays}天`, timeframeDays, taskCreationDate),
        dayRange: `第${timeframeDays}天`
      }
    ];

    return {
      title,
      description,
      tags: ['学习', '目标'],
      milestones,
      originalPrompt,
      timeframeDays
    };
  }

  // 解析优化建议
  private parseOptimization(result: string): TaskOptimization {
    try {
      const cleanResult = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanResult);

      return {
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
        timeManagementTips: Array.isArray(parsed.timeManagementTips) ? parsed.timeManagementTips : [],
        subtaskSuggestions: Array.isArray(parsed.subtaskSuggestions) ? parsed.subtaskSuggestions : [],
        riskWarnings: Array.isArray(parsed.riskWarnings) ? parsed.riskWarnings : [],
      };
    } catch (error) {
      console.error('解析优化建议失败:', error);
      return {
        improvements: ['建议将任务分解为更小的步骤'],
        timeManagementTips: ['设置专门的工作时间段'],
        subtaskSuggestions: ['添加检查点来跟踪进度'],
        riskWarnings: ['注意截止日期，避免拖延'],
      };
    }
  }

  // 验证优先级
  private validatePriority(priority: string): TaskPriority {
    const validPriorities: TaskPriority[] = ['high', 'medium', 'low'];
    return validPriorities.includes(priority as TaskPriority) ? priority as TaskPriority : 'medium';
  }

  // 验证分类
  private validateCategory(category: string): TaskCategory {
    const validCategories: TaskCategory[] = ['work', 'study', 'personal', 'health', 'other'];
    return validCategories.includes(category as TaskCategory) ? category as TaskCategory : 'personal';
  }

  // 调用Gemini API
  private async callGeminiAPI(apiKey: string, systemPrompt: string, userPrompt: string, model: string = 'gemini-2.5-flash'): Promise<string> {
    try {
      // 将模型名称映射到API端点
      const modelEndpoint = model === 'gemini-2.5-pro' ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelEndpoint}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\n${userPrompt}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (error) {
      console.error('Gemini API调用失败:', error);
      throw error;
    }
  }

  // 调用DeepSeek API
  private async callDeepSeekAPI(apiKey: string, systemPrompt: string, userPrompt: string, model: string = 'deepseek-chat'): Promise<string> {
    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2048
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (error) {
      console.error('DeepSeek API调用失败:', error);
      throw error;
    }
  }
}

// 导出单例实例
export const aiTaskGenerator = new AITaskGenerator();
