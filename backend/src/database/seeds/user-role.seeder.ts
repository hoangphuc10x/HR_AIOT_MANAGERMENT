import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { UserRole } from 'src/domain/users/entities/user-role.entity';
import { User } from 'src/domain/users/entities/user.entity';
import { Role } from 'src/domain/users/entities/role.entity';
import { RoleEnum } from 'src/common/enums/role.enum';

export default class UserRoleSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0;');
    await dataSource.query('TRUNCATE TABLE user_roles;');
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1;');

    const userRepository = dataSource.getRepository(User);
    const roleRepository = dataSource.getRepository(Role);
    const userRoleRepository = dataSource.getRepository(UserRole);

    const users = await userRepository.find();
    const roles = await roleRepository.find();

    const roleMap = Object.values(RoleEnum).reduce(
      (acc, roleName) => {
        const roleEntity = roles.find((r) => r.name === roleName);
        if (roleEntity) acc[roleName] = roleEntity;
        return acc;
      },
      {} as Record<RoleEnum, Role>,
    );

    for (let i = 0; i < users.length; i++) {
      const rolesToAssign: Role[] = [];

      if (i < 2) {
        rolesToAssign.push(roleMap[RoleEnum.ADMIN]);
      } else {
        rolesToAssign.push(roleMap[RoleEnum.STAFF]);
      }

      for (const role of rolesToAssign) {
        const userRole = new UserRole();
        userRole.user = users[i];
        userRole.role = role;
        userRole.userId = users[i].id;
        userRole.roleId = role.id;
        await userRoleRepository.save(userRole);
      }
    }
  }
}
