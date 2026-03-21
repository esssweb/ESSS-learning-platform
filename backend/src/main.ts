import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from '@presentation/http/fillters/http-exception.filter';
import { DomainExceptionFilter } from '@presentation/http/fillters/domain-exception.filter';
import { AllExceptionsFilter } from '@presentation/http/fillters/all-exceptions.filter';
import { LoggingInterceptor } from '@presentation/http/interceptors/logging.interceptor';
import { TransformInterceptor } from '@presentation/http/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new DomainExceptionFilter(),
    new AllExceptionsFilter(),
  );

  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

  // CORS configuration
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('ESSS Learning Platform API')
    .setDescription('Backend API for ESSS Learning Management System')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('courses', 'Course management')
    .addTag('content', 'Content management')
    .addTag('subscriptions', 'Course subscriptions')
    .addTag('progress', 'Progress tracking')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
