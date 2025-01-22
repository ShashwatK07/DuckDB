import {
  Injectable,
  Logger,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { clerkClient, ClerkClient } from '@clerk/clerk-sdk-node';
import { getAuth } from '@clerk/express';

@Injectable()
export class ClerkMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const { userId } = getAuth(req);
    // const user = await clerkClient.users.getUser(userId);

    // Logger.debug(user);

    // if (!user) {
    //   return res.redirect('http://localhost:5173');
    // }

    // req.body = user;

    // Logger.debug(user);
    Logger.debug(userId)
    next();
  }
}
