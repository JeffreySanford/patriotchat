import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';
import { tap, catchError } from 'rxjs/operators';
import { of, Observable } from 'rxjs';

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
  ready(@Res() res: Response) {
    const readiness$: Observable<boolean> = this.appService
      ?.checkBackendServices
      ? this.appService.checkBackendServices()
      : of(false);

    readiness$
      .pipe(
        tap((ready: boolean) => {
          if (ready) {
            return res.status(200).json({ status: 'ready' });
          }
          return res.status(503).json({ status: 'not ready' });
        }),
        catchError(() => {
          res.status(503).json({ status: 'not ready' });
          return of(false);
        }),
      )
      .subscribe();
  }
}
