import { Gender } from '../../../domain/enums/gender.enum';

export class RegisterRequestDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  verificationToken: string;
  phoneNumber?: string;
  gender?: Gender;
  deviceToken?: string;
  deviceName?: string;
  deviceType?: string;
}
