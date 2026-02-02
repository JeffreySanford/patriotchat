import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { RegisterDto, LoginDto } from './dto';

@Injectable()
export class AuthService {
  private authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://patriotchat-auth:4001';

  async register(dto: RegisterDto) {
    const response = await axios.post(
      `${this.authServiceUrl}/auth/register`,
      dto,
    );
    return response.data;
  }

  async login(dto: LoginDto) {
    const response = await axios.post(
      `${this.authServiceUrl}/auth/login`,
      dto,
    );
    return response.data;
  }

  async validate(token: string) {
    const response = await axios.get(
      `${this.authServiceUrl}/auth/validate`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  }
}
