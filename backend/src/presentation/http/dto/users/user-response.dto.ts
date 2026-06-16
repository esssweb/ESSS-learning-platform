import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '../../../../core/domain/enums/gender.enum';
import { UserRole } from '../../../../core/domain/enums/user-role.enum';

export class UserResponseHttpDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiPropertyOptional()
  phoneNumber?: string;

  @ApiPropertyOptional()
  profilePicture?: string;

  @ApiPropertyOptional({ enum: Gender })
  gender?: Gender;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiPropertyOptional()
  createdAt?: Date;

  @ApiPropertyOptional()
  updatedAt?: Date;
}

export class ListUsersResponseHttpDto {
  @ApiProperty({ type: () => [UserResponseHttpDto] })
  data: UserResponseHttpDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
