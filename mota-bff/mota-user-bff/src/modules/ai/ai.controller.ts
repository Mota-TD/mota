import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AIService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('ai')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('chat')
  @ApiOperation({ summary: '发送聊天消息' })
  @ApiResponse({ status: 200, description: '发送成功' })
  async chat(
    @Body('sessionId') sessionId: string | null,
    @Body('message') message: string,
    @Body() options: any,
    @Request() req: any,
  ): Promise<any> {
    return this.aiService.chat(
      sessionId,
      message,
      req.user.userId,
      req.user.tenantId,
      options,
    );
  }

  @Post('chat/stream')
  @ApiOperation({ summary: '流式聊天' })
  @ApiResponse({ status: 200, description: '发送成功' })
  async chatStream(
    @Body('sessionId') sessionId: string | null,
    @Body('message') message: string,
    @Body() options: any,
    @Request() req: any,
  ): Promise<any> {
    return this.aiService.chatStream(
      sessionId,
      message,
      req.user.userId,
      req.user.tenantId,
      options,
    );
  }

  @Get('chat/sessions')
  @ApiOperation({ summary: '获取聊天会话列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getChatSessions(@Request() req: any, @Query() query: any): Promise<any> {
    return this.aiService.getChatSessions(
      req.user.userId,
      req.user.tenantId,
      query,
    );
  }

  @Get('chat/sessions/:id')
  @ApiOperation({ summary: '获取聊天会话详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getChatSession(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<any> {
    return this.aiService.getChatSession(
      id,
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Delete('chat/sessions/:id')
  @ApiOperation({ summary: '删除聊天会话' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteChatSession(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    await this.aiService.deleteChatSession(
      id,
      req.user.userId,
      req.user.tenantId,
    );
    return { message: 'Session deleted' };
  }

  @Post('suggestions')
  @ApiOperation({ summary: '获取AI建议' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getSuggestions(
    @Body('context') context: string,
    @Body('type') type: string,
    @Request() req: any,
  ): Promise<any> {
    return this.aiService.getSuggestions(
      context,
      type,
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Get('tasks/:taskId/suggestions')
  @ApiOperation({ summary: '获取任务建议' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getTaskSuggestions(
    @Param('taskId') taskId: string,
    @Request() req: any,
  ): Promise<any> {
    return this.aiService.getTaskSuggestions(
      taskId,
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Get('projects/:projectId/suggestions')
  @ApiOperation({ summary: '获取项目建议' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getProjectSuggestions(
    @Param('projectId') projectId: string,
    @Request() req: any,
  ): Promise<any> {
    return this.aiService.getProjectSuggestions(
      projectId,
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Post('smart-search')
  @ApiOperation({ summary: '智能搜索' })
  @ApiResponse({ status: 200, description: '搜索成功' })
  async smartSearch(
    @Body('query') query: string,
    @Body() options: any,
    @Request() req: any,
  ): Promise<any> {
    return this.aiService.smartSearch(
      query,
      req.user.userId,
      req.user.tenantId,
      options,
    );
  }

  @Post('documents/:documentId/summarize')
  @ApiOperation({ summary: '文档摘要' })
  @ApiResponse({ status: 200, description: '生成成功' })
  async summarizeDocument(
    @Param('documentId') documentId: string,
    @Request() req: any,
  ): Promise<any> {
    return this.aiService.summarizeDocument(
      documentId,
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Post('translate')
  @ApiOperation({ summary: '文本翻译' })
  @ApiResponse({ status: 200, description: '翻译成功' })
  async translate(
    @Body('text') text: string,
    @Body('targetLanguage') targetLanguage: string,
    @Request() req: any,
  ): Promise<any> {
    return this.aiService.translate(
      text,
      targetLanguage,
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Get('usage/stats')
  @ApiOperation({ summary: '获取AI使用统计' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getUsageStats(
    @Request() req: any,
    @Query('period') period: string = 'month',
  ): Promise<any> {
    return this.aiService.getUsageStats(
      req.user.userId,
      req.user.tenantId,
      period,
    );
  }

  @Get('models')
  @ApiOperation({ summary: '获取可用的AI模型列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getAvailableModels(@Request() req: any): Promise<any> {
    return this.aiService.getAvailableModels(
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Post('generate')
  @ApiOperation({ summary: '生成内容' })
  @ApiResponse({ status: 200, description: '生成成功' })
  async generateContent(
    @Body('prompt') prompt: string,
    @Body('type') type: string,
    @Body() options: any,
    @Request() req: any,
  ): Promise<any> {
    return this.aiService.generateContent(
      prompt,
      type,
      req.user.userId,
      req.user.tenantId,
      options,
    );
  }
}