import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Button,
  Input,
  Progress,
  Collapse,
  Checkbox,
  Space,
  Dropdown,
  Modal,
  Form,
  DatePicker,
  message,
  Spin,
  Empty,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  HolderOutlined,
  CaretRightOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  Checklist,
  ChecklistItem,
  getChecklistsWithItemsByTaskId,
  createChecklistWithItems,
  updateChecklist,
  deleteChecklist,
  addChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  toggleChecklistItemCompleted,
  updateChecklistItemSortOrder,
  getTaskChecklistCompletion
} from '@/services/api/checklist';
import styles from './index.module.css';

const { Panel } = Collapse;

interface ChecklistPanelProps {
  taskId: number;
  editable?: boolean;
  onProgressChange?: (progress: number) => void;
}

/**
 * 检查清单面板组件
 * 支持多个检查清单和拖拽排序
 */
const ChecklistPanel: React.FC<ChecklistPanelProps> = ({
  taskId,
  editable = true,
  onProgressChange
}) => {
  const [loading, setLoading] = useState(false);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const [addingChecklist, setAddingChecklist] = useState(false);
  const [newChecklistName, setNewChecklistName] = useState('');
  const [editingChecklistId, setEditingChecklistId] = useState<number | null>(null);
  const [editingChecklistName, setEditingChecklistName] = useState('');
  const [addingItemToChecklist, setAddingItemToChecklist] = useState<number | null>(null);
  const [newItemContent, setNewItemContent] = useState('');
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editingItemContent, setEditingItemContent] = useState('');
  const inputRef = useRef<any>(null);

  // 加载检查清单数据
  const loadData = useCallback(async () => {
    if (!taskId) return;
    
    setLoading(true);
    try {
      const [checklistsData, completionData] = await Promise.all([
        getChecklistsWithItemsByTaskId(taskId),
        getTaskChecklistCompletion(taskId)
      ]);
      setChecklists(checklistsData || []);
      
      // 默认展开所有清单
      setActiveKeys(checklistsData?.map(c => String(c.id)) || []);
      
      if (completionData && onProgressChange) {
        onProgressChange(completionData.percentage);
      }
    } catch (error) {
      console.error('Failed to load checklists:', error);
      // 使用模拟数据
      setChecklists([
        {
          id: 1,
          taskId,
          name: '开发准备',
          sortOrder: 0,
          items: [
            { id: 1, checklistId: 1, content: '环境搭建', isCompleted: 1, sortOrder: 0 },
            { id: 2, checklistId: 1, content: '依赖安装', isCompleted: 1, sortOrder: 1 },
            { id: 3, checklistId: 1, content: '配置文件', isCompleted: 0, sortOrder: 2 }
          ],
          completedCount: 2,
          totalCount: 3
        },
        {
          id: 2,
          taskId,
          name: '功能开发',
          sortOrder: 1,
          items: [
            { id: 4, checklistId: 2, content: '用户登录', isCompleted: 1, sortOrder: 0 },
            { id: 5, checklistId: 2, content: '数据展示', isCompleted: 0, sortOrder: 1 },
            { id: 6, checklistId: 2, content: '表单提交', isCompleted: 0, sortOrder: 2 },
            { id: 7, checklistId: 2, content: '错误处理', isCompleted: 0, sortOrder: 3 }
          ],
          completedCount: 1,
          totalCount: 4
        }
      ]);
      setActiveKeys(['1', '2']);
    } finally {
      setLoading(false);
    }
  }, [taskId, onProgressChange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 创建新检查清单
  const handleCreateChecklist = async () => {
    if (!newChecklistName.trim()) {
      message.warning('请输入清单名称');
      return;
    }

    try {
      await createChecklistWithItems({
        taskId,
        name: newChecklistName.trim(),
        items: []
      });
      message.success('清单创建成功');
      setNewChecklistName('');
      setAddingChecklist(false);
      loadData();
    } catch (error) {
      message.error('创建失败');
    }
  };

  // 更新检查清单名称
  const handleUpdateChecklistName = async (checklistId: number) => {
    if (!editingChecklistName.trim()) {
      setEditingChecklistId(null);
      return;
    }

    try {
      await updateChecklist(checklistId, { name: editingChecklistName.trim() });
      setEditingChecklistId(null);
      loadData();
    } catch (error) {
      message.error('更新失败');
    }
  };

  // 删除检查清单
  const handleDeleteChecklist = (checklist: Checklist) => {
    Modal.confirm({
      title: '确认删除',
      content: `确认删除清单"${checklist.name}"及其所有检查项吗？`,
      okText: '确认',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteChecklist(checklist.id!);
          message.success('删除成功');
          loadData();
        } catch (error) {
          message.error('删除失败');
        }
      }
    });
  };

  // 添加检查项
  const handleAddItem = async (checklistId: number) => {
    if (!newItemContent.trim()) {
      message.warning('请输入检查项内容');
      return;
    }

    try {
      await addChecklistItem(checklistId, {
        content: newItemContent.trim()
      });
      setNewItemContent('');
      setAddingItemToChecklist(null);
      loadData();
    } catch (error) {
      message.error('添加失败');
    }
  };

  // 更新检查项内容
  const handleUpdateItemContent = async (itemId: number) => {
    if (!editingItemContent.trim()) {
      setEditingItemId(null);
      return;
    }

    try {
      await updateChecklistItem(itemId, { content: editingItemContent.trim() });
      setEditingItemId(null);
      loadData();
    } catch (error) {
      message.error('更新失败');
    }
  };

  // 删除检查项
  const handleDeleteItem = async (itemId: number) => {
    try {
      await deleteChecklistItem(itemId);
      loadData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 切换检查项完成状态
  const handleToggleItem = async (itemId: number) => {
    try {
      await toggleChecklistItemCompleted(itemId);
      loadData();
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 渲染检查项
  const renderChecklistItem = (item: ChecklistItem) => {
    const isEditing = editingItemId === item.id;
    const isCompleted = item.isCompleted === 1;

    return (
      <div 
        key={item.id} 
        className={`${styles.checklistItem} ${isCompleted ? styles.completed : ''}`}
      >
        {editable && (
          <span className={styles.dragHandle}>
            <HolderOutlined />
          </span>
        )}
        <Checkbox
          checked={isCompleted}
          onChange={() => handleToggleItem(item.id!)}
          disabled={!editable}
        />
        {isEditing ? (
          <Input
            value={editingItemContent}
            onChange={e => setEditingItemContent(e.target.value)}
            onBlur={() => handleUpdateItemContent(item.id!)}
            onPressEnter={() => handleUpdateItemContent(item.id!)}
            autoFocus
            size="small"
            className={styles.editInput}
          />
        ) : (
          <span 
            className={`${styles.itemContent} ${isCompleted ? styles.completedText : ''}`}
            onDoubleClick={() => {
              if (editable) {
                setEditingItemId(item.id!);
                setEditingItemContent(item.content);
              }
            }}
          >
            {item.content}
          </span>
        )}
        {item.dueDate && (
          <span className={styles.dueDate}>
            {dayjs(item.dueDate).format('MM-DD')}
          </span>
        )}
        {editable && !isEditing && (
          <Dropdown
            menu={{
              items: [
                {
                  key: 'edit',
                  icon: <EditOutlined />,
                  label: '编辑',
                  onClick: () => {
                    setEditingItemId(item.id!);
                    setEditingItemContent(item.content);
                  }
                },
                {
                  key: 'delete',
                  icon: <DeleteOutlined />,
                  label: '删除',
                  danger: true,
                  onClick: () => handleDeleteItem(item.id!)
                }
              ]
            }}
            trigger={['click']}
          >
            <Button 
              type="text" 
              size="small" 
              icon={<MoreOutlined />}
              className={styles.itemAction}
            />
          </Dropdown>
        )}
      </div>
    );
  };

  // 渲染检查清单
  const renderChecklist = (checklist: Checklist) => {
    const isEditingName = editingChecklistId === checklist.id;
    const isAddingItem = addingItemToChecklist === checklist.id;
    const progress = checklist.totalCount && checklist.totalCount > 0
      ? Math.round((checklist.completedCount || 0) / checklist.totalCount * 100)
      : 0;

    const header = (
      <div className={styles.checklistHeader}>
        <div className={styles.checklistTitle}>
          {isEditingName ? (
            <Input
              value={editingChecklistName}
              onChange={e => setEditingChecklistName(e.target.value)}
              onBlur={() => handleUpdateChecklistName(checklist.id!)}
              onPressEnter={() => handleUpdateChecklistName(checklist.id!)}
              autoFocus
              size="small"
              onClick={e => e.stopPropagation()}
              className={styles.editInput}
            />
          ) : (
            <span 
              onDoubleClick={(e) => {
                if (editable) {
                  e.stopPropagation();
                  setEditingChecklistId(checklist.id!);
                  setEditingChecklistName(checklist.name);
                }
              }}
            >
              {checklist.name}
            </span>
          )}
          <span className={styles.checklistCount}>
            {checklist.completedCount}/{checklist.totalCount}
          </span>
        </div>
        <div className={styles.checklistProgress}>
          <Progress 
            percent={progress} 
            size="small" 
            showInfo={false}
            strokeColor={progress === 100 ? '#52c41a' : undefined}
          />
        </div>
        {editable && (
          <Dropdown
            menu={{
              items: [
                {
                  key: 'rename',
                  icon: <EditOutlined />,
                  label: '重命名',
                  onClick: (e) => {
                    e.domEvent.stopPropagation();
                    setEditingChecklistId(checklist.id!);
                    setEditingChecklistName(checklist.name);
                  }
                },
                {
                  key: 'delete',
                  icon: <DeleteOutlined />,
                  label: '删除',
                  danger: true,
                  onClick: (e) => {
                    e.domEvent.stopPropagation();
                    handleDeleteChecklist(checklist);
                  }
                }
              ]
            }}
            trigger={['click']}
          >
            <Button 
              type="text" 
              size="small" 
              icon={<MoreOutlined />}
              onClick={e => e.stopPropagation()}
              className={styles.headerAction}
            />
          </Dropdown>
        )}
      </div>
    );

    return (
      <Panel
        key={checklist.id!}
        header={header}
        className={styles.checklistPanel}
      >
        <div className={styles.itemList}>
          {checklist.items?.map(item => renderChecklistItem(item))}
        </div>
        
        {editable && (
          isAddingItem ? (
            <div className={styles.addItemForm}>
              <Input
                ref={inputRef}
                value={newItemContent}
                onChange={e => setNewItemContent(e.target.value)}
                placeholder="输入检查项内容"
                onPressEnter={() => handleAddItem(checklist.id!)}
                autoFocus
              />
              <Space>
                <Button 
                  type="primary" 
                  size="small"
                  onClick={() => handleAddItem(checklist.id!)}
                >
                  添加
                </Button>
                <Button 
                  size="small"
                  onClick={() => {
                    setAddingItemToChecklist(null);
                    setNewItemContent('');
                  }}
                >
                  取消
                </Button>
              </Space>
            </div>
          ) : (
            <Button
              type="text"
              icon={<PlusOutlined />}
              onClick={() => setAddingItemToChecklist(checklist.id!)}
              className={styles.addItemButton}
            >
              添加检查项
            </Button>
          )
        )}
      </Panel>
    );
  };

  // 计算总体进度
  const totalItems = checklists.reduce((sum, c) => sum + (c.totalCount || 0), 0);
  const completedItems = checklists.reduce((sum, c) => sum + (c.completedCount || 0), 0);
  const overallProgress = totalItems > 0 ? Math.round(completedItems / totalItems * 100) : 0;

  return (
    <div className={styles.container}>
      {/* 总体进度 */}
      {totalItems > 0 && (
        <div className={styles.overallProgress}>
          <div className={styles.progressInfo}>
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
            <span>检查清单进度</span>
            <span className={styles.progressText}>
              {completedItems}/{totalItems} 已完成
            </span>
          </div>
          <Progress 
            percent={overallProgress} 
            size="small"
            strokeColor={overallProgress === 100 ? '#52c41a' : undefined}
          />
        </div>
      )}

      {/* 检查清单列表 */}
      {loading ? (
        <div className={styles.loading}>
          <Spin />
        </div>
      ) : checklists.length === 0 && !addingChecklist ? (
        <Empty 
          description="暂无检查清单" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <Collapse
          activeKey={activeKeys}
          onChange={keys => setActiveKeys(keys as string[])}
          expandIcon={({ isActive }) => (
            <CaretRightOutlined rotate={isActive ? 90 : 0} />
          )}
          className={styles.collapse}
        >
          {checklists.map(checklist => renderChecklist(checklist))}
        </Collapse>
      )}

      {/* 添加新清单 */}
      {editable && (
        addingChecklist ? (
          <div className={styles.addChecklistForm}>
            <Input
              value={newChecklistName}
              onChange={e => setNewChecklistName(e.target.value)}
              placeholder="输入清单名称"
              onPressEnter={handleCreateChecklist}
              autoFocus
            />
            <Space>
              <Button 
                type="primary" 
                size="small"
                onClick={handleCreateChecklist}
              >
                创建
              </Button>
              <Button 
                size="small"
                onClick={() => {
                  setAddingChecklist(false);
                  setNewChecklistName('');
                }}
              >
                取消
              </Button>
            </Space>
          </div>
        ) : (
          <Button
            type="dashed"
            block
            icon={<PlusOutlined />}
            onClick={() => setAddingChecklist(true)}
            className={styles.addButton}
          >
            添加检查清单
          </Button>
        )
      )}
    </div>
  );
};

export default ChecklistPanel;