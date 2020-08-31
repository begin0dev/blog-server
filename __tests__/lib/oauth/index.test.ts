import express from 'express';
import { agent } from 'supertest';

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
          callbackURL: '/test_callback',
        },
        () => {},
      ),
    );
    expect(typeof Oauth.strategies[StrategiesNames.FACEBOOK]).toBe('object');

    app.get('/facebook', Oauth.authenticate(StrategiesNames.FACEBOOK, {}), (req, res) => {
      res.status(201);
    });

    await agent(app)
      .get('/facebook')
      .set('Host', 'api.test.com')
      .set('Referer', 'test.com')
      .expect(302)
      .expect((res) => {
        expect(decodeURIComponent(res.header.location)).toEqual(
          'https://www.facebook.com/v8.0/dialog/oauth?response_type=code&client_id=test-id&redirect_uri=http://api.test.com/test_callback',
        );
      });
  });
});
