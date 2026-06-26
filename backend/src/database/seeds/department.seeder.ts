import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Department } from 'src/domain/departments/entities/department.entity';
import { User } from 'src/domain/users/entities/user.entity';

export default class DepartmentSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0;');
    await dataSource.query('TRUNCATE TABLE departments;');
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1;');

    const departmentRepository = dataSource.getRepository(Department);
    const users = await dataSource.getRepository(User).find();

    const departmentNames = [
      'Human Resources',
      'Finance',
      'Marketing',
      'Sales',
      'Engineering',
      'IT Support',
      'Customer Service',
      'Logistics',
      'Legal',
      'Product Development',
    ];

    const departments: Partial<Department>[] = departmentNames.map(
      (name, idx) => ({
        departmentName: name,
        user: users[idx + 2] || null,
      }),
    );

    await departmentRepository.save(departments);
  }
}
