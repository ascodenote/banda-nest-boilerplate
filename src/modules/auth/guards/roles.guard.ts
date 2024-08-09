import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { User } from '../../user/entities/user.entity';
import { ROLES_METEDATA_KEY } from '../decorators/roles.decorator';
import { ClientRole } from '../enums/role.enum';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredClientRoles = this.reflector.getAllAndOverride<
      ClientRole[] | undefined
    >(ROLES_METEDATA_KEY, [context.getHandler(), context.getClass()]);

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    if (!requiredClientRoles || requiredClientRoles.length === 0) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const user: Partial<User> = req.user;
    // console.log(requiredClientRoles.includes(user.role?.name))

    return requiredClientRoles.includes(user.role?.name);
  }
}
