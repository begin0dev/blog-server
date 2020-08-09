require('../../test-helper');

const jwt = require('jsonwebtoken');

const { generateAccessToken, decodeAccessToken } = require('lib/helpers/token-helper');

const { JWT_SECRET } = process.env;
const user = {
  _id: 'id',
  displayName: 'displayName',
};
const expiresIn = '1h';

describe('Test decodeToken', () => {
  test('Success', () => {
    const token = generateAccessToken({ user }, expiresIn);

    const decode = decodeAccessToken(token);
    ['user', 'iat', 'exp', 'iss'].forEach(key => {
      expect(decode).toHaveProperty(key);
    });
  });

  test('Failed', () => {
    const expiredToken = jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) - 60,
        data: user,
      },
      JWT_SECRET,
      { issuer: 'beginner' },
    );

    expect(() => decodeAccessToken(expiredToken)).toThrowError('jwt expired');

    const invalidToken = jwt.sign({ user }, `wrong${JWT_SECRET}`, { issuer: 'beginner', expiresIn: '1d' });
    expect(() => decodeAccessToken(invalidToken)).toThrowError('invalid signature');
  });
});
