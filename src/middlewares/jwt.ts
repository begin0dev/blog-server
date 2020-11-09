import dayjs from 'dayjs';
import { Request, Response, NextFunction } from 'express';

import User from '@app/database/models/user';
import { decodeAccessToken, generateAccessToken } from '@app/lib/helpers/token-helper';

export const checkAccessToken = (req: Request, res: Response, next: NextFunction) => {
  let accessToken = req.get('authorization') || req.cookies.accessToken;
  if (!accessToken) return next();
  if (accessToken.startsWith('Bearer ')) accessToken = accessToken.slice(7, accessToken.length);

  try {
    const decoded = decodeAccessToken(accessToken);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.deleteCookie('accessToken');
    next();
  }
};

export const checkRefreshToken = async (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.cookies;
  if (req.user || !refreshToken) return next();

  try {
    const user = await User.findByRefreshToken(refreshToken);
    if (!user) {
      res.deleteCookie('refreshToken');
      return next();
    }

    const { expiredAt } = user?.oAuth?.local || {};
    if (dayjs() > dayjs(expiredAt)) {
      await user.updateOne({ $unset: { 'oAuth.local': 1 } });
      res.deleteCookie('refreshToken');
      return next();
    }

    req.user = user.toJSON();
    const accessToken = generateAccessToken({ user: req.user });
    res.setCookie('accessToken', accessToken);

    // extended your refresh token so they do not expire while using your site
    if (dayjs(expiredAt).diff(dayjs(), 'minute') <= 5) {
      await user.updateOne({ $set: { 'oAuth.local.expiredAt': dayjs().add(1, 'hour') } });
    }
    next();
  } catch (err) {
    res.deleteCookie('refreshToken');
    next(err);
  }
};
