'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ActivitiesPage() {
  const router = useRouter();

  // 重定向到任务页面，因为活动功能已集成到首页
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/tasks');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">活动页面已迁移</CardTitle>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              活动功能已经集成到首页的"最近活动"卡片中。
              您将在3秒后自动跳转到任务页面。
            </p>
            
            <div className="flex justify-center gap-3">
              <Button asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  返回首页
                </Link>
              </Button>
              
              <Button variant="outline" asChild>
                <Link href="/tasks">
                  查看任务
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
