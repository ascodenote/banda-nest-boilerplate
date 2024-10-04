import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { IS_REFRESH_KEY } from '../decorators/refresh.decorator';

@Injectable()
export class JwtRefreshV1Guard extends AuthGuard('jwt-refresh-token-v1') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    console.info('Ini Guard Header');
    const isRefresh = this.reflector.getAllAndOverride<boolean>(
      IS_REFRESH_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isPublic) {
      // If isRefresh is undefined, bypass the guard
      if (isRefresh === undefined) {
        return true;
      }

      // If isRefresh is true, activate the guard
      if (isRefresh) {
        return super.canActivate(context);
      }

      // If isRefresh is false, bypass the guard
      return true;
    }

    // If isPublic is false, activate the guard (default behavior)
    return super.canActivate(context);
  }
}
