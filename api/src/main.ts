/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap(): Promise<void> {
  const app: INestApplication = await NestFactory.create(AppModule);
  const globalPrefix: string = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port: number = parseInt(process.env.PORT ?? '3000', 10);
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

void bootstrap();
