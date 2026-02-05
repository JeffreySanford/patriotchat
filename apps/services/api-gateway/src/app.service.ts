import { Injectable, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AUTH_URL } from '@patriotchat/env';

@Injectable()
export class AppService {
  constructor(@Inject(HttpService) private readonly httpService: HttpService) {}

  checkBackendServices(): Observable<boolean> {
    return this.httpService.get(`${AUTH_URL}/health`, { timeout: 2000 }).pipe(
      map(() => true),
      catchError(() => of(false)),
    );
  }
}
