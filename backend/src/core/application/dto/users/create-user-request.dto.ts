import { Gender } from '../../../domain/enums/gender.enum';
import { UserRole } from '../../../domain/enums/user-role.enum';

export class CreateUserRequestDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profilePicture?: string;
  gender?: Gender;
  role: UserRole;
}
