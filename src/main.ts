import { NestFactory } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { TypedConfigService } from './common/config/typed-config.service';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ThrottlerExceptionFilter } from './throttler-exception.filter';
import { join } from 'path';
import * as express from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import * as requestId from 'express-request-id';
import { LoggingInterceptor } from './logging/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.use(requestId());

  const configService = app.get(TypedConfigService);
  const loggingInterceptor = app.get(LoggingInterceptor);

  // Enable CORS
  app.enableCors();

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  // Global exception filters
  app.useGlobalFilters(
    new HttpExceptionFilter(app.get(WINSTON_MODULE_NEST_PROVIDER)),
    new ThrottlerExceptionFilter(),
  );
  
  // Global logging interceptor
  app.useGlobalInterceptors(loggingInterceptor);

  // Swagger configuration - only in non-production environments
  if (configService.nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Stark Insured API')
      .setDescription(
        'Comprehensive API documentation for the Stark Insured backend',
      )
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true, // This will remember your token when you refresh the page
      },
    });
  }

  // Global class serializer interceptor to handle DTOs
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Global prefix for all routes
  app.setGlobalPrefix('api/v1');

  // Serve static files from /uploads
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  await app.listen(configService.port);
}
bootstrap();
