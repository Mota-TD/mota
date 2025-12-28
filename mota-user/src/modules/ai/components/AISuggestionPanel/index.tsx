/**
 * AI 建议展示面板组件
 * 展示各类 AI 建议，包括分工推荐、风险预警、进度预测等
 */

import React, { useCallback, useMemo } from 'react';
import {
  Card,
  List,
  Tag,
  Button,
  Space,
  Typography,
  Avatar,
  Progress,
  Tooltip,
  Empty,
  Spin,
  Badge,
  Collapse,
  Alert,
} from 'antd';
import {
  UserOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  TeamOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useAIStore } from '../../store/aiStore';
import { useAssignmentRecommendation, useSortedRecommendations } from '../../hooks/useAssignmentRecommendation';
import type { AssignmentRecommendation, RiskWarning, ProgressPrediction } from '../../types';
import styles from './index.module.css';

const { Text, Title, Paragraph } = Typography;
const { Panel } = Collapse;

export interface AISuggestionPanelProps {
  projectId?: string;
  taskId?: string;
  showAssignment?: boolean;
  showRisk?: boolean;
  showProgress?: boolean;
  showWorkSuggestions?: boolean;
  onAssign?: (userId: string) => void;
  compact?: boolean;
}

/**
 * AI 建议展示面板
 */
const AISuggestionPanel: React.FC<AISuggestionPanelProps> = ({
  projectId,
  taskId,
  showAssignment = true,
  showRisk = true,
  showProgress = true,
  showWorkSuggestions = true,
  onAssign,
  compact = false,
}) => {
  // 从 Store 获取数据
  const progressPrediction = useAIStore((state) => state.progressPrediction);
  const progressLoading = useAIStore((state) => state.progressLoading);
  const riskWarnings = useAIStore((state) => state.riskWarnings);
  const riskLoading = useAIStore((state) => state.riskLoading);
  const workSuggestions = useAIStore((state) => state.workSuggestions);
  const suggestionsLoading = useAIStore((state) => state.suggestionsLoading);

  // 分工推荐
  const {
    loading: assignmentLoading,
    recommendations,
    bestMatch,
    assignToUser,
  } = useAssignmentRecommendation({ taskId, onAssign });

  // 排序后的推荐
  const sortedRecommendations = useSortedRecommendations(recommendations, 'matchScore');

  // 渲染分工推荐
  const renderAssignmentRecommendations = () => {
    if (!showAssignment) return null;

    return (
      <Card
        title={
          <Space>
            <TeamOutlined />
            <span>智能分工推荐</span>
            {recommendations.length > 0 && (
              <Badge count={recommendations.length} style={{ backgroundColor: '#52c41a' }} />
            )}
          </Space>
        }
        size={compact ? 'small' : 'default'}
        className={styles.suggestionCard}
      >
        {assignmentLoading ? (
          <div className={styles.loadingContainer}>
            <Spin />
          </div>
        ) : recommendations.length === 0 ? (
          <Empty description="暂无分工推荐" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <>
            {bestMatch && (
              <Alert
                type="success"
                icon={<ThunderboltOutlined />}
                message={
                  <Space>
                    <Text strong>最佳匹配：</Text>
                    <Text>{bestMatch.userName}</Text>
                    <Tag color="green">匹配度 {bestMatch.matchScore}%</Tag>
                  </Space>
                }
                description={bestMatch.reason}
                style={{ marginBottom: 16 }}
              />
            )}
            <List
              dataSource={sortedRecommendations}
              renderItem={(item: AssignmentRecommendation) => (
                <List.Item
                  actions={[
                    <Button
                      key="assign"
                      type="primary"
                      size="small"
                      onClick={() => assignToUser(item.userId)}
                    >
                      分配
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar icon={<UserOutlined />} src={item.userAvatar} />
                    }
                    title={
                      <Space>
                        <Text>{item.userName}</Text>
                        <Tag
                          color={
                            item.availability === 'available'
                              ? 'green'
                              : item.availability === 'busy'
                              ? 'orange'
                              : 'red'
                          }
                        >
                          {item.availability === 'available'
                            ? '空闲'
                            : item.availability === 'busy'
                            ? '忙碌'
                            : '超负荷'}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={4}>
                        <Space>
                          <Text type="secondary">匹配度：</Text>
                          <Progress
                            percent={item.matchScore}
                            size="small"
                            style={{ width: 100 }}
                            strokeColor={
                              item.matchScore >= 80
                                ? '#52c41a'
                                : item.matchScore >= 50
                                ? '#1890ff'
                                : '#faad14'
                            }
                          />
                        </Space>
                        <Space>
                          <Text type="secondary">当前负载：</Text>
                          <Progress
                            percent={item.currentWorkload}
                            size="small"
                            style={{ width: 100 }}
                            strokeColor={
                              item.currentWorkload < 50
                                ? '#52c41a'
                                : item.currentWorkload < 80
                                ? '#faad14'
                                : '#ff4d4f'
                            }
                          />
                        </Space>
                        <Text type="secondary">{item.reason}</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </>
        )}
      </Card>
    );
  };

  // 渲染风险预警
  const renderRiskWarnings = () => {
    if (!showRisk) return null;

    const severityConfig = {
      low: { color: 'blue', icon: <InfoCircleOutlined /> },
      medium: { color: 'orange', icon: <ExclamationCircleOutlined /> },
      high: { color: 'red', icon: <WarningOutlined /> },
      critical: { color: 'magenta', icon: <WarningOutlined /> },
    };

    return (
      <Card
        title={
          <Space>
            <WarningOutlined />
            <span>风险预警</span>
            {riskWarnings.length > 0 && (
              <Badge count={riskWarnings.length} style={{ backgroundColor: '#ff4d4f' }} />
            )}
          </Space>
        }
        size={compact ? 'small' : 'default'}
        className={styles.suggestionCard}
      >
        {riskLoading ? (
          <div className={styles.loadingContainer}>
            <Spin />
          </div>
        ) : riskWarnings.length === 0 ? (
          <Empty description="暂无风险预警" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <Collapse ghost>
            {riskWarnings.map((warning: RiskWarning) => (
              <Panel
                key={warning.id}
                header={
                  <Space>
                    {severityConfig[warning.severity].icon}
                    <Text>{warning.title}</Text>
                    <Tag color={severityConfig[warning.severity].color}>
                      {warning.severity === 'low'
                        ? '低'
                        : warning.severity === 'medium'
                        ? '中'
                        : warning.severity === 'high'
                        ? '高'
                        : '严重'}
                    </Tag>
                  </Space>
                }
              >
                <Paragraph>{warning.description}</Paragraph>
                {warning.suggestions.length > 0 && (
                  <div>
                    <Text strong>建议措施：</Text>
                    <ul>
                      {warning.suggestions.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </Panel>
            ))}
          </Collapse>
        )}
      </Card>
    );
  };

  // 渲染进度预测
  const renderProgressPrediction = () => {
    if (!showProgress || !progressPrediction) return null;

    const prediction = progressPrediction as ProgressPrediction;
    const progressDiff = prediction.predictedProgress - prediction.currentProgress;

    return (
      <Card
        title={
          <Space>
            <RiseOutlined />
            <span>进度预测</span>
          </Space>
        }
        size={compact ? 'small' : 'default'}
        className={styles.suggestionCard}
      >
        {progressLoading ? (
          <div className={styles.loadingContainer}>
            <Spin />
          </div>
        ) : (
          <div className={styles.predictionContent}>
            <div className={styles.progressRow}>
              <div className={styles.progressItem}>
                <Text type="secondary">当前进度</Text>
                <Progress
                  type="circle"
                  percent={prediction.currentProgress}
                  size={80}
                />
              </div>
              <div className={styles.progressArrow}>→</div>
              <div className={styles.progressItem}>
                <Text type="secondary">预测进度</Text>
                <Progress
                  type="circle"
                  percent={prediction.predictedProgress}
                  size={80}
                  strokeColor={progressDiff >= 0 ? '#52c41a' : '#ff4d4f'}
                />
              </div>
            </div>
            <div className={styles.predictionInfo}>
              <Space direction="vertical" size={8}>
                <Space>
                  <ClockCircleOutlined />
                  <Text>预计完成日期：</Text>
                  <Text strong>{prediction.predictedCompletionDate}</Text>
                </Space>
                <Space>
                  <CheckCircleOutlined />
                  <Text>置信度：</Text>
                  <Progress
                    percent={prediction.confidence}
                    size="small"
                    style={{ width: 100 }}
                  />
                </Space>
              </Space>
            </div>
            {prediction.factors.length > 0 && (
              <div className={styles.factors}>
                <Text type="secondary">影响因素：</Text>
                <div className={styles.factorTags}>
                  {prediction.factors.map((factor, i) => (
                    <Tag key={i}>{factor}</Tag>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    );
  };

  // 渲染工作建议
  const renderWorkSuggestions = () => {
    if (!showWorkSuggestions) return null;

    const unreadCount = workSuggestions.filter((s) => !s.isRead).length;

    return (
      <Card
        title={
          <Space>
            <BulbOutlined />
            <span>工作建议</span>
            {unreadCount > 0 && (
              <Badge count={unreadCount} style={{ backgroundColor: '#1890ff' }} />
            )}
          </Space>
        }
        size={compact ? 'small' : 'default'}
        className={styles.suggestionCard}
      >
        {suggestionsLoading ? (
          <div className={styles.loadingContainer}>
            <Spin />
          </div>
        ) : workSuggestions.length === 0 ? (
          <Empty description="暂无工作建议" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <List
            dataSource={workSuggestions.slice(0, 5)}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Avatar
                      style={{
                        backgroundColor: item.isRead ? '#d9d9d9' : '#1890ff',
                      }}
                      icon={<BulbOutlined />}
                    />
                  }
                  title={
                    <Space>
                      <Text strong={!item.isRead}>{item.suggestionTitle}</Text>
                      {!item.isRead && <Badge status="processing" />}
                    </Space>
                  }
                  description={
                    <Paragraph
                      ellipsis={{ rows: 2 }}
                      type="secondary"
                    >
                      {item.suggestionContent}
                    </Paragraph>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    );
  };

  return (
    <div className={styles.container}>
      {renderAssignmentRecommendations()}
      {renderRiskWarnings()}
      {renderProgressPrediction()}
      {renderWorkSuggestions()}
    </div>
  );
};

export default AISuggestionPanel;