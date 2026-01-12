'use client';

import { Component, ReactNode } from 'react';
import { Button, Result, Typography } from 'antd';
import { ReloadOutlined, HomeOutlined, BugOutlined } from '@ant-design/icons';

const { Paragraph, Text } = Typography;

interface ErrorBoundaryProps {
  children: ReactNode;
  /** 自定义错误回退UI */
  fallback?: ReactNode;
  /** 错误发生时的回调 */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** 是否显示错误详情（开发环境） */
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * 错误边界组件
 * 捕获子组件树中的 JavaScript 错误，记录错误并显示回退 UI
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    
    // 调用错误回调
    this.props.onError?.(error, errorInfo);
    
    // 在开发环境打印错误
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    
    // 可以在这里上报错误到监控服务
    // reportError(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, showDetails = process.env.NODE_ENV === 'development' } = this.props;

    if (hasError) {
      // 如果提供了自定义回退UI，使用它
      if (fallback) {
        return fallback;
      }

      // 默认错误UI
      return (
        <div className="flex min-h-[400px] items-center justify-center p-8">
          <Result
            status="error"
            title="页面出错了"
            subTitle="抱歉，页面遇到了一些问题。请尝试刷新页面或返回首页。"
            extra={[
              <Button
                key="reload"
                type="primary"
                icon={<ReloadOutlined />}
                onClick={this.handleReload}
              >
                刷新页面
              </Button>,
              <Button
                key="home"
                icon={<HomeOutlined />}
                onClick={this.handleGoHome}
              >
                返回首页
              </Button>,
              <Button
                key="retry"
                icon={<BugOutlined />}
                onClick={this.handleReset}
              >
                重试
              </Button>,
            ]}
          >
            {showDetails && error && (
              <div className="mt-4 text-left">
                <Paragraph>
                  <Text strong className="text-red-500">
                    错误信息：
                  </Text>
                </Paragraph>
                <Paragraph>
                  <pre className="max-h-[200px] overflow-auto rounded bg-gray-100 p-4 text-sm dark:bg-gray-800">
                    {error.message}
                  </pre>
                </Paragraph>
                {errorInfo && (
                  <>
                    <Paragraph>
                      <Text strong className="text-red-500">
                        组件堆栈：
                      </Text>
                    </Paragraph>
                    <Paragraph>
                      <pre className="max-h-[200px] overflow-auto rounded bg-gray-100 p-4 text-sm dark:bg-gray-800">
                        {errorInfo.componentStack}
                      </pre>
                    </Paragraph>
                  </>
                )}
              </div>
            )}
          </Result>
        </div>
      );
    }

    return children;
  }
}

/**
 * 页面级错误边界
 * 用于包裹整个页面
 */
export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // 可以在这里上报页面级错误
        console.error('Page error:', error);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * 组件级错误边界
 * 用于包裹可能出错的组件
 */
export function ComponentErrorBoundary({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const defaultFallback = (
    <div className="flex min-h-[100px] items-center justify-center rounded border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
      <Text type="danger">组件加载失败</Text>
    </div>
  );

  return (
    <ErrorBoundary fallback={fallback || defaultFallback}>
      {children}
    </ErrorBoundary>
  );
}

/**
 * 错误回退组件 - 简单版本
 */
export function ErrorFallback({
  error,
  resetError,
}: {
  error?: Error;
  resetError?: () => void;
}) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 p-8">
      <BugOutlined className="text-4xl text-red-500" />
      <Text type="danger" className="text-lg">
        出错了
      </Text>
      {error && (
        <Text type="secondary" className="text-sm">
          {error.message}
        </Text>
      )}
      {resetError && (
        <Button type="primary" onClick={resetError}>
          重试
        </Button>
      )}
    </div>
  );
}

/**
 * 异步组件错误边界
 * 用于 Suspense 配合使用
 */
export function AsyncErrorBoundary({
  children,
  onReset,
}: {
  children: ReactNode;
  onReset?: () => void;
}) {
  return (
    <ErrorBoundary
      fallback={
        <ErrorFallback
          resetError={() => {
            onReset?.();
            window.location.reload();
          }}
        />
      }
    >
      {children}
    </ErrorBoundary>
  );
}

export default ErrorBoundary;