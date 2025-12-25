import { Component, ErrorInfo, ReactNode } from 'react'
import { Result, Button, Typography, Space } from 'antd'
import { ReloadOutlined, HomeOutlined } from '@ant-design/icons'

const { Paragraph, Text } = Typography

interface Props {
  children: ReactNode
  /** 自定义错误回退UI */
  fallback?: ReactNode
  /** 错误发生时的回调 */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

/**
 * 错误边界组件
 * 用于捕获子组件树中的 JavaScript 错误，记录错误并显示备用 UI
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误信息
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // 保存错误信息到 state
    this.setState({ errorInfo })
    
    // 调用错误回调
    this.props.onError?.(error, errorInfo)
    
    // 这里可以将错误日志上报到服务器
    // reportErrorToServer(error, errorInfo)
  }

  /**
   * 刷新页面
   */
  handleReload = () => {
    window.location.reload()
  }

  /**
   * 返回首页
   */
  handleGoHome = () => {
    window.location.href = '/'
  }

  /**
   * 重置错误状态
   */
  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义的 fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 默认的错误 UI
      const isDev = import.meta.env.DEV

      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            padding: '24px',
            backgroundColor: '#f5f5f5',
          }}
        >
          <Result
            status="error"
            title="页面出错了"
            subTitle="抱歉，页面发生了错误，请刷新重试或返回首页"
            extra={
              <Space>
                <Button type="primary" icon={<ReloadOutlined />} onClick={this.handleReload}>
                  刷新页面
                </Button>
                <Button icon={<HomeOutlined />} onClick={this.handleGoHome}>
                  返回首页
                </Button>
              </Space>
            }
          >
            {isDev && this.state.error && (
              <div style={{ textAlign: 'left', marginTop: 24 }}>
                <Paragraph>
                  <Text strong style={{ fontSize: 16 }}>
                    错误信息（仅开发环境显示）:
                  </Text>
                </Paragraph>
                <Paragraph>
                  <Text type="danger" code>
                    {this.state.error.toString()}
                  </Text>
                </Paragraph>
                {this.state.errorInfo && (
                  <Paragraph>
                    <pre
                      style={{
                        fontSize: 12,
                        maxHeight: 200,
                        overflow: 'auto',
                        backgroundColor: '#fff',
                        padding: 12,
                        borderRadius: 4,
                        border: '1px solid #d9d9d9',
                      }}
                    >
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </Paragraph>
                )}
              </div>
            )}
          </Result>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary