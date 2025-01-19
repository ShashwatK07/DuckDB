import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/user/schemas/user.schema';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.conroller';
import { jwtModule } from 'src/module.config';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    PassportModule,
    jwtModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
