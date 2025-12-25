/**
 * 文件缩略图组件
 * 支持图片、PDF、视频等文件类型的缩略图显示
 */

import React, { useState, useEffect } from 'react';
import { Image, Spin, Tooltip, Button, message } from 'antd';
import {
  FileOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileZipOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  SoundOutlined,
  ReloadOutlined,
  EyeOutlined
} from '@ant-design/icons';
import styles from './index.module.css';
import {
  getThumbnail,
  getThumbnailUrl,
  generateThumbnail,
  ThumbnailInfo,
  supportsThumbnail
} from '../../services/api/knowledgeManagement';

interface FileThumbnailProps {
  fileId: number;
  fileName: string;
  mimeType: string;
  size?: 'small' | 'medium' | 'large';
  width?: number;
  height?: number;
  showPreview?: boolean;
  showFileName?: boolean;
  onClick?: () => void;
  onPreview?: () => void;
}

const FileThumbnail: React.FC<FileThumbnailProps> = ({
  fileId,
  fileName,
  mimeType,
  size = 'medium',
  width,
  height,
  showPreview = true,
  showFileName = false,
  onClick,
  onPreview
}) => {
  const [loading, setLoading] = useState(false);
  const [thumbnail, setThumbnail] = useState<ThumbnailInfo | null>(null);
  const [error, setError] = useState(false);
  const [generating, setGenerating] = useState(false);

  // 尺寸映射
  const sizeMap = {
    small: { width: 48, height: 48 },
    medium: { width: 80, height: 80 },
    large: { width: 120, height: 120 }
  };

  const dimensions = {
    width: width || sizeMap[size].width,
    height: height || sizeMap[size].height
  };

  // 获取文件类型图标
  const getFileIcon = () => {
    const iconStyle = { fontSize: dimensions.width * 0.5 };
    
    if (mimeType.startsWith('image/')) {
      return <FileImageOutlined style={{ ...iconStyle, color: '#1890ff' }} />;
    }
    if (mimeType.startsWith('video/')) {
      return <PlayCircleOutlined style={{ ...iconStyle, color: '#722ed1' }} />;
    }
    if (mimeType.startsWith('audio/')) {
      return <SoundOutlined style={{ ...iconStyle, color: '#fa8c16' }} />;
    }
    if (mimeType === 'application/pdf') {
      return <FilePdfOutlined style={{ ...iconStyle, color: '#ff4d4f' }} />;
    }
    if (mimeType.includes('word') || fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
      return <FileWordOutlined style={{ ...iconStyle, color: '#2b579a' }} />;
    }
    if (mimeType.includes('excel') || fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
      return <FileExcelOutlined style={{ ...iconStyle, color: '#217346' }} />;
    }
    if (mimeType.includes('powerpoint') || fileName.endsWith('.ppt') || fileName.endsWith('.pptx')) {
      return <FilePptOutlined style={{ ...iconStyle, color: '#d24726' }} />;
    }
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) {
      return <FileZipOutlined style={{ ...iconStyle, color: '#faad14' }} />;
    }
    if (mimeType.startsWith('text/') || fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      return <FileTextOutlined style={{ ...iconStyle, color: '#52c41a' }} />;
    }
    return <FileOutlined style={{ ...iconStyle, color: '#8c8c8c' }} />;
  };

  // 加载缩略图
  useEffect(() => {
    if (!supportsThumbnail(mimeType)) {
      return;
    }

    const loadThumbnail = async () => {
      setLoading(true);
      setError(false);
      try {
        const info = await getThumbnail(fileId);
        setThumbnail(info);
      } catch (err) {
        // 缩略图不存在，可能需要生成
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadThumbnail();
  }, [fileId, mimeType]);

  // 生成缩略图
  const handleGenerateThumbnail = async () => {
    if (!supportsThumbnail(mimeType)) {
      message.warning('该文件类型不支持生成缩略图');
      return;
    }

    setGenerating(true);
    try {
      const info = await generateThumbnail({
        fileId,
        width: dimensions.width * 2,
        height: dimensions.height * 2
      });
      setThumbnail(info);
      setError(false);
      message.success('缩略图生成成功');
    } catch (err) {
      message.error('缩略图生成失败');
    } finally {
      setGenerating(false);
    }
  };

  // 渲染缩略图内容
  const renderContent = () => {
    // 加载中
    if (loading) {
      return (
        <div className={styles.placeholder}>
          <Spin size="small" />
        </div>
      );
    }

    // 有缩略图
    if (thumbnail && !error) {
      const thumbnailUrl = getThumbnailUrl(fileId, dimensions.width * 2, dimensions.height * 2);
      
      return (
        <div className={styles.imageWrapper}>
          <Image
            src={thumbnailUrl}
            alt={fileName}
            width={dimensions.width}
            height={dimensions.height}
            preview={showPreview ? {
              mask: <EyeOutlined />
            } : false}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            onError={() => setError(true)}
          />
          {mimeType.startsWith('video/') && (
            <div className={styles.videoOverlay}>
              <PlayCircleOutlined />
            </div>
          )}
        </div>
      );
    }

    // 支持缩略图但生成失败或不存在
    if (supportsThumbnail(mimeType) && error) {
      return (
        <div className={styles.placeholder}>
          {getFileIcon()}
          <Tooltip title="点击生成缩略图">
            <Button
              type="text"
              size="small"
              icon={<ReloadOutlined spin={generating} />}
              onClick={(e) => {
                e.stopPropagation();
                handleGenerateThumbnail();
              }}
              loading={generating}
              className={styles.generateBtn}
            />
          </Tooltip>
        </div>
      );
    }

    // 不支持缩略图，显示文件图标
    return (
      <div className={styles.placeholder}>
        {getFileIcon()}
      </div>
    );
  };

  return (
    <div
      className={`${styles.container} ${onClick ? styles.clickable : ''}`}
      style={{ width: dimensions.width, height: dimensions.height }}
      onClick={onClick}
    >
      {renderContent()}
      {showFileName && (
        <Tooltip title={fileName}>
          <div className={styles.fileName}>
            {fileName.length > 15 ? fileName.substring(0, 12) + '...' : fileName}
          </div>
        </Tooltip>
      )}
    </div>
  );
};

export default FileThumbnail;