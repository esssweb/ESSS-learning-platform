import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    // Environment configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database configuration
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadModels: true,
      synchronize: false, // Use migrations instead
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
    }),

    // Feature modules will be imported here
    // AuthModule,
    // UsersModule,
    // CoursesModule,
    // etc.
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
