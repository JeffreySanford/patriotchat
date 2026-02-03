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
      const result = await this.authService.register(dto);
      return result;
    } catch (error: unknown) {
      const err = error as any;
      throw new HttpException(
        err.response?.data || 'Registration failed',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('login')
  async login(@Body() dto: LoginDto): Promise<AuthResponse> {
    try {
      const result = await this.authService.login(dto);
      return result;
    } catch (error: unknown) {
      const err = error as any;
      const statusCode = err.response?.status || 500;
      const message = err.response?.data?.error || err.response?.data || 'Login failed';
      console.error('Auth controller login error:', { statusCode, message, error });
      throw new HttpException(message, statusCode);
    }
  }

  @Get('validate')
  @UseGuards(JwtAuthGuard)
  async validate(@Headers('authorization') auth: string): Promise<ValidateResponse> {
    try {
      const token = auth.split(' ')[1];
      const result = await this.authService.validate(token);
      return result;
    } catch (error: unknown) {
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
      const token = auth.split(' ')[1];
      const result = await this.authService.validate(token);
      return result;
    } catch (error: unknown) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }
}
