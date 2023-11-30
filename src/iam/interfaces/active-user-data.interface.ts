import { PermissionType } from 'iam/authorization/permission.type';
import { Role } from 'users/enums/role.enum';

export interface ActiveUserData {
  /**
   * The user's id.
   */
  sub: number;
  /**
   * The user's email
   */
  email: string;

  /**
   * The user's role.
   */
  role: Role;

  /**
   * The user's permission.
   */
  permission: PermissionType[];
}
