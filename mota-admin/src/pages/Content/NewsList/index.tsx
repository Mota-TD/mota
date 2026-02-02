import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-components';
import {
  PageContainer,
  type ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { history } from '@umijs/max';
import {
  Badge,
  Button,
  Card,
  Col,
  Image,
  message,
  Popconfirm,
  Row,
  Space,
  Statistic,
  Tag,
} from 'antd';
import React, { useRef, useState } from 'react';

/**
 * 新闻数据类型
 */
interface News {
  id: number;
  title: string;
  summary: string;
  coverImage: string;
  category: string;
  tags: string[];
  author: string;
  status: 'draft' | 'published' | 'archived';
  views: number;
  likes: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 新闻列表页面
 * 完整的新闻管理功能，包括分类筛选、状态管理、批量操作等
 */
const NewsList: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 模拟新闻数据
  const mockNews: News[] = [
    {
      id: 1,
      title: '企业AI转型白皮书发布：数字化时代的智能升级之路',
      summary:
        '本白皮书详细阐述了企业在AI转型过程中的关键要素、实施路径和成功案例，为企业数字化转型提供全面指导。',
      coverImage:
        'https://gw.alipayobjects.com/zos/antfincdn/LlvErxo8H9/photo-1503185912284-5271ff81b9a8.webp',
      category: '行业动态',
      tags: ['AI', '数字化转型', '企业服务'],
      author: '张三',
      status: 'published',
      views: 1285,
      likes: 156,
      publishedAt: '2024-02-01 10:00:00',
      createdAt: '2024-01-30 15:30:00',
      updatedAt: '2024-02-01 10:00:00',
    },
    {
      id: 2,
      title: '平台新增多语言AI模型支持，覆盖50+语种',
      summary:
        '为满足全球化企业需求，平台新增多语言AI模型支持，覆盖包括中文、英文、日文、韩文等50多种语言。',
      coverImage:
        'https://gw.alipayobjects.com/zos/antfincdn/cV16ZqzMjW/photo-1473091540282-9b846e7965e3.webp',
      category: '产品更新',
      tags: ['产品', '多语言', 'AI模型'],
      author: '李四',
      status: 'published',
      views: 856,
      likes: 89,
      publishedAt: '2024-01-31 14:00:00',
      createdAt: '2024-01-31 10:00:00',
      updatedAt: '2024-01-31 14:00:00',
    },
    {
      id: 3,
      title: '如何利用AI提升客户服务质量：实战案例分享',
      summary:
        '本文通过真实案例，分享企业如何利用AI技术提升客户服务质量，降低运营成本，提高客户满意度。',
      coverImage:
        'https://gw.alipayobjects.com/zos/antfincdn/x43I27A55%26/photo-1438109491414-7198515b166b.webp',
      category: '案例分析',
      tags: ['客户服务', 'AI应用', '案例'],
      author: '王五',
      status: 'draft',
      views: 0,
      likes: 0,
      createdAt: '2024-02-01 16:00:00',
      updatedAt: '2024-02-01 16:00:00',
    },
    {
      id: 4,
      title: '2024年AI技术发展趋势预测报告',
      summary:
        '基于当前AI技术发展现状，分析预测2024年AI领域的重要技术趋势和应用方向。',
      coverImage:
        'https://gw.alipayobjects.com/zos/antfincdn/aPkFc8Sj7n/method-draw-image.svg',
      category: '行业动态',
      tags: ['趋势', 'AI', '报告'],
      author: '赵六',
      status: 'published',
      views: 2156,
      likes: 345,
      publishedAt: '2024-01-28 09:00:00',
      createdAt: '2024-01-25 14:00:00',
      updatedAt: '2024-01-28 09:00:00',
    },
    {
      id: 5,
      title: '平台安全升级公告：新增多重身份验证功能',
      summary:
        '为进一步提升平台安全性，我们新增了多重身份验证功能，包括短信验证、邮箱验证和生物识别等多种方式。',
      coverImage:
        'https://gw.alipayobjects.com/zos/antfincdn/RmjwQiJorKyobvI/yuque_diagram.jpg',
      category: '公告通知',
      tags: ['安全', '公告', '产品'],
      author: '张三',
      status: 'archived',
      views: 645,
      likes: 42,
      publishedAt: '2024-01-20 10:00:00',
      createdAt: '2024-01-19 16:00:00',
      updatedAt: '2024-01-25 09:00:00',
    },
  ];

  // 统计数据
  const stats = {
    total: mockNews.length,
    published: mockNews.filter((n) => n.status === 'published').length,
    draft: mockNews.filter((n) => n.status === 'draft').length,
    totalViews: mockNews.reduce((sum, n) => sum + n.views, 0),
  };

  // 定义表格列
  const columns: ProColumns<News>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
      search: false,
      fixed: 'left',
    },
    {
      title: '封面',
      dataIndex: 'coverImage',
      width: 100,
      search: false,
      render: (_, record) => (
        <Image
          src={record.coverImage}
          width={80}
          height={50}
          style={{ objectFit: 'cover', borderRadius: 4 }}
        />
      ),
    },
    {
      title: '标题',
      dataIndex: 'title',
      width: 300,
      ellipsis: true,
      fixed: 'left',
      render: (_, record) => (
        <a
          onClick={() => {
            history.push(`/content/news-edit/${record.id}`);
          }}
        >
          {record.title}
        </a>
      ),
    },
    {
      title: '摘要',
      dataIndex: 'summary',
      width: 300,
      search: false,
      ellipsis: true,
    },
    {
      title: '分类',
      dataIndex: 'category',
      width: 120,
      valueType: 'select',
      valueEnum: {
        行业动态: { text: '行业动态', status: 'Processing' },
        产品更新: { text: '产品更新', status: 'Success' },
        案例分析: { text: '案例分析', status: 'Default' },
        公告通知: { text: '公告通知', status: 'Warning' },
      },
      render: (_, record) => {
        const colorMap: Record<string, string> = {
          行业动态: 'blue',
          产品更新: 'green',
          案例分析: 'purple',
          公告通知: 'orange',
        };
        return <Tag color={colorMap[record.category]}>{record.category}</Tag>;
      },
    },
    {
      title: '标签',
      dataIndex: 'tags',
      width: 200,
      search: false,
      render: (_, record) => (
        <Space size={[0, 4]} wrap>
          {record.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '作者',
      dataIndex: 'author',
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
        archived: { text: '已归档', status: 'Warning' },
      },
      render: (_, record) => {
        const statusConfig = {
          draft: { color: 'default', text: '草稿' },
          published: { color: 'success', text: '已发布' },
          archived: { color: 'warning', text: '已归档' },
        };
        const config = statusConfig[record.status];
        return <Badge status={config.color as any} text={config.text} />;
      },
    },
    {
      title: '浏览量',
      dataIndex: 'views',
      width: 100,
      search: false,
      sorter: true,
      render: (_, record) => (
        <span>
          <EyeOutlined style={{ marginRight: 4 }} />
          {record.views}
        </span>
      ),
    },
    {
      title: '点赞数',
      dataIndex: 'likes',
      width: 100,
      search: false,
      sorter: true,
    },
    {
      title: '发布时间',
      dataIndex: 'publishedAt',
      width: 160,
      valueType: 'dateTime',
      search: false,
      render: (_, record) => record.publishedAt || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 160,
      valueType: 'dateTime',
      hideInSearch: true,
      sorter: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateRange',
      hideInTable: true,
      search: {
        transform: (value) => {
          return {
            startTime: value[0],
            endTime: value[1],
          };
        },
      },
    },
    {
      title: '操作',
      width: 200,
      fixed: 'right',
      search: false,
      render: (_, record) => (
        <Space size={0} split={<span style={{ color: '#e8e8e8' }}>|</span>}>
          <a
            onClick={() => {
              history.push(`/content/news-edit/${record.id}`);
            }}
          >
            <EditOutlined /> 编辑
          </a>
          {record.status === 'draft' ? (
            <Popconfirm
              title="确认发布该新闻？"
              onConfirm={async () => {
                message.success('发布成功');
                actionRef.current?.reload();
              }}
            >
              <a style={{ color: '#52c41a' }}>发布</a>
            </Popconfirm>
          ) : record.status === 'published' ? (
            <Popconfirm
              title="确认归档该新闻？"
              onConfirm={async () => {
                message.success('归档成功');
                actionRef.current?.reload();
              }}
            >
              <a style={{ color: '#faad14' }}>归档</a>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="确认恢复该新闻？"
              onConfirm={async () => {
                message.success('恢复成功');
                actionRef.current?.reload();
              }}
            >
              <a style={{ color: '#1890ff' }}>恢复</a>
            </Popconfirm>
          )}
          <Popconfirm
            title="确认删除该新闻？"
            description="此操作不可恢复"
            onConfirm={async () => {
              message.success('删除成功');
              actionRef.current?.reload();
            }}
          >
            <a style={{ color: '#ff4d4f' }}>
              <DeleteOutlined /> 删除
            </a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 批量操作
  const handleBatchAction = async (
    action: 'delete' | 'publish' | 'archive',
  ) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要操作的新闻');
      return;
    }

    const actionText = {
      delete: '删除',
      publish: '发布',
      archive: '归档',
    };

    message.success(`批量${actionText[action]}成功`);
    setSelectedRowKeys([]);
    actionRef.current?.reload();
  };

  return (
    <PageContainer>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="新闻总数" value={stats.total} suffix="篇" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已发布"
              value={stats.published}
              suffix="篇"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="草稿"
              value={stats.draft}
              suffix="篇"
              valueStyle={{ color: '#999' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总浏览量"
              value={stats.totalViews}
              prefix={<EyeOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 新闻列表 */}
      <ProTable<News>
        columns={columns}
        actionRef={actionRef}
        request={async (params) => {
          // 模拟API请求
          await new Promise((resolve) => setTimeout(resolve, 500));

          let data = [...mockNews];

          // 搜索过滤
          if (params.title) {
            data = data.filter((item) =>
              item.title.includes(params.title as string),
            );
          }
          if (params.category) {
            data = data.filter((item) => item.category === params.category);
          }
          if (params.author) {
            data = data.filter((item) =>
              item.author.includes(params.author as string),
            );
          }
          if (params.status) {
            data = data.filter((item) => item.status === params.status);
          }

          return {
            data,
            total: data.length,
            success: true,
          };
        }}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
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
            onClick={() => {
              history.push('/content/news-edit/new');
            }}
          >
            新建新闻
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
            <a onClick={() => handleBatchAction('publish')}>批量发布</a>
            <a onClick={() => handleBatchAction('archive')}>批量归档</a>
            <a onClick={() => handleBatchAction('delete')}>批量删除</a>
            <a onClick={() => setSelectedRowKeys([])}>取消选择</a>
          </Space>
        )}
      />
    </PageContainer>
  );
};

export default NewsList;
