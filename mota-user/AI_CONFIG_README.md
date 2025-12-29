# 摩塔 AI 功能配置指南

## 🤖 AI功能概述

摩塔项目集成了Claude AI，提供以下智能功能：
- **AI任务分解**：自动将项目分解为可执行的任务
- **智能分工推荐**：基于团队技能和负载推荐最佳分配
- **项目风险预警**：智能分析项目风险并提供建议

## ⚙️ 配置Claude API

### 步骤1：获取Claude API Key

1. 访问 [Anthropic Console](https://console.anthropic.com/)
2. 注册账号或登录
3. 创建新的API Key
4. 复制您的API Key

### 步骤2：配置环境变量

在项目根目录的`.env`文件中配置：

```env
# Claude AI API配置
VITE_CLAUDE_API_KEY=your_actual_api_key_here

# 可选配置（使用默认值即可）
VITE_CLAUDE_MODEL=claude-3-sonnet-20240229
VITE_CLAUDE_MAX_TOKENS=4096
VITE_CLAUDE_TEMPERATURE=0.7
```

### 步骤3：重启应用

配置完成后重启开发服务器：

```bash
npm run dev
```

## 🔄 AI功能状态说明

### ✅ 有API Key时
- 使用真实Claude AI进行任务分解、智能分工、风险分析
- 获得更准确、更创新的AI建议
- 支持复杂项目的智能分析

### ⚠️ 无API Key时
- 自动使用智能模拟数据
- 基于项目管理最佳实践的备用方案
- 确保功能正常使用，但缺少AI创造性

## 📊 功能验证

### 如何验证AI功能已启用

1. **项目创建页面**
   - 点击"AI生成里程碑"按钮
   - 查看生成的任务是否具有创新性和针对性

2. **项目详情页面**
   - 创建部门任务后
   - 查看是否出现"AI智能分工推荐"面板

3. **控制台日志**
   - 有API Key：显示"Claude API客户端已初始化"
   - 无API Key：显示"AI功能将使用模拟数据"

## 💡 使用技巧

### 获得更好的AI建议
1. **项目描述详细**：提供详细的项目背景和目标
2. **部门信息准确**：确保部门设置符合实际团队结构
3. **时间线合理**：设置现实可行的项目时间线

### 成本控制
- Claude API按使用量计费
- 每次AI调用约消耗500-2000 tokens
- 建议为开发测试设置API使用限额

## 🚨 故障排除

### 常见问题

**Q: 提示"Claude API Key未设置"**
A: 检查`.env`文件中的`VITE_CLAUDE_API_KEY`是否正确配置

**Q: AI功能返回错误**
A: 检查API Key是否有效，是否有足够的配额

**Q: AI建议质量不高**
A: 尝试提供更详细的项目描述和需求信息

### 调试方法

1. 打开浏览器开发者工具
2. 查看Console标签页的日志输出
3. 检查Network标签页的API请求状态

## 📞 技术支持

如果遇到配置问题：

1. 检查[Claude API文档](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
2. 确认API Key权限和配额
3. 查看浏览器控制台的详细错误信息

## 🔒 安全注意事项

⚠️ **重要**：
- 不要将API Key提交到版本控制系统
- `.env`文件已在`.gitignore`中，确保不会被提交
- 定期轮换API Key以保障安全
- 在生产环境中使用服务端代理调用AI API

## 🎯 功能路线图

未来AI功能增强计划：
- [ ] 支持更多AI模型（GPT-4, 通义千问等）
- [ ] 企业知识库学习
- [ ] 个性化AI助手
- [ ] 实时协作AI建议