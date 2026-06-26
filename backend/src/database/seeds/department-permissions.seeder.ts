import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { DepartmentPermission } from 'src/domain/permissions/entities/department-permission.entity';
import { DepartmentPermissionEnum } from '@/common/enums/department-permission.enum';

export default class DepartmentPermissionSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(DepartmentPermission);

    const departmentPermissions: Partial<DepartmentPermission>[] = [
      { id: 1, action: DepartmentPermissionEnum.VIEW_ONLY },
      {
        id: 2,
        action: DepartmentPermissionEnum.UPDATE_PERMISSION_IN_DEPARTMENT,
      },
      {
        id: 3,
        action:
          DepartmentPermissionEnum.VIEW_ALL_EMPLOYEE_IN_SPECIFIC_DEPARTMENT,
      },
      {
        id: 4,
        action: DepartmentPermissionEnum.INVITE_EMPLOYEE_TO_SPECIFIC_DEPARTMENT,
      },
      {
        id: 5,
        action: DepartmentPermissionEnum.UPDATE_EMPLOYEE_IN_SPECIFIC_DEPARTMENT,
      },
      {
        id: 6,
        action: DepartmentPermissionEnum.DELETE_EMPLOYEE_IN_SPECIFIC_DEPARTMENT,
      },
      {
        id: 7,
        action: DepartmentPermissionEnum.UPDATE_DEPARTMENT,
      },
      {
        id: 8,
        action: DepartmentPermissionEnum.DELETE_DEPARTMENT,
      },
    ];

    await repo.insert(departmentPermissions);
  }
}
