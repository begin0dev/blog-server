import axios from 'axios';
import * as faker from 'faker';

const Strategy = require('@app/lib/oauth/strategy');

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Test Strategy constructor', () => {
  test('Success', () => {
    const strategy = new Strategy(
      {
        name: 'facebook',
        clientID: 'test-id',
        clientSecret: 'test-secret',
        callbackURL: '/test',
      },
      ['test_scope'],
      () => {},
    );
    expect(strategy.name).toBe('facebook');
    expect(strategy.authorizationURL).toBe('https://www.facebook.com/dialog/oauth');
    expect(typeof strategy.scope).toBe('string');
    expect(strategy.scope).toBe('name,email,test_scope');
    expect(typeof strategy.verify).toBe('function');
  });

  test('Failed', () => {
    expect(
      () =>
        new Strategy(
          {
            name: 'facebook',
            clientSecret: 'test-secret',
            callbackURL: '/test',
          },
          () => {},
        ),
    ).toThrowError('You must provide options the clientID configuration value');
  });
});

describe('Test Strategy authorizeEndPoint', () => {
  test('Success', () => {
    const redirectURI = faker.internet.url();
    const strategy = new Strategy(
      {
        name: 'facebook',
        clientID: 'test-id',
        clientSecret: 'test-secret',
        callbackURL: '/test',
      },
      ['test_scope'],
      () => {},
    );
    expect(decodeURIComponent(strategy.authorizeEndPoint(redirectURI))).toBe(
      `https://www.facebook.com/dialog/oauth?client_id=test-id&redirect_uri=${redirectURI}&response_type=code`,
    );
  });
});

describe('Test Strategy getOauthAccessToken', () => {
  test('Success', async () => {
    mockedAxios.post.mockResolvedValue({ data: { access_token: 'test-access-token' } });
    const strategy = new Strategy(
      {
        name: 'facebook',
        clientID: 'test-id',
        clientSecret: 'test-secret',
        callbackURL: '/test',
      },
      ['test_scope'],
      () => {},
    );

    const accessToken = await strategy.getOauthAccessToken('test-code', faker.internet.url());
    expect(accessToken).toBe('test-access-token');
  });
});

describe('Test Strategy getUserProfile', () => {
  test('Success', async () => {
    const expectProfile = { id: 1, name: 'test', email: faker.internet.email() };
    mockedAxios.get.mockResolvedValue({ data: expectProfile });
    const strategy = new Strategy(
      {
        name: 'facebook',
        clientID: 'test-id',
        clientSecret: 'test-secret',
        callbackURL: '/test',
      },
      ['test_scope'],
      () => {},
    );

    const profile = await strategy.getUserProfile('test-access-token');
    expect(profile.data).toBe(expectProfile);
  });
});
