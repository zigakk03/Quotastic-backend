import { Module } from '@nestjs/common';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';
import { Like } from 'entities/like.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'modules/user/user.module';
import { Quote } from 'entities/quote.entity';
import { User } from 'entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QuoteService } from 'modules/quote/quote.service';
import { UserService } from 'modules/user/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Like, Quote, User]),
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: `${configService.get('JWT_SECRET_EXPIRES')}s` },
      }),
    }),
  ],
  controllers: [LikeController],
  providers: [
    LikeService,
    QuoteService,
    UserService,
  ],
  exports: [LikeService]
})
export class LikeModule {}
