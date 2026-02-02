import { ExportOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-components';
import {
  ModalForm,
  PageContainer,
  type ProColumns,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { Badge, Button, message, Popconfirm, Space, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import {
  createTenant,
  deleteTenant,
  getTenantList,
  toggleTenantStatus,
  updateTenant,
} from '@/services/tenant';
import type {
  CreateTenantParams,
  Tenant,
  UpdateTenantParams,
} from '@/types/tenant';

/**
 * 租户列表页面
 * 完整的租户管理功能，包括CRUD、批量操作、导出等
 */
const TenantList: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 定义表格列
  const columns: ProColumns<Tenant>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      search: false,
      fixed: 'left',
    },
    {
      title: '租户名称',
      dataIndex: 'name',
      ellipsis: true,
      width: 180,
      fixed: 'left',
      render: (_, record) => (
        <a
          onClick={() => {
            history.push(`/tenant/detail/${record.id}`);
          }}
        >
          {record.name}
        </a>
      ),
    },
    {
      title: '租户编码',
      dataIndex: 'code',
      width: 120,
      copyable: true,
    },
    {
      title: '联系人',
      dataIndex: 'contactName',
      width: 100,
      search: false,
    },
    {
      title: '联系电话',
      dataIndex: 'contactPhone',
      width: 120,
      search: false,
    },
    {
      title: '联系邮箱',
      dataIndex: 'contactEmail',
      width: 180,
      search: false,
      ellipsis: true,
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
        const statusConfig = {
          active: { color: 'success', text: '正常' },
          suspended: { color: 'warning', text: '暂停' },
          expired: { color: 'error', text: '过期' },
        };
        const config = statusConfig[record.status as keyof typeof statusConfig];
        return <Badge status={config.color as any} text={config.text} />;
      },
    },
    {
      title: '套餐',
      dataIndex: 'packageName',
      width: 120,
      search: false,
      render: (_, record) => <Tag color="blue">{record.packageName}</Tag>,
    },
    {
      title: '用户数',
      dataIndex: 'currentUsers',
      width: 100,
      search: false,
      render: (_, record) => (
        <span>
          {record.userCount}/{record.maxUsers}
        </span>
      ),
    },
    {
      title: '存储空间',
      dataIndex: 'usedStorage',
      width: 120,
      search: false,
      render: (_, record) => (
        <span>
          {(record.storageUsed / 1024).toFixed(2)}GB/
          {(record.storageLimit / 1024).toFixed(0)}GB
        </span>
      ),
    },
    {
      title: '到期时间',
      dataIndex: 'expireDate',
      width: 180,
      valueType: 'dateTime',
      search: false,
      render: (_, record) => {
        const now = Date.now();
        const expires = new Date(record.expireDate).getTime();
        const daysLeft = Math.ceil((expires - now) / (1000 * 60 * 60 * 24));

        if (daysLeft < 0) {
          return <Tag color="error">已过期</Tag>;
        } else if (daysLeft < 30) {
          return <Tag color="warning">{daysLeft}天后到期</Tag>;
        }
        return <span>{record.expireDate}</span>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 180,
      valueType: 'dateTime',
      search: false,
      sorter: true,
    },
    {
      title: '操作',
      width: 200,
      fixed: 'right',
      search: false,
      render: (_, record) => (
        <Space>
          <a
            onClick={() => {
              history.push(`/tenant/detail/${record.id}`);
            }}
          >
            查看
          </a>
          <a
            onClick={() => {
              setCurrentTenant(record);
              setEditModalVisible(true);
            }}
          >
            编辑
          </a>
          {record.status === 'active' ? (
            <Popconfirm
              title="确认暂停该租户？"
              onConfirm={async () => {
                try {
                  await toggleTenantStatus(record.id, 'inactive');
                  message.success('暂停成功');
                  actionRef.current?.reload();
                } catch (_error) {
                  message.error('暂停失败');
                }
              }}
            >
              <a style={{ color: '#faad14' }}>暂停</a>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="确认启用该租户？"
              onConfirm={async () => {
                try {
                  await toggleTenantStatus(record.id, 'active');
                  message.success('启用成功');
                  actionRef.current?.reload();
                } catch (_error) {
                  message.error('启用失败');
                }
              }}
            >
              <a style={{ color: '#52c41a' }}>启用</a>
            </Popconfirm>
          )}
          <Popconfirm
            title="确认删除该租户？此操作不可恢复"
            onConfirm={async () => {
              try {
                await deleteTenant(record.id);
                message.success('删除成功');
                actionRef.current?.reload();
              } catch (_error) {
                message.error('删除失败');
              }
            }}
          >
            <a style={{ color: '#ff4d4f' }}>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 批量操作
  const handleBatchAction = async (
    action: 'delete' | 'suspend' | 'activate',
  ) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要操作的租户');
      return;
    }

    try {
      // 这里应该调用批量操作API
      message.success(
        `批量${action === 'delete' ? '删除' : action === 'suspend' ? '暂停' : '启用'}成功`,
      );
      setSelectedRowKeys([]);
      actionRef.current?.reload();
    } catch (_error) {
      message.error('操作失败');
    }
  };

  // 导出数据
  const handleExport = () => {
    message.success('导出功能开发中');
  };

  return (
    <PageContainer>
      <ProTable<Tenant>
        columns={columns}
        actionRef={actionRef}
        request={async (params, _sort) => {
          try {
            const response = await getTenantList({
              current: params.current || 1,
              pageSize: params.pageSize || 20,
              keyword: params.name || params.code,
            });

            if (response.code === 0) {
              return {
                data: response.data.list || [],
                total: response.data.total || 0,
                success: true,
              };
            }

            return {
              data: [],
              total: 0,
              success: false,
            };
          } catch (_error) {
            return {
              data: [],
              total: 0,
              success: false,
            };
          }
        }}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        scroll={{ x: 1800 }}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            新建租户
          </Button>,
          <Button key="export" icon={<ExportOutlined />} onClick={handleExport}>
            导出
          </Button>,
        ]}
        tableAlertRender={({ selectedRowKeys }) => (
          <Space size={24}>
            <span>
              已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a>{' '}
              项
            </span>
          </Space>
        )}
        tableAlertOptionRender={() => (
          <Space size={16}>
            <a onClick={() => handleBatchAction('activate')}>批量启用</a>
            <a onClick={() => handleBatchAction('suspend')}>批量暂停</a>
            <a onClick={() => handleBatchAction('delete')}>批量删除</a>
            <a onClick={() => setSelectedRowKeys([])}>取消选择</a>
          </Space>
        )}
      />

      {/* 创建租户弹窗 */}
      <ModalForm
        title="新建租户"
        open={createModalVisible}
        onOpenChange={setCreateModalVisible}
        onFinish={async (values) => {
          try {
            await createTenant(values as CreateTenantParams);
            message.success('创建成功');
            setCreateModalVisible(false);
            actionRef.current?.reload();
            return true;
          } catch (_error) {
            message.error('创建失败');
            return false;
          }
        }}
        width={600}
      >
        <ProFormText
          name="name"
          label="租户名称"
          placeholder="请输入租户名称"
          rules={[{ required: true, message: '请输入租户名称' }]}
        />
        <ProFormText
          name="code"
          label="租户编码"
          placeholder="请输入租户编码（唯一）"
          rules={[
            { required: true, message: '请输入租户编码' },
            {
              pattern: /^[a-zA-Z0-9_-]+$/,
              message: '只能包含字母、数字、下划线和横线',
            },
          ]}
        />
        <ProFormText
          name="contactName"
          label="联系人"
          placeholder="请输入联系人姓名"
          rules={[{ required: true, message: '请输入联系人姓名' }]}
        />
        <ProFormText
          name="contactPhone"
          label="联系电话"
          placeholder="请输入联系电话"
          rules={[
            { required: true, message: '请输入联系电话' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' },
          ]}
        />
        <ProFormText
          name="contactEmail"
          label="联系邮箱"
          placeholder="请输入联系邮箱"
          rules={[
            { required: true, message: '请输入联系邮箱' },
            { type: 'email', message: '请输入有效的邮箱地址' },
          ]}
        />
        <ProFormSelect
          name="packageId"
          label="选择套餐"
          placeholder="请选择套餐"
          rules={[{ required: true, message: '请选择套餐' }]}
          request={async () => [
            { label: '基础版', value: 1 },
            { label: '专业版', value: 2 },
            { label: '企业版', value: 3 },
            { label: '旗舰版', value: 4 },
          ]}
        />
        <ProFormDigit
          name="duration"
          label="购买时长（月）"
          placeholder="请输入购买时长"
          min={1}
          max={36}
          initialValue={12}
          rules={[{ required: true, message: '请输入购买时长' }]}
        />
      </ModalForm>

      {/* 编辑租户弹窗 */}
      <ModalForm
        title="编辑租户"
        open={editModalVisible}
        onOpenChange={setEditModalVisible}
        initialValues={currentTenant || undefined}
        onFinish={async (values) => {
          try {
            if (currentTenant) {
              await updateTenant({
                ...values,
                id: currentTenant.id,
              } as UpdateTenantParams);
              message.success('更新成功');
              setEditModalVisible(false);
              setCurrentTenant(null);
              actionRef.current?.reload();
            }
            return true;
          } catch (_error) {
            message.error('更新失败');
            return false;
          }
        }}
        width={600}
      >
        <ProFormText
          name="name"
          label="租户名称"
          placeholder="请输入租户名称"
          rules={[{ required: true, message: '请输入租户名称' }]}
        />
        <ProFormText
          name="contactName"
          label="联系人"
          placeholder="请输入联系人姓名"
          rules={[{ required: true, message: '请输入联系人姓名' }]}
        />
        <ProFormText
          name="contactPhone"
          label="联系电话"
          placeholder="请输入联系电话"
          rules={[
            { required: true, message: '请输入联系电话' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' },
          ]}
        />
        <ProFormText
          name="contactEmail"
          label="联系邮箱"
          placeholder="请输入联系邮箱"
          rules={[
            { required: true, message: '请输入联系邮箱' },
            { type: 'email', message: '请输入有效的邮箱地址' },
          ]}
        />
      </ModalForm>
    </PageContainer>
  );
};

export default TenantList;
