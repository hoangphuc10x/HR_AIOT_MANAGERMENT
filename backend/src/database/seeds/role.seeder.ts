import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Role } from 'src/domain/users/entities/role.entity';
import { RoleEnum } from 'src/common/enums/role.enum';

export default class RoleSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const roleRepository = dataSource.getRepository(Role);
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0;');
    await dataSource.query('TRUNCATE TABLE roles;');
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1;');

    const roles = [
      { id: 1, name: RoleEnum.ADMIN, description: 'ADMIN' },
      { id: 2, name: RoleEnum.STAFF, description: 'STAFF' },
    ];

    await roleRepository.save(roles);
  }
}
