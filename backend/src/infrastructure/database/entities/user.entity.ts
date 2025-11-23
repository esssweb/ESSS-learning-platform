import { Table, Column, Model, DataType, PrimaryKey, Default, IsUUID } from 'sequelize-typescript';

@Table({
  tableName: 'users',
  timestamps: true,
})
export class UserEntity extends Model {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

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
    type: DataType.ENUM('MALE', 'FEMALE', 'OTHER'),
    allowNull: true,
  })
  gender: string;

  @Column({
    type: DataType.ENUM('STUDENT', 'INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'),
    allowNull: false,
  })
  role: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  isActive: boolean;

  // Role-specific fields
  @Column({
    type: DataType.ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED'),
    allowNull: true,
  })
  level: string; // For students

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  bio: string; // For instructors

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
    defaultValue: [],
  })
  expertise: string[]; // For instructors

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  department: string; // For admins

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
    defaultValue: [],
  })
  permissions: string[]; // For super admins

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  enrollmentDate: Date; // For students

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  hireDate: Date; // For instructors/admins/super admins
}
