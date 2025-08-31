'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity,
  Clock,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

interface PerformanceMetrics {
  renderTime: number;
  componentCount: number;
  memoryUsage: number;
  lastUpdate: number;
}

interface PerformanceMonitorProps {
  componentName?: string;
  threshold?: {
    renderTime: number;
    memoryUsage: number;
  };
  onPerformanceIssue?: (metrics: PerformanceMetrics) => void;
  showInProduction?: boolean;
}

export function PerformanceMonitor({
  componentName = 'Component',
  threshold = {
    renderTime: 100, // 100ms
    memoryUsage: 50 * 1024 * 1024 // 50MB
  },
  onPerformanceIssue,
  showInProduction = false
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    componentCount: 0,
    memoryUsage: 0,
    lastUpdate: Date.now()
  });
  
  const [isVisible, setIsVisible] = useState(false);
  const renderStartTime = useRef<number>(0);
  const frameCount = useRef<number>(0);
  const lastFrameTime = useRef<number>(0);

  // 只在开发环境或明确要求时显示
  const shouldShow = process.env.NODE_ENV === 'development' || showInProduction;

  useEffect(() => {
    if (!shouldShow) return;

    renderStartTime.current = performance.now();

    // 测量渲染时间
    const measureRenderTime = () => {
      const renderTime = performance.now() - renderStartTime.current;
      
      // 获取内存使用情况（如果支持）
      let memoryUsage = 0;
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        memoryUsage = memory.usedJSHeapSize;
      }

      // 计算组件数量（估算）
      const componentCount = document.querySelectorAll('[data-component]').length;

      const newMetrics: PerformanceMetrics = {
        renderTime,
        componentCount,
        memoryUsage,
        lastUpdate: Date.now()
      };

      setMetrics(newMetrics);

      // 检查性能问题
      if (renderTime > threshold.renderTime || memoryUsage > threshold.memoryUsage) {
        onPerformanceIssue?.(newMetrics);
      }
    };

    // 使用 requestAnimationFrame 来测量
    const rafId = requestAnimationFrame(measureRenderTime);

    return () => {
      cancelAnimationFrame(rafId);
    };
  });

  // FPS 监控
  useEffect(() => {
    if (!shouldShow) return;

    const measureFPS = () => {
      frameCount.current++;
      const now = performance.now();
      
      if (lastFrameTime.current === 0) {
        lastFrameTime.current = now;
      }

      if (now - lastFrameTime.current >= 1000) {
        const fps = Math.round((frameCount.current * 1000) / (now - lastFrameTime.current));
        frameCount.current = 0;
        lastFrameTime.current = now;

        // 更新 FPS 到 metrics
        setMetrics(prev => ({ ...prev, fps }));
      }

      requestAnimationFrame(measureFPS);
    };

    const rafId = requestAnimationFrame(measureFPS);
    return () => cancelAnimationFrame(rafId);
  }, [shouldShow]);

  if (!shouldShow) return null;

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getPerformanceStatus = () => {
    const { renderTime, memoryUsage } = metrics;
    
    if (renderTime > threshold.renderTime * 2 || memoryUsage > threshold.memoryUsage * 2) {
      return { status: 'critical', color: 'text-red-600', icon: AlertTriangle };
    } else if (renderTime > threshold.renderTime || memoryUsage > threshold.memoryUsage) {
      return { status: 'warning', color: 'text-yellow-600', icon: TrendingUp };
    } else {
      return { status: 'good', color: 'text-green-600', icon: CheckCircle2 };
    }
  };

  const performanceStatus = getPerformanceStatus();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isVisible ? (
        <Button
          onClick={() => setIsVisible(true)}
          size="sm"
          variant="outline"
          className="bg-white shadow-lg"
        >
          <Activity className="h-4 w-4" />
        </Button>
      ) : (
        <Card className="w-80 bg-white shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4" />
                性能监控
                <Badge variant="outline" className="text-xs">
                  {componentName}
                </Badge>
              </CardTitle>
              <Button
                onClick={() => setIsVisible(false)}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* 总体状态 */}
            <div className="flex items-center gap-2">
              <performanceStatus.icon className={`h-4 w-4 ${performanceStatus.color}`} />
              <span className={`text-sm font-medium ${performanceStatus.color}`}>
                {performanceStatus.status === 'critical' ? '性能严重问题' :
                 performanceStatus.status === 'warning' ? '性能警告' :
                 '性能良好'}
              </span>
            </div>

            {/* 性能指标 */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>渲染时间</span>
                </div>
                <div className={`font-mono ${
                  metrics.renderTime > threshold.renderTime ? 'text-red-600' : 'text-green-600'
                }`}>
                  {metrics.renderTime.toFixed(2)}ms
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  <span>FPS</span>
                </div>
                <div className={`font-mono ${
                  (metrics as any).fps < 30 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {(metrics as any).fps || 0}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  <span>内存使用</span>
                </div>
                <div className={`font-mono ${
                  metrics.memoryUsage > threshold.memoryUsage ? 'text-red-600' : 'text-green-600'
                }`}>
                  {formatBytes(metrics.memoryUsage)}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>组件数</span>
                </div>
                <div className="font-mono">
                  {metrics.componentCount}
                </div>
              </div>
            </div>

            {/* 性能建议 */}
            {performanceStatus.status !== 'good' && (
              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                <div className="font-medium text-yellow-800 mb-1">性能建议:</div>
                <ul className="text-yellow-700 space-y-1">
                  {metrics.renderTime > threshold.renderTime && (
                    <li>• 考虑使用 React.memo 或 useMemo 优化渲染</li>
                  )}
                  {metrics.memoryUsage > threshold.memoryUsage && (
                    <li>• 检查是否有内存泄漏或大量数据缓存</li>
                  )}
                  {(metrics as any).fps < 30 && (
                    <li>• 减少动画或使用 CSS 动画替代 JS 动画</li>
                  )}
                  {metrics.componentCount > 100 && (
                    <li>• 考虑虚拟化长列表或分页显示</li>
                  )}
                </ul>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if ('gc' in window && typeof (window as any).gc === 'function') {
                    (window as any).gc();
                  }
                }}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                强制GC
              </Button>
              <Button
                onClick={() => {
                  console.log('Performance Metrics:', metrics);
                }}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                导出数据
              </Button>
            </div>

            {/* 更新时间 */}
            <div className="text-xs text-muted-foreground text-center">
              最后更新: {new Date(metrics.lastUpdate).toLocaleTimeString()}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Hook for performance monitoring
export function usePerformanceMonitor(componentName: string) {
  const renderStartTime = useRef<number>(0);

  useEffect(() => {
    renderStartTime.current = performance.now();
  });

  const measureRender = () => {
    const renderTime = performance.now() - renderStartTime.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
    }

    return renderTime;
  };

  return { measureRender };
}
