/**
 * 实时协作编辑器组件 (DC-004, DC-005, DC-006, DC-007)
 * 支持多人同时编辑、光标显示、冲突合并、在线状态
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Card, Avatar, Tooltip, Badge, Tag, message, Modal, Button, Space, List, Alert } from 'antd'
import {
  UserOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  TeamOutlined,
  DisconnectOutlined,
  WifiOutlined
} from '@ant-design/icons'
import styles from './index.module.css'

// 协作者类型
interface Collaborator {
  id: number
  userId: number
  userName: string
  avatar?: string
  color: string
  isOnline: boolean
  lastActiveAt: string
  cursorPosition?: CursorPosition
  selection?: SelectionRange
}

// 光标位置
interface CursorPosition {
  line: number
  column: number
  offset: number
}

// 选区范围
interface SelectionRange {
  start: CursorPosition
  end: CursorPosition
}

// 编辑操作
interface EditOperation {
  type: 'insert' | 'delete' | 'replace'
  position: number
  content?: string
  length?: number
  userId: number
  timestamp: number
  version: number
}

// 冲突信息
interface ConflictInfo {
  id: string
  localOperation: EditOperation
  remoteOperation: EditOperation
  resolvedContent?: string
  status: 'pending' | 'resolved' | 'rejected'
}

// 协作者颜色池
const COLLABORATOR_COLORS = [
  '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
  '#13c2c2', '#eb2f96', '#fa8c16', '#a0d911', '#2f54eb'
]

interface CollaborativeEditorProps {
  documentId: number
  userId: number
  userName: string
  content: string
  onChange?: (content: string) => void
  onSave?: (content: string) => void
  readOnly?: boolean
}

const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({
  documentId,
  userId,
  userName,
  content: initialContent,
  onChange,
  onSave,
  readOnly = false
}) => {
  const [content, setContent] = useState(initialContent)
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [isConnected, setIsConnected] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [conflicts, setConflicts] = useState<ConflictInfo[]>([])
  const [showConflictModal, setShowConflictModal] = useState(false)
  const [currentConflict, setCurrentConflict] = useState<ConflictInfo | null>(null)
  const [localVersion, setLocalVersion] = useState(1)
  const [pendingOperations, setPendingOperations] = useState<EditOperation[]>([])
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({ line: 1, column: 1, offset: 0 })
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // 初始化WebSocket连接（模拟）
  useEffect(() => {
    // 模拟WebSocket连接
    const mockConnect = () => {
      setIsConnected(true)
      
      // 模拟其他协作者
      const mockCollaborators: Collaborator[] = [
        {
          id: 1,
          userId: 2,
          userName: '张三',
          color: COLLABORATOR_COLORS[0],
          isOnline: true,
          lastActiveAt: new Date().toISOString(),
          cursorPosition: { line: 5, column: 10, offset: 120 }
        },
        {
          id: 2,
          userId: 3,
          userName: '李四',
          color: COLLABORATOR_COLORS[1],
          isOnline: true,
          lastActiveAt: new Date().toISOString(),
          cursorPosition: { line: 8, column: 5, offset: 200 }
        },
        {
          id: 3,
          userId: 4,
          userName: '王五',
          color: COLLABORATOR_COLORS[2],
          isOnline: false,
          lastActiveAt: new Date(Date.now() - 3600000).toISOString()
        }
      ]
      setCollaborators(mockCollaborators)
    }

    mockConnect()

    // 模拟定期同步
    syncIntervalRef.current = setInterval(() => {
      simulateRemoteChanges()
    }, 10000)

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [documentId])

  // 模拟远程变更
  const simulateRemoteChanges = () => {
    // 随机更新协作者光标位置
    setCollaborators(prev => prev.map(c => {
      if (c.isOnline && Math.random() > 0.5) {
        return {
          ...c,
          cursorPosition: {
            line: Math.floor(Math.random() * 20) + 1,
            column: Math.floor(Math.random() * 50) + 1,
            offset: Math.floor(Math.random() * 500)
          },
          lastActiveAt: new Date().toISOString()
        }
      }
      return c
    }))
  }

  // 处理内容变化
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    const oldContent = content
    
    // 创建编辑操作
    const operation: EditOperation = {
      type: newContent.length > oldContent.length ? 'insert' : 'delete',
      position: e.target.selectionStart,
      content: newContent.length > oldContent.length 
        ? newContent.slice(oldContent.length) 
        : undefined,
      length: Math.abs(newContent.length - oldContent.length),
      userId,
      timestamp: Date.now(),
      version: localVersion
    }

    // 添加到待处理操作队列
    setPendingOperations(prev => [...prev, operation])
    
    setContent(newContent)
    setLocalVersion(prev => prev + 1)
    onChange?.(newContent)

    // 模拟同步
    simulateSync(operation)
  }

  // 模拟同步操作
  const simulateSync = async (operation: EditOperation) => {
    setIsSyncing(true)
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 模拟冲突检测（10%概率产生冲突）
    if (Math.random() < 0.1) {
      const conflict: ConflictInfo = {
        id: `conflict-${Date.now()}`,
        localOperation: operation,
        remoteOperation: {
          type: 'insert',
          position: operation.position,
          content: '【远程用户编辑】',
          userId: 2,
          timestamp: Date.now() - 100,
          version: localVersion - 1
        },
        status: 'pending'
      }
      setConflicts(prev => [...prev, conflict])
      setCurrentConflict(conflict)
      setShowConflictModal(true)
    }

    // 移除已同步的操作
    setPendingOperations(prev => prev.filter(op => op.timestamp !== operation.timestamp))
    setIsSyncing(false)
  }

  // 处理光标位置变化
  const handleCursorChange = () => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const offset = textarea.selectionStart
    const textBeforeCursor = content.substring(0, offset)
    const lines = textBeforeCursor.split('\n')
    const line = lines.length
    const column = lines[lines.length - 1].length + 1

    const newPosition: CursorPosition = { line, column, offset }
    setCursorPosition(newPosition)

    // 广播光标位置（模拟）
    broadcastCursorPosition(newPosition)
  }

  // 广播光标位置
  const broadcastCursorPosition = (position: CursorPosition) => {
    // 实际项目中通过WebSocket发送
    console.log('Broadcasting cursor position:', position)
  }

  // 解决冲突 - 保留本地
  const resolveConflictKeepLocal = () => {
    if (!currentConflict) return
    
    setConflicts(prev => prev.map(c => 
      c.id === currentConflict.id 
        ? { ...c, status: 'resolved' as const, resolvedContent: content }
        : c
    ))
    setShowConflictModal(false)
    setCurrentConflict(null)
    message.success('已保留本地更改')
  }

  // 解决冲突 - 接受远程
  const resolveConflictAcceptRemote = () => {
    if (!currentConflict) return
    
    // 应用远程更改
    const remoteOp = currentConflict.remoteOperation
    let newContent = content
    if (remoteOp.type === 'insert' && remoteOp.content) {
      newContent = content.slice(0, remoteOp.position) + remoteOp.content + content.slice(remoteOp.position)
    }
    
    setContent(newContent)
    onChange?.(newContent)
    
    setConflicts(prev => prev.map(c => 
      c.id === currentConflict.id 
        ? { ...c, status: 'resolved' as const, resolvedContent: newContent }
        : c
    ))
    setShowConflictModal(false)
    setCurrentConflict(null)
    message.success('已接受远程更改')
  }

  // 解决冲突 - 合并
  const resolveConflictMerge = () => {
    if (!currentConflict) return
    
    // 简单合并策略：本地在前，远程在后
    const remoteOp = currentConflict.remoteOperation
    let newContent = content
    if (remoteOp.type === 'insert' && remoteOp.content) {
      newContent = content + '\n' + remoteOp.content
    }
    
    setContent(newContent)
    onChange?.(newContent)
    
    setConflicts(prev => prev.map(c => 
      c.id === currentConflict.id 
        ? { ...c, status: 'resolved' as const, resolvedContent: newContent }
        : c
    ))
    setShowConflictModal(false)
    setCurrentConflict(null)
    message.success('已合并更改')
  }

  // 渲染协作者光标
  const renderCollaboratorCursors = () => {
    return collaborators
      .filter(c => c.isOnline && c.cursorPosition && c.userId !== userId)
      .map(collaborator => {
        const { cursorPosition: pos } = collaborator
        if (!pos) return null

        // 计算光标在文本区域中的位置
        const lines = content.split('\n')
        let top = (pos.line - 1) * 22 // 假设行高22px
        let left = pos.column * 8 // 假设字符宽度8px

        return (
          <div
            key={collaborator.id}
            className={styles.remoteCursor}
            style={{
              top: `${top}px`,
              left: `${left + 50}px`, // 加上行号宽度
              borderColor: collaborator.color
            }}
          >
            <div 
              className={styles.cursorFlag}
              style={{ backgroundColor: collaborator.color }}
            >
              {collaborator.userName}
            </div>
            <div 
              className={styles.cursorLine}
              style={{ backgroundColor: collaborator.color }}
            />
          </div>
        )
      })
  }

  // 渲染在线状态指示器
  const renderOnlineStatus = () => {
    const onlineCount = collaborators.filter(c => c.isOnline).length

    return (
      <div className={styles.onlineStatus}>
        <Space>
          {isConnected ? (
            <Badge status="success" text="已连接" />
          ) : (
            <Badge status="error" text="已断开" />
          )}
          <Tooltip title="在线协作者">
            <Tag icon={<TeamOutlined />} color="blue">
              {onlineCount} 人在线
            </Tag>
          </Tooltip>
          {isSyncing && (
            <Tag icon={<SyncOutlined spin />} color="processing">
              同步中...
            </Tag>
          )}
          {pendingOperations.length > 0 && (
            <Tag color="warning">
              {pendingOperations.length} 个待同步
            </Tag>
          )}
        </Space>
      </div>
    )
  }

  // 渲染协作者列表
  const renderCollaboratorList = () => {
    return (
      <div className={styles.collaboratorList}>
        <Avatar.Group maxCount={5} maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>
          {collaborators.map(collaborator => (
            <Tooltip 
              key={collaborator.id}
              title={
                <div>
                  <div>{collaborator.userName}</div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>
                    {collaborator.isOnline ? '在线' : `离线于 ${new Date(collaborator.lastActiveAt).toLocaleString()}`}
                  </div>
                </div>
              }
            >
              <Badge
                dot
                status={collaborator.isOnline ? 'success' : 'default'}
                offset={[-4, 4]}
              >
                <Avatar
                  style={{ 
                    backgroundColor: collaborator.color,
                    border: collaborator.userId === userId ? '2px solid #fff' : 'none',
                    boxShadow: collaborator.userId === userId ? '0 0 0 2px #1890ff' : 'none'
                  }}
                  icon={<UserOutlined />}
                >
                  {collaborator.userName.charAt(0)}
                </Avatar>
              </Badge>
            </Tooltip>
          ))}
        </Avatar.Group>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* 顶部工具栏 */}
      <div className={styles.toolbar}>
        {renderOnlineStatus()}
        {renderCollaboratorList()}
      </div>

      {/* 冲突提示 */}
      {conflicts.filter(c => c.status === 'pending').length > 0 && (
        <Alert
          message={`有 ${conflicts.filter(c => c.status === 'pending').length} 个编辑冲突需要解决`}
          type="warning"
          showIcon
          action={
            <Button size="small" onClick={() => {
              const pending = conflicts.find(c => c.status === 'pending')
              if (pending) {
                setCurrentConflict(pending)
                setShowConflictModal(true)
              }
            }}>
              解决冲突
            </Button>
          }
          className={styles.conflictAlert}
        />
      )}

      {/* 编辑器区域 */}
      <div className={styles.editorWrapper}>
        {/* 行号 */}
        <div className={styles.lineNumbers}>
          {content.split('\n').map((_, index) => (
            <div key={index} className={styles.lineNumber}>
              {index + 1}
            </div>
          ))}
        </div>

        {/* 编辑区域 */}
        <div className={styles.editorArea}>
          {/* 远程光标 */}
          {renderCollaboratorCursors()}
          
          {/* 文本输入 */}
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            value={content}
            onChange={handleContentChange}
            onSelect={handleCursorChange}
            onClick={handleCursorChange}
            onKeyUp={handleCursorChange}
            readOnly={readOnly}
            spellCheck={false}
          />
        </div>
      </div>

      {/* 状态栏 */}
      <div className={styles.statusBar}>
        <Space split={<span className={styles.separator}>|</span>}>
          <span>行 {cursorPosition.line}, 列 {cursorPosition.column}</span>
          <span>字符 {content.length}</span>
          <span>版本 {localVersion}</span>
          {isConnected ? (
            <span><WifiOutlined /> 已连接</span>
          ) : (
            <span><DisconnectOutlined /> 已断开</span>
          )}
        </Space>
      </div>

      {/* 冲突解决弹窗 */}
      <Modal
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: '#faad14' }} />
            编辑冲突
          </Space>
        }
        open={showConflictModal}
        onCancel={() => setShowConflictModal(false)}
        footer={null}
        width={700}
      >
        {currentConflict && (
          <div className={styles.conflictModal}>
            <Alert
              message="检测到编辑冲突"
              description="您和其他协作者同时编辑了相同的位置，请选择如何解决冲突。"
              type="warning"
              showIcon
              className={styles.conflictInfo}
            />

            <div className={styles.conflictComparison}>
              <div className={styles.conflictVersion}>
                <h4>您的更改</h4>
                <div className={styles.conflictContent}>
                  <Tag color="blue">本地版本</Tag>
                  <pre>{currentConflict.localOperation.content || '(删除操作)'}</pre>
                </div>
              </div>
              <div className={styles.conflictVersion}>
                <h4>远程更改</h4>
                <div className={styles.conflictContent}>
                  <Tag color="orange">远程版本</Tag>
                  <pre>{currentConflict.remoteOperation.content || '(删除操作)'}</pre>
                </div>
              </div>
            </div>

            <div className={styles.conflictActions}>
              <Space>
                <Button 
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={resolveConflictKeepLocal}
                >
                  保留我的更改
                </Button>
                <Button 
                  icon={<SyncOutlined />}
                  onClick={resolveConflictAcceptRemote}
                >
                  接受远程更改
                </Button>
                <Button 
                  icon={<TeamOutlined />}
                  onClick={resolveConflictMerge}
                >
                  合并两者
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default CollaborativeEditor