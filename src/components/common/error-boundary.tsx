'use client';

import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle,
  RefreshCw,
  Bug,
  Home,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
  className?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  showDetails: boolean;
  retryCount: number;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private maxRetries = 3;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // 调用外部错误处理器
    this.props.onError?.(error, errorInfo);

    // 在开发环境中记录详细错误信息
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 React Error Boundary');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }

    // 在生产环境中发送错误报告
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo);
    }
  }

  private reportError = (error: Error, errorInfo: React.ErrorInfo) => {
    // 这里可以集成错误报告服务，如 Sentry
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // 发送到错误报告服务
    console.warn('Error report:', errorReport);
  };

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }));
    }
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      retryCount: 0
    });
  };

  private toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }));
  };

  private getErrorType = (error: Error): string => {
    if (error.name === 'ChunkLoadError') return '资源加载错误';
    if (error.message.includes('Network')) return '网络错误';
    if (error.message.includes('Firebase')) return '数据库错误';
    if (error.message.includes('Permission')) return '权限错误';
    return '应用错误';
  };

  private getErrorSeverity = (error: Error): 'low' | 'medium' | 'high' => {
    if (error.name === 'ChunkLoadError') return 'medium';
    if (error.message.includes('Network')) return 'medium';
    if (error.message.includes('Firebase')) return 'high';
    if (error.message.includes('Permission')) return 'high';
    return 'low';
  };

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, showDetails, retryCount } = this.state;
      const errorType = error ? this.getErrorType(error) : '未知错误';
      const errorSeverity = error ? this.getErrorSeverity(error) : 'low';
      const canRetry = retryCount < this.maxRetries;

      return (
        <div className={this.props.className}>
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-full">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-red-800">
                      组件加载失败
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          errorSeverity === 'high' ? 'border-red-300 text-red-700' :
                          errorSeverity === 'medium' ? 'border-orange-300 text-orange-700' :
                          'border-yellow-300 text-yellow-700'
                        }`}
                      >
                        {errorType}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        重试次数: {retryCount}/{this.maxRetries}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* 错误描述 */}
              <div className="text-sm text-red-700">
                <p className="mb-2">
                  抱歉，这个组件遇到了问题。我们已经记录了这个错误，请尝试以下解决方案：
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>刷新页面重新加载</li>
                  <li>检查网络连接</li>
                  <li>清除浏览器缓存</li>
                  {errorType === '权限错误' && <li>检查登录状态</li>}
                  {errorType === '网络错误' && <li>稍后重试</li>}
                </ul>
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center gap-2 flex-wrap">
                {canRetry && (
                  <Button
                    onClick={this.handleRetry}
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    重试 ({this.maxRetries - retryCount} 次剩余)
                  </Button>
                )}
                
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  重置
                </Button>

                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  刷新页面
                </Button>

                <Button
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Home className="h-3 w-3" />
                  返回首页
                </Button>
              </div>

              {/* 错误详情（开发模式或用户选择查看） */}
              {(process.env.NODE_ENV === 'development' || this.props.showDetails) && (
                <div className="border-t border-red-200 pt-4">
                  <Button
                    onClick={this.toggleDetails}
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 text-red-600 hover:text-red-700"
                  >
                    <Bug className="h-3 w-3" />
                    错误详情
                    {showDetails ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </Button>

                  {showDetails && error && (
                    <div className="mt-3 p-3 bg-red-100 rounded-lg">
                      <div className="space-y-2 text-xs font-mono">
                        <div>
                          <strong className="text-red-800">错误信息:</strong>
                          <pre className="mt-1 text-red-700 whitespace-pre-wrap break-words">
                            {error.message}
                          </pre>
                        </div>
                        
                        {error.stack && (
                          <div>
                            <strong className="text-red-800">错误堆栈:</strong>
                            <pre className="mt-1 text-red-700 whitespace-pre-wrap break-words max-h-32 overflow-y-auto">
                              {error.stack}
                            </pre>
                          </div>
                        )}
                        
                        {errorInfo?.componentStack && (
                          <div>
                            <strong className="text-red-800">组件堆栈:</strong>
                            <pre className="mt-1 text-red-700 whitespace-pre-wrap break-words max-h-32 overflow-y-auto">
                              {errorInfo.componentStack}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 帮助信息 */}
              <div className="text-xs text-red-600 bg-red-100 p-3 rounded-lg">
                <p className="font-medium mb-1">需要帮助？</p>
                <p>
                  如果问题持续存在，请联系技术支持并提供错误详情。
                  我们会尽快解决这个问题。
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// 高阶组件包装器
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook for error reporting
export function useErrorHandler() {
  const reportError = (error: Error, context?: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`Error in ${context}:`, error);
    } else {
      // 发送到错误报告服务
      console.warn('Error reported:', { error: error.message, context });
    }
  };

  return { reportError };
}
