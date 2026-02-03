import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { RegisterDto, LoginDto } from './dto';

@Injectable()
export class AuthService {
  private authServiceUrl: string = process.env.AUTH_SERVICE_URL || 'http://localhost:4001';

  async register(dto: RegisterDto): Promise<any> {
    const response: any = await axios.post(
      `${this.authServiceUrl}/auth/register`,
      dto,
    );
    return response.data;
  }

  async login(dto: LoginDto): Promise<any> {
    const response: any = await axios.post(
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
