import { User, UserProps } from './user.model';
import { UserRole } from '../../enums/user-role.enum';

export interface SuperAdminProps extends UserProps {
  permissions: string[];
  hireDate: Date;
}

export class SuperAdmin extends User {
  private superAdminProps: SuperAdminProps;

  constructor(props: SuperAdminProps) {
    super({ ...props, role: UserRole.SUPER_ADMIN });
    this.superAdminProps = props;
  }

  get permissions(): string[] {
    return this.superAdminProps.permissions;
  }

  get hireDate(): Date {
    return this.superAdminProps.hireDate;
  }

  hasPermission(permission: string): boolean {
    return this.superAdminProps.permissions.includes(permission);
  }

  grantPermission(permission: string): void {
    if (!this.hasPermission(permission)) {
      this.superAdminProps.permissions.push(permission);
    }
  }

  revokePermission(permission: string): void {
    this.superAdminProps.permissions = this.superAdminProps.permissions.filter(
      (p) => p !== permission,
    );
  }

  toJSON() {
    return {
      ...super.toJSON(),
      permissions: this.permissions,
      hireDate: this.hireDate,
    };
  }
}
