import faker from 'faker';

import { UserJson } from '@app/database/models/user';
import { generateAccessToken } from '@app/lib/helpers/token-helper';

export const mockUser = () => ({
  email: faker.internet.email(),
  displayName: faker.internet.userName(),
  profileImage: faker.internet.url(),
  emailVerified: true,
  isAdmin: false,
});

export const mockJWT = (user: UserJson = { _id: faker.random.uuid(), ...mockUser() }) => generateAccessToken({ user });
