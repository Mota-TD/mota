'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Spin, message } from 'antd';

// 动态导入编辑器，避免 SSR 问题
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] items-center justify-center rounded border border-gray-200 bg-gray-50">
      <Spin tip="加载编辑器..." />
    </div>
  ),
});

// 导入样式
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  /** 编辑器内容 */
  value?: string;
  /** 内容变化回调 */
  onChange?: (value: string) => void;
  /** 占位符 */
  placeholder?: string;
  /** 是否只读 */
  readOnly?: boolean;
  /** 编辑器高度 */
  height?: number | string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 上传图片的地址 */
  uploadUrl?: string;
  /** 工具栏配置 */
  toolbar?: 'full' | 'simple' | 'minimal' | string[][];
  /** 自定义类名 */
  className?: string;
}

// 完整工具栏配置
const fullToolbar = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ size: ['small', false, 'large', 'huge'] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }, { background: [] }],
  [{ script: 'sub' }, { script: 'super' }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ indent: '-1' }, { indent: '+1' }],
  [{ direction: 'rtl' }],
  [{ align: [] }],
  ['blockquote', 'code-block'],
  ['link', 'image', 'video'],
  ['clean'],
];

// 简单工具栏配置
const simpleToolbar = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline'],
  [{ color: [] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ align: [] }],
  ['link', 'image'],
  ['clean'],
];

// 最小工具栏配置
const minimalToolbar = [
  ['bold', 'italic', 'underline'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['link'],
  ['clean'],
];

// 获取工具栏配置
const getToolbarConfig = (toolbar: RichTextEditorProps['toolbar']) => {
  if (Array.isArray(toolbar)) return toolbar;
  switch (toolbar) {
    case 'full':
      return fullToolbar;
    case 'simple':
      return simpleToolbar;
    case 'minimal':
      return minimalToolbar;
    default:
      return simpleToolbar;
  }
};

/**
 * 富文本编辑器组件
 * 基于 React Quill 封装
 */
export function RichTextEditor({
  value = '',
  onChange,
  placeholder = '请输入内容...',
  readOnly = false,
  height = 300,
  disabled = false,
  uploadUrl = '/api/files/upload',
  toolbar = 'simple',
  className = '',
}: RichTextEditorProps) {
  const [editorValue, setEditorValue] = useState(value);
  const [mounted, setMounted] = useState(false);

  // 客户端挂载后才渲染编辑器
  useEffect(() => {
    setMounted(true);
  }, []);

  // 同步外部 value
  useEffect(() => {
    if (value !== editorValue) {
      setEditorValue(value);
    }
  }, [value]);

  // 处理内容变化
  const handleChange = useCallback(
    (content: string) => {
      setEditorValue(content);
      onChange?.(content);
    },
    [onChange]
  );

  // 图片上传处理
  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      // 检查文件大小
      if (file.size > 5 * 1024 * 1024) {
        message.error('图片大小不能超过 5MB');
        return;
      }

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('上传失败');
        }

        const data = await response.json();
        const imageUrl = data.url;

        // 获取编辑器实例并插入图片
        const quill = (window as any).quillRef?.getEditor();
        if (quill) {
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, 'image', imageUrl);
          quill.setSelection(range.index + 1);
        }
      } catch (error) {
        message.error('图片上传失败');
        console.error('Image upload error:', error);
      }
    };
  }, [uploadUrl]);

  // 编辑器模块配置
  const modules = useMemo(
    () => ({
      toolbar: {
        container: getToolbarConfig(toolbar),
        handlers: {
          image: imageHandler,
        },
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    [toolbar, imageHandler]
  );

  // 编辑器格式配置
  const formats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'color',
    'background',
    'script',
    'list',
    'bullet',
    'indent',
    'direction',
    'align',
    'blockquote',
    'code-block',
    'link',
    'image',
    'video',
  ];

  if (!mounted) {
    return (
      <div
        className="flex items-center justify-center rounded border border-gray-200 bg-gray-50"
        style={{ height }}
      >
        <Spin tip="加载编辑器..." />
      </div>
    );
  }

  return (
    <div className={`rich-text-editor ${className}`}>
      <ReactQuill
        ref={(el: any) => {
          if (typeof window !== 'undefined') {
            (window as any).quillRef = el;
          }
        }}
        theme="snow"
        value={editorValue}
        onChange={handleChange}
        placeholder={placeholder}
        readOnly={readOnly || disabled}
        modules={modules}
        formats={formats}
        style={{ height }}
      />
      <style jsx global>{`
        .rich-text-editor .ql-container {
          font-size: 14px;
          font-family: inherit;
        }
        .rich-text-editor .ql-editor {
          min-height: ${typeof height === 'number' ? height - 42 : 'calc(' + height + ' - 42px)'};
        }
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 6px;
          border-top-right-radius: 6px;
          background: #fafafa;
        }
        .rich-text-editor .ql-container {
          border-bottom-left-radius: 6px;
          border-bottom-right-radius: 6px;
        }
        .dark .rich-text-editor .ql-toolbar {
          background: #1f1f1f;
          border-color: #303030;
        }
        .dark .rich-text-editor .ql-container {
          border-color: #303030;
          background: #141414;
        }
        .dark .rich-text-editor .ql-editor {
          color: #fff;
        }
        .dark .rich-text-editor .ql-editor.ql-blank::before {
          color: #666;
        }
        .dark .rich-text-editor .ql-stroke {
          stroke: #999;
        }
        .dark .rich-text-editor .ql-fill {
          fill: #999;
        }
        .dark .rich-text-editor .ql-picker {
          color: #999;
        }
        .dark .rich-text-editor .ql-picker-options {
          background: #1f1f1f;
          border-color: #303030;
        }
      `}</style>
    </div>
  );
}

/**
 * 富文本内容展示组件
 * 用于只读展示富文本内容
 */
export function RichTextViewer({
  content,
  className = '',
}: {
  content: string;
  className?: string;
}) {
  return (
    <div
      className={`rich-text-viewer ql-editor ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

/**
 * Markdown 编辑器组件
 * 基于 @uiw/react-md-editor 封装
 */
export function MarkdownEditor({
  value = '',
  onChange,
  height = 300,
  preview = 'live',
}: {
  value?: string;
  onChange?: (value: string) => void;
  height?: number;
  preview?: 'live' | 'edit' | 'preview';
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="flex items-center justify-center rounded border border-gray-200 bg-gray-50"
        style={{ height }}
      >
        <Spin tip="加载编辑器..." />
      </div>
    );
  }

  // 动态导入 Markdown 编辑器
  const MDEditor = dynamic(() => import('@uiw/react-md-editor'), {
    ssr: false,
    loading: () => (
      <div
        className="flex items-center justify-center rounded border border-gray-200 bg-gray-50"
        style={{ height }}
      >
        <Spin tip="加载编辑器..." />
      </div>
    ),
  });

  return (
    <div data-color-mode="light" className="markdown-editor">
      <MDEditor
        value={value}
        onChange={(val) => onChange?.(val || '')}
        height={height}
        preview={preview}
      />
    </div>
  );
}

export default RichTextEditor;