import { LockOutlined, UserOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import {
  LoginForm,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { Helmet, history, SelectLang, useIntl, useModel } from '@umijs/max';
import { Alert, App } from 'antd';
import { createStyles } from 'antd-style';
import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import { login } from '@/services/auth';
import { saveLoginInfo } from '@/utils/token';
import Settings from '../../../../config/defaultSettings';

const useStyles = createStyles(({ token }) => {
  return {
    action: {
      marginLeft: '8px',
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: '24px',
      verticalAlign: 'middle',
      cursor: 'pointer',
      transition: 'color 0.3s',
      '&:hover': {
        color: '#fff',
      },
    },
    lang: {
      width: 42,
      height: 42,
      lineHeight: '42px',
      position: 'fixed',
      right: 16,
      top: 16,
      borderRadius: token.borderRadius,
      color: 'rgba(255, 255, 255, 0.8)',
      zIndex: 100,
      ':hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      },
    },
    container: {
      display: 'flex',
      flexDirection: 'row',
      height: '100vh',
      overflow: 'hidden',
    },
    // 左侧品牌区域
    brandSection: {
      flex: 1,
      background: 'linear-gradient(135deg, #047857 0%, #10B981 50%, #0d9488 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '60px',
      position: 'relative',
      overflow: 'hidden',
      // 网格背景
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
      },
      // 发光效果
      '&::after': {
        content: '""',
        position: 'absolute',
        top: '20%',
        left: '30%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
      },
    },
    brandContent: {
      maxWidth: '480px',
      position: 'relative',
      zIndex: 1,
      color: '#fff',
    },
    brandLogo: {
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      marginBottom: '40px',
    },
    logoIcon: {
      width: '48px',
      height: '48px',
      background: 'rgba(255, 255, 255, 0.2)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      color: '#fff',
      border: '1px solid rgba(255, 255, 255, 0.3)',
    },
    logoText: {
      fontSize: '28px',
      fontWeight: 700,
      background: 'linear-gradient(135deg, #fff 0%, #a0c4ff 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      letterSpacing: '-0.5px',
    },
    brandTitle: {
      fontSize: '40px',
      fontWeight: 700,
      lineHeight: 1.3,
      marginBottom: '20px',
      background: 'linear-gradient(135deg, #fff 0%, #6ee7b7 50%, #34d399 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    brandDesc: {
      fontSize: '16px',
      lineHeight: 1.8,
      color: 'rgba(255, 255, 255, 0.7)',
      marginBottom: '40px',
    },
    features: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
    },
    feature: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '16px',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      transition: 'all 0.3s ease',
      '&:hover': {
        background: 'rgba(255, 255, 255, 0.15)',
        transform: 'translateY(-2px)',
      },
    },
    featureIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '10px',
      background: 'rgba(255, 255, 255, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      color: '#fff',
    },
    featureText: {
      '& h4': {
        fontSize: '14px',
        fontWeight: 600,
        color: '#fff',
        margin: 0,
      },
      '& p': {
        fontSize: '12px',
        color: 'rgba(255, 255, 255, 0.6)',
        margin: 0,
      },
    },
    // 右侧表单区域
    formSection: {
      width: '480px',
      background: 'linear-gradient(180deg, #065f46 0%, #047857 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      position: 'relative',
      // 左边发光线
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '2px',
        height: '100%',
        background: 'linear-gradient(180deg, transparent, #6ee7b7, #fff, #6ee7b7, transparent)',
        animation: 'borderGlow 3s ease-in-out infinite',
      },
    },
    formWrapper: {
      width: '100%',
      maxWidth: '380px',
    },
    formCard: {
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '16px',
      padding: '40px 32px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    },
    formHeader: {
      textAlign: 'center' as const,
      marginBottom: '32px',
    },
    formTitle: {
      fontSize: '24px',
      fontWeight: 700,
      color: '#1E293B',
      marginBottom: '8px',
    },
    formSubtitle: {
      fontSize: '14px',
      color: '#64748B',
    },
    footer: {
      marginTop: '24px',
      textAlign: 'center' as const,
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: '12px',
    },
    '@keyframes borderGlow': {
      '0%, 100%': { opacity: 0.5 },
      '50%': { opacity: 1 },
    },
  };
});

const Lang = () => {
  const { styles } = useStyles();

  return (
    <div className={styles.lang} data-lang>
      {SelectLang && <SelectLang />}
    </div>
  );
};

// Logo SVG 组件
const LogoSvg = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="48" height="48" rx="10" fill="white" fillOpacity="0.2"/>
    <rect x="4" y="36" width="40" height="8" rx="2" fill="white" fillOpacity="0.35"/>
    <rect x="8" y="26" width="32" height="8" rx="2" fill="white" fillOpacity="0.35"/>
    <rect x="12" y="16" width="24" height="8" rx="2" fill="white" fillOpacity="0.35"/>
    <rect x="16" y="6" width="16" height="8" rx="2" fill="white" fillOpacity="0.35"/>
    <path d="M5 36 L5 6 L15 6 L24 18 L33 6 L43 6 L43 36 L35 36 L35 18 L24 34 L13 18 L13 36 Z" fill="white"/>
  </svg>
);

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
};

const Login: React.FC = () => {
  const [loginError, setLoginError] = useState<string>('');
  const [_loading, setLoading] = useState<boolean>(false);
  const { initialState, setInitialState } = useModel('@@initialState');
  const { styles } = useStyles();
  const { message } = App.useApp();
  const intl = useIntl();

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: userInfo,
        }));
      });
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setLoginError('');

    try {
      const response = await login({
        username: values.username,
        password: values.password,
        rememberMe: values.rememberMe,
      });

      if (response.code === 200 && response.data) {
        const { accessToken, refreshToken, expiresIn, userId, username, nickname, avatar, orgId, orgName } = response.data;

        // 保存token信息
        saveLoginInfo(accessToken, refreshToken, typeof expiresIn === 'string' ? parseInt(expiresIn) : expiresIn);

        // 直接从登录响应设置用户信息，不需要额外调用 current-user 接口
        const userInfo = {
          userid: userId,
          name: nickname || username,
          avatar: avatar || undefined,
          access: 'admin', // 默认管理员权限
          orgId,
          orgName,
        };

        // 更新 initialState 中的 currentUser
        flushSync(() => {
          setInitialState((s) => ({
            ...s,
            currentUser: userInfo,
          }));
        });

        const defaultLoginSuccessMessage = intl.formatMessage({
          id: 'pages.login.success',
          defaultMessage: '登录成功！',
        });
        message.success(defaultLoginSuccessMessage);

        // 跳转到首页或redirect参数指定的页面
        const urlParams = new URL(window.location.href).searchParams;
        const redirect = urlParams.get('redirect') || '/';
        history.push(redirect);

        return;
      } else {
        // 登录失败
        setLoginError(response.message || '登录失败，请检查用户名和密码');
      }
    } catch (error: any) {
      const defaultLoginFailureMessage = intl.formatMessage({
        id: 'pages.login.failure',
        defaultMessage: '登录失败，请重试！',
      });
      setLoginError(error?.message || defaultLoginFailureMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Helmet>
        <title>
          {intl.formatMessage({
            id: 'menu.login',
            defaultMessage: '登录',
          })}
          {Settings.title && ` - ${Settings.title}`}
        </title>
      </Helmet>
      <Lang />
      
      {/* 左侧品牌区域 */}
      <div className={styles.brandSection}>
        <div className={styles.brandContent}>
          <div className={styles.brandLogo}>
            <div className={styles.logoIcon}>
              <LogoSvg />
            </div>
            <span className={styles.logoText}>摩塔 Mota</span>
          </div>
          
          <h1 className={styles.brandTitle}>
            企业级<br/>SaaS管理后台
          </h1>
          
          <p className={styles.brandDesc}>
            摩塔管理后台提供完整的租户管理、用户管理、内容审核、AI调度等企业级SaaS运营功能，助力企业高效运营。
          </p>
          
          <div className={styles.features}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <SafetyCertificateOutlined />
              </div>
              <div className={styles.featureText}>
                <h4>多租户架构</h4>
                <p>完整的租户隔离</p>
              </div>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <UserOutlined />
              </div>
              <div className={styles.featureText}>
                <h4>用户管理</h4>
                <p>灵活的权限控制</p>
              </div>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>📊</div>
              <div className={styles.featureText}>
                <h4>数据分析</h4>
                <p>实时运营监控</p>
              </div>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>🤖</div>
              <div className={styles.featureText}>
                <h4>AI管理</h4>
                <p>模型调度与计费</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 右侧表单区域 */}
      <div className={styles.formSection}>
        <div className={styles.formWrapper}>
          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>欢迎登录</h2>
              <p className={styles.formSubtitle}>摩塔管理后台</p>
            </div>
            
            <LoginForm
              contentStyle={{
                minWidth: 280,
                maxWidth: '100%',
                padding: 0,
              }}
              submitter={{
                searchConfig: {
                  submitText: '登录',
                },
                submitButtonProps: {
                  size: 'large',
                  style: {
                    width: '100%',
                    height: '44px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    border: 'none',
                    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
                  },
                },
              }}
              initialValues={{
                autoLogin: false,
              }}
              onFinish={async (values) => {
                await handleSubmit(values as API.LoginParams);
              }}
            >
              {loginError && <LoginMessage content={loginError} />}

              <ProFormText
                name="username"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined style={{ color: '#94A3B8' }} />,
                  style: {
                    borderRadius: '8px',
                  },
                }}
                placeholder="请输入用户名"
                rules={[
                  {
                    required: true,
                    message: '请输入用户名!',
                  },
                ]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined style={{ color: '#94A3B8' }} />,
                  style: {
                    borderRadius: '8px',
                  },
                }}
                placeholder="请输入密码"
                rules={[
                  {
                    required: true,
                    message: '请输入密码！',
                  },
                ]}
              />
              <div
                style={{
                  marginBottom: 24,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <ProFormCheckbox noStyle name="rememberMe">
                  记住登录状态
                </ProFormCheckbox>
              </div>
            </LoginForm>
          </div>
          
          <div className={styles.footer}>
            <p>© 2024 摩塔科技 Mota Tech. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
