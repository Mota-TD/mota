/**
 * 版本对比组件 (DC-011, DC-012, DC-013)
 * 支持版本历史、Diff视图对比、版本回滚
 */

import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Button, 
  Select, 
  Space, 
  Tag, 
  Timeline, 
  Modal, 
  message, 
  Tooltip,
  Avatar,
  Empty,
  Spin,
  Switch,
  Tabs,
  Badge
} from 'antd'
import {
  HistoryOutlined,
  DiffOutlined,
  RollbackOutlined,
  UserOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  PlusOutlined,
  MinusOutlined,
  SwapOutlined,
  EyeOutlined,
  SaveOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'
import styles from './index.module.css'

// 版本类型
interface Version {
  id: number
  documentId: number
  versionNumber: number
  title: string
  content: string
  changeSummary?: string
  editorId: number
  editorName: string
  versionType: 'auto' | 'manual' | 'rollback'
  contentHash?: string
  createdAt: string
  additions: number
  deletions: number
}

// Diff行类型
interface DiffLine {
  type: 'unchanged' | 'added' | 'removed' | 'modified'
  lineNumber: { old?: number; new?: number }
  content: string
  oldContent?: string
}

// Diff块类型
interface DiffHunk {
  oldStart: number
  oldLines: number
  newStart: number
  newLines: number
  lines: DiffLine[]
}

interface VersionDiffProps {
  documentId: number
  currentContent: string
  versions?: Version[]
  onRollback?: (versionNumber: number) => void
  onSaveVersion?: (summary: string) => void
  readOnly?: boolean
}

const VersionDiff: React.FC<VersionDiffProps> = ({
  documentId,
  currentContent,
  versions: initialVersions = [],
  onRollback,
  onSaveVersion,
  readOnly = false
}) => {
  const [versions, setVersions] = useState<Version[]>(initialVersions)
  const [loading, setLoading] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null)
  const [compareVersion, setCompareVersion] = useState<Version | null>(null)
  const [diffResult, setDiffResult] = useState<DiffHunk[]>([])
  const [showDiffModal, setShowDiffModal] = useState(false)
  const [showRollbackModal, setShowRollbackModal] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [versionSummary, setVersionSummary] = useState('')
  const [viewMode, setViewMode] = useState<'unified' | 'split'>('unified')
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [activeTab, setActiveTab] = useState('history')

  // 模拟加载版本历史
  useEffect(() => {
    if (initialVersions.length === 0) {
      loadVersionHistory()
    }
  }, [documentId, initialVersions.length])

  const loadVersionHistory = async () => {
    setLoading(true)
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const mockVersions: Version[] = [
      {
        id: 1,
        documentId,
        versionNumber: 5,
        title: '项目需求文档',
        content: currentContent,
        changeSummary: '更新了功能需求描述',
        editorId: 1,
        editorName: '当前用户',
        versionType: 'auto',
        createdAt: new Date().toISOString(),
        additions: 15,
        deletions: 3
      },
      {
        id: 2,
        documentId,
        versionNumber: 4,
        title: '项目需求文档',
        content: '这是版本4的内容\n\n## 功能需求\n\n1. 用户登录\n2. 数据管理\n3. 报表导出',
        changeSummary: '添加了报表导出功能',
        editorId: 2,
        editorName: '张三',
        versionType: 'manual',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        additions: 8,
        deletions: 0
      },
      {
        id: 3,
        documentId,
        versionNumber: 3,
        title: '项目需求文档',
        content: '这是版本3的内容\n\n## 功能需求\n\n1. 用户登录\n2. 数据管理',
        changeSummary: '修复了格式问题',
        editorId: 3,
        editorName: '李四',
        versionType: 'auto',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        additions: 2,
        deletions: 5
      },
      {
        id: 4,
        documentId,
        versionNumber: 2,
        title: '项目需求文档',
        content: '这是版本2的内容\n\n## 功能需求\n\n1. 用户登录',
        changeSummary: '添加了用户登录功能',
        editorId: 2,
        editorName: '张三',
        versionType: 'manual',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        additions: 10,
        deletions: 0
      },
      {
        id: 5,
        documentId,
        versionNumber: 1,
        title: '项目需求文档',
        content: '这是版本1的初始内容',
        changeSummary: '初始版本',
        editorId: 1,
        editorName: '当前用户',
        versionType: 'manual',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        additions: 5,
        deletions: 0
      }
    ]
    
    setVersions(mockVersions)
    setLoading(false)
  }

  // 计算Diff
  const computeDiff = (oldContent: string, newContent: string): DiffHunk[] => {
    const oldLines = oldContent.split('\n')
    const newLines = newContent.split('\n')
    const hunks: DiffHunk[] = []
    
    // 简化的Diff算法（实际项目中应使用diff库）
    let oldIndex = 0
    let newIndex = 0
    let currentHunk: DiffHunk | null = null
    
    const maxLength = Math.max(oldLines.length, newLines.length)
    
    for (let i = 0; i < maxLength; i++) {
      const oldLine = oldLines[i]
      const newLine = newLines[i]
      
      if (oldLine === newLine) {
        // 相同行
        if (currentHunk) {
          currentHunk.lines.push({
            type: 'unchanged',
            lineNumber: { old: i + 1, new: i + 1 },
            content: oldLine || ''
          })
        }
      } else if (oldLine === undefined) {
        // 新增行
        if (!currentHunk) {
          currentHunk = {
            oldStart: i + 1,
            oldLines: 0,
            newStart: i + 1,
            newLines: 0,
            lines: []
          }
          hunks.push(currentHunk)
        }
        currentHunk.lines.push({
          type: 'added',
          lineNumber: { new: i + 1 },
          content: newLine
        })
        currentHunk.newLines++
      } else if (newLine === undefined) {
        // 删除行
        if (!currentHunk) {
          currentHunk = {
            oldStart: i + 1,
            oldLines: 0,
            newStart: i + 1,
            newLines: 0,
            lines: []
          }
          hunks.push(currentHunk)
        }
        currentHunk.lines.push({
          type: 'removed',
          lineNumber: { old: i + 1 },
          content: oldLine
        })
        currentHunk.oldLines++
      } else {
        // 修改行
        if (!currentHunk) {
          currentHunk = {
            oldStart: i + 1,
            oldLines: 0,
            newStart: i + 1,
            newLines: 0,
            lines: []
          }
          hunks.push(currentHunk)
        }
        currentHunk.lines.push({
          type: 'removed',
          lineNumber: { old: i + 1 },
          content: oldLine
        })
        currentHunk.lines.push({
          type: 'added',
          lineNumber: { new: i + 1 },
          content: newLine
        })
        currentHunk.oldLines++
        currentHunk.newLines++
      }
    }
    
    // 如果没有差异，创建一个显示所有内容的hunk
    if (hunks.length === 0) {
      hunks.push({
        oldStart: 1,
        oldLines: oldLines.length,
        newStart: 1,
        newLines: newLines.length,
        lines: oldLines.map((line, i) => ({
          type: 'unchanged' as const,
          lineNumber: { old: i + 1, new: i + 1 },
          content: line
        }))
      })
    }
    
    return hunks
  }

  // 查看版本对比
  const handleCompare = (version: Version, compareWith?: Version) => {
    setSelectedVersion(version)
    setCompareVersion(compareWith || null)
    
    const oldContent = compareWith?.content || ''
    const newContent = version.content
    
    const diff = computeDiff(oldContent, newContent)
    setDiffResult(diff)
    setShowDiffModal(true)
  }

  // 回滚版本
  const handleRollback = (version: Version) => {
    setSelectedVersion(version)
    setShowRollbackModal(true)
  }

  // 确认回滚
  const confirmRollback = () => {
    if (!selectedVersion) return
    
    onRollback?.(selectedVersion.versionNumber)
    setShowRollbackModal(false)
    message.success(`已回滚到版本 ${selectedVersion.versionNumber}`)
  }

  // 保存新版本
  const handleSaveVersion = () => {
    if (!versionSummary.trim()) {
      message.warning('请输入版本说明')
      return
    }
    
    onSaveVersion?.(versionSummary)
    setShowSaveModal(false)
    setVersionSummary('')
    message.success('版本已保存')
    
    // 刷新版本列表
    loadVersionHistory()
  }

  // 渲染版本类型标签
  const renderVersionTypeTag = (type: Version['versionType']) => {
    const config = {
      auto: { color: 'default', text: '自动保存' },
      manual: { color: 'blue', text: '手动保存' },
      rollback: { color: 'orange', text: '回滚' }
    }
    const { color, text } = config[type]
    return <Tag color={color}>{text}</Tag>
  }

  // 渲染Diff行
  const renderDiffLine = (line: DiffLine, index: number) => {
    const lineClass = {
      unchanged: styles.unchanged,
      added: styles.added,
      removed: styles.removed,
      modified: styles.modified
    }[line.type]

    const prefix = {
      unchanged: ' ',
      added: '+',
      removed: '-',
      modified: '~'
    }[line.type]

    return (
      <div key={index} className={`${styles.diffLine} ${lineClass}`}>
        {showLineNumbers && (
          <span className={styles.lineNumbers}>
            <span className={styles.oldLineNum}>{line.lineNumber.old || ''}</span>
            <span className={styles.newLineNum}>{line.lineNumber.new || ''}</span>
          </span>
        )}
        <span className={styles.prefix}>{prefix}</span>
        <span className={styles.lineContent}>{line.content || ' '}</span>
      </div>
    )
  }

  // 渲染统一视图
  const renderUnifiedView = () => {
    return (
      <div className={styles.diffContent}>
        {diffResult.map((hunk, hunkIndex) => (
          <div key={hunkIndex} className={styles.diffHunk}>
            <div className={styles.hunkHeader}>
              @@ -{hunk.oldStart},{hunk.oldLines} +{hunk.newStart},{hunk.newLines} @@
            </div>
            {hunk.lines.map((line, lineIndex) => renderDiffLine(line, lineIndex))}
          </div>
        ))}
      </div>
    )
  }

  // 渲染分栏视图
  const renderSplitView = () => {
    return (
      <div className={styles.splitView}>
        <div className={styles.splitPane}>
          <div className={styles.paneHeader}>
            <Tag color="red">旧版本</Tag>
            {compareVersion && `v${compareVersion.versionNumber}`}
          </div>
          <div className={styles.paneContent}>
            {diffResult.map((hunk, hunkIndex) => (
              <div key={hunkIndex}>
                {hunk.lines
                  .filter(line => line.type === 'unchanged' || line.type === 'removed')
                  .map((line, lineIndex) => (
                    <div 
                      key={lineIndex} 
                      className={`${styles.diffLine} ${line.type === 'removed' ? styles.removed : ''}`}
                    >
                      {showLineNumbers && (
                        <span className={styles.lineNum}>{line.lineNumber.old || ''}</span>
                      )}
                      <span className={styles.lineContent}>{line.content || ' '}</span>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>
        <div className={styles.splitPane}>
          <div className={styles.paneHeader}>
            <Tag color="green">新版本</Tag>
            {selectedVersion && `v${selectedVersion.versionNumber}`}
          </div>
          <div className={styles.paneContent}>
            {diffResult.map((hunk, hunkIndex) => (
              <div key={hunkIndex}>
                {hunk.lines
                  .filter(line => line.type === 'unchanged' || line.type === 'added')
                  .map((line, lineIndex) => (
                    <div 
                      key={lineIndex} 
                      className={`${styles.diffLine} ${line.type === 'added' ? styles.added : ''}`}
                    >
                      {showLineNumbers && (
                        <span className={styles.lineNum}>{line.lineNumber.new || ''}</span>
                      )}
                      <span className={styles.lineContent}>{line.content || ' '}</span>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // 渲染版本历史时间线
  const renderVersionTimeline = () => {
    if (loading) {
      return (
        <div className={styles.loading}>
          <Spin />
        </div>
      )
    }

    if (versions.length === 0) {
      return <Empty description="暂无版本历史" />
    }

    return (
      <Timeline className={styles.timeline}>
        {versions.map((version, index) => (
          <Timeline.Item
            key={version.id}
            color={index === 0 ? 'green' : 'blue'}
            dot={index === 0 ? <CheckCircleOutlined /> : undefined}
          >
            <div className={styles.versionItem}>
              <div className={styles.versionHeader}>
                <Space>
                  <Tag color="blue">v{version.versionNumber}</Tag>
                  {renderVersionTypeTag(version.versionType)}
                  {index === 0 && <Tag color="green">当前版本</Tag>}
                </Space>
                <span className={styles.versionTime}>
                  <ClockCircleOutlined /> {new Date(version.createdAt).toLocaleString()}
                </span>
              </div>
              
              <div className={styles.versionInfo}>
                <Space>
                  <Avatar size="small" icon={<UserOutlined />}>
                    {version.editorName.charAt(0)}
                  </Avatar>
                  <span>{version.editorName}</span>
                </Space>
                <div className={styles.changeStats}>
                  <span className={styles.additions}>
                    <PlusOutlined /> {version.additions}
                  </span>
                  <span className={styles.deletions}>
                    <MinusOutlined /> {version.deletions}
                  </span>
                </div>
              </div>
              
              {version.changeSummary && (
                <div className={styles.changeSummary}>
                  {version.changeSummary}
                </div>
              )}
              
              <div className={styles.versionActions}>
                <Space>
                  <Tooltip title="查看内容">
                    <Button
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => handleCompare(version)}
                    >
                      查看
                    </Button>
                  </Tooltip>
                  {index < versions.length - 1 && (
                    <Tooltip title="与上一版本对比">
                      <Button
                        size="small"
                        icon={<DiffOutlined />}
                        onClick={() => handleCompare(version, versions[index + 1])}
                      >
                        对比
                      </Button>
                    </Tooltip>
                  )}
                  {index > 0 && !readOnly && (
                    <Tooltip title="回滚到此版本">
                      <Button
                        size="small"
                        icon={<RollbackOutlined />}
                        onClick={() => handleRollback(version)}
                      >
                        回滚
                      </Button>
                    </Tooltip>
                  )}
                </Space>
              </div>
            </div>
          </Timeline.Item>
        ))}
      </Timeline>
    )
  }

  return (
    <div className={styles.container}>
      <Card
        title={
          <Space>
            <HistoryOutlined />
            版本管理
          </Space>
        }
        extra={
          !readOnly && (
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={() => setShowSaveModal(true)}
            >
              保存版本
            </Button>
          )
        }
        className={styles.card}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'history',
              label: (
                <span>
                  <HistoryOutlined />
                  版本历史
                </span>
              ),
              children: renderVersionTimeline()
            },
            {
              key: 'compare',
              label: (
                <span>
                  <DiffOutlined />
                  版本对比
                </span>
              ),
              children: (
                <div className={styles.compareTab}>
                  <div className={styles.compareSelector}>
                    <Space>
                      <span>选择版本：</span>
                      <Select
                        style={{ width: 200 }}
                        placeholder="选择旧版本"
                        value={compareVersion?.id}
                        onChange={id => {
                          const v = versions.find(v => v.id === id)
                          setCompareVersion(v || null)
                        }}
                        options={versions.map(v => ({
                          value: v.id,
                          label: `v${v.versionNumber} - ${v.changeSummary || '无描述'}`
                        }))}
                      />
                      <SwapOutlined />
                      <Select
                        style={{ width: 200 }}
                        placeholder="选择新版本"
                        value={selectedVersion?.id}
                        onChange={id => {
                          const v = versions.find(v => v.id === id)
                          setSelectedVersion(v || null)
                        }}
                        options={versions.map(v => ({
                          value: v.id,
                          label: `v${v.versionNumber} - ${v.changeSummary || '无描述'}`
                        }))}
                      />
                      <Button
                        type="primary"
                        icon={<DiffOutlined />}
                        onClick={() => {
                          if (selectedVersion && compareVersion) {
                            handleCompare(selectedVersion, compareVersion)
                          } else {
                            message.warning('请选择要对比的两个版本')
                          }
                        }}
                      >
                        对比
                      </Button>
                    </Space>
                  </div>
                </div>
              )
            }
          ]}
        />
      </Card>

      {/* Diff对比弹窗 */}
      <Modal
        title={
          <Space>
            <DiffOutlined />
            版本对比
            {selectedVersion && (
              <Tag color="blue">v{selectedVersion.versionNumber}</Tag>
            )}
            {compareVersion && (
              <>
                <span>vs</span>
                <Tag color="orange">v{compareVersion.versionNumber}</Tag>
              </>
            )}
          </Space>
        }
        open={showDiffModal}
        onCancel={() => setShowDiffModal(false)}
        footer={null}
        width={900}
        className={styles.diffModal}
      >
        <div className={styles.diffToolbar}>
          <Space>
            <span>视图模式：</span>
            <Select
              value={viewMode}
              onChange={setViewMode}
              options={[
                { value: 'unified', label: '统一视图' },
                { value: 'split', label: '分栏视图' }
              ]}
              style={{ width: 120 }}
            />
            <Switch
              checked={showLineNumbers}
              onChange={setShowLineNumbers}
              checkedChildren="行号"
              unCheckedChildren="行号"
            />
          </Space>
          <div className={styles.diffStats}>
            <span className={styles.additions}>
              <PlusOutlined /> {selectedVersion?.additions || 0} 新增
            </span>
            <span className={styles.deletions}>
              <MinusOutlined /> {selectedVersion?.deletions || 0} 删除
            </span>
          </div>
        </div>
        
        <div className={styles.diffContainer}>
          {viewMode === 'unified' ? renderUnifiedView() : renderSplitView()}
        </div>
      </Modal>

      {/* 回滚确认弹窗 */}
      <Modal
        title={
          <Space>
            <RollbackOutlined />
            确认回滚
          </Space>
        }
        open={showRollbackModal}
        onCancel={() => setShowRollbackModal(false)}
        onOk={confirmRollback}
        okText="确认回滚"
        okButtonProps={{ danger: true }}
      >
        <div className={styles.rollbackConfirm}>
          <p>确定要回滚到以下版本吗？</p>
          {selectedVersion && (
            <div className={styles.rollbackVersion}>
              <Tag color="blue">v{selectedVersion.versionNumber}</Tag>
              <span>{selectedVersion.changeSummary}</span>
              <div className={styles.rollbackTime}>
                {new Date(selectedVersion.createdAt).toLocaleString()}
              </div>
            </div>
          )}
          <p className={styles.warning}>
            ⚠️ 回滚后，当前未保存的更改将丢失。
          </p>
        </div>
      </Modal>

      {/* 保存版本弹窗 */}
      <Modal
        title={
          <Space>
            <SaveOutlined />
            保存新版本
          </Space>
        }
        open={showSaveModal}
        onCancel={() => {
          setShowSaveModal(false)
          setVersionSummary('')
        }}
        onOk={handleSaveVersion}
        okText="保存"
      >
        <div className={styles.saveVersion}>
          <p>请输入版本说明：</p>
          <textarea
            className={styles.summaryInput}
            value={versionSummary}
            onChange={e => setVersionSummary(e.target.value)}
            placeholder="描述此版本的主要更改..."
            rows={4}
          />
        </div>
      </Modal>
    </div>
  )
}

export default VersionDiff