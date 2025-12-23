import { useState } from 'react'
import { Button, Dropdown, Space, Modal, message, Select, Tag } from 'antd'
import type { MenuProps } from 'antd'
import {
  DeleteOutlined,
  EditOutlined,
  ExportOutlined,
  UserOutlined,
  TagOutlined,
  FolderOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons'
import styles from './index.module.css'

export interface BatchActionsProps {
  selectedCount: number
  selectedKeys: React.Key[]
  onClearSelection: () => void
  onBatchDelete?: () => Promise<void>
  onBatchUpdateStatus?: (status: string) => Promise<void>
  onBatchAssign?: (userId: string) => Promise<void>
  onBatchMove?: (targetId: string) => Promise<void>
  onBatchExport?: () => void
  statusOptions?: { value: string; label: string; color?: string }[]
  assigneeOptions?: { value: string; label: string }[]
  moveOptions?: { value: string; label: string }[]
  entityName?: string
}

/**
 * 批量操作组件
 * 支持批量删除、修改状态、分配负责人、移动到项目/迭代、导出等操作
 */
const BatchActions: React.FC<BatchActionsProps> = ({
  selectedCount,
  selectedKeys,
  onClearSelection,
  onBatchDelete,
  onBatchUpdateStatus,
  onBatchAssign,
  onBatchMove,
  onBatchExport,
  statusOptions = [],
  assigneeOptions = [],
  moveOptions = [],
  entityName = '项'
}) => {
  const [loading, setLoading] = useState(false)
  const [statusModalVisible, setStatusModalVisible] = useState(false)
  const [assignModalVisible, setAssignModalVisible] = useState(false)
  const [moveModalVisible, setMoveModalVisible] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [selectedAssignee, setSelectedAssignee] = useState<string>('')
  const [selectedTarget, setSelectedTarget] = useState<string>('')

  // 批量删除
  const handleBatchDelete = () => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedCount} ${entityName}吗？此操作不可恢复。`,
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        if (onBatchDelete) {
          setLoading(true)
          try {
            await onBatchDelete()
            message.success(`成功删除 ${selectedCount} ${entityName}`)
            onClearSelection()
          } catch {
            message.error('删除失败，请重试')
          } finally {
            setLoading(false)
          }
        }
      }
    })
  }

  // 批量修改状态
  const handleBatchUpdateStatus = async () => {
    if (!selectedStatus) {
      message.warning('请选择状态')
      return
    }
    if (onBatchUpdateStatus) {
      setLoading(true)
      try {
        await onBatchUpdateStatus(selectedStatus)
        message.success(`成功更新 ${selectedCount} ${entityName}的状态`)
        setStatusModalVisible(false)
        setSelectedStatus('')
        onClearSelection()
      } catch {
        message.error('更新失败，请重试')
      } finally {
        setLoading(false)
      }
    }
  }

  // 批量分配
  const handleBatchAssign = async () => {
    if (!selectedAssignee) {
      message.warning('请选择负责人')
      return
    }
    if (onBatchAssign) {
      setLoading(true)
      try {
        await onBatchAssign(selectedAssignee)
        message.success(`成功分配 ${selectedCount} ${entityName}`)
        setAssignModalVisible(false)
        setSelectedAssignee('')
        onClearSelection()
      } catch {
        message.error('分配失败，请重试')
      } finally {
        setLoading(false)
      }
    }
  }

  // 批量移动
  const handleBatchMove = async () => {
    if (!selectedTarget) {
      message.warning('请选择目标')
      return
    }
    if (onBatchMove) {
      setLoading(true)
      try {
        await onBatchMove(selectedTarget)
        message.success(`成功移动 ${selectedCount} ${entityName}`)
        setMoveModalVisible(false)
        setSelectedTarget('')
        onClearSelection()
      } catch {
        message.error('移动失败，请重试')
      } finally {
        setLoading(false)
      }
    }
  }

  // 更多操作菜单
  const moreMenuItems: MenuProps['items'] = [
    ...(onBatchUpdateStatus && statusOptions.length > 0 ? [{
      key: 'status',
      icon: <TagOutlined />,
      label: '修改状态',
      onClick: () => setStatusModalVisible(true)
    }] : []),
    ...(onBatchAssign && assigneeOptions.length > 0 ? [{
      key: 'assign',
      icon: <UserOutlined />,
      label: '分配负责人',
      onClick: () => setAssignModalVisible(true)
    }] : []),
    ...(onBatchMove && moveOptions.length > 0 ? [{
      key: 'move',
      icon: <FolderOutlined />,
      label: '移动到',
      onClick: () => setMoveModalVisible(true)
    }] : []),
    ...(onBatchExport ? [{
      key: 'export',
      icon: <ExportOutlined />,
      label: '导出选中',
      onClick: onBatchExport
    }] : []),
  ]

  if (selectedCount === 0) {
    return null
  }

  return (
    <>
      <div className={styles.batchBar}>
        <div className={styles.batchInfo}>
          <CheckCircleOutlined className={styles.checkIcon} />
          <span>已选择 <strong>{selectedCount}</strong> {entityName}</span>
          <Button type="link" size="small" onClick={onClearSelection}>
            取消选择
          </Button>
        </div>
        <Space>
          {onBatchDelete && (
            <Button 
              danger 
              icon={<DeleteOutlined />}
              onClick={handleBatchDelete}
              loading={loading}
            >
              批量删除
            </Button>
          )}
          {moreMenuItems.length > 0 && (
            <Dropdown menu={{ items: moreMenuItems }} placement="bottomRight">
              <Button icon={<EditOutlined />}>
                更多操作
              </Button>
            </Dropdown>
          )}
        </Space>
      </div>

      {/* 修改状态弹窗 */}
      <Modal
        title="批量修改状态"
        open={statusModalVisible}
        onOk={handleBatchUpdateStatus}
        onCancel={() => {
          setStatusModalVisible(false)
          setSelectedStatus('')
        }}
        confirmLoading={loading}
      >
        <p>将选中的 {selectedCount} {entityName}状态修改为：</p>
        <Select
          style={{ width: '100%' }}
          placeholder="请选择状态"
          value={selectedStatus || undefined}
          onChange={setSelectedStatus}
        >
          {statusOptions.map(opt => (
            <Select.Option key={opt.value} value={opt.value}>
              {opt.color ? <Tag color={opt.color}>{opt.label}</Tag> : opt.label}
            </Select.Option>
          ))}
        </Select>
      </Modal>

      {/* 分配负责人弹窗 */}
      <Modal
        title="批量分配负责人"
        open={assignModalVisible}
        onOk={handleBatchAssign}
        onCancel={() => {
          setAssignModalVisible(false)
          setSelectedAssignee('')
        }}
        confirmLoading={loading}
      >
        <p>将选中的 {selectedCount} {entityName}分配给：</p>
        <Select
          style={{ width: '100%' }}
          placeholder="请选择负责人"
          value={selectedAssignee || undefined}
          onChange={setSelectedAssignee}
          showSearch
          optionFilterProp="label"
          options={assigneeOptions}
        />
      </Modal>

      {/* 移动弹窗 */}
      <Modal
        title="批量移动"
        open={moveModalVisible}
        onOk={handleBatchMove}
        onCancel={() => {
          setMoveModalVisible(false)
          setSelectedTarget('')
        }}
        confirmLoading={loading}
      >
        <p>将选中的 {selectedCount} {entityName}移动到：</p>
        <Select
          style={{ width: '100%' }}
          placeholder="请选择目标"
          value={selectedTarget || undefined}
          onChange={setSelectedTarget}
          showSearch
          optionFilterProp="label"
          options={moveOptions}
        />
      </Modal>
    </>
  )
}

export default BatchActions