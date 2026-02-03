import { IsString, IsEnum, IsNumber, IsPositive, ValidateNested, ArrayMinSize } from 'class-validator';

export type ServiceStatusType = 'healthy' | 'unhealthy';

/**
 * DTO for individual service status
 */
export class ServiceStatusDto {
  @IsString()
  name!: string;

  @IsString()
  url!: string;

  @IsEnum(['healthy', 'unhealthy'], {
    message: "status must be 'healthy' or 'unhealthy'",
  })
  status!: ServiceStatusType;

  @IsNumber()
  @IsPositive()
  lastCheck!: number;

  @IsNumber()
  @IsPositive()
  responseTime!: number;
}

/**
 * DTO for health check event broadcast
 */
export class HealthCheckEventDto {
  @IsNumber()
  @IsPositive()
  timestamp!: number;

  @ValidateNested({ each: true })
  @ArrayMinSize(1, {
    message: 'At least one service status must be provided',
  })
  services!: ServiceStatusDto[];
}

/**
 * DTO for health check error response
 */
export class HealthCheckErrorDto {
  @IsNumber()
  statusCode!: number;

  @IsString()
  message!: string;

  @IsString()
  error!: string;

  @IsNumber()
  timestamp!: number;
}
