/**
 * OCR服务实现
 */

import http from '../http/request';
import {
  OCRType,
  ImageSource,
  type OCRRequest,
  type OCRResult,
  type IDCardResult,
  type BankCardResult,
  type BusinessLicenseResult,
  type InvoiceResult,
  type TableResult,
  type ImageRecognitionRequest,
  type ImageRecognitionResult,
  type ObjectDetectionResult,
  type OCRHistory
} from './types';

/**
 * OCR服务类
 */
class OCRService {
  private readonly baseUrl = '/api/ai/ocr';
  private readonly imageUrl = '/api/ai/image';

  /**
   * 通用OCR识别
   */
  async recognize(request: OCRRequest): Promise<OCRResult> {
    return await http.post<OCRResult>(`${this.baseUrl}/recognize`, request);
  }

  /**
   * 身份证识别
   */
  async recognizeIDCard(image: string, side: 'front' | 'back' = 'front'): Promise<IDCardResult> {
    return await http.post<IDCardResult>(`${this.baseUrl}/id-card`, {
      image,
      side
    });
  }

  /**
   * 银行卡识别
   */
  async recognizeBankCard(image: string): Promise<BankCardResult> {
    return await http.post<BankCardResult>(`${this.baseUrl}/bank-card`, {
      image
    });
  }

  /**
   * 营业执照识别
   */
  async recognizeBusinessLicense(image: string): Promise<BusinessLicenseResult> {
    return await http.post<BusinessLicenseResult>(`${this.baseUrl}/business-license`, {
      image
    });
  }

  /**
   * 发票识别
   */
  async recognizeInvoice(image: string): Promise<InvoiceResult> {
    return await http.post<InvoiceResult>(`${this.baseUrl}/invoice`, {
      image
    });
  }

  /**
   * 表格识别
   */
  async recognizeTable(image: string): Promise<TableResult> {
    return await http.post<TableResult>(`${this.baseUrl}/table`, {
      image
    });
  }

  /**
   * 手写文字识别
   */
  async recognizeHandwriting(image: string): Promise<OCRResult> {
    return await http.post<OCRResult>(`${this.baseUrl}/handwriting`, {
      image
    });
  }

  /**
   * 图像分类识别
   */
  async classifyImage(request: ImageRecognitionRequest): Promise<ImageRecognitionResult> {
    return await http.post<ImageRecognitionResult>(`${this.imageUrl}/classify`, request);
  }

  /**
   * 物体检测
   */
  async detectObjects(image: string): Promise<ObjectDetectionResult> {
    return await http.post<ObjectDetectionResult>(`${this.imageUrl}/detect`, {
      image
    });
  }

  /**
   * 选择图片
   */
  async chooseImage(source: ImageSource = ImageSource.ALBUM): Promise<string> {
    return new Promise((resolve, reject) => {
      uni.chooseImage({
        count: 1,
        sourceType: [source === ImageSource.CAMERA ? 'camera' : 'album'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          // 转换为base64
          this.imageToBase64(tempFilePath)
            .then(resolve)
            .catch(reject);
        },
        fail: reject
      });
    });
  }

  /**
   * 拍照识别
   */
  async captureAndRecognize(type: OCRType): Promise<OCRResult> {
    const image = await this.chooseImage(ImageSource.CAMERA);
    return this.recognize({ image, type });
  }

  /**
   * 从相册选择并识别
   */
  async selectAndRecognize(type: OCRType): Promise<OCRResult> {
    const image = await this.chooseImage(ImageSource.ALBUM);
    return this.recognize({ image, type });
  }

  /**
   * 图片转base64
   */
  private imageToBase64(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // #ifdef H5
      // H5环境使用FileReader
      uni.getFileSystemManager().readFile({
        filePath,
        encoding: 'base64',
        success: (res) => {
          resolve(`data:image/jpeg;base64,${res.data}`);
        },
        fail: reject
      });
      // #endif

      // #ifndef H5
      // 小程序和App环境
      uni.getFileSystemManager().readFile({
        filePath,
        encoding: 'base64',
        success: (res) => {
          resolve(`data:image/jpeg;base64,${res.data}`);
        },
        fail: reject
      });
      // #endif
    });
  }

  /**
   * 压缩图片
   */
  async compressImage(filePath: string, quality: number = 80): Promise<string> {
    return new Promise((resolve, reject) => {
      uni.compressImage({
        src: filePath,
        quality,
        success: (res) => {
          resolve(res.tempFilePath);
        },
        fail: reject
      });
    });
  }

  /**
   * 获取OCR历史记录
   */
  async getHistory(page: number = 1, pageSize: number = 20): Promise<{
    list: OCRHistory[];
    total: number;
  }> {
    return await http.get<{
      list: OCRHistory[];
      total: number;
    }>(`${this.baseUrl}/history`, { page, pageSize });
  }

  /**
   * 删除历史记录
   */
  async deleteHistory(id: string): Promise<void> {
    await http.del(`${this.baseUrl}/history/${id}`);
  }

  /**
   * 清空历史记录
   */
  async clearHistory(): Promise<void> {
    await http.del(`${this.baseUrl}/history`);
  }

  /**
   * 保存识别结果
   */
  async saveResult(type: OCRType, image: string, result: OCRResult): Promise<string> {
    const response = await http.post<{ id: string }>(`${this.baseUrl}/save`, {
      type,
      image,
      result
    });
    return response.id;
  }

  /**
   * 导出识别结果
   */
  async exportResult(id: string, format: 'txt' | 'json' | 'excel' = 'txt'): Promise<string> {
    const response = await http.get<{ url: string }>(`${this.baseUrl}/export/${id}`, { format });
    return response.url;
  }

  /**
   * 批量识别
   */
  async batchRecognize(images: string[], type: OCRType): Promise<OCRResult[]> {
    return await http.post<OCRResult[]>(`${this.baseUrl}/batch`, {
      images,
      type
    });
  }

  /**
   * 获取支持的语言列表
   */
  async getSupportedLanguages(): Promise<Array<{ code: string; name: string }>> {
    return await http.get<Array<{ code: string; name: string }>>(
      `${this.baseUrl}/languages`
    );
  }
}

// 导出单例
export const ocrService = new OCRService();