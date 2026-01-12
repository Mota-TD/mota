import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Button,
  Input,
  Progress,
  Tag,
  Avatar,
  Space,
  Dropdown,
  Modal,
  Form,
  Select,
  DatePicker,
  Slider,
  message,
  Spin,
  Empty,
  Tooltip,
  Collapse
} from 'antd';
import {
  PlusOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  CaretRightOutlined,
  HolderOutlined,
  SubnodeOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  Subtask,
  SubtaskProgressSummary,
  SubtaskStatusLabels,
  SubtaskStatusColors,
  SubtaskPriorityLabels,
  SubtaskPriorityColors,
  getSubtaskTreeByParentTaskId,
  getSubtaskProgressSummary,
  createSubtask,
  createChildSubtask,
  updateSubtask,
  deleteSubtask,
  updateSubtaskStatus,
  completeSubtask
} from '@/services/api/subtask';
import styles from './index.module.css';

const { TextArea } = Input;
const { Panel } = Collapse;

interface SubtaskListProps {
  taskId: number;
  projectId?: number;
  editable?: boolean;
  onProgressChange?: (progress: number) => void;
}

/**
 * 子任务列表组件
 * 支持多级子任务结构
 */
const SubtaskList: React.FC<SubtaskListProps> = ({
  taskId,
  projectId,
  editable = true,
  onProgressChange
}) => {
  const [loading, setLoading] = useState(false);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [summary, setSummary] = useState<SubtaskProgressSummary | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState<Subtask | null>(null);
  const [parentSubtaskId, setParentSubtaskId] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  // 加载子任务数据
  const loadData = useCallback(async () => {
    if (!taskId) return;
    
    setLoading(true);
    try {
      const [treeData, summaryData] = await Promise.all([
        getSubtaskTreeByParentTaskId(taskId),
        getSubtaskProgressSummary(taskId)
      ]);
      setSubtasks(treeData || []);
      setSummary(summaryData);
      
      if (summaryData && onProgressChange) {
        onProgressChange(summaryData.averageProgress);
      }
    } catch (error) {
      console.error('Failed to load subtasks:', error);
      // 使用模拟数据
      setSubtasks([
        {
          id: 1,
          parentTaskId: taskId,
          name: '需求分析',
          status: 'completed',
          priority: 'high',
          progress: 100,
          level: 0,
          children: [
            {
              id: 4,
              parentTaskId: taskId,
              parentSubtaskId: 1,
              name: '用户调研',
              status: 'completed',
              priority: 'medium',
              progress: 100,
              level: 1
            },
            {
              id: 5,
              parentTaskId: taskId,
              parentSubtaskId: 1,
              name: '竞品分析',
              status: 'completed',
              priority: 'medium',
              progress: 100,
              level: 1
            }
          ],
          childrenCount: 2,
          completedChildrenCount: 2
        },
        {
          id: 2,
          parentTaskId: taskId,
          name: '设计方案',
          status: 'in_progress',
          priority: 'high',
          progress: 60,
          level: 0,
          children: [
            {
              id: 6,
              parentTaskId: taskId,
              parentSubtaskId: 2,
              name: 'UI设计',
              status: 'in_progress',
              priority: 'high',
              progress: 70,
              level: 1
            },
            {
              id: 7,
              parentTaskId: taskId,
              parentSubtaskId: 2,
              name: '交互设计',
              status: 'pending',
              priority: 'medium',
              progress: 0,
              level: 1
            }
          ],
          childrenCount: 2,
          completedChildrenCount: 0
        },
        {
          id: 3,
          parentTaskId: taskId,
          name: '开发实现',
          status: 'pending',
          priority: 'medium',
          progress: 0,
          level: 0
        }
      ]);
      setSummary({
        total: 7,
        completed: 3,
        inProgress: 2,
        pending: 2,
        averageProgress: 47,
        completionRate: 43
      });
    } finally {
      setLoading(false);
    }
  }, [taskId, onProgressChange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 打开创建/编辑弹窗
  const openModal = (subtask?: Subtask, parentId?: number) => {
    setEditingSubtask(subtask || null);
    setParentSubtaskId(parentId || null);
    
    if (subtask) {
      form.setFieldsValue({
        name: subtask.name,
        description: subtask.description,
        priority: subtask.priority || 'medium',
        startDate: subtask.startDate ? dayjs(subtask.startDate) : null,
        endDate: subtask.endDate ? dayjs(subtask.endDate) : null,
        progress: subtask.progress || 0
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        priority: 'medium',
        progress: 0
      });
    }
    
    setModalVisible(true);
  };

  // 保存子任务
  const handleSave = async (values: any) => {
    try {
      const data: Subtask = {
        parentTaskId: taskId,
        projectId,
        name: values.name,
        description: values.description,
        priority: values.priority,
        startDate: values.startDate?.format('YYYY-MM-DD'),
        endDate: values.endDate?.format('YYYY-MM-DD'),
        progress: values.progress
      };

      if (editingSubtask) {
        await updateSubtask(editingSubtask.id!, data);
        message.success('子任务更新成功');
      } else if (parentSubtaskId) {
        await createChildSubtask(parentSubtaskId, data);
        message.success('子子任务创建成功');
      } else {
        await createSubtask(data);
        message.success('子任务创建成功');
      }

      setModalVisible(false);
      loadData();
    } catch (error) {
      console.error('Save subtask error:', error);
      message.error('保存失败，请重试');
    }
  };

  // 删除子任务
  const handleDelete = (subtask: Subtask) => {
    Modal.confirm({
      title: '确认删除',
      content: subtask.childrenCount && subtask.childrenCount > 0
        ? `删除后将同时删除 ${subtask.childrenCount} 个子子任务，确认删除吗？`
        : '确认删除此子任务吗？',
      okText: '确认',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteSubtask(subtask.id!);
          message.success('删除成功');
          loadData();
        } catch (error) {
          message.error('删除失败');
        }
      }
    });
  };

  // 切换完成状态
  const handleToggleComplete = async (subtask: Subtask) => {
    try {
      if (subtask.status === 'completed') {
        await updateSubtaskStatus(subtask.id!, 'pending');
      } else {
        await completeSubtask(subtask.id!);
      }
      loadData();
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 渲染子任务项
  const renderSubtaskItem = (subtask: Subtask, level: number = 0) => {
    const hasChildren = subtask.children && subtask.children.length > 0;
    const isCompleted = subtask.status === 'completed';
    const key = `subtask-${subtask.id}`;

    const itemContent = (
      <div 
        className={`${styles.subtaskItem} ${isCompleted ? styles.completed : ''}`}
        style={{ marginLeft: level * 24 }}
      >
        <div className={styles.subtaskMain}>
          <div className={styles.subtaskLeft}>
            {editable && (
              <span className={styles.dragHandle}>
                <HolderOutlined />
              </span>
            )}
            <span 
              className={styles.checkbox}
              onClick={() => handleToggleComplete(subtask)}
            >
              {isCompleted ? (
                <CheckCircleOutlined className={styles.checkedIcon} />
              ) : (
                <span className={styles.uncheckedIcon} />
              )}
            </span>
            <span className={`${styles.subtaskName} ${isCompleted ? styles.completedText : ''}`}>
              {subtask.name}
            </span>
            {subtask.childrenCount !== undefined && subtask.childrenCount > 0 && (
              <Tag className={styles.childrenTag}>
                {subtask.completedChildrenCount}/{subtask.childrenCount}
              </Tag>
            )}
          </div>
          <div className={styles.subtaskRight}>
            <Tag color={SubtaskPriorityColors[subtask.priority || 'medium']}>
              {SubtaskPriorityLabels[subtask.priority || 'medium']}
            </Tag>
            <Tag color={SubtaskStatusColors[subtask.status || 'pending']}>
              {SubtaskStatusLabels[subtask.status || 'pending']}
            </Tag>
            {subtask.progress !== undefined && subtask.progress > 0 && subtask.progress < 100 && (
              <Progress 
                percent={subtask.progress} 
                size="small" 
                style={{ width: 80 }}
                showInfo={false}
              />
            )}
            {subtask.assigneeId && (
              <Tooltip title={subtask.assigneeName}>
                <Avatar size="small" src={subtask.assigneeAvatar}>
                  {subtask.assigneeName?.charAt(0) || <UserOutlined />}
                </Avatar>
              </Tooltip>
            )}
            {editable && (
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'addChild',
                      icon: <SubnodeOutlined />,
                      label: '添加子任务',
                      onClick: () => openModal(undefined, subtask.id)
                    },
                    {
                      key: 'edit',
                      icon: <EditOutlined />,
                      label: '编辑',
                      onClick: () => openModal(subtask)
                    },
                    { type: 'divider' },
                    {
                      key: 'delete',
                      icon: <DeleteOutlined />,
                      label: '删除',
                      danger: true,
                      onClick: () => handleDelete(subtask)
                    }
                  ]
                }}
                trigger={['click']}
              >
                <Button type="text" size="small" icon={<MoreOutlined />} />
              </Dropdown>
            )}
          </div>
        </div>
      </div>
    );

    if (hasChildren) {
      return (
        <div key={key} className={styles.subtaskGroup}>
          {itemContent}
          <div className={styles.childrenContainer}>
            {subtask.children!.map(child => renderSubtaskItem(child, level + 1))}
          </div>
        </div>
      );
    }

    return <div key={key}>{itemContent}</div>;
  };

  return (
    <div className={styles.container}>
      {/* 进度汇总 */}
      {summary && summary.total > 0 && (
        <div className={styles.summary}>
          <div className={styles.summaryProgress}>
            <Progress
              percent={summary.completionRate}
              size="small"
              format={() => `${summary.completed}/${summary.total}`}
            />
          </div>
          <div className={styles.summaryStats}>
            <span className={styles.statItem}>
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              已完成 {summary.completed}
            </span>
            <span className={styles.statItem}>
              <ClockCircleOutlined style={{ color: '#1890ff' }} />
              进行中 {summary.inProgress}
            </span>
            <span className={styles.statItem}>
              待处理 {summary.pending}
            </span>
          </div>
        </div>
      )}

      {/* 子任务列表 */}
      <div className={styles.list}>
        {loading ? (
          <div className={styles.loading}>
            <Spin />
          </div>
        ) : subtasks.length === 0 ? (
          <Empty 
            description="暂无子任务" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          subtasks.map(subtask => renderSubtaskItem(subtask))
        )}
      </div>

      {/* 添加按钮 */}
      {editable && (
        <Button
          type="dashed"
          block
          icon={<PlusOutlined />}
          onClick={() => openModal()}
          className={styles.addButton}
        >
          添加子任务
        </Button>
      )}

      {/* 创建/编辑弹窗 */}
      <Modal
        title={
          editingSubtask 
            ? '编辑子任务' 
            : parentSubtaskId 
              ? '添加子子任务' 
              : '添加子任务'
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            name="name"
            label="任务名称"
            rules={[{ required: true, message: '请输入任务名称' }]}
          >
            <Input placeholder="请输入子任务名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="任务描述"
          >
            <TextArea rows={3} placeholder="请输入任务描述（可选）" />
          </Form.Item>

          <Form.Item
            name="priority"
            label="优先级"
          >
            <Select>
              <Select.Option value="low">低</Select.Option>
              <Select.Option value="medium">中</Select.Option>
              <Select.Option value="high">高</Select.Option>
              <Select.Option value="urgent">紧急</Select.Option>
            </Select>
          </Form.Item>

          <Space style={{ width: '100%' }} size="middle">
            <Form.Item
              name="startDate"
              label="开始日期"
              style={{ flex: 1 }}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="endDate"
              label="截止日期"
              style={{ flex: 1 }}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Space>

          {editingSubtask && (
            <Form.Item
              name="progress"
              label="完成进度"
            >
              <Slider
                marks={{
                  0: '0%',
                  25: '25%',
                  50: '50%',
                  75: '75%',
                  100: '100%'
                }}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default SubtaskList;