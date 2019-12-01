require('../../testHelper');

const jwt = require('jsonwebtoken');
const moment = require('moment');
const httpMocks = require('node-mocks-http');

const User = require('database/models/user');
const MockUserData = require('database/models/__mocks__/user');
const { generateAccessToken, generateRefreshToken } = require('lib/token');
const { checkAccessToken, checkRefreshToken } = require('lib/middlewares/jwt');

const { JWT_SECRET } = process.env;

describe('Test checkAccessToken', () => {
  const user = {
    _id: 'id',
    displayName: 'displayName',
  };

  test('Success: user is null if exist authorization in the header', () => {
    const req = httpMocks.createRequest({ headers: {} });
    const res = httpMocks.createResponse();

    checkAccessToken(req, res, () => {
      expect(req.user).toBeNull();
    });
  });
  test('Success: user is exist if a valid token exists in the header', () => {
    const token = generateAccessToken({ user });
    const req = httpMocks.createRequest({
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    const res = httpMocks.createResponse();

    checkAccessToken(req, res, () => {
      expect(req.user).toEqual(user);
    });
  });
  test('Success: user is null if a invalid token exists in the header', () => {
    const token = jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) - 60,
        data: user,
      },
      JWT_SECRET,
      { issuer: 'beginner' },
    );
    const req = httpMocks.createRequest({
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    const res = httpMocks.createResponse();

    checkAccessToken(req, res, () => {
      expect(req.user).toBeNull();
    });
  });
});

describe('Test checkRefreshToken', () => {
  let refreshToken;
  let user;

  beforeEach(async () => {
    const mockUserData = MockUserData();
    user = await User.create(mockUserData);
    refreshToken = await generateRefreshToken();
  });
  test('Success: user is exist if refresh token is equal and expiredAt is valid', async () => {
    await user.updateOne({
      $set: { 'oAuth.local.refreshToken': refreshToken, 'oAuth.local.expiredAt': moment().add(12, 'hour') },
    });
    const req = httpMocks.createRequest({
      user: null,
      cookies: {
        refreshToken,
      },
    });
    const res = httpMocks.createResponse();

    await checkRefreshToken(req, res, () => {
      expect(req.user).toEqual(user.toJSON());
    });
  });

  test('Success: update expiredAt if refresh token is equal and expiredAt is less then 10 minutes', async () => {
    await user.updateOne({
      $set: { 'oAuth.local.refreshToken': refreshToken, 'oAuth.local.expiredAt': moment().add(3, 'minute') },
    });
    const req = httpMocks.createRequest({
      user: null,
      cookies: {
        refreshToken,
      },
    });
    const res = httpMocks.createResponse();

    await checkRefreshToken(req, res, () => {
      expect(req.user).toEqual(user.toJSON());
    });
    const updateUser = await User.findByLocalRefreshToken(refreshToken);
    expect(moment(updateUser.oAuth.local.expiredAt).diff(moment(), 'minute') > 5).toBeTruthy();
  });

  test('Success: user is null if expiredAt is expired', async () => {
    await user.updateOne({
      $set: { 'oAuth.local.refreshToken': refreshToken, 'oAuth.local.expiredAt': moment().subtract(10, 'minute') },
    });
    const req = httpMocks.createRequest({
      user: null,
      cookies: {
        refreshToken,
      },
    });
    const res = httpMocks.createResponse();

    await checkRefreshToken(req, res, () => {
      expect(req.user).toBeNull();
    });
    const updateUser = await User.findById(user._id);
    expect(updateUser.oAuth.local.refreshToken).toBeUndefined();
    expect(updateUser.oAuth.local.expiredAt).toBeUndefined();
  });
});
