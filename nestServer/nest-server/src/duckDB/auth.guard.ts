import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessToken = request.headers.authorization.replace('Bearer ', '');

    try {
      const data = await this.jwtService.verify(accessToken);
      request.userId = data;
      return true;
    } catch {
      throw new UnauthorizedException('User not authorized');
    }
  }
}
