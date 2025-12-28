/**
 * AI 任务分解组件
 * 提供 AI 驱动的任务自动分解功能
 */

import React, { useState, useCallback } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Space,
  Table,
  Checkbox,
  Tag,
  Progress,
  Alert,
  Spin,
  Typography,
  Tooltip,
  InputNumber,
  DatePicker,
  Divider,
  Empty,
  message,
} from 'antd';
import {
  RobotOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
  BulbOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTaskDecompose, useDecomposeStats } from '../../hooks/useTaskDecompose';
import type { DecomposeSuggestionWithSelection, TaskDecomposeFormData } from '../../types';
import styles from './index.module.css';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

export interface TaskDecomposeProps {
  projectId: string;
  projectName?: string;
  projectDescription?: string;
  departments?: Array<{ id: string; name: string }>;
  defaultDepartmentId?: string;
  defaultManagerId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * AI 任务分解组件
 */
const TaskDecompose: React.FC<TaskDecomposeProps> = ({
  projectId,
  projectName = '',
  projectDescription = '',
  departments = [],
  defaultDepartmentId,
  defaultManagerId,
  onSuccess,
  onCancel,
}) => {
  const [form] = Form.useForm<TaskDecomposeFormData>();
  const [editingId, setEditingId] = useState<string | null>(null);

  // 使用 AI 任务分解 hook
  const {
    status,
    suggestions,
    selectedSuggestions,
    totalEstimatedDays,
    riskAssessment,
    error,
    generateDecomposition,
    toggleSelection,
    updateSuggestion,
    selectAll,
    deselectAll,
    applySelectedSuggestions,
    clear,
  } = useTaskDecompose({
    projectId,
    defaultDepartmentId,
    defaultManagerId,
    onSuccess,
    onError: (err) => message.error(err),
  });

  // 统计数据
  const stats = useDecomposeStats();

  // 提交表单生成任务分解
  const handleGenerate = useCallback(async () => {
    try {
      const values = await form.validateFields();
      await generateDecomposition(values);
    } catch (err) {
      // 表单验证失败
    }
  }, [form, generateDecomposition]);

  // 应用选中的建议
  const handleApply = useCallback(async () => {
    if (!defaultDepartmentId || !defaultManagerId) {
      message.warning('请先配置默认部门和负责人');
      return;
    }
    await applySelectedSuggestions();
  }, [applySelectedSuggestions, defaultDepartmentId, defaultManagerId]);

  // 编辑建议
  const handleEdit = useCallback((id: string) => {
    setEditingId(id);
  }, []);

  // 保存编辑
  const handleSaveEdit = useCallback(
    (id: string, name: string, estimatedDays: number) => {
      updateSuggestion(id, { name, estimatedDays });
      setEditingId(null);
    },
    [updateSuggestion]
  );

  // 表格列定义
  const columns: ColumnsType<DecomposeSuggestionWithSelection> = [
    {
      title: (
        <Checkbox
          checked={suggestions.length > 0 && selectedSuggestions.length === suggestions.length}
          indeterminate={
            selectedSuggestions.length > 0 && selectedSuggestions.length < suggestions.length
          }
          onChange={(e) => (e.target.checked ? selectAll() : deselectAll())}
        />
      ),
      dataIndex: 'selected',
      width: 50,
      render: (_, record) => (
        <Checkbox
          checked={record.selected}
          onChange={() => toggleSelection(record.id)}
        />
      ),
    },
    {
      title: '任务名称',
      dataIndex: 'name',
      width: 250,
      render: (name, record) => {
        if (editingId === record.id) {
          return (
            <Input
              defaultValue={name}
              size="small"
              onPressEnter={(e) =>
                handleSaveEdit(record.id, (e.target as HTMLInputElement).value, record.estimatedDays)
              }
              onBlur={(e) => handleSaveEdit(record.id, e.target.value, record.estimatedDays)}
              autoFocus
            />
          );
        }
        return (
          <Space>
            <Text>{name}</Text>
            {record.modified && <Tag color="orange">已修改</Tag>}
          </Space>
        );
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
      render: (desc) => (
        <Tooltip title={desc}>
          <Text ellipsis style={{ maxWidth: 200 }}>
            {desc}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: '建议部门',
      dataIndex: 'suggestedDepartment',
      width: 120,
      render: (dept) => dept || '-',
    },
    {
      title: '优先级',
      dataIndex: 'suggestedPriority',
      width: 100,
      render: (priority) => {
        const colorMap: Record<string, string> = {
          low: 'green',
          medium: 'blue',
          high: 'orange',
          urgent: 'red',
        };
        return <Tag color={colorMap[priority] || 'default'}>{priority}</Tag>;
      },
    },
    {
      title: '预估天数',
      dataIndex: 'estimatedDays',
      width: 100,
      render: (days, record) => {
        if (editingId === record.id) {
          return (
            <InputNumber
              defaultValue={days}
              min={1}
              max={365}
              size="small"
              onPressEnter={(e) =>
                handleSaveEdit(record.id, record.name, Number((e.target as HTMLInputElement).value))
              }
            />
          );
        }
        return `${days} 天`;
      },
    },
    {
      title: '依赖',
      dataIndex: 'dependencies',
      width: 100,
      render: (deps: string[] | undefined) =>
        deps && deps.length > 0 ? (
          <Tooltip title={deps.join(', ')}>
            <Tag>{deps.length} 个依赖</Tag>
          </Tooltip>
        ) : (
          '-'
        ),
    },
    {
      title: '操作',
      width: 80,
      render: (_, record) => (
        <Space>
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // 渲染表单
  const renderForm = () => (
    <Card className={styles.formCard}>
      <div className={styles.formHeader}>
        <RobotOutlined className={styles.aiIcon} />
        <Title level={4} style={{ margin: 0 }}>
          AI 智能任务分解
        </Title>
      </div>
      <Paragraph type="secondary">
        输入项目信息，AI 将自动分析并建议任务拆解方案
      </Paragraph>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          projectName,
          projectDescription,
          departments: [],
        }}
      >
        <Form.Item
          name="projectName"
          label="项目名称"
          rules={[{ required: true, message: '请输入项目名称' }]}
        >
          <Input placeholder="请输入项目名称" />
        </Form.Item>

        <Form.Item
          name="projectDescription"
          label="项目描述"
          rules={[
            { required: true, message: '请输入项目描述' },
            { min: 20, message: '项目描述至少需要20个字符' },
          ]}
          extra="详细的项目描述有助于 AI 更准确地分解任务"
        >
          <TextArea
            rows={4}
            placeholder="请详细描述项目目标、范围、主要功能等信息..."
            showCount
            maxLength={2000}
          />
        </Form.Item>

        <Form.Item
          name="departments"
          label="参与部门"
          rules={[{ required: true, message: '请选择至少一个参与部门' }]}
        >
          <Select
            mode="multiple"
            placeholder="请选择参与部门"
            options={departments.map((d) => ({ label: d.name, value: d.id }))}
          />
        </Form.Item>

        <Form.Item label="项目周期" style={{ marginBottom: 0 }}>
          <Space>
            <Form.Item name="startDate" noStyle>
              <DatePicker placeholder="开始日期" />
            </Form.Item>
            <span>至</span>
            <Form.Item name="endDate" noStyle>
              <DatePicker placeholder="结束日期" />
            </Form.Item>
          </Space>
        </Form.Item>

        <Divider />

        <Space>
          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            onClick={handleGenerate}
            loading={status === 'loading'}
          >
            开始分解
          </Button>
          {onCancel && (
            <Button onClick={onCancel}>取消</Button>
          )}
        </Space>
      </Form>
    </Card>
  );

  // 渲染结果
  const renderResult = () => {
    if (status === 'loading') {
      return (
        <Card className={styles.resultCard}>
          <div className={styles.loadingContainer}>
            <Spin size="large" />
            <Text type="secondary" style={{ marginTop: 16 }}>
              AI 正在分析项目并生成任务建议...
            </Text>
          </div>
        </Card>
      );
    }

    if (status === 'error') {
      return (
        <Card className={styles.resultCard}>
          <Alert
            type="error"
            message="任务分解失败"
            description={error}
            showIcon
            action={
              <Button size="small" onClick={handleGenerate}>
                重试
              </Button>
            }
          />
        </Card>
      );
    }

    if (status === 'success' && suggestions.length > 0) {
      return (
        <Card className={styles.resultCard}>
          <div className={styles.resultHeader}>
            <Space>
              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
              <Title level={4} style={{ margin: 0 }}>
                分解结果
              </Title>
            </Space>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={clear}>
                重新分解
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleApply}
                disabled={selectedSuggestions.length === 0}
              >
                创建选中任务 ({selectedSuggestions.length})
              </Button>
            </Space>
          </div>

          {/* 统计信息 */}
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <Text type="secondary">总任务数</Text>
              <Text strong>{stats.total}</Text>
            </div>
            <div className={styles.statItem}>
              <Text type="secondary">已选择</Text>
              <Text strong>{stats.selected}</Text>
            </div>
            <div className={styles.statItem}>
              <Text type="secondary">预估总天数</Text>
              <Text strong>{totalEstimatedDays} 天</Text>
            </div>
            <div className={styles.statItem}>
              <Text type="secondary">选中天数</Text>
              <Text strong>{stats.selectedDays} 天</Text>
            </div>
          </div>

          {/* 风险评估 */}
          {riskAssessment && (
            <Alert
              type="warning"
              icon={<WarningOutlined />}
              message="风险评估"
              description={riskAssessment}
              style={{ marginBottom: 16 }}
            />
          )}

          {/* 任务列表 */}
          <Table
            columns={columns}
            dataSource={suggestions}
            rowKey="id"
            pagination={false}
            size="small"
            scroll={{ y: 400 }}
          />

          {/* AI 提示 */}
          <div className={styles.aiTip}>
            <BulbOutlined style={{ color: '#faad14', marginRight: 8 }} />
            <Text type="secondary">
              提示：您可以编辑任务名称和预估天数，取消选择不需要的任务，然后点击"创建选中任务"按钮批量创建。
            </Text>
          </div>
        </Card>
      );
    }

    return null;
  };

  return (
    <div className={styles.container}>
      {renderForm()}
      {renderResult()}
    </div>
  );
};

export default TaskDecompose;