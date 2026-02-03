import { Module } from '@nestjs/common';
import { InferenceController } from './inference.controller';
import { InferenceService } from './inference.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Module({
  controllers: [InferenceController],
  providers: [InferenceService, JwtAuthGuard],
  exports: [InferenceService],
})
export class InferenceModule {}
