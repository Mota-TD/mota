'use client';

import { Spin, SpinProps } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface LoadingProps extends SpinProps {
  /** 是否全屏显示 */
  fullscreen?: boolean;
  /** 自定义提示文字 */
  tip?: string;
  /** 加载图标大小 */
  iconSize?: number;
}

/**
 * 通用加载组件
 * 支持全屏加载、内联加载等多种模式
 */
export function Loading({
  fullscreen = false,
  tip = '加载中...',
  iconSize = 24,
  ...props
}: LoadingProps) {
  const antIcon = <LoadingOutlined style={{ fontSize: iconSize }} spin />;

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <Spin indicator={antIcon} tip={tip} size="large" {...props} />
      </div>
    );
  }

  return <Spin indicator={antIcon} tip={tip} {...props} />;
}

/**
 * 页面级加载组件
 * 用于页面切换时的加载状态
 */
export function PageLoading({ tip = '页面加载中...' }: { tip?: string }) {
  return (
    <div className="flex h-[calc(100vh-200px)] items-center justify-center">
      <Loading tip={tip} iconSize={32} />
    </div>
  );
}

/**
 * 内容区域加载组件
 * 用于卡片、列表等内容区域的加载状态
 */
export function ContentLoading({ tip = '加载中...' }: { tip?: string }) {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <Loading tip={tip} />
    </div>
  );
}

/**
 * 按钮加载组件
 * 用于按钮内的加载状态
 */
export function ButtonLoading({ size = 14 }: { size?: number }) {
  return <LoadingOutlined style={{ fontSize: size }} spin />;
}

export default Loading;