// database/seeds/audit-log.seeder.ts
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { AuditLog } from 'src/domain/audit-logs/entities/audit-log.entity';
import { User } from 'src/domain/users/entities/user.entity';
import { faker } from '@faker-js/faker';

export default class AuditLogSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0;');
    await dataSource.query('TRUNCATE TABLE audit_logs;');
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1;');

    const users = await dataSource.getRepository(User).find();

    if (users.length === 0) {
      console.warn('⚠️ No users found for audit log seeding.');
      return;
    }

    const auditLogFactory = factoryManager.get(AuditLog);

    for (let i = 0; i < 20; i++) {
      const log = await auditLogFactory.make();
      log.user = faker.helpers.arrayElement(users);
      await dataSource.getRepository(AuditLog).save(log);
    }
  }
}
