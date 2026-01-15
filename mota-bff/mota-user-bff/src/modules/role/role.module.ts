import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { ServiceClientModule } from '../../common/service-client/service-client.module';

@Module({
  imports: [ServiceClientModule],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}