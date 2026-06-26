import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { UserDepartment } from 'src/domain/departments/entities/user-department.entity';
import { UserDepartmentPositionEnum } from 'src/common/enums/user-department-position.enum';

export default class UserDepartmentSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0;');
    await dataSource.query('TRUNCATE TABLE user_departments;');
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1;');

    const userDepartmentRepo = dataSource.getRepository(UserDepartment);

    const departments = Array.from({ length: 10 }, (_, i) => i + 1);
    const users = Array.from({ length: 50 }, (_, i) => i + 1);

    let userIndex = 0;

    for (const departmentId of departments) {
      // 1 Head
      const head = new UserDepartment();
      head.userId = users[userIndex++];
      head.departmentId = departmentId;
      head.position = UserDepartmentPositionEnum.HEAD;
      head.assignedAt = new Date();

      // 1 Deputy
      const deputy = new UserDepartment();
      deputy.userId = users[userIndex++];
      deputy.departmentId = departmentId;
      deputy.position = UserDepartmentPositionEnum.DEPUTY;
      deputy.assignedAt = new Date();

      // Staff
      const employees: UserDepartment[] = [];
      for (let i = 0; i < 3; i++) {
        const emp = new UserDepartment();
        emp.userId = users[userIndex++];
        emp.departmentId = departmentId;
        emp.position = UserDepartmentPositionEnum.EMPLOYEE;
        emp.assignedAt = new Date();
        employees.push(emp);
      }

      await userDepartmentRepo.save([head, deputy, ...employees]);
    }
  }
}
