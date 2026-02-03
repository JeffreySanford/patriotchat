import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
