import { PlusOutlined, SaveOutlined, SendOutlined } from '@ant-design/icons';
import {
  PageContainer,
  ProCard,
  ProForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { history, useParams } from '@umijs/max';
import type { UploadFile } from 'antd';
import { Button, Image, Input, message, Space, Tag, Upload } from 'antd';
import React, { useState } from 'react';

/**
 * 新闻编辑页面
 * 包括基本信息表单、简化的内容编辑器、封面图上传、标签管理等
 */
const NewsEdit: React.FC = () => {
  const params = useParams<{ id: string }>();
  const isNew = params.id === 'new';
  const [coverImage, setCoverImage] = useState<string>('');
  const [tags, setTags] = useState<string[]>(['AI', '产品']);
  const [inputTag, setInputTag] = useState<string>('');

  // 模拟已有新闻数据
  const initialValues = isNew
    ? {}
    : {
        title: '企业AI转型白皮书发布：数字化时代的智能升级之路',
        summary:
          '本白皮书详细阐述了企业在AI转型过程中的关键要素、实施路径和成功案例，为企业数字化转型提供全面指导。',
        content: `# 企业AI转型白皮书

## 一、引言

在数字化时代，人工智能(AI)技术正在深刻改变企业的运营模式和竞争格局。本白皮书旨在为企业提供一份全面的AI转型指南。

## 二、AI转型的关键要素

### 1. 战略规划
企业需要制定清晰的AI战略，明确转型目标和路径。

### 2. 技术基础
建立坚实的技术基础设施，包括数据平台、算力支持等。

### 3. 人才队伍
培养和引进AI专业人才，建立创新团队。

## 三、实施路径

1. 评估现状：了解企业当前的数字化水平
2. 制定策略：设计符合企业特点的转型方案
3. 试点实施：选择关键业务场景进行试点
4. 全面推广：在成功试点基础上推广到全企业
5. 持续优化：建立持续改进机制

## 四、成功案例

本白皮书收录了多个行业领先企业的AI转型成功案例，为其他企业提供借鉴。

## 五、总结

AI转型是一个持续的过程，企业需要保持学习和创新的态度，不断适应技术发展的新趋势。`,
        category: '行业动态',
        author: '张三',
        coverImage:
          'https://gw.alipayobjects.com/zos/antfincdn/LlvErxo8H9/photo-1503185912284-5271ff81b9a8.webp',
      };

  // 处理封面图上传
  const handleUploadChange = (info: { fileList: UploadFile[] }) => {
    if (info.fileList.length > 0) {
      const file = info.fileList[0];
      if (file.status === 'done') {
        // 实际项目中这里应该是服务器返回的URL
        setCoverImage(
          file.response?.url ||
            'https://gw.alipayobjects.com/zos/antfincdn/LlvErxo8H9/photo-1503185912284-5271ff81b9a8.webp',
        );
        message.success('上传成功');
      }
    }
  };

  // 添加标签
  const handleAddTag = () => {
    if (inputTag && !tags.includes(inputTag)) {
      setTags([...tags, inputTag]);
      setInputTag('');
    }
  };

  // 删除标签
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  // 保存草稿
  const handleSaveDraft = async (values: any) => {
    console.log('保存草稿:', { ...values, tags, coverImage });
    message.success('保存草稿成功');
  };

  // 发布新闻
  const handlePublish = async (values: any) => {
    console.log('发布新闻:', { ...values, tags, coverImage });
    message.success('发布成功');
    setTimeout(() => {
      history.push('/content/news-list');
    }, 1000);
  };

  return (
    <PageContainer
      title={isNew ? '新建新闻' : '编辑新闻'}
      extra={[
        <Button
          key="cancel"
          onClick={() => {
            history.push('/content/news-list');
          }}
        >
          取消
        </Button>,
      ]}
    >
      <ProForm
        initialValues={initialValues}
        submitter={{
          render: (props, _doms) => {
            return (
              <Space style={{ width: '100%', justifyContent: 'center' }}>
                <Button
                  type="default"
                  icon={<SaveOutlined />}
                  onClick={() => props.form?.submit()}
                >
                  保存草稿
                </Button>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={async () => {
                    const values = await props.form?.validateFields();
                    handlePublish(values);
                  }}
                >
                  发布新闻
                </Button>
              </Space>
            );
          },
        }}
        onFinish={handleSaveDraft}
      >
        {/* 基本信息 */}
        <ProCard title="基本信息" bordered style={{ marginBottom: 16 }}>
          <ProFormText
            name="title"
            label="新闻标题"
            placeholder="请输入新闻标题"
            rules={[
              { required: true, message: '请输入新闻标题' },
              { max: 100, message: '标题不能超过100个字符' },
            ]}
            fieldProps={{
              showCount: true,
              maxLength: 100,
            }}
          />

          <ProFormTextArea
            name="summary"
            label="新闻摘要"
            placeholder="请输入新闻摘要（建议150字以内）"
            rules={[
              { required: true, message: '请输入新闻摘要' },
              { max: 200, message: '摘要不能超过200个字符' },
            ]}
            fieldProps={{
              rows: 3,
              showCount: true,
              maxLength: 200,
            }}
          />

          <ProFormSelect
            name="category"
            label="新闻分类"
            placeholder="请选择新闻分类"
            rules={[{ required: true, message: '请选择新闻分类' }]}
            options={[
              { label: '行业动态', value: '行业动态' },
              { label: '产品更新', value: '产品更新' },
              { label: '案例分析', value: '案例分析' },
              { label: '公告通知', value: '公告通知' },
            ]}
          />

          <ProFormText
            name="author"
            label="作者"
            placeholder="请输入作者姓名"
            rules={[{ required: true, message: '请输入作者姓名' }]}
          />
        </ProCard>

        {/* 封面图片 */}
        <ProCard title="封面图片" bordered style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 16 }}>
            <Upload
              name="cover"
              listType="picture-card"
              showUploadList={false}
              action="/api/upload"
              onChange={handleUploadChange}
              beforeUpload={(file) => {
                const isImage = file.type.startsWith('image/');
                if (!isImage) {
                  message.error('只能上传图片文件！');
                }
                const isLt2M = file.size / 1024 / 1024 < 2;
                if (!isLt2M) {
                  message.error('图片大小不能超过2MB！');
                }
                return isImage && isLt2M;
              }}
            >
              {coverImage || initialValues.coverImage ? (
                <Image
                  src={coverImage || initialValues.coverImage}
                  alt="封面"
                  style={{ width: '100%', height: 200, objectFit: 'cover' }}
                  preview={false}
                />
              ) : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上传封面</div>
                </div>
              )}
            </Upload>
            <div style={{ color: '#999', fontSize: 12, marginTop: 8 }}>
              建议尺寸：1200x630px，支持jpg、png格式，大小不超过2MB
            </div>
          </div>
        </ProCard>

        {/* 新闻内容 */}
        <ProCard title="新闻内容" bordered style={{ marginBottom: 16 }}>
          <ProFormTextArea
            name="content"
            label="内容"
            placeholder="请输入新闻内容（支持Markdown格式）"
            rules={[{ required: true, message: '请输入新闻内容' }]}
            fieldProps={{
              rows: 20,
              showCount: true,
            }}
            extra={
              <div style={{ marginTop: 8 }}>
                <div style={{ color: '#999', fontSize: 12 }}>
                  支持Markdown格式，常用语法：
                </div>
                <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                  # 一级标题 | ## 二级标题 | **粗体** | *斜体* | [链接](url) |
                  ![图片](url)
                </div>
              </div>
            }
          />
        </ProCard>

        {/* 标签管理 */}
        <ProCard title="标签管理" bordered>
          <div style={{ marginBottom: 16 }}>
            <Space wrap>
              {tags.map((tag) => (
                <Tag
                  key={tag}
                  closable
                  onClose={() => handleRemoveTag(tag)}
                  color="blue"
                >
                  {tag}
                </Tag>
              ))}
            </Space>
          </div>
          <Space>
            <Input
              placeholder="输入标签名称"
              value={inputTag}
              onChange={(e) => setInputTag(e.target.value)}
              onPressEnter={handleAddTag}
              style={{ width: 200 }}
            />
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={handleAddTag}
            >
              添加标签
            </Button>
          </Space>
          <div style={{ color: '#999', fontSize: 12, marginTop: 8 }}>
            输入标签后按回车或点击添加按钮
          </div>
        </ProCard>
      </ProForm>
    </PageContainer>
  );
};

export default NewsEdit;
