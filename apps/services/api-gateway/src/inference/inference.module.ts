import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { InferenceController } from './inference.controller';
import { InferenceService } from './inference.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Module({
  imports: [HttpModule],
  controllers: [InferenceController],
  providers: [InferenceService, JwtAuthGuard],
  exports: [InferenceService, HttpModule],
})
export class InferenceModule {}
