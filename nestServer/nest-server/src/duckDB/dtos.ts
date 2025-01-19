import { IsString } from 'class-validator';
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
  fullName: string;
  password: string;
  email: string;
  files?: string[];
}

export class UpdateUserDto extends PartialType(UserDto) {}
