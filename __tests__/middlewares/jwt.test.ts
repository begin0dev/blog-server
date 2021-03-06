import jwt from 'jsonwebtoken';
import dayjs from 'dayjs';
import { createRequest, createResponse } from 'node-mocks-http';
import { Response } from 'express';

import User, { UserSchema } from '@app/database/models/user';
import { mockUser } from '@app/database/models/__mocks__/user';
import { generateAccessToken, generateRefreshToken } from '@app/lib/helpers/token-helper';
import { checkAccessToken, checkRefreshToken } from '@app/middlewares/jwt';

interface AppResponse extends Response {
  setCookie: jest.Mock;
  deleteCookie: jest.Mock;
}

const { JWT_SECRET } = process.env;

describe('Test checkAccessToken', () => {
  const user = {
    _id: 'id',
    displayName: 'displayName',
  };
  const res = createResponse<AppResponse>();
  res.setCookie = jest.fn().mockReturnValue(res);
  res.deleteCookie = jest.fn().mockReturnValue(res);

  test('Success: user is undefined if exist authorization in the header', () => {
    const req = createRequest({ headers: {} });

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

    checkAccessToken(req, res, () => {
      expect(req.user).toBeUndefined();
    });
  });
});

describe('Test checkRefreshToken', () => {
  let refreshToken: string;
  let user: UserSchema;
  const res = createResponse<AppResponse>();
  res.setCookie = jest.fn().mockReturnValue(res);
  res.deleteCookie = jest.fn().mockReturnValue(res);

  beforeEach(async () => {
    const mockUserData = mockUser();
    user = await User.create(mockUserData);
    refreshToken = await generateRefreshToken();
  });

  test('Success: user is exist if refresh token is equal and expiredAt is valid', async () => {
    await user.updateOne({
      $set: { 'oAuth.local.refreshToken': refreshToken, 'oAuth.local.expiredAt': dayjs().add(12, 'hour') },
    });
    const req = createRequest({
      user: null,
      cookies: { refreshToken },
    });

    await checkRefreshToken(req, res, () => {
      expect(req.user).toEqual(user.toJSON());
    });
  });

  test('Success: update expiredAt if refresh token is equal and expiredAt is less then 10 minutes', async () => {
    await user.updateOne({
      $set: { 'oAuth.local.refreshToken': refreshToken, 'oAuth.local.expiredAt': dayjs().add(3, 'minute') },
    });
    const req = createRequest({
      user: null,
      cookies: { refreshToken },
    });

    await checkRefreshToken(req, res, () => {
      expect(req.user).toEqual(user.toJSON());
    });
    const updateUser = await User.findByRefreshToken(refreshToken);

    expect(dayjs(updateUser?.oAuth?.local?.expiredAt).diff(dayjs(), 'minute') > 5).toBeTruthy();
  });

  test('Success: user is null if expiredAt is expired', async () => {
    await user.updateOne({
      $set: { 'oAuth.local.refreshToken': refreshToken, 'oAuth.local.expiredAt': dayjs().subtract(10, 'minute') },
    });
    const req = createRequest({
      user: null,
      cookies: { refreshToken },
    });

    await checkRefreshToken(req, res, () => {
      expect(req.user).toBeNull();
    });
    const updateUser = await User.findById(user._id);
    expect(updateUser?.oAuth?.local?.refreshToken).toBeUndefined();
    expect(updateUser?.oAuth?.local?.expiredAt).toBeUndefined();
  });
});
