import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DuckDBModule } from './duckDB/duckdb.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { jwtModule } from './module.config';
import { AuthModule } from './auth/auth.module';
import { ClerkMiddleware } from './middleware/clerk.middleware';
import { DuckDBController } from './duckDB/duckdb.controller';
import { requireAuth } from '@clerk/express';

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
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(requireAuth({ signInUrl: 'http://localhost:5173' }))
      .forRoutes(DuckDBController);
  }
}
