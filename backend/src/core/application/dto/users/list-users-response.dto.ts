import { UserResponseDto } from './user-response.dto';

export class ListUsersResponseDto {
  data: UserResponseDto[];
  total: number;
  page: number;
  limit: number;
}
