import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ORMConfig } from 'config/orm.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => ORMConfig(),
    }),
  ],
})
export class DatabaseModule {}
