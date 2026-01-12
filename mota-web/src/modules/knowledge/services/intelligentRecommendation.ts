/**
 * 智能知识推荐引擎
 * 基于用户行为、项目上下文和AI分析提供个性化知识推荐
 */

import { doubaoClient } from '@/services/doubao/doubaoClient'
import request from '@/services/request'

// 推荐类型
export type RecommendationType = 
  | 'project_related'     // 项目相关
  | 'task_relevant'       // 任务相关
  | 'skill_based'         // 技能匹配
  | 'trending'            // 热门内容
  | 'collaborative'       // 协作推荐
  | 'learning_path'       // 学习路径

// 推荐项目
export interface RecommendationItem {
  id: string
  type: 'document' | 'knowledge_node' | 'project' | 'discussion' | 'template'
  title: string
  description: string
  content?: string
  relevanceScore: number
  recommendationType: RecommendationType
  source: {
    id: string
    type: string
    name: string
  }
  tags: string[]
  createdAt: string
  lastModified: string
  author?: {
    id: string
    name: string
    avatar?: string
  }
  metrics: {
    viewCount: number
    likeCount: number
    shareCount: number
    downloadCount: number
  }
  reasoning: string // AI推荐理由
}

// 推荐上下文
export interface RecommendationContext {
  userId: string
  projectId?: string
  taskId?: string
  currentDocument?: string
  searchQuery?: string
  userSkills?: string[]
  userInterests?: string[]
  recentActivity?: Array<{
    type: string
    itemId: string
    timestamp: string
  }>
  teamMembers?: Array<{
    id: string
    skills: string[]
  }>
}

// 推荐结果
export interface RecommendationResult {
  recommendations: RecommendationItem[]
  categories: Array<{
    type: RecommendationType
    label: string
    count: number
    items: RecommendationItem[]
  }>
  insights: {
    totalCount: number
    highRelevanceCount: number
    categories: Record<RecommendationType, number>
    trending: string[]
    gaps: string[]
  }
  explanation: string
}

// 用户偏好
export interface UserPreferences {
  userId: string
  preferredTypes: string[]
  excludedTags: string[]
  relevanceThreshold: number
  maxResults: number
  includeCollaborative: boolean
  includeTrending: boolean
  personalizedWeight: number
}

/**
 * 智能知识推荐引擎核心类
 */
export class IntelligentRecommendationEngine {
  private static instance: IntelligentRecommendationEngine
  private readonly maxResults = 50
  private readonly relevanceThreshold = 0.3

  static getInstance(): IntelligentRecommendationEngine {
    if (!this.instance) {
      this.instance = new IntelligentRecommendationEngine()
    }
    return this.instance
  }

  /**
   * 获取智能推荐
   */
  async getRecommendations(
    context: RecommendationContext,
    preferences?: UserPreferences
  ): Promise<RecommendationResult> {
    try {
      // 1. 收集用户数据和上下文
      const userProfile = await this.buildUserProfile(context)
      
      // 2. 获取多源推荐
      const [
        projectRecommendations,
        taskRecommendations,
        skillRecommendations,
        trendingRecommendations,
        collaborativeRecommendations
      ] = await Promise.all([
        this.getProjectRelatedRecommendations(context),
        this.getTaskRelevantRecommendations(context),
        this.getSkillBasedRecommendations(context, userProfile),
        this.getTrendingRecommendations(context),
        this.getCollaborativeRecommendations(context)
      ])

      // 3. 合并和排序推荐
      const allRecommendations = [
        ...projectRecommendations,
        ...taskRecommendations,
        ...skillRecommendations,
        ...trendingRecommendations,
        ...collaborativeRecommendations
      ]

      // 4. AI智能评分和排序
      const rankedRecommendations = await this.rankRecommendations(
        allRecommendations,
        context,
        userProfile
      )

      // 5. 应用用户偏好过滤
      const filteredRecommendations = this.applyUserPreferences(
        rankedRecommendations,
        preferences
      )

      // 6. 构建结果
      return this.buildRecommendationResult(filteredRecommendations, context)

    } catch (error) {
      console.error('智能推荐生成失败:', error)
      throw new Error('推荐系统暂时不可用，请稍后再试')
    }
  }

  /**
   * 构建用户画像
   */
  private async buildUserProfile(context: RecommendationContext) {
    const profile = {
      skills: context.userSkills || [],
      interests: context.userInterests || [],
      activityPattern: {},
      collaborationStyle: {},
      learningPath: []
    }

    // 分析用户最近活动
    if (context.recentActivity) {
      profile.activityPattern = this.analyzeActivityPattern(context.recentActivity)
    }

    // 分析协作偏好
    if (context.teamMembers) {
      profile.collaborationStyle = this.analyzeCollaborationStyle(context.teamMembers)
    }

    return profile
  }

  /**
   * 项目相关推荐
   */
  private async getProjectRelatedRecommendations(
    context: RecommendationContext
  ): Promise<RecommendationItem[]> {
    if (!context.projectId) return []

    try {
      // 获取项目相关文档和知识点
      const response = await request.get<RecommendationItem[]>(
        `/api/knowledge/recommendations/project/${context.projectId}`
      )
      
      return response.map((item: any) => ({
        ...item,
        recommendationType: 'project_related'
      }))
    } catch (error) {
      console.error('获取项目相关推荐失败:', error)
      return []
    }
  }

  /**
   * 任务相关推荐
   */
  private async getTaskRelevantRecommendations(
    context: RecommendationContext
  ): Promise<RecommendationItem[]> {
    if (!context.taskId) return []

    try {
      const response = await request.get<RecommendationItem[]>(
        `/api/knowledge/recommendations/task/${context.taskId}`
      )
      
      return response.map((item: any) => ({
        ...item,
        recommendationType: 'task_relevant'
      }))
    } catch (error) {
      console.error('获取任务相关推荐失败:', error)
      return []
    }
  }

  /**
   * 技能匹配推荐
   */
  private async getSkillBasedRecommendations(
    context: RecommendationContext,
    userProfile: any
  ): Promise<RecommendationItem[]> {
    if (!userProfile.skills.length) return []

    try {
      const response = await request.post<RecommendationItem[]>(
        '/api/knowledge/recommendations/skills',
        {
          skills: userProfile.skills,
          interests: userProfile.interests,
          userId: context.userId
        }
      )
      
      return response.map((item: any) => ({
        ...item,
        recommendationType: 'skill_based'
      }))
    } catch (error) {
      console.error('获取技能匹配推荐失败:', error)
      return []
    }
  }

  /**
   * 热门内容推荐
   */
  private async getTrendingRecommendations(
    context: RecommendationContext
  ): Promise<RecommendationItem[]> {
    try {
      const response = await request.get<RecommendationItem[]>(
        '/api/knowledge/recommendations/trending',
        {
          limit: 10,
          timeRange: '7d'
        }
      )
      
      return response.map((item: any) => ({
        ...item,
        recommendationType: 'trending'
      }))
    } catch (error) {
      console.error('获取热门推荐失败:', error)
      return []
    }
  }

  /**
   * 协作推荐
   */
  private async getCollaborativeRecommendations(
    context: RecommendationContext
  ): Promise<RecommendationItem[]> {
    try {
      const response = await request.post<RecommendationItem[]>(
        '/api/knowledge/recommendations/collaborative',
        {
          userId: context.userId,
          teamMembers: context.teamMembers,
          projectId: context.projectId
        }
      )
      
      return response.map((item: any) => ({
        ...item,
        recommendationType: 'collaborative'
      }))
    } catch (error) {
      console.error('获取协作推荐失败:', error)
      return []
    }
  }

  /**
   * AI智能排序推荐
   */
  private async rankRecommendations(
    recommendations: RecommendationItem[],
    context: RecommendationContext,
    userProfile: any
  ): Promise<RecommendationItem[]> {
    if (recommendations.length === 0) return []

    try {
      // 使用Claude API进行智能评分
      const prompt = this.buildRankingPrompt(recommendations, context, userProfile)
      
      const response = await doubaoClient.sendMessage([{
        role: 'user',
        content: prompt
      }])

      // 解析AI评分结果
      const rankings = this.parseRankingResponse(response)
      
      // 应用AI评分重新排序
      return this.applyRankings(recommendations, rankings)
      
    } catch (error) {
      console.error('AI智能排序失败，使用默认排序:', error)
      
      // 降级到默认排序策略
      return this.defaultRanking(recommendations, context)
    }
  }

  /**
   * 构建排序提示词
   */
  private buildRankingPrompt(
    recommendations: RecommendationItem[],
    context: RecommendationContext,
    userProfile: any
  ): string {
    const contextInfo = `
用户上下文:
- 用户ID: ${context.userId}
- 当前项目: ${context.projectId || '无'}
- 当前任务: ${context.taskId || '无'}
- 用户技能: ${userProfile.skills.join(', ') || '未知'}
- 搜索查询: ${context.searchQuery || '无'}

用户画像:
- 技能领域: ${userProfile.skills.join(', ')}
- 兴趣方向: ${userProfile.interests.join(', ')}
- 活动模式: ${JSON.stringify(userProfile.activityPattern)}
    `

    const recommendationsInfo = recommendations.slice(0, 20).map((item, index) => `
${index + 1}. ${item.title}
   类型: ${item.type}
   推荐类型: ${item.recommendationType}
   描述: ${item.description}
   标签: ${item.tags.join(', ')}
   相关性评分: ${item.relevanceScore}
   指标: 浏览${item.metrics.viewCount} 点赞${item.metrics.likeCount}
    `).join('\n')

    return `
作为智能知识推荐系统，请根据用户上下文和推荐内容进行智能排序。

${contextInfo}

推荐内容列表:
${recommendationsInfo}

请考虑以下因素进行排序:
1. 与用户当前工作的相关性
2. 用户技能和兴趣匹配度
3. 内容质量和实用性
4. 时效性和热度
5. 学习价值和成长帮助

请返回JSON格式的排序结果:
{
  "rankings": [
    {
      "id": "推荐项ID",
      "score": 0.95,
      "reasoning": "排序理由"
    }
  ]
}
    `
  }

  /**
   * 解析AI排序响应
   */
  private parseRankingResponse(response: string): Array<{ id: string; score: number; reasoning: string }> {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('未找到有效的JSON响应')
      }
      
      const parsed = JSON.parse(jsonMatch[0])
      return parsed.rankings || []
    } catch (error) {
      console.error('解析AI排序响应失败:', error)
      return []
    }
  }

  /**
   * 应用AI排序
   */
  private applyRankings(
    recommendations: RecommendationItem[],
    rankings: Array<{ id: string; score: number; reasoning: string }>
  ): RecommendationItem[] {
    const rankingMap = new Map(rankings.map(r => [r.id, r]))
    
    return recommendations
      .map(item => {
        const ranking = rankingMap.get(item.id)
        return {
          ...item,
          relevanceScore: ranking ? ranking.score : item.relevanceScore,
          reasoning: ranking ? ranking.reasoning : item.reasoning
        }
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
  }

  /**
   * 默认排序策略
   */
  private defaultRanking(
    recommendations: RecommendationItem[],
    context: RecommendationContext
  ): RecommendationItem[] {
    return recommendations.sort((a, b) => {
      // 优先级权重
      const typeWeights: Record<RecommendationType, number> = {
        'project_related': 0.9,
        'task_relevant': 0.85,
        'skill_based': 0.8,
        'collaborative': 0.75,
        'trending': 0.6,
        'learning_path': 0.7
      }

      const aWeight = typeWeights[a.recommendationType] || 0.5
      const bWeight = typeWeights[b.recommendationType] || 0.5
      
      const aScore = a.relevanceScore * aWeight
      const bScore = b.relevanceScore * bWeight
      
      return bScore - aScore
    })
  }

  /**
   * 应用用户偏好过滤
   */
  private applyUserPreferences(
    recommendations: RecommendationItem[],
    preferences?: UserPreferences
  ): RecommendationItem[] {
    if (!preferences) return recommendations

    return recommendations
      .filter(item => {
        // 相关性阈值过滤
        if (item.relevanceScore < preferences.relevanceThreshold) return false
        
        // 排除标签过滤
        if (preferences.excludedTags.some(tag => item.tags.includes(tag))) return false
        
        // 类型偏好过滤
        if (preferences.preferredTypes.length > 0 && 
            !preferences.preferredTypes.includes(item.type)) return false
        
        return true
      })
      .slice(0, preferences.maxResults)
  }

  /**
   * 构建推荐结果
   */
  private buildRecommendationResult(
    recommendations: RecommendationItem[],
    context: RecommendationContext
  ): RecommendationResult {
    // 按类型分组
    const categories = this.groupByType(recommendations)
    
    // 生成洞察
    const insights = this.generateInsights(recommendations, context)
    
    return {
      recommendations,
      categories,
      insights,
      explanation: this.generateExplanation(recommendations, context)
    }
  }

  /**
   * 按类型分组
   */
  private groupByType(recommendations: RecommendationItem[]) {
    const typeLabels: Record<RecommendationType, string> = {
      'project_related': '项目相关',
      'task_relevant': '任务相关',
      'skill_based': '技能匹配',
      'trending': '热门内容',
      'collaborative': '协作推荐',
      'learning_path': '学习路径'
    }

    const groups: Record<RecommendationType, RecommendationItem[]> = {
      'project_related': [],
      'task_relevant': [],
      'skill_based': [],
      'trending': [],
      'collaborative': [],
      'learning_path': []
    }

    recommendations.forEach(item => {
      groups[item.recommendationType].push(item)
    })

    return Object.entries(groups)
      .filter(([_, items]) => items.length > 0)
      .map(([type, items]) => ({
        type: type as RecommendationType,
        label: typeLabels[type as RecommendationType],
        count: items.length,
        items
      }))
  }

  /**
   * 生成洞察分析
   */
  private generateInsights(
    recommendations: RecommendationItem[],
    context: RecommendationContext
  ) {
    const highRelevanceCount = recommendations.filter(r => r.relevanceScore > 0.8).length
    
    const categories = recommendations.reduce((acc, item) => {
      acc[item.recommendationType] = (acc[item.recommendationType] || 0) + 1
      return acc
    }, {} as Record<RecommendationType, number>)

    const trending = recommendations
      .filter(r => r.recommendationType === 'trending')
      .slice(0, 3)
      .map(r => r.title)

    const gaps = this.identifyKnowledgeGaps(recommendations, context)

    return {
      totalCount: recommendations.length,
      highRelevanceCount,
      categories,
      trending,
      gaps
    }
  }

  /**
   * 识别知识缺口
   */
  private identifyKnowledgeGaps(
    recommendations: RecommendationItem[],
    context: RecommendationContext
  ): string[] {
    // 简单的知识缺口检测逻辑
    const gaps: string[] = []
    
    if (context.userSkills && context.userSkills.length > 0) {
      const skillCoverage = recommendations.filter(r => 
        r.tags.some(tag => context.userSkills!.includes(tag))
      ).length
      
      if (skillCoverage < recommendations.length * 0.3) {
        gaps.push('技能相关内容不足')
      }
    }
    
    if (context.projectId && recommendations.filter(r => r.recommendationType === 'project_related').length === 0) {
      gaps.push('项目相关知识缺失')
    }
    
    return gaps
  }

  /**
   * 生成推荐说明
   */
  private generateExplanation(
    recommendations: RecommendationItem[],
    context: RecommendationContext
  ): string {
    if (recommendations.length === 0) {
      return '暂时没有找到合适的推荐内容，建议调整搜索条件或浏览热门内容。'
    }

    const topType = recommendations[0].recommendationType
    const typeExplanations: Record<RecommendationType, string> = {
      'project_related': '基于您当前的项目上下文',
      'task_relevant': '根据您正在处理的任务',
      'skill_based': '匹配您的技能和兴趣',
      'trending': '当前最受欢迎的内容',
      'collaborative': '团队成员推荐的内容',
      'learning_path': '为您定制的学习路径'
    }

    return `${typeExplanations[topType]}，为您推荐了 ${recommendations.length} 项相关内容。其中高度相关的内容有 ${recommendations.filter(r => r.relevanceScore > 0.8).length} 项。`
  }

  /**
   * 分析活动模式
   */
  private analyzeActivityPattern(recentActivity: Array<{ type: string; itemId: string; timestamp: string }>) {
    const pattern = {
      activeHours: [] as string[],
      preferredTypes: [] as string[],
      frequency: 0
    }
    
    // 简化的活动模式分析
    const typeCount: Record<string, number> = {}
    recentActivity.forEach(activity => {
      typeCount[activity.type] = (typeCount[activity.type] || 0) + 1
    })
    
    pattern.preferredTypes = Object.entries(typeCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type]) => type)
    
    pattern.frequency = recentActivity.length
    
    return pattern
  }

  /**
   * 分析协作风格
   */
  private analyzeCollaborationStyle(teamMembers: Array<{ id: string; skills: string[] }>) {
    return {
      teamSize: teamMembers.length,
      commonSkills: this.findCommonSkills(teamMembers),
      diversityScore: this.calculateDiversityScore(teamMembers)
    }
  }

  /**
   * 查找共同技能
   */
  private findCommonSkills(teamMembers: Array<{ id: string; skills: string[] }>): string[] {
    if (teamMembers.length === 0) return []
    
    const allSkills = teamMembers.flatMap(member => member.skills)
    const skillCount: Record<string, number> = {}
    
    allSkills.forEach(skill => {
      skillCount[skill] = (skillCount[skill] || 0) + 1
    })
    
    return Object.entries(skillCount)
      .filter(([, count]) => count > 1)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([skill]) => skill)
  }

  /**
   * 计算多样性评分
   */
  private calculateDiversityScore(teamMembers: Array<{ id: string; skills: string[] }>): number {
    if (teamMembers.length === 0) return 0
    
    const allSkills = new Set(teamMembers.flatMap(member => member.skills))
    const avgSkillsPerMember = teamMembers.reduce((sum, member) => sum + member.skills.length, 0) / teamMembers.length
    
    return Math.min(1, allSkills.size / (avgSkillsPerMember * teamMembers.length))
  }
}

// 导出单例实例
export const recommendationEngine = IntelligentRecommendationEngine.getInstance()