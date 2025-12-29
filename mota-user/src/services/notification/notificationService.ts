/**
 * 实时通知系统服务
 * 统一管理系统内的各类通知和消息推送
 */

import { EventEmitter } from 'events';
import { wsClient, WSMessage, WSUser } from '../websocket/wsClient';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'mention' | 'task_update' | 'project_update';
  title: string;
  message: string;
  timestamp: number;
  userId: string;
  projectId?: string;
  taskId?: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
  sender?: WSUser;
}

export interface NotificationSettings {
  enableDesktop: boolean;
  enableSound: boolean;
  enableTaskUpdates: boolean;
  enableProjectUpdates: boolean;
  enableMentions: boolean;
  enableComments: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  urgentOnly: boolean;
}

class NotificationService extends EventEmitter {
  private notifications: Map<string, Notification> = new Map();
  private settings: NotificationSettings = {
    enableDesktop: true,
    enableSound: true,
    enableTaskUpdates: true,
    enableProjectUpdates: true,
    enableMentions: true,
    enableComments: true,
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
    },
    urgentOnly: false,
  };
  
  private currentUserId: string | null = null;
  private soundEnabled = true;
  private maxNotifications = 100;

  constructor() {
    super();
    this.initializeWebSocketHandlers();
    this.loadSettings();
    this.requestNotificationPermission();
  }

  /**
   * 初始化WebSocket事件处理
   */
  private initializeWebSocketHandlers(): void {
    wsClient.on('newMessage', (message) => {
      this.handleNewMessage(message);
    });

    wsClient.on('activityUpdate', (activity) => {
      this.handleActivityUpdate(activity);
    });

    wsClient.on('notification', (notification) => {
      this.handleRemoteNotification(notification);
    });

    wsClient.on('userOnline', (user) => {
      this.handleUserStatusChange(user, 'online');
    });

    wsClient.on('userOffline', (user) => {
      this.handleUserStatusChange(user, 'offline');
    });
  }

  /**
   * 设置当前用户
   */
  public setCurrentUser(userId: string): void {
    this.currentUserId = userId;
    this.loadUserNotifications();
  }

  /**
   * 创建通知
   */
  public createNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>): string {
    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullNotification: Notification = {
      ...notification,
      id,
      timestamp: Date.now(),
      isRead: false,
    };

    this.notifications.set(id, fullNotification);
    this.emit('notificationCreated', fullNotification);

    // 检查是否需要显示通知
    if (this.shouldShowNotification(fullNotification)) {
      this.showNotification(fullNotification);
    }

    // 限制通知数量
    this.limitNotifications();

    return id;
  }

  /**
   * 处理新消息
   */
  private handleNewMessage(message: any): void {
    // 检查是否提到了当前用户
    const mentions = message.mentions || [];
    const isMentioned = mentions.includes(this.currentUserId);

    if (isMentioned && this.settings.enableMentions) {
      this.createNotification({
        type: 'mention',
        title: `${message.sender?.name} 提到了你`,
        message: message.content,
        userId: this.currentUserId!,
        projectId: message.projectId,
        priority: 'high',
        sender: message.sender,
        actionUrl: `/projects/${message.projectId}`,
        actionText: '查看详情',
        metadata: { messageId: message.id }
      });
    } else if (this.settings.enableComments) {
      // 普通消息通知
      this.createNotification({
        type: 'info',
        title: '新消息',
        message: `${message.sender?.name}: ${message.content}`,
        userId: this.currentUserId!,
        projectId: message.projectId,
        priority: 'medium',
        sender: message.sender,
        actionUrl: `/projects/${message.projectId}`,
        actionText: '查看详情',
        metadata: { messageId: message.id }
      });
    }
  }

  /**
   * 处理活动更新
   */
  private handleActivityUpdate(activity: any): void {
    if (!this.currentUserId || activity.user?.id === this.currentUserId) {
      return; // 不通知自己的操作
    }

    let notificationType: Notification['type'] = 'info';
    let title = '';
    let message = '';
    let priority: Notification['priority'] = 'medium';

    switch (activity.action) {
      case 'created':
        if (activity.target === 'task') {
          title = '新任务创建';
          message = `${activity.user.name} 创建了任务"${activity.metadata?.taskName}"`;
          notificationType = 'task_update';
        } else if (activity.target === 'project') {
          title = '新项目创建';
          message = `${activity.user.name} 创建了项目"${activity.metadata?.projectName}"`;
          notificationType = 'project_update';
        }
        break;

      case 'updated':
        if (activity.target === 'task') {
          title = '任务更新';
          message = `${activity.user.name} 更新了任务"${activity.metadata?.taskName}"`;
          notificationType = 'task_update';
        }
        break;

      case 'completed':
        title = '任务完成';
        message = `${activity.user.name} 完成了任务"${activity.metadata?.taskName}"`;
        notificationType = 'success';
        priority = 'high';
        break;

      case 'assigned':
        if (activity.metadata?.assigneeId === this.currentUserId) {
          title = '新任务分配';
          message = `${activity.user.name} 给你分配了任务"${activity.metadata?.taskName}"`;
          notificationType = 'task_update';
          priority = 'high';
        }
        break;
    }

    if (title && message) {
      this.createNotification({
        type: notificationType,
        title,
        message,
        userId: this.currentUserId!,
        projectId: activity.metadata?.projectId,
        taskId: activity.targetId,
        priority,
        sender: activity.user,
        actionUrl: activity.target === 'task' ? `/tasks/${activity.targetId}` : `/projects/${activity.metadata?.projectId}`,
        actionText: '查看详情',
        metadata: activity.metadata
      });
    }
  }

  /**
   * 处理远程通知
   */
  private handleRemoteNotification(notification: any): void {
    this.createNotification({
      type: notification.type || 'info',
      title: notification.title,
      message: notification.message,
      userId: this.currentUserId!,
      priority: notification.priority || 'medium',
      projectId: notification.projectId,
      taskId: notification.taskId,
      actionUrl: notification.actionUrl,
      actionText: notification.actionText,
      metadata: notification.metadata
    });
  }

  /**
   * 处理用户状态变化
   */
  private handleUserStatusChange(user: WSUser, status: 'online' | 'offline'): void {
    if (user.id === this.currentUserId) return;

    // 只对关注的用户显示上线通知
    if (status === 'online' && this.isFollowedUser(user.id)) {
      this.createNotification({
        type: 'info',
        title: '用户上线',
        message: `${user.name} 现在在线`,
        userId: this.currentUserId!,
        priority: 'low',
        sender: user,
        metadata: { userStatus: status }
      });
    }
  }

  /**
   * 显示通知
   */
  private showNotification(notification: Notification): void {
    // 检查静音时间
    if (this.isQuietTime()) {
      return;
    }

    // 检查紧急模式
    if (this.settings.urgentOnly && notification.priority !== 'urgent') {
      return;
    }

    // 显示桌面通知
    if (this.settings.enableDesktop && 'Notification' in window && Notification.permission === 'granted') {
      const desktopNotification = new Notification(notification.title, {
        body: notification.message,
        icon: notification.sender?.avatar || '/notification-icon.png',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent',
      });

      desktopNotification.onclick = () => {
        if (notification.actionUrl) {
          window.focus();
          window.location.href = notification.actionUrl;
        }
        desktopNotification.close();
      };

      // 自动关闭通知
      setTimeout(() => {
        desktopNotification.close();
      }, notification.priority === 'urgent' ? 10000 : 5000);
    }

    // 播放提示音
    if (this.settings.enableSound && this.soundEnabled) {
      this.playNotificationSound(notification.type);
    }

    // 发送到UI层
    this.emit('showNotification', notification);
  }

  /**
   * 播放通知提示音
   */
  private playNotificationSound(type: Notification['type']): void {
    try {
      const audio = new Audio();
      
      switch (type) {
        case 'mention':
          audio.src = '/sounds/mention.mp3';
          break;
        case 'success':
          audio.src = '/sounds/success.mp3';
          break;
        case 'warning':
          audio.src = '/sounds/warning.mp3';
          break;
        case 'error':
          audio.src = '/sounds/error.mp3';
          break;
        default:
          audio.src = '/sounds/notification.mp3';
      }
      
      audio.volume = 0.5;
      audio.play().catch(error => {
        console.log('播放提示音失败:', error);
      });
    } catch (error) {
      console.log('创建音频对象失败:', error);
    }
  }

  /**
   * 检查是否应该显示通知
   */
  private shouldShowNotification(notification: Notification): boolean {
    // 检查设置
    if (!this.settings.enableTaskUpdates && notification.type === 'task_update') {
      return false;
    }
    
    if (!this.settings.enableProjectUpdates && notification.type === 'project_update') {
      return false;
    }
    
    if (!this.settings.enableMentions && notification.type === 'mention') {
      return false;
    }

    return true;
  }

  /**
   * 检查是否在静音时间
   */
  private isQuietTime(): boolean {
    if (!this.settings.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    const startTime = this.settings.quietHours.startTime;
    const endTime = this.settings.quietHours.endTime;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  /**
   * 检查是否是关注的用户
   */
  private isFollowedUser(userId: string): boolean {
    // 这里可以从用户设置或API获取关注列表
    // 暂时返回false，只对特定用户显示上线通知
    return false;
  }

  /**
   * 请求通知权限
   */
  private requestNotificationPermission(): void {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('通知权限已获得');
        }
      });
    }
  }

  /**
   * 标记通知为已读
   */
  public markAsRead(notificationId: string): void {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.isRead = true;
      this.notifications.set(notificationId, notification);
      this.emit('notificationRead', notification);
    }
  }

  /**
   * 标记所有通知为已读
   */
  public markAllAsRead(): void {
    this.notifications.forEach((notification) => {
      if (!notification.isRead) {
        notification.isRead = true;
        this.notifications.set(notification.id, notification);
      }
    });
    this.emit('allNotificationsRead');
  }

  /**
   * 删除通知
   */
  public deleteNotification(notificationId: string): void {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      this.notifications.delete(notificationId);
      this.emit('notificationDeleted', notification);
    }
  }

  /**
   * 清空所有通知
   */
  public clearAllNotifications(): void {
    this.notifications.clear();
    this.emit('allNotificationsCleared');
  }

  /**
   * 获取通知列表
   */
  public getNotifications(filter?: {
    unreadOnly?: boolean;
    type?: Notification['type'];
    projectId?: string;
  }): Notification[] {
    let notifications = Array.from(this.notifications.values());

    // 按时间倒序排列
    notifications.sort((a, b) => b.timestamp - a.timestamp);

    // 应用过滤器
    if (filter) {
      if (filter.unreadOnly) {
        notifications = notifications.filter(n => !n.isRead);
      }
      if (filter.type) {
        notifications = notifications.filter(n => n.type === filter.type);
      }
      if (filter.projectId) {
        notifications = notifications.filter(n => n.projectId === filter.projectId);
      }
    }

    return notifications;
  }

  /**
   * 获取未读通知数量
   */
  public getUnreadCount(): number {
    return Array.from(this.notifications.values()).filter(n => !n.isRead).length;
  }

  /**
   * 更新设置
   */
  public updateSettings(settings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...settings };
    this.saveSettings();
    this.emit('settingsUpdated', this.settings);
  }

  /**
   * 获取设置
   */
  public getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  /**
   * 限制通知数量
   */
  private limitNotifications(): void {
    if (this.notifications.size > this.maxNotifications) {
      const notifications = this.getNotifications();
      const toDelete = notifications.slice(this.maxNotifications);
      
      toDelete.forEach(notification => {
        this.notifications.delete(notification.id);
      });
    }
  }

  /**
   * 加载设置
   */
  private loadSettings(): void {
    try {
      const saved = localStorage.getItem('notification_settings');
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('加载通知设置失败:', error);
    }
  }

  /**
   * 保存设置
   */
  private saveSettings(): void {
    try {
      localStorage.setItem('notification_settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('保存通知设置失败:', error);
    }
  }

  /**
   * 加载用户通知
   */
  private loadUserNotifications(): void {
    if (!this.currentUserId) return;

    try {
      const saved = localStorage.getItem(`notifications_${this.currentUserId}`);
      if (saved) {
        const notifications = JSON.parse(saved);
        notifications.forEach((notification: Notification) => {
          this.notifications.set(notification.id, notification);
        });
      }
    } catch (error) {
      console.error('加载用户通知失败:', error);
    }
  }

  /**
   * 保存用户通知
   */
  public saveUserNotifications(): void {
    if (!this.currentUserId) return;

    try {
      const notifications = this.getNotifications();
      localStorage.setItem(`notifications_${this.currentUserId}`, JSON.stringify(notifications));
    } catch (error) {
      console.error('保存用户通知失败:', error);
    }
  }

  /**
   * 切换声音
   */
  public toggleSound(enabled: boolean): void {
    this.soundEnabled = enabled;
    this.updateSettings({ enableSound: enabled });
  }
}

// 单例模式
export const notificationService = new NotificationService();
export default notificationService;