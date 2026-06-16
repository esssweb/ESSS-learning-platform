import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  IsUUID,
  ForeignKey,
} from 'sequelize-typescript';
import { AuthEntity } from './auth.entity';

@Table({
  tableName: 'users',
  timestamps: true,
  underscored: true,
})
export class UserEntity extends Model {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => AuthEntity)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    unique: true,
    field: 'auth_id',
  })
  authId: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: 'first_name',
  })
  firstName: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: 'last_name',
  })
  lastName: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    unique: true,
    field: 'phone_number',
  })
  phoneNumber: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'profile_picture',
  })
  profilePicture: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  gender: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    defaultValue: 'STUDENT',
  })
  role: string;
}
