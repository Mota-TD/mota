/**
 * 语音服务类型定义
 */

// 语音识别状态
export enum RecognitionState {
  IDLE = 'idle',
  LISTENING = 'listening',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error'
}

// 语音合成状态
export enum SynthesisState {
  IDLE = 'idle',
  SPEAKING = 'speaking',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ERROR = 'error'
}

// 语音识别选项
export interface RecognitionOptions {
  language?: string           // 语言代码，如 'zh-CN', 'en-US'
  continuous?: boolean        // 是否持续识别
  interimResults?: boolean    // 是否返回中间结果
  maxAlternatives?: number    // 最大候选结果数
}

// 语音识别结果
export interface RecognitionResult {
  transcript: string          // 识别文本
  confidence: number          // 置信度 0-1
  isFinal: boolean           // 是否为最终结果
  alternatives?: Array<{     // 候选结果
    transcript: string
    confidence: number
  }>
}

// 语音合成选项
export interface SynthesisOptions {
  voice?: string             // 语音名称
  language?: string          // 语言代码
  rate?: number             // 语速 0.1-10，默认1
  pitch?: number            // 音调 0-2，默认1
  volume?: number           // 音量 0-1，默认1
}

// 语音识别事件回调
export interface RecognitionCallbacks {
  onStart?: () => void
  onResult?: (result: RecognitionResult) => void
  onEnd?: () => void
  onError?: (error: VoiceError) => void
}

// 语音合成事件回调
export interface SynthesisCallbacks {
  onStart?: () => void
  onEnd?: () => void
  onPause?: () => void
  onResume?: () => void
  onError?: (error: VoiceError) => void
}

// 语音错误
export interface VoiceError {
  code: string
  message: string
  details?: any
}

// 语音配置
export interface VoiceConfig {
  recognition?: RecognitionOptions
  synthesis?: SynthesisOptions
  autoStart?: boolean
  autoStop?: boolean
}