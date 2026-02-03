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
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(201)
  register(@Body() dto: RegisterDto): Observable<AuthResponse> {
    return this.authService.register(dto).pipe(
      catchError((err: any) => {
        const status: number = err?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
        throw new HttpException(
          err?.response?.data || 'Registration failed',
          status,
        );
      }),
    );
  }

  @Post('login')
  @HttpCode(201)
  login(@Body() dto: LoginDto): Observable<AuthResponse> {
    return this.authService.login(dto).pipe(
      tap((result) => {
        console.log('[AuthController] Login response:', {
          hasToken: !!result.token,
          tokenLength: result.token?.length || 0,
          tokenValue: result.token ? `${result.token.substring(0, 30)}...` : 'NO_TOKEN',
          result,
        });
      }),
      catchError((err: any) => {
        const statusCode: number = err?.response?.status || 500;
        const message: string = err?.response?.data?.error || err?.response?.data || 'Login failed';
        console.error('Auth controller login error:', { statusCode, message, err });
        throw new HttpException(message, statusCode);
      }),
    );
  }

  @Get('validate')
  @UseGuards(JwtAuthGuard)
  validate(@Headers('authorization') auth: string): Observable<ValidateResponse> {
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
