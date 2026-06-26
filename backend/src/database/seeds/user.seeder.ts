import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { User } from 'src/domain/users/entities/user.entity';

export default class UserSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0;');
    await dataSource.query('TRUNCATE TABLE users;');
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1;');
    const userFactory = factoryManager.get(User);

    await userFactory.saveMany(50);
  }
}
