import { AuditLogActionEnum } from '@/common/enums/audit-log-action.enum';
import { ApiProperty } from '@nestjs/swagger';

export class AuditLogDto {
  @ApiProperty({ example: 'uuid-v4' })
  userId: number;

  @ApiProperty({ example: 'CHECK_IN' })
  action: AuditLogActionEnum;

  @ApiProperty({ example: 'User checked in at the front desk' })
  description: string;

  @ApiProperty({ example: '2025-07-23T10:12:34.000Z' })
  createdAt: Date;

  entityName?: string;
  recordId?: number;
  previousValue?: Record<string, any> | null;
  newValue?: Record<string, any> | null;
}
