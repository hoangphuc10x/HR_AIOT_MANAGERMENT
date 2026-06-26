import { setSeederFactory } from 'typeorm-extension';
import { Department } from 'src/domain/departments/entities/department.entity';
import { faker } from '@faker-js/faker';
import { DepartmentStatus } from '@/common/enums/department-status.enum';

export default setSeederFactory(Department, () => {
  const department = new Department();
  department.departmentName = faker.company.name();
  department.level = faker.number.int({ min: 1, max: 3 });
  department.status = faker.helpers.arrayElement([
    DepartmentStatus.ACTIVE,
    DepartmentStatus.INACTIVE,
  ]);
  department.createdAt = new Date();
  department.updatedAt = new Date();
  department.deletedAt = null;

  return department;
});
