'use client';

import { Skeleton as AntSkeleton, Card, List, Space } from 'antd';
import type { SkeletonProps as AntSkeletonProps } from 'antd';

interface SkeletonProps extends AntSkeletonProps {
  /** 骨架屏类型 */
  type?: 'default' | 'card' | 'list' | 'table' | 'form' | 'detail';
  /** 列表项数量 */
  count?: number;
  /** 是否显示头像 */
  showAvatar?: boolean;
}

/**
 * 通用骨架屏组件
 * 支持多种预设类型
 */
export function Skeleton({
  type = 'default',
  count = 3,
  showAvatar = false,
  ...props
}: SkeletonProps) {
  switch (type) {
    case 'card':
      return <CardSkeleton count={count} />;
    case 'list':
      return <ListSkeleton count={count} showAvatar={showAvatar} />;
    case 'table':
      return <TableSkeleton rows={count} />;
    case 'form':
      return <FormSkeleton fields={count} />;
    case 'detail':
      return <DetailSkeleton />;
    default:
      return <AntSkeleton active {...props} />;
  }
}

/**
 * 卡片骨架屏
 */
export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="w-full">
          <AntSkeleton active avatar paragraph={{ rows: 3 }} />
        </Card>
      ))}
    </div>
  );
}

/**
 * 列表骨架屏
 */
export function ListSkeleton({
  count = 5,
  showAvatar = true,
}: {
  count?: number;
  showAvatar?: boolean;
}) {
  return (
    <List
      dataSource={Array.from({ length: count })}
      renderItem={(_, index) => (
        <List.Item key={index}>
          <AntSkeleton
            active
            avatar={showAvatar}
            paragraph={{ rows: 2 }}
          />
        </List.Item>
      )}
    />
  );
}

/**
 * 表格骨架屏
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full">
      {/* 表头 */}
      <div className="mb-4 flex gap-4 border-b pb-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex-1">
            <AntSkeleton.Input active size="small" className="!w-full" />
          </div>
        ))}
      </div>
      {/* 表格行 */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="mb-3 flex gap-4">
          {Array.from({ length: 5 }).map((_, colIndex) => (
            <div key={colIndex} className="flex-1">
              <AntSkeleton.Input active size="small" className="!w-full" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * 表单骨架屏
 */
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <AntSkeleton.Input active size="small" style={{ width: 100 }} />
          <AntSkeleton.Input active size="large" className="!w-full" />
        </div>
      ))}
      <div className="flex gap-4 pt-4">
        <AntSkeleton.Button active size="large" />
        <AntSkeleton.Button active size="large" />
      </div>
    </div>
  );
}

/**
 * 详情页骨架屏
 */
export function DetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* 标题区域 */}
      <div className="flex items-center gap-4">
        <AntSkeleton.Avatar active size={64} />
        <div className="flex-1 space-y-2">
          <AntSkeleton.Input active size="large" style={{ width: 300 }} />
          <AntSkeleton.Input active size="small" style={{ width: 200 }} />
        </div>
      </div>

      {/* 信息卡片 */}
      <Card>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <AntSkeleton.Input active size="small" style={{ width: 80 }} />
              <AntSkeleton.Input active size="default" style={{ width: 120 }} />
            </div>
          ))}
        </div>
      </Card>

      {/* 内容区域 */}
      <Card>
        <AntSkeleton active paragraph={{ rows: 6 }} />
      </Card>

      {/* 列表区域 */}
      <Card>
        <ListSkeleton count={3} />
      </Card>
    </div>
  );
}

/**
 * 统计卡片骨架屏
 */
export function StatCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index}>
          <Space direction="vertical" className="w-full">
            <AntSkeleton.Input active size="small" style={{ width: 80 }} />
            <AntSkeleton.Input active size="large" style={{ width: 100 }} />
          </Space>
        </Card>
      ))}
    </div>
  );
}

/**
 * 评论骨架屏
 */
export function CommentSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex gap-3">
          <AntSkeleton.Avatar active size={40} />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <AntSkeleton.Input active size="small" style={{ width: 100 }} />
              <AntSkeleton.Input active size="small" style={{ width: 80 }} />
            </div>
            <AntSkeleton active paragraph={{ rows: 2 }} title={false} />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 时间线骨架屏
 */
export function TimelineSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4 pl-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="relative">
          <div className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-gray-200" />
          <div className="space-y-2 border-l-2 border-gray-200 pl-4">
            <AntSkeleton.Input active size="small" style={{ width: 120 }} />
            <AntSkeleton active paragraph={{ rows: 1 }} title={false} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default Skeleton;