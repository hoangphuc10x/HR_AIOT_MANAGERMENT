import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Logo } from './entities/logo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Logo])],
  providers: [FileUploadService],
  controllers: [FileUploadController],
  exports: [FileUploadService],
})
export class FileUploadModule {}
