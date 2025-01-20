import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class UploadFileDto {
  @IsString()
  message: string;
  @IsString()
  fileUrl: string;
}

export class FileUrlDto {
  @IsString()
  fileUrl: string;
}

export class UserDto {
  @IsString()
  @IsNotEmpty()
  clerkId: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;
}

export class UpdateUserDto extends PartialType(UserDto) {}
