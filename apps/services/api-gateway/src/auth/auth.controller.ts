import {
  Controller,
  Post,
  Body,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RegisterDto, LoginDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    try {
      const result = await this.authService.register(dto);
      return result;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Registration failed',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    try {
      const result = await this.authService.login(dto);
      return result;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Login failed',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('validate')
  @UseGuards(JwtAuthGuard)
  async validate(@Headers('authorization') auth: string) {
    try {
      const token = auth.split(' ')[1];
      const result = await this.authService.validate(token);
      return result;
    } catch (error) {
      throw new HttpException(
        'Token validation failed',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Headers('authorization') auth: string) {
    try {
      const token = auth.split(' ')[1];
      const result = await this.authService.validate(token);
      return result;
    } catch (error) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }
}
