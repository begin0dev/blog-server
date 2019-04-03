const express = require('express');
const request = require('supertest');

const Oauth = require('lib/oauth');
const Strategy = require('lib/oauth/strategy');

describe('Test Oauth use', () => {
  test('Success: strategy', () => {
    function MockStrategy() {
      this.name = 'test';
    }
    Oauth.use(new MockStrategy());
    expect(typeof Oauth.strategires.test).toBe('object');
  });
  test('Success: name, strategy', () => {
    function MockStrategy() {
    }
    Oauth.use('test', new MockStrategy());
    expect(typeof Oauth.strategires.test).toBe('object');
  });
});

describe('Test Oauth authenticate', () => {
  const app = express();
  Oauth.use(new Strategy({
    name: 'facebook',
    clientID: 'test-id',
    clientSecret: 'test-secret',
    callbackURL: '/test',
  }, (accessToken, profile, done) => { done(); }));

  app.get('/facebook', Oauth.authenticate('facebook', {}), (req, res) => {
    res.status(201).json({ status: 'success' });
  });
  const agent = request.agent(app);

  test('Success', async () => {
    await agent
      .get('/facebook')
      .expect(302)
      .expect(
        'Location',
        'https://www.facebook.com/dialog/oauth?client_id=test-id&redirect_uri=http://127.0.0.1/test&response_type=code',
      );
  });
});
