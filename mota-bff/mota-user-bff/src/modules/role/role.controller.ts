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
  Version,
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

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Version('1')
  @Get()
  async getRoles(@Query() params: RoleListParams): Promise<RoleListResponse> {
    return this.roleService.getRoles(params);
  }

  @Version('1')
  @Get('enabled')
  async getEnabledRoles(): Promise<Role[]> {
    return this.roleService.getEnabledRoles();
  }

  @Version('1')
  @Get('exists/code')
  async checkCodeExists(@Query('code') code: string): Promise<boolean> {
    return this.roleService.checkCodeExists(code);
  }

  @Version('1')
  @Get(':id')
  async getRoleById(@Param('id', ParseIntPipe) id: number): Promise<Role> {
    return this.roleService.getRoleById(id);
  }

  @Version('1')
  @Get(':id/permissions')
  async getRolePermissionIds(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<number[]> {
    return this.roleService.getRolePermissionIds(id);
  }

  @Version('1')
  @Post()
  async createRole(@Body() data: CreateRoleRequest): Promise<number> {
    return this.roleService.createRole(data);
  }

  @Version('1')
  @Put(':id')
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateRoleRequest,
  ): Promise<void> {
    return this.roleService.updateRole(id, data);
  }

  @Version('1')
  @Put(':id/enable')
  async enableRole(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.roleService.enableRole(id);
  }

  @Version('1')
  @Put(':id/disable')
  async disableRole(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.roleService.disableRole(id);
  }

  @Version('1')
  @Put(':id/permissions')
  async assignPermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() permissionIds: number[],
  ): Promise<void> {
    return this.roleService.assignPermissions(id, permissionIds);
  }

  @Version('1')
  @Delete(':id')
  async deleteRole(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.roleService.deleteRole(id);
  }

  @Version('1')
  @Delete('batch')
  async deleteRoles(@Body() ids: number[]): Promise<void> {
    return this.roleService.deleteRoles(ids);
  }
}