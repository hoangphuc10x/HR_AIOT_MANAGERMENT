import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ResponseInterceptor } from 'src/common/interceptors/response.interceptor';
import { GlobalExceptionFilter } from 'src/common/filters/global-exception.filter';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from 'src/common/validation/validation.pipe';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.enableCors({
    origin: process.env.PORT_ACCEPT || 'http://localhost:3000/',
    credentials: true,
  });
  const config = new DocumentBuilder()
    .setTitle('NestJS Practice')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
