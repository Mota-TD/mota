/**
 * WebSocket 客户端管理服务
 * 提供实时通信功能的统一接口
 */

import { EventEmitter } from 'events';

export interface WSMessage {
  type: string;
  payload: any;
  timestamp: number;
  userId?: string;
  projectId?: string;
}

export interface WSUser {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen?: number;
}

export interface WSEvent {
  user: WSUser;
  action: string;
  target: string;
  targetId: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface WSTypingIndicator {
  userId: string;
  userName: string;
  projectId: string;
  isTyping: boolean;
  timestamp: number;
}

class WebSocketClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private currentUser: WSUser | null = null;

  // 连接状态
  public isConnected = false;
  public isReconnecting = false;

  constructor() {
    super();
    this.connect();
  }

  /**
   * 建立WebSocket连接
   */
  private connect(): void {
    if (this.isConnecting || this.isConnected) {
      return;
    }

    try {
      this.isConnecting = true;
      
      // 在开发环境使用模拟WebSocket
      if (process.env.NODE_ENV === 'development') {
        this.setupMockWebSocket();
      } else {
        // 生产环境连接真实WebSocket服务
        const wsUrl = process.env.VITE_WS_URL || 'ws://localhost:8080/ws';
        this.ws = new WebSocket(wsUrl);
        this.setupEventHandlers();
      }
    } catch (error) {
      console.error('WebSocket连接失败:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  /**
   * 开发环境模拟WebSocket
   */
  private setupMockWebSocket(): void {
    // 模拟WebSocket连接
    setTimeout(() => {
      this.isConnecting = false;
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connected');
      this.startHeartbeat();
      
      // 模拟其他用户上线
      this.simulateUserActivity();
    }, 500);
  }

  /**
   * 设置WebSocket事件处理
   */
  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket 连接已建立');
      this.isConnecting = false;
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connected');
      this.startHeartbeat();
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WSMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('解析WebSocket消息失败:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket 连接已关闭');
      this.isConnected = false;
      this.stopHeartbeat();
      this.emit('disconnected');
      
      if (!this.isReconnecting) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket 连接错误:', error);
      this.emit('error', error);
    };
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(message: WSMessage): void {
    switch (message.type) {
      case 'user_online':
        this.emit('userOnline', message.payload);
        break;
      case 'user_offline':
        this.emit('userOffline', message.payload);
        break;
      case 'new_message':
        this.emit('newMessage', message.payload);
        break;
      case 'typing_start':
        this.emit('typingStart', message.payload);
        break;
      case 'typing_stop':
        this.emit('typingStop', message.payload);
        break;
      case 'activity_update':
        this.emit('activityUpdate', message.payload);
        break;
      case 'notification':
        this.emit('notification', message.payload);
        break;
      default:
        console.log('未知消息类型:', message.type);
    }
  }

  /**
   * 发送消息
   */
  public sendMessage(type: string, payload: any): void {
    if (!this.isConnected) {
      console.warn('WebSocket未连接，消息将被忽略');
      return;
    }

    const message: WSMessage = {
      type,
      payload,
      timestamp: Date.now(),
      userId: this.currentUser?.id,
    };

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // 开发环境模拟发送成功
      if (process.env.NODE_ENV === 'development') {
        console.log('模拟发送消息:', message);
        // 模拟消息回显
        setTimeout(() => {
          this.handleMessage({
            ...message,
            type: `${type}_ack`,
            timestamp: Date.now(),
          });
        }, 100);
      }
    }
  }

  /**
   * 用户上线
   */
  public userOnline(user: WSUser): void {
    this.currentUser = user;
    this.sendMessage('user_online', user);
  }

  /**
   * 用户下线
   */
  public userOffline(): void {
    if (this.currentUser) {
      this.sendMessage('user_offline', { userId: this.currentUser.id });
      this.currentUser = null;
    }
  }

  /**
   * 发送聊天消息
   */
  public sendChatMessage(content: string, projectId: string, mentions?: string[]): void {
    const message = {
      content,
      projectId,
      mentions: mentions || [],
      sender: this.currentUser,
    };
    this.sendMessage('chat_message', message);
  }

  /**
   * 发送打字指示器
   */
  public sendTypingIndicator(isTyping: boolean, projectId: string): void {
    const indicator: WSTypingIndicator = {
      userId: this.currentUser?.id || '',
      userName: this.currentUser?.name || '',
      projectId,
      isTyping,
      timestamp: Date.now(),
    };
    this.sendMessage(isTyping ? 'typing_start' : 'typing_stop', indicator);
  }

  /**
   * 发送活动事件
   */
  public sendActivity(action: string, target: string, targetId: string, metadata?: Record<string, any>): void {
    const event: WSEvent = {
      user: this.currentUser!,
      action,
      target,
      targetId,
      timestamp: Date.now(),
      metadata,
    };
    this.sendMessage('activity', event);
  }

  /**
   * 开始心跳
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      }
    }, 30000); // 30秒心跳
  }

  /**
   * 停止心跳
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * 安排重连
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('达到最大重连次数，停止重连');
      this.emit('maxReconnectAttemptsReached');
      return;
    }

    this.isReconnecting = true;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`${delay}ms 后尝试第 ${this.reconnectAttempts + 1} 次重连`);
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  /**
   * 模拟用户活动（开发环境）
   */
  private simulateUserActivity(): void {
    if (process.env.NODE_ENV !== 'development') return;

    const mockUsers: WSUser[] = [
      { id: 'user1', name: '张三', status: 'online', avatar: '/avatar1.jpg' },
      { id: 'user2', name: '李四', status: 'away', avatar: '/avatar2.jpg' },
      { id: 'user3', name: '王五', status: 'busy', avatar: '/avatar3.jpg' },
    ];

    // 模拟用户上线
    setTimeout(() => {
      mockUsers.forEach((user, index) => {
        setTimeout(() => {
          this.emit('userOnline', user);
        }, index * 1000);
      });
    }, 2000);

    // 模拟活动事件
    setTimeout(() => {
      this.emit('activityUpdate', {
        user: mockUsers[0],
        action: 'updated',
        target: 'task',
        targetId: 'task123',
        timestamp: Date.now(),
        metadata: { taskName: '完成UI设计' }
      });
    }, 5000);

    // 模拟新消息
    setTimeout(() => {
      this.emit('newMessage', {
        id: 'msg1',
        content: '大家好，项目进展如何？',
        sender: mockUsers[0],
        timestamp: Date.now(),
        projectId: 'project1',
      });
    }, 8000);
  }

  /**
   * 断开连接
   */
  public disconnect(): void {
    this.isReconnecting = false;
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.isConnected = false;
    this.emit('disconnected');
  }

  /**
   * 获取连接状态
   */
  public getConnectionState(): {
    isConnected: boolean;
    isReconnecting: boolean;
    reconnectAttempts: number;
  } {
    return {
      isConnected: this.isConnected,
      isReconnecting: this.isReconnecting,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}

// 单例模式
export const wsClient = new WebSocketClient();
export default wsClient;