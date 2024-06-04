import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe());

  app.use(cookieParser());

  app.use('/files', express.static('files'));

  const config = new DocumentBuilder()
    .setTitle('Quotastic API')
    .setDescription('This is API for Quotastic web app.')
    .setVersion('1.0.2')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/', app, document);

  const PORT = process.env.PORT || 8080;
  await app.listen(PORT);

  Logger.log(`App is listening on: ${await app.getUrl()}`);
}
bootstrap();
