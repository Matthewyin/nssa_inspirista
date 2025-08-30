import type { TaskPlan, TaskOptimization, Task, TaskPriority, TaskCategory } from '@/lib/types/tasks';
import { validateApiKey } from '@/app/actions';

export class AITaskGenerator {
  
  // 基于目标生成任务计划
  async generateTaskPlan(prompt: string, timeframe: number): Promise<TaskPlan> {
    const systemPrompt = `你是一个专业的任务规划助手。用户会提供一个目标和时间范围（${timeframe}天），请帮助分解成具体的、可执行的任务计划。

要求：
1. 任务要具体、可衡量、可在${timeframe}天内完成
2. 时间安排要合理，考虑工作日和休息日
3. 考虑任务的优先级（high/medium/low）
4. 提供预估工作时长（小时）
5. 分解成3-8个适当的子任务
6. 选择合适的分类：work（工作）、study（学习）、personal（个人）、health（健康）、other（其他）

请严格按照以下JSON格式返回，不要包含任何其他文字：
{
  "title": "任务标题",
  "description": "详细描述任务目标和要求",
  "priority": "high|medium|low",
  "category": "work|study|personal|health|other", 
  "tags": ["标签1", "标签2"],
  "estimatedHours": 数字,
  "subtasks": [
    {
      "title": "子任务标题",
      "isCompleted": false,
      "estimatedMinutes": 数字
    }
  ]
}`;

    const userPrompt = `目标：${prompt}\n时间范围：${timeframe}天\n\n请生成详细的任务计划。`;

    try {
      const result = await this.callAI(systemPrompt, userPrompt);
      const parsedPlan = this.parseTaskPlan(result, prompt, timeframe);
      return parsedPlan;
    } catch (error) {
      console.error('AI任务生成失败:', error);
      throw new Error('AI任务生成失败，请稍后重试');
    }
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

  // 调用AI服务
  private async callAI(systemPrompt: string, userPrompt: string): Promise<string> {
    // 尝试使用Gemini
    try {
      const geminiKey = localStorage.getItem('gemini-api-key');
      if (geminiKey) {
        const geminiResult = await validateApiKey({ 
          provider: 'gemini', 
          apiKey: geminiKey,
          prompt: userPrompt,
          systemPrompt 
        });
        
        if (geminiResult.isValid && geminiResult.response) {
          return geminiResult.response;
        }
      }
    } catch (error) {
      console.warn('Gemini调用失败，尝试DeepSeek:', error);
    }

    // 尝试使用DeepSeek
    try {
      const deepseekKey = localStorage.getItem('deepseek-api-key');
      if (deepseekKey) {
        const deepseekResult = await validateApiKey({ 
          provider: 'deepseek', 
          apiKey: deepseekKey,
          prompt: userPrompt,
          systemPrompt 
        });
        
        if (deepseekResult.isValid && deepseekResult.response) {
          return deepseekResult.response;
        }
      }
    } catch (error) {
      console.warn('DeepSeek调用失败:', error);
    }

    throw new Error('没有可用的AI服务，请检查API密钥配置');
  }

  // 解析任务计划
  private parseTaskPlan(result: string, originalPrompt: string, timeframe: number): TaskPlan {
    try {
      // 清理可能的markdown代码块标记
      const cleanResult = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanResult);

      // 验证必需字段
      if (!parsed.title || !parsed.description) {
        throw new Error('AI返回的数据格式不完整');
      }

      // 计算截止日期
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + timeframe);

      return {
        title: parsed.title,
        description: parsed.description,
        dueDate,
        priority: this.validatePriority(parsed.priority),
        category: this.validateCategory(parsed.category),
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        subtasks: Array.isArray(parsed.subtasks) ? parsed.subtasks.map((st: any) => ({
          title: st.title || '子任务',
          isCompleted: false,
          estimatedMinutes: typeof st.estimatedMinutes === 'number' ? st.estimatedMinutes : 30,
        })) : [],
        estimatedHours: typeof parsed.estimatedHours === 'number' ? parsed.estimatedHours : timeframe * 2,
        originalPrompt,
      };
    } catch (error) {
      console.error('解析AI响应失败:', error);
      
      // 返回默认的任务计划
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + timeframe);
      
      return {
        title: originalPrompt.slice(0, 50) + (originalPrompt.length > 50 ? '...' : ''),
        description: `基于目标"${originalPrompt}"的任务计划`,
        dueDate,
        priority: 'medium',
        category: 'personal',
        tags: [],
        subtasks: [
          { title: '分析需求', isCompleted: false, estimatedMinutes: 60 },
          { title: '制定计划', isCompleted: false, estimatedMinutes: 90 },
          { title: '执行任务', isCompleted: false, estimatedMinutes: 180 },
          { title: '检查结果', isCompleted: false, estimatedMinutes: 30 },
        ],
        estimatedHours: timeframe * 2,
        originalPrompt,
      };
    }
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
}

// 导出单例实例
export const aiTaskGenerator = new AITaskGenerator();
