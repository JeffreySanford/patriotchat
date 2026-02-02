import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(3)
  username!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  constructor(data?: Partial<RegisterDto>) {
    Object.assign(this, data);
  }
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  constructor(data?: Partial<LoginDto>) {
    Object.assign(this, data);
  }
}

