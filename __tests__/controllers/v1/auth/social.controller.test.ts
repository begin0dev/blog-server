import { agent } from 'supertest';

import Server from '@app/server';

describe('Test auth social controller', () => {
  test('/facebook', () => {
    agent(Server.application).get('/api/v1/auth/social/facebook').expect(302);
  });

  test('/kakao', () => {
    agent(Server.application).get('/api/v1/auth/social/kakao').expect(302);
  });
});
