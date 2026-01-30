/**
 * 语音服务实现
 * 基于 uni-app 的语音识别和语音合成 API
 */

import {
  RecognitionState,
  SynthesisState
} from './types'
import type {
  RecognitionOptions,
  RecognitionResult,
  RecognitionCallbacks,
  SynthesisOptions,
  SynthesisCallbacks,
  VoiceError
} from './types'

class VoiceService {
  private recognitionState: RecognitionState = RecognitionState.IDLE
  private synthesisState: SynthesisState = SynthesisState.IDLE
  private recognitionCallbacks: RecognitionCallbacks = {}
  private synthesisCallbacks: SynthesisCallbacks = {}

  /**
   * 开始语音识别
   */
  startRecognition(
    options?: RecognitionOptions,
    callbacks?: RecognitionCallbacks
  ): void {
    if (this.recognitionState === 'listening') {
      console.warn('语音识别已在进行中')
      return
    }

    this.recognitionCallbacks = callbacks || {}
    this.recognitionState = RecognitionState.LISTENING

    // 调用 uni-app 语音识别 API
    uni.startSoterAuthentication({
      requestAuthModes: ['speech'],
      challenge: '123456',
      authContent: options?.language || 'zh_CN',
      success: (res) => {
        this.recognitionState = RecognitionState.COMPLETED
        
        const result: RecognitionResult = {
          transcript: res.resultJSON || '',
          confidence: 1.0,
          isFinal: true
        }
        
        this.recognitionCallbacks.onResult?.(result)
        this.recognitionCallbacks.onEnd?.()
      },
      fail: (err) => {
        this.recognitionState = RecognitionState.ERROR
        
        const error: VoiceError = {
          code: err.errCode?.toString() || 'UNKNOWN',
          message: err.errMsg || '语音识别失败',
          details: err
        }
        
        this.recognitionCallbacks.onError?.(error)
      }
    })

    this.recognitionCallbacks.onStart?.()
  }

  /**
   * 停止语音识别
   */
  stopRecognition(): void {
    if (this.recognitionState !== 'listening') {
      return
    }

    // uni-app 会自动停止
    this.recognitionState = RecognitionState.IDLE
    this.recognitionCallbacks.onEnd?.()
  }

  /**
   * 语音合成（文字转语音）
   */
  speak(
    text: string,
    options?: SynthesisOptions,
    callbacks?: SynthesisCallbacks
  ): void {
    if (this.synthesisState === 'speaking') {
      this.stopSpeaking()
    }

    this.synthesisCallbacks = callbacks || {}
    this.synthesisState = SynthesisState.SPEAKING

    // 使用 uni-app 的内置语音播报
    // 注意：uni-app 没有直接的 TTS API，这里使用插件或第三方服务
    // 实际项目中需要集成具体的 TTS 插件
    
    this.synthesisCallbacks.onStart?.()

    // 模拟语音播报（实际需要集成 TTS 插件）
    setTimeout(() => {
      this.synthesisState = 'completed'
      this.synthesisCallbacks.onEnd?.()
    }, text.length * 100) // 简单估算播报时间
  }

  /**
   * 停止语音播报
   */
  stopSpeaking(): void {
    if (this.synthesisState !== 'speaking') {
      return
    }

    this.synthesisState = SynthesisState.IDLE
    this.synthesisCallbacks.onEnd?.()
  }

  /**
   * 暂停语音播报
   */
  pauseSpeaking(): void {
    if (this.synthesisState !== 'speaking') {
      return
    }

    this.synthesisState = SynthesisState.PAUSED
    this.synthesisCallbacks.onPause?.()
  }

  /**
   * 恢复语音播报
   */
  resumeSpeaking(): void {
    if (this.synthesisState !== 'paused') {
      return
    }

    this.synthesisState = SynthesisState.SPEAKING
    this.synthesisCallbacks.onResume?.()
  }

  /**
   * 获取识别状态
   */
  getRecognitionState(): RecognitionState {
    return this.recognitionState
  }

  /**
   * 获取合成状态
   */
  getSynthesisState(): SynthesisState {
    return this.synthesisState
  }

  /**
   * 检查语音识别权限
   */
  async checkRecognitionPermission(): Promise<boolean> {
    return new Promise((resolve) => {
      uni.getSetting({
        success: (res) => {
          resolve(res.authSetting['scope.record'] === true)
        },
        fail: () => {
          resolve(false)
        }
      })
    })
  }

  /**
   * 请求语音识别权限
   */
  async requestRecognitionPermission(): Promise<boolean> {
    return new Promise((resolve) => {
      uni.authorize({
        scope: 'scope.record',
        success: () => {
          resolve(true)
        },
        fail: () => {
          resolve(false)
        }
      })
    })
  }
}

export const voiceService = new VoiceService()
export default voiceService