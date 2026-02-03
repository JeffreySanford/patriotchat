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
} from '@nestjs/common';
import { AuthService, AuthResponse, ValidateResponse } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RegisterDto, LoginDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<AuthResponse> {
    try {
      const result: AuthResponse = await this.authService.register(dto);
      return result;
    } catch (err: unknown) {
      const error = err as Record<string, unknown>;
      const status: number = (error.response as Record<string, unknown>)?.status as number | undefined || HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(
        (error.response as Record<string, unknown>)?.data || 'Registration failed',
        status,
      );
    }
  }

  @Post('login')
  async login(@Body() dto: LoginDto): Promise<AuthResponse> {
    try {
      const result: AuthResponse = await this.authService.login(dto);
      return result;
    } catch (err: unknown) {
      const error = err as Record<string, unknown>;
      const statusCode: number = ((error.response as Record<string, unknown>)?.status as number | undefined) || 500;
      const message: string = ((error.response as Record<string, unknown>)?.data as Record<string, unknown>)?.error as string | undefined || (error.response as Record<string, unknown>)?.data as string || 'Login failed';
      console.error('Auth controller login error:', { statusCode, message, error });
      throw new HttpException(message, statusCode);
    }
  }

  @Get('validate')
  @UseGuards(JwtAuthGuard)
  async validate(@Headers('authorization') auth: string): Promise<ValidateResponse> {
    try {
      const token: string = auth.split(' ')[1];
      const result: ValidateResponse = await this.authService.validate(token);
      return result;
    } catch (_err: unknown) {
      throw new HttpException(
        'Token validation failed',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Headers('authorization') auth: string): Promise<ValidateResponse> {
    try {
      const token: string = auth.split(' ')[1];
      const result: ValidateResponse = await this.authService.validate(token);
      return result;
    } catch (_err: unknown) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }
}
