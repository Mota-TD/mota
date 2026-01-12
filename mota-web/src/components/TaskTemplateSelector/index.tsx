import React, { useState, useEffect } from 'react';
import {
  Modal,
  Card,
  Input,
  Select,
  Tag,
  Empty,
  Spin,
  Button,
  Space,
  Tabs,
  Badge,
  message
} from 'antd';
import {
  SearchOutlined,
  StarOutlined,
  ClockCircleOutlined,
  AppstoreOutlined,
  FileAddOutlined,
  CopyOutlined
} from '@ant-design/icons';
import styles from './index.module.css';
import {
  TaskTemplate,
  getTemplates,
  getPopularTemplates,
  getTemplatesByCategory,
  getAllCategories,
  searchTemplates,
  createTaskFromTemplate,
  parseTemplateData
} from '../../services/api/taskTemplate';

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface TaskTemplateSelectorProps {
  visible: boolean;
  projectId: number;
  onSelect: (taskId: number) => void;
  onCancel: () => void;
}

const TaskTemplateSelector: React.FC<TaskTemplateSelectorProps> = ({
  visible,
  projectId,
  onSelect,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [popularTemplates, setPopularTemplates] = useState<TaskTemplate[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // 加载模板列表
  const loadTemplates = async () => {
    setLoading(true);
    try {
      const [allTemplates, popular, cats] = await Promise.all([
        getTemplates({ isPublic: true }),
        getPopularTemplates(6),
        getAllCategories()
      ]);
      setTemplates(allTemplates);
      setPopularTemplates(popular);
      setCategories(cats);
    } catch (error) {
      message.error('加载模板失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadTemplates();
    }
  }, [visible]);

  // 按分类筛选
  const handleCategoryChange = async (category: string) => {
    setSelectedCategory(category);
    if (category) {
      setLoading(true);
      try {
        const result = await getTemplatesByCategory(category);
        setTemplates(result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    } else {
      loadTemplates();
    }
  };

  // 搜索模板
  const handleSearch = async (value: string) => {
    if (value.trim()) {
      setLoading(true);
      try {
        const result = await searchTemplates(value);
        setTemplates(result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    } else {
      loadTemplates();
    }
  };

  // 选择模板
  const handleSelectTemplate = (template: TaskTemplate) => {
    setSelectedTemplate(template);
  };

  // 使用模板创建任务
  const handleCreateTask = async () => {
    if (!selectedTemplate) return;

    setCreating(true);
    try {
      const taskId = await createTaskFromTemplate(selectedTemplate.id, projectId);
      message.success('任务创建成功');
      onSelect(taskId);
    } catch (error) {
      message.error('创建任务失败');
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  // 渲染模板卡片
  const renderTemplateCard = (template: TaskTemplate) => {
    const templateData = parseTemplateData(template.templateData);
    const isSelected = selectedTemplate?.id === template.id;

    return (
      <Card
        key={template.id}
        className={`${styles.templateCard} ${isSelected ? styles.selected : ''}`}
        onClick={() => handleSelectTemplate(template)}
        hoverable
      >
        <div className={styles.templateHeader}>
          <span className={styles.templateName}>{template.name}</span>
          <Tag color="blue">{template.category}</Tag>
        </div>
        <div className={styles.templateDesc}>
          {template.description || '暂无描述'}
        </div>
        <div className={styles.templateMeta}>
          <Space>
            <span>
              <StarOutlined /> {template.useCount} 次使用
            </span>
            {templateData.priority && (
              <Tag color={
                templateData.priority === 'urgent' ? 'red' :
                templateData.priority === 'high' ? 'orange' :
                templateData.priority === 'medium' ? 'blue' : 'default'
              }>
                {templateData.priority}
              </Tag>
            )}
          </Space>
        </div>
        {templateData.subtasks && templateData.subtasks.length > 0 && (
          <div className={styles.templateSubtasks}>
            包含 {templateData.subtasks.length} 个子任务
          </div>
        )}
      </Card>
    );
  };

  // 渲染模板预览
  const renderTemplatePreview = () => {
    if (!selectedTemplate) {
      return (
        <div className={styles.previewEmpty}>
          <Empty description="选择一个模板查看详情" />
        </div>
      );
    }

    const templateData = parseTemplateData(selectedTemplate.templateData);

    return (
      <div className={styles.preview}>
        <h3>{selectedTemplate.name}</h3>
        <p className={styles.previewDesc}>{selectedTemplate.description}</p>
        
        <div className={styles.previewSection}>
          <h4>任务信息</h4>
          <div className={styles.previewItem}>
            <span className={styles.previewLabel}>标题:</span>
            <span>{templateData.title}</span>
          </div>
          {templateData.description && (
            <div className={styles.previewItem}>
              <span className={styles.previewLabel}>描述:</span>
              <span>{templateData.description}</span>
            </div>
          )}
          <div className={styles.previewItem}>
            <span className={styles.previewLabel}>优先级:</span>
            <Tag color={
              templateData.priority === 'urgent' ? 'red' :
              templateData.priority === 'high' ? 'orange' :
              templateData.priority === 'medium' ? 'blue' : 'default'
            }>
              {templateData.priority}
            </Tag>
          </div>
          {templateData.estimatedHours && (
            <div className={styles.previewItem}>
              <span className={styles.previewLabel}>预估工时:</span>
              <span>{templateData.estimatedHours} 小时</span>
            </div>
          )}
        </div>

        {templateData.subtasks && templateData.subtasks.length > 0 && (
          <div className={styles.previewSection}>
            <h4>子任务 ({templateData.subtasks.length})</h4>
            <ul className={styles.subtaskList}>
              {templateData.subtasks.map((subtask, index) => (
                <li key={index}>{subtask.title}</li>
              ))}
            </ul>
          </div>
        )}

        {templateData.checklist && templateData.checklist.length > 0 && (
          <div className={styles.previewSection}>
            <h4>检查清单</h4>
            {templateData.checklist.map((list, index) => (
              <div key={index} className={styles.checklistGroup}>
                <strong>{list.title}</strong>
                <ul>
                  {list.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {templateData.tags && templateData.tags.length > 0 && (
          <div className={styles.previewSection}>
            <h4>标签</h4>
            <Space wrap>
              {templateData.tags.map((tag, index) => (
                <Tag key={index}>{tag}</Tag>
              ))}
            </Space>
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal
      title={
        <Space>
          <FileAddOutlined />
          <span>从模板创建任务</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      width={900}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button
          key="create"
          type="primary"
          icon={<CopyOutlined />}
          onClick={handleCreateTask}
          loading={creating}
          disabled={!selectedTemplate}
        >
          使用此模板
        </Button>
      ]}
    >
      <div className={styles.container}>
        {/* 左侧模板列表 */}
        <div className={styles.templateList}>
          {/* 搜索和筛选 */}
          <div className={styles.filters}>
            <Search
              placeholder="搜索模板"
              allowClear
              onSearch={handleSearch}
              style={{ width: '100%', marginBottom: 12 }}
              prefix={<SearchOutlined />}
            />
            <Select
              placeholder="选择分类"
              allowClear
              style={{ width: '100%' }}
              value={selectedCategory}
              onChange={handleCategoryChange}
            >
              {categories.map((cat) => (
                <Option key={cat} value={cat}>{cat}</Option>
              ))}
            </Select>
          </div>

          {/* 模板标签页 */}
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane
              tab={
                <span>
                  <AppstoreOutlined />
                  全部
                </span>
              }
              key="all"
            >
              {loading ? (
                <div className={styles.loading}>
                  <Spin />
                </div>
              ) : templates.length > 0 ? (
                <div className={styles.templateGrid}>
                  {templates.map(renderTemplateCard)}
                </div>
              ) : (
                <Empty description="暂无模板" />
              )}
            </TabPane>
            <TabPane
              tab={
                <span>
                  <StarOutlined />
                  热门
                  <Badge count={popularTemplates.length} style={{ marginLeft: 4 }} />
                </span>
              }
              key="popular"
            >
              <div className={styles.templateGrid}>
                {popularTemplates.map(renderTemplateCard)}
              </div>
            </TabPane>
            <TabPane
              tab={
                <span>
                  <ClockCircleOutlined />
                  最近使用
                </span>
              }
              key="recent"
            >
              <Empty description="暂无最近使用的模板" />
            </TabPane>
          </Tabs>
        </div>

        {/* 右侧预览 */}
        <div className={styles.previewPanel}>
          {renderTemplatePreview()}
        </div>
      </div>
    </Modal>
  );
};

export default TaskTemplateSelector;