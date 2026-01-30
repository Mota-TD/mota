/**
 * 端侧AI服务实现
 */

import http from '../http/request';
import {
  ModelType,
  ModelStatus,
  type ModelInfo,
  type InferenceRequest,
  type InferenceResult,
  type DownloadProgress,
  type ModelConfig,
  type PerformanceStats
} from './types';

/**
 * 端侧AI服务类
 */
class EdgeAIService {
  private readonly baseUrl = '/api/edge-ai';
  private readonly storageKey = 'edge_ai_config';
  private models: Map<string, ModelInfo> = new Map();
  private downloadCallbacks: Map<string, (progress: DownloadProgress) => void> = new Map();

  /**
   * 获取可用模型列表
   */
  async getAvailableModels(): Promise<ModelInfo[]> {
    const models = await http.get<ModelInfo[]>(`${this.baseUrl}/models`);
    models.forEach(model => this.models.set(model.id, model));
    return models;
  }

  /**
   * 获取模型信息
   */
  async getModelInfo(modelId: string): Promise<ModelInfo> {
    if (this.models.has(modelId)) {
      return this.models.get(modelId)!;
    }
    const model = await http.get<ModelInfo>(`${this.baseUrl}/models/${modelId}`);
    this.models.set(modelId, model);
    return model;
  }

  /**
   * 下载模型
   */
  async downloadModel(
    modelId: string,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<void> {
    if (onProgress) {
      this.downloadCallbacks.set(modelId, onProgress);
    }

    try {
      // 更新模型状态
      const model = await this.getModelInfo(modelId);
      model.status = ModelStatus.DOWNLOADING;
      this.models.set(modelId, model);

      // 模拟下载进度（实际应该通过WebSocket或轮询获取）
      await this.simulateDownload(modelId, model.size, onProgress);

      // 下载完成
      model.status = ModelStatus.DOWNLOADED;
      model.progress = 100;
      this.models.set(modelId, model);

      // 保存到本地
      await this.saveModelToLocal(modelId);
    } catch (error) {
      const model = this.models.get(modelId);
      if (model) {
        model.status = ModelStatus.ERROR;
        this.models.set(modelId, model);
      }
      throw error;
    } finally {
      this.downloadCallbacks.delete(modelId);
    }
  }

  /**
   * 模拟下载进度
   */
  private async simulateDownload(
    modelId: string,
    totalSize: number,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<void> {
    const chunks = 20;
    const chunkSize = totalSize / chunks;
    
    for (let i = 0; i <= chunks; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const downloaded = Math.min(i * chunkSize, totalSize);
      const progress: DownloadProgress = {
        modelId,
        downloaded,
        total: totalSize,
        progress: (downloaded / totalSize) * 100,
        speed: chunkSize * 10 // 模拟速度
      };
      
      if (onProgress) {
        onProgress(progress);
      }
      
      // 更新模型进度
      const model = this.models.get(modelId);
      if (model) {
        model.progress = progress.progress;
        this.models.set(modelId, model);
      }
    }
  }

  /**
   * 保存模型到本地
   */
  private async saveModelToLocal(modelId: string): Promise<void> {
    try {
      const localModels = this.getLocalModels();
      if (!localModels.includes(modelId)) {
        localModels.push(modelId);
        uni.setStorageSync('local_models', JSON.stringify(localModels));
      }
    } catch (error) {
      console.error('保存模型失败:', error);
    }
  }

  /**
   * 获取本地模型列表
   */
  private getLocalModels(): string[] {
    try {
      const data = uni.getStorageSync('local_models');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * 删除模型
   */
  async deleteModel(modelId: string): Promise<void> {
    try {
      const localModels = this.getLocalModels();
      const filtered = localModels.filter(id => id !== modelId);
      uni.setStorageSync('local_models', JSON.stringify(filtered));
      
      const model = this.models.get(modelId);
      if (model) {
        model.status = ModelStatus.NOT_DOWNLOADED;
        model.progress = 0;
        this.models.set(modelId, model);
      }
    } catch (error) {
      console.error('删除模型失败:', error);
      throw error;
    }
  }

  /**
   * 加载模型
   */
  async loadModel(modelId: string): Promise<void> {
    const model = await this.getModelInfo(modelId);
    
    if (model.status !== ModelStatus.DOWNLOADED) {
      throw new Error('模型未下载');
    }
    
    // 模拟加载过程
    await new Promise(resolve => setTimeout(resolve, 500));
    
    model.status = ModelStatus.LOADED;
    this.models.set(modelId, model);
  }

  /**
   * 卸载模型
   */
  async unloadModel(modelId: string): Promise<void> {
    const model = this.models.get(modelId);
    if (model && model.status === ModelStatus.LOADED) {
      model.status = ModelStatus.DOWNLOADED;
      this.models.set(modelId, model);
    }
  }

  /**
   * 执行推理
   */
  async inference(request: InferenceRequest): Promise<InferenceResult> {
    const model = this.models.get(request.modelId);
    
    if (!model) {
      throw new Error('模型不存在');
    }
    
    if (model.status !== ModelStatus.LOADED) {
      // 自动加载模型
      await this.loadModel(request.modelId);
    }
    
    // 调用后端API进行推理
    const startTime = Date.now();
    const result = await http.post<InferenceResult>(`${this.baseUrl}/inference`, request);
    result.duration = Date.now() - startTime;
    
    return result;
  }

  /**
   * 获取配置
   */
  getConfig(): ModelConfig {
    try {
      const data = uni.getStorageSync(this.storageKey);
      return data ? JSON.parse(data) : this.getDefaultConfig();
    } catch (error) {
      return this.getDefaultConfig();
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<ModelConfig>): void {
    const current = this.getConfig();
    const updated = { ...current, ...config };
    uni.setStorageSync(this.storageKey, JSON.stringify(updated));
  }

  /**
   * 获取默认配置
   */
  private getDefaultConfig(): ModelConfig {
    return {
      enabled: true,
      autoDownload: false,
      wifiOnly: true,
      maxCacheSize: 500 * 1024 * 1024 // 500MB
    };
  }

  /**
   * 获取性能统计
   */
  async getPerformanceStats(modelId: string): Promise<PerformanceStats> {
    return await http.get<PerformanceStats>(`${this.baseUrl}/stats/${modelId}`);
  }

  /**
   * 清理缓存
   */
  async clearCache(): Promise<void> {
    try {
      uni.removeStorageSync('local_models');
      this.models.forEach(model => {
        if (model.status !== ModelStatus.NOT_DOWNLOADED) {
          model.status = ModelStatus.NOT_DOWNLOADED;
          model.progress = 0;
        }
      });
    } catch (error) {
      console.error('清理缓存失败:', error);
      throw error;
    }
  }

  /**
   * 获取缓存大小
   */
  getCacheSize(): number {
    let totalSize = 0;
    const localModels = this.getLocalModels();
    
    localModels.forEach(modelId => {
      const model = this.models.get(modelId);
      if (model) {
        totalSize += model.size;
      }
    });
    
    return totalSize;
  }

  /**
   * 格式化文件大小
   */
  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}GB`;
  }

  /**
   * 获取模型类型列表
   */
  getModelTypes(): Array<{ value: ModelType; label: string; icon: string }> {
    return [
      { value: ModelType.TEXT_CLASSIFICATION, label: '文本分类', icon: '📝' },
      { value: ModelType.SENTIMENT_ANALYSIS, label: '情感分析', icon: '😊' },
      { value: ModelType.KEYWORD_EXTRACTION, label: '关键词提取', icon: '🔑' },
      { value: ModelType.TEXT_SUMMARIZATION, label: '文本摘要', icon: '📄' },
      { value: ModelType.IMAGE_CLASSIFICATION, label: '图像分类', icon: '🖼️' }
    ];
  }

  /**
   * 获取状态颜色
   */
  getStatusColor(status: ModelStatus): string {
    const colors: Record<ModelStatus, string> = {
      [ModelStatus.NOT_DOWNLOADED]: '#999',
      [ModelStatus.DOWNLOADING]: '#3B82F6',
      [ModelStatus.DOWNLOADED]: '#10B981',
      [ModelStatus.LOADED]: '#10B981',
      [ModelStatus.ERROR]: '#EF4444'
    };
    return colors[status];
  }

  /**
   * 获取状态文本
   */
  getStatusText(status: ModelStatus): string {
    const texts: Record<ModelStatus, string> = {
      [ModelStatus.NOT_DOWNLOADED]: '未下载',
      [ModelStatus.DOWNLOADING]: '下载中',
      [ModelStatus.DOWNLOADED]: '已下载',
      [ModelStatus.LOADED]: '已加载',
      [ModelStatus.ERROR]: '错误'
    };
    return texts[status];
  }
}

// 导出单例
export const edgeAIService = new EdgeAIService();