import { PageContainer, ProTable, ProColumns } from '@ant-design/pro-components';
import { Button, Tag, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import React from 'react';

interface TenantItem {
  id: number;
  name: string;
  code: string;
  contactName: string;
  contactEmail: string;
  status: 'active' | 'suspended' | 'expired';
  packageName: string;
  currentUsers: number;
  maxUsers: number;
  createdAt: string;
}

const TenantList: React.FC = () => {
  const columns: ProColumns<TenantItem>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      search: false,
    },
    {
      title: '租户名称',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '租户编码',
      dataIndex: 'code',
      width: 120,
    },
    {
      title: '联系人',
      dataIndex: 'contactName',
      width: 100,
      search: false,
    },
    {
      title: '联系邮箱',
      dataIndex: 'contactEmail',
      width: 180,
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        active: { text: '正常', status: 'Success' },
        suspended: { text: '暂停', status: 'Warning' },
        expired: { text: '过期', status: 'Error' },
      },
      render: (_, record) => {
        const statusMap = {
          active: <Tag color="success">正常</Tag>,
          suspended: <Tag color="warning">暂停</Tag>,
          expired: <Tag color="error">过期</Tag>,
        };
        return statusMap[record.status];
      },
    },
    {
      title: '套餐',
      dataIndex: 'packageName',
      width: 120,
      search: false,
    },
    {
      title: '用户数',
      dataIndex: 'currentUsers',
      width: 100,
      search: false,
      render: (_, record) => `${record.currentUsers}/${record.maxUsers}`,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 180,
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '操作',
      width: 200,
      fixed: 'right',
      search: false,
      render: () => (
        <Space>
          <a>查看</a>
          <a>编辑</a>
          <a>暂停</a>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable<TenantItem>
        columns={columns}
        request={async (params) => {
          // 待接入真实API
          console.log('查询参数:', params);
          return {
            data: [],
            total: 0,
            success: true,
          };
        }}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        pagination={{
          pageSize: 20,
        }}
        scroll={{ x: 1500 }}
        toolBarRender={() => [
          <Button key="create" type="primary" icon={<PlusOutlined />}>
            新建租户
          </Button>,
          <Button key="export">导出</Button>,
        ]}
      />
    </PageContainer>
  );
};

export default TenantList;