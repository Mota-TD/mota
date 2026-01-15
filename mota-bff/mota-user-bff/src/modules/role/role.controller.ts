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
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  RoleService,
  Role,
  RoleListParams,
  RoleListResponse,
  CreateRoleRequest,
  UpdateRoleRequest,
} from './role.service';

@Controller('api/v1/roles')
@UseGuards(JwtAuthGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  async getRoles(@Query() params: RoleListParams): Promise<RoleListResponse> {
    return this.roleService.getRoles(params);
  }

  @Get('enabled')
  async getEnabledRoles(): Promise<Role[]> {
    return this.roleService.getEnabledRoles();
  }

  @Get('exists/code')
  async checkCodeExists(@Query('code') code: string): Promise<boolean> {
    return this.roleService.checkCodeExists(code);
  }

  @Get(':id')
  async getRoleById(@Param('id', ParseIntPipe) id: number): Promise<Role> {
    return this.roleService.getRoleById(id);
  }

  @Get(':id/permissions')
  async getRolePermissionIds(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<number[]> {
    return this.roleService.getRolePermissionIds(id);
  }

  @Post()
  async createRole(@Body() data: CreateRoleRequest): Promise<number> {
    return this.roleService.createRole(data);
  }

  @Put(':id')
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateRoleRequest,
  ): Promise<void> {
    return this.roleService.updateRole(id, data);
  }

  @Put(':id/enable')
  async enableRole(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.roleService.enableRole(id);
  }

  @Put(':id/disable')
  async disableRole(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.roleService.disableRole(id);
  }

  @Put(':id/permissions')
  async assignPermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() permissionIds: number[],
  ): Promise<void> {
    return this.roleService.assignPermissions(id, permissionIds);
  }

  @Delete(':id')
  async deleteRole(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.roleService.deleteRole(id);
  }

  @Delete('batch')
  async deleteRoles(@Body() ids: number[]): Promise<void> {
    return this.roleService.deleteRoles(ids);
  }
}