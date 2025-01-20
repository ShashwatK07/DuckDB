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
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto, UpdateUserDto } from '../duckDB/dtos';
import { Webhook } from 'svix';
import { Request, Response } from 'express';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll() {
    return this.userService.findAll();
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

    const webhook = new Webhook(SIGNING_SECRET);

    const payload = JSON.stringify(req.body);
    Logger.debug(headers['svix-id']);
    Logger.debug(payload);

    const svixId = headers['svix-id'] as string;
    const svixTimestamp = headers['svix-timestamp'] as string;
    const svixSignature = headers['svix-signature'] as string;

    if (!svixId || !svixTimestamp || !svixSignature) {
      throw new HttpException(
        'Error: Missing Svix headers',
        HttpStatus.BAD_REQUEST,
      );
    }

    let event: any;

    try {
      event = webhook.verify(payload, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      });
    } catch (err) {
      console.error('Error verifying webhook:', err.message);
      throw new HttpException(
        `Webhook verification failed: ${err.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const { type, data } = event;
    Logger.log(`Received webhook of type: ${type}`);
    Logger.log('Webhook payload:', data);

    if (type === 'user.created') {
      const { id, email_addresses, first_name, last_name } = data;

      await this.userService.create({
        clerkId: id,
        email: email_addresses[0]?.email_address,
        firstName: first_name,
        lastName: last_name,
      });
    } else if (type === 'user.updated') {
      const { id, first_name, last_name } = data;

      await this.userService.update(id, {
        firstName: first_name,
        lastName: last_name,
      });
    } else if (type === 'user.deleted') {
      const { id } = data;

      await this.userService.remove(id);
    }

    return res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
    });
  }
}
