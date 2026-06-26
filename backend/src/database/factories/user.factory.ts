import { setSeederFactory } from 'typeorm-extension';
import { User } from 'src/domain/users/entities/user.entity';
import { faker } from '@faker-js/faker';
import { UserStatus } from 'src/common/enums/user-status.enum';
import { SexEnum } from 'src/common/enums/sex.enum';
import { hashSync } from 'bcrypt';

export default setSeederFactory(User, () => {
  const user = new User();

  user.fullName = faker.person.fullName();
  user.code = faker.string.alphanumeric(8);
  user.identityNumber = faker.string.numeric(12);
  user.address = faker.location.streetAddress();
  user.email = faker.internet.email();
  user.phone = '09' + faker.string.numeric(8);
  user.password = hashSync('password123', 10);
  user.status = faker.helpers.arrayElement([
    UserStatus.ACTIVE,
    UserStatus.INACTIVE,
  ]);
  user.bankAccount = faker.finance.accountNumber({ length: 12 });
  user.bankName = faker.finance.accountName();
  user.sex = faker.helpers.arrayElement([
    SexEnum.MALE,
    SexEnum.FEMALE,
    SexEnum.OTHER,
  ]);
  user.dateOfBirth = faker.date.birthdate();
  user.deletedAt = null;
  return user;
});
