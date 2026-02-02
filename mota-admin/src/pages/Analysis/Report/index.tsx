import { DownloadOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  ModalForm,
  PageContainer,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { Button, message, Tag } from 'antd';
import React, { useRef, useState } from 'react';

interface Report {
  id: number;
  name: string;
  type: string;
  description: string;
  creator: string;
  status: 'draft' | 'published';
  frequency: string;
  lastGenerated: string;
  createdAt: string;
}

const ReportManagement: React.FC = () => {
  const [createVisible, setCreateVisible] = useState(false);
  const actionRef = useRef<ActionType>(null);

  const mockData: Report[] = [
    {
      id: 1,
      name: '用户增长月报',
      type: '用户分析',
      description: '每月用户增长情况统计报告',
      creator: 'admin',
      status: 'published',
      frequency: '每月',
      lastGenerated: '2024-02-01 09:00:00',
      createdAt: '2024-01-01 10:00:00',
    },
    {
      id: 2,
      name: 'AI使用成本报表',
      type: '成本分析',
      description: 'AI服务使用成本详细分析',
      creator: 'analyst',
      status: 'published',
      frequency: '每周',
      lastGenerated: '2024-02-01 10:00:00',
      createdAt: '2024-01-10 11:00:00',
    },
    {
      id: 3,
      name: '租户活跃度分析',
      type: '租户分析',
      description: '租户活跃度和使用情况分析',
      creator: 'operator',
      status: 'draft',
      frequency: '每日',
      lastGenerated: '2024-02-01 08:00:00',
      createdAt: '2024-01-15 14:00:00',
    },
  ];

  const columns: ProColumns<Report>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
      search: false,
    },
    {
      title: '报表名称',
      dataIndex: 'name',
      width: 200,
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 120,
      valueType: 'select',
      valueEnum: {
        用户分析: { text: '用户分析' },
        成本分析: { text: '成本分析' },
        租户分析: { text: '租户分析' },
        行为分析: { text: '行为分析' },
      },
      render: (_, record) => <Tag color="blue">{record.type}</Tag>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      search: false,
      ellipsis: true,
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        draft: { text: '草稿', status: 'Default' },
        published: { text: '已发布', status: 'Success' },
      },
    },
    {
      title: '生成频率',
      dataIndex: 'frequency',
      width: 100,
      search: false,
    },
    {
      title: '最后生成时间',
      dataIndex: 'lastGenerated',
      width: 160,
      search: false,
      valueType: 'dateTime',
    },
    {
      title: '操作',
      valueType: 'option',
      width: 200,
      fixed: 'right',
      render: () => [
        <a key="view">
          <EyeOutlined /> 查看
        </a>,
        <a key="generate">生成</a>,
        <a key="download">
          <DownloadOutlined /> 下载
        </a>,
        <a key="edit">编辑</a>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<Report>
        columns={columns}
        dataSource={mockData}
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        pagination={{
          defaultPageSize: 10,
        }}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateVisible(true)}
          >
            创建报表
          </Button>,
        ]}
      />

      <ModalForm
        title="创建自定义报表"
        open={createVisible}
        onOpenChange={setCreateVisible}
        onFinish={async (values) => {
          console.log('创建报表:', values);
          message.success('创建成功');
          setCreateVisible(false);
          actionRef.current?.reload();
          return true;
        }}
        width={600}
      >
        <ProFormText
          name="name"
          label="报表名称"
          placeholder="请输入报表名称"
          rules={[{ required: true, message: '请输入报表名称' }]}
        />
        <ProFormSelect
          name="type"
          label="报表类型"
          placeholder="请选择报表类型"
          options={[
            { label: '用户分析', value: '用户分析' },
            { label: '成本分析', value: '成本分析' },
            { label: '租户分析', value: '租户分析' },
            { label: '行为分析', value: '行为分析' },
          ]}
          rules={[{ required: true, message: '请选择报表类型' }]}
        />
        <ProFormSelect
          name="frequency"
          label="生成频率"
          placeholder="请选择生成频率"
          options={[
            { label: '每日', value: '每日' },
            { label: '每周', value: '每周' },
            { label: '每月', value: '每月' },
            { label: '手动', value: '手动' },
          ]}
          rules={[{ required: true, message: '请选择生成频率' }]}
        />
        <ProFormTextArea
          name="description"
          label="报表描述"
          placeholder="请输入报表描述"
          fieldProps={{ rows: 3 }}
        />
      </ModalForm>
    </PageContainer>
  );
};

export default ReportManagement;
