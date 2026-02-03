import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
// eslint-disable-next-line @nx/enforce-module-boundaries
import helmet from 'helmet';

async function bootstrap(): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-explicit-any
  const app: any = await NestFactory.create(AppModule);

  // Security middleware
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app.use(helmet());

  // CORS
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app.enableCors({
    origin: process.env['CORS_ORIGIN'] || 'http://localhost:4200',
    credentials: true,
  });

  // Global validation pipe
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  const port: number = parseInt(process.env['PORT'] || '3000', 10);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  await app.listen(port);
  console.log(`API Gateway listening on port ${port}`);
}

void bootstrap();
