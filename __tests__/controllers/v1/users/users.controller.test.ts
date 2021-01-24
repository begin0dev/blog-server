import { agent } from 'supertest';

import Server from '@app/server';
import { mockUser, mockJWT } from '@app/database/models/__mocks__/user';
import User, { UserJson } from '@app/database/models/user';

describe('Test users controller', () => {
  test('/check when login', () => {
    const authorization = `Bearer ${mockJWT()}`;

    agent(Server.application).get('/api/v1/users/check').set('Authorization', authorization).expect(200);
  });

  test('/check when not login', () => {
    agent(Server.application).get('/api/v1/users/check').expect(401);
  });

  test('/logout when login', async () => {
    const user = await User.create(mockUser());
    const authorization = `Bearer ${mockJWT(user.toJSON() as UserJson)}`;

    agent(Server.application).delete('/api/v1/users/logout').set('Authorization', authorization).expect(204);
  });

  test('/logout when not login', () => {
    agent(Server.application).delete('/api/v1/users/logout').expect(401);
  });
});
