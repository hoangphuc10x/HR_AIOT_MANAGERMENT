import { setSeederFactory } from 'typeorm-extension';
import { UserRole } from 'src/domain/users/entities/user-role.entity';
import { User } from 'src/domain/users/entities/user.entity';
import { Role } from 'src/domain/users/entities/role.entity';
import { faker } from '@faker-js/faker';

export default setSeederFactory(UserRole, () => {
  const user = new User();
  user.id = faker.number.int({ min: 1, max: 255 });

  const role = new Role();
  role.id = faker.number.int({ min: 1, max: 4 });

  const userRole = new UserRole();
  userRole.user = user;
  userRole.role = role;
  userRole.userId = user.id;
  userRole.roleId = role.id;

  return userRole;
});
