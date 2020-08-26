import express from 'express';
import request from 'supertest';

import Oauth from '@app/lib/oauth';
import Strategy from '@app/lib/oauth/strategy';
import { StrategiesNames } from '@app/lib/oauth/types';

describe('Test Oauth authenticate', () => {
  test('Success', async () => {
    const app = express();

    Oauth.use(
      new Strategy(
        {
          name: StrategiesNames.FACEBOOK,
          clientID: 'test-id',
          clientSecret: 'test-secret',
          callbackURL: '/test',
        },
        () => {},
      ),
    );
    expect(typeof Oauth.strategies[StrategiesNames.FACEBOOK]).toBe('object');

    app.get('/facebook', Oauth.authenticate(StrategiesNames.FACEBOOK, {}), (req, res) => {
      res.status(201);
    });

    const agent = request.agent(app);
    await agent
      .get('/facebook')
      .set('Host', 'test.com')
      .expect(302)
      .expect((res) => {
        expect(decodeURIComponent(res.header.location)).toEqual(
          'https://www.facebook.com/dialog/oauth?client_id=test-id&redirect_uri=http://test.com/test&response_type=code',
        );
      });
  });
});
