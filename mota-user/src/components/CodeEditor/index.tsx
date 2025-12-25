/**
 * 代码编辑器组件 (DC-003)
 * 支持语法高亮的代码编辑器
 */

import React, { useState, useEffect, useRef } from 'react'
import { Card, Select, Button, Space, Tooltip, message, Input, Switch } from 'antd'
import {
  CopyOutlined,
  DownloadOutlined,
  ExpandOutlined,
  CompressOutlined,
  FormatPainterOutlined,
  NumberOutlined,
  BgColorsOutlined
} from '@ant-design/icons'
import styles from './index.module.css'

// 支持的编程语言
const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'sql', label: 'SQL' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'xml', label: 'XML' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'shell', label: 'Shell/Bash' }
]

// 主题配置
const THEMES = [
  { value: 'light', label: '浅色主题' },
  { value: 'dark', label: '深色主题' },
  { value: 'monokai', label: 'Monokai' },
  { value: 'github', label: 'GitHub' },
  { value: 'dracula', label: 'Dracula' }
]

// 语法高亮关键字配置
const SYNTAX_KEYWORDS: Record<string, { keywords: string[]; types: string[]; builtins: string[] }> = {
  javascript: {
    keywords: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'async', 'await', 'class', 'extends', 'new', 'this', 'super', 'import', 'export', 'default', 'from', 'as', 'typeof', 'instanceof', 'in', 'of', 'delete', 'void', 'yield', 'static', 'get', 'set'],
    types: ['string', 'number', 'boolean', 'object', 'undefined', 'null', 'symbol', 'bigint', 'any', 'never', 'unknown', 'void'],
    builtins: ['console', 'Math', 'JSON', 'Array', 'Object', 'String', 'Number', 'Boolean', 'Date', 'Promise', 'Map', 'Set', 'RegExp', 'Error', 'setTimeout', 'setInterval', 'fetch', 'document', 'window']
  },
  typescript: {
    keywords: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'async', 'await', 'class', 'extends', 'new', 'this', 'super', 'import', 'export', 'default', 'from', 'as', 'typeof', 'instanceof', 'in', 'of', 'delete', 'void', 'yield', 'static', 'get', 'set', 'interface', 'type', 'enum', 'namespace', 'module', 'declare', 'abstract', 'implements', 'private', 'protected', 'public', 'readonly'],
    types: ['string', 'number', 'boolean', 'object', 'undefined', 'null', 'symbol', 'bigint', 'any', 'never', 'unknown', 'void', 'Array', 'Record', 'Partial', 'Required', 'Pick', 'Omit', 'Exclude', 'Extract'],
    builtins: ['console', 'Math', 'JSON', 'Array', 'Object', 'String', 'Number', 'Boolean', 'Date', 'Promise', 'Map', 'Set', 'RegExp', 'Error', 'setTimeout', 'setInterval', 'fetch', 'document', 'window']
  },
  python: {
    keywords: ['def', 'class', 'return', 'if', 'elif', 'else', 'for', 'while', 'break', 'continue', 'try', 'except', 'finally', 'raise', 'import', 'from', 'as', 'with', 'pass', 'lambda', 'yield', 'global', 'nonlocal', 'assert', 'del', 'in', 'is', 'not', 'and', 'or', 'True', 'False', 'None', 'async', 'await'],
    types: ['int', 'float', 'str', 'bool', 'list', 'dict', 'tuple', 'set', 'bytes', 'bytearray', 'complex', 'frozenset'],
    builtins: ['print', 'len', 'range', 'type', 'input', 'open', 'file', 'abs', 'all', 'any', 'bin', 'chr', 'dir', 'divmod', 'enumerate', 'eval', 'exec', 'filter', 'format', 'getattr', 'hasattr', 'hash', 'help', 'hex', 'id', 'isinstance', 'issubclass', 'iter', 'map', 'max', 'min', 'next', 'oct', 'ord', 'pow', 'repr', 'reversed', 'round', 'setattr', 'slice', 'sorted', 'sum', 'super', 'vars', 'zip']
  },
  java: {
    keywords: ['public', 'private', 'protected', 'static', 'final', 'abstract', 'class', 'interface', 'extends', 'implements', 'new', 'this', 'super', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'throws', 'import', 'package', 'void', 'instanceof', 'synchronized', 'volatile', 'transient', 'native', 'strictfp', 'enum', 'assert', 'default'],
    types: ['int', 'long', 'short', 'byte', 'float', 'double', 'char', 'boolean', 'String', 'Integer', 'Long', 'Short', 'Byte', 'Float', 'Double', 'Character', 'Boolean', 'Object', 'Class', 'Void'],
    builtins: ['System', 'Math', 'Arrays', 'Collections', 'List', 'ArrayList', 'Map', 'HashMap', 'Set', 'HashSet', 'Optional', 'Stream', 'Collectors', 'Thread', 'Runnable', 'Exception', 'RuntimeException']
  },
  sql: {
    keywords: ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'IS', 'NULL', 'ORDER', 'BY', 'ASC', 'DESC', 'LIMIT', 'OFFSET', 'GROUP', 'HAVING', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL', 'CROSS', 'ON', 'AS', 'DISTINCT', 'ALL', 'UNION', 'INTERSECT', 'EXCEPT', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'DATABASE', 'INDEX', 'VIEW', 'DROP', 'ALTER', 'ADD', 'COLUMN', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'CONSTRAINT', 'DEFAULT', 'CHECK', 'UNIQUE', 'CASCADE', 'TRUNCATE', 'COMMIT', 'ROLLBACK', 'TRANSACTION', 'BEGIN', 'END', 'IF', 'ELSE', 'CASE', 'WHEN', 'THEN', 'EXISTS', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX'],
    types: ['INT', 'INTEGER', 'BIGINT', 'SMALLINT', 'TINYINT', 'DECIMAL', 'NUMERIC', 'FLOAT', 'REAL', 'DOUBLE', 'CHAR', 'VARCHAR', 'TEXT', 'NCHAR', 'NVARCHAR', 'NTEXT', 'DATE', 'TIME', 'DATETIME', 'TIMESTAMP', 'BOOLEAN', 'BLOB', 'CLOB', 'JSON', 'XML'],
    builtins: ['NOW', 'CURRENT_DATE', 'CURRENT_TIME', 'CURRENT_TIMESTAMP', 'COALESCE', 'NULLIF', 'CAST', 'CONVERT', 'CONCAT', 'SUBSTRING', 'TRIM', 'UPPER', 'LOWER', 'LENGTH', 'REPLACE', 'ROUND', 'FLOOR', 'CEIL', 'ABS', 'MOD']
  }
}

interface CodeEditorProps {
  value?: string
  onChange?: (value: string) => void
  language?: string
  theme?: string
  readOnly?: boolean
  showLineNumbers?: boolean
  height?: number | string
  placeholder?: string
  onLanguageChange?: (language: string) => void
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value = '',
  onChange,
  language = 'javascript',
  theme = 'dark',
  readOnly = false,
  showLineNumbers = true,
  height = 400,
  placeholder = '// 在此输入代码...',
  onLanguageChange
}) => {
  const [code, setCode] = useState(value)
  const [currentLanguage, setCurrentLanguage] = useState(language)
  const [currentTheme, setCurrentTheme] = useState(theme)
  const [lineNumbers, setLineNumbers] = useState(showLineNumbers)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [highlightedCode, setHighlightedCode] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCode(value)
  }, [value])

  useEffect(() => {
    setHighlightedCode(highlightSyntax(code, currentLanguage))
  }, [code, currentLanguage])

  // 语法高亮处理
  const highlightSyntax = (text: string, lang: string): string => {
    if (!text) return ''
    
    let result = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    // 字符串高亮
    result = result.replace(/(["'`])(?:(?!\1)[^\\]|\\.)*\1/g, '<span class="string">$&</span>')

    // 注释高亮
    result = result.replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>')
    result = result.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>')
    result = result.replace(/(#.*$)/gm, '<span class="comment">$1</span>')
    result = result.replace(/(--.*$)/gm, '<span class="comment">$1</span>')

    // 数字高亮
    result = result.replace(/\b(\d+\.?\d*)\b/g, '<span class="number">$1</span>')

    // 获取语言特定的关键字
    const syntax = SYNTAX_KEYWORDS[lang] || SYNTAX_KEYWORDS.javascript

    // 关键字高亮
    syntax.keywords.forEach(keyword => {
      const regex = new RegExp(`\\b(${keyword})\\b`, 'gi')
      result = result.replace(regex, '<span class="keyword">$1</span>')
    })

    // 类型高亮
    syntax.types.forEach(type => {
      const regex = new RegExp(`\\b(${type})\\b`, 'g')
      result = result.replace(regex, '<span class="type">$1</span>')
    })

    // 内置函数高亮
    syntax.builtins.forEach(builtin => {
      const regex = new RegExp(`\\b(${builtin})\\b`, 'g')
      result = result.replace(regex, '<span class="builtin">$1</span>')
    })

    // 函数调用高亮
    result = result.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, '<span class="function">$1</span>(')

    return result
  }

  // 处理代码变化
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value
    setCode(newCode)
    onChange?.(newCode)
  }

  // 处理语言变化
  const handleLanguageChange = (lang: string) => {
    setCurrentLanguage(lang)
    onLanguageChange?.(lang)
  }

  // 复制代码
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      message.success('代码已复制到剪贴板')
    } catch {
      message.error('复制失败')
    }
  }

  // 下载代码
  const handleDownload = () => {
    const extensions: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      csharp: 'cs',
      cpp: 'cpp',
      go: 'go',
      rust: 'rs',
      php: 'php',
      ruby: 'rb',
      swift: 'swift',
      kotlin: 'kt',
      sql: 'sql',
      html: 'html',
      css: 'css',
      json: 'json',
      xml: 'xml',
      yaml: 'yaml',
      markdown: 'md',
      shell: 'sh'
    }
    
    const ext = extensions[currentLanguage] || 'txt'
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `code.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  // 格式化代码（简单实现）
  const handleFormat = () => {
    try {
      if (currentLanguage === 'json') {
        const formatted = JSON.stringify(JSON.parse(code), null, 2)
        setCode(formatted)
        onChange?.(formatted)
        message.success('代码已格式化')
      } else {
        message.info('当前语言暂不支持自动格式化')
      }
    } catch {
      message.error('格式化失败，请检查代码语法')
    }
  }

  // 切换全屏
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // 生成行号
  const renderLineNumbers = () => {
    const lines = code.split('\n')
    return lines.map((_, index) => (
      <div key={index} className={styles.lineNumber}>
        {index + 1}
      </div>
    ))
  }

  // 处理Tab键
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = textareaRef.current
      if (textarea) {
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const newCode = code.substring(0, start) + '  ' + code.substring(end)
        setCode(newCode)
        onChange?.(newCode)
        // 设置光标位置
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2
        }, 0)
      }
    }
  }

  return (
    <div 
      ref={containerRef}
      className={`${styles.container} ${styles[currentTheme]} ${isFullscreen ? styles.fullscreen : ''}`}
    >
      {/* 工具栏 */}
      <div className={styles.toolbar}>
        <Space>
          <Select
            value={currentLanguage}
            onChange={handleLanguageChange}
            options={LANGUAGES}
            style={{ width: 140 }}
            size="small"
          />
          <Select
            value={currentTheme}
            onChange={setCurrentTheme}
            options={THEMES}
            style={{ width: 120 }}
            size="small"
            prefix={<BgColorsOutlined />}
          />
        </Space>
        <Space>
          <Tooltip title="显示行号">
            <Button
              size="small"
              icon={<NumberOutlined />}
              type={lineNumbers ? 'primary' : 'default'}
              onClick={() => setLineNumbers(!lineNumbers)}
            />
          </Tooltip>
          <Tooltip title="格式化">
            <Button
              size="small"
              icon={<FormatPainterOutlined />}
              onClick={handleFormat}
              disabled={readOnly}
            />
          </Tooltip>
          <Tooltip title="复制">
            <Button
              size="small"
              icon={<CopyOutlined />}
              onClick={handleCopy}
            />
          </Tooltip>
          <Tooltip title="下载">
            <Button
              size="small"
              icon={<DownloadOutlined />}
              onClick={handleDownload}
            />
          </Tooltip>
          <Tooltip title={isFullscreen ? '退出全屏' : '全屏'}>
            <Button
              size="small"
              icon={isFullscreen ? <CompressOutlined /> : <ExpandOutlined />}
              onClick={toggleFullscreen}
            />
          </Tooltip>
        </Space>
      </div>

      {/* 编辑器主体 */}
      <div className={styles.editorWrapper} style={{ height }}>
        {lineNumbers && (
          <div className={styles.lineNumbers}>
            {renderLineNumbers()}
          </div>
        )}
        <div className={styles.editorContainer}>
          {/* 语法高亮层 */}
          <pre 
            className={styles.highlightLayer}
            dangerouslySetInnerHTML={{ __html: highlightedCode || placeholder }}
          />
          {/* 输入层 */}
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            value={code}
            onChange={handleCodeChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            readOnly={readOnly}
            spellCheck={false}
          />
        </div>
      </div>

      {/* 状态栏 */}
      <div className={styles.statusBar}>
        <Space split={<span className={styles.separator}>|</span>}>
          <span>行 {code.split('\n').length}</span>
          <span>字符 {code.length}</span>
          <span>{LANGUAGES.find(l => l.value === currentLanguage)?.label}</span>
          <span>UTF-8</span>
        </Space>
      </div>
    </div>
  )
}

export default CodeEditor