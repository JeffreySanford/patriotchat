/**
 * Auth API DTOs
 * Shared between backend and frontend for type safety
 */

export interface AuthRegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  name?: string;
  expiresIn?: number;
}

export interface AuthValidateResponse {
  userId: string;
  email: string;
  name?: string;
  tier?: string;
  iat?: number;
  exp?: number;
}
