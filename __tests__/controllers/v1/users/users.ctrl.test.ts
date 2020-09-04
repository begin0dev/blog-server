import { agent } from 'supertest';

import Server from '@app/server';
import { mockJWT } from '@app/database/models/__mocks__/user';

describe('Test users controller', () => {
  test('/check when login', async () => {
    await agent(Server.application)
      .get('/api/v1/users/check')
      .set('Authorization', `Bearer ${mockJWT()}`)
      .expect(200);
  });

  test('/check when not login', async () => {
    await agent(Server.application).get('/api/v1/users/check').expect(401);
  });

  test('/logout', async () => {
    await agent(Server.application).delete('/api/v1/users/logout').expect(401);
  });
});
