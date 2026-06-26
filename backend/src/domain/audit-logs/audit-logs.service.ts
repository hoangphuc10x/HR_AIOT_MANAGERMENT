import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { DeepPartial, In, QueryRunner, Repository } from 'typeorm';
import { AuditLogDto } from './dto/audit-logs.dto';
import { User } from '../users/entities/user.entity';
import { AuditLogActionEnum } from '@/common/enums/audit-log-action.enum';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async logAction(auditLogDto: AuditLogDto, queryRunner?: QueryRunner) {
    const { userId, ...rest } = auditLogDto;

    const log = queryRunner
      ? queryRunner.manager.create(AuditLog, {
          ...rest,
          user: { id: userId } as User,
        })
      : this.auditLogRepository.create({
          ...rest,
          user: { id: userId } as User,
        });

    const result = queryRunner
      ? await queryRunner.manager.save(AuditLog, log)
      : await this.auditLogRepository.save(log);

    return result;
  }

  findAll() {
    return this.auditLogRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserIds(userIds: string[]): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: {
        user: { id: In(userIds) },
      },
      relations: ['user'],
    });
  }

  async createLog(params: {
    userId?: number | null;
    action: AuditLogActionEnum;
    description?: string;
    entityName?: string;
    entityId?: string;
    previousValue?: Record<string, any> | null;
    newValue?: Record<string, any> | null;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuditLog> {
    const log = this.auditLogRepository.create({
      user: params.userId ? ({ id: params.userId } as DeepPartial<User>) : null,
      action: params.action,
      description: params.description ?? null,
      entityName: params.entityName ?? null,
      entityId: params.entityId ?? null,
      previousValue: params.previousValue ?? null,
      newValue: params.newValue ?? null,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
    } as DeepPartial<AuditLog>);

    return await this.auditLogRepository.save(log);
  }
}
