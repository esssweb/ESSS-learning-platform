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
import { DeviceTokenEntity } from './device-token.entity';

@Table({
  tableName: 'refresh_tokens',
  timestamps: true,
  updatedAt: false,
  underscored: true,
})
export class RefreshTokenEntity extends Model {
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
    unique: true,
  })
  token: string;

  @ForeignKey(() => DeviceTokenEntity)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  deviceTokenId: string;

  @BelongsTo(() => DeviceTokenEntity)
  deviceToken: DeviceTokenEntity;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  expiresAt: Date;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isRevoked: boolean;
}
