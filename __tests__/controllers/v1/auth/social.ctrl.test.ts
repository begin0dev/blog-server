import express from 'express';
import { agent } from 'supertest';

import oAuthStrategies from '@app/middlewares/strategies';
import socialCtrl from '@app/controllers/v1/auth/social.ctrl';

describe('Test auth social controller', () => {
  const app = express();
  oAuthStrategies();
  app.use('/api/v1/auth', socialCtrl);

  test('/facebook', async () => {
    await agent(app).get('/api/v1/auth/facebook').expect(302);
  });

  test('/kakao', async () => {
    await agent(app).get('/api/v1/auth/kakao').expect(302);
  });
});
