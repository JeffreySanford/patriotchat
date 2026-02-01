import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PipelineTelemetryService } from './pipeline-telemetry.service';
import { TelemetryGateway } from './telemetry.gateway';

@Module({
  imports: [HttpModule],
  controllers: [AppController],
  providers: [AppService, PipelineTelemetryService, TelemetryGateway],
})
export class AppModule {}
