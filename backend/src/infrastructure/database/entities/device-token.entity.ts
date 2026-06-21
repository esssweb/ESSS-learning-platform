import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  IsUUID,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { UserEntity } from './user.entity';

@Table({
  tableName: 'device_tokens',
  timestamps: true,
  underscored: true,
})
export class DeviceTokenEntity extends Model {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => UserEntity)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId: string;

  @BelongsTo(() => UserEntity)
  user: UserEntity;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  firebaseToken: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  deviceName: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  deviceType: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  isActive: boolean;
}
