import { Outlet } from 'react-router-dom'
import styles from './index.module.css'

/**
 * 认证页面布局 - 科技感未来风格
 * 用于登录、注册等认证相关页面
 */
const AuthLayout = () => {
  return (
    <div className={styles.authContainer}>
      {/* 左侧品牌区域 */}
      <div className={styles.authBrand}>
        <div className={styles.brandContent}>
          <div className={styles.brandLogo}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="12" fill="url(#logoGradient)"/>
              <path d="M14 24L22 32L34 16" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="logoGradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#2b7de9"/>
                  <stop offset="1" stopColor="#1976d2"/>
                </linearGradient>
              </defs>
            </svg>
            <span>摩塔 Mota</span>
          </div>
          <h1 className={styles.brandTitle}>AI驱动的<br/>智能协作平台</h1>
          <p className={styles.brandDesc}>
            融合人工智能与项目管理，重新定义团队协作方式。让每一次决策都有数据支撑，让每一个项目都高效推进。
          </p>
          
          <div className={styles.brandFeatures}>
            <div className={styles.brandFeature}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div className={styles.featureText}>
                <h3>AI方案引擎</h3>
                <p>智能生成专业方案</p>
              </div>
            </div>
            <div className={styles.brandFeature}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M3 9h18"/>
                  <path d="M9 21V9"/>
                </svg>
              </div>
              <div className={styles.featureText}>
                <h3>可视化看板</h3>
                <p>项目进度一目了然</p>
              </div>
            </div>
            <div className={styles.brandFeature}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
              </div>
              <div className={styles.featureText}>
                <h3>智能推送</h3>
                <p>实时追踪行业动态</p>
              </div>
            </div>
            <div className={styles.brandFeature}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
              </div>
              <div className={styles.featureText}>
                <h3>知识图谱</h3>
                <p>企业知识资产化</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.brandFooter}>
          <p>已有 <strong>10,000+</strong> 企业选择摩塔AI</p>
        </div>
      </div>
      
      {/* 右侧表单区域 */}
      <div className={styles.authFormWrapper}>
        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout