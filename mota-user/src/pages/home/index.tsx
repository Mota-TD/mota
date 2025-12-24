import { Link } from 'react-router-dom'
import { Button, Popover } from 'antd'
import {
  CheckCircleOutlined,
  RightOutlined,
  RobotOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  CloudOutlined,
  ApiOutlined,
  BookOutlined,
  BarChartOutlined,
  BulbOutlined,
  StarOutlined,
  PlayCircleOutlined,
  ProjectOutlined,
  AppstoreOutlined,
  SyncOutlined,
  NotificationOutlined,
  LineChartOutlined
} from '@ant-design/icons'
import styles from './index.module.css'

/**
 * 官网首页 - AI驱动的项目管理与团队协作平台
 */
// WeChat QR Code component for contact
const WeChatQRContent = () => (
  <div style={{ textAlign: 'center', padding: '12px' }}>
    <img
      src="/wechat-qr.png"
      alt="微信二维码"
      style={{ width: '200px', height: '200px', marginBottom: '12px', display: 'block', margin: '0 auto 12px' }}
    />
    <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
      扫一扫上面的二维码图案，加我为朋友
    </p>
  </div>
)

const Home = () => {
  return (
    <div className={styles.homePage}>
      {/* 导航栏 */}
      <header className={styles.navbar}>
        <div className={styles.navbarContainer}>
          <div className={styles.navbarBrand}>
            <img src="/logo.svg" alt="摩塔 Mota" className={styles.logoImage} />
            <span className={styles.navbarTitle}>摩塔 Mota</span>
          </div>
          
          <div className={styles.navbarActions}>
            <Link to="/login">
              <Button type="text" className={styles.loginBtn}>登录</Button>
            </Link>
            <Link to="/register">
              <Button type="primary" className={styles.registerBtn}>免费试用</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero区域 */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.heroBgGradient}></div>
          <div className={styles.heroBgPattern}></div>
          <div className={styles.heroBgOrbs}>
            <div className={styles.orb1}></div>
            <div className={styles.orb2}></div>
            <div className={styles.orb3}></div>
          </div>
        </div>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <StarOutlined />
              <span>AI驱动智能协作平台</span>
            </div>
            <h1 className={styles.heroTitle}>
              让<span className={styles.heroTitleHighlight}>智能</span>连接每一次协作<br/>
              让<span className={styles.heroTitleHighlight}>数据</span>驱动每一个决策
            </h1>
            <p className={styles.heroSubtitle}>
              通过智能化知识管理、自动化信息推送和AI辅助决策，帮助企业提升协作效率和决策质量。让团队协作更高效，让项目管理更智能。
            </p>
            <div className={styles.heroActions}>
              <Link to="/register">
                <Button type="primary" size="large" className={styles.heroBtn}>
                  免费开始使用 <RightOutlined />
                </Button>
              </Link>
              <Button size="large" className={styles.heroBtnSecondary}>
                <PlayCircleOutlined /> 观看演示
              </Button>
            </div>
            <div className={styles.heroTrust}>
              <span className={styles.heroTrustLabel}>已有超过</span>
              <div className={styles.heroTrustLogos}>
                <span className={styles.trustNumber}>10,000+</span>
                <span className={styles.trustText}>企业正在使用</span>
              </div>
            </div>
          </div>
          <div className={styles.heroImage}>
            <div className={styles.heroImageWrapper}>
              <div className={styles.heroCard}>
                <div className={styles.heroCardHeader}>
                  <div className={styles.heroCardDots}>
                    <span></span><span></span><span></span>
                  </div>
                  <span className={styles.heroCardTitle}>项目看板</span>
                </div>
                <div className={styles.heroCardBody}>
                  <div className={styles.heroCardKanban}>
                    <div className={styles.kanbanColumn}>
                      <div className={styles.kanbanHeader}>待处理</div>
                      <div className={styles.kanbanCard}>
                        <div className={styles.kanbanCardTitle}>市场调研</div>
                        <div className={styles.kanbanCardMeta}>
                          <span className={styles.kanbanTag}>高优先级</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.kanbanColumn}>
                      <div className={styles.kanbanHeader}>进行中</div>
                      <div className={`${styles.kanbanCard} ${styles.kanbanCardActive}`}>
                        <div className={styles.kanbanCardTitle}>方案撰写</div>
                        <div className={styles.kanbanCardMeta}>
                          <span className={styles.kanbanProgress}>60%</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.kanbanColumn}>
                      <div className={styles.kanbanHeader}>已完成</div>
                      <div className={`${styles.kanbanCard} ${styles.kanbanCardDone}`}>
                        <div className={styles.kanbanCardTitle}>客户沟通</div>
                        <CheckCircleOutlined className={styles.kanbanDoneIcon} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.floatingCard1}>
                <RobotOutlined className={styles.floatingIcon} />
                <span>AI智能助手</span>
              </div>
              <div className={styles.floatingCard2}>
                <ThunderboltOutlined className={styles.floatingIcon} />
                <span>效率提升 50%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 核心能力 - 四大支柱 */}
      <section className={styles.pillarsSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge}>核心能力</div>
            <h2 className={styles.sectionTitle}>
              四大核心能力，<span className={styles.textPrimary}>全面赋能</span>企业
            </h2>
            <p className={styles.sectionSubtitle}>
              项目管理、团队协作、AI智能、知识管理四位一体，打造新一代企业协作平台
            </p>
          </div>
          <div className={styles.pillarsGrid}>
            <div className={styles.pillarCard}>
              <div className={styles.pillarIcon} style={{ background: 'linear-gradient(135deg, #2b7de9 0%, #667eea 100%)' }}>
                <ProjectOutlined style={{ fontSize: 32, color: '#fff' }} />
              </div>
              <h3 className={styles.pillarTitle}>项目管理</h3>
              <p className={styles.pillarDesc}>
                灵活的项目管理，支持看板、列表、甘特图等多种视图，让项目进度一目了然
              </p>
              <ul className={styles.pillarFeatures}>
                <li><CheckCircleOutlined /> 多视图项目管理</li>
                <li><CheckCircleOutlined /> 可视化看板</li>
                <li><CheckCircleOutlined /> 任务分配追踪</li>
                <li><CheckCircleOutlined /> 进度监控</li>
              </ul>
            </div>
            <div className={styles.pillarCard}>
              <div className={styles.pillarIcon} style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                <TeamOutlined style={{ fontSize: 32, color: '#fff' }} />
              </div>
              <h3 className={styles.pillarTitle}>团队协作</h3>
              <p className={styles.pillarDesc}>
                高效团队协作，成员管理、权限配置、实时通知，让团队沟通更顺畅
              </p>
              <ul className={styles.pillarFeatures}>
                <li><CheckCircleOutlined /> 成员权限管理</li>
                <li><CheckCircleOutlined /> 实时消息通知</li>
                <li><CheckCircleOutlined /> 任务分配协作</li>
                <li><CheckCircleOutlined /> 团队效能分析</li>
              </ul>
            </div>
            <div className={styles.pillarCard}>
              <div className={styles.pillarIcon} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <RobotOutlined style={{ fontSize: 32, color: '#fff' }} />
              </div>
              <h3 className={styles.pillarTitle}>AI智能</h3>
              <p className={styles.pillarDesc}>
                AI辅助决策，智能方案生成、新闻追踪、智能推荐，让决策更科学
              </p>
              <ul className={styles.pillarFeatures}>
                <li><CheckCircleOutlined /> AI方案生成</li>
                <li><CheckCircleOutlined /> 智能新闻推送</li>
                <li><CheckCircleOutlined /> AI辅助决策</li>
                <li><CheckCircleOutlined /> 智能PPT生成</li>
              </ul>
            </div>
            <div className={styles.pillarCard}>
              <div className={styles.pillarIcon} style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <BookOutlined style={{ fontSize: 32, color: '#fff' }} />
              </div>
              <h3 className={styles.pillarTitle}>知识管理</h3>
              <p className={styles.pillarDesc}>
                企业知识资产化，Wiki文档、知识库、智能检索，让知识持续积累
              </p>
              <ul className={styles.pillarFeatures}>
                <li><CheckCircleOutlined /> Wiki文档协作</li>
                <li><CheckCircleOutlined /> AI知识库</li>
                <li><CheckCircleOutlined /> 智能知识检索</li>
                <li><CheckCircleOutlined /> 知识图谱</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 核心功能 */}
      <section className={styles.featuresSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge}>功能特性</div>
            <h2 className={styles.sectionTitle}>
              丰富功能，<span className={styles.textPrimary}>全面覆盖</span>协作场景
            </h2>
            <p className={styles.sectionSubtitle}>
              从项目规划到执行交付，从知识沉淀到智能决策，一站式解决企业协作需求
            </p>
          </div>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureCardIcon} style={{ background: 'linear-gradient(135deg, #2b7de9 0%, #667eea 100%)' }}>
                <AppstoreOutlined style={{ fontSize: 28, color: '#fff' }} />
              </div>
              <h3 className={styles.featureCardTitle}>可视化看板</h3>
              <p className={styles.featureCardDesc}>
                直观的看板视图，支持拖拽操作，任务状态一目了然。自定义工作流程，适配不同团队的协作方式。
              </p>
              <Link to="/register" className={styles.featureCardLink}>
                立即体验 <RightOutlined />
              </Link>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureCardIcon} style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                <SyncOutlined style={{ fontSize: 28, color: '#fff' }} />
              </div>
              <h3 className={styles.featureCardTitle}>进度管理</h3>
              <p className={styles.featureCardDesc}>
                项目进度规划，里程碑管理，进度分析，让项目节奏更可控
              </p>
              <Link to="/register" className={styles.featureCardLink}>
                了解更多 <RightOutlined />
              </Link>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureCardIcon} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <RobotOutlined style={{ fontSize: 28, color: '#fff' }} />
              </div>
              <h3 className={styles.featureCardTitle}>AI方案生成</h3>
              <p className={styles.featureCardDesc}>
                输入需求，AI自动生成专业方案，支持商务、技术、营销等多种类型
              </p>
              <Link to="/register" className={styles.featureCardLink}>
                了解更多 <RightOutlined />
              </Link>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureCardIcon} style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <NotificationOutlined style={{ fontSize: 28, color: '#fff' }} />
              </div>
              <h3 className={styles.featureCardTitle}>智能推送</h3>
              <p className={styles.featureCardDesc}>
                自动化信息推送，行业新闻追踪，重要事项提醒，不错过任何关键信息
              </p>
              <Link to="/register" className={styles.featureCardLink}>
                了解更多 <RightOutlined />
              </Link>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureCardIcon} style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                <FileTextOutlined style={{ fontSize: 28, color: '#fff' }} />
              </div>
              <h3 className={styles.featureCardTitle}>Wiki文档</h3>
              <p className={styles.featureCardDesc}>
                团队知识库，支持多人协作编辑，版本管理，让知识沉淀更便捷
              </p>
              <Link to="/register" className={styles.featureCardLink}>
                了解更多 <RightOutlined />
              </Link>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureCardIcon} style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                <LineChartOutlined style={{ fontSize: 28, color: '#fff' }} />
              </div>
              <h3 className={styles.featureCardTitle}>数据分析</h3>
              <p className={styles.featureCardDesc}>
                全面的数据分析，项目进度报表，任务完成率统计，数据驱动决策
              </p>
              <Link to="/register" className={styles.featureCardLink}>
                了解更多 <RightOutlined />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 核心价值 */}
      <section className={styles.valueSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge}>核心价值</div>
            <h2 className={styles.sectionTitle}>
              三大核心价值，<span className={styles.textPrimary}>全面提升</span>企业效能
            </h2>
          </div>
          <div className={styles.valueGrid}>
            <div className={styles.valueCard}>
              <div className={styles.valueNumber}>50%+</div>
              <h3 className={styles.valueTitle}>协作效率提升</h3>
              <p className={styles.valueDesc}>
                通过智能化项目管理和团队协作工具，大幅提升团队协作效率，减少沟通成本
              </p>
              <ul className={styles.valueFeatures}>
                <li>可视化任务管理</li>
                <li>实时协作沟通</li>
                <li>自动化工作流</li>
              </ul>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueNumber}>80%+</div>
              <h3 className={styles.valueTitle}>知识复用率提升</h3>
              <p className={styles.valueDesc}>
                企业知识资产化管理，让知识持续积累、便捷检索、高效复用
              </p>
              <ul className={styles.valueFeatures}>
                <li>智能知识库</li>
                <li>AI语义检索</li>
                <li>知识图谱</li>
              </ul>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueNumber}>90%+</div>
              <h3 className={styles.valueTitle}>信息获取提速</h3>
              <p className={styles.valueDesc}>
                自动化信息推送和AI辅助决策，让决策更快速、更科学、更精准
              </p>
              <ul className={styles.valueFeatures}>
                <li>智能新闻推送</li>
                <li>AI辅助决策</li>
                <li>实时数据洞察</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 适用行业 */}
      <section className={styles.rolesSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge}>行业解决方案</div>
            <h2 className={styles.sectionTitle}>
              深耕<span className={styles.textPrimary}>垂直场景</span>，释放行业潜能
            </h2>
            <p className={styles.sectionSubtitle}>
              每个行业都有独特的协作痛点与知识沉淀需求，摩塔以AI为核心引擎，为不同领域量身打造智能化解决方案
            </p>
          </div>
          <div className={styles.rolesGrid}>
            <div className={`${styles.roleCard} ${styles.roleCardPrimary}`}>
              <div className={styles.roleCardHeader}>
                <div className={styles.roleAvatar}>
                  <BulbOutlined style={{ fontSize: 24, color: '#fff' }} />
                </div>
                <h3 className={styles.roleTitle}>科技/互联网</h3>
              </div>
              <div className={styles.roleSubtitle}>软件开发、产品设计、技术服务</div>
              <ul className={styles.roleFeatures}>
                <li>项目迭代管理，敏捷高效</li>
                <li>技术文档沉淀，知识传承</li>
                <li>跨部门协作，信息透明</li>
              </ul>
            </div>
            <div className={styles.roleCard}>
              <div className={styles.roleCardHeader}>
                <div className={`${styles.roleAvatar} ${styles.roleAvatarSecondary}`}>
                  <TeamOutlined style={{ fontSize: 24, color: '#2b7de9' }} />
                </div>
                <h3 className={styles.roleTitle}>咨询/专业服务</h3>
              </div>
              <div className={styles.roleSubtitle}>管理咨询、法律、会计、培训</div>
              <ul className={styles.roleFeatures}>
                <li>AI快速生成专业方案</li>
                <li>项目交付管理，进度可控</li>
                <li>知识库积累，服务标准化</li>
              </ul>
            </div>
            <div className={styles.roleCard}>
              <div className={styles.roleCardHeader}>
                <div className={`${styles.roleAvatar} ${styles.roleAvatarSecondary}`}>
                  <BarChartOutlined style={{ fontSize: 24, color: '#2b7de9' }} />
                </div>
                <h3 className={styles.roleTitle}>金融/保险</h3>
              </div>
              <div className={styles.roleSubtitle}>银行、证券、保险、投资</div>
              <ul className={styles.roleFeatures}>
                <li>合规项目管理，流程规范</li>
                <li>智能新闻追踪，市场洞察</li>
                <li>风险报告生成，决策支持</li>
              </ul>
            </div>
            <div className={styles.roleCard}>
              <div className={styles.roleCardHeader}>
                <div className={`${styles.roleAvatar} ${styles.roleAvatarSecondary}`}>
                  <GlobalOutlined style={{ fontSize: 24, color: '#2b7de9' }} />
                </div>
                <h3 className={styles.roleTitle}>制造/贸易</h3>
              </div>
              <div className={styles.roleSubtitle}>生产制造、进出口、供应链</div>
              <ul className={styles.roleFeatures}>
                <li>项目进度管理，交付可控</li>
                <li>供应商协作，信息同步</li>
                <li>文档管理，资料归档</li>
              </ul>
            </div>
            <div className={styles.roleCard}>
              <div className={styles.roleCardHeader}>
                <div className={`${styles.roleAvatar} ${styles.roleAvatarSecondary}`}>
                  <BookOutlined style={{ fontSize: 24, color: '#2b7de9' }} />
                </div>
                <h3 className={styles.roleTitle}>教育/培训</h3>
              </div>
              <div className={styles.roleSubtitle}>学校、培训机构、在线教育</div>
              <ul className={styles.roleFeatures}>
                <li>课程项目管理，教学协作</li>
                <li>教学资料共享，知识沉淀</li>
                <li>AI辅助备课，效率提升</li>
              </ul>
            </div>
            <div className={styles.roleCard}>
              <div className={styles.roleCardHeader}>
                <div className={`${styles.roleAvatar} ${styles.roleAvatarSecondary}`}>
                  <AppstoreOutlined style={{ fontSize: 24, color: '#2b7de9' }} />
                </div>
                <h3 className={styles.roleTitle}>更多行业</h3>
              </div>
              <div className={styles.roleSubtitle}>医疗、政府、零售、地产等</div>
              <ul className={styles.roleFeatures}>
                <li>灵活配置，适配各类业务</li>
                <li>按需定制，满足特殊需求</li>
                <li>持续迭代，功能不断丰富</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 技术优势 */}
      <section className={styles.techSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge}>技术优势</div>
            <h2 className={styles.sectionTitle}>
              企业级<span className={styles.textPrimary}>安全可靠</span>的AI平台
            </h2>
          </div>
          <div className={styles.techGrid}>
            <div className={styles.techCard}>
              <div className={styles.techCardIcon}>
                <SafetyCertificateOutlined />
              </div>
              <h3 className={styles.techCardTitle}>数据安全</h3>
              <p className={styles.techCardDesc}>
                企业数据加密存储，支持私有化部署，符合等保三级要求
              </p>
            </div>
            <div className={styles.techCard}>
              <div className={styles.techCardIcon}>
                <CloudOutlined />
              </div>
              <h3 className={styles.techCardTitle}>多模型支持</h3>
              <p className={styles.techCardDesc}>
                支持GPT-4、Claude、通义千问等多种AI引擎，智能路由优化
              </p>
            </div>
            <div className={styles.techCard}>
              <div className={styles.techCardIcon}>
                <ApiOutlined />
              </div>
              <h3 className={styles.techCardTitle}>开放集成</h3>
              <p className={styles.techCardDesc}>
                提供完整API接口，支持与企业现有系统无缝集成
              </p>
            </div>
            <div className={styles.techCard}>
              <div className={styles.techCardIcon}>
                <ThunderboltOutlined />
              </div>
              <h3 className={styles.techCardTitle}>高性能</h3>
              <p className={styles.techCardDesc}>
                云原生架构，弹性扩展，确保服务稳定高效
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA区域 */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <div className={styles.ctaText}>
              <h2 className={styles.ctaTitle}>
                现在开始，<br/>
                开启智能协作<br/>
                <span className={styles.ctaTitleHighlight}>新时代</span>
              </h2>
              <p className={styles.ctaDesc}>
                完全免费开放，永久免费使用。立即体验AI驱动的项目管理与团队协作平台。
              </p>
              <div className={styles.ctaActions}>
                <Link to="/register">
                  <Button type="primary" size="large" className={styles.ctaBtn}>
                    免费开始使用 <RightOutlined />
                  </Button>
                </Link>
                <Popover
                  content={<WeChatQRContent />}
                  title="联系我们"
                  trigger="hover"
                  placement="top"
                >
                  <Button size="large" ghost className={styles.ctaBtnGhost}>
                    联系我们
                  </Button>
                </Popover>
              </div>
            </div>
            <div className={styles.ctaImage}>
              <div className={styles.ctaImageWrapper}>
                <div className={styles.ctaCard}>
                  <div className={styles.ctaCardIcon}>
                    <RobotOutlined />
                  </div>
                  <div className={styles.ctaCardText}>
                    <div className={styles.ctaCardTitle}>AI已就绪</div>
                    <div className={styles.ctaCardDesc}>智能协作，高效决策</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerMain}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogo}>
                <img src="/logo.svg" alt="摩塔 Mota" className={styles.logoImage} />
                <span>摩塔 Mota</span>
              </div>
              <p className={styles.footerDesc}>AI驱动的项目管理与团队协作平台</p>
              <p className={styles.footerSlogan}>智能化知识管理 · 自动化信息推送 · AI辅助决策</p>
              <div className={styles.footerContact}>
                <p>support@mota.ai</p>
              </div>
            </div>
            <div className={styles.footerLinks}>
              <div className={styles.footerColumn}>
                <h4 className={styles.footerColumnTitle}>核心能力</h4>
                <ul>
                  <li><a href="#">项目管理</a></li>
                  <li><a href="#">团队协作</a></li>
                  <li><a href="#">AI智能</a></li>
                  <li><a href="#">知识管理</a></li>
                </ul>
              </div>
              <div className={styles.footerColumn}>
                <h4 className={styles.footerColumnTitle}>解决方案</h4>
                <ul>
                  <li><a href="#">科技公司</a></li>
                  <li><a href="#">咨询公司</a></li>
                  <li><a href="#">销售团队</a></li>
                  <li><a href="#">市场营销</a></li>
                  <li><a href="#">金融机构</a></li>
                </ul>
              </div>
              <div className={styles.footerColumn}>
                <h4 className={styles.footerColumnTitle}>资源</h4>
                <ul>
                  <li><a href="#">帮助中心</a></li>
                  <li><a href="#">API文档</a></li>
                  <li><a href="#">使用教程</a></li>
                  <li><a href="#">更新日志</a></li>
                  <li><a href="#">博客</a></li>
                </ul>
              </div>
              <div className={styles.footerColumn}>
                <h4 className={styles.footerColumnTitle}>公司</h4>
                <ul>
                  <li><a href="#">关于我们</a></li>
                  <li><a href="#">加入我们</a></li>
                  <li><a href="#">联系我们</a></li>
                  <li><a href="#">隐私政策</a></li>
                  <li><a href="#">服务条款</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p className={styles.footerCopyright}>© 2024 摩塔 Mota. All rights reserved.</p>
            <div className={styles.footerSocial}>
              <a href="#" className={styles.socialLink}>微信</a>
              <a href="#" className={styles.socialLink}>微博</a>
              <a href="#" className={styles.socialLink}>GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home