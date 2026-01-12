/**
 * 通知 API
 * 支持通知聚合、智能分类、免打扰模式等功能
 */
import { get, put, del, post } from '../request'

// 通知类型
export type NotificationType =
  | 'task_assigned'
  | 'task_completed'
  | 'task_overdue'
  | 'task_comment'
  | 'task_progress'
  | 'comment_added'
  | 'milestone_reached'
  | 'milestone_due'
  | 'deadline_reminder'
  | 'mention'
  | 'plan_submitted'
  | 'plan_approved'
  | 'plan_rejected'
  | 'feedback_received'
  | 'deliverable_uploaded'
  | 'project_update'
  | 'member_joined'
  | 'system';

// 通知分类
export type NotificationCategory =
  | 'task'
  | 'project'
  | 'comment'
  | 'system'
  | 'reminder'
  | 'plan'
  | 'feedback';

// 优先级
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

// AI分类结果
export type AIClassification = 'important' | 'normal' | 'low_priority' | 'spam';

export interface Notification {
  id: number;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  content: string;
  userId: number;
  isRead: number;
  isPinned?: boolean;  // 是否置顶
  isCollapsed?: boolean;  // 是否折叠
  relatedId?: number;
  relatedType?: string;
  groupKey?: string;
  aggregatedCount?: number;
  priority: NotificationPriority;
  aiClassification?: AIClassification;  // AI智能分类
  aiScore?: number;  // AI重要性评分 0-100
  senderId?: number;
  senderName?: string;
  senderAvatar?: string;
  projectId?: number;
  projectName?: string;
  actionUrl?: string;
  extraData?: string;
  createdAt: string;
  updatedAt?: string;
  // 聚合的子通知列表
  aggregatedNotifications?: Notification[];
}

// 通知订阅规则
export interface NotificationSubscription {
  id: number;
  userId: number;
  category: NotificationCategory;
  type?: NotificationType;
  projectId?: number;
  enabled: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// 免打扰设置
export interface DoNotDisturbSettings {
  id: number;
  userId: number;
  enabled: boolean;
  startTime: string;  // HH:mm 格式
  endTime: string;    // HH:mm 格式
  weekdays: number[]; // 0-6, 0=周日
  allowUrgent: boolean;  // 是否允许紧急通知
  allowMentions: boolean;  // 是否允许@提及
  createdAt: string;
  updatedAt: string;
}

// 通知偏好设置
export interface NotificationPreferences {
  id: number;
  userId: number;
  // 聚合设置
  enableAggregation: boolean;
  aggregationInterval: number;  // 聚合间隔（分钟）
  // 智能分类设置
  enableAIClassification: boolean;
  autoCollapseThreshold: number;  // 自动折叠阈值（AI评分低于此值自动折叠）
  // 置顶设置
  autoPinUrgent: boolean;  // 自动置顶紧急通知
  autoPinMentions: boolean;  // 自动置顶@提及
  // 显示设置
  showLowPriorityCollapsed: boolean;  // 低优先级默认折叠
  maxVisibleNotifications: number;  // 最大显示数量
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListResult {
  list: Notification[];
  total: number;
  page: number;
  pageSize: number;
  unreadCount: number;
}

export interface UnreadCountByCategory {
  task: number;
  project: number;
  comment: number;
  system: number;
  reminder: number;
  total: number;
}

/**
 * 获取通知列表（支持聚合）
 */
export function getNotifications(params: {
  userId: number;
  category?: NotificationCategory;
  isRead?: boolean;
  aggregated?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<NotificationListResult> {
  return get('/api/v1/notifications', {
    userId: params.userId,
    category: params.category,
    isRead: params.isRead,
    aggregated: params.aggregated ?? true,
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20
  });
}

/**
 * 获取聚合通知的详细列表
 */
export function getGroupNotifications(userId: number, groupKey: string): Promise<Notification[]> {
  return get(`/api/v1/notifications/group/${encodeURIComponent(groupKey)}`, { userId });
}

/**
 * 获取通知详情
 */
export function getNotification(id: number): Promise<Notification> {
  return get(`/api/v1/notifications/${id}`);
}

/**
 * 标记通知为已读
 */
export function markAsRead(id: number): Promise<void> {
  return put(`/api/v1/notifications/${id}/read`);
}

/**
 * 批量标记为已读
 */
export function batchMarkAsRead(ids: number[]): Promise<void> {
  return put('/api/v1/notifications/batch-read', ids);
}

/**
 * 标记分组通知为已读
 */
export function markGroupAsRead(userId: number, groupKey: string): Promise<void> {
  return put(`/api/v1/notifications/group/${encodeURIComponent(groupKey)}/read?userId=${userId}`);
}

/**
 * 标记所有通知为已读
 */
export function markAllAsRead(userId: number): Promise<void> {
  return put(`/api/v1/notifications/read-all?userId=${userId}`);
}

/**
 * 标记某分类的所有通知为已读
 */
export function markCategoryAsRead(userId: number, category: NotificationCategory): Promise<void> {
  return put(`/api/v1/notifications/category/${category}/read?userId=${userId}`);
}

/**
 * 删除通知
 */
export function deleteNotification(id: number): Promise<void> {
  return del(`/api/v1/notifications/${id}`);
}

/**
 * 批量删除通知
 */
export function batchDeleteNotifications(ids: number[]): Promise<void> {
  return post('/api/v1/notifications/batch-delete', ids);
}

/**
 * 删除分组通知
 */
export function deleteGroupNotifications(userId: number, groupKey: string): Promise<void> {
  return del(`/api/v1/notifications/group/${encodeURIComponent(groupKey)}`, { userId });
}

/**
 * 获取未读通知数量
 */
export function getUnreadCount(userId: number): Promise<{ total: number }> {
  return get('/api/v1/notifications/unread-count', { userId });
}

/**
 * 获取各分类的未读数量
 */
export function getUnreadCountByCategory(userId: number): Promise<UnreadCountByCategory> {
  return get('/api/v1/notifications/unread-count/by-category', { userId });
}

/**
 * 创建通知
 */
export function createNotification(notification: Partial<Notification>): Promise<Notification> {
  return post('/api/v1/notifications', notification);
}

/**
 * 发送系统通知
 */
export function sendSystemNotification(data: {
  title: string;
  content: string;
  userIds: number[];
}): Promise<void> {
  return post('/api/v1/notifications/system', data);
}

// ==================== 置顶功能 API ====================

/**
 * 置顶通知
 */
export function pinNotification(id: number): Promise<void> {
  return put(`/api/v1/notifications/${id}/pin`);
}

/**
 * 取消置顶
 */
export function unpinNotification(id: number): Promise<void> {
  return put(`/api/v1/notifications/${id}/unpin`);
}

/**
 * 获取置顶通知列表
 */
export function getPinnedNotifications(userId: number): Promise<Notification[]> {
  return get('/api/v1/notifications/pinned', { userId });
}

// ==================== 折叠功能 API ====================

/**
 * 折叠通知
 */
export function collapseNotification(id: number): Promise<void> {
  return put(`/api/v1/notifications/${id}/collapse`);
}

/**
 * 展开通知
 */
export function expandNotification(id: number): Promise<void> {
  return put(`/api/v1/notifications/${id}/expand`);
}

/**
 * 批量折叠低优先级通知
 */
export function collapseLowPriorityNotifications(userId: number): Promise<void> {
  return put('/api/v1/notifications/collapse-low-priority', { userId });
}

// ==================== 智能分类 API ====================

/**
 * 获取AI分类结果
 */
export function getAIClassification(notificationId: number): Promise<{
  classification: AIClassification;
  score: number;
  reason: string;
}> {
  return get(`/api/v1/notifications/${notificationId}/ai-classification`);
}

/**
 * 批量获取AI分类
 */
export function batchGetAIClassification(notificationIds: number[]): Promise<{
  [id: number]: {
    classification: AIClassification;
    score: number;
  };
}> {
  return post('/api/v1/notifications/batch-ai-classification', notificationIds);
}

/**
 * 重新分类通知
 */
export function reclassifyNotification(id: number, classification: AIClassification): Promise<void> {
  return put(`/api/v1/notifications/${id}/reclassify`, { classification });
}

// ==================== 免打扰模式 API ====================

/**
 * 获取免打扰设置
 */
export function getDoNotDisturbSettings(userId: number): Promise<DoNotDisturbSettings> {
  return get('/api/v1/notifications/dnd-settings', { userId });
}

/**
 * 更新免打扰设置
 */
export function updateDoNotDisturbSettings(userId: number, settings: Partial<DoNotDisturbSettings>): Promise<DoNotDisturbSettings> {
  return put('/api/v1/notifications/dnd-settings', { userId, ...settings });
}

/**
 * 快速开启免打扰
 */
export function enableDoNotDisturb(userId: number, duration?: number): Promise<void> {
  return post('/api/v1/notifications/dnd/enable', { userId, duration });
}

/**
 * 关闭免打扰
 */
export function disableDoNotDisturb(userId: number): Promise<void> {
  return post('/api/v1/notifications/dnd/disable', { userId });
}

/**
 * 检查当前是否在免打扰时段
 */
export function checkDoNotDisturbStatus(userId: number): Promise<{
  isActive: boolean;
  endTime?: string;
}> {
  return get('/api/v1/notifications/dnd/status', { userId });
}

// ==================== 订阅管理 API ====================

/**
 * 获取订阅规则列表
 */
export function getSubscriptions(userId: number): Promise<NotificationSubscription[]> {
  return get('/api/v1/notifications/subscriptions', { userId });
}

/**
 * 创建订阅规则
 */
export function createSubscription(subscription: Partial<NotificationSubscription>): Promise<NotificationSubscription> {
  return post('/api/v1/notifications/subscriptions', subscription);
}

/**
 * 更新订阅规则
 */
export function updateSubscription(id: number, subscription: Partial<NotificationSubscription>): Promise<NotificationSubscription> {
  return put(`/api/v1/notifications/subscriptions/${id}`, subscription);
}

/**
 * 删除订阅规则
 */
export function deleteSubscription(id: number): Promise<void> {
  return del(`/api/v1/notifications/subscriptions/${id}`);
}

/**
 * 批量更新订阅状态
 */
export function batchUpdateSubscriptions(userId: number, updates: {
  category?: NotificationCategory;
  enabled?: boolean;
  emailEnabled?: boolean;
  pushEnabled?: boolean;
}): Promise<void> {
  return put('/api/v1/notifications/subscriptions/batch', { userId, ...updates });
}

// ==================== 通知偏好设置 API ====================

/**
 * 获取通知偏好设置
 */
export function getNotificationPreferences(userId: number): Promise<NotificationPreferences> {
  return get('/api/v1/notifications/preferences', { userId });
}

/**
 * 更新通知偏好设置
 */
export function updateNotificationPreferences(userId: number, preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
  return put('/api/v1/notifications/preferences', { userId, ...preferences });
}

// ==================== 聚合通知 API ====================

/**
 * 获取聚合后的通知列表
 */
export function getAggregatedNotifications(params: {
  userId: number;
  category?: NotificationCategory;
  page?: number;
  pageSize?: number;
}): Promise<{
  list: Notification[];
  total: number;
  aggregatedGroups: number;
}> {
  return get('/api/v1/notifications/aggregated', params);
}

/**
 * 展开聚合组
 */
export function expandAggregatedGroup(groupKey: string): Promise<Notification[]> {
  return get(`/api/v1/notifications/group/${encodeURIComponent(groupKey)}/expand`);
}

// 通知类型标签
export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  task_assigned: '任务分配',
  task_completed: '任务完成',
  task_overdue: '任务逾期',
  task_comment: '任务评论',
  task_progress: '进度更新',
  comment_added: '新评论',
  milestone_reached: '里程碑达成',
  milestone_due: '里程碑到期',
  deadline_reminder: '截止提醒',
  mention: '@提及',
  plan_submitted: '计划提交',
  plan_approved: '计划审批通过',
  plan_rejected: '计划驳回',
  feedback_received: '收到反馈',
  deliverable_uploaded: '交付物上传',
  project_update: '项目更新',
  member_joined: '成员加入',
  system: '系统通知'
};

// 通知分类标签
export const NOTIFICATION_CATEGORY_LABELS: Record<NotificationCategory, string> = {
  task: '任务',
  project: '项目',
  comment: '评论',
  system: '系统',
  reminder: '提醒',
  plan: '计划',
  feedback: '反馈'
};

// 通知分类图标
export const NOTIFICATION_CATEGORY_ICONS: Record<NotificationCategory, string> = {
  task: 'CheckSquareOutlined',
  project: 'ProjectOutlined',
  comment: 'CommentOutlined',
  system: 'SettingOutlined',
  reminder: 'ClockCircleOutlined',
  plan: 'FileTextOutlined',
  feedback: 'MessageOutlined'
};

// 优先级标签
export const PRIORITY_LABELS: Record<NotificationPriority, string> = {
  low: '低',
  normal: '普通',
  high: '高',
  urgent: '紧急'
};

// 优先级颜色
export const PRIORITY_COLORS: Record<NotificationPriority, string> = {
  low: '#8c8c8c',
  normal: '#1890ff',
  high: '#fa8c16',
  urgent: '#f5222d'
};

// AI分类标签
export const AI_CLASSIFICATION_LABELS: Record<AIClassification, string> = {
  important: '重要',
  normal: '普通',
  low_priority: '低优先级',
  spam: '垃圾'
};

// AI分类颜色
export const AI_CLASSIFICATION_COLORS: Record<AIClassification, string> = {
  important: '#f5222d',
  normal: '#1890ff',
  low_priority: '#8c8c8c',
  spam: '#d9d9d9'
};

// 通知类型完整标签
export const NOTIFICATION_TYPE_FULL_LABELS: Record<NotificationType, string> = {
  task_assigned: '任务分配',
  task_completed: '任务完成',
  task_overdue: '任务逾期',
  task_comment: '任务评论',
  task_progress: '进度更新',
  comment_added: '新评论',
  milestone_reached: '里程碑达成',
  milestone_due: '里程碑到期',
  deadline_reminder: '截止提醒',
  mention: '@提及',
  plan_submitted: '计划提交',
  plan_approved: '计划审批通过',
  plan_rejected: '计划驳回',
  feedback_received: '收到反馈',
  deliverable_uploaded: '交付物上传',
  project_update: '项目更新',
  member_joined: '成员加入',
  system: '系统通知'
};

// 默认免打扰设置
export const DEFAULT_DND_SETTINGS: Partial<DoNotDisturbSettings> = {
  enabled: false,
  startTime: '22:00',
  endTime: '08:00',
  weekdays: [0, 1, 2, 3, 4, 5, 6],
  allowUrgent: true,
  allowMentions: true
};

// 默认通知偏好
export const DEFAULT_NOTIFICATION_PREFERENCES: Partial<NotificationPreferences> = {
  enableAggregation: true,
  aggregationInterval: 30,
  enableAIClassification: true,
  autoCollapseThreshold: 30,
  autoPinUrgent: true,
  autoPinMentions: false,
  showLowPriorityCollapsed: true,
  maxVisibleNotifications: 50
};

// 快捷免打扰时长选项（分钟）
export const DND_DURATION_OPTIONS = [
  { value: 30, label: '30分钟' },
  { value: 60, label: '1小时' },
  { value: 120, label: '2小时' },
  { value: 240, label: '4小时' },
  { value: 480, label: '8小时' },
  { value: 1440, label: '24小时' },
  { value: -1, label: '直到手动关闭' }
];

/**
 * 格式化通知时间
 */
export function formatNotificationTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) {
    return '刚刚';
  } else if (minutes < 60) {
    return `${minutes}分钟前`;
  } else if (hours < 24) {
    return `${hours}小时前`;
  } else if (days < 7) {
    return `${days}天前`;
  } else {
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    });
  }
}

/**
 * 获取通知的跳转链接
 */
export function getNotificationLink(notification: Notification): string {
  if (notification.actionUrl) {
    return notification.actionUrl;
  }
  
  // 根据关联类型生成默认链接
  if (notification.relatedId && notification.relatedType) {
    switch (notification.relatedType) {
      case 'task':
        return `/tasks/${notification.relatedId}`;
      case 'project':
        return `/projects/${notification.relatedId}`;
      case 'milestone':
        return `/projects/${notification.projectId}/milestones/${notification.relatedId}`;
      case 'comment':
        return `/tasks/${notification.relatedId}#comments`;
      default:
        return '/notifications';
    }
  }
  
  return '/notifications';
}