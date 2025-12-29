/**
 * 消息持久化存储服务
 * 管理聊天消息、活动记录的本地和远程存储
 */

export interface StoredMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  projectId: string;
  timestamp: number;
  type: 'text' | 'image' | 'file' | 'system';
  mentions?: string[];
  replyTo?: string;
  edited?: boolean;
  editedAt?: number;
  deleted?: boolean;
  deletedAt?: number;
  metadata?: Record<string, any>;
}

export interface StoredActivity {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  projectId: string;
  action: string;
  target: string;
  targetId: string;
  targetName?: string;
  timestamp: number;
  description: string;
  metadata?: Record<string, any>;
}

export interface ConversationThread {
  id: string;
  projectId: string;
  participants: string[];
  lastMessageId: string;
  lastMessageTimestamp: number;
  messageCount: number;
  unreadCount: Record<string, number>; // userId -> unreadCount
  createdAt: number;
  updatedAt: number;
}

export interface StorageStats {
  totalMessages: number;
  totalActivities: number;
  storageUsed: number; // bytes
  lastCleanup: number;
  oldestMessage: number;
  newestMessage: number;
}

class MessageStorageService {
  private readonly DB_NAME = 'MotaCollaboration';
  private readonly DB_VERSION = 1;
  private readonly MESSAGES_STORE = 'messages';
  private readonly ACTIVITIES_STORE = 'activities';
  private readonly THREADS_STORE = 'threads';
  private readonly META_STORE = 'metadata';
  
  private db: IDBDatabase | null = null;
  private dbReady: Promise<void>;
  
  // 内存缓存
  private messageCache = new Map<string, StoredMessage>();
  private activityCache = new Map<string, StoredActivity>();
  private threadCache = new Map<string, ConversationThread>();
  
  // 配置
  private readonly MAX_MESSAGES = 10000;
  private readonly MAX_ACTIVITIES = 5000;
  private readonly CACHE_SIZE = 1000;
  private readonly CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24小时

  constructor() {
    this.dbReady = this.initDatabase();
    this.scheduleCleanup();
  }

  /**
   * 初始化IndexedDB数据库
   */
  private async initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        console.error('打开数据库失败:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('数据库连接成功');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createStores(db);
      };
    });
  }

  /**
   * 创建对象存储
   */
  private createStores(db: IDBDatabase): void {
    // 消息存储
    if (!db.objectStoreNames.contains(this.MESSAGES_STORE)) {
      const messageStore = db.createObjectStore(this.MESSAGES_STORE, { keyPath: 'id' });
      messageStore.createIndex('projectId', 'projectId', { unique: false });
      messageStore.createIndex('timestamp', 'timestamp', { unique: false });
      messageStore.createIndex('senderId', 'senderId', { unique: false });
      messageStore.createIndex('projectTimestamp', ['projectId', 'timestamp'], { unique: false });
    }

    // 活动存储
    if (!db.objectStoreNames.contains(this.ACTIVITIES_STORE)) {
      const activityStore = db.createObjectStore(this.ACTIVITIES_STORE, { keyPath: 'id' });
      activityStore.createIndex('projectId', 'projectId', { unique: false });
      activityStore.createIndex('timestamp', 'timestamp', { unique: false });
      activityStore.createIndex('userId', 'userId', { unique: false });
      activityStore.createIndex('target', 'target', { unique: false });
      activityStore.createIndex('projectTimestamp', ['projectId', 'timestamp'], { unique: false });
    }

    // 对话线程存储
    if (!db.objectStoreNames.contains(this.THREADS_STORE)) {
      const threadStore = db.createObjectStore(this.THREADS_STORE, { keyPath: 'id' });
      threadStore.createIndex('projectId', 'projectId', { unique: false });
      threadStore.createIndex('updatedAt', 'updatedAt', { unique: false });
    }

    // 元数据存储
    if (!db.objectStoreNames.contains(this.META_STORE)) {
      db.createObjectStore(this.META_STORE, { keyPath: 'key' });
    }
  }

  /**
   * 存储消息
   */
  public async storeMessage(message: StoredMessage): Promise<void> {
    await this.dbReady;
    
    if (!this.db) {
      throw new Error('数据库未初始化');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.MESSAGES_STORE], 'readwrite');
      const store = transaction.objectStore(this.MESSAGES_STORE);
      
      const request = store.put(message);
      
      request.onsuccess = () => {
        // 更新缓存
        this.messageCache.set(message.id, message);
        this.limitCache();
        
        // 更新对话线程
        this.updateConversationThread(message);
        
        resolve();
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * 获取项目消息
   */
  public async getProjectMessages(
    projectId: string, 
    limit: number = 50, 
    offset: number = 0,
    before?: number
  ): Promise<StoredMessage[]> {
    await this.dbReady;
    
    if (!this.db) {
      throw new Error('数据库未初始化');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.MESSAGES_STORE], 'readonly');
      const store = transaction.objectStore(this.MESSAGES_STORE);
      const index = store.index('projectTimestamp');
      
      let range: IDBKeyRange;
      if (before) {
        range = IDBKeyRange.bound([projectId, 0], [projectId, before], false, true);
      } else {
        range = IDBKeyRange.bound([projectId, 0], [projectId, Date.now()], false, false);
      }
      
      const request = index.openCursor(range, 'prev'); // 倒序获取
      const messages: StoredMessage[] = [];
      let count = 0;
      let skipped = 0;
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        
        if (cursor && count < limit) {
          if (skipped < offset) {
            skipped++;
            cursor.continue();
            return;
          }
          
          const message = cursor.value as StoredMessage;
          if (!message.deleted) {
            messages.push(message);
            count++;
          }
          cursor.continue();
        } else {
          resolve(messages);
        }
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * 存储活动记录
   */
  public async storeActivity(activity: StoredActivity): Promise<void> {
    await this.dbReady;
    
    if (!this.db) {
      throw new Error('数据库未初始化');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.ACTIVITIES_STORE], 'readwrite');
      const store = transaction.objectStore(this.ACTIVITIES_STORE);
      
      const request = store.put(activity);
      
      request.onsuccess = () => {
        // 更新缓存
        this.activityCache.set(activity.id, activity);
        resolve();
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * 获取项目活动记录
   */
  public async getProjectActivities(
    projectId: string, 
    limit: number = 50, 
    offset: number = 0
  ): Promise<StoredActivity[]> {
    await this.dbReady;
    
    if (!this.db) {
      throw new Error('数据库未初始化');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.ACTIVITIES_STORE], 'readonly');
      const store = transaction.objectStore(this.ACTIVITIES_STORE);
      const index = store.index('projectTimestamp');
      
      const range = IDBKeyRange.bound([projectId, 0], [projectId, Date.now()]);
      const request = index.openCursor(range, 'prev');
      const activities: StoredActivity[] = [];
      let count = 0;
      let skipped = 0;
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        
        if (cursor && count < limit) {
          if (skipped < offset) {
            skipped++;
            cursor.continue();
            return;
          }
          
          activities.push(cursor.value);
          count++;
          cursor.continue();
        } else {
          resolve(activities);
        }
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * 搜索消息
   */
  public async searchMessages(
    projectId: string, 
    query: string, 
    limit: number = 20
  ): Promise<StoredMessage[]> {
    const messages = await this.getProjectMessages(projectId, 500);
    
    const searchResults = messages.filter(message => {
      return message.content.toLowerCase().includes(query.toLowerCase()) ||
             message.senderName.toLowerCase().includes(query.toLowerCase());
    });
    
    return searchResults.slice(0, limit);
  }

  /**
   * 更新对话线程
   */
  private async updateConversationThread(message: StoredMessage): Promise<void> {
    const threadId = `thread_${message.projectId}`;
    let thread = this.threadCache.get(threadId);
    
    if (!thread) {
      thread = {
        id: threadId,
        projectId: message.projectId,
        participants: [message.senderId],
        lastMessageId: message.id,
        lastMessageTimestamp: message.timestamp,
        messageCount: 1,
        unreadCount: {},
        createdAt: message.timestamp,
        updatedAt: message.timestamp,
      };
    } else {
      if (!thread.participants.includes(message.senderId)) {
        thread.participants.push(message.senderId);
      }
      thread.lastMessageId = message.id;
      thread.lastMessageTimestamp = message.timestamp;
      thread.messageCount++;
      thread.updatedAt = message.timestamp;
    }
    
    this.threadCache.set(threadId, thread);
    
    // 保存到数据库
    if (this.db) {
      const transaction = this.db.transaction([this.THREADS_STORE], 'readwrite');
      const store = transaction.objectStore(this.THREADS_STORE);
      store.put(thread);
    }
  }

  /**
   * 标记消息为已读
   */
  public async markMessagesAsRead(projectId: string, userId: string, beforeTimestamp?: number): Promise<void> {
    const threadId = `thread_${projectId}`;
    const thread = this.threadCache.get(threadId);
    
    if (thread) {
      thread.unreadCount[userId] = 0;
      this.threadCache.set(threadId, thread);
      
      // 更新数据库
      if (this.db) {
        const transaction = this.db.transaction([this.THREADS_STORE], 'readwrite');
        const store = transaction.objectStore(this.THREADS_STORE);
        store.put(thread);
      }
    }
  }

  /**
   * 获取未读消息数量
   */
  public async getUnreadCount(projectId: string, userId: string): Promise<number> {
    const threadId = `thread_${projectId}`;
    const thread = this.threadCache.get(threadId);
    
    return thread?.unreadCount[userId] || 0;
  }

  /**
   * 删除消息（软删除）
   */
  public async deleteMessage(messageId: string): Promise<void> {
    await this.dbReady;
    
    if (!this.db) {
      throw new Error('数据库未初始化');
    }

    const message = this.messageCache.get(messageId);
    if (message) {
      message.deleted = true;
      message.deletedAt = Date.now();
      
      await this.storeMessage(message);
    }
  }

  /**
   * 编辑消息
   */
  public async editMessage(messageId: string, newContent: string): Promise<void> {
    await this.dbReady;
    
    const message = this.messageCache.get(messageId);
    if (message) {
      message.content = newContent;
      message.edited = true;
      message.editedAt = Date.now();
      
      await this.storeMessage(message);
    }
  }

  /**
   * 清理过期数据
   */
  public async cleanup(): Promise<void> {
    await this.dbReady;
    
    if (!this.db) return;

    const transaction = this.db.transaction([this.MESSAGES_STORE, this.ACTIVITIES_STORE], 'readwrite');
    
    // 清理过多的消息
    await this.cleanupMessages(transaction);
    
    // 清理过多的活动记录
    await this.cleanupActivities(transaction);
    
    // 更新清理时间
    this.setMetadata('lastCleanup', Date.now());
  }

  /**
   * 清理消息
   */
  private async cleanupMessages(transaction: IDBTransaction): Promise<void> {
    const store = transaction.objectStore(this.MESSAGES_STORE);
    const index = store.index('timestamp');
    
    return new Promise((resolve) => {
      const request = index.openCursor(null, 'next');
      let count = 0;
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        
        if (cursor) {
          count++;
          if (count > this.MAX_MESSAGES) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
    });
  }

  /**
   * 清理活动记录
   */
  private async cleanupActivities(transaction: IDBTransaction): Promise<void> {
    const store = transaction.objectStore(this.ACTIVITIES_STORE);
    const index = store.index('timestamp');
    
    return new Promise((resolve) => {
      const request = index.openCursor(null, 'next');
      let count = 0;
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        
        if (cursor) {
          count++;
          if (count > this.MAX_ACTIVITIES) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
    });
  }

  /**
   * 限制内存缓存大小
   */
  private limitCache(): void {
    if (this.messageCache.size > this.CACHE_SIZE) {
      const entries = Array.from(this.messageCache.entries());
      entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
      
      // 保留最新的消息
      this.messageCache.clear();
      entries.slice(0, this.CACHE_SIZE).forEach(([id, message]) => {
        this.messageCache.set(id, message);
      });
    }
  }

  /**
   * 设置元数据
   */
  private async setMetadata(key: string, value: any): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction([this.META_STORE], 'readwrite');
    const store = transaction.objectStore(this.META_STORE);
    
    store.put({ key, value, timestamp: Date.now() });
  }

  /**
   * 获取存储统计
   */
  public async getStorageStats(): Promise<StorageStats> {
    await this.dbReady;
    
    if (!this.db) {
      return {
        totalMessages: 0,
        totalActivities: 0,
        storageUsed: 0,
        lastCleanup: 0,
        oldestMessage: 0,
        newestMessage: 0,
      };
    }

    const messageCount = await this.getStoreCount(this.MESSAGES_STORE);
    const activityCount = await this.getStoreCount(this.ACTIVITIES_STORE);
    
    // 估算存储使用量（简化计算）
    const storageUsed = (messageCount * 1000) + (activityCount * 500); // 字节

    return {
      totalMessages: messageCount,
      totalActivities: activityCount,
      storageUsed,
      lastCleanup: Date.now(),
      oldestMessage: 0, // 可以进一步实现
      newestMessage: Date.now(),
    };
  }

  /**
   * 获取存储对象数量
   */
  private async getStoreCount(storeName: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 安排定期清理
   */
  private scheduleCleanup(): void {
    setInterval(() => {
      this.cleanup().catch(error => {
        console.error('自动清理失败:', error);
      });
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * 导出数据（用于备份）
   */
  public async exportData(projectId?: string): Promise<{
    messages: StoredMessage[];
    activities: StoredActivity[];
  }> {
    const messages = projectId ? 
      await this.getProjectMessages(projectId, 9999) :
      Array.from(this.messageCache.values());
      
    const activities = projectId ?
      await this.getProjectActivities(projectId, 9999) :
      Array.from(this.activityCache.values());

    return { messages, activities };
  }

  /**
   * 导入数据（用于恢复）
   */
  public async importData(data: {
    messages: StoredMessage[];
    activities: StoredActivity[];
  }): Promise<void> {
    // 导入消息
    for (const message of data.messages) {
      await this.storeMessage(message);
    }
    
    // 导入活动记录
    for (const activity of data.activities) {
      await this.storeActivity(activity);
    }
  }
}

// 单例模式
export const messageStorage = new MessageStorageService();
export default messageStorage;