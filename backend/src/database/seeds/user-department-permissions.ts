import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { UserDepartmentPermission } from 'src/domain/users/entities/user-department-permission.entity';
import { UserDepartment } from 'src/domain/departments/entities/user-department.entity';
import { DepartmentPermission } from 'src/domain/permissions/entities/department-permission.entity';

export default class UserDepartmentPermissionSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const udpRepo = dataSource.getRepository(UserDepartmentPermission);
    const userDepRepo = dataSource.getRepository(UserDepartment);
    const deptPermRepo = dataSource.getRepository(DepartmentPermission);

    const userDepartments = await userDepRepo.find();
    const deptPermissions = await deptPermRepo.find();

    if (userDepartments.length === 0 || deptPermissions.length === 0) {
      return;
    }

    const records: UserDepartmentPermission[] = [];

    for (const ud of userDepartments) {
      if (ud.userId === 1) {
        // Admin: full permissions in all departments they belong to
        for (const perm of deptPermissions) {
          records.push(
            udpRepo.create({
              userId: ud.userId,
              departmentId: ud.departmentId,
              departmentPermissionId: perm.id,
            }),
          );
        }
      } else {
        // Normal user: random 1–5 permissions in the same department they joined
        const randomCount = Math.floor(Math.random() * 5) + 1;
        const shuffled = [...deptPermissions].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, randomCount);

        for (const perm of selected) {
          records.push(
            udpRepo.create({
              userId: ud.userId,
              departmentId: ud.departmentId,
              departmentPermissionId: perm.id,
            }),
          );
        }
      }
    }

    await udpRepo.save(records);
  }
}
