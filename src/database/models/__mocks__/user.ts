import faker from 'faker';

import { generateAccessToken } from '@app/lib/helpers/token-helper';

export const mockUser = () => ({
  email: faker.internet.email(),
  displayName: faker.internet.userName(),
  profileImageUrl: faker.internet.url(),
});

export const mockJWT = () => generateAccessToken({ user: { _id: faker.random.uuid(), ...mockUser() } });
