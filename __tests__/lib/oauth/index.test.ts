import express from 'express';
import request from 'supertest';

const Oauth = require('@app/lib/oauth');
const Strategy = require('@app/lib/oauth/strategy');

describe('Test Oauth use', () => {
  test('Success: strategy', () => {
    class MockStrategy {
      name = 'test';
    }
    Oauth.use(new MockStrategy());
    expect(typeof Oauth.strategires.test).toBe('object');
  });
  test('Success: name, strategy', () => {
    class MockStrategy {}
    Oauth.use('test', new MockStrategy());
    expect(typeof Oauth.strategires.test).toBe('object');
  });
});

describe('Test Oauth authenticate', () => {
  test('Success', async () => {
    const app = express();

    Oauth.use(
      new Strategy(
        {
          name: 'facebook',
          clientID: 'test-id',
          clientSecret: 'test-secret',
          callbackURL: '/test',
        },
        () => {},
      ),
    );

    app.get('/facebook', Oauth.authenticate('facebook', {}), (req, res) => {
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
