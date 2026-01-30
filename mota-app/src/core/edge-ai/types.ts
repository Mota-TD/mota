/**
 * 端侧AI类型定义
 */

/**
 * 模型类型
 */
export enum ModelType {
  /** 文本分类 */
  TEXT_CLASSIFICATION = 'text_classification',
  /** 情感分析 */
  SENTIMENT_ANALYSIS = 'sentiment_analysis',
  /** 关键词提取 */
  KEYWORD_EXTRACTION = 'keyword_extraction',
  /** 文本摘要 */
  TEXT_SUMMARIZATION = 'text_summarization',
  /** 图像分类 */
  IMAGE_CLASSIFICATION = 'image_classification'
}

/**
 * 模型状态
 */
export enum ModelStatus {
  /** 未下载 */
  NOT_DOWNLOADED = 'not_downloaded',
  /** 下载中 */
  DOWNLOADING = 'downloading',
  /** 已下载 */
  DOWNLOADED = 'downloaded',
  /** 已加载 */
  LOADED = 'loaded',
  /** 错误 */
  ERROR = 'error'
}

/**
 * 模型信息
 */
export interface ModelInfo {
  /** 模型ID */
  id: string;
  /** 模型名称 */
  name: string;
  /** 模型类型 */
  type: ModelType;
  /** 模型版本 */
  version: string;
  /** 模型大小(bytes) */
  size: number;
  /** 模型状态 */
  status: ModelStatus;
  /** 下载进度 */
  progress?: number;
  /** 模型描述 */
  description?: string;
  /** 支持的语言 */
  languages?: string[];
  /** 准确率 */
  accuracy?: number;
}

/**
 * 推理请求
 */
export interface InferenceRequest {
  /** 模型ID */
  modelId: string;
  /** 输入数据 */
  input: string | number[] | ArrayBuffer;
  /** 推理选项 */
  options?: {
    /** 最大结果数 */
    topK?: number;
    /** 置信度阈值 */
    threshold?: number;
    /** 是否返回详细信息 */
    verbose?: boolean;
  };
}

/**
 * 推理结果
 */
export interface InferenceResult {
  /** 预测结果 */
  predictions: Array<{
    /** 标签 */
    label: string;
    /** 置信度 */
    confidence: number;
    /** 额外数据 */
    extra?: any;
  }>;
  /** 推理耗时(ms) */
  duration: number;
  /** 模型版本 */
  modelVersion: string;
}

/**
 * 模型下载进度
 */
export interface DownloadProgress {
  /** 模型ID */
  modelId: string;
  /** 已下载大小 */
  downloaded: number;
  /** 总大小 */
  total: number;
  /** 进度百分比 */
  progress: number;
  /** 下载速度(bytes/s) */
  speed?: number;
}

/**
 * 模型配置
 */
export interface ModelConfig {
  /** 是否启用端侧AI */
  enabled: boolean;
  /** 自动下载模型 */
  autoDownload: boolean;
  /** 仅WiFi下载 */
  wifiOnly: boolean;
  /** 最大缓存大小(bytes) */
  maxCacheSize: number;
  /** 模型存储路径 */
  storagePath?: string;
}

/**
 * 性能统计
 */
export interface PerformanceStats {
  /** 模型ID */
  modelId: string;
  /** 总推理次数 */
  totalInferences: number;
  /** 平均推理时间(ms) */
  avgInferenceTime: number;
  /** 最快推理时间(ms) */
  minInferenceTime: number;
  /** 最慢推理时间(ms) */
  maxInferenceTime: number;
  /** 内存使用(bytes) */
  memoryUsage?: number;
}