import { Card, Col, Row, Statistic } from 'antd';
import {
  ArrowUpOutlined,
  UserOutlined,
  TeamOutlined,
  ProjectOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <PageContainer
      title="数据概览"
      subTitle="实时监控关键运营指标"
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={12345}
              prefix={<UserOutlined />}
              suffix={
                <span style={{ fontSize: 14, color: '#52c41a' }}>
                  <ArrowUpOutlined /> 12.5%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="活跃用户"
              value={8901}
              prefix={<UserOutlined />}
              suffix={
                <span style={{ fontSize: 14, color: '#52c41a' }}>
                  <ArrowUpOutlined /> 8.3%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="租户数量"
              value={456}
              prefix={<TeamOutlined />}
              suffix={
                <span style={{ fontSize: 14, color: '#52c41a' }}>
                  <ArrowUpOutlined /> 5.6%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="AI调用量"
              value={98765}
              prefix={<RobotOutlined />}
              suffix="次/天"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="用户增长趋势" bordered={false}>
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#999' }}>图表组件待开发</p>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="套餐分布" bordered={false}>
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#999' }}>图表组件待开发</p>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="最近活动" bordered={false}>
            <div style={{ padding: 20 }}>
              <p>✅ 项目基础架构已完成</p>
              <p>🚀 等待后端API接口开发</p>
              <p>📊 等待接入真实数据</p>
            </div>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Dashboard;