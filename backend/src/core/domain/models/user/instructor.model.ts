import { User, UserProps } from './user.model';
import { UserRole } from '../../enums/user-role.enum';

export interface InstructorProps extends UserProps {
  bio?: string;
  expertise: string[];
  hireDate: Date;
}

export class Instructor extends User {
  private instructorProps: InstructorProps;

  constructor(props: InstructorProps) {
    super({ ...props, role: UserRole.INSTRUCTOR });
    this.instructorProps = props;
  }

  get bio(): string | undefined {
    return this.instructorProps.bio;
  }

  get expertise(): string[] {
    return this.instructorProps.expertise;
  }

  get hireDate(): Date {
    return this.instructorProps.hireDate;
  }

  updateBio(bio: string): void {
    this.instructorProps.bio = bio;
  }

  addExpertise(skill: string): void {
    if (!this.instructorProps.expertise.includes(skill)) {
      this.instructorProps.expertise.push(skill);
    }
  }

  removeExpertise(skill: string): void {
    this.instructorProps.expertise = this.instructorProps.expertise.filter((s) => s !== skill);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      bio: this.bio,
      expertise: this.expertise,
      hireDate: this.hireDate,
    };
  }
}
