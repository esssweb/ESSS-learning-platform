import { UserRole } from '../../../domain/enums/user-role.enum';
import { Gender } from '../../../domain/enums/gender.enum';

export class RegisterRequestDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  gender?: Gender;
  role: UserRole;
  deviceToken?: string;
  deviceName?: string;
  deviceType?: string;
}
