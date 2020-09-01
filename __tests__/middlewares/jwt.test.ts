import jwt from 'jsonwebtoken';
import moment from 'moment';
import { createRequest, createResponse } from 'node-mocks-http';

import User, { UserSchema } from '@app/database/models/user';
import MockUser from '@app/database/models/__mocks__/user';
import { generateAccessToken, generateRefreshToken } from '@app/lib/helpers/token-helper';
import { checkAccessToken, checkRefreshToken } from '@app/middlewares/jwt';

const { JWT_SECRET } = process.env;

describe('Test checkAccessToken', () => {
  const user = {
    _id: 'id',
    displayName: 'displayName',
  };

  test('Success: user is undefined if exist authorization in the header', () => {
    const req = createRequest({ headers: {} });
    const res = createResponse();

    checkAccessToken(req, res, () => {
      expect(req.user).toBeUndefined();
    });
  });

  test('Success: user is exist if a valid token exists in the header', () => {
    const token = generateAccessToken({ user });
    const req = createRequest({
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    const res = createResponse();

    checkAccessToken(req, res, () => {
      expect(req.user).toEqual(user);
    });
  });

  test('Success: user is undefined if a invalid token exists in the header', () => {
    const token = jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) - 60,
        data: user,
      },
      JWT_SECRET as string,
      { issuer: 'beginner' },
    );
    const req = createRequest({
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    const res = createResponse();

    checkAccessToken(req, res, () => {
      expect(req.user).toBeUndefined();
    });
  });
});

describe('Test checkRefreshToken', () => {
  let refreshToken: string;
  let user: UserSchema;

  beforeEach(async () => {
    const mockUserData = MockUser();
    user = await User.create(mockUserData);
    refreshToken = await generateRefreshToken();
  });

  test('Success: user is exist if refresh token is equal and expiredAt is valid', async () => {
    await user.updateOne({
      $set: { 'oAuth.local.refreshToken': refreshToken, 'oAuth.local.expiredAt': moment().add(12, 'hour') },
    });
    const req = createRequest({
      user: null,
      cookies: { refreshToken },
    });
    const res = createResponse();

    await checkRefreshToken(req, res, () => {
      expect(req.user).toEqual(user.toJSON());
    });
  });

  test('Success: update expiredAt if refresh token is equal and expiredAt is less then 10 minutes', async () => {
    await user.updateOne({
      $set: { 'oAuth.local.refreshToken': refreshToken, 'oAuth.local.expiredAt': moment().add(3, 'minute') },
    });
    const req = createRequest({
      user: null,
      cookies: { refreshToken },
    });
    const res = createResponse();

    await checkRefreshToken(req, res, () => {
      expect(req.user).toEqual(user.toJSON());
    });
    const updateUser = await User.findByRefreshToken(refreshToken);
    expect(moment(updateUser?.oAuth?.local?.expiredAt).diff(moment(), 'minute') > 5).toBeTruthy();
  });

  test('Success: user is null if expiredAt is expired', async () => {
    await user.updateOne({
      $set: { 'oAuth.local.refreshToken': refreshToken, 'oAuth.local.expiredAt': moment().subtract(10, 'minute') },
    });
    const req = createRequest({
      user: null,
      cookies: { refreshToken },
    });
    const res = createResponse();

    await checkRefreshToken(req, res, () => {
      expect(req.user).toBeNull();
    });
    const updateUser = await User.findById(user._id);
    expect(updateUser?.oAuth?.local?.refreshToken).toBeUndefined();
    expect(updateUser?.oAuth?.local?.expiredAt).toBeUndefined();
  });
});
