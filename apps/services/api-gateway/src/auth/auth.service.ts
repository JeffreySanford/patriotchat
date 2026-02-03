import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { RegisterDto, LoginDto } from './dto';

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
  private authServiceUrl: string = process.env.AUTH_SERVICE_URL || 'http://localhost:4001';

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await axios.post<AuthResponse>(
      `${this.authServiceUrl}/auth/register`,
      dto,
    );
    return response.data;
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await axios.post<AuthResponse>(
        `${this.authServiceUrl}/auth/login`,
        dto,
      );
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { status: number; data: unknown }; message: string };
      console.error('Auth service login error:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message,
        url: `${this.authServiceUrl}/auth/login`,
      });
      throw error;
    }
  }

  async validate(token: string): Promise<ValidateResponse> {
    const response: AxiosResponse<ValidateResponse> = await axios.get<ValidateResponse>(
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
