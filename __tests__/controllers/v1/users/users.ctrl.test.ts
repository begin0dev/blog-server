import { agent } from 'supertest';

import Server from '@app/server';
import MockUser from '@app/database/models/__mocks__/user';

describe('Test users controller', () => {
  test('/check', async () => {
    await agent(Server.application).get('/api/v1/users/check').expect(401);
  });

  test('/logout', async () => {
    await agent(Server.application).delete('/api/v1/users/logout').expect(401);
  });
});
