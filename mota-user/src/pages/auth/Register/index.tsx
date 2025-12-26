import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Form, Input, Button, Checkbox, App, Select, Card, Alert, Cascader } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, BankOutlined, PhoneOutlined } from '@ant-design/icons'
import { 
  register as registerApi, 
  getTopLevelIndustries, 
  getChildIndustries,
  validateInvitation,
  Industry,
  InvitationValidateResult
} from '@/services/api/auth'
import { ApiError } from '@/services/request'
import styles from './index.module.css'

interface IndustryOption {
  value: number
  label: string
  icon?: string
  isLeaf?: boolean
  children?: IndustryOption[]
}

/**
 * 注册页面 - 企业注册版
 * 用户注册时需填写企业名称和选择行业
 * 支持通过邀请码加入已有企业
 */
const Register = () => {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  
  // 行业选项
  const [industryOptions, setIndustryOptions] = useState<IndustryOption[]>([])
  const [loadingIndustries, setLoadingIndustries] = useState(false)
  
  // 邀请码相关
  const inviteCode = searchParams.get('inviteCode')
  const [invitationInfo, setInvitationInfo] = useState<InvitationValidateResult | null>(null)
  const [loadingInvitation, setLoadingInvitation] = useState(false)

  // 加载一级行业
  useEffect(() => {
    loadTopLevelIndustries()
  }, [])

  // 验证邀请码
  useEffect(() => {
    if (inviteCode) {
      validateInviteCode(inviteCode)
    }
  }, [inviteCode])

  const loadTopLevelIndustries = async () => {
    setLoadingIndustries(true)
    try {
      const industries = await getTopLevelIndustries()
      const options: IndustryOption[] = industries.map(ind => ({
        value: ind.id,
        label: `${ind.icon || ''} ${ind.name}`.trim(),
        icon: ind.icon,
        isLeaf: ind.level === 2, // 二级行业是叶子节点
      }))
      setIndustryOptions(options)
    } catch (error) {
      console.error('加载行业列表失败:', error)
    } finally {
      setLoadingIndustries(false)
    }
  }

  // 加载子行业
  const loadChildIndustries = async (selectedOptions: IndustryOption[]) => {
    const targetOption = selectedOptions[selectedOptions.length - 1]
    try {
      const children = await getChildIndustries(targetOption.value)
      targetOption.children = children.map(ind => ({
        value: ind.id,
        label: `${ind.icon || ''} ${ind.name}`.trim(),
        icon: ind.icon,
        isLeaf: true,
      }))
      setIndustryOptions([...industryOptions])
    } catch (error) {
      console.error('加载子行业失败:', error)
    }
  }

  const validateInviteCode = async (code: string) => {
    setLoadingInvitation(true)
    try {
      const result = await validateInvitation(code)
      setInvitationInfo(result)
      if (!result.valid) {
        message.error(result.errorMessage || '邀请码无效')
      }
    } catch (error) {
      console.error('验证邀请码失败:', error)
      setInvitationInfo({ valid: false, errorMessage: '验证邀请码失败' })
    } finally {
      setLoadingInvitation(false)
    }
  }

  // 处理注册提交
  const handleRegister = async (values: {
    username: string
    phone: string
    password: string
    confirmPassword: string
    email?: string
    enterpriseName?: string
    industryId?: number[]
    agreement: boolean
  }) => {
    setLoading(true)
    try {
      // 如果有有效邀请码，使用邀请码注册
      const isJoiningEnterprise = inviteCode && invitationInfo?.valid

      await registerApi({
        username: values.username,
        phone: values.phone,
        email: values.email || '',
        password: values.password,
        confirmPassword: values.confirmPassword,
        enterpriseName: isJoiningEnterprise ? invitationInfo!.enterpriseName! : values.enterpriseName!,
        industryId: isJoiningEnterprise ? 1 : (values.industryId ? values.industryId[values.industryId.length - 1] : 1),
        inviteCode: isJoiningEnterprise ? inviteCode! : undefined,
      })
      
      if (isJoiningEnterprise) {
        message.success(`注册成功！已加入企业「${invitationInfo!.enterpriseName}」`)
      } else {
        message.success('注册成功！企业创建完成，您已成为企业超级管理员')
      }
      navigate('/login')
    } catch (error) {
      if (error instanceof ApiError) {
        message.error(error.message || '注册失败')
      } else {
        message.error('网络错误，请稍后重试')
      }
    } finally {
      setLoading(false)
    }
  }

  // 渲染邀请信息卡片
  const renderInvitationCard = () => {
    if (!inviteCode) return null

    if (loadingInvitation) {
      return (
        <Card className={styles.invitationCard} loading={true}>
          正在验证邀请码...
        </Card>
      )
    }

    if (invitationInfo?.valid) {
      return (
        <Alert
          type="success"
          showIcon
          className={styles.invitationAlert}
          message="邀请加入企业"
          description={
            <div>
              <p>您正在通过邀请码加入企业：<strong>{invitationInfo.enterpriseName}</strong></p>
              <p>行业：{invitationInfo.industryName}</p>
              <p>角色：{invitationInfo.roleName}</p>
              {invitationInfo.invitedByName && <p>邀请人：{invitationInfo.invitedByName}</p>}
            </div>
          }
        />
      )
    }

    if (invitationInfo && !invitationInfo.valid) {
      return (
        <Alert
          type="error"
          showIcon
          className={styles.invitationAlert}
          message="邀请码无效"
          description={invitationInfo.errorMessage || '该邀请码已失效或不存在'}
        />
      )
    }

    return null
  }

  const isJoiningEnterprise = inviteCode && invitationInfo?.valid

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerHeader}>
        <h2>{isJoiningEnterprise ? '加入企业' : '创建企业账号'}</h2>
        <p>{isJoiningEnterprise ? '完成注册后即可加入企业' : '开始您的摩塔之旅'}</p>
      </div>

      {renderInvitationCard()}

      <Form
        form={form}
        name="register"
        onFinish={handleRegister}
        size="large"
        layout="vertical"
        className={styles.registerForm}
      >
        <Form.Item
          name="username"
          label="用户名"
          rules={[
            { required: true, message: '请输入用户名' },
            { min: 1, message: '用户名至少1个字' },
            { max: 16, message: '用户名不能超过16个字' }
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="请输入用户名（1-16个字）"
            autoComplete="username"
            maxLength={16}
          />
        </Form.Item>

        <Form.Item
          name="phone"
          label="手机号"
          rules={[
            { required: true, message: '请输入手机号' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
          ]}
        >
          <Input
            prefix={<PhoneOutlined />}
            placeholder="请输入手机号（用于登录）"
            autoComplete="tel"
            maxLength={11}
          />
        </Form.Item>

        <Form.Item
          name="email"
          label="邮箱（可选）"
          rules={[
            { type: 'email', message: '请输入有效的邮箱地址' }
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="请输入邮箱地址（用于找回密码）"
            autoComplete="email"
          />
        </Form.Item>

        {/* 如果不是通过邀请码加入，需要填写企业信息 */}
        {!isJoiningEnterprise && (
          <>
            <Form.Item
              name="enterpriseName"
              label="企业名称"
              rules={[
                { required: true, message: '请输入企业名称' },
                { min: 2, message: '企业名称至少2个字符' },
                { max: 200, message: '企业名称最多200个字符' }
              ]}
            >
              <Input
                prefix={<BankOutlined />}
                placeholder="请输入您的企业名称"
              />
            </Form.Item>

            <Form.Item
              name="industryId"
              label="所属行业"
              rules={[
                { required: true, message: '请选择所属行业' }
              ]}
            >
              <Cascader
                options={industryOptions}
                loadData={loadChildIndustries as any}
                placeholder="请选择所属行业"
                loading={loadingIndustries}
                changeOnSelect
                showSearch={{
                  filter: (inputValue, path) =>
                    path.some(option => 
                      (option.label as string).toLowerCase().includes(inputValue.toLowerCase())
                    ),
                }}
              />
            </Form.Item>
          </>
        )}

        <Form.Item
          name="password"
          label="密码"
          rules={[
            { required: true, message: '请输入密码' },
            { min: 6, message: '密码至少6位' }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="请设置密码（至少6位）"
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="确认密码"
          dependencies={['password']}
          rules={[
            { required: true, message: '请确认密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('两次输入的密码不一致'))
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="请再次输入密码"
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item
          name="agreement"
          valuePropName="checked"
          rules={[
            {
              validator: (_, value) =>
                value ? Promise.resolve() : Promise.reject(new Error('请阅读并同意服务条款')),
            },
          ]}
        >
          <Checkbox>
            我已阅读并同意 <a href="#">服务条款</a> 和 <a href="#">隐私政策</a>
          </Checkbox>
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            block 
            loading={loading}
            disabled={inviteCode ? !invitationInfo?.valid : false}
          >
            {isJoiningEnterprise ? '注册并加入企业' : '注册并创建企业'}
          </Button>
        </Form.Item>
      </Form>

      <div className={styles.registerFooter}>
        <p>已有账号？<Link to="/login">立即登录</Link></p>
      </div>
    </div>
  )
}

export default Register