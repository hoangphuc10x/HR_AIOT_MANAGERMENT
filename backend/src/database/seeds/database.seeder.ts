import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import RoleSeeder from './role.seeder';
import DepartmentSeeder from './department.seeder';
import UserSeeder from './user.seeder';
import UserRoleSeeder from './user-role.seeder';
import UserDepartmentSeeder from './user-department.seeder';
import AuditLogSeeder from './audit-log.seeder';
import PermissionSeeder from './permission.seeder';
import UserPermissionSeeder from './user-permission.seeder';
import DepartmentPermissionSeeder from './department-permissions.seeder';
import UserDepartmentPermissionSeeder from './user-department-permissions';
import AttendanceSeeder from './attendance.seeder';
import LeaveRequestSeeder from './leave-request.seeder';

export default class DatabaseSeeder implements Seeder {
  async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');

    for (const entity of dataSource.entityMetadatas) {
      const tableName = entity.tableName;
      await queryRunner.query(`TRUNCATE TABLE \`${tableName}\``);
    }

    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');
    await queryRunner.release();

    await new RoleSeeder().run(dataSource);
    await new UserSeeder().run(dataSource, factoryManager);
    await new UserRoleSeeder().run(dataSource);
    await new DepartmentSeeder().run(dataSource);
    await new UserDepartmentSeeder().run(dataSource);
    await new PermissionSeeder().run(dataSource);
    await new UserPermissionSeeder().run(dataSource);
    await new DepartmentPermissionSeeder().run(dataSource);
    await new UserDepartmentPermissionSeeder().run(dataSource);
    await new AuditLogSeeder().run(dataSource, factoryManager);
    await new AttendanceSeeder().run(dataSource);
    await new LeaveRequestSeeder().run(dataSource);
  }
}
