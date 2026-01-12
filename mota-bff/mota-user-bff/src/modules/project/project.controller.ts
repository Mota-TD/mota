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
import { ProjectService } from './project.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('project')
@Controller('projects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  @ApiOperation({ summary: '获取项目列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getProjects(@Request() req: any, @Query() query: any): Promise<any> {
    return this.projectService.getProjects(
      req.user.userId,
      req.user.tenantId,
      query,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: '获取项目详情（聚合数据）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getProjectDetail(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<any> {
    return this.projectService.getProjectDetail(
      id,
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Post()
  @ApiOperation({ summary: '创建项目' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async createProject(@Body() data: any, @Request() req: any): Promise<any> {
    return this.projectService.createProject(
      data,
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Put(':id')
  @ApiOperation({ summary: '更新项目' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateProject(
    @Param('id') id: string,
    @Body() data: any,
    @Request() req: any,
  ): Promise<any> {
    return this.projectService.updateProject(
      id,
      data,
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除项目' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteProject(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    await this.projectService.deleteProject(
      id,
      req.user.userId,
      req.user.tenantId,
    );
    return { message: 'Project deleted' };
  }
}