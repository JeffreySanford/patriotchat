/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { INestApplication, Logger, RequestMethod } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';

const DEFAULT_PORT: number = 3000;
const ALLOWED_ORIGINS: string[] = [
  'http://localhost:4200',
  'http://127.0.0.1:4200',
  'http://localhost:4205',
  'http://127.0.0.1:4205',
];

async function bootstrap(): Promise<void> {
  const app: INestApplication = await NestFactory.create(AppModule);
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('CORS origin denied'));
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
    exposedHeaders: 'Access-Control-Allow-Origin',
    credentials: true,
    maxAge: 3600,
  });
  app.useWebSocketAdapter(new IoAdapter(app));
  const globalPrefix: string = 'api';
  app.setGlobalPrefix(globalPrefix, {
    exclude: [
      { path: 'telemetry', method: RequestMethod.ALL },
      { path: 'telemetry/:path', method: RequestMethod.ALL },
      { path: 'telemetry/socket.io', method: RequestMethod.ALL },
    ],
  });

  const port: number = Number.parseInt(process.env.PORT ?? `${DEFAULT_PORT}`, 10);
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
  Logger.log(
    `Telemetry socket endpoint available at http://localhost:${port}/telemetry/socket.io`,
  );
}

void bootstrap();
