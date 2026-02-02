import { DownloadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Row,
  Statistic,
  Tag,
} from 'antd';
import React, { useRef, useState } from 'react';

interface OperationLog {
  id: number;
  operator: string;
  operatorId: number;
  module: string;
  action: string;
  description: string;
  ip: string;
  userAgent: string;
  status: 'success' | 'failed';
  duration: number;
  requestData: string;
  responseData: string;
  createdAt: string;
}

const OperationLog: React.FC = () => {
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentLog, setCurrentLog] = useState<OperationLog | null>(null);
  const actionRef = useRef<ActionType>(null);

  const mockData: OperationLog[] = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    operator: ['admin', 'operator1', 'support2', 'analyst1'][i % 4],
    operatorId: Math.floor(i / 4) + 1,
    module: ['用户管理', '租户管理', '系统配置', 'AI管理', '内容管理'][i % 5],
    action: ['创建', '编辑', '删除', '查看', '导出'][i % 5],
    description: `${['用户', '租户', '配置', '模型', '新闻'][i % 5]}${['创建', '编辑', '删除', '查看', '导出'][i % 5]}操作`,
    ip: `192.168.1.${(i % 254) + 1}`,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    status: i % 10 === 0 ? 'failed' : 'success',
    duration: Math.floor(Math.random() * 1000) + 100,
    requestData: JSON.stringify({ id: i + 1 }),
    responseData: JSON.stringify({ success: true }),
    createdAt: new Date(Date.now() - i * 3600000).toISOString(),
  }));

  const handleViewDetail = (record: OperationLog) => {
    setCurrentLog(record);
    setDetailVisible(true);
  };

  const handleExport = () => {
    console.log('导出日志');
  };

  const columns: ProColumns<OperationLog>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      search: false,
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      width: 120,
    },
    {
      title: '模块',
      dataIndex: 'module',
      width: 120,
      valueType: 'select',
      valueEnum: {
        用户管理: { text: '用户管理' },
        租户管理: { text: '租户管理' },
        系统配置: { text: '系统配置' },
        AI管理: { text: 'AI管理' },
        内容管理: { text: '内容管理' },
      },
      render: (_, record) => <Tag color="blue">{record.module}</Tag>,
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 100,
      valueType: 'select',
      valueEnum: {
        创建: { text: '创建' },
        编辑: { text: '编辑' },
        删除: { text: '删除' },
        查看: { text: '查看' },
        导出: { text: '导出' },
      },
      render: (_, record) => <Tag>{record.action}</Tag>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      search: false,
      ellipsis: true,
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      width: 140,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        success: { text: '成功', status: 'Success' },
        failed: { text: '失败', status: 'Error' },
      },
    },
    {
      title: '耗时',
      dataIndex: 'duration',
      width: 100,
      search: false,
      render: (text) => `${text}ms`,
    },
    {
      title: '操作时间',
      dataIndex: 'createdAt',
      width: 180,
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 100,
      fixed: 'right',
      render: (_, record) => [
        <a key="detail" onClick={() => handleViewDetail(record)}>
          详情
        </a>,
      ],
    },
  ];

  return (
    <PageContainer>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="今日操作" value={1234} suffix="次" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="成功率"
              value={99.8}
              suffix="%"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="失败操作"
              value={12}
              suffix="次"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="平均耗时" value={245} suffix="ms" />
          </Card>
        </Col>
      </Row>

      <ProTable<OperationLog>
        columns={columns}
        dataSource={mockData}
        actionRef={actionRef}
        rowKey="id"
        pagination={{
          defaultPageSize: 20,
          showSizeChanger: true,
        }}
        search={{
          labelWidth: 'auto',
        }}
        dateFormatter="string"
        scroll={{ x: 1400 }}
        toolBarRender={() => [
          <Button
            key="export"
            icon={<DownloadOutlined />}
            onClick={handleExport}
          >
            导出日志
          </Button>,
        ]}
      />

      <Drawer
        title="操作日志详情"
        width={720}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
      >
        {currentLog && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="日志ID" span={2}>
              {currentLog.id}
            </Descriptions.Item>
            <Descriptions.Item label="操作人">
              {currentLog.operator}
            </Descriptions.Item>
            <Descriptions.Item label="用户ID">
              {currentLog.operatorId}
            </Descriptions.Item>
            <Descriptions.Item label="模块">
              {currentLog.module}
            </Descriptions.Item>
            <Descriptions.Item label="操作">
              {currentLog.action}
            </Descriptions.Item>
            <Descriptions.Item label="描述" span={2}>
              {currentLog.description}
            </Descriptions.Item>
            <Descriptions.Item label="IP地址">
              {currentLog.ip}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag
                color={currentLog.status === 'success' ? 'success' : 'error'}
              >
                {currentLog.status === 'success' ? '成功' : '失败'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="耗时">
              {currentLog.duration}ms
            </Descriptions.Item>
            <Descriptions.Item label="操作时间">
              {currentLog.createdAt}
            </Descriptions.Item>
            <Descriptions.Item label="User Agent" span={2}>
              {currentLog.userAgent}
            </Descriptions.Item>
            <Descriptions.Item label="请求数据" span={2}>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(JSON.parse(currentLog.requestData), null, 2)}
              </pre>
            </Descriptions.Item>
            <Descriptions.Item label="响应数据" span={2}>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(JSON.parse(currentLog.responseData), null, 2)}
              </pre>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </PageContainer>
  );
};

export default OperationLog;
