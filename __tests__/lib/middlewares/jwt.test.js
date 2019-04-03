require('../../testHelper');

const jwt = require('jsonwebtoken');
const moment = require('moment');
const httpMocks = require('node-mocks-http');

const User = require('datebase/models/user');
const MockUserData = require('datebase/models/__mocks__/user');
const { generateAccessToken, generateRefreshToken } = require('lib/token');
const { checkedAccessToken, checkedRefreshToken } = require('lib/middlewares/jwt');

const { JWT_SECRET } = process.env;

describe('Test checkedAccessToken', () => {
  const user = {
    _id: 'id',
    displayName: 'displayName',
  };

  test('Success-1', async () => {
    const req = httpMocks.createRequest({
      headers: {
        'x-access-token': null,
      },
    });
    const res = httpMocks.createResponse();

    await checkedAccessToken(req, res, (err) => {
      if (err) console.error(err);
      expect(req.user).toBeNull();
    });
  });
  test('Success-2', async () => {
    const token = await generateAccessToken({ user });
    const req = httpMocks.createRequest({
      headers: {
        'x-access-token': token,
      },
    });
    const res = httpMocks.createResponse();

    await checkedAccessToken(req, res, (err) => {
      if (err) console.error(err);
      expect(req.user).toEqual(user);
    });
  });
  test('Success-3', async () => {
    const token = await jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) - 60,
        data: user,
      },
      JWT_SECRET,
      { issuer: 'beginner' },
    );
    const req = httpMocks.createRequest({
      headers: {
        'x-access-token': token,
      },
    });
    const res = httpMocks.createResponse();

    await checkedAccessToken(req, res, (err) => {
      if (err) console.error(err);
      expect(req.user).toBeNull();
    });
  });
});


describe('Test checkedRefreshToken', () => {
  let refreshToken;
  let user;

  beforeEach(async () => {
    const mockUserData = MockUserData();
    refreshToken = await generateRefreshToken();
    user = await User.localRegister({
      ...mockUserData,
    });
  });
  test('Success-1', async () => {
    await user.updateOne({ $set: { oAuth: { local: { refreshToken, expiredAt: moment().add(12, 'hour') } } } });
    const req = httpMocks.createRequest({
      user: null,
      cookies: {
        refreshToken,
      },
    });
    const res = httpMocks.createResponse();

    await checkedRefreshToken(req, res, (err) => {
      if (err) console.error(err);
      expect(req.user).toEqual(user.toJSON());
    });
  });

  test('Success-2', async () => {
    await user.updateOne({ $set: { oAuth: { local: { refreshToken, expiredAt: moment().add(3, 'minute') } } } });
    const req = httpMocks.createRequest({
      user: null,
      cookies: {
        refreshToken,
      },
    });
    const res = httpMocks.createResponse();

    await checkedRefreshToken(req, res, (err) => {
      if (err) console.error(err);
      expect(req.user).toEqual(user.toJSON());
    });
    const updateUser = await User.findByLocalRefreshToken(refreshToken);
    expect(moment(updateUser.oAuth.local.expiredAt).diff(moment(), 'minute') > 5).toBeTruthy();
  });

  test('Success-3', async () => {
    await user.updateOne({ $set: { oAuth: { local: { refreshToken, expiredAt: moment().subtract(10, 'minute') } } } });
    const req = httpMocks.createRequest({
      user: null,
      cookies: {
        refreshToken,
      },
    });
    const res = httpMocks.createResponse();

    await checkedRefreshToken(req, res, (err) => {
      if (err) console.error(err);
      expect(req.user).toBeNull();
    });
    const updateUser = await User.findById(user._id);
    expect(updateUser.oAuth.local.refreshToken).toBeNull();
    expect(updateUser.oAuth.local.expiredAt).toBeNull();
  });
});
