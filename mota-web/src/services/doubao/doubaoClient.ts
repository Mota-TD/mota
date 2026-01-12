/**
 * 豆包 API 客户端
 * 提供与豆包AI模型的集成接口
 * 基于火山引擎豆包API: https://www.volcengine.com/docs/82379/1541594
 */

// 豆包 API配置
interface DoubaoConfig {
  apiKey: string
  endpointId: string  // 推理接入点ID，用于API调用
  baseURL: string
  model: string       // 模型名称，仅用于显示
  maxTokens: number
  temperature: number
}

// 豆包 API消息格式
interface DoubaoMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// 豆包 API响应接口
interface DoubaoResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// 默认配置
const DEFAULT_CONFIG: DoubaoConfig = {
  apiKey: '',
  endpointId: '',  // 推理接入点ID，必须在火山引擎控制台创建
  baseURL: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
  model: 'doubao-pro-32k',  // 模型名称，仅用于显示
  maxTokens: 4096,
  temperature: 0.7
}

/**
 * 豆包 API客户端类
 */
export class DoubaoClient {
  private config: DoubaoConfig

  constructor(config: Partial<DoubaoConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    
    if (!this.config.apiKey && !this.config.endpointId) {
      console.warn('豆包 API Key或Endpoint ID未设置，AI功能将使用模拟数据')
    }
  }

  /**
   * 设置API Key
   */
  setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey
  }

  /**
   * 设置Endpoint ID (推理接入点ID)
   */
  setEndpointId(endpointId: string): void {
    this.config.endpointId = endpointId
  }

  /**
   * 设置模型名称（仅用于显示）
   */
  setModel(model: string): void {
    this.config.model = model
  }

  /**
   * 发送消息到豆包
   */
  async sendMessage(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    systemPrompt?: string,
    options?: {
      model?: string
      endpointId?: string
      maxTokens?: number
      temperature?: number
    }
  ): Promise<string> {
    // 检查必要配置
    const endpointId = options?.endpointId || this.config.endpointId
    if (!this.config.apiKey) {
      throw new Error('豆包 API Key未设置')
    }
    if (!endpointId) {
      throw new Error('豆包 Endpoint ID未设置')
    }

    const requestConfig = { ...this.config, ...options, endpointId }

    // 构建消息数组
    const fullMessages: DoubaoMessage[] = []
    
    // 添加系统提示
    if (systemPrompt) {
      fullMessages.push({
        role: 'system',
        content: systemPrompt
      })
    }
    
    // 添加用户消息
    messages.forEach(msg => {
      fullMessages.push({
        role: msg.role,
        content: msg.content
      })
    })

    try {
      console.log('调用豆包API:', {
        url: requestConfig.baseURL,
        endpointId: requestConfig.endpointId,
        messagesCount: fullMessages.length
      })

      const response = await fetch(requestConfig.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${requestConfig.apiKey}`
        },
        body: JSON.stringify({
          model: requestConfig.endpointId,  // 使用Endpoint ID作为model参数
          messages: fullMessages,
          max_tokens: requestConfig.maxTokens,
          temperature: requestConfig.temperature
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`豆包 API错误: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`)
      }

      const data: DoubaoResponse = await response.json()
      return data.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('豆包 API调用失败:', error)
      throw error
    }
  }

  /**
   * AI任务分解
   */
  async generateTaskDecomposition(params: {
    projectName: string
    projectDescription: string
    departments: string[]
    startDate?: string
    endDate?: string
  }): Promise<{
    suggestions: Array<{
      id: string
      name: string
      description: string
      suggestedDepartment?: string
      suggestedPriority: string
      estimatedDays: number
      dependencies?: string[]
    }>
    totalEstimatedDays: number
    riskAssessment: string
  }> {
    const systemPrompt = `你是一个专业的项目管理AI助手，擅长将复杂项目分解为可执行的任务。

请基于提供的项目信息，将项目分解为具体的任务，并为每个任务提供以下信息：
1. 任务名称（简洁明确）
2. 任务描述（详细的工作内容）
3. 建议负责部门（从提供的部门中选择最合适的）
4. 建议优先级（low/medium/high/urgent）
5. 预估工作天数（1-30天）
6. 前置依赖任务（如果有）

同时提供：
- 总体工期估算
- 项目风险评估

请以JSON格式返回结果，格式如下：
{
  "suggestions": [
    {
      "id": "task_1",
      "name": "任务名称",
      "description": "任务描述",
      "suggestedDepartment": "部门名称",
      "suggestedPriority": "medium",
      "estimatedDays": 5,
      "dependencies": ["task_0"]
    }
  ],
  "totalEstimatedDays": 30,
  "riskAssessment": "风险评估描述"
}`

    const userMessage = `项目信息：
项目名称：${params.projectName}
项目描述：${params.projectDescription}
参与部门：${params.departments.join('、')}
${params.startDate ? `开始日期：${params.startDate}` : ''}
${params.endDate ? `结束日期：${params.endDate}` : ''}

请将此项目分解为具体的任务。`

    try {
      const response = await this.sendMessage([
        { role: 'user', content: userMessage }
      ], systemPrompt)

      // 尝试解析JSON响应
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0])
        
        // 确保每个任务有唯一ID
        result.suggestions = result.suggestions.map((task: any, index: number) => ({
          ...task,
          id: task.id || `task_${Date.now()}_${index}`
        }))
        
        return result
      } else {
        throw new Error('AI返回格式不正确')
      }
    } catch (error) {
      console.error('AI任务分解失败:', error)
      // 返回默认结果
      return this.getFallbackTaskDecomposition(params)
    }
  }

  /**
   * AI智能分工推荐
   */
  async suggestTaskAssignment(params: {
    taskId: number
    taskName: string
    taskDescription: string
    teamMembers: Array<{
      id: string
      name: string
      department: string
      currentWorkload: number
      skills: string[]
    }>
  }): Promise<{
    suggestedAssignees: Array<{
      userId: number
      userName: string
      matchScore: number
      currentWorkload: number
      reason: string
    }>
  }> {
    const systemPrompt = `你是一个专业的团队管理AI助手，擅长根据任务特点和团队成员能力进行智能分工。

请基于任务信息和团队成员信息，推荐最适合的执行人员，考虑因素包括：
1. 技能匹配度
2. 当前工作负载
3. 部门适配性
4. 综合能力评估

为每个推荐人员提供：
- 匹配分数（0-100）
- 推荐理由
- 当前工作负载情况

请以JSON格式返回结果：
{
  "suggestedAssignees": [
    {
      "userId": 123,
      "userName": "张三",
      "matchScore": 85,
      "currentWorkload": 60,
      "reason": "具备相关技能且工作负载适中"
    }
  ]
}`

    const userMessage = `任务信息：
任务名称：${params.taskName}
任务描述：${params.taskDescription}

团队成员：
${params.teamMembers.map(member => 
  `- ${member.name}（${member.department}）：工作负载${member.currentWorkload}%，技能：${member.skills.join('、')}`
).join('\n')}

请推荐最适合执行此任务的人员。`

    try {
      const response = await this.sendMessage([
        { role: 'user', content: userMessage }
      ], systemPrompt)

      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      } else {
        throw new Error('AI返回格式不正确')
      }
    } catch (error) {
      console.error('AI分工推荐失败:', error)
      return this.getFallbackAssignmentSuggestion(params)
    }
  }

  /**
   * AI项目风险预警
   */
  async generateRiskWarnings(params: {
    projectId: string | number
    projectName: string
    departmentTasks: Array<{
      name: string
      status: string
      progress: number
      endDate?: string
    }>
    tasks: Array<{
      name: string
      status: string
      progress: number
      endDate?: string
    }>
  }): Promise<Array<{
    id: string
    type: 'delay' | 'resource' | 'dependency' | 'quality'
    severity: 'low' | 'medium' | 'high' | 'critical'
    title: string
    description: string
    affectedTasks: string[]
    suggestions: string[]
    createdAt: string
  }>> {
    const systemPrompt = `你是一个项目风险管理专家，擅长识别项目风险并提供预警建议。

请分析项目状态，识别潜在风险：
1. 进度延期风险
2. 资源冲突风险  
3. 依赖关系风险
4. 质量风险

为每个风险提供：
- 风险类型和严重程度
- 具体描述和影响
- 受影响的任务
- 应对建议

返回JSON格式：
{
  "risks": [
    {
      "id": "risk_1",
      "type": "delay",
      "severity": "high", 
      "title": "风险标题",
      "description": "风险描述",
      "affectedTasks": ["任务名称"],
      "suggestions": ["建议措施"]
    }
  ]
}`

    const userMessage = `项目分析：
项目：${params.projectName}

部门任务状态：
${params.departmentTasks.map(task => 
  `- ${task.name}：${task.status}，进度${task.progress}%${task.endDate ? `，截止${task.endDate}` : ''}`
).join('\n')}

执行任务状态：
${params.tasks.map(task => 
  `- ${task.name}：${task.status}，进度${task.progress}%${task.endDate ? `，截止${task.endDate}` : ''}`
).join('\n')}

请分析项目风险。`

    try {
      const response = await this.sendMessage([
        { role: 'user', content: userMessage }
      ], systemPrompt)

      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0])
        return result.risks.map((risk: any) => ({
          ...risk,
          createdAt: new Date().toISOString()
        }))
      } else {
        throw new Error('AI返回格式不正确')
      }
    } catch (error) {
      console.error('AI风险分析失败:', error)
      return []
    }
  }

  /**
   * AI智能对话
   */
  async chat(
    message: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
    systemPrompt?: string
  ): Promise<string> {
    const defaultSystemPrompt = systemPrompt || `你是摩塔项目管理系统的AI助手，专注于帮助用户进行项目管理、任务规划和团队协作。
你可以：
1. 帮助分析项目需求和制定计划
2. 提供任务分解和优先级建议
3. 协助解决项目管理中的问题
4. 提供最佳实践和建议

请用专业、友好的方式回答用户问题。`

    const messages = [
      ...conversationHistory,
      { role: 'user' as const, content: message }
    ]

    return this.sendMessage(messages, defaultSystemPrompt)
  }

  /**
   * AI生成进度描述
   */
  async generateProgressDescription(params: {
    taskName: string
    currentProgress: number
    previousProgress?: number
    workDone?: string
    issues?: string
  }): Promise<{
    description: string
    suggestions?: string[]
  }> {
    const systemPrompt = `你是一个专业的项目进度报告助手，擅长生成清晰、专业的进度描述。

请根据提供的任务信息，生成一段简洁专业的进度描述，并提供后续工作建议。

返回JSON格式：
{
  "description": "进度描述文本",
  "suggestions": ["建议1", "建议2"]
}`

    const userMessage = `任务信息：
任务名称：${params.taskName}
当前进度：${params.currentProgress}%
${params.previousProgress !== undefined ? `上次进度：${params.previousProgress}%` : ''}
${params.workDone ? `已完成工作：${params.workDone}` : ''}
${params.issues ? `遇到问题：${params.issues}` : ''}

请生成进度描述。`

    try {
      const response = await this.sendMessage([
        { role: 'user', content: userMessage }
      ], systemPrompt)

      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      } else {
        return {
          description: response,
          suggestions: []
        }
      }
    } catch (error) {
      console.error('AI生成进度描述失败:', error)
      return {
        description: `${params.taskName}当前进度${params.currentProgress}%`,
        suggestions: []
      }
    }
  }

  /**
   * AI生成项目报告
   */
  async generateProjectReport(params: {
    projectName: string
    projectDescription: string
    reportType: 'daily' | 'weekly' | 'monthly'
    statistics: {
      totalTasks: number
      completedTasks: number
      inProgressTasks: number
      overdueTasks: number
    }
    recentActivities?: string[]
    issues?: string[]
  }): Promise<{
    summary: string
    highlights: string[]
    issues: string[]
    nextSteps: string[]
  }> {
    const reportTypeMap = {
      daily: '日报',
      weekly: '周报',
      monthly: '月报'
    }

    const systemPrompt = `你是一个专业的项目报告撰写助手，擅长生成结构清晰、内容专业的项目报告。

请根据提供的项目信息，生成一份${reportTypeMap[params.reportType]}。

返回JSON格式：
{
  "summary": "项目整体概述",
  "highlights": ["亮点1", "亮点2"],
  "issues": ["问题1", "问题2"],
  "nextSteps": ["下一步计划1", "下一步计划2"]
}`

    const userMessage = `项目信息：
项目名称：${params.projectName}
项目描述：${params.projectDescription}
报告类型：${reportTypeMap[params.reportType]}

任务统计：
- 总任务数：${params.statistics.totalTasks}
- 已完成：${params.statistics.completedTasks}
- 进行中：${params.statistics.inProgressTasks}
- 已逾期：${params.statistics.overdueTasks}

${params.recentActivities?.length ? `近期活动：\n${params.recentActivities.map(a => `- ${a}`).join('\n')}` : ''}
${params.issues?.length ? `当前问题：\n${params.issues.map(i => `- ${i}`).join('\n')}` : ''}

请生成项目报告。`

    try {
      const response = await this.sendMessage([
        { role: 'user', content: userMessage }
      ], systemPrompt)

      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      } else {
        throw new Error('AI返回格式不正确')
      }
    } catch (error) {
      console.error('AI生成项目报告失败:', error)
      return {
        summary: `${params.projectName}${reportTypeMap[params.reportType]}`,
        highlights: [],
        issues: params.issues || [],
        nextSteps: []
      }
    }
  }

  /**
   * 任务分解失败时的备用方案
   */
  private getFallbackTaskDecomposition(params: any) {
    return {
      suggestions: [
        {
          id: `fallback_${Date.now()}_1`,
          name: '需求分析',
          description: `分析${params.projectName}的具体需求和目标`,
          suggestedDepartment: params.departments[0],
          suggestedPriority: 'high',
          estimatedDays: 5,
          dependencies: []
        },
        {
          id: `fallback_${Date.now()}_2`, 
          name: '方案设计',
          description: '制定详细的实施方案',
          suggestedDepartment: params.departments[0],
          suggestedPriority: 'high',
          estimatedDays: 8,
          dependencies: [`fallback_${Date.now()}_1`]
        },
        {
          id: `fallback_${Date.now()}_3`,
          name: '实施执行',
          description: '按照方案执行具体工作',
          suggestedDepartment: params.departments[1] || params.departments[0],
          suggestedPriority: 'medium',
          estimatedDays: 15,
          dependencies: [`fallback_${Date.now()}_2`]
        }
      ],
      totalEstimatedDays: 28,
      riskAssessment: '项目风险适中，建议关注进度控制和资源协调。'
    }
  }

  /**
   * 分工推荐失败时的备用方案
   */
  private getFallbackAssignmentSuggestion(params: any) {
    return {
      suggestedAssignees: params.teamMembers
        .filter((member: any) => member.currentWorkload < 80)
        .sort((a: any, b: any) => a.currentWorkload - b.currentWorkload)
        .slice(0, 3)
        .map((member: any, index: number) => ({
          userId: parseInt(member.id),
          userName: member.name,
          matchScore: Math.max(50, 85 - index * 10),
          currentWorkload: member.currentWorkload,
          reason: `基于当前工作负载（${member.currentWorkload}%）推荐`
        }))
    }
  }

  /**
   * 检查API连接状态
   */
  async checkConnection(): Promise<boolean> {
    if (!this.config.apiKey || !this.config.endpointId) {
      return false
    }

    try {
      await this.sendMessage([
        { role: 'user', content: '你好' }
      ], '请简短回复"OK"表示连接正常。')
      return true
    } catch {
      return false
    }
  }

  /**
   * 获取当前配置（隐藏API Key）
   */
  getConfig(): Omit<DoubaoConfig, 'apiKey'> & { apiKey: string } {
    return {
      ...this.config,
      apiKey: this.config.apiKey ? '***' : ''
    }
  }
}

// 创建全局豆包客户端实例
export const doubaoClient = new DoubaoClient()

// 初始化函数（从环境变量或配置中获取API Key和Endpoint ID）
export function initializeDoubaoClient(apiKey?: string, endpointId?: string): void {
  const key = apiKey || import.meta.env.VITE_DOUBAO_API_KEY || ''
  const endpoint = endpointId || import.meta.env.VITE_DOUBAO_ENDPOINT_ID || ''
  
  if (key) {
    doubaoClient.setApiKey(key)
  }
  
  if (endpoint) {
    doubaoClient.setEndpointId(endpoint)
  }
  
  // 设置模型名称（仅用于显示）
  const model = import.meta.env.VITE_DOUBAO_MODEL || 'doubao-pro-32k'
  doubaoClient.setModel(model)
  
  if (key && endpoint) {
    console.log('豆包 API客户端已初始化 (API Key + Endpoint ID)')
  } else if (endpoint) {
    console.log('豆包 API客户端已初始化 (仅Endpoint ID，需要API Key才能调用)')
  } else {
    console.warn('未找到豆包 API Key或Endpoint ID，AI功能将使用模拟数据')
  }
}

// 导出类型
export type { DoubaoConfig, DoubaoMessage, DoubaoResponse }