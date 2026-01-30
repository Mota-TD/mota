/**
 * OCR服务类型定义
 */

/**
 * OCR识别类型
 */
export enum OCRType {
  /** 通用文字识别 */
  GENERAL = 'general',
  /** 身份证识别 */
  ID_CARD = 'id_card',
  /** 银行卡识别 */
  BANK_CARD = 'bank_card',
  /** 营业执照识别 */
  BUSINESS_LICENSE = 'business_license',
  /** 发票识别 */
  INVOICE = 'invoice',
  /** 表格识别 */
  TABLE = 'table',
  /** 手写文字识别 */
  HANDWRITING = 'handwriting'
}

/**
 * 图像来源
 */
export enum ImageSource {
  /** 相机拍照 */
  CAMERA = 'camera',
  /** 相册选择 */
  ALBUM = 'album'
}

/**
 * OCR识别请求
 */
export interface OCRRequest {
  /** 图片base64或URL */
  image: string;
  /** 识别类型 */
  type: OCRType;
  /** 是否返回位置信息 */
  includePosition?: boolean;
  /** 是否返回置信度 */
  includeConfidence?: boolean;
  /** 语言类型 */
  language?: string;
}

/**
 * 文字位置信息
 */
export interface TextPosition {
  /** 左上角x坐标 */
  x: number;
  /** 左上角y坐标 */
  y: number;
  /** 宽度 */
  width: number;
  /** 高度 */
  height: number;
}

/**
 * 识别的文字行
 */
export interface TextLine {
  /** 文字内容 */
  text: string;
  /** 置信度 0-1 */
  confidence?: number;
  /** 位置信息 */
  position?: TextPosition;
}

/**
 * OCR识别结果
 */
export interface OCRResult {
  /** 识别的文字行列表 */
  lines: TextLine[];
  /** 完整文本 */
  fullText: string;
  /** 识别类型 */
  type: OCRType;
  /** 平均置信度 */
  avgConfidence?: number;
  /** 识别耗时(ms) */
  duration?: number;
}

/**
 * 身份证识别结果
 */
export interface IDCardResult extends OCRResult {
  /** 姓名 */
  name?: string;
  /** 性别 */
  gender?: string;
  /** 民族 */
  nation?: string;
  /** 出生日期 */
  birth?: string;
  /** 住址 */
  address?: string;
  /** 身份证号 */
  idNumber?: string;
  /** 签发机关 */
  authority?: string;
  /** 有效期限 */
  validPeriod?: string;
}

/**
 * 银行卡识别结果
 */
export interface BankCardResult extends OCRResult {
  /** 银行卡号 */
  cardNumber?: string;
  /** 银行名称 */
  bankName?: string;
  /** 卡类型 */
  cardType?: string;
  /** 有效期 */
  validDate?: string;
}

/**
 * 营业执照识别结果
 */
export interface BusinessLicenseResult extends OCRResult {
  /** 企业名称 */
  companyName?: string;
  /** 统一社会信用代码 */
  creditCode?: string;
  /** 法定代表人 */
  legalPerson?: string;
  /** 注册资本 */
  registeredCapital?: string;
  /** 成立日期 */
  establishDate?: string;
  /** 营业期限 */
  businessPeriod?: string;
  /** 经营范围 */
  businessScope?: string;
}

/**
 * 发票识别结果
 */
export interface InvoiceResult extends OCRResult {
  /** 发票代码 */
  invoiceCode?: string;
  /** 发票号码 */
  invoiceNumber?: string;
  /** 开票日期 */
  invoiceDate?: string;
  /** 购买方名称 */
  buyerName?: string;
  /** 购买方税号 */
  buyerTaxNumber?: string;
  /** 销售方名称 */
  sellerName?: string;
  /** 销售方税号 */
  sellerTaxNumber?: string;
  /** 金额 */
  amount?: string;
  /** 税额 */
  tax?: string;
  /** 价税合计 */
  total?: string;
}

/**
 * 表格单元格
 */
export interface TableCell {
  /** 行索引 */
  row: number;
  /** 列索引 */
  col: number;
  /** 单元格内容 */
  text: string;
  /** 跨行数 */
  rowSpan?: number;
  /** 跨列数 */
  colSpan?: number;
}

/**
 * 表格识别结果
 */
export interface TableResult extends OCRResult {
  /** 行数 */
  rowCount: number;
  /** 列数 */
  colCount: number;
  /** 单元格列表 */
  cells: TableCell[];
  /** 表格HTML */
  html?: string;
}

/**
 * 图像分类结果
 */
export interface ImageClassification {
  /** 类别名称 */
  label: string;
  /** 置信度 0-1 */
  confidence: number;
  /** 类别ID */
  labelId?: string;
}

/**
 * 图像识别请求
 */
export interface ImageRecognitionRequest {
  /** 图片base64或URL */
  image: string;
  /** 返回结果数量 */
  topK?: number;
}

/**
 * 图像识别结果
 */
export interface ImageRecognitionResult {
  /** 分类结果列表 */
  classifications: ImageClassification[];
  /** 识别耗时(ms) */
  duration?: number;
}

/**
 * 物体检测框
 */
export interface ObjectDetection {
  /** 物体类别 */
  label: string;
  /** 置信度 0-1 */
  confidence: number;
  /** 边界框 */
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * 物体检测结果
 */
export interface ObjectDetectionResult {
  /** 检测到的物体列表 */
  objects: ObjectDetection[];
  /** 识别耗时(ms) */
  duration?: number;
}

/**
 * OCR历史记录
 */
export interface OCRHistory {
  /** 记录ID */
  id: string;
  /** 识别类型 */
  type: OCRType;
  /** 图片缩略图 */
  thumbnail: string;
  /** 识别结果 */
  result: OCRResult;
  /** 创建时间 */
  createTime: string;
}