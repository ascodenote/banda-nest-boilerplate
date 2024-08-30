import { SetMetadata } from '@nestjs/common';
import { ClientPermission } from '../../permission/permission.enum';

export const PERMISSIONS_METEDATA_KEY = 'permissions_decorator_key';

export const Permissions = (...permissions: ClientPermission[]) =>
  SetMetadata(PERMISSIONS_METEDATA_KEY, permissions);
