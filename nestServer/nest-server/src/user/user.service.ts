import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { UserDto, UpdateUserDto } from '../duckDB/dtos';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async create(userDto: UserDto): Promise<User> {
    const newUser = new this.userModel(userDto);
    return newUser.save();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async handleUserCreated(eventData: any): Promise<User> {
    const { id, email_addresses, first_name, last_name } = eventData;

    const userDto: UserDto = {
      clerkId: id,
      email: email_addresses[0]?.email_address,
      firstName: first_name,
      lastName: last_name,
    };

    console.log('Creating user:', userDto);
    return this.create(userDto);
  }

  async handleUserUpdated(eventData: any): Promise<User> {
    const { id, first_name, last_name } = eventData;

    const updateUserDto: UpdateUserDto = {
      firstName: first_name,
      lastName: last_name,
    };

    console.log('Updating user:', id, updateUserDto);
    return this.update(id, updateUserDto);
  }

  async handleUserDeleted(eventData: any): Promise<void> {
    const { id } = eventData;

    console.log('Deleting user:', id);
    return this.remove(id);
  }
}
