import { NextRequest, NextResponse } from 'next/server';
import { executeScheduledReminders, executeReminderNow } from '@/lib/server/reminder-scheduler';

// 定时执行所有提醒
export async function POST(request: NextRequest) {
  try {
    // 验证请求来源（可以添加API密钥验证）
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.REMINDER_EXECUTION_TOKEN;
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await executeScheduledReminders();
    
    return NextResponse.json({
      success: true,
      message: '提醒执行完成',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('提醒执行API失败:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

// 手动执行特定提醒
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { reminderId, timeSlotId } = body;
    
    if (!reminderId) {
      return NextResponse.json(
        { error: 'reminderId is required' },
        { status: 400 }
      );
    }
    
    await executeReminderNow(reminderId, timeSlotId);
    
    return NextResponse.json({
      success: true,
      message: '提醒执行成功',
      reminderId,
      timeSlotId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('手动执行提醒失败:', error);
    
    return NextResponse.json(
      { 
        error: 'Execution Failed',
        message: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}
