import { Module } from '@nestjs/common';
import { InferenceController } from './inference.controller';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Module({
  controllers: [InferenceController],
  providers: [JwtAuthGuard],
})
export class InferenceModule {}
