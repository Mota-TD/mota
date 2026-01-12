'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { notification } from 'antd';
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
  destroyWebSocketService,
} from '@/lib/websocket';

interface WebSocketContextValue {
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  send: <T>(type: WebSocketMessageType, action: string, payload: T, targetId?: string) => void;
  subscribe: <T>(type: WebSocketMessageType, handler: MessageHandler<T>) => () => void;
  unsubscribe: (type: WebSocketMessageType, handler?: MessageHandler) => void;
  notifications: NotificationPayload[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

interface WebSocketProviderProps {
  children: ReactNode;
  autoConnect?: boolean;
  showNotifications?: boolean;
}

export function WebSocketProvider({
  children,
  autoConnect = true,
  showNotifications = true,
}: WebSocketProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [wsService, setWsService] = useState<WebSocketService | null>(null);
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const [api, contextHolder] = notification.useNotification();

  // 计算未读数量
  const unreadCount = notifications.filter((n) => !n.read).length;

  // 初始化WebSocket
  const initWebSocket = useCallback(() => {
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
      },
      onClose: () => {
        setIsConnected(false);
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
    if (!wsService) {
      const ws = initWebSocket();
      if (ws) {
        setWsService(ws);
        ws.connect();
      }
    } else {
      wsService.connect();
    }
  }, [wsService, initWebSocket]);

  // 断开连接
  const disconnect = useCallback(() => {
    wsService?.disconnect();
    setIsConnected(false);
  }, [wsService]);

  // 发送消息
  const send = useCallback(<T,>(
    type: WebSocketMessageType,
    action: string,
    payload: T,
    targetId?: string
  ) => {
    wsService?.send(type, action, payload, targetId);
  }, [wsService]);

  // 订阅消息
  const subscribe = useCallback(<T,>(
    type: WebSocketMessageType,
    handler: MessageHandler<T>
  ): (() => void) => {
    return wsService?.subscribe(type, handler) || (() => {});
  }, [wsService]);

  // 取消订阅
  const unsubscribe = useCallback((
    type: WebSocketMessageType,
    handler?: MessageHandler
  ) => {
    wsService?.unsubscribe(type, handler);
  }, [wsService]);

  // 标记已读
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  // 标记全部已读
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // 清空通知
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // 处理通知消息
  const handleNotification = useCallback((msg: WebSocketMessage<NotificationPayload>) => {
    const notif = msg.payload;
    
    // 添加到通知列表
    setNotifications((prev) => [notif, ...prev].slice(0, 100)); // 最多保留100条

    // 显示通知弹窗
    if (showNotifications) {
      const notifyMethod = {
        info: api.info,
        success: api.success,
        warning: api.warning,
        error: api.error,
      }[notif.type] || api.info;

      notifyMethod({
        message: notif.title,
        description: notif.content,
        placement: 'topRight',
        duration: 4.5,
        onClick: () => {
          markAsRead(notif.id);
          if (notif.link) {
            window.location.href = notif.link;
          }
        },
      });
    }
  }, [showNotifications, api, markAsRead]);

  // 处理任务更新
  const handleTaskUpdate = useCallback((msg: WebSocketMessage<TaskUpdatePayload>) => {
    const update = msg.payload;
    
    if (showNotifications) {
      const actionText: Record<string, string> = {
        created: '创建了新任务',
        updated: '更新了任务',
        deleted: '删除了任务',
        status_changed: '更改了任务状态',
        assigned: '分配了任务',
      };

      api.info({
        message: '任务更新',
        description: `${update.updatedBy.name} ${actionText[update.action] || '更新了任务'}`,
        placement: 'topRight',
        duration: 3,
      });
    }
  }, [showNotifications, api]);

  // 初始化
  useEffect(() => {
    if (autoConnect) {
      const ws = initWebSocket();
      if (ws) {
        setWsService(ws);
        ws.connect();

        // 订阅通知
        ws.subscribe<NotificationPayload>('notification', handleNotification);
        ws.subscribe<TaskUpdatePayload>('task_update', handleTaskUpdate);
      }
    }

    return () => {
      destroyWebSocketService();
    };
  }, [autoConnect, initWebSocket, handleNotification, handleTaskUpdate]);

  const value: WebSocketContextValue = {
    isConnected,
    connect,
    disconnect,
    send,
    subscribe,
    unsubscribe,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {contextHolder}
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext(): WebSocketContextValue {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
}

export default WebSocketProvider;