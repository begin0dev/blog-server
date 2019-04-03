require('../testHelper');

const jwt = require('jsonwebtoken');
const { generateAccessToken, decodeAccessToken } = require('lib/token');

const { JWT_SECRET } = process.env;
const user = {
  _id: 'id',
  displayName: 'displayName',
};
const expiresIn = '1h';

describe('Test generateToken', () => {
  test('Success', async () => {
    await expect(generateAccessToken({ user }, expiresIn)).resolves;
    await expect(generateAccessToken({ user })).resolves;
  });
});

describe('Test decodeToken', () => {
  test('Success', async () => {
    const token = await generateAccessToken({ user }, expiresIn);

    const decode = await decodeAccessToken(token);
    ['user', 'iat', 'exp', 'iss'].forEach((key) => {
      expect(decode).toHaveProperty(key);
    });
  });
  test('Failed', async () => {
    const expiredToken = await jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) - 60,
        data: user,
      },
      JWT_SECRET,
      { issuer: 'beginner' },
    );
    await expect(decodeAccessToken(expiredToken)).rejects.toMatch('TokenExpiredError');

    const invalidToken = await jwt.sign(
      { user },
      `wrong${JWT_SECRET}`,
      { issuer: 'beginner', expiresIn: '1d' },
    );
    await expect(decodeAccessToken(invalidToken)).rejects.toMatch('JsonWebTokenError');
  });
});
