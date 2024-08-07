import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from './user.service';

import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserInputDto } from './dto/create-user-input.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from './entities/user.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { ClientRole } from '../auth/enums/role.enum';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { ClientPermission } from '../auth/enums/permission.enum';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { Action } from '../auth/enums/actions.enum';

@ApiTags('user')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  @Get('profile')
  getProfile(@CurrentUser() user: User) {
    const ability = this.caslAbilityFactory.createForUser(user);

    if (!ability.can(Action.Update, 'all')) {
      throw new ForbiddenException(`Permission denied`);
    }

    return user;
  }

  @Post()
  create(@Body() createUserDto: CreateUserInputDto) {
    return this.userService.create(createUserDto);
  }

  @Roles(ClientRole.Admin, ClientRole.USER)
  @Permissions(ClientPermission.CreateAnnouncement)
  @Get()
  findAll() {
    return this.userService.findAll();
  }


  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
