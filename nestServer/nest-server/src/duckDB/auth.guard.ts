import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const { accessToken } = request.body;

    try {
      const payload = await this.jwtService.verify(accessToken);

      request.userId = payload.sub;
      request.email = payload.email;
      request.name = payload.name;
      return true;
    } catch {
      throw new ForbiddenException('Invalid Token');
    }
  }
}
