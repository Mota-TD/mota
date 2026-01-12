import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { KnowledgeService } from './knowledge.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('knowledge')
@Controller('knowledge')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get('bases')
  @ApiOperation({ summary: '获取知识库列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getKnowledgeBases(@Request() req: any, @Query() query: any): Promise<any> {
    return this.knowledgeService.getKnowledgeBases(
      req.user.userId,
      req.user.tenantId,
      query,
    );
  }

  @Post('bases')
  @ApiOperation({ summary: '创建知识库' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async createKnowledgeBase(@Body() data: any, @Request() req: any): Promise<any> {
    return this.knowledgeService.createKnowledgeBase(
      data,
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Get('bases/:id/documents')
  @ApiOperation({ summary: '获取知识库文档列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getDocuments(
    @Param('id') id: string,
    @Request() req: any,
    @Query() query: any,
  ): Promise<any> {
    return this.knowledgeService.getDocuments(
      id,
      req.user.userId,
      req.user.tenantId,
      query,
    );
  }

  @Post('bases/:id/documents')
  @ApiOperation({ summary: '创建文档' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async createDocument(
    @Param('id') id: string,
    @Body() data: any,
    @Request() req: any,
  ): Promise<any> {
    return this.knowledgeService.createDocument(
      id,
      data,
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Get('bases/:id/graph')
  @ApiOperation({ summary: '获取知识图谱' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getKnowledgeGraph(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<any> {
    return this.knowledgeService.getKnowledgeGraph(
      id,
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Get('documents/recent')
  @ApiOperation({ summary: '获取最近访问的文档' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getRecentDocuments(
    @Request() req: any,
    @Query('limit') limit: number = 10,
  ): Promise<any> {
    return this.knowledgeService.getRecentDocuments(
      req.user.userId,
      req.user.tenantId,
      limit,
    );
  }

  @Get('documents/favorites')
  @ApiOperation({ summary: '获取收藏的文档' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getFavoriteDocuments(@Request() req: any): Promise<any> {
    return this.knowledgeService.getFavoriteDocuments(
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Get('documents/:id')
  @ApiOperation({ summary: '获取文档详情（聚合数据）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getDocumentDetail(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<any> {
    return this.knowledgeService.getDocumentDetail(
      id,
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Put('documents/:id')
  @ApiOperation({ summary: '更新文档' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateDocument(
    @Param('id') id: string,
    @Body() data: any,
    @Request() req: any,
  ): Promise<any> {
    return this.knowledgeService.updateDocument(
      id,
      data,
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Delete('documents/:id')
  @ApiOperation({ summary: '删除文档' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteDocument(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    await this.knowledgeService.deleteDocument(
      id,
      req.user.userId,
      req.user.tenantId,
    );
    return { message: 'Document deleted' };
  }

  @Post('documents/:id/favorite')
  @ApiOperation({ summary: '收藏/取消收藏文档' })
  @ApiResponse({ status: 200, description: '操作成功' })
  async toggleFavorite(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<any> {
    return this.knowledgeService.toggleFavorite(
      id,
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Get('documents/:id/versions/:versionId')
  @ApiOperation({ summary: '获取文档版本' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getDocumentVersion(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
    @Request() req: any,
  ): Promise<any> {
    return this.knowledgeService.getDocumentVersion(
      id,
      versionId,
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Post('documents/:id/versions/:versionId/restore')
  @ApiOperation({ summary: '恢复文档版本' })
  @ApiResponse({ status: 200, description: '恢复成功' })
  async restoreDocumentVersion(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
    @Request() req: any,
  ): Promise<any> {
    return this.knowledgeService.restoreDocumentVersion(
      id,
      versionId,
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Post('search')
  @ApiOperation({ summary: '搜索知识库' })
  @ApiResponse({ status: 200, description: '搜索成功' })
  async searchKnowledge(
    @Body('query') query: string,
    @Body() options: any,
    @Request() req: any,
  ): Promise<any> {
    return this.knowledgeService.searchKnowledge(
      query,
      req.user.userId,
      req.user.tenantId,
      options,
    );
  }
}