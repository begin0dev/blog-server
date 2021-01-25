import { agent } from 'supertest';

import Server from '@app/server';

describe('Test auth social controller', () => {
  test('/facebook', async () => {
    await agent(Server.application).get('/api/v1/auth/social/facebook').expect(302);
  });

  test('/kakao', async () => {
    await agent(Server.application).get('/api/v1/auth/social/kakao').expect(302);
  });
});
