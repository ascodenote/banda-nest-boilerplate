import { User } from 'src/modules/user/entities/user.entity';
import { ClientRole } from '../enums/role.enum';

export function getClientPermissions(user: Partial<User>): Set<string> {
  // Extract all permissions from the user's roles
  // console.log(user)
  const rolePermissions = new Set<string>(
    (user.role?.permissions ?? []).map((permission) => permission.name),
  );

  return rolePermissions;
}

export const userHasAnyRole = (user: User, roles: ClientRole[]) => {
  return user.role ? roles.includes(user.role.name) : false;
};
