'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Typography,
  Input,
  Button,
  Space,
  Row,
  Col,
  Tabs,
  Tag,
  List,
  Avatar,
  Empty,
  Dropdown,
  message,
  Modal,
  Spin,
} from 'antd';
import {
  StarOutlined,
  StarFilled,
  SearchOutlined,
  FolderOutlined,
  FileTextOutlined,
  ProjectOutlined,
  TeamOutlined,
  CalendarOutlined,
  MoreOutlined,
  DeleteOutlined,
  EditOutlined,
  ShareAltOutlined,
  EyeOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { favoriteService, type FavoriteItem } from '@/services';

const { Title, Text, Paragraph } = Typography;

// 统一主题色 - 薄荷绿
const THEME_COLOR = '#10B981';

// 类型图标映射
const typeIconMap: Record<string, React.ReactNode> = {
  project: <ProjectOutlined />,
  document: <FileTextOutlined />,
  task: <CalendarOutlined />,
  team: <TeamOutlined />,
};

// 类型颜色映射
const typeColorMap: Record<string, string> = {
  project: '#3B82F6',
  document: '#10B981',
  task: '#8B5CF6',
  team: '#F59E0B',
};

export default function FavoritesPage() {
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [stats, setStats] = useState({ project: 0, document: 0, task: 0, team: 0, total: 0 });

  // 获取收藏列表
  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const response = await favoriteService.getFavorites({
        type: activeTab === 'all' ? undefined : activeTab,
        keyword: searchText || undefined,
      });
      setFavorites(response.records);
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchText]);

  // 获取收藏统计
  const fetchStats = useCallback(async () => {
    try {
      const data = await favoriteService.getFavoriteStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch favorite stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
    fetchStats();
  }, [fetchFavorites, fetchStats]);

  const handleRemoveFavorite = (id: string) => {
    Modal.confirm({
      title: '取消收藏',
      content: '确定要取消收藏该项目吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await favoriteService.removeFavorite(id);
          message.success('已取消收藏');
          fetchFavorites();
          fetchStats();
        } catch (error) {
          message.error('取消收藏失败');
        }
      },
    });
  };

  const getStatusTag = (status?: string) => {
    if (status === 'completed') {
      return <Tag color="success">已完成</Tag>;
    }
    if (status === 'in_progress') {
      return <Tag color="processing">进行中</Tag>;
    }
    return null;
  };

  const renderFavoriteItem = (item: FavoriteItem) => (
    <List.Item
      key={item.id}
      actions={[
        <Dropdown
          key="more"
          menu={{
            items: [
              { key: 'view', icon: <EyeOutlined />, label: '查看详情' },
              { key: 'share', icon: <ShareAltOutlined />, label: '分享' },
              { type: 'divider' },
              { key: 'remove', icon: <DeleteOutlined />, label: '取消收藏', danger: true },
            ],
            onClick: ({ key }) => {
              if (key === 'remove') {
                handleRemoveFavorite(item.id);
              }
            },
          }}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>,
      ]}
    >
      <List.Item.Meta
        avatar={
          <Avatar
            style={{ backgroundColor: item.color || typeColorMap[item.type] || '#999' }}
            icon={typeIconMap[item.type] || <FolderOutlined />}
            size={48}
          />
        }
        title={
          <Space>
            <Text strong style={{ fontSize: 16 }}>{item.name}</Text>
            {item.status && getStatusTag(item.status)}
            {item.tags?.map((tag: string) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </Space>
        }
        description={
          <Space direction="vertical" size={4}>
            <Text type="secondary">{item.description}</Text>
            <Space>
              <ClockCircleOutlined style={{ color: '#9CA3AF' }} />
              <Text type="secondary" style={{ fontSize: 12 }}>收藏于 {item.time}</Text>
              {item.members && (
                <>
                  <TeamOutlined style={{ color: '#9CA3AF', marginLeft: 12 }} />
                  <Text type="secondary" style={{ fontSize: 12 }}>{item.members} 成员</Text>
                </>
              )}
            </Space>
          </Space>
        }
      />
    </List.Item>
  );

  return (
    <div>
      {/* 页面头部 */}
      <div style={{
        background: `linear-gradient(135deg, #F59E0B 0%, #D97706 100%)`,
        borderRadius: 16,
        padding: '20px 24px',
        marginBottom: 24,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <StarFilled style={{ fontSize: 24, color: '#fff' }} />
          </div>
          <div>
            <Title level={4} style={{ color: '#fff', margin: 0 }}>我的收藏</Title>
            <Text style={{ color: 'rgba(255,255,255,0.8)' }}>快速访问收藏的项目、文档和任务</Text>
          </div>
        </div>
        <Space>
          <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
            共 {stats.total} 个收藏
          </Text>
        </Space>
      </div>

      {/* 搜索和筛选 */}
      <Card style={{ borderRadius: 12, marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Input
              placeholder="搜索收藏内容..."
              prefix={<SearchOutlined style={{ color: '#9CA3AF' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={() => fetchFavorites()}
              style={{ borderRadius: 8 }}
              allowClear
            />
          </Col>
          <Col>
            <Button type="primary" onClick={() => fetchFavorites()} style={{ background: THEME_COLOR, borderColor: THEME_COLOR }}>
              搜索
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 收藏列表 */}
      <Card style={{ borderRadius: 12 }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'all',
              label: (
                <span>
                  <StarOutlined /> 全部 ({stats.total})
                </span>
              ),
            },
            {
              key: 'project',
              label: (
                <span>
                  <ProjectOutlined /> 项目 ({stats.project})
                </span>
              ),
            },
            {
              key: 'document',
              label: (
                <span>
                  <FileTextOutlined /> 文档 ({stats.document})
                </span>
              ),
            },
            {
              key: 'task',
              label: (
                <span>
                  <CalendarOutlined /> 任务 ({stats.task})
                </span>
              ),
            },
            {
              key: 'team',
              label: (
                <span>
                  <TeamOutlined /> 团队 ({stats.team})
                </span>
              ),
            },
          ]}
        />

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
            <Spin />
          </div>
        ) : favorites.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={favorites}
            renderItem={renderFavoriteItem}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              searchText ? '没有找到匹配的收藏' : '暂无收藏内容'
            }
          >
            {!searchText && (
              <Button type="primary" style={{ background: THEME_COLOR, borderColor: THEME_COLOR }}>
                去添加收藏
              </Button>
            )}
          </Empty>
        )}
      </Card>
    </div>
  );
}