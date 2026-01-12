'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { message } from 'antd';
import {
  WebSocketService,
  WebSocketMessage,
  WebSocketMessageType,
  MessageHandler,
  NotificationPayload,
  TaskUpdatePayload,
  DocumentUpdatePayload,
  UserStatusPayload,
  createWebSocketService,
  getWebSocketService,
  destroyWebSocketService,
} from '@/lib/websocket';

export interface UseWebSocketOptions {
  autoConnect?: boolean;
  showNotifications?: boolean;
  onNotification?: (notification: NotificationPayload) => void;
  onTaskUpdate?: (update: TaskUpdatePayload) => void;
  onDocumentUpdate?: (update: DocumentUpdatePayload) => void;
  onUserStatus?: (status: UserStatusPayload) => void;
}

export interface UseWebSocketReturn {
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  send: <T>(type: WebSocketMessageType, action: string, payload: T, targetId?: string) => void;
  subscribe: <T>(type: WebSocketMessageType, handler: MessageHandler<T>) => () => void;
  unsubscribe: (type: WebSocketMessageType, handler?: MessageHandler) => void;
}

/**
 * WebSocket Hook
 * 提供WebSocket连接管理和消息处理
 */
export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    autoConnect = true,
    showNotifications = true,
    onNotification,
    onTaskUpdate,
    onDocumentUpdate,
    onUserStatus,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocketService | null>(null);
  const unsubscribersRef = useRef<Array<() => void>>([]);

  // 初始化WebSocket连接
  const initWebSocket = useCallback(() => {
    // 获取token
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('access_token') 
      : null;

    if (!token) {
      console.log('No token found, skipping WebSocket connection');
      return null;
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws';

    const ws = createWebSocketService({
      url: wsUrl,
      token,
      reconnectInterval: 3000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      onOpen: () => {
        setIsConnected(true);
        console.log('WebSocket connected');
      },
      onClose: () => {
        setIsConnected(false);
        console.log('WebSocket disconnected');
      },
      onError: (error) => {
        console.error('WebSocket error:', error);
      },
      onReconnect: (attempt) => {
        console.log(`WebSocket reconnecting... (attempt ${attempt})`);
      },
    });

    return ws;
  }, []);

  // 连接
  const connect = useCallback(() => {
    if (!wsRef.current) {
      wsRef.current = initWebSocket();
    }
    wsRef.current?.connect();
  }, [initWebSocket]);

  // 断开连接
  const disconnect = useCallback(() => {
    wsRef.current?.disconnect();
    setIsConnected(false);
  }, []);

  // 发送消息
  const send = useCallback(<T,>(
    type: WebSocketMessageType,
    action: string,
    payload: T,
    targetId?: string
  ) => {
    wsRef.current?.send(type, action, payload, targetId);
  }, []);

  // 订阅消息
  const subscribe = useCallback(<T,>(
    type: WebSocketMessageType,
    handler: MessageHandler<T>
  ): (() => void) => {
    const unsubscribe = wsRef.current?.subscribe(type, handler);
    if (unsubscribe) {
      unsubscribersRef.current.push(unsubscribe);
    }
    return unsubscribe || (() => {});
  }, []);

  // 取消订阅
  const unsubscribe = useCallback((
    type: WebSocketMessageType,
    handler?: MessageHandler
  ) => {
    wsRef.current?.unsubscribe(type, handler);
  }, []);

  // 处理通知消息
  const handleNotification = useCallback((msg: WebSocketMessage<NotificationPayload>) => {
    const notification = msg.payload;
    
    // 显示通知提示
    if (showNotifications) {
      const notifyMethod = {
        info: message.info,
        success: message.success,
        warning: message.warning,
        error: message.error,
      }[notification.type] || message.info;

      notifyMethod(notification.title);
    }

    // 调用回调
    onNotification?.(notification);
  }, [showNotifications, onNotification]);

  // 处理任务更新
  const handleTaskUpdate = useCallback((msg: WebSocketMessage<TaskUpdatePayload>) => {
    const update = msg.payload;
    
    if (showNotifications) {
      const actionText = {
        created: '创建了新任务',
        updated: '更新了任务',
        deleted: '删除了任务',
        status_changed: '更改了任务状态',
        assigned: '分配了任务',
      }[update.action];

      message.info(`${update.updatedBy.name} ${actionText}`);
    }

    onTaskUpdate?.(update);
  }, [showNotifications, onTaskUpdate]);

  // 处理文档更新
  const handleDocumentUpdate = useCallback((msg: WebSocketMessage<DocumentUpdatePayload>) => {
    onDocumentUpdate?.(msg.payload);
  }, [onDocumentUpdate]);

  // 处理用户状态
  const handleUserStatus = useCallback((msg: WebSocketMessage<UserStatusPayload>) => {
    onUserStatus?.(msg.payload);
  }, [onUserStatus]);

  // 初始化和清理
  useEffect(() => {
    if (autoConnect) {
      wsRef.current = initWebSocket();
      wsRef.current?.connect();

      // 订阅各类消息
      const unsubNotification = wsRef.current?.subscribe<NotificationPayload>(
        'notification',
        handleNotification
      );
      const unsubTask = wsRef.current?.subscribe<TaskUpdatePayload>(
        'task_update',
        handleTaskUpdate
      );
      const unsubDocument = wsRef.current?.subscribe<DocumentUpdatePayload>(
        'document_update',
        handleDocumentUpdate
      );
      const unsubUserStatus = wsRef.current?.subscribe<UserStatusPayload>(
        'user_status',
        handleUserStatus
      );

      if (unsubNotification) unsubscribersRef.current.push(unsubNotification);
      if (unsubTask) unsubscribersRef.current.push(unsubTask);
      if (unsubDocument) unsubscribersRef.current.push(unsubDocument);
      if (unsubUserStatus) unsubscribersRef.current.push(unsubUserStatus);
    }

    return () => {
      // 清理所有订阅
      unsubscribersRef.current.forEach((unsub) => unsub());
      unsubscribersRef.current = [];
      
      // 断开连接
      destroyWebSocketService();
    };
  }, [
    autoConnect,
    initWebSocket,
    handleNotification,
    handleTaskUpdate,
    handleDocumentUpdate,
    handleUserStatus,
  ]);

  return {
    isConnected,
    connect,
    disconnect,
    send,
    subscribe,
    unsubscribe,
  };
}

/**
 * 获取WebSocket服务实例
 */
export function useWebSocketService(): WebSocketService | null {
  return getWebSocketService();
}

export default useWebSocket;