import React from 'react';
import { Empty, Button, Space, Typography } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  FileAddOutlined,
  FolderAddOutlined,
  TeamOutlined,
  ProjectOutlined,
  FileTextOutlined,
  CalendarOutlined,
  BellOutlined,
  StarOutlined,
  RobotOutlined
} from '@ant-design/icons';
import styles from './index.module.css';

const { Text, Title } = Typography;

export type EmptyStateType = 
  | 'default'
  | 'project'
  | 'task'
  | 'document'
  | 'member'
  | 'notification'
  | 'search'
  | 'favorite'
  | 'calendar'
  | 'ai';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  showAction?: boolean;
  size?: 'small' | 'default' | 'large';
}

// 预设配置
const presets: Record<EmptyStateType, {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText: string;
  actionIcon: React.ReactNode;
}> = {
  default: {
    icon: <FileTextOutlined className={styles.emptyIcon} />,
    title: '暂无数据',
    description: '当前没有可显示的内容',
    actionText: '添加数据',
    actionIcon: <PlusOutlined />
  },
  project: {
    icon: <ProjectOutlined className={styles.emptyIcon} />,
    title: '暂无项目',
    description: '创建您的第一个项目，开始高效的项目管理之旅',
    actionText: '创建项目',
    actionIcon: <FolderAddOutlined />
  },
  task: {
    icon: <FileAddOutlined className={styles.emptyIcon} />,
    title: '暂无任务',
    description: '当前没有待处理的任务，您可以创建新任务或等待分配',
    actionText: '创建任务',
    actionIcon: <PlusOutlined />
  },
  document: {
    icon: <FileTextOutlined className={styles.emptyIcon} />,
    title: '暂无文档',
    description: '开始创建文档，记录和分享您的知识',
    actionText: '新建文档',
    actionIcon: <FileAddOutlined />
  },
  member: {
    icon: <TeamOutlined className={styles.emptyIcon} />,
    title: '暂无成员',
    description: '邀请团队成员加入，开始协作',
    actionText: '邀请成员',
    actionIcon: <PlusOutlined />
  },
  notification: {
    icon: <BellOutlined className={styles.emptyIcon} />,
    title: '暂无通知',
    description: '您已处理完所有通知，保持关注以获取最新动态',
    actionText: '刷新',
    actionIcon: <SearchOutlined />
  },
  search: {
    icon: <SearchOutlined className={styles.emptyIcon} />,
    title: '未找到结果',
    description: '尝试使用不同的关键词或筛选条件',
    actionText: '清除筛选',
    actionIcon: <SearchOutlined />
  },
  favorite: {
    icon: <StarOutlined className={styles.emptyIcon} />,
    title: '暂无收藏',
    description: '收藏重要的项目、文档或任务，方便快速访问',
    actionText: '浏览内容',
    actionIcon: <SearchOutlined />
  },
  calendar: {
    icon: <CalendarOutlined className={styles.emptyIcon} />,
    title: '暂无日程',
    description: '当前日期没有安排，添加日程来管理您的时间',
    actionText: '添加日程',
    actionIcon: <PlusOutlined />
  },
  ai: {
    icon: <RobotOutlined className={styles.emptyIcon} />,
    title: '开始对话',
    description: '向 AI 助手提问，获取智能建议和帮助',
    actionText: '开始对话',
    actionIcon: <RobotOutlined />
  }
};

const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'default',
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  showAction = true,
  size = 'default'
}) => {
  const preset = presets[type];
  
  const sizeClass = {
    small: styles.small,
    default: styles.default,
    large: styles.large
  }[size];

  return (
    <div className={`${styles.container} ${sizeClass}`}>
      <div className={styles.iconWrapper}>
        {preset.icon}
      </div>
      <Title level={size === 'small' ? 5 : 4} className={styles.title}>
        {title || preset.title}
      </Title>
      <Text type="secondary" className={styles.description}>
        {description || preset.description}
      </Text>
      {showAction && onAction && (
        <Space className={styles.actions}>
          <Button 
            type="primary" 
            icon={preset.actionIcon}
            onClick={onAction}
            size={size === 'small' ? 'small' : 'middle'}
          >
            {actionText || preset.actionText}
          </Button>
          {secondaryActionText && onSecondaryAction && (
            <Button 
              onClick={onSecondaryAction}
              size={size === 'small' ? 'small' : 'middle'}
            >
              {secondaryActionText}
            </Button>
          )}
        </Space>
      )}
    </div>
  );
};

export default EmptyState;