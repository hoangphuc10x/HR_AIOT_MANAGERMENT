import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { UserPermission } from 'src/domain/permissions/entities/user-permission.entity';
import { User } from 'src/domain/users/entities/user.entity';
import { Permission } from 'src/domain/permissions/entities/permission.entity';

export default class UserPermissionSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const userRepo = dataSource.getRepository(User);
    const permissionRepo = dataSource.getRepository(Permission);
    const userPermissionRepo = dataSource.getRepository(UserPermission);

    const users = await userRepo.find();
    const permissions = await permissionRepo.find();

    if (users.length === 0 || permissions.length === 0) {
      return;
    }

    const userPermissions: UserPermission[] = [];

    for (const user of users) {
      if (user.id === 1) {
        // Admin: all permissions
        for (const perm of permissions) {
          const userPermission = userPermissionRepo.create({
            userId: user.id,
            permissionId: perm.id,
          });
          userPermissions.push(userPermission);
        }
      } else {
        // any users random 1-3 permissions
        const randomCount = Math.floor(Math.random() * 4) + 1; // 1 to 4 permissions
        const shuffled = permissions.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, randomCount);

        for (const perm of selected) {
          const userPermission = userPermissionRepo.create({
            userId: user.id,
            permissionId: perm.id,
          });
          userPermissions.push(userPermission);
        }
      }
    }

    await userPermissionRepo.save(userPermissions);
  }
}
