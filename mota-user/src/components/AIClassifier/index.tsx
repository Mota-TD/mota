/**
 * AI智能分类组件
 * 支持自动分类建议、标签推荐、批量分类
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Tag,
  Space,
  Typography,
  Progress,
  List,
  Tooltip,
  Modal,
  Select,
  Input,
  message,
  Spin,
  Empty,
  Divider,
  Badge,
  Popconfirm
} from 'antd';
import {
  RobotOutlined,
  TagOutlined,
  FolderOutlined,
  CheckOutlined,
  CloseOutlined,
  ReloadOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  QuestionCircleOutlined,
  EditOutlined,
  PlusOutlined
} from '@ant-design/icons';
import styles from './index.module.css';
import {
  getAIClassification,
  applyAIClassification,
  batchAIClassification,
  trainAIClassifier,
  getCategories,
  getTags,
  AIClassificationResponse,
  AICategorySuggestion,
  AITagSuggestion,
  FileCategory,
  FileTag
} from '../../services/api/knowledgeManagement';

const { Text, Title, Paragraph } = Typography;

interface AIClassifierProps {
  fileId: number;
  fileName: string;
  currentCategory?: string;
  currentTags?: string[];
  onApply?: (category: string, tags: string[]) => void;
  onClose?: () => void;
  showCard?: boolean;
}

const AIClassifier: React.FC<AIClassifierProps> = ({
  fileId,
  fileName,
  currentCategory,
  currentTags = [],
  onApply,
  onClose,
  showCard = true
}) => {
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [classification, setClassification] = useState<AIClassificationResponse | null>(null);
  const [categories, setCategories] = useState<FileCategory[]>([]);
  const [allTags, setAllTags] = useState<FileTag[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(currentCategory);
  const [selectedTags, setSelectedTags] = useState<string[]>(currentTags);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackCategory, setFeedbackCategory] = useState('');
  const [feedbackTags, setFeedbackTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  // 加载分类和标签数据
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, tagsData] = await Promise.all([
          getCategories(),
          getTags()
        ]);
        setCategories(categoriesData);
        setAllTags(tagsData);
      } catch (error) {
        console.error('加载分类数据失败:', error);
      }
    };
    loadData();
  }, []);

  // 获取AI分类建议
  const fetchClassification = async () => {
    setLoading(true);
    try {
      const result = await getAIClassification(fileId);
      setClassification(result);
      
      // 自动选择置信度最高的分类
      if (result.suggestedCategories.length > 0) {
        const topCategory = result.suggestedCategories[0];
        if (topCategory.confidence >= 0.7) {
          setSelectedCategory(topCategory.category);
        }
      }
      
      // 自动选择置信度高的标签
      const highConfidenceTags = result.suggestedTags
        .filter(t => t.confidence >= 0.6)
        .map(t => t.tag);
      if (highConfidenceTags.length > 0) {
        setSelectedTags(prev => [...new Set([...prev, ...highConfidenceTags])]);
      }
    } catch (error) {
      message.error('获取AI分类建议失败');
    } finally {
      setLoading(false);
    }
  };

  // 应用分类
  const handleApply = async () => {
    if (!selectedCategory && selectedTags.length === 0) {
      message.warning('请至少选择一个分类或标签');
      return;
    }

    setApplying(true);
    try {
      await applyAIClassification(fileId, selectedCategory, selectedTags);
      message.success('分类应用成功');
      onApply?.(selectedCategory || '', selectedTags);
    } catch (error) {
      message.error('应用分类失败');
    } finally {
      setApplying(false);
    }
  };

  // 提交反馈（训练模型）
  const handleFeedback = async () => {
    if (!feedbackCategory && feedbackTags.length === 0) {
      message.warning('请提供正确的分类或标签');
      return;
    }

    try {
      await trainAIClassifier(fileId, feedbackCategory, feedbackTags);
      message.success('感谢您的反馈，AI将持续学习改进');
      setShowFeedback(false);
    } catch (error) {
      message.error('提交反馈失败');
    }
  };

  // 添加自定义标签
  const handleAddTag = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
      setSelectedTags([...selectedTags, newTag.trim()]);
      setNewTag('');
    }
  };

  // 移除标签
  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  // 获取置信度颜色
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return '#52c41a';
    if (confidence >= 0.6) return '#1890ff';
    if (confidence >= 0.4) return '#faad14';
    return '#ff4d4f';
  };

  // 获取置信度标签
  const getConfidenceLabel = (confidence: number): string => {
    if (confidence >= 0.8) return '高';
    if (confidence >= 0.6) return '中';
    if (confidence >= 0.4) return '低';
    return '很低';
  };

  // 渲染分类建议
  const renderCategorySuggestions = () => {
    if (!classification || classification.suggestedCategories.length === 0) {
      return <Empty description="暂无分类建议" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }

    return (
      <List
        size="small"
        dataSource={classification.suggestedCategories}
        renderItem={(item: AICategorySuggestion) => (
          <List.Item
            className={`${styles.suggestionItem} ${selectedCategory === item.category ? styles.selected : ''}`}
            onClick={() => setSelectedCategory(item.category)}
          >
            <Space>
              <FolderOutlined />
              <Text>{item.category}</Text>
            </Space>
            <Space>
              <Tooltip title={item.reason}>
                <QuestionCircleOutlined style={{ color: '#8c8c8c' }} />
              </Tooltip>
              <Progress
                type="circle"
                percent={Math.round(item.confidence * 100)}
                width={32}
                strokeColor={getConfidenceColor(item.confidence)}
                format={() => getConfidenceLabel(item.confidence)}
              />
              {selectedCategory === item.category && (
                <CheckOutlined style={{ color: '#52c41a' }} />
              )}
            </Space>
          </List.Item>
        )}
      />
    );
  };

  // 渲染标签建议
  const renderTagSuggestions = () => {
    if (!classification || classification.suggestedTags.length === 0) {
      return <Empty description="暂无标签建议" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }

    return (
      <div className={styles.tagSuggestions}>
        {classification.suggestedTags.map((item: AITagSuggestion) => (
          <Tooltip key={item.tag} title={`来源: ${item.source}, 置信度: ${Math.round(item.confidence * 100)}%`}>
            <Tag
              className={`${styles.tagItem} ${selectedTags.includes(item.tag) ? styles.selected : ''}`}
              color={selectedTags.includes(item.tag) ? 'blue' : 'default'}
              onClick={() => {
                if (selectedTags.includes(item.tag)) {
                  handleRemoveTag(item.tag);
                } else {
                  setSelectedTags([...selectedTags, item.tag]);
                }
              }}
            >
              {item.tag}
              <Badge
                count={`${Math.round(item.confidence * 100)}%`}
                style={{
                  backgroundColor: getConfidenceColor(item.confidence),
                  marginLeft: 4,
                  fontSize: 10
                }}
              />
            </Tag>
          </Tooltip>
        ))}
      </div>
    );
  };

  // 渲染已选标签
  const renderSelectedTags = () => (
    <div className={styles.selectedTags}>
      {selectedTags.map(tag => (
        <Tag
          key={tag}
          closable
          onClose={() => handleRemoveTag(tag)}
          color="blue"
        >
          {tag}
        </Tag>
      ))}
      <Input
        size="small"
        placeholder="添加标签"
        value={newTag}
        onChange={e => setNewTag(e.target.value)}
        onPressEnter={handleAddTag}
        style={{ width: 100 }}
        suffix={
          <PlusOutlined
            style={{ cursor: 'pointer' }}
            onClick={handleAddTag}
          />
        }
      />
    </div>
  );

  // 渲染内容摘要
  const renderContentSummary = () => {
    if (!classification?.contentSummary) return null;

    return (
      <div className={styles.summary}>
        <Title level={5}>
          <BulbOutlined /> 内容摘要
        </Title>
        <Paragraph ellipsis={{ rows: 3, expandable: true }}>
          {classification.contentSummary}
        </Paragraph>
        {classification.keyPhrases && classification.keyPhrases.length > 0 && (
          <div className={styles.keyPhrases}>
            <Text type="secondary">关键词：</Text>
            {classification.keyPhrases.map(phrase => (
              <Tag key={phrase} color="cyan">{phrase}</Tag>
            ))}
          </div>
        )}
      </div>
    );
  };

  const content = (
    <div className={styles.content}>
      {/* 文件信息 */}
      <div className={styles.fileInfo}>
        <Text strong>{fileName}</Text>
        {classification?.language && (
          <Tag color="purple">{classification.language}</Tag>
        )}
      </div>

      {loading ? (
        <div className={styles.loading}>
          <Spin tip="AI正在分析文件内容..." />
        </div>
      ) : classification ? (
        <>
          {/* 内容摘要 */}
          {renderContentSummary()}

          <Divider />

          {/* 分类建议 */}
          <div className={styles.section}>
            <Title level={5}>
              <FolderOutlined /> 分类建议
            </Title>
            {renderCategorySuggestions()}
          </div>

          <Divider />

          {/* 标签建议 */}
          <div className={styles.section}>
            <Title level={5}>
              <TagOutlined /> 标签建议
            </Title>
            {renderTagSuggestions()}
          </div>

          <Divider />

          {/* 已选标签 */}
          <div className={styles.section}>
            <Title level={5}>已选标签</Title>
            {renderSelectedTags()}
          </div>
        </>
      ) : (
        <div className={styles.empty}>
          <Empty description="点击下方按钮获取AI分类建议" />
          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            onClick={fetchClassification}
            loading={loading}
          >
            获取AI建议
          </Button>
        </div>
      )}

      {/* 操作按钮 */}
      {classification && (
        <div className={styles.actions}>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchClassification}
              loading={loading}
            >
              重新分析
            </Button>
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setFeedbackCategory(selectedCategory || '');
                setFeedbackTags(selectedTags);
                setShowFeedback(true);
              }}
            >
              纠正反馈
            </Button>
          </Space>
          <Space>
            {onClose && (
              <Button onClick={onClose}>取消</Button>
            )}
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={handleApply}
              loading={applying}
            >
              应用分类
            </Button>
          </Space>
        </div>
      )}

      {/* 反馈弹窗 */}
      <Modal
        title="纠正AI分类"
        open={showFeedback}
        onCancel={() => setShowFeedback(false)}
        onOk={handleFeedback}
        okText="提交反馈"
      >
        <div className={styles.feedbackForm}>
          <div className={styles.formItem}>
            <Text>正确分类：</Text>
            <Select
              value={feedbackCategory}
              onChange={setFeedbackCategory}
              placeholder="选择正确的分类"
              style={{ width: '100%' }}
              allowClear
            >
              {categories.map(cat => (
                <Select.Option key={cat.id} value={cat.name}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div className={styles.formItem}>
            <Text>正确标签：</Text>
            <Select
              mode="tags"
              value={feedbackTags}
              onChange={setFeedbackTags}
              placeholder="输入或选择正确的标签"
              style={{ width: '100%' }}
            >
              {allTags.map(tag => (
                <Select.Option key={tag.id} value={tag.name}>
                  {tag.name}
                </Select.Option>
              ))}
            </Select>
          </div>
          <Text type="secondary">
            您的反馈将帮助AI更好地理解文件内容，提高分类准确性。
          </Text>
        </div>
      </Modal>
    </div>
  );

  if (showCard) {
    return (
      <Card
        className={styles.container}
        title={
          <Space>
            <RobotOutlined />
            <span>AI智能分类</span>
          </Space>
        }
      >
        {content}
      </Card>
    );
  }

  return content;
};

export default AIClassifier;