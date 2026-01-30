/**
 * AI流式通信实现
 * 使用WebSocket实现流式响应
 */

import type { AIStreamEvent, SSEConnectionState, SSEEventCallbacks } from './types'

export class AIStreamClient {
  private ws: UniApp.SocketTask | null = null
  private url: string
  private state: SSEConnectionState = SSEConnectionState.DISCONNECTED
  private callbacks: SSEEventCallbacks = {}
  private reconnectAttempts = 0
  private maxReconnectAttempts = 3
  private reconnectDelay = 1000

  constructor(url: string) {
    this.url = url
  }

  /**
   * 连接WebSocket
   */
  connect(callbacks: SSEEventCallbacks): void {
    this.callbacks = callbacks
    this.state = SSEConnectionState.CONNECTING

    // 获取token
    const token = uni.getStorageSync('token')
    const wsUrl = this.url.replace(/^http/, 'ws')
    const urlWithToken = `${wsUrl}?token=${token}`

    this.ws = uni.connectSocket({
      url: urlWithToken,
      success: () => {
        console.log('WebSocket连接成功')
      },
      fail: (error) => {
        console.error('WebSocket连接失败:', error)
        this.handleError(new Error('连接失败'))
      }
    })

    // 监听连接打开
    this.ws.onOpen(() => {
      this.state = SSEConnectionState.CONNECTED
      this.reconnectAttempts = 0
      this.callbacks.onOpen?.()
    })

    // 监听消息
    this.ws.onMessage((res) => {
      try {
        const event = JSON.parse(res.data as string) as AIStreamEvent
        this.callbacks.onMessage?.(event)
      } catch (error) {
        console.error('解析消息失败:', error)
      }
    })

    // 监听错误
    this.ws.onError((error) => {
      console.error('WebSocket错误:', error)
      this.handleError(new Error('连接错误'))
    })

    // 监听关闭
    this.ws.onClose(() => {
      this.state = SSEConnectionState.DISCONNECTED
      this.callbacks.onClose?.()
      
      // 尝试重连
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++
        setTimeout(() => {
          console.log(`尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
          this.connect(this.callbacks)
        }, this.reconnectDelay * this.reconnectAttempts)
      }
    })
  }

  /**
   * 发送消息
   */
  send(data: any): void {
    if (this.state !== SSEConnectionState.CONNECTED || !this.ws) {
      throw new Error('WebSocket未连接')
    }

    this.ws.send({
      data: JSON.stringify(data),
      success: () => {
        console.log('消息发送成功')
      },
      fail: (error) => {
        console.error('消息发送失败:', error)
        this.handleError(new Error('发送失败'))
      }
    })
  }

  /**
   * 关闭连接
   */
  close(): void {
    if (this.ws) {
      this.ws.close({
        success: () => {
          console.log('WebSocket已关闭')
        }
      })
      this.ws = null
    }
    this.state = SSEConnectionState.DISCONNECTED
  }

  /**
   * 获取连接状态
   */
  getState(): SSEConnectionState {
    return this.state
  }

  /**
   * 处理错误
   */
  private handleError(error: Error): void {
    this.state = SSEConnectionState.ERROR
    this.callbacks.onError?.(error)
  }
}

/**
 * 创建AI流式对话客户端
 */
export function createAIStreamClient(conversationId?: string): AIStreamClient {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
  const wsUrl = `${baseUrl}/api/ai/stream/chat${conversationId ? `?conversationId=${conversationId}` : ''}`
  return new AIStreamClient(wsUrl)
}

/**
 * 流式发送消息的便捷方法
 */
export async function streamChat(
  message: string,
  options: {
    conversationId?: string
    projectId?: string
    taskId?: string
    onChunk: (content: string) => void
    onComplete?: () => void
    onError?: (error: Error) => void
  }
): Promise<void> {
  return new Promise((resolve, reject) => {
    const client = createAIStreamClient(options.conversationId)
    let fullContent = ''

    client.connect({
      onOpen: () => {
        // 连接成功后发送消息
        client.send({
          message,
          projectId: options.projectId,
          taskId: options.taskId
        })
      },
      onMessage: (event) => {
        switch (event.type) {
          case 'start':
            fullContent = ''
            break
          case 'chunk':
            if (event.content) {
              fullContent += event.content
              options.onChunk(event.content)
            }
            break
          case 'end':
            options.onComplete?.()
            client.close()
            resolve()
            break
          case 'error':
            const error = new Error(event.error || '未知错误')
            options.onError?.(error)
            client.close()
            reject(error)
            break
        }
      },
      onError: (error) => {
        options.onError?.(error)
        client.close()
        reject(error)
      },
      onClose: () => {
        // 连接关闭
      }
    })
  })
}

export default {
  AIStreamClient,
  createAIStreamClient,
  streamChat
}