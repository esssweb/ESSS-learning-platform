import { PhoneNumber } from '../../value-objects/phone-number.vo';
import { UserRole } from '../../enums/user-role.enum';
import { Gender } from '../../enums/gender.enum';

export interface UserProps {
  id?: string;
  authId: string;
  firstName: string;
  lastName: string;
  phoneNumber?: PhoneNumber;
  profilePicture?: string;
  gender?: Gender;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  private props: UserProps;

  constructor(props: UserProps) {
    this.props = props;
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get authId(): string {
    return this.props.authId;
  }

  get firstName(): string {
    return this.props.firstName;
  }

  get lastName(): string {
    return this.props.lastName;
  }

  get fullName(): string {
    return `${this.props.firstName} ${this.props.lastName}`;
  }

  get phoneNumber(): PhoneNumber | undefined {
    return this.props.phoneNumber;
  }

  get profilePicture(): string | undefined {
    return this.props.profilePicture;
  }

  get gender(): Gender | undefined {
    return this.props.gender;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  updateProfile(updates: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: PhoneNumber;
    profilePicture?: string;
    gender?: Gender;
  }): void {
    if (updates.firstName) this.props.firstName = updates.firstName;
    if (updates.lastName) this.props.lastName = updates.lastName;
    if (updates.phoneNumber) this.props.phoneNumber = updates.phoneNumber;
    if (updates.profilePicture) this.props.profilePicture = updates.profilePicture;
    if (updates.gender) this.props.gender = updates.gender;
  }

  hasRole(role: UserRole): boolean {
    return this.props.role === role;
  }

  toJSON() {
    return {
      id: this.id,
      authId: this.authId,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.fullName,
      phoneNumber: this.phoneNumber?.getValue(),
      profilePicture: this.profilePicture,
      gender: this.gender,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
