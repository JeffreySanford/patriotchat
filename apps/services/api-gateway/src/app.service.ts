import { Injectable, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class AppService {
  constructor(@Inject(HttpService) private readonly httpService: HttpService) {}

  checkBackendServices(): Observable<boolean> {
    return this.httpService.get('http://localhost:4001/health', { timeout: 2000 }).pipe(
      map(() => true),
      catchError(() => of(false)),
    );
  }
}
