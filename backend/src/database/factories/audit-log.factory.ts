// database/factories/audit-log.factory.ts
import { setSeederFactory } from 'typeorm-extension';
import { AuditLog } from 'src/domain/audit-logs/entities/audit-log.entity';
import { faker } from '@faker-js/faker';
import { AuditLogActionEnum } from '@/common/enums/audit-log-action.enum';

export default setSeederFactory(AuditLog, () => {
  const auditLog = new AuditLog();
  auditLog.action = faker.helpers.arrayElement(
    Object.values(AuditLogActionEnum).filter(
      (v) => typeof v === 'number',
    ) as AuditLogActionEnum[],
  );
  auditLog.description = faker.lorem.sentence(10);
  auditLog.entityName = faker.helpers.arrayElement([
    'users',
    'departments',
    'user_permissions',
    'attendances',
    'leave_requests',
  ]);
  auditLog.recordId = faker.number.int({ min: 1, max: 20 });
  auditLog.previousValue = randomRecord(faker.number.int({ min: 5, max: 8 }));
  auditLog.newValue = randomRecord(faker.number.int({ min: 5, max: 8 }));
  return auditLog;
});
function randomRecord(n: number): Record<string, string> {
  const obj: Record<string, string> = {};
  for (let i = 0; i < n; i++) {
    const key = faker.string.alphanumeric(5); // random key dài 5 ký tự
    const value = faker.string.alphanumeric(5); // random value dài 5 ký tự
    obj[key] = value;
  }
  return obj;
}
