import { Injectable, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Observable } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { RegisterDto, LoginDto } from './dto';
import { ErrorResponse } from '../types/api.dto';

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    tier: string;
    created_at: string;
  };
  expires_at: string;
}

export interface ValidateResponse {
  valid: boolean;
  user_id: string;
}

@Injectable()
export class AuthService {
  private readonly authServiceUrl: string =
    process.env.AUTH_SERVICE_URL || 'http://localhost:4001';

  constructor(@Inject(HttpService) private readonly httpService: HttpService) {
    console.log(
      '[AuthService] Constructor - HttpService available:',
      !!httpService,
    );
  }

  register(dto: RegisterDto): Observable<AuthResponse> {
    return this.httpService
      .post<AuthResponse>(`${this.authServiceUrl}/auth/register`, dto)
      .pipe(map((response: { data: AuthResponse }) => response.data));
  }

  login(dto: LoginDto): Observable<AuthResponse> {
    return this.httpService
      .post<AuthResponse>(`${this.authServiceUrl}/auth/login`, dto)
      .pipe(
        tap((response: { data: AuthResponse }) => {
          console.log('[AuthService] Login response from auth microservice:', {
            hasToken: !!response.data.token,
            tokenLength: response.data.token?.length || 0,
            tokenValue: response.data.token
              ? `${response.data.token.substring(0, 30)}...`
              : 'NO_TOKEN',
            fullResponse: response.data,
          });
        }),
        map((response: { data: AuthResponse }) => response.data),
        catchError((error: Error | ErrorResponse) => {
          const errRecord: ErrorResponse = error as ErrorResponse;
          console.error('Auth service login error:', {
            status: errRecord?.response?.status,
            data: errRecord?.response?.data,
            message: errRecord?.message,
            url: `${this.authServiceUrl}/auth/login`,
          });
          throw error;
        }),
      );
  }

  validate(token: string): Observable<ValidateResponse> {
    return this.httpService
      .get<ValidateResponse>(`${this.authServiceUrl}/auth/validate`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .pipe(map((response: { data: ValidateResponse }) => response.data));
  }
}
