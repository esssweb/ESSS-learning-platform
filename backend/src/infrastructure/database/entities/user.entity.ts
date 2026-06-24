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
    type: DataType.STRING,
    allowNull: false,
  })
  firstName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  lastName: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  phoneNumber: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
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
