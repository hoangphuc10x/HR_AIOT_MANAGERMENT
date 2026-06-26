import { setSeederFactory } from 'typeorm-extension';
import { Role } from 'src/domain/users/entities/role.entity';
import { faker } from '@faker-js/faker';
import { RoleEnum } from 'src/common/enums/role.enum';

export default setSeederFactory(Role, () => {
  const role = new Role();
  const roleName = faker.helpers.arrayElement([RoleEnum.ADMIN, RoleEnum.STAFF]);

  role.name = roleName;
  role.description = {
    [RoleEnum.ADMIN]: 'ADMIN',
    [RoleEnum.STAFF]: 'STAFF',
  }[roleName];
  return role;
});
