import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
// eslint-disable-next-line @nx/enforce-module-boundaries
import helmet from 'helmet';

async function bootstrap(): Promise<void> {
  const app: NestExpressApplication =
    await NestFactory.create<NestExpressApplication>(AppModule);

  // Security middleware
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: process.env['CORS_ORIGIN'] || 'http://localhost:4200',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  const port: number = parseInt(process.env['PORT'] || '3000', 10);
  await app.listen(port);
  console.log(`API Gateway listening on port ${port}`);
}

void bootstrap();
