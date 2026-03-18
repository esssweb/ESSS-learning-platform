import { Gender } from '../../../domain/enums/gender.enum';

export class UpdateUserRequestDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profilePicture?: string;
  gender?: Gender;
  password?: string;
  isActive?: boolean;
}
