import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from './file-upload.service';
import { imageMulterConfig } from '@/config/file-upload.config';
import { type Express } from 'express';

@Controller('upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file', imageMulterConfig))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const url = await this.fileUploadService.uploadImage(file);
    return { url };
  }

  @Post('logo/:userId')
  @UseInterceptors(FileInterceptor('file', imageMulterConfig))
  async uploadLogo(
    @UploadedFile() file: Express.Multer.File,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return await this.fileUploadService.updateLogoPath(userId, file);
  }

  @Get('logo')
  async getLogoActive() {
    return await this.fileUploadService.getLogoActive();
  }
}
