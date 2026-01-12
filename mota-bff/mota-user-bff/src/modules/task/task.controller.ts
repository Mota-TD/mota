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
import { TaskService } from './task.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('task')
@Controller('tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  @ApiOperation({ summary: '获取任务列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getTasks(@Request() req: any, @Query() query: any): Promise<any> {
    return this.taskService.getTasks(
      req.user.userId,
      req.user.tenantId,
      query,
    );
  }

  @Get('my')
  @ApiOperation({ summary: '获取我的任务' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getMyTasks(@Request() req: any, @Query() query: any): Promise<any> {
    return this.taskService.getMyTasks(
      req.user.userId,
      req.user.tenantId,
      query,
    );
  }

  @Get('today')
  @ApiOperation({ summary: '获取今日任务' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getTodayTasks(@Request() req: any): Promise<any> {
    return this.taskService.getTodayTasks(
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Get('overdue')
  @ApiOperation({ summary: '获取逾期任务' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getOverdueTasks(@Request() req: any): Promise<any> {
    return this.taskService.getOverdueTasks(
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Get('board/:projectId')
  @ApiOperation({ summary: '获取看板视图数据' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getTaskBoard(
    @Param('projectId') projectId: string,
    @Request() req: any,
  ): Promise<any> {
    return this.taskService.getTaskBoard(
      projectId,
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: '获取任务详情（聚合数据）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getTaskDetail(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<any> {
    return this.taskService.getTaskDetail(
      id,
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Post()
  @ApiOperation({ summary: '创建任务' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async createTask(@Body() data: any, @Request() req: any): Promise<any> {
    return this.taskService.createTask(
      data,
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Put(':id')
  @ApiOperation({ summary: '更新任务' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateTask(
    @Param('id') id: string,
    @Body() data: any,
    @Request() req: any,
  ): Promise<any> {
    return this.taskService.updateTask(
      id,
      data,
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Put(':id/status')
  @ApiOperation({ summary: '更新任务状态' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateTaskStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Request() req: any,
  ): Promise<any> {
    return this.taskService.updateTaskStatus(
      id,
      status,
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除任务' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteTask(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    await this.taskService.deleteTask(
      id,
      req.user.userId,
      req.user.tenantId,
    );
    return { message: 'Task deleted' };
  }

  @Post(':id/comments')
  @ApiOperation({ summary: '添加任务评论' })
  @ApiResponse({ status: 201, description: '添加成功' })
  async addComment(
    @Param('id') id: string,
    @Body('content') content: string,
    @Request() req: any,
  ): Promise<any> {
    return this.taskService.addComment(
      id,
      content,
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Post(':id/subtasks')
  @ApiOperation({ summary: '添加子任务' })
  @ApiResponse({ status: 201, description: '添加成功' })
  async addSubtask(
    @Param('id') id: string,
    @Body() data: any,
    @Request() req: any,
  ): Promise<any> {
    return this.taskService.addSubtask(
      id,
      data,
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Put('batch')
  @ApiOperation({ summary: '批量更新任务' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async batchUpdateTasks(
    @Body('taskIds') taskIds: string[],
    @Body() data: any,
    @Request() req: any,
  ): Promise<any> {
    return this.taskService.batchUpdateTasks(
      taskIds,
      data,
      req.user.userId,
      req.user.tenantId,
    );
  }
}