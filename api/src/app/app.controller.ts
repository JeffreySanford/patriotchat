import { Controller, Get } from '@nestjs/common';
import { ApiStatusResponse, AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Get('status')
  getStatus(): ApiStatusResponse {
    return this.appService.getStatus();
  }
}
