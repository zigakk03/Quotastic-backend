import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Like } from 'entities/like.entity';
import { Quote } from 'entities/quote.entity';
import { User } from 'entities/user.entity';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
type ConfigType = TypeOrmModuleOptions & PostgresConnectionOptions;
type ConnectionOptions = ConfigType;

export const ORMConfig = async (): Promise<ConnectionOptions> => ({
  type: 'postgres',
  host: process.env.DATABASE_HOST, //configService.get('DATABASE_HOST'),
  port: parseInt(process.env.DATABASE_PORT, 10), //configService.get('DATABASE_PORT'),
  username: process.env.DATABASE_USERNAME, //configService.get('DATABASE_USERNAME'),
  password: process.env.DATABASE_PWD, //configService.get('DATABASE_PWD'),
  database: process.env.DATABASE_NAME, //configService.get('DATABASE_NAME'),
  entities: [User, Quote, Like],
  synchronize: true,
  autoLoadEntities: true,
  //ssl: true,
  /*extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },*/
});
