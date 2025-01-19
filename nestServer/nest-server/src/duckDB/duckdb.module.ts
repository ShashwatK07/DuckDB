import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DuckDBController } from './duckdb.controller';
import { DuckDBService } from './duckdb.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/user/schemas/user.schema';
import { DatabaseService } from './database.service';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { jwtModule } from 'src/module.config';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    jwtModule,
  ],
  controllers: [DuckDBController],
  providers: [DuckDBService, DatabaseService, AuthGuard],
})
export class DuckDBModule {}
