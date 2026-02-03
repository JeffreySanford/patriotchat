import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { RateLimitingModule } from './rate-limiting/rate-limiting.module';
import { InferenceModule } from './inference/inference.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 10,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret-change-in-prod',
      signOptions: { expiresIn: '24h' },
    }),
    AuthModule,
    InferenceModule,
    RateLimitingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
