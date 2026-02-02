import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private appService: AppService) {}

  @Get('/health')
  health(@Res() res: Response) {
    return res.status(200).json({
      status: 'ok',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
    });
  }

  @Get('/ready')
  async ready(@Res() res: Response) {
    const ready = await this.appService.checkBackendServices();
    if (ready) {
      return res.status(200).json({ status: 'ready' });
    }
    return res.status(503).json({ status: 'not ready' });
  }
}
