import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DuckDBModule } from './duckDB/duckdb.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { jwtModule } from './module.config';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    DuckDBModule,
    MongooseModule.forRoot(process.env.DB_URL),
    UserModule,
    AuthModule,
    jwtModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
