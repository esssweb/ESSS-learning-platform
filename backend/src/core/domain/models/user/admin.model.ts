import { User, UserProps } from './user.model';
import { UserRole } from '../../enums/user-role.enum';

export interface AdminProps extends UserProps {
  department?: string;
  hireDate: Date;
}

export class Admin extends User {
  private adminProps: AdminProps;

  constructor(props: AdminProps) {
    super({ ...props, role: UserRole.ADMIN });
    this.adminProps = props;
  }

  get department(): string | undefined {
    return this.adminProps.department;
  }

  get hireDate(): Date {
    return this.adminProps.hireDate;
  }

  updateDepartment(department: string): void {
    this.adminProps.department = department;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      department: this.department,
      hireDate: this.hireDate,
    };
  }
}
