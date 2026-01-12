/**
 * WebSocket 实时通知服务
 * 提供实时消息推送、通知、协作编辑等功能
 */

export type WebSocketMessageType =
  | 'notification'
  | 'task_update'
  | 'project_update'
  | 'document_update'
  | 'chat_message'
  | 'user_status'
  | 'collaboration'
  | 'system';

export interface WebSocketMessage<T = unknown> {
  type: WebSocketMessageType;
  action: string;
  payload: T;
  timestamp: number;
  senderId?: string;
  targetId?: string;
}

export interface NotificationPayload {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface TaskUpdatePayload {
  taskId: string;
  projectId: string;
  action: 'created' | 'updated' | 'deleted' | 'status_changed' | 'assigned';
  data: Record<string, unknown>;
  updatedBy: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface DocumentUpdatePayload {
  documentId: string;
  action: 'content_changed' | 'cursor_moved' | 'user_joined' | 'user_left' | 'comment_added';
  data: Record<string, unknown>;
  user: {
    id: string;
    name: string;
    avatar?: string;
    color?: string;
  };
}

export interface UserStatusPayload {
  userId: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen?: string;
}

export type MessageHandler<T = unknown> = (message: WebSocketMessage<T>) => void;

export interface WebSocketOptions {
  url: string;
  token?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (error: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
  onReconnect?: (attempt: number) => void;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private options: Required<WebSocketOptions>;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private messageHandlers: Map<WebSocketMessageType, Set<MessageHandler>> = new Map();
  private isManualClose = false;
  private messageQueue: WebSocketMessage[] = [];

  constructor(options: WebSocketOptions) {
    this.options = {
      reconnectInterval: 3000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      onOpen: () => {},
      onClose: () => {},
      onError: () => {},
      onMessage: () => {},
      onReconnect: () => {},
      ...options,
    };
  }

  /**
   * 连接WebSocket服务器
   */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    this.isManualClose = false;
    const url = this.options.token
      ? `${this.options.url}?token=${this.options.token}`
      : this.options.url;

    try {
      this.ws = new WebSocket(url);
      this.setupEventHandlers();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * 断开WebSocket连接
   */
  disconnect(): void {
    this.isManualClose = true;
    this.clearTimers();
    
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
  }

  /**
   * 发送消息
   */
  send<T>(type: WebSocketMessageType, action: string, payload: T, targetId?: string): void {
    const message: WebSocketMessage<T> = {
      type,
      action,
      payload,
      timestamp: Date.now(),
      targetId,
    };

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // 如果连接未就绪，将消息加入队列
      this.messageQueue.push(message as WebSocketMessage);
      console.log('WebSocket not ready, message queued');
    }
  }

  /**
   * 订阅特定类型的消息
   */
  subscribe<T>(type: WebSocketMessageType, handler: MessageHandler<T>): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    
    this.messageHandlers.get(type)!.add(handler as MessageHandler);

    // 返回取消订阅函数
    return () => {
      this.messageHandlers.get(type)?.delete(handler as MessageHandler);
    };
  }

  /**
   * 取消订阅
   */
  unsubscribe(type: WebSocketMessageType, handler?: MessageHandler): void {
    if (handler) {
      this.messageHandlers.get(type)?.delete(handler);
    } else {
      this.messageHandlers.delete(type);
    }
  }

  /**
   * 获取连接状态
   */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * 获取连接状态
   */
  get readyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.flushMessageQueue();
      this.options.onOpen();
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      this.clearTimers();
      this.options.onClose(event);

      if (!this.isManualClose) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.options.onError(error);
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
  }

  private handleMessage(message: WebSocketMessage): void {
    // 处理心跳响应
    if (message.type === 'system' && message.action === 'pong') {
      return;
    }

    // 调用全局消息处理器
    this.options.onMessage(message);

    // 调用特定类型的处理器
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(message);
        } catch (error) {
          console.error('Message handler error:', error);
        }
      });
    }
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send('system', 'ping', { timestamp: Date.now() });
      }
    }, this.options.heartbeatInterval);
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    this.options.onReconnect(this.reconnectAttempts);

    console.log(`Reconnecting in ${this.options.reconnectInterval}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, this.options.reconnectInterval);
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(message));
      }
    }
  }

  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}

// 创建单例实例
let wsInstance: WebSocketService | null = null;

export function getWebSocketService(): WebSocketService | null {
  return wsInstance;
}

export function createWebSocketService(options: WebSocketOptions): WebSocketService {
  if (wsInstance) {
    wsInstance.disconnect();
  }
  wsInstance = new WebSocketService(options);
  return wsInstance;
}

export function destroyWebSocketService(): void {
  if (wsInstance) {
    wsInstance.disconnect();
    wsInstance = null;
  }
}