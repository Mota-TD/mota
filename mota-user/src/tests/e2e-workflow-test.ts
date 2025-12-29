/**
 * MOTA项目端到端业务流程测试
 * 验证从项目创建到任务完成的完整业务流程
 */

import { businessWorkflowManager } from '@/workflows/projectWorkflow'
import { initializeClaudeClient } from '@/services/claude/claudeClient'
import { initializeDataSync } from '@/store/syncManager'

/**
 * 端到端测试套件
 */
export class E2EWorkflowTest {
  private testResults: {
    testName: string
    status: 'passed' | 'failed' | 'skipped'
    details: string
    timestamp: string
  }[] = []

  /**
   * 运行完整的端到端测试
   */
  async runCompleteWorkflowTest(): Promise<{
    success: boolean
    totalTests: number
    passedTests: number
    failedTests: number
    results: typeof this.testResults
  }> {
    console.log('🧪 开始端到端业务流程测试...')
    
    // 初始化测试环境
    await this.initializeTestEnvironment()
    
    // 测试项目创建流程
    await this.testProjectCreationWorkflow()
    
    // 测试AI任务分解
    await this.testAITaskDecomposition()
    
    // 测试智能分工推荐
    await this.testSmartTaskAssignment()
    
    // 测试任务状态级联更新
    await this.testTaskStatusCascading()
    
    // 测试跨Store数据同步
    await this.testCrossStoreSync()
    
    // 测试完整业务流程集成
    await this.testEndToEndIntegration()
    
    // 汇总测试结果
    return this.generateTestReport()
  }

  /**
   * 初始化测试环境
   */
  private async initializeTestEnvironment(): Promise<void> {
    try {
      // 初始化Claude API（如果有Key的话）
      const claudeApiKey = import.meta.env.VITE_CLAUDE_API_KEY
      if (claudeApiKey) {
        initializeClaudeClient(claudeApiKey)
      }
      
      // 初始化数据同步
      initializeDataSync()
      
      this.addTestResult('环境初始化', 'passed', '测试环境初始化成功')
    } catch (error) {
      this.addTestResult('环境初始化', 'failed', `环境初始化失败: ${error}`)
    }
  }

  /**
   * 测试项目创建工作流
   */
  private async testProjectCreationWorkflow(): Promise<void> {
    try {
      console.log('📝 测试项目创建工作流...')
      
      const result = await businessWorkflowManager.createProject({
        projectData: {
          name: '测试项目_E2E',
          description: '这是一个端到端测试项目，用于验证完整的业务流程',
          departments: ['技术部', '产品部', '设计部'],
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        enableAI: true,
        autoCreateTasks: true
      })
      
      if (result.success && result.project) {
        this.addTestResult(
          '项目创建工作流',
          'passed',
          `项目创建成功: ${result.project.name}，生成了${result.departmentTasks?.length || 0}个部门任务`
        )
      } else {
        this.addTestResult('项目创建工作流', 'failed', result.error || '项目创建失败')
      }
    } catch (error) {
      this.addTestResult('项目创建工作流', 'failed', `工作流异常: ${error}`)
    }
  }

  /**
   * 测试AI任务分解
   */
  private async testAITaskDecomposition(): Promise<void> {
    try {
      console.log('🤖 测试AI任务分解...')
      
      // 模拟AI任务分解
      const mockDecompositionData = {
        projectName: '测试项目_AI分解',
        projectDescription: '用于测试AI任务分解功能的项目',
        departments: ['技术部', '产品部'],
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
      
      // 检查AI Store是否正确集成
      const { useAIStore } = await import('@/modules/ai/store/aiStore')
      const aiStore = useAIStore.getState()
      
      // 尝试生成任务分解
      await aiStore.generateTaskDecomposition(mockDecompositionData)
      
      // 验证结果
      const state = useAIStore.getState()
      if (state.decomposeStatus === 'success' && state.decomposeResult) {
        this.addTestResult(
          'AI任务分解',
          'passed',
          `AI任务分解成功，生成了${state.decomposeResult.suggestions.length}个任务建议`
        )
      } else if (state.decomposeStatus === 'error') {
        this.addTestResult(
          'AI任务分解',
          'failed',
          state.decomposeError || 'AI任务分解失败'
        )
      } else {
        this.addTestResult('AI任务分解', 'skipped', '正在处理中或状态未知')
      }
    } catch (error) {
      this.addTestResult('AI任务分解', 'failed', `AI分解异常: ${error}`)
    }
  }

  /**
   * 测试智能分工推荐
   */
  private async testSmartTaskAssignment(): Promise<void> {
    try {
      console.log('👥 测试智能分工推荐...')
      
      const mockAssignmentData = {
        taskId: 12345,
        taskName: '测试任务_智能分工',
        taskDescription: '用于测试智能分工推荐功能的测试任务',
        teamMembers: [
          {
            id: '1',
            name: '张三',
            department: '技术部',
            currentWorkload: 60,
            skills: ['JavaScript', 'React', 'Node.js']
          },
          {
            id: '2',
            name: '李四',
            department: '技术部',
            currentWorkload: 80,
            skills: ['Python', 'Django', 'PostgreSQL']
          },
          {
            id: '3',
            name: '王五',
            department: '产品部',
            currentWorkload: 30,
            skills: ['产品设计', '需求分析', '用户研究']
          }
        ]
      }
      
      const result = await businessWorkflowManager.assignTask(mockAssignmentData)
      
      if (result.success) {
        this.addTestResult(
          '智能分工推荐',
          'passed',
          `智能分工成功，分配给: ${result.assignedTo}，理由: ${result.reason}`
        )
      } else {
        this.addTestResult('智能分工推荐', 'failed', result.error || '智能分工失败')
      }
    } catch (error) {
      this.addTestResult('智能分工推荐', 'failed', `分工推荐异常: ${error}`)
    }
  }

  /**
   * 测试任务状态级联更新
   */
  private async testTaskStatusCascading(): Promise<void> {
    try {
      console.log('🔄 测试任务状态级联更新...')
      
      // 模拟任务状态更新
      const mockTaskId = 12345
      const newStatus = 'completed'
      
      const result = await businessWorkflowManager.updateTaskStatus(mockTaskId, newStatus)
      
      if (result.success) {
        this.addTestResult(
          '任务状态级联更新',
          'passed',
          `任务状态更新成功，级联更新: ${result.cascadeUpdated ? '是' : '否'}`
        )
      } else {
        this.addTestResult('任务状态级联更新', 'failed', result.error || '状态更新失败')
      }
    } catch (error) {
      this.addTestResult('任务状态级联更新', 'failed', `级联更新异常: ${error}`)
    }
  }

  /**
   * 测试跨Store数据同步
   */
  private async testCrossStoreSync(): Promise<void> {
    try {
      console.log('🔗 测试跨Store数据同步...')
      
      const { syncManager } = await import('@/store/syncManager')
      
      // 检查同步管理器状态
      const syncStatus = syncManager.getSyncStatus()
      
      if (syncStatus.listenersCount > 0) {
        this.addTestResult(
          '跨Store数据同步',
          'passed',
          `数据同步已启用，监听器数量: ${syncStatus.listenersCount}，队列长度: ${syncStatus.queueLength}`
        )
      } else {
        this.addTestResult(
          '跨Store数据同步',
          'failed',
          '数据同步未启用或监听器未注册'
        )
      }
      
      // 测试事件发布
      let eventReceived = false
      const testListener = () => { eventReceived = true }
      
      syncManager.on('project_updated', testListener)
      await syncManager.emit({
        type: 'project_updated',
        source: 'project',
        payload: { projectId: 'test', updates: {} }
      })
      
      setTimeout(() => {
        if (eventReceived) {
          this.addTestResult('事件发布订阅', 'passed', '事件发布和订阅功能正常')
        } else {
          this.addTestResult('事件发布订阅', 'failed', '事件发布订阅功能异常')
        }
        
        syncManager.off('project_updated', testListener)
      }, 100)
      
    } catch (error) {
      this.addTestResult('跨Store数据同步', 'failed', `数据同步异常: ${error}`)
    }
  }

  /**
   * 测试完整业务流程集成
   */
  private async testEndToEndIntegration(): Promise<void> {
    try {
      console.log('🏁 测试端到端业务流程集成...')
      
      // 验证完整流程
      const result = await businessWorkflowManager.validateEndToEndWorkflow('test_project')
      
      if (result.success) {
        this.addTestResult(
          '端到端流程集成',
          'passed',
          `完整流程验证通过: 项目存在(${result.details.projectExists}), 任务创建(${result.details.tasksCreated}), AI集成(${result.details.aiIntegrated}), 同步启用(${result.details.syncEnabled})`
        )
      } else {
        this.addTestResult(
          '端到端流程集成',
          'failed',
          `流程验证失败: ${JSON.stringify(result.details)}`
        )
      }
    } catch (error) {
      this.addTestResult('端到端流程集成', 'failed', `流程集成异常: ${error}`)
    }
  }

  /**
   * 添加测试结果
   */
  private addTestResult(testName: string, status: 'passed' | 'failed' | 'skipped', details: string): void {
    this.testResults.push({
      testName,
      status,
      details,
      timestamp: new Date().toISOString()
    })
    
    const statusIcon = status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⏭️'
    console.log(`${statusIcon} ${testName}: ${details}`)
  }

  /**
   * 生成测试报告
   */
  private generateTestReport() {
    const totalTests = this.testResults.length
    const passedTests = this.testResults.filter(r => r.status === 'passed').length
    const failedTests = this.testResults.filter(r => r.status === 'failed').length
    const skippedTests = this.testResults.filter(r => r.status === 'skipped').length
    
    const success = failedTests === 0
    
    console.log('\n📊 测试报告汇总:')
    console.log(`总测试数: ${totalTests}`)
    console.log(`✅ 通过: ${passedTests}`)
    console.log(`❌ 失败: ${failedTests}`)
    console.log(`⏭️ 跳过: ${skippedTests}`)
    console.log(`📈 成功率: ${((passedTests / totalTests) * 100).toFixed(2)}%`)
    
    return {
      success,
      totalTests,
      passedTests,
      failedTests,
      results: this.testResults
    }
  }
}

/**
 * 快速验证主要功能
 */
export async function quickValidation(): Promise<boolean> {
  try {
    console.log('⚡ 快速验证主要功能...')
    
    // 1. 检查AI Store
    const { useAIStore } = await import('@/modules/ai/store/aiStore')
    const aiState = useAIStore.getState()
    const aiAvailable = typeof aiState.generateTaskDecomposition === 'function'
    
    // 2. 检查Task Store
    const { useTaskStore } = await import('@/modules/task/store/taskStore')
    const taskState = useTaskStore.getState()
    const taskCascadeAvailable = typeof taskState.updateCascadingProgress === 'function'
    
    // 3. 检查Project Store
    const { useProjectStore } = await import('@/modules/project/store/projectStore')
    const projectState = useProjectStore.getState()
    const projectAvailable = typeof projectState.createProject === 'function'
    
    // 4. 检查同步管理器
    const { syncManager } = await import('@/store/syncManager')
    const syncAvailable = typeof syncManager.emit === 'function'
    
    // 5. 检查业务流程管理器
    const workflowAvailable = typeof businessWorkflowManager.createProject === 'function'
    
    const allValid = aiAvailable && taskCascadeAvailable && projectAvailable && syncAvailable && workflowAvailable
    
    console.log('快速验证结果:')
    console.log(`AI Store: ${aiAvailable ? '✅' : '❌'}`)
    console.log(`Task Store级联: ${taskCascadeAvailable ? '✅' : '❌'}`)
    console.log(`Project Store: ${projectAvailable ? '✅' : '❌'}`)
    console.log(`数据同步: ${syncAvailable ? '✅' : '❌'}`)
    console.log(`业务流程: ${workflowAvailable ? '✅' : '❌'}`)
    console.log(`总体状态: ${allValid ? '✅ 通过' : '❌ 失败'}`)
    
    return allValid
  } catch (error) {
    console.error('❌ 快速验证失败:', error)
    return false
  }
}

// 创建测试实例
export const e2eTest = new E2EWorkflowTest()

// 导出便捷函数
export const runE2ETest = () => e2eTest.runCompleteWorkflowTest()