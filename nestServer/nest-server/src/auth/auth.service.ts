import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { User } from 'src/user/schemas/user.schema';
import { clerkClient, ClerkClient } from '@clerk/clerk-sdk-node';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, id: string): Promise<any> {
    const user = await this.userModel.findOne({ clerkId: id });
    if (user && id) {
      const { clerkId: id, ...result } = user.toObject();
      return result;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async getUsers(res: Response) {
    const users = clerkClient.users.getUserList();
    res.json(users);
  }

  async signup(email: string, id: string): Promise<any> {
    const existingUser = await this.userModel.findOne({ clerkId: id });
    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    // const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new this.userModel({
      email,
      clerkId: id,
    });

    const savedUser = await newUser.save();
    const { clerkId, ...result } = savedUser.toObject();
    return result;
  }

  async login(user: any, res: Response) {
    const payload = { email: user.email, user: user._id };
    const accessToken = this.jwtService.sign(payload);

    res.cookie('accessToken', accessToken, { httpOnly: true });
    return res.redirect(`http://localhost:5173/chat`);
  }
  
}
