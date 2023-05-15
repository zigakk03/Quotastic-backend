import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = process.env.PORT || 8080
  await app.listen(PORT)

  Logger.log(`App is listening on: ${await app.getUrl()}`)
}
bootstrap();
