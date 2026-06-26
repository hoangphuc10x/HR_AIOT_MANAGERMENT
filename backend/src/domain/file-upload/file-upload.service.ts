import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import { type Express } from 'express';
import { DataSource } from 'typeorm';
import { Logo } from './entities/logo.entity';
import { LogoStatus } from '@/common/enums/logo-status.enum';
import { AuditLog } from '../audit-logs/entities/audit-log.entity';
import { AuditLogActionEnum } from '@/common/enums/audit-log-action.enum';

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);
  constructor(private dataSource: DataSource) {}
  async uploadImage(
    file: Express.Multer.File,
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'avatar_uploads' },
        (error, result) => {
          if (error) return reject(new Error(error.message));
          if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          }
        },
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async uploadLogoImage(
    file: Express.Multer.File,
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'logo_uploads' },
        (error, result) => {
          if (error) return reject(new Error(error.message));
          if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          }
        },
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async updateLogoPath(userId: number, file: Express.Multer.File) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      //Upload on cloud
      const { url } = await this.uploadLogoImage(file);
      //Upload path in database
      await queryRunner.manager.update(
        Logo,
        { isActive: LogoStatus.ACTIVE },
        { isActive: LogoStatus.INACTIVE },
      );
      const new_logo = await queryRunner.manager.save(Logo, {
        uploadedBy: userId,
        logoUrl: url,
      });
      //Audit log
      const auditLog = queryRunner.manager.create(AuditLog, {
        action: AuditLogActionEnum.UPDATE_COMPANY_LOGO,
        entityName: this.dataSource.getMetadata(Logo).tableName,
        recordId: new_logo.id,
        newValue: new_logo,
        description: `Logo company has been changed`,
        user: { id: userId },
        createdAt: new Date(),
      });
      await queryRunner.manager.save(AuditLog, auditLog);
      await queryRunner.commitTransaction();
      return {
        message: 'Update new logo successful',
        logoUrl: url,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.log(error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteImage(publicId: string) {
    await cloudinary.uploader.destroy(publicId);
  }

  async getLogoActive() {
    try {
      const logo = await this.dataSource.manager.findOne(Logo, {
        where: {
          isActive: LogoStatus.ACTIVE,
        },
      });
      if (!logo) {
        throw new NotFoundException('logo not found');
      }
      return logo.logoUrl;
    } catch (error) {
      this.logger.log(error);
      throw error;
    }
  }
}
