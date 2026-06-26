import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Permission } from 'src/domain/permissions/entities/permission.entity';
import { PermissionEnum } from 'src/common/enums/permission.enum';

export default class PermissionSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(Permission);

    const permissions: Partial<Permission>[] = [
      { id: 1, action: PermissionEnum.SET_PERMISSION },
      { id: 2, action: PermissionEnum.VIEW_ALL_EMPLOYEE },
      { id: 3, action: PermissionEnum.CREATE_EMPLOYEE },
      { id: 4, action: PermissionEnum.DELETE_EMPLOYEE },
      { id: 5, action: PermissionEnum.VIEW_ALL_DEPARTMENT },
      { id: 6, action: PermissionEnum.REMOVE_EMPLOYEE_ALL_DEPARTMENT },
      { id: 7, action: PermissionEnum.INVITE_EMPLOYEE_ALL_DEPARTMENT },
      { id: 8, action: PermissionEnum.CREATE_DEPARTMENT },
      { id: 9, action: PermissionEnum.UPDATE_DEPARTMENT_ALL_DEPARTMENT },
      { id: 10, action: PermissionEnum.DELETE_DEPARTMENT_ALL_DEPARTMENT },
      { id: 11, action: PermissionEnum.VIEW_ATTENDANCE_ALL_DEPARTMENT },
      { id: 12, action: PermissionEnum.VIEW_LEAVE_REQUEST_ALL_DEPARTMENT },
      { id: 13, action: PermissionEnum.APPROVE_LEAVE_REQUEST_ALL_DEPARTMENT },
      { id: 14, action: PermissionEnum.REJECT_LEAVE_REQUEST_ALL_DEPARTMENT },
    ];

    await repo.insert(permissions);
  }
}
