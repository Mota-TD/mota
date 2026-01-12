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
  Steps,
  Empty,
  Spin,
  Tag,
  Avatar,
  List,
  Divider,
  Select,
  Slider,
  Radio,
  message,
} from 'antd';
import {
  FilePptOutlined,
  RobotOutlined,
  SendOutlined,
  DownloadOutlined,
  EyeOutlined,
  HistoryOutlined,
  BulbOutlined,
  FileTextOutlined,
  PictureOutlined,
  LayoutOutlined,
  ThunderboltOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { aiService, type PPTHistory } from '@/services';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// 统一主题色 - 薄荷绿
const THEME_COLOR = '#10B981';

// PPT模板配置
const pptTemplates = [
  { id: '1', name: '商务简约', color: '#3B82F6', icon: <LayoutOutlined /> },
  { id: '2', name: '科技风格', color: '#8B5CF6', icon: <ThunderboltOutlined /> },
  { id: '3', name: '清新自然', color: '#10B981', icon: <PictureOutlined /> },
  { id: '4', name: '创意设计', color: '#F59E0B', icon: <BulbOutlined /> },
];

export default function AIPPTPage() {
  const [inputText, setInputText] = useState('');
  const [generating, setGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState('1');
  const [pageCount, setPageCount] = useState(10);
  const [style, setStyle] = useState('professional');
  const [historyItems, setHistoryItems] = useState<PPTHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [generatedPPT, setGeneratedPPT] = useState<{ url: string; title: string } | null>(null);

  // 获取历史记录
  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const data = await aiService.getPPTHistory();
      setHistoryItems(data);
    } catch (error) {
      console.error('Failed to fetch PPT history:', error);
      setHistoryItems([]);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      message.warning('请输入PPT主题或内容');
      return;
    }

    setGenerating(true);
    setCurrentStep(1);
    setGeneratedPPT(null);

    try {
      // 调用AI生成PPT API
      const result = await aiService.generatePPT({
        content: inputText,
        templateId: selectedTemplate,
        pageCount,
        style,
      });
      
      setCurrentStep(3);
      setGeneratedPPT(result);
      message.success('PPT生成成功！');
      fetchHistory(); // 刷新历史记录
    } catch (error) {
      console.error('Failed to generate PPT:', error);
      message.error('PPT生成失败，请稍后重试');
      setCurrentStep(0);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      {/* 页面头部 */}
      <div style={{
        background: `linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)`,
        borderRadius: 16,
        padding: '24px 32px',
        marginBottom: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <FilePptOutlined style={{ fontSize: 28, color: '#fff' }} />
          </div>
          <div>
            <Title level={3} style={{ color: '#fff', margin: 0 }}>AI PPT 生成</Title>
            <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
              输入主题或内容，AI 自动生成专业演示文稿
            </Text>
          </div>
        </div>
      </div>

      <Row gutter={24}>
        {/* 左侧 - 输入区域 */}
        <Col xs={24} lg={16}>
          <Card style={{ borderRadius: 12, marginBottom: 24 }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <RobotOutlined style={{ color: THEME_COLOR, fontSize: 20 }} />
                <Text strong style={{ fontSize: 16 }}>描述您的PPT需求</Text>
              </div>
              <TextArea
                placeholder="例如：帮我生成一份关于2024年度工作总结的PPT，包含工作成果、项目进展、团队建设、明年规划等内容..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                autoSize={{ minRows: 4, maxRows: 8 }}
                style={{ fontSize: 15 }}
              />
            </div>

            {/* 配置选项 */}
            <div style={{ marginBottom: 24 }}>
              <Text strong style={{ display: 'block', marginBottom: 12 }}>选择模板风格</Text>
              <div style={{ display: 'flex', gap: 12 }}>
                {pptTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    style={{
                      flex: 1,
                      padding: '16px 12px',
                      borderRadius: 12,
                      border: selectedTemplate === template.id ? `2px solid ${template.color}` : '2px solid #E2E8F0',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s',
                      background: selectedTemplate === template.id ? `${template.color}10` : '#fff',
                    }}
                  >
                    <div style={{ color: template.color, fontSize: 24, marginBottom: 8 }}>
                      {template.icon}
                    </div>
                    <Text style={{ color: selectedTemplate === template.id ? template.color : '#64748B' }}>
                      {template.name}
                    </Text>
                  </div>
                ))}
              </div>
            </div>

            <Row gutter={24} style={{ marginBottom: 24 }}>
              <Col span={12}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>页数设置</Text>
                <Slider
                  min={5}
                  max={30}
                  value={pageCount}
                  onChange={setPageCount}
                  marks={{ 5: '5页', 15: '15页', 30: '30页' }}
                />
              </Col>
              <Col span={12}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>内容风格</Text>
                <Radio.Group value={style} onChange={(e) => setStyle(e.target.value)}>
                  <Radio.Button value="professional">专业正式</Radio.Button>
                  <Radio.Button value="creative">创意活泼</Radio.Button>
                  <Radio.Button value="simple">简洁明了</Radio.Button>
                </Radio.Group>
              </Col>
            </Row>

            <Button
              type="primary"
              size="large"
              icon={<SendOutlined />}
              onClick={handleGenerate}
              loading={generating}
              style={{ background: THEME_COLOR, borderColor: THEME_COLOR }}
            >
              {generating ? '生成中...' : '开始生成'}
            </Button>
          </Card>

          {/* 生成进度 */}
          {generating && (
            <Card style={{ borderRadius: 12 }}>
              <Steps
                current={currentStep}
                items={[
                  { title: '分析内容', description: '理解您的需求' },
                  { title: '生成大纲', description: '规划PPT结构' },
                  { title: '设计页面', description: '生成精美页面' },
                  { title: '完成', description: '准备下载' },
                ]}
              />
            </Card>
          )}

          {/* 生成结果预览 */}
          {currentStep === 3 && !generating && generatedPPT && (
            <Card
              title={
                <Space>
                  <FileTextOutlined style={{ color: THEME_COLOR }} />
                  生成结果
                </Space>
              }
              style={{ borderRadius: 12 }}
              extra={
                <Space>
                  <Button icon={<EyeOutlined />} onClick={() => window.open(generatedPPT.url, '_blank')}>预览</Button>
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    style={{ background: THEME_COLOR, borderColor: THEME_COLOR }}
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = generatedPPT.url;
                      link.download = generatedPPT.title + '.pptx';
                      link.click();
                    }}
                  >
                    下载PPT
                  </Button>
                </Space>
              }
            >
              <div style={{
                background: '#F8FAFC',
                borderRadius: 12,
                padding: 24,
                textAlign: 'center',
                minHeight: 200,
              }}>
                <FilePptOutlined style={{ fontSize: 64, color: '#3B82F6', marginBottom: 16 }} />
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{generatedPPT.title}</div>
                <Text type="secondary">共 {pageCount} 页，使用 {pptTemplates.find(t => t.id === selectedTemplate)?.name} 模板</Text>
              </div>
            </Card>
          )}
        </Col>

        {/* 右侧 - 历史记录 */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <HistoryOutlined style={{ color: THEME_COLOR }} />
                生成历史
              </Space>
            }
            style={{ borderRadius: 12 }}
          >
            {loadingHistory ? (
              <div style={{ textAlign: 'center', padding: 24 }}>
                <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
              </div>
            ) : historyItems.length === 0 ? (
              <Empty description="暂无生成历史" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <List
                dataSource={historyItems}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button
                        key="download"
                        type="link"
                        size="small"
                        icon={<DownloadOutlined />}
                        onClick={() => {
                          if (item.url) {
                            const link = document.createElement('a');
                            link.href = item.url;
                            link.download = item.title + '.pptx';
                            link.click();
                          }
                        }}
                      >
                        下载
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar style={{ backgroundColor: '#3B82F6' }} icon={<FilePptOutlined />} />
                      }
                      title={item.title}
                      description={
                        <Space>
                          <Tag>{item.pages}页</Tag>
                          <Text type="secondary" style={{ fontSize: 12 }}>{item.createdAt}</Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>

          {/* 使用提示 */}
          <Card
            title={
              <Space>
                <BulbOutlined style={{ color: '#F59E0B' }} />
                使用提示
              </Space>
            }
            style={{ borderRadius: 12, marginTop: 16 }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: `${THEME_COLOR}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: THEME_COLOR,
                  fontSize: 12,
                  fontWeight: 600,
                }}>
                  1
                </div>
                <Text type="secondary">详细描述PPT主题和内容要点</Text>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: `${THEME_COLOR}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: THEME_COLOR,
                  fontSize: 12,
                  fontWeight: 600,
                }}>
                  2
                </div>
                <Text type="secondary">选择合适的模板风格</Text>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: `${THEME_COLOR}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: THEME_COLOR,
                  fontSize: 12,
                  fontWeight: 600,
                }}>
                  3
                </div>
                <Text type="secondary">根据需要调整页数和内容风格</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}