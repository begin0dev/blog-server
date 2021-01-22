import qs from 'qs';
import url from 'url';
import dayjs from 'dayjs';
import express, { Request, Response } from 'express';

import oAuth from '@app/lib/oauth';
import User, { UserJson } from '@app/database/models/user';
import { StrategiesNames } from '@app/lib/oauth/types';
import { generateAccessToken, generateRefreshToken } from '@app/lib/helpers/token-helper';
import apiHelper from '@app/lib/helpers/apiHelper';

const { CLIENT_URI: redirectUrl } = process.env;

const router = express.Router();

const socialCallback = async (req: Request, res: Response) => {
  const failureRedirect = (message: string) => {
    const { query } = url.parse(redirectUrl);
    const queryString = qs.stringify({ message });
    return res.redirect(`${redirectUrl}${query ? '&' : '?'}${queryString}`);
  };

  if (res.locals.message) return failureRedirect(res.locals.message);

  try {
    const { provider, id } = res.locals.profile;

    let user = await User.findBySocialId(provider, id);
    if (!user) user = await User.socialRegister(res.locals.profile);

    const userJson = user.toJSON() as UserJson;
    // access token and refresh token set cookie
    const accessToken = generateAccessToken({ user: userJson });
    const refreshToken = await generateRefreshToken();
    await User.findByIdAndUpdate(userJson._id, {
      $set: { 'oAuth.local.refreshToken': refreshToken, 'oAuth.local.expiredAt': dayjs().add(12, 'hour') },
    });
    res.setCookie('accessToken', accessToken);
    res.setCookie('refreshToken', refreshToken);
    res.redirect(redirectUrl);
  } catch (err) {
    console.error(err);
    failureRedirect(err.message);
  }
};

router.get(
  '/facebook',
  apiHelper.apiDoc({ summary: 'facebook social login api' }),
  oAuth.authenticate(StrategiesNames.FACEBOOK, { auth_type: 'rerequest' }),
);
router.get('/facebook/callback', oAuth.authenticate(StrategiesNames.FACEBOOK), socialCallback);

router.get(
  '/kakao',
  apiHelper.apiDoc({ summary: 'kakao social login api' }),
  oAuth.authenticate(StrategiesNames.KAKAO, { auth_type: 'reauthenticate' }),
);
router.get('/kakao/callback', oAuth.authenticate(StrategiesNames.KAKAO), socialCallback);

export default router;
