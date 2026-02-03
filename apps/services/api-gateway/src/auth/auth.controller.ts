import {
  Controller,
  Post,
  Body,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  UseGuards,
  Inject,
  HttpCode,
} from '@nestjs/common';
import { AuthService, AuthResponse, ValidateResponse } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RegisterDto, LoginDto } from './dto';
import { ErrorResponse } from '../types/api.dto';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(201)
  register(@Body() dto: RegisterDto): Observable<AuthResponse> {
    return this.authService.register(dto).pipe(
      catchError((err: Error | ErrorResponse) => {
        const errResponse: ErrorResponse = err as ErrorResponse;
        const status: number =
          errResponse?.response?.status ??
          errResponse?.response?.statusCode ??
          HttpStatus.INTERNAL_SERVER_ERROR;
        const data: string | Record<string, string> =
          errResponse?.response?.data ?? 'Registration failed';
        throw new HttpException(data, status);
      }),
    );
  }

  @Post('login')
  @HttpCode(201)
  login(@Body() dto: LoginDto): Observable<AuthResponse> {
    return this.authService.login(dto).pipe(
      tap((result: AuthResponse) => {
        console.log('[AuthController] Login response:', {
          hasToken: !!result.token,
          tokenLength: result.token?.length || 0,
          tokenValue: result.token
            ? `${result.token.substring(0, 30)}...`
            : 'NO_TOKEN',
          result,
        });
      }),
      catchError((err: Error | ErrorResponse) => {
        const errResponse: ErrorResponse = err as ErrorResponse;
        const statusCode: number =
          errResponse?.response?.status ??
          errResponse?.response?.statusCode ??
          500;
        const errorData: Record<string, string> | string | undefined =
          errResponse?.response?.data;
        let message: string = 'Login failed';
        if (typeof errorData === 'string') {
          message = errorData;
        } else if (typeof errorData === 'object' && errorData !== null) {
          message =
            (errorData as Record<string, string>).error ??
            (errorData as Record<string, string>).message ??
            'Login failed';
        }
        console.error('Auth controller login error:', {
          statusCode,
          message,
          err,
        });
        throw new HttpException(message, statusCode);
      }),
    );
  }

  @Get('validate')
  @UseGuards(JwtAuthGuard)
  validate(
    @Headers('authorization') auth: string,
  ): Observable<ValidateResponse> {
    return this.authService.validate(auth.split(' ')[1]).pipe(
      catchError(() => {
        throw new HttpException(
          'Token validation failed',
          HttpStatus.UNAUTHORIZED,
        );
      }),
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Headers('authorization') auth: string): Observable<ValidateResponse> {
    return this.authService.validate(auth.split(' ')[1]).pipe(
      catchError(() => {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }),
    );
  }
}
