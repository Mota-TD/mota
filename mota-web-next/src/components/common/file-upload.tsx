'use client';

import { useState, useCallback } from 'react';
import {
  Upload,
  Button,
  message,
  Progress,
  List,
  Typography,
  Space,
  Image,
  Modal,
} from 'antd';
import type { UploadProps, UploadFile, RcFile } from 'antd/es/upload';
import {
  InboxOutlined,
  UploadOutlined,
  FileOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileZipOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
} from '@ant-design/icons';

import { apiClient } from '@/lib/api-client';

const { Dragger } = Upload;
const { Text } = Typography;

// 文件类型图标映射
const fileIconMap: Record<string, React.ReactNode> = {
  image: <FileImageOutlined className="text-green-500" />,
  pdf: <FilePdfOutlined className="text-red-500" />,
  word: <FileWordOutlined className="text-blue-500" />,
  excel: <FileExcelOutlined className="text-green-600" />,
  ppt: <FilePptOutlined className="text-orange-500" />,
  zip: <FileZipOutlined className="text-yellow-500" />,
  default: <FileOutlined className="text-gray-500" />,
};

// 获取文件类型
const getFileType = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) {
    return 'image';
  }
  if (ext === 'pdf') return 'pdf';
  if (['doc', 'docx'].includes(ext)) return 'word';
  if (['xls', 'xlsx'].includes(ext)) return 'excel';
  if (['ppt', 'pptx'].includes(ext)) return 'ppt';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'zip';
  return 'default';
};

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

interface FileUploadProps {
  /** 上传地址 */
  action?: string;
  /** 接受的文件类型 */
  accept?: string;
  /** 是否支持多文件上传 */
  multiple?: boolean;
  /** 最大文件数量 */
  maxCount?: number;
  /** 最大文件大小（MB） */
  maxSize?: number;
  /** 是否使用拖拽上传 */
  dragger?: boolean;
  /** 已上传的文件列表 */
  fileList?: UploadFile[];
  /** 文件列表变化回调 */
  onChange?: (fileList: UploadFile[]) => void;
  /** 上传成功回调 */
  onSuccess?: (file: UploadFile, response: any) => void;
  /** 上传失败回调 */
  onError?: (file: UploadFile, error: Error) => void;
  /** 删除文件回调 */
  onRemove?: (file: UploadFile) => void | boolean | Promise<void | boolean>;
  /** 是否禁用 */
  disabled?: boolean;
  /** 自定义上传提示 */
  hint?: string;
  /** 是否显示文件列表 */
  showUploadList?: boolean;
  /** 列表类型 */
  listType?: 'text' | 'picture' | 'picture-card';
}

/**
 * 通用文件上传组件
 */
export function FileUpload({
  action = '/api/files/upload',
  accept,
  multiple = false,
  maxCount = 10,
  maxSize = 10,
  dragger = false,
  fileList: propFileList,
  onChange,
  onSuccess,
  onError,
  onRemove,
  disabled = false,
  hint,
  showUploadList = true,
  listType = 'text',
}: FileUploadProps) {
  const [fileList, setFileList] = useState<UploadFile[]>(propFileList || []);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  // 上传前校验
  const beforeUpload = useCallback(
    (file: RcFile) => {
      // 检查文件大小
      const isLtMaxSize = file.size / 1024 / 1024 < maxSize;
      if (!isLtMaxSize) {
        message.error(`文件大小不能超过 ${maxSize}MB`);
        return Upload.LIST_IGNORE;
      }

      // 检查文件数量
      if (fileList.length >= maxCount) {
        message.error(`最多只能上传 ${maxCount} 个文件`);
        return Upload.LIST_IGNORE;
      }

      return true;
    },
    [fileList.length, maxCount, maxSize]
  );

  // 处理文件列表变化
  const handleChange: UploadProps['onChange'] = useCallback(
    (info) => {
      let newFileList = [...info.fileList];

      // 限制文件数量
      newFileList = newFileList.slice(-maxCount);

      // 更新状态
      setFileList(newFileList);
      onChange?.(newFileList);

      // 处理上传状态
      const { status, response } = info.file;
      if (status === 'done') {
        message.success(`${info.file.name} 上传成功`);
        onSuccess?.(info.file, response);
      } else if (status === 'error') {
        message.error(`${info.file.name} 上传失败`);
        onError?.(info.file, new Error('上传失败'));
      }
    },
    [maxCount, onChange, onSuccess, onError]
  );

  // 处理删除
  const handleRemove = useCallback(
    async (file: UploadFile) => {
      if (onRemove) {
        const result = await onRemove(file);
        if (result === false) return false;
      }
      return true;
    },
    [onRemove]
  );

  // 预览图片
  const handlePreview = useCallback(async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
  }, []);

  // 自定义请求
  const customRequest = useCallback(
    async (options: any) => {
      const { file, onProgress, onSuccess, onError } = options;

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await apiClient.post(action, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            onProgress?.({ percent });
          },
        });

        onSuccess?.(response.data, file);
      } catch (error) {
        onError?.(error);
      }
    },
    [action]
  );

  // 上传配置
  const uploadProps: UploadProps = {
    accept,
    multiple,
    maxCount,
    fileList,
    beforeUpload,
    onChange: handleChange,
    onRemove: handleRemove,
    onPreview: handlePreview,
    customRequest,
    disabled,
    showUploadList,
    listType,
  };

  // 默认提示文本
  const defaultHint = `支持${accept || '所有格式'}文件，单个文件不超过${maxSize}MB`;

  if (dragger) {
    return (
      <>
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">{hint || defaultHint}</p>
        </Dragger>
        <Modal
          open={previewOpen}
          title={previewTitle}
          footer={null}
          onCancel={() => setPreviewOpen(false)}
        >
          <Image alt={previewTitle} src={previewImage} style={{ width: '100%' }} />
        </Modal>
      </>
    );
  }

  return (
    <>
      <Upload {...uploadProps}>
        <Button icon={<UploadOutlined />} disabled={disabled}>
          选择文件
        </Button>
      </Upload>
      <Text type="secondary" className="mt-2 block text-xs">
        {hint || defaultHint}
      </Text>
      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <Image alt={previewTitle} src={previewImage} style={{ width: '100%' }} />
      </Modal>
    </>
  );
}

/**
 * 图片上传组件
 */
export function ImageUpload({
  maxCount = 1,
  maxSize = 5,
  ...props
}: Omit<FileUploadProps, 'accept' | 'listType'>) {
  return (
    <FileUpload
      {...props}
      accept="image/*"
      listType="picture-card"
      maxCount={maxCount}
      maxSize={maxSize}
      hint={`支持 JPG、PNG、GIF 格式，单个文件不超过${maxSize}MB`}
    />
  );
}

/**
 * 头像上传组件
 */
export function AvatarUpload({
  value,
  onChange,
  size = 100,
}: {
  value?: string;
  onChange?: (url: string) => void;
  size?: number;
}) {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(value);

  const handleChange: UploadProps['onChange'] = (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      setLoading(false);
      const url = info.file.response?.url || info.file.url;
      setImageUrl(url);
      onChange?.(url);
    }
  };

  const uploadButton = (
    <div>
      {loading ? <UploadOutlined /> : <UploadOutlined />}
      <div className="mt-2">上传头像</div>
    </div>
  );

  return (
    <Upload
      name="avatar"
      listType="picture-card"
      className="avatar-uploader"
      showUploadList={false}
      action="/api/files/upload"
      beforeUpload={(file) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
          message.error('只能上传图片文件');
          return Upload.LIST_IGNORE;
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
          message.error('图片大小不能超过 2MB');
          return Upload.LIST_IGNORE;
        }
        return true;
      }}
      onChange={handleChange}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt="avatar"
          style={{ width: size, height: size, objectFit: 'cover' }}
          preview={false}
        />
      ) : (
        uploadButton
      )}
    </Upload>
  );
}

/**
 * 文件列表展示组件
 */
export function FileList({
  files,
  onRemove,
  onDownload,
  onPreview,
  showActions = true,
}: {
  files: Array<{
    id: string;
    name: string;
    size: number;
    url: string;
    type?: string;
  }>;
  onRemove?: (id: string) => void;
  onDownload?: (file: any) => void;
  onPreview?: (file: any) => void;
  showActions?: boolean;
}) {
  return (
    <List
      size="small"
      dataSource={files}
      renderItem={(file) => {
        const fileType = getFileType(file.name);
        const icon = fileIconMap[fileType];

        return (
          <List.Item
            actions={
              showActions
                ? [
                    fileType === 'image' && onPreview && (
                      <Button
                        key="preview"
                        type="text"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => onPreview(file)}
                      />
                    ),
                    onDownload && (
                      <Button
                        key="download"
                        type="text"
                        size="small"
                        icon={<DownloadOutlined />}
                        onClick={() => onDownload(file)}
                      />
                    ),
                    onRemove && (
                      <Button
                        key="remove"
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => onRemove(file.id)}
                      />
                    ),
                  ].filter(Boolean)
                : undefined
            }
          >
            <List.Item.Meta
              avatar={icon}
              title={<Text ellipsis={{ tooltip: file.name }}>{file.name}</Text>}
              description={formatFileSize(file.size)}
            />
          </List.Item>
        );
      }}
    />
  );
}

// 辅助函数：将文件转为 base64
const getBase64 = (file: RcFile): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export default FileUpload;