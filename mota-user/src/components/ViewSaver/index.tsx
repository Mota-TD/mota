import React, { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Dropdown,
  Modal,
  Form,
  Input,
  Switch,
  Space,
  List,
  Tag,
  Popconfirm,
  message,
  Tooltip,
  Empty,
  Divider,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  SaveOutlined,
  DownOutlined,
  StarOutlined,
  StarFilled,
  EditOutlined,
  DeleteOutlined,
  ShareAltOutlined,
  CopyOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import {
  ViewConfig,
  ViewType,
  ViewConfigData,
  getUserViewConfigsByType,
  getDefaultViewConfig,
  createViewConfig,
  updateViewConfig,
  deleteViewConfig,
  setDefaultViewConfig,
  duplicateViewConfig,
  setViewConfigShared,
  getViewTypeLabel,
  hasViewConfigChanged,
} from '@/services/api/viewConfig';
import { useAuthStore } from '@/store/auth';
import styles from './index.module.css';

interface ViewSaverProps {
  viewType: ViewType;
  currentConfig: ViewConfigData;
  onApplyView?: (config: ViewConfigData) => void;
  projectId?: number;
}

const ViewSaver: React.FC<ViewSaverProps> = ({
  viewType,
  currentConfig,
  onApplyView,
  projectId,
}) => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [views, setViews] = useState<ViewConfig[]>([]);
  const [activeView, setActiveView] = useState<ViewConfig | null>(null);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [manageModalVisible, setManageModalVisible] = useState(false);
  const [editingView, setEditingView] = useState<ViewConfig | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [form] = Form.useForm();

  const userId = user?.id || 1;

  // 加载视图列表
  const loadViews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUserViewConfigsByType(userId, viewType);
      setViews(data);
      
      // 加载默认视图
      const defaultView = await getDefaultViewConfig(userId, viewType);
      if (defaultView) {
        setActiveView(defaultView);
      }
    } catch (error) {
      console.error('加载视图配置失败:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, viewType]);

  useEffect(() => {
    loadViews();
  }, [loadViews]);

  // 检测配置变化
  useEffect(() => {
    if (activeView) {
      setHasChanges(hasViewConfigChanged(activeView.config, currentConfig));
    } else {
      setHasChanges(false);
    }
  }, [activeView, currentConfig]);

  // 保存视图
  const handleSaveView = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingView) {
        // 更新现有视图
        await updateViewConfig(editingView.id, {
          ...values,
          config: currentConfig,
        });
        message.success('视图更新成功');
      } else {
        // 创建新视图
        await createViewConfig({
          userId,
          viewType,
          ...values,
          config: currentConfig,
          projectId,
        });
        message.success('视图保存成功');
      }
      
      setSaveModalVisible(false);
      form.resetFields();
      setEditingView(null);
      loadViews();
    } catch (error) {
      console.error('保存视图失败:', error);
    }
  };

  // 应用视图
  const handleApplyView = (view: ViewConfig) => {
    setActiveView(view);
    onApplyView?.(view.config);
    message.success(`已应用视图: ${view.name}`);
  };

  // 设置默认视图
  const handleSetDefault = async (view: ViewConfig) => {
    try {
      await setDefaultViewConfig(view.id, userId, viewType);
      message.success('已设为默认视图');
      loadViews();
    } catch (error) {
      console.error('设置默认视图失败:', error);
    }
  };

  // 删除视图
  const handleDeleteView = async (id: number) => {
    try {
      await deleteViewConfig(id);
      message.success('视图删除成功');
      if (activeView?.id === id) {
        setActiveView(null);
      }
      loadViews();
    } catch (error) {
      console.error('删除视图失败:', error);
    }
  };

  // 复制视图
  const handleDuplicateView = async (id: number) => {
    try {
      await duplicateViewConfig(id);
      message.success('视图复制成功');
      loadViews();
    } catch (error) {
      console.error('复制视图失败:', error);
    }
  };

  // 切换共享状态
  const handleToggleShare = async (view: ViewConfig) => {
    try {
      await setViewConfigShared(view.id, !view.isShared);
      message.success(view.isShared ? '已取消共享' : '已共享给团队');
      loadViews();
    } catch (error) {
      console.error('切换共享状态失败:', error);
    }
  };

  // 打开编辑弹窗
  const openEditModal = (view: ViewConfig) => {
    setEditingView(view);
    form.setFieldsValue({
      name: view.name,
      description: view.description,
      isDefault: view.isDefault,
      isShared: view.isShared,
    });
    setSaveModalVisible(true);
  };

  // 快速保存当前视图
  const handleQuickSave = async () => {
    if (!activeView) {
      setSaveModalVisible(true);
      return;
    }
    
    try {
      await updateViewConfig(activeView.id, {
        config: currentConfig,
      });
      message.success('视图已保存');
      setHasChanges(false);
      loadViews();
    } catch (error) {
      console.error('保存视图失败:', error);
    }
  };

  // 下拉菜单项
  const menuItems: MenuProps['items'] = [
    {
      key: 'views',
      type: 'group',
      label: '我的视图',
      children: views.length > 0 ? views.map((view) => ({
        key: view.id.toString(),
        label: (
          <Space>
            {view.name}
            {view.isDefault && <Tag color="blue" style={{ marginLeft: 4 }}>默认</Tag>}
            {view.isShared && <ShareAltOutlined style={{ color: '#52c41a' }} />}
          </Space>
        ),
        onClick: () => handleApplyView(view),
      })) : [{
        key: 'empty',
        label: <span style={{ color: '#999' }}>暂无保存的视图</span>,
        disabled: true,
      }],
    },
    { type: 'divider' },
    {
      key: 'save',
      icon: <SaveOutlined />,
      label: '保存当前视图',
      onClick: () => {
        form.resetFields();
        setEditingView(null);
        setSaveModalVisible(true);
      },
    },
    {
      key: 'manage',
      icon: <EditOutlined />,
      label: '管理视图',
      onClick: () => setManageModalVisible(true),
    },
  ];

  return (
    <div className={styles.container}>
      <Space>
        {/* 当前视图显示 */}
        {activeView && (
          <Tag color="blue" className={styles.activeTag}>
            {activeView.name}
            {hasChanges && <span className={styles.changedDot} />}
          </Tag>
        )}

        {/* 快速保存按钮 */}
        {hasChanges && activeView && (
          <Tooltip title="保存更改">
            <Button
              type="text"
              size="small"
              icon={<SaveOutlined />}
              onClick={handleQuickSave}
            />
          </Tooltip>
        )}

        {/* 视图选择下拉 */}
        <Dropdown menu={{ items: menuItems }} trigger={['click']}>
          <Button loading={loading}>
            <Space>
              视图
              <DownOutlined />
            </Space>
          </Button>
        </Dropdown>
      </Space>

      {/* 保存视图弹窗 */}
      <Modal
        title={editingView ? '编辑视图' : '保存视图'}
        open={saveModalVisible}
        onOk={handleSaveView}
        onCancel={() => {
          setSaveModalVisible(false);
          setEditingView(null);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="视图名称"
            rules={[{ required: true, message: '请输入视图名称' }]}
          >
            <Input placeholder="请输入视图名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea placeholder="请输入视图描述（可选）" rows={2} />
          </Form.Item>
          <Form.Item name="isDefault" label="设为默认视图" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="isShared" label="共享给团队" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      {/* 管理视图弹窗 */}
      <Modal
        title={`管理${getViewTypeLabel(viewType)}`}
        open={manageModalVisible}
        onCancel={() => setManageModalVisible(false)}
        footer={null}
        width={600}
      >
        {views.length > 0 ? (
          <List
            dataSource={views}
            renderItem={(view) => (
              <List.Item
                actions={[
                  <Tooltip key="default" title={view.isDefault ? '默认视图' : '设为默认'}>
                    <Button
                      type="text"
                      size="small"
                      icon={view.isDefault ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                      onClick={() => handleSetDefault(view)}
                    />
                  </Tooltip>,
                  <Tooltip key="apply" title="应用">
                    <Button
                      type="text"
                      size="small"
                      icon={<CheckOutlined />}
                      onClick={() => {
                        handleApplyView(view);
                        setManageModalVisible(false);
                      }}
                    />
                  </Tooltip>,
                  <Tooltip key="edit" title="编辑">
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => {
                        setManageModalVisible(false);
                        openEditModal(view);
                      }}
                    />
                  </Tooltip>,
                  <Tooltip key="share" title={view.isShared ? '取消共享' : '共享'}>
                    <Button
                      type="text"
                      size="small"
                      icon={<ShareAltOutlined style={{ color: view.isShared ? '#52c41a' : undefined }} />}
                      onClick={() => handleToggleShare(view)}
                    />
                  </Tooltip>,
                  <Tooltip key="copy" title="复制">
                    <Button
                      type="text"
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={() => handleDuplicateView(view.id)}
                    />
                  </Tooltip>,
                  <Popconfirm
                    key="delete"
                    title="确定删除此视图吗？"
                    onConfirm={() => handleDeleteView(view.id)}
                  >
                    <Tooltip title="删除">
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                      />
                    </Tooltip>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      {view.name}
                      {view.isDefault && <Tag color="blue">默认</Tag>}
                      {view.isShared && <Tag color="green">已共享</Tag>}
                    </Space>
                  }
                  description={view.description || '无描述'}
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无保存的视图" />
        )}
        <Divider />
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={() => {
            setManageModalVisible(false);
            form.resetFields();
            setEditingView(null);
            setSaveModalVisible(true);
          }}
        >
          保存当前视图
        </Button>
      </Modal>
    </div>
  );
};

export default ViewSaver;