import {
  RobotOutlined,
  TeamOutlined,
  BarChartOutlined,
  SafetyCertificateOutlined,
  AppstoreOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useModel, history } from '@umijs/max';
import { Card, theme, Row, Col, Button, Space } from 'antd';
import React from 'react';

/**
 * 功能卡片组件
 */
const FeatureCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  desc: string;
  href: string;
  color: string;
}> = ({ title, href, icon, desc, color }) => {
  const { token } = theme.useToken();

  return (
    <Card
      hoverable
      style={{
        borderRadius: '12px',
        height: '100%',
        border: '1px solid #E2E8F0',
        transition: 'all 0.3s ease',
      }}
      styles={{
        body: {
          padding: '24px',
        },
      }}
      onClick={() => history.push(href)}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '12px',
          background: `linear-gradient(135deg, ${color}15 0%, ${color}25 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
          fontSize: 24,
          color: color,
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: token.colorText,
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: '14px',
          color: token.colorTextSecondary,
          lineHeight: '22px',
        }}
      >
        {desc}
      </div>
    </Card>
  );
};

/**
 * 统计卡片组件
 */
const StatCard: React.FC<{
  title: string;
  value: string;
  trend?: string;
  color: string;
}> = ({ title, value, trend, color }) => {
  return (
    <div
      style={{
        padding: '20px 24px',
        background: `linear-gradient(135deg, ${color}08 0%, ${color}15 100%)`,
        borderRadius: '12px',
        border: `1px solid ${color}20`,
      }}
    >
      <div style={{ fontSize: 14, color: '#64748B', marginBottom: 8 }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color }}>{value}</span>
        {trend && (
          <span style={{ fontSize: 12, color: '#22C55E', fontWeight: 500 }}>{trend}</span>
        )}
      </div>
    </div>
  );
};

const Welcome: React.FC = () => {
  const { token } = theme.useToken();
  const { initialState } = useModel('@@initialState');
  
  return (
    <PageContainer
      header={{
        title: '工作台',
        subTitle: '欢迎使用摩塔管理后台',
      }}
    >
      {/* 欢迎横幅 */}
      <Card
        style={{
          borderRadius: 12,
          marginBottom: 24,
          border: 'none',
          background: 'linear-gradient(135deg, #047857 0%, #10B981 50%, #0d9488 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
        styles={{
          body: {
            padding: '40px',
            position: 'relative',
            zIndex: 1,
          },
        }}
      >
        {/* 背景装饰 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '50%',
            height: '100%',
            background: 'radial-gradient(circle at 80% 50%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            right: '10%',
            transform: 'translateY(-50%)',
            width: '200px',
            height: '200px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(40px)',
          }}
        />
        
        <Row align="middle" gutter={24}>
          <Col flex="1">
            <div
              style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#fff',
                marginBottom: 12,
              }}
            >
              欢迎回来，{initialState?.currentUser?.name || '管理员'} 👋
            </div>
            <p
              style={{
                fontSize: '16px',
                color: 'rgba(255, 255, 255, 0.85)',
                lineHeight: '1.8',
                marginBottom: 24,
                maxWidth: '600px',
              }}
            >
              摩塔管理后台提供完整的租户管理、用户管理、内容审核、AI调度等企业级SaaS运营功能，
              助力企业高效运营和智能化转型。
            </p>
            <Space size={12}>
              <Button
                type="primary"
                size="large"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                }}
                onClick={() => history.push('/dashboard/overview')}
              >
                查看数据概览
              </Button>
              <Button
                size="large"
                style={{
                  background: '#fff',
                  color: '#10B981',
                  borderColor: '#fff',
                }}
                onClick={() => history.push('/tenant/list')}
              >
                租户管理
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 快速统计 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <StatCard title="总用户数" value="12,345" trend="+12.5%" color="#10B981" />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard title="活跃租户" value="456" trend="+8.3%" color="#0EA5E9" />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard title="今日AI调用" value="98,765" color="#F59E0B" />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard title="系统可用率" value="99.9%" color="#22C55E" />
        </Col>
      </Row>

      {/* 功能入口 */}
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, color: token.colorText, marginBottom: 16 }}>
          快速导航
        </h3>
      </div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <FeatureCard
            icon={<TeamOutlined />}
            title="租户管理"
            href="/tenant/list"
            desc="管理平台租户，查看租户详情、套餐配置和使用统计，支持租户的创建、编辑和停用操作。"
            color="#10B981"
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <FeatureCard
            icon={<RobotOutlined />}
            title="AI服务管理"
            href="/ai/model-list"
            desc="管理AI模型配置，监控API调用量和成本，设置调用限额和计费规则。"
            color="#0EA5E9"
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <FeatureCard
            icon={<BarChartOutlined />}
            title="数据分析"
            href="/dashboard/analysis"
            desc="深度数据分析，用户行为漏斗、留存分析、热力图和多维度报表。"
            color="#F59E0B"
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <FeatureCard
            icon={<FileTextOutlined />}
            title="内容审核"
            href="/content/audit"
            desc="内容安全审核，新闻稿件管理，模板配置，支持AI辅助审核。"
            color="#8B5CF6"
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <FeatureCard
            icon={<SafetyCertificateOutlined />}
            title="系统监控"
            href="/dashboard/monitor"
            desc="实时系统监控，CPU、内存使用率，API请求统计，服务状态和告警管理。"
            color="#EF4444"
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <FeatureCard
            icon={<AppstoreOutlined />}
            title="套餐管理"
            href="/tenant/package-list"
            desc="管理服务套餐，配置功能模块、使用配额和定价策略。"
            color="#F97316"
          />
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Welcome;
