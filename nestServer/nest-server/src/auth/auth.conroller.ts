import { Controller, Post, Get, Body, Query, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @Post('signup')
  // async signup(@Body() body: { email: string; password: string }) {
  //   const user = await this.authService.signup(body.email, body.password);
  //   return { message: 'Signup successful', user };
  // }

  // @Post('login')
  // async login(@Body() body: { email: string; password: string }) {
  //   const user = await this.authService.validateUser(body.email, body.password);
  //   return this.authService.login(user);
  // }

  @Get()
  async getUser(@Res() res: Response) {
    return await this.authService.getUsers(res as Response);
  }

  @Get('signup')
  async signup(@Query() query: { email: string; id: string }) {
    const user = await this.authService.signup(query.email, query.id);
    return { message: 'Signup successful', user };
  }

  @Get('login')
  async login(
    @Query() query: { email: string; id: string },
    @Res() res: Response,
  ) {
    const user = await this.authService.validateUser(query.email, query.id);
    return this.authService.login(user, res as Response);
  }
}
