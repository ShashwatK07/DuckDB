import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Req,
  Res,
  Headers,
  HttpException,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto, UpdateUserDto } from '../duckDB/dtos';
import { Webhook } from 'svix';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { WebhookEvent } from '@clerk/clerk-sdk-node';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  @Get()
  getProfile(@Req() req: Request) {
    const user = req.body;
    return user;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Post('webhook')
  async handleClerkWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers() headers: Record<string, string>,
  ) {
    const SIGNING_SECRET = process.env.SIGNING_SECRET;

    if (!SIGNING_SECRET) {
      throw new HttpException(
        'Error: Please add SIGNING_SECRET from Clerk Dashboard to .env',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const svixId = headers['svix-id'] || '';
    const svixTimestamp = headers['svix-timestamp'] || '';
    const svixSignature = headers['svix-signature'] || '';

    if (!svixId || !svixTimestamp || !svixSignature) {
      throw new BadRequestException('Missing required Svix headers');
    }

    const body = req.body;
    const bodyString = JSON.stringify(body);

    // Logger.debug(SIGNING_SECRET, bodyString);

    const wh = new Webhook(SIGNING_SECRET);

    let event: WebhookEvent;
    try {
      event = wh.verify(bodyString, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as WebhookEvent;

      Logger.debug(event);
    } catch (error) {
      console.error('Webhook verification failed:', error.message);
      throw new BadRequestException('Invalid webhook signature');
    }

    const { type, data } = event;
    Logger.log(`Received webhook of type: ${type}`);
    Logger.log('Webhook payload:', data);

    let userPayload;
    let accessToken;

    if (type === 'user.created') {
      const { id, email_addresses, first_name, last_name } = data;

      userPayload = await this.userService.create({
        clerkId: id,
        email: email_addresses[0]?.email_address,
        firstName: first_name,
        lastName: last_name,
      });
    }

    res.status(200).send({ success: true });
  }
}
