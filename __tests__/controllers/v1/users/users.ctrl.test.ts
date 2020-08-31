import express from 'express';
import { agent } from 'supertest';

import usersCtrl from '@app/controllers/v1/users/users.ctrl';
import MockUser from '@app/database/models/__mocks__/user';


describe('Test users controller', () => {
  const app = express();

  app.use('/api/v1/users', usersCtrl);

  test('/check', async () => {
    await agent(app).get('/api/v1/users/check').expect(401);
  });

  test('/logout', async () => {
    await agent(app).delete('/api/v1/users/logout').expect(200);
  });
});
