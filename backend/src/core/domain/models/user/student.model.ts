import { User, UserProps } from './user.model';
import { StudentLevel } from '../../enums/student-level.enum';
import { UserRole } from '../../enums/user-role.enum';

export interface StudentProps extends UserProps {
  level: StudentLevel;
  enrollmentDate: Date;
}

export class Student extends User {
  private studentProps: StudentProps;

  constructor(props: StudentProps) {
    super({ ...props, role: UserRole.STUDENT });
    this.studentProps = props;
  }

  get level(): StudentLevel {
    return this.studentProps.level;
  }

  get enrollmentDate(): Date {
    return this.studentProps.enrollmentDate;
  }

  updateLevel(newLevel: StudentLevel): void {
    this.studentProps.level = newLevel;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      level: this.level,
      enrollmentDate: this.enrollmentDate,
    };
  }
}
