import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  ColorPicker,
  Switch,
  Space,
  Table,
  Tag,
  Popconfirm,
  message,
  Tooltip,
  Empty,
  Spin,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
  PlayCircleOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import type { Color } from 'antd/es/color-picker';
import {
  WorkflowTemplate,
  WorkflowStatus,
  WorkflowTransition,
  getWorkflowWithDetails,
  getSystemWorkflows,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  addStatus,
  updateStatus,
  deleteStatus,
  addTransition,
  deleteTransition,
  duplicateWorkflow,
  STATUS_COLORS,
  getStatusTypeLabel,
} from '@/services/api/workflow';
import styles from './index.module.css';

interface WorkflowEditorProps {
  projectId?: number;
  onWorkflowChange?: (workflow: WorkflowTemplate) => void;
}

const WorkflowEditor: React.FC<WorkflowEditorProps> = ({
  projectId,
  onWorkflowChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowTemplate | null>(null);
  const [workflowModalVisible, setWorkflowModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [transitionModalVisible, setTransitionModalVisible] = useState(false);
  const [editingStatus, setEditingStatus] = useState<WorkflowStatus | null>(null);
  const [workflowForm] = Form.useForm();
  const [statusForm] = Form.useForm();
  const [transitionForm] = Form.useForm();

  // 加载工作流列表
  const loadWorkflows = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSystemWorkflows();
      setWorkflows(data);
      if (data.length > 0 && !selectedWorkflow) {
        loadWorkflowDetails(data[0].id);
      }
    } catch (error) {
      console.error('加载工作流失败:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedWorkflow]);

  // 加载工作流详情
  const loadWorkflowDetails = async (workflowId: number) => {
    setLoading(true);
    try {
      const data = await getWorkflowWithDetails(workflowId);
      setSelectedWorkflow(data);
      onWorkflowChange?.(data);
    } catch (error) {
      console.error('加载工作流详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, [loadWorkflows]);

  // 创建/编辑工作流
  const handleWorkflowSubmit = async () => {
    try {
      const values = await workflowForm.validateFields();
      if (selectedWorkflow && !selectedWorkflow.isSystem) {
        await updateWorkflow(selectedWorkflow.id, values);
        message.success('工作流更新成功');
      } else {
        const newWorkflow = await createWorkflow({
          ...values,
          projectId,
        });
        message.success('工作流创建成功');
        setWorkflows([...workflows, newWorkflow]);
        loadWorkflowDetails(newWorkflow.id);
      }
      setWorkflowModalVisible(false);
      workflowForm.resetFields();
      loadWorkflows();
    } catch (error) {
      console.error('保存工作流失败:', error);
    }
  };

  // 删除工作流
  const handleDeleteWorkflow = async (id: number) => {
    try {
      await deleteWorkflow(id);
      message.success('工作流删除成功');
      setSelectedWorkflow(null);
      loadWorkflows();
    } catch (error) {
      console.error('删除工作流失败:', error);
    }
  };

  // 复制工作流
  const handleDuplicateWorkflow = async (id: number) => {
    try {
      const newWorkflow = await duplicateWorkflow(id, undefined, projectId);
      message.success('工作流复制成功');
      setWorkflows([...workflows, newWorkflow]);
      loadWorkflowDetails(newWorkflow.id);
    } catch (error) {
      console.error('复制工作流失败:', error);
    }
  };

  // 添加/编辑状态
  const handleStatusSubmit = async () => {
    if (!selectedWorkflow) return;
    try {
      const values = await statusForm.validateFields();
      const colorValue = typeof values.color === 'string' ? values.color : (values.color as Color).toHexString();
      
      if (editingStatus) {
        await updateStatus(editingStatus.id, {
          ...values,
          color: colorValue,
        });
        message.success('状态更新成功');
      } else {
        await addStatus(selectedWorkflow.id, {
          ...values,
          color: colorValue,
        });
        message.success('状态添加成功');
      }
      setStatusModalVisible(false);
      statusForm.resetFields();
      setEditingStatus(null);
      loadWorkflowDetails(selectedWorkflow.id);
    } catch (error) {
      console.error('保存状态失败:', error);
    }
  };

  // 删除状态
  const handleDeleteStatus = async (statusId: number) => {
    if (!selectedWorkflow) return;
    try {
      await deleteStatus(statusId);
      message.success('状态删除成功');
      loadWorkflowDetails(selectedWorkflow.id);
    } catch (error) {
      console.error('删除状态失败:', error);
    }
  };

  // 添加流转规则
  const handleTransitionSubmit = async () => {
    if (!selectedWorkflow) return;
    try {
      const values = await transitionForm.validateFields();
      await addTransition(selectedWorkflow.id, values);
      message.success('流转规则添加成功');
      setTransitionModalVisible(false);
      transitionForm.resetFields();
      loadWorkflowDetails(selectedWorkflow.id);
    } catch (error) {
      console.error('添加流转规则失败:', error);
    }
  };

  // 删除流转规则
  const handleDeleteTransition = async (transitionId: number) => {
    if (!selectedWorkflow) return;
    try {
      await deleteTransition(transitionId);
      message.success('流转规则删除成功');
      loadWorkflowDetails(selectedWorkflow.id);
    } catch (error) {
      console.error('删除流转规则失败:', error);
    }
  };

  // 打开编辑状态弹窗
  const openEditStatusModal = (status: WorkflowStatus) => {
    setEditingStatus(status);
    statusForm.setFieldsValue({
      name: status.name,
      description: status.description,
      color: status.color,
      statusType: status.statusType,
      isInitial: status.isInitial,
      isFinal: status.isFinal,
    });
    setStatusModalVisible(true);
  };

  // 获取状态类型图标
  const getStatusTypeIcon = (statusType: string) => {
    switch (statusType) {
      case 'todo':
        return <ClockCircleOutlined />;
      case 'in_progress':
        return <PlayCircleOutlined />;
      case 'done':
        return <CheckCircleOutlined />;
      case 'cancelled':
        return <StopOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  // 状态表格列
  const statusColumns = [
    {
      title: '状态名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: WorkflowStatus) => (
        <Space>
          <Tag color={record.color}>{text}</Tag>
          {record.isInitial && <Tag color="blue">初始</Tag>}
          {record.isFinal && <Tag color="green">终态</Tag>}
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'statusType',
      key: 'statusType',
      render: (type: string) => (
        <Space>
          {getStatusTypeIcon(type)}
          {getStatusTypeLabel(type)}
        </Space>
      ),
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 80,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: unknown, record: WorkflowStatus) => (
        <Space>
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEditStatusModal(record)}
              disabled={selectedWorkflow?.isSystem}
            />
          </Tooltip>
          <Popconfirm
            title="确定删除此状态吗？"
            description="删除后相关的流转规则也会被删除"
            onConfirm={() => handleDeleteStatus(record.id)}
            disabled={selectedWorkflow?.isSystem}
          >
            <Tooltip title="删除">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                disabled={selectedWorkflow?.isSystem}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 流转规则表格列
  const transitionColumns = [
    {
      title: '流转规则',
      key: 'transition',
      render: (_: unknown, record: WorkflowTransition) => (
        <Space>
          <Tag color={record.fromStatus?.color}>{record.fromStatus?.name}</Tag>
          <ArrowRightOutlined />
          <Tag color={record.toStatus?.color}>{record.toStatus?.name}</Tag>
        </Space>
      ),
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: unknown, record: WorkflowTransition) => (
        <Popconfirm
          title="确定删除此流转规则吗？"
          onConfirm={() => handleDeleteTransition(record.id)}
          disabled={selectedWorkflow?.isSystem}
        >
          <Tooltip title="删除">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              disabled={selectedWorkflow?.isSystem}
            />
          </Tooltip>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <Spin spinning={loading}>
        <div className={styles.header}>
          <Space>
            <Select
              style={{ width: 200 }}
              placeholder="选择工作流"
              value={selectedWorkflow?.id}
              onChange={(value) => loadWorkflowDetails(value)}
              options={workflows.map((w) => ({
                label: (
                  <Space>
                    {w.name}
                    {w.isSystem && <Tag color="blue">系统</Tag>}
                    {w.isDefault && <Tag color="green">默认</Tag>}
                  </Space>
                ),
                value: w.id,
              }))}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                workflowForm.resetFields();
                setWorkflowModalVisible(true);
              }}
            >
              新建工作流
            </Button>
          </Space>
          {selectedWorkflow && (
            <Space>
              {selectedWorkflow.isSystem ? (
                <Button
                  icon={<CopyOutlined />}
                  onClick={() => handleDuplicateWorkflow(selectedWorkflow.id)}
                >
                  复制为自定义
                </Button>
              ) : (
                <>
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => {
                      workflowForm.setFieldsValue({
                        name: selectedWorkflow.name,
                        description: selectedWorkflow.description,
                      });
                      setWorkflowModalVisible(true);
                    }}
                  >
                    编辑
                  </Button>
                  <Popconfirm
                    title="确定删除此工作流吗？"
                    onConfirm={() => handleDeleteWorkflow(selectedWorkflow.id)}
                  >
                    <Button danger icon={<DeleteOutlined />}>
                      删除
                    </Button>
                  </Popconfirm>
                </>
              )}
            </Space>
          )}
        </div>

        {selectedWorkflow ? (
          <div className={styles.content}>
            <Card
              title="状态列表"
              size="small"
              extra={
                <Button
                  type="link"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingStatus(null);
                    statusForm.resetFields();
                    statusForm.setFieldsValue({
                      color: STATUS_COLORS[0],
                      statusType: 'todo',
                      isInitial: false,
                      isFinal: false,
                    });
                    setStatusModalVisible(true);
                  }}
                  disabled={selectedWorkflow.isSystem}
                >
                  添加状态
                </Button>
              }
            >
              <Table
                dataSource={selectedWorkflow.statuses || []}
                columns={statusColumns}
                rowKey="id"
                size="small"
                pagination={false}
              />
            </Card>

            <Divider />

            <Card
              title="流转规则"
              size="small"
              extra={
                <Button
                  type="link"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    transitionForm.resetFields();
                    setTransitionModalVisible(true);
                  }}
                  disabled={selectedWorkflow.isSystem}
                >
                  添加规则
                </Button>
              }
            >
              <Table
                dataSource={selectedWorkflow.transitions || []}
                columns={transitionColumns}
                rowKey="id"
                size="small"
                pagination={false}
              />
            </Card>

            {/* 可视化流程图 */}
            <Divider />
            <Card title="流程图" size="small">
              <div className={styles.flowChart}>
                {selectedWorkflow.statuses?.map((status, index) => (
                  <React.Fragment key={status.id}>
                    <div
                      className={styles.statusNode}
                      style={{ borderColor: status.color }}
                    >
                      <Tag color={status.color}>{status.name}</Tag>
                      {status.isInitial && <div className={styles.badge}>起始</div>}
                      {status.isFinal && <div className={styles.badge}>终态</div>}
                    </div>
                    {index < (selectedWorkflow.statuses?.length || 0) - 1 && (
                      <ArrowRightOutlined className={styles.arrow} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </Card>
          </div>
        ) : (
          <Empty description="请选择或创建工作流" />
        )}
      </Spin>

      {/* 工作流编辑弹窗 */}
      <Modal
        title={selectedWorkflow && !selectedWorkflow.isSystem ? '编辑工作流' : '新建工作流'}
        open={workflowModalVisible}
        onOk={handleWorkflowSubmit}
        onCancel={() => setWorkflowModalVisible(false)}
      >
        <Form form={workflowForm} layout="vertical">
          <Form.Item
            name="name"
            label="工作流名称"
            rules={[{ required: true, message: '请输入工作流名称' }]}
          >
            <Input placeholder="请输入工作流名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea placeholder="请输入工作流描述" rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 状态编辑弹窗 */}
      <Modal
        title={editingStatus ? '编辑状态' : '添加状态'}
        open={statusModalVisible}
        onOk={handleStatusSubmit}
        onCancel={() => {
          setStatusModalVisible(false);
          setEditingStatus(null);
        }}
      >
        <Form form={statusForm} layout="vertical">
          <Form.Item
            name="name"
            label="状态名称"
            rules={[{ required: true, message: '请输入状态名称' }]}
          >
            <Input placeholder="请输入状态名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input placeholder="请输入状态描述" />
          </Form.Item>
          <Form.Item
            name="color"
            label="颜色"
            rules={[{ required: true, message: '请选择颜色' }]}
          >
            <ColorPicker presets={[{ label: '预设颜色', colors: STATUS_COLORS }]} />
          </Form.Item>
          <Form.Item
            name="statusType"
            label="状态类型"
            rules={[{ required: true, message: '请选择状态类型' }]}
          >
            <Select
              options={[
                { label: '待办', value: 'todo' },
                { label: '进行中', value: 'in_progress' },
                { label: '已完成', value: 'done' },
                { label: '已取消', value: 'cancelled' },
              ]}
            />
          </Form.Item>
          <Form.Item name="isInitial" label="初始状态" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="isFinal" label="终态" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      {/* 流转规则编辑弹窗 */}
      <Modal
        title="添加流转规则"
        open={transitionModalVisible}
        onOk={handleTransitionSubmit}
        onCancel={() => setTransitionModalVisible(false)}
      >
        <Form form={transitionForm} layout="vertical">
          <Form.Item
            name="fromStatusId"
            label="源状态"
            rules={[{ required: true, message: '请选择源状态' }]}
          >
            <Select
              placeholder="选择源状态"
              options={selectedWorkflow?.statuses?.map((s) => ({
                label: <Tag color={s.color}>{s.name}</Tag>,
                value: s.id,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="toStatusId"
            label="目标状态"
            rules={[{ required: true, message: '请选择目标状态' }]}
          >
            <Select
              placeholder="选择目标状态"
              options={selectedWorkflow?.statuses?.map((s) => ({
                label: <Tag color={s.color}>{s.name}</Tag>,
                value: s.id,
              }))}
            />
          </Form.Item>
          <Form.Item name="name" label="流转名称">
            <Input placeholder="请输入流转名称（可选）" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WorkflowEditor;