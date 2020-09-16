import moment from 'moment';
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
    res.clearCookie('accessToken');
    next();
  }
};

export const checkRefreshToken = async (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.cookies;
  if (req.user || !refreshToken) return next();

  try {
    const user = await User.findByRefreshToken(refreshToken);
    if (!user) {
      res.clearCookie('refreshToken');
      return next();
    }

    const { expiredAt } = user?.oAuth?.local || {};
    if (moment() > moment(expiredAt)) {
      await user.updateOne({ $unset: { 'oAuth.local': 1 } });
      res.clearCookie('refreshToken');
      return next();
    }

    req.user = user.toJSON();
    const accessToken = generateAccessToken({ user: req.user });
    res.cookie('accessToken', accessToken, { httpOnly: true });

    // extended your refresh token so they do not expire while using your site
    if (moment(expiredAt).diff(moment(), 'minute') <= 5) {
      await user.updateOne({ $set: { 'oAuth.local.expiredAt': moment().add(1, 'hour') } });
    }
    next();
  } catch (err) {
    res.clearCookie('refreshToken');
    next(err);
  }
};
